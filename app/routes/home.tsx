import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { OnlyConnectFractal } from "../components/OnlyConnectFractal";
import { GameIntro } from "../components/GameIntro";

const GAME_STATE_KEY = "onlyconnect_game_state";
const SFX_VOLUME_KEY = "onlyconnect_sfx_volume";
const SKIP_INTRO_KEY = "onlyconnect_skip_intro";

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

    if (localStorage.getItem(SKIP_INTRO_KEY) === "true") {
      navigate("/start");
      return;
    }

    setShowIntro(true);
  };

  const handleResumeGame = () => {
    // Navigate to start page (game state will be loaded automatically)
    navigate("/start");
  };

  const handleStartGame = () => {
    navigate("/start");
    setShowIntro(false);
  };

  return (
  <>
    <main className="ok-page flex h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="ok-floor" />

      {/* Tilted, slowly turning fractal disc behind the title */}
      <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center opacity-40">
        <div className="ok-disc">
          <OnlyConnectFractal className="h-[min(90vw,620px)] w-[min(90vw,620px)]" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="ok-kicker">Welcome to</p>
        <h1 className="ok-title-3d mt-3 whitespace-nowrap text-[clamp(2.25rem,10vw,5.5rem)] leading-none">
          OnlyKonnect
        </h1>
        <div className="ok-rule mt-6 w-72 max-w-[70vw]" />

        <nav className="mt-10 flex w-64 flex-col gap-4">
          {hasGameInProgress ? (
            <>
              <button onClick={handleResumeGame} className="ok-btn w-full text-lg">
                Resume Game
              </button>
              <button onClick={handleNewGame} className="ok-btn ok-btn-light w-full text-lg">
                New Game
              </button>
            </>
          ) : (
            <button onClick={handleNewGame} className="ok-btn w-full text-lg">
              Start
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/game-creator" className="ok-btn ok-btn-light ok-btn-sm">
              Creator
            </Link>
            <Link to="/about" className="ok-btn ok-btn-light ok-btn-sm">
              About
            </Link>
          </div>
        </nav>
      </div>
    </main>
    {showIntro && (
      <GameIntro onComplete={handleStartGame} sfxVolume={sfxVolume} />
    )}
  </>
);

}
