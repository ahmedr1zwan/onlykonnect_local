import { useState, useEffect } from "react";
import { stopAllAudio, isMuted as checkMuted } from "../utils/audioManager";

const MUTE_STATE_KEY = "onlyconnect_mute_state";

export function GlobalMuteButton() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MUTE_STATE_KEY);
      return stored === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_STATE_KEY, isMuted.toString());
    }
    
    // If just muted, stop all currently playing audio immediately
    if (isMuted) {
      stopAllAudio();
    }
  }, [isMuted]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // If muting, stop all audio immediately
    if (newMutedState) {
      stopAllAudio();
    }
  };

  return (
    <button
      onClick={toggleMute}
      className="fixed top-4 left-4 z-[9999] p-2 bg-blue-500/80 hover:bg-blue-600/90 rounded-lg transition-colors shadow-lg"
      aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
      title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {isMuted ? (
          <>
            {/* Muted: Speaker with diagonal line */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            {/* Diagonal line across speaker */}
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth={2.5} strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Unmuted: Speaker icon */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </>
        )}
      </svg>
    </button>
  );
}

// Re-export for convenience
export { isMuted } from "../utils/audioManager";

