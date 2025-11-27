import { useState, useEffect } from "react";
import type { Route } from "./+types/start";
import { TileGrid } from "../components/TileGrid";
import { TileReveal } from "../components/TileReveal";

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
  };
  round2: {
    hints: string[];
    sequenceName: string;
  };
}

const STORAGE_KEY = "onlyconnect_puzzles";

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

  useEffect(() => {
    // Load puzzles from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPuzzles(JSON.parse(stored));
    }
  }, []);

  const handleTileClick = (tileId: number, symbol: string) => {
    // Check if tile already selected in current round
    const alreadySelected = selectedTiles.some(
      t => t.id === tileId && t.round === currentRound
    );
    
    if (alreadySelected || showReveal) return;

    // Show reveal screen
    setRevealingTileId(tileId);
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

  const currentRoundTiles = selectedTiles.filter(t => t.round === currentRound);
  const tilesSelectedThisRound = currentRoundTiles.length;

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="max-w-6xl w-full h-full flex flex-col">
        {/* Host Controls Panel - Smaller */}
        <div className="flex-shrink-0 bg-gray-100 rounded-lg p-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-xs font-semibold text-gray-700">Round {currentRound}</p>
              <p className="text-xs text-gray-600">
                {currentTeam === "team1" ? "Team 1" : "Team 2"}'s Turn
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

        {/* Game Title - Smaller */}
        <div className="flex-shrink-0 text-center mt-8">
          <h1 className="text-black/80 text-2xl md:text-3xl font-bold tracking-wider">
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
          const puzzleName = currentRound === 1 ? puzzle?.round1.puzzleName : undefined;
          const sequenceName = currentRound === 2 ? puzzle?.round2.sequenceName : undefined;
          
          return (
            <TileReveal
              tileId={revealingTileId}
              round={currentRound}
              onClose={handleRevealClose}
              hints={hints}
              puzzleName={puzzleName}
              sequenceName={sequenceName}
            />
          );
        })()}
      </div>
    </div>
  );
}