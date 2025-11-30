import { useEffect, useRef } from "react";

interface GameIntroProps {
  onClose: () => void;
  sfxVolume: number;
}

export function GameIntro({ onClose, sfxVolume }: GameIntroProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play opening music
    const audio = new Audio("/sounds/openingTitlesWithFlurry.mp3");
    audio.volume = sfxVolume;
    audio.play().catch((e) => console.error("Error playing opening music:", e));
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
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Only Connect</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Round 1: Connections</h3>
            <p className="text-gray-700">
              In this round, teams must identify the connection between four clues. 
              Each clue is revealed one at a time, and teams can buzz in at any point 
              to guess the connection. The host reveals hints progressively, and teams 
              can score points by correctly identifying what connects all four clues.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Round 2: Sequences</h3>
            <p className="text-gray-700">
              In this round, teams must identify the sequence or pattern. Three clues 
              are revealed, and teams must guess what comes next in the sequence. The 
              final clue is revealed only after teams have had a chance to guess, 
              making this round more challenging.
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}

