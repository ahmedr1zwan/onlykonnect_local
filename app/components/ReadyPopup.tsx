import { useEffect, useRef } from "react";

interface ReadyPopupProps {
  onReady: () => void;
  sfxVolume: number;
}

export function ReadyPopup({ onReady, sfxVolume }: ReadyPopupProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play ocFlurry sound
    const audio = new Audio("/sounds/ocFlurry.mp3");
    audio.volume = sfxVolume;
    audio.play().catch((e) => console.error("Error playing ocFlurry:", e));
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sfxVolume]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Ready to Start?</h2>
        <p className="text-gray-700 mb-6 text-center">
          Click Ready when you're prepared to begin the puzzle.
        </p>
        <button
          onClick={onReady}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Ready
        </button>
      </div>
    </div>
  );
}

