import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { OnlyConnectFractal } from "../components/OnlyConnectFractal";
import { GameIntro } from "../components/GameIntro";

const GAME_STATE_KEY = "onlyconnect_game_state";
const SFX_VOLUME_KEY = "onlyconnect_sfx_volume";

interface GameState {
  currentRound: 1 | 2;
  currentTeam: "team1" | "team2";
  selectedTiles: Array<{
    id: number;
    symbol: string;
    round: 1 | 2;
    team: "team1" | "team2";
    isCorrect?: boolean;
  }>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "OnlyKonnect" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [hasGameInProgress, setHasGameInProgress] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [sfxVolume, setSfxVolume] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SFX_VOLUME_KEY);
      return stored ? parseFloat(stored) : 0.7;
    }
    return 0.7;
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a game in progress (has selected tiles)
    const gameStateStr = localStorage.getItem(GAME_STATE_KEY);
    if (gameStateStr) {
      try {
        const gameState: GameState = JSON.parse(gameStateStr);
        // Only show resume if there are actually selected tiles
        const hasSelectedTiles = gameState.selectedTiles && gameState.selectedTiles.length > 0;
        setHasGameInProgress(hasSelectedTiles);
      } catch (e) {
        // If parsing fails, no game in progress
        setHasGameInProgress(false);
      }
    } else {
      setHasGameInProgress(false);
    }
  }, []);

  // Listen for volume changes from GlobalSoundControls
  useEffect(() => {
    const handleVolumeChange = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(SFX_VOLUME_KEY);
        if (stored) {
          setSfxVolume(parseFloat(stored));
        }
      }
    };
    
    window.addEventListener('sfxVolumeChanged', handleVolumeChange);
    window.addEventListener('storage', (e) => {
      if (e.key === SFX_VOLUME_KEY && e.newValue) {
        setSfxVolume(parseFloat(e.newValue));
      }
    });

    return () => {
      window.removeEventListener('sfxVolumeChanged', handleVolumeChange);
    };
  }, []);

  const handleNewGame = () => {
    // Clear game state
    localStorage.removeItem(GAME_STATE_KEY);
    // Show intro popup
    setShowIntro(true);
  };

  const handleResumeGame = () => {
    // Navigate to start page (game state will be loaded automatically)
    navigate("/start");
  };

  const handleStartGame = () => {
    setShowIntro(false);
    navigate("/start");
  };

  return (
  <>
    <div className="relative flex flex-col items-center justify-center h-screen gap-4 overflow-hidden">
      {/* Fractal Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <OnlyConnectFractal className="w-full h-full max-w-4xl max-h-4xl animate-[spin_40s_linear_infinite]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold">OnlyKonnect</h1>
        <p className="text-lg">Welcome to OnlyKonnect</p>
        <div className="flex flex-col gap-2 items-center">
        {hasGameInProgress ? (
          <>
            <button
              onClick={handleResumeGame}
              className="text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
            >
              Resume Game
            </button>
            <button
              onClick={handleNewGame}
              className="text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
            >
              New Game
            </button>
          </>
        ) : (
          <button
            onClick={handleNewGame}
            className="text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
          >
            Start
          </button>
        )}
        <Link to="/about" className="text-blue-500 hover:underline">About</Link>    
        <Link to="/game-creator" className="text-blue-500 hover:underline">Game Creator</Link>
        </div>
      </div>
    </div>
    {showIntro && (
      <GameIntro onClose={handleStartGame} sfxVolume={sfxVolume} />
    )}
  </>
);

}
