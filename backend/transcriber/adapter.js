import WebSocket from 'ws';
import Transcript from '../models/Transcript.js';

const streams = new Map(); // meetingId -> { ws, ready, ping? }

export async function getAsrStreamForMeeting(meetingId, io) {
  if (streams.has(meetingId)) return streams.get(meetingId);

  const url = 'wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&smart_format=true';

  const ws = new WebSocket(url, {
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
  });

  const handle = { ws, ready: false, ping: null };
  streams.set(meetingId, handle);

  ws.on('open', () => {
    console.log(`[ASR] WebSocket opened for meeting ${meetingId}`);
    handle.ready = true;

    // Explicit start config
    try {
      ws.send(JSON.stringify({
        type: 'start',
        encoding: 'opus',
        sample_rate: 48000,
        channels: 1,
        punctuate: true,
        smart_format: true,
        interim_results: true
      }));
    } catch (e) {
      console.error('[ASR] start send error', e);
    }

    // keep the socket alive
    handle.ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 20000);

    // signal clients to start streaming now
    io.to(meetingId).emit('asr-ready', { meetingId: String(meetingId) });
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      // Debug first few messages if needed:
      // console.log('[ASR] message type:', msg.type);

      if (msg.type !== 'Results') return;

      const alt = msg.channel?.alternatives?.[0];
      if (!alt) return;

      const transcript = alt.transcript || '';
      const isFinal = !!msg.is_final;
      if (!transcript) return;

      const words = alt.words || [];
      const startMs = words.length ? Math.round((words[0].start || 0) * 1000) : null;
      const endMs = words.length ? Math.round((words[words.length - 1].end || 0) * 1000) : null;

      const line = {
        meetingId,
        userId: null,
        username: 'Speaker',
        startMs,
        endMs,
        text: transcript,
        isFinal
      };

      if (isFinal) {
        const { meetingId: _omit, ...lineForDb } = line;
        await Transcript.updateOne(
          { meetingId },
          { $push: { lines: lineForDb } },
          { upsert: true }
        );
      }

      io.to(meetingId).emit('transcript-update', line);
    } catch (error) {
      console.error(`[ASR] Error processing transcript for meeting ${meetingId}:`, error);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[ASR] WebSocket closed for meeting ${meetingId}`, { code, reason: reason?.toString() });
    handle.ready = false;
    if (handle.ping) clearInterval(handle.ping);
    streams.delete(meetingId);
  });

  ws.on('error', (err) => {
    console.error(`[ASR] WebSocket error for meeting ${meetingId}:`, err);
    handle.ready = false;
  });

  return handle;
}

export async function sendChunkToAsr(meetingId, payload) {
  const stream = streams.get(meetingId);
  if (!stream) {
    console.warn(`[ASR] No stream found for meeting ${meetingId}`);
    return;
  }
  if (!stream.ready || stream.ws.readyState !== WebSocket.OPEN) {
    console.warn(`[ASR] Stream not ready for meeting ${meetingId}`);
    return;
  }
  if (!payload.blob || !(payload.blob instanceof Uint8Array)) {
    console.warn(`[ASR] Invalid blob payload for meeting ${meetingId}`);
    return;
  }
  try {
    stream.ws.send(Buffer.from(payload.blob));
  } catch (error) {
    console.error(`[ASR] Error sending chunk to ASR for meeting ${meetingId}:`, error);
  }
}

export async function closeAsrForMeeting(meetingId) {
  const stream = streams.get(meetingId);
  if (!stream) return;
  try {
    if (stream.ws && stream.ws.readyState === WebSocket.OPEN) {
      stream.ws.close();
    }
  } catch (error) {
    console.error(`[ASR] Error closing stream for meeting ${meetingId}:`, error);
  } finally {
    if (stream.ping) clearInterval(stream.ping);
    streams.delete(meetingId);
  }
}
// transcriber/adapter.js
// import WebSocket from 'ws';
// import Transcript from '../models/Transcript.js';

// const streams = new Map(); // meetingId -> { ws, ready, ping?, keepAlive? }

// export async function getAsrStreamForMeeting(meetingId, io) {
//   if (streams.has(meetingId)) return streams.get(meetingId);

//   // Configure Deepgram realtime via query params (no "start" message needed)
//   const url =
//     'wss://api.deepgram.com/v1/listen' +
//     '?model=nova-2' +
//     '&encoding=opus' +
//     '&sample_rate=48000' +
//     '&channels=1' +
//     '&punctuate=true' +
//     '&smart_format=true' +
//     '&interim_results=true' +
//     '&vad_events=true' +
//     '&utterance_end_ms=1000';

//   // IMPORTANT: correct Authorization header with template literal
//   const ws = new WebSocket(url, {
//     headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
//   });

//   const handle = { ws, ready: false, ping: null, keepAlive: null };
//   streams.set(meetingId, handle);

//   ws.on('open', () => {
//     console.log(`[ASR] WebSocket opened for meeting ${meetingId}`);
//     handle.ready = true;

//     // Keep TCP socket alive (optional but fine)
//     handle.ping = setInterval(() => {
//       if (ws.readyState === WebSocket.OPEN) ws.ping();
//     }, 20_000);

//     // Deepgram-level keepalive (recommended)
//     handle.keepAlive = setInterval(() => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify({ type: 'KeepAlive' }));
//       }
//     }, 20_000);

//     // Signal clients they can start sending audio chunks
//     io.to(meetingId).emit('asr-ready', { meetingId: String(meetingId) });
//   });

//   ws.on('message', async (data) => {
//     try {
//       const msg = JSON.parse(data.toString());

//       // Main transcript results
//       if (msg.type === 'Results') {
//         const alt = msg.channel?.alternatives?.[0];
//         if (!alt) return;

//         const transcript = alt.transcript || '';
//         if (!transcript) return;

//         const isFinal = !!msg.is_final;
//         const words = alt.words || [];
//         const startMs = words.length ? Math.round((words[0].start || 0) * 1000) : null;
//         const endMs   = words.length ? Math.round((words[words.length - 1].end || 0) * 1000) : null;

//         const line = {
//           meetingId,
//           userId: null,
//           username: 'Speaker',
//           startMs,
//           endMs,
//           text: transcript,
//           isFinal
//         };

//         if (isFinal) {
//           const { meetingId: _omit, ...lineForDb } = line;
//           await Transcript.updateOne(
//             { meetingId },
//             { $push: { lines: lineForDb } },
//             { upsert: true }
//           );
//         }

//         io.to(meetingId).emit('transcript-update', line);
//       }

//       // Optional: mark utterance/turn boundaries for UI
//       if (msg.type === 'UtteranceEnd') {
//         io.to(meetingId).emit('asr-utterance-end', {
//           meetingId,
//           at: msg.last_word_end ?? null
//         });
//       }
//     } catch (error) {
//       console.error(`[ASR] Error processing transcript for meeting ${meetingId}:`, error);
//     }
//   });

//   ws.on('close', (code, reason) => {
//     console.log(
//       `[ASR] WebSocket closed for meeting ${meetingId}`,
//       { code, reason: reason?.toString() }
//     );
//     handle.ready = false;
//     if (handle.ping) clearInterval(handle.ping);
//     if (handle.keepAlive) clearInterval(handle.keepAlive);
//     streams.delete(meetingId);
//   });

//   ws.on('error', (err) => {
//     console.error(`[ASR] WebSocket error for meeting ${meetingId}:`, err);
//     handle.ready = false;
//   });

//   return handle;
// }

// export async function sendChunkToAsr(meetingId, payload) {
//   const stream = streams.get(meetingId);
//   if (!stream) {
//     console.warn(`[ASR] No stream found for meeting ${meetingId}`);
//     return;
//   }
//   if (!stream.ready || stream.ws.readyState !== WebSocket.OPEN) {
//     console.warn(`[ASR] Stream not ready for meeting ${meetingId}`);
//     return;
//   }

//   // Accept common browser payload shapes (Uint8Array, ArrayBuffer, Buffer)
//   let bytes = null;
//   const blob = payload?.blob;
//   if (blob instanceof Uint8Array) bytes = Buffer.from(blob);
//   else if (blob instanceof ArrayBuffer) bytes = Buffer.from(new Uint8Array(blob));
//   else if (Buffer.isBuffer(blob)) bytes = blob;

//   if (!bytes) {
//     console.warn(`[ASR] Invalid blob payload for meeting ${meetingId}`);
//     return;
//   }

//   try {
//     stream.ws.send(bytes);
//   } catch (error) {
//     console.error(`[ASR] Error sending chunk to ASR for meeting ${meetingId}:`, error);
//   }
// }

// export async function closeAsrForMeeting(meetingId) {
//   const stream = streams.get(meetingId);
//   if (!stream) return;

//   try {
//     if (stream.ws && stream.ws.readyState === WebSocket.OPEN) {
//       // Ask Deepgram to flush any remaining finals
//       try { stream.ws.send(JSON.stringify({ type: 'Finalize' })); } catch {}
//       // Short delay to allow final messages to arrive
//       setTimeout(() => stream.ws.close(), 200);
//     } else {
//       stream.ws?.close();
//     }
//   } catch (error) {
//     console.error(`[ASR] Error closing stream for meeting ${meetingId}:`, error);
//   } finally {
//     if (stream.ping) clearInterval(stream.ping);
//     if (stream.keepAlive) clearInterval(stream.keepAlive);
//     streams.delete(meetingId);
//   }
// }