// backend/routes/ainotes.js
// Usage: in backend/app.js -> import aiNotesRouter from './routes/ainotes.js'; app.use('/api', aiNotesRouter);

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import AINote from '../models/AINote.js';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Google GenAI modern SDK
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TRANSCRIPTS_DIR = path.resolve(__dirname, '../transcripts');

/* ---------- CONFIG ---------- */
const API_KEY = process.env.AI_API_KEY;
const AI_MODEL_NAME = process.env.AI_MODEL || 'gemini-2.5-flash';
const MAX_CHARS_PER_CHUNK = parseInt(process.env.AI_MAX_CHARS_PER_CHUNK || '14000', 10);

if (!API_KEY) {
  console.warn('[AI NOTES] Warning: AI_API_KEY not set in env. Route will fail without it.');
}

// Initialize modern GenAI client
const aiClient = new GoogleGenAI({ apiKey: API_KEY });

/* ---------- HELPERS ---------- */
function msToTimestamp(ms) {
  const s = Math.max(0, Math.round((ms || 0) / 1000));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

async function loadTranscriptFromFile(meetingId) {
  const p = path.join(TRANSCRIPTS_DIR, `${meetingId}.json`);
  console.log(`[AI NOTES] Loading transcript from: ${p}`);
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

function chunkTranscript(lines, maxChars = MAX_CHARS_PER_CHUNK) {
  const chunks = [];
  let current = [];
  let curLen = 0;
  for (const line of lines) {
    const text = `${line.username || 'Speaker'} [${msToTimestamp(line.startMs || 0)}]: ${line.text || ''}\n`;
    if (curLen + text.length > maxChars && current.length > 0) {
      chunks.push(current);
      current = [];
      curLen = 0;
    }
    current.push({ ...line, __text: text });
    curLen += text.length;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/**
 * Robust extractor for GenAI response shapes
 */
function extractTextFromGenAIResponse(responseObj) {
  // Prefer .text
  if (!responseObj) return null;

  if (typeof responseObj.text === 'string' && responseObj.text.length > 0) {
    return responseObj.text;
  }

  // Check candidates -> content -> parts
  if (Array.isArray(responseObj.candidates) && responseObj.candidates[0]) {
    const c = responseObj.candidates[0];
    if (c.content && Array.isArray(c.content.parts) && c.content.parts[0] && typeof c.content.parts[0].text === 'string') {
      return c.content.parts[0].text;
    }
    // One more variant
    if (c.content && c.content.text) return c.content.text;
  }

  // Older nested shape
  if (responseObj.response && typeof responseObj.response.text === 'string') {
    return responseObj.response.text;
  }

  // Try to find text in nested data
  try {
    const s = JSON.stringify(responseObj);
    // naive fallback: look for a "text":"..." occurrence
    const m = s.match(/"text"\s*:\s*"([\s\S]{1,5000}?)"/);
    if (m && m[1]) return m[1];
  } catch (e) {
    // ignore
  }

  return null;
}

async function callGoogleGenerative(promptText, generationConfig = {}, meetingId, req, res) {
  try {
    // modern SDK expects a body shaped like this (model + contents)
    const requestBody = {
      model: AI_MODEL_NAME,
      contents: [
        {
          parts: [{ text: promptText }]
        }
      ],
      // pass any generationConfig fields (temperature, maxOutputTokens etc.)
      config: generationConfig
    };

    const response = await aiClient.models.generateContent(requestBody);

    // Extract textual content robustly
    let aiResponse = extractTextFromGenAIResponse(response);

    if (!aiResponse) {
      console.warn('[AI NOTES] Unexpected response shape from GenAI SDK, dumping response for debug.');
      console.warn(JSON.stringify(response).slice(0, 2000));
      throw new Error('Unexpected response shape from Google GenAI SDK');
    }

    // Save to DB
    try {
      const meetingObjId = mongoose.Types.ObjectId.isValid(meetingId)
        ? new mongoose.Types.ObjectId(meetingId)
        : meetingId;

      const aiNote = new AINote({
        meetingId: meetingObjId,
        content: aiResponse,
        prompt: promptText,
        createdBy: req.user?._id
      });

      const savedNote = await aiNote.save();
      console.log(`[AI Notes] Saved notes for meeting ${meetingId}`);

      return res.json({
        result: aiResponse,
        meetingId,
        noteId: savedNote._id
      });
    } catch (dbError) {
      console.error('Error saving AI notes to database:', dbError);
      // Still return the generated content even if saving fails
      return res.json({
        result: aiResponse,
        meetingId,
        error: 'Generated but failed to save to database'
      });
    }
  } catch (error) {
    console.error('[AI] Google AI SDK detailed error:');
    // If the SDK throws an Error with extra fields, log them
    console.error(error);
    if (error?.message) console.error('Error message:', error.message);
    if (error?.status) console.error('Status:', error.status);
    if (error?.details) console.error('Details:', error.details);

    return res.status(502).json({ error: `Failed to call Google AI API: ${error.message || String(error)}` });
  }
}

function parseJsonTolerant(text) {
  const cleanedText = text.replace(/^```json\n|```$/g, '').trim();
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    const start = cleanedText.indexOf('{');
    const end = cleanedText.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleanedText.slice(start, end + 1));
      } catch (parseError) {
        console.error('Failed to parse sliced JSON:', parseError);
        throw new Error('Failed to parse JSON from LLM response after slicing.');
      }
    }
    console.error('Failed to parse original JSON:', e);
    throw new Error('Failed to parse JSON from LLM response.');
  }
}

