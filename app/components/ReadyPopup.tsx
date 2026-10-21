import { useEffect, useRef } from "react";
import { isMuted, registerAudio, unregisterAudio } from "../utils/audioManager";

interface ReadyPopupProps {
  onReady: () => void;
  sfxVolume: number;
}

export function ReadyPopup({ onReady, sfxVolume }: ReadyPopupProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play ocFlurry sound
    if (!isMuted()) {
      const audio = new Audio("/sounds/ocFlurry.mp3");
      audio.volume = sfxVolume;
      audio.play().catch((e) => console.error("Error playing ocFlurry:", e));
      audioRef.current = audio;
      registerAudio(audio);
    }

    return () => {
      if (audioRef.current) {
        unregisterAudio(audioRef.current);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sfxVolume]);

  return (
    <div className="ok-modal-backdrop fixed inset-0 z-50 flex items-center justify-center">
      <div className="ok-panel max-w-md w-full mx-4 p-8 text-center">
        <p className="ok-kicker">Get set</p>
        <h2 className="ok-heading-3d mt-2 text-3xl">Ready?</h2>
        <p className="mt-4 mb-8 text-slate-600">
          Click Ready when you're prepared to begin the puzzle.
        </p>
        <button onClick={onReady} className="ok-btn w-full text-lg">
          Ready
        </button>
      </div>
    </div>
  );
}
