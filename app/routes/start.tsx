import { useState, useEffect } from "react";
import type { Route } from "./+types/start";
import { Link } from "react-router";
import { TileGrid } from "../components/TileGrid";
import { TileReveal } from "../components/TileReveal";
import { SoundSettings } from "../components/SoundSettings";
import { ReadyPopup } from "../components/ReadyPopup";

type Round = 1 | 2;
type Team = "team1" | "team2";

interface SelectedTile {
  id: number;
  symbol: string;
  round: Round;
  team: Team;
  isCorrect?: boolean; // Host can mark as correct/incorrect
}

interface PuzzleData {
  tileId: number;
  round1: {
    hints: string[];
    puzzleName: string;
    hintTypes: ("text" | "image" | "audio")[];
    hintFiles: (string | null)[];
  };
  round2: {
    hints: string[];
    sequenceName: string;
    hintTypes: ("text" | "image" | "audio")[];
    hintFiles: (string | null)[];
  };
}

const STORAGE_KEY = "onlyconnect_puzzles";
const GAME_STATE_KEY = "onlyconnect_game_state";
const TEAM_NAMES_KEY = "onlyconnect_team_names";
const SFX_VOLUME_KEY = "onlyconnect_sfx_volume";

interface GameState {
  currentRound: Round;
  currentTeam: Team;
  selectedTiles: SelectedTile[];
}

interface TeamNames {
  team1: string;
  team2: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Only Connect - Start" },
    { name: "description", content: "Select a category to begin the Only Connect game" },
  ];
}