/* ---------- PROMPTS ---------- */

function chunkSummarizerPromptText(chunkText) {
  return `You are a concise meeting summarizer. Convert the following chronological transcript chunk into a JSON object ONLY (no commentary) with keys:\n- "chunk_summary": 1-3 short sentences\n- "notable_items": array of one-line notable things (decisions, questions, action items)\n- "timestamps": array of up to 3 objects { "ts": "MM:SS", "text": "short excerpt" }\nRules:\n- Do not invent facts. Use only provided text.\nTranscript chunk:\n${chunkText}`;
}

function synthesisPromptText(allChunkSummariesJson) {
  return `You are an assistant that synthesizes an array of chunk-level JSON objects into final meeting notes JSON.\nInput array: ${JSON.stringify(allChunkSummariesJson)}\nProduce EXACTLY one JSON object with keys:\n- title: short 3-6 word title\n- summary: 4-8 sentence meeting summary\n- decisions: array of { "decision","by","timestamp" } (use "TBD" if unknown)\n- action_items: array of { "task","owner","due","context" } (use "TBD" if unknown)\n- key_timestamps: array of { "ts","note" }\n- transcript_snippets: array of 3-5 short direct quotes (<=30 words)\n- confidence: "high"|"medium"|"low"\nRules: Only use content from inputs. Return ONLY valid JSON.`;
}

/* ---------- CHUNK PROCESSING ---------- */
async function summarizeChunk(chunkLines) {
  const chunkText = chunkLines.map(l => l.__text).join('');
  const prompt = chunkSummarizerPromptText(chunkText);
  const contentRes = await callGoogleGenerative(prompt, { temperature: 0.1 }, null, { user: {} }, { json: () => {} });
  // callGoogleGenerative returns an Express response normally; we need a version that returns string content
  // To avoid changing callGoogleGenerative signature, we'll create a specialized helper below for raw calls.
  throw new Error('summarizeChunk should use callGenRawText helper - replace this with the helper below if you intend to call from code.');
}

/* ---------- ROUTE ---------- */
// NOTE: The original code handled chunk summarization & synthesize by calling callGoogleGenerative which was tightly coupled with Express res.json responses.
// Below is a complete route implementation that performs the generation in-line using the aiClient, and keeps robust parsing and DB saving.

