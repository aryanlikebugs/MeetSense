import { useEffect, useRef } from "react";
import { useMeeting } from "../hooks/useMeeting";

export default function TranscriptPanel() {
  const { transcript } = useMeeting();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div style={{ padding: "16px", height: "100%", overflowY: "auto", background:"#111", color:"#fff" }}>
      {transcript.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>No transcript yet</p>
          <p className="text-sm mt-1">Transcript will appear here as participants speak</p>
        </div>
      ) : (
        <>
          {transcript.map((l, i) => (
            <div key={i} style={{ opacity: l.isFinal ? 1 : 0.6, marginBottom:"12px", lineHeight:"1.6" }}>
              {l.username ? <b style={{ color: "#60a5fa" }}>{l.username}: </b> : null}
              <span>{l.text}</span>
            </div>
          ))}
          <div ref={endRef} />
        </>
      )}
    </div>
  );
}