export default function Start() {
  const [currentRound, setCurrentRound] = useState<Round>(1);
  const [currentTeam, setCurrentTeam] = useState<Team>("team1");
  const [selectedTiles, setSelectedTiles] = useState<SelectedTile[]>([]);
  const [revealingTileId, setRevealingTileId] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [puzzles, setPuzzles] = useState<Record<number, PuzzleData>>({});
  const [teamNames, setTeamNames] = useState<TeamNames>({ team1: "1", team2: "2" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [sfxVolume, setSfxVolume] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SFX_VOLUME_KEY);
      return stored ? parseFloat(stored) : 0.7;
    }
    return 0.7;
  });

  useEffect(() => {
    // Load puzzles from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPuzzles(JSON.parse(stored));
    }

    // Load team names from localStorage
    const storedTeamNames = localStorage.getItem(TEAM_NAMES_KEY);
    if (storedTeamNames) {
      setTeamNames(JSON.parse(storedTeamNames));
    }

    // Load game state from localStorage
    const storedGameState = localStorage.getItem(GAME_STATE_KEY);
    if (storedGameState) {
      const gameState: GameState = JSON.parse(storedGameState);
      setCurrentRound(gameState.currentRound);
      setCurrentTeam(gameState.currentTeam);
      setSelectedTiles(gameState.selectedTiles);
    }
    
    // Mark initial load as complete
    setIsInitialLoad(false);
  }, []);

  // Save game state to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      const gameState: GameState = {
        currentRound,
        currentTeam,
        selectedTiles,
      };
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    }
  }, [currentRound, currentTeam, selectedTiles, isInitialLoad]);

  const handleTileClick = (tileId: number, symbol: string) => {
    // Check if tile already selected in current round
    const alreadySelected = selectedTiles.some(
      t => t.id === tileId && t.round === currentRound
    );
    
    if (alreadySelected || showReveal || showReady) return;

    // Show ready popup first
    setRevealingTileId(tileId);
    setShowReady(true);
  };

  const handleReady = () => {
    setShowReady(false);
    // Now show the reveal screen
    setShowReveal(true);
  };

  const handleRevealClose = () => {
    // Add tile to selected list when reveal closes
    if (revealingTileId) {
      setSelectedTiles(prev => [
        ...prev,
        { 
          id: revealingTileId, 
          symbol: "", // Will be filled from tile data
          round: currentRound,
          team: currentTeam
        }
      ]);
      
      // Automatically switch to next team
      setCurrentTeam(prev => prev === "team1" ? "team2" : "team1");
    }
    setShowReveal(false);
    setRevealingTileId(null);
  };

  const handleNextRound = () => {
    if (currentRound === 1) {
      setCurrentRound(2);
      setCurrentTeam("team1");
      // Reset selected tiles for round 2 (keep round 1 tiles for reference)
      setSelectedTiles(prev => prev.filter(t => t.round === 1));
    }
  };

  const handleNewGame = () => {
    // Clear game state
    setCurrentRound(1);
    setCurrentTeam("team1");
    setSelectedTiles([]);
    localStorage.removeItem(GAME_STATE_KEY);
  };

  const handleSfxVolumeChange = (volume: number) => {
    setSfxVolume(volume);
    localStorage.setItem(SFX_VOLUME_KEY, volume.toString());
  };

  const currentRoundTiles = selectedTiles.filter(t => t.round === currentRound);
  const tilesSelectedThisRound = currentRoundTiles.length;

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="max-w-6xl w-full h-full flex flex-col">
        {/* Top Left Controls */}
        <div className="flex-shrink-0 mb-2 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          {/* Settings Cog */}
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Open settings"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* Host Controls Panel - Smaller */}
        <div className="flex-shrink-0 bg-gray-100 rounded-lg p-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-xs font-semibold text-gray-700">Round {currentRound}</p>
              <p className="text-xs text-gray-600">
                Team {teamNames[currentTeam] || (currentTeam === "team1" ? "1" : "2")}'s Turn
              </p>
              <p className="text-xs text-gray-500">
                Remaining: {6 - tilesSelectedThisRound}/6
              </p>
            </div>
            {currentRound === 1 && tilesSelectedThisRound === 6 && (
              <button
                onClick={handleNextRound}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
              >
                Start Round 2
              </button>
            )}
          </div>
        </div>

        {/* Game Title */}
        <div className="flex-shrink-0 text-center mt-12">
          <h1 className="text-black/80 text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider">
            Round {currentRound}: {currentRound === 1 ? "Connections" : "Sequences"}
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-black/20 to-transparent opacity-30" />
        </div>

        {/* Tile Grid - Takes remaining space */}
        <div className="flex-1 flex items-center justify-center min-h-0 mb-2">
          <TileGrid
            onTileClick={handleTileClick}
            selectedTileIds={currentRoundTiles.map(t => t.id)}
            disabled={showReveal}
          />
        </div>

        {/* Bottom Text - Smaller */}
        <div className="flex-shrink-0 text-center">
          <p className="text-black/60 tracking-wider text-xs">
            SELECT A HIEROGLYPH
          </p>
        </div>

        {/* Reveal Modal */}
        {showReveal && revealingTileId && (() => {
          const puzzle = puzzles[revealingTileId];
          const hints = currentRound === 1 
            ? (puzzle?.round1.hints || [])
            : (puzzle?.round2.hints || []);
          const hintTypes = currentRound === 1
            ? (puzzle?.round1.hintTypes || [])
            : (puzzle?.round2.hintTypes || []);
          const hintFiles = currentRound === 1
            ? (puzzle?.round1.hintFiles || [])
            : (puzzle?.round2.hintFiles || []);
          const puzzleName = currentRound === 1 ? puzzle?.round1.puzzleName : undefined;
          const sequenceName = currentRound === 2 ? puzzle?.round2.sequenceName : undefined;
          
          return (
            <TileReveal
              tileId={revealingTileId}
              round={currentRound}
              onClose={handleRevealClose}
              hints={hints}
              hintTypes={hintTypes}
              hintFiles={hintFiles}
              puzzleName={puzzleName}
              sequenceName={sequenceName}
              sfxVolume={sfxVolume}
            />
          );
        })()}
        
        {/* Ready Popup */}
        {showReady && revealingTileId && (
          <ReadyPopup onReady={handleReady} sfxVolume={sfxVolume} />
        )}
        
        {/* Settings Modal */}
        <SoundSettings
          sfxVolume={sfxVolume}
          onSfxVolumeChange={handleSfxVolumeChange}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
}