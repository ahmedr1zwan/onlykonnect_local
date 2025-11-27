import { useState, useEffect } from "react";
import type { Route } from "./+types/game-creator";
import { Link } from "react-router";
import { TwoReeds, Lion, TwistedFlax, HornedViper, Water, EyeOfHorus } from "../components/Hieroglyphs";

const tileMap: Record<number, { 
  symbol: string; 
  Icon: React.ComponentType<{ className?: string }> 
}> = {
  1: { symbol: "Two Reeds", Icon: TwoReeds },
  2: { symbol: "Lion", Icon: Lion },
  3: { symbol: "Twisted Flax", Icon: TwistedFlax },
  4: { symbol: "Horned Viper", Icon: HornedViper },
  5: { symbol: "Water", Icon: Water },
  6: { symbol: "Eye of Horus", Icon: EyeOfHorus },
};

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
    { title: "Only Connect - Game Creator" },
    { name: "description", content: "Create puzzles and hints for Only Connect game" },
  ];
}

export default function GameCreator() {
  const [puzzles, setPuzzles] = useState<Record<number, PuzzleData>>({});
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleData | null>(null);

  useEffect(() => {
    // Load puzzles from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPuzzles(JSON.parse(stored));
    } else {
      // Initialize with empty puzzles for all 6 tiles
      const initial: Record<number, PuzzleData> = {};
      for (let i = 1; i <= 6; i++) {
        initial[i] = {
          tileId: i,
          round1: {
            hints: ["", "", "", ""],
            puzzleName: "",
          },
          round2: {
            hints: ["", "", "", ""],
            sequenceName: "",
          },
        };
      }
      setPuzzles(initial);
    }
  }, []);

  const handleTileSelect = (tileId: number) => {
    setSelectedTile(tileId);
    setCurrentPuzzle(puzzles[tileId] || {
      tileId,
      round1: { hints: ["", "", "", ""], puzzleName: "" },
      round2: { hints: ["", "", "", ""], sequenceName: "" },
    });
  };

  const handleSave = () => {
    if (!selectedTile || !currentPuzzle) return;
    
    const updated = { ...puzzles, [selectedTile]: currentPuzzle };
    setPuzzles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    alert("Puzzle saved!");
  };

  const handleRound1HintChange = (index: number, value: string) => {
    if (!currentPuzzle) return;
    const newHints = [...currentPuzzle.round1.hints];
    newHints[index] = value;
    setCurrentPuzzle({
      ...currentPuzzle,
      round1: { ...currentPuzzle.round1, hints: newHints },
    });
  };

  const handleRound2HintChange = (index: number, value: string) => {
    if (!currentPuzzle) return;
    const newHints = [...currentPuzzle.round2.hints];
    newHints[index] = value;
    setCurrentPuzzle({
      ...currentPuzzle,
      round2: { ...currentPuzzle.round2, hints: newHints },
    });
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black/80">Game Creator</h1>
          <Link to="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Tile Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Tile</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(tileMap).map((tile, index) => {
                const tileId = index + 1;
                const TileIcon = tile.Icon;
                return (
                  <button
                    key={tileId}
                    onClick={() => handleTileSelect(tileId)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedTile === tileId
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <TileIcon className="w-12 h-12" />
                      <span className="text-sm font-medium">{tile.symbol}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Puzzle Editor */}
          <div>
            {selectedTile && currentPuzzle ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Edit Puzzle for {tileMap[selectedTile].symbol}</h2>

                {/* Round 1: Connections */}
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Round 1: Connections</h3>
                  <div className="space-y-3 mb-3">
                    {currentPuzzle.round1.hints.map((hint, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium mb-1">
                          Hint {index + 1}
                        </label>
                        <input
                          type="text"
                          value={hint}
                          onChange={(e) => handleRound1HintChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          placeholder={`Enter hint ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Puzzle Name (Connection)
                    </label>
                    <input
                      type="text"
                      value={currentPuzzle.round1.puzzleName}
                      onChange={(e) =>
                        setCurrentPuzzle({
                          ...currentPuzzle,
                          round1: { ...currentPuzzle.round1, puzzleName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="e.g., Things that are red"
                    />
                  </div>
                </div>

                {/* Round 2: Sequences */}
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Round 2: Sequences</h3>
                  <div className="space-y-3 mb-3">
                    {currentPuzzle.round2.hints.map((hint, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium mb-1">
                          Hint {index + 1}
                        </label>
                        <input
                          type="text"
                          value={hint}
                          onChange={(e) => handleRound2HintChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          placeholder={`Enter hint ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sequence Name
                    </label>
                    <input
                      type="text"
                      value={currentPuzzle.round2.sequenceName}
                      onChange={(e) =>
                        setCurrentPuzzle({
                          ...currentPuzzle,
                          round2: { ...currentPuzzle.round2, sequenceName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="e.g., Fibonacci sequence"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Puzzle
                </button>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-12">
                Select a tile to edit its puzzle
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