router.post('/meetings/:meetingId/generate-notes', async (req, res) => {
  try {
    const { meetingId } = req.params;
    if (!meetingId) return res.status(400).json({ error: 'meetingId required' });

    let transcript;
    try {
      transcript = await loadTranscriptFromFile(meetingId);
      if (!transcript || Object.keys(transcript).length === 0) {
        console.error(`[AI NOTES] Empty transcript file for meeting ${meetingId}`);
        return res.status(404).json({
          error: 'Transcript file is empty. Make sure the meeting has recorded content.'
        });
      }
    } catch (err) {
      console.error(`[AI NOTES] Error loading transcript:`, err);
      return res.status(404).json({ error: `Transcript file error: ${err.message}` });
    }

    const lines = transcript?.lines ?? transcript ?? [];
    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(404).json({ error: 'Transcript has no content lines' });
    }

    const chunks = chunkTranscript(lines);
    console.log(`[AI NOTES] meeting ${meetingId} -> ${chunks.length} chunk(s)`);

    // Helper to call GenAI and return raw string (not an express response)
    async function callGenRawText(promptText, generationConfig = {}) {
      try {
        const requestBody = {
          model: AI_MODEL_NAME,
          contents: [ { parts: [{ text: promptText }] } ],
          config: generationConfig
        };
        const response = await aiClient.models.generateContent(requestBody);
        const text = extractTextFromGenAIResponse(response);
        if (!text) {
          console.warn('[AI NOTES] Unexpected response shape when generating raw text.');
          console.warn(JSON.stringify(response).slice(0, 2000));
          throw new Error('Unexpected response shape from GenAI when generating text');
        }
        return text;
      } catch (error) {
        console.error('[AI NOTES] GenAI text generation failed:', error);
        throw new Error(`GenAI text generation failed: ${error.message || String(error)}`);
      }
    }

    const chunkSummaries = [];
    for (let i = 0; i < chunks.length; i += 1) {
      console.log(`[AI NOTES] summarizing chunk ${i+1}/${chunks.length}...`);
      const chunkText = chunks[i].map(l => l.__text).join('');
      const prompt = chunkSummarizerPromptText(chunkText);
      // request JSON-like output from the model
      const generationConfig = { temperature: 0.1 };
      const raw = await callGenRawText(prompt, generationConfig);
      const parsed = parseJsonTolerant(raw);
      chunkSummaries.push(parsed);
    }

    console.log('[AI NOTES] synthesizing final notes...');
    const synthPrompt = synthesisPromptText(chunkSummaries);
    const synthRaw = await callGenRawText(synthPrompt, { temperature: 0.1 });
    const finalNotes = parseJsonTolerant(synthRaw);

    // Save to filesystem
    await fs.mkdir(TRANSCRIPTS_DIR, { recursive: true });
    const outPath = path.join(TRANSCRIPTS_DIR, `${meetingId}.notes.json`);
    await fs.writeFile(outPath, JSON.stringify(finalNotes, null, 2), 'utf8');

    // Save structured note to MongoDB
    try {
      const meetingObjId = mongoose.Types.ObjectId.isValid(meetingId)
        ? new mongoose.Types.ObjectId(meetingId)
        : meetingId;

      const aiNote = new AINote({
        meetingId: meetingObjId,
        title: finalNotes.title || 'Meeting Notes',
        summary: finalNotes.summary || '',
        decisions: finalNotes.decisions || [],
        action_items: finalNotes.action_items || [],
        key_timestamps: finalNotes.key_timestamps || [],
        transcript_snippets: finalNotes.transcript_snippets || [],
        confidence: finalNotes.confidence || 'medium',
        createdBy: req.user?._id,
        rawContent: JSON.stringify(finalNotes)
      });

      const savedNote = await aiNote.save();
      console.log(`[AI NOTES] Saved structured notes to MongoDB, ID: ${savedNote._id}`);

      return res.json({
        success: true,
        notes: finalNotes,
        path: outPath,
        noteId: savedNote._id
      });
    } catch (dbError) {
      console.error('[AI NOTES] Error saving notes to MongoDB:', dbError);
      return res.json({
        success: true,
        notes: finalNotes,
        path: outPath,
        dbError: 'Failed to save to database'
      });
    }

  } catch (err) {
    console.error('[AI NOTES] error', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Get all AI notes for a specific meeting
router.get('/ai-notes/meeting/:meetingId', protect, async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meetingObjId = mongoose.Types.ObjectId.isValid(meetingId)
      ? new mongoose.Types.ObjectId(meetingId)
      : meetingId;

    const notes = await AINote.find({ meetingId: meetingObjId })
      .sort({ generatedAt: -1 })
      .populate('createdBy', 'name email');

    return res.json({ notes });
  } catch (error) {
    console.error('Error fetching AI notes:', error);
    return res.status(500).json({ error: 'Failed to fetch AI notes' });
  }
});

// Get a specific AI note by ID
router.get('/ai-notes/:noteId', protect, async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await AINote.findById(noteId)
      .populate('createdBy', 'name email');

    if (!note) return res.status(404).json({ error: 'AI note not found' });
    return res.json({ note });
  } catch (error) {
    console.error('Error fetching AI note:', error);
    return res.status(500).json({ error: 'Failed to fetch AI note' });
  }
});

// Delete an AI note
router.delete('/ai-notes/:noteId', protect, async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await AINote.findById(noteId);
    if (!note) return res.status(404).json({ error: 'AI note not found' });
    await AINote.findByIdAndDelete(noteId);
    return res.json({ message: 'AI note deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI note:', error);
    return res.status(500).json({ error: 'Failed to delete AI note' });
  }
});

export default router;
