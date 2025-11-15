import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import Transcript from "../models/Transcript.js";

const streams = new Map();  // meetingId -> { conn, ready }

export function ensureLiveStream(meetingId, io) {
  if (streams.has(meetingId)) return streams.get(meetingId);

  const dg = createClient(process.env.DEEPGRAM_API_KEY);

  const conn = dg.listen.live({
    model: "nova-3",
    interim_results: true,
    punctuate: true,
    smart_format: true
  });

  const handle = { conn, ready: false };
  streams.set(meetingId, handle);

  // Deepgram socket OPEN
  conn.on(LiveTranscriptionEvents.Open, () => {
    console.log("[DG SDK] Live opened:", meetingId);
    handle.ready = true;
    io.to(meetingId).emit("asr-ready", { meetingId: String(meetingId) });
  });

  // Add Deepgram event logs
  conn.on(LiveTranscriptionEvents.Metadata, (m) => {
    console.log("[DG SDK] Metadata:", JSON.stringify(m));
  });

  conn.on(LiveTranscriptionEvents.Warning, (w) => {
    console.warn("[DG SDK] Warning:", w);
  });

  // Transcript event
  conn.on(LiveTranscriptionEvents.Transcript, async (msg) => {
    const t = msg?.channel?.alternatives?.[0]?.transcript;
    if (t) console.log("[DG SDK] transcript:", t, "final:", !!msg?.is_final);
    try {
      const alt = msg?.channel?.alternatives?.[0];
      const text = alt?.transcript || "";
      const isFinal = !!msg?.is_final;
      if (!text) return;

      const words = alt?.words || [];
      const startMs = words.length ? Math.round(words[0].start * 1000) : null;
      const endMs = words.length ? Math.round(words[words.length - 1].end * 1000) : null;

      const line = {
        meetingId,
        userId: null,
        username: "Speaker",
        startMs,
        endMs,
        text,
        isFinal
      };

      // Save final results
      if (isFinal) {
        const { meetingId: _omit, ...lineForDb } = line;
        await Transcript.updateOne(
          { meetingId },
          { $push: { lines: lineForDb } },
          { upsert: true }
        );
      }

      io.to(meetingId).emit("transcript-update", line);
    } catch (e) {
      console.error("[DG SDK] transcript error", e);
    }
  });

  conn.on(LiveTranscriptionEvents.Close, (ev) => {
    console.log("[DG SDK] Live closed:", meetingId, ev);
    handle.ready = false;
    streams.delete(meetingId);
  });

  conn.on(LiveTranscriptionEvents.Error, (e) => {
    console.error("[DG SDK] Live error:", e);
    handle.ready = false;
  });

  return handle;
}

// Send raw audio bytes from browser MediaRecorder to deepgram
// In dgSdkBridge.js
export function sendAudio(meetingId, bytes) {
  const handle = streams.get(meetingId);
  if (!handle || !handle.ready) return;
  try {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    
    // Log first chunk signature
    if (!globalThis._loggedFirst) {
      const sig = Array
        .from(u8.slice(0, 8))
        .map(b => b.toString(16).padStart(2,'0'))
        .join(' ');
      console.log('[ASR] first-chunk-signature:', sig);
      globalThis._loggedFirst = true;
    }
    
    // Send Uint8Array directly - CRITICAL CHANGE
    handle.conn.send(u8); // Changed from u8.buffer
  } catch (e) {
    console.error("[DG SDK] sendAudio error", e);
  }
}

// Close + cleanup
export function closeLiveStream(meetingId) {
  const handle = streams.get(meetingId);
  if (!handle) return;
  try {
    handle.conn.close();
  } catch {}
  streams.delete(meetingId);
}
