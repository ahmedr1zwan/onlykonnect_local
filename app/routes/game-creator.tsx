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
    hintTypes: ("text" | "image" | "audio")[]; // Type of each hint
    hintFiles: (string | null)[]; // File URLs or data URLs for images/audio
  };
  round2: {
    hints: string[];
    sequenceName: string;
    hintTypes: ("text" | "image" | "audio")[];
    hintFiles: (string | null)[];
  };
}

const STORAGE_KEY = "onlyconnect_puzzles";
const TEAM_NAMES_KEY = "onlyconnect_team_names";
const TIMER_SETTINGS_KEY = "onlyconnect_timer_settings";

interface TeamNames {
  team1: string;
  team2: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Only Connect - Game Creator" },
    { name: "description", content: "Create puzzles and hints for Only Connect game" },
  ];
}

interface TimerSettings {
  defaultGuessingTime: number;
  defaultStealTime: number;
}

export default function GameCreator() {
  const [puzzles, setPuzzles] = useState<Record<number, PuzzleData>>({});
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleData | null>(null);
  const [teamNames, setTeamNames] = useState<TeamNames>({ team1: "1", team2: "2" });
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(TIMER_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : { defaultGuessingTime: 40, defaultStealTime: 15 };
    }
    return { defaultGuessingTime: 40, defaultStealTime: 15 };
  });

  useEffect(() => {
    // Load team names from localStorage
    const storedTeamNames = localStorage.getItem(TEAM_NAMES_KEY);
    if (storedTeamNames) {
      setTeamNames(JSON.parse(storedTeamNames));
    }

    // Load timer settings from localStorage
    if (typeof window !== "undefined") {
      const storedTimerSettings = localStorage.getItem(TIMER_SETTINGS_KEY);
      if (storedTimerSettings) {
        setTimerSettings(JSON.parse(storedTimerSettings));
      }
    }

    // Load puzzles from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const loaded = JSON.parse(stored);
      // Migrate old puzzles to include hintTypes and hintFiles
      const migrated: Record<number, PuzzleData> = {};
      for (let i = 1; i <= 6; i++) {
        const puzzle = loaded[i];
        if (puzzle) {
          migrated[i] = {
            tileId: i,
            round1: {
              hints: puzzle.round1?.hints || ["", "", "", ""],
              puzzleName: puzzle.round1?.puzzleName || "",
              hintTypes: puzzle.round1?.hintTypes || ["text", "text", "text", "text"],
              hintFiles: puzzle.round1?.hintFiles || [null, null, null, null],
            },
            round2: {
              hints: puzzle.round2?.hints || ["", "", "", ""],
              sequenceName: puzzle.round2?.sequenceName || "",
              hintTypes: puzzle.round2?.hintTypes || ["text", "text", "text", "text"],
              hintFiles: puzzle.round2?.hintFiles || [null, null, null, null],
            },
          };
        } else {
          // Initialize missing puzzles
          migrated[i] = {
            tileId: i,
            round1: {
              hints: ["", "", "", ""],
              puzzleName: "",
              hintTypes: ["text", "text", "text", "text"],
              hintFiles: [null, null, null, null],
            },
            round2: {
              hints: ["", "", "", ""],
              sequenceName: "",
              hintTypes: ["text", "text", "text", "text"],
              hintFiles: [null, null, null, null],
            },
          };
        }
      }
      setPuzzles(migrated);
      // Save migrated version back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    } else {
      // Initialize with empty puzzles for all 6 tiles
      const initial: Record<number, PuzzleData> = {};
      for (let i = 1; i <= 6; i++) {
        initial[i] = {
          tileId: i,
          round1: {
            hints: ["", "", "", ""],
            puzzleName: "",
            hintTypes: ["text", "text", "text", "text"],
            hintFiles: [null, null, null, null],
          },
          round2: {
            hints: ["", "", "", ""],
            sequenceName: "",
            hintTypes: ["text", "text", "text", "text"],
            hintFiles: [null, null, null, null],
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
      round1: { 
        hints: ["", "", "", ""], 
        puzzleName: "",
        hintTypes: ["text", "text", "text", "text"],
        hintFiles: [null, null, null, null],
      },
      round2: { 
        hints: ["", "", "", ""], 
        sequenceName: "",
        hintTypes: ["text", "text", "text", "text"],
        hintFiles: [null, null, null, null],
      },
    });
  };

  const handleSave = () => {
    if (!selectedTile || !currentPuzzle) return;
    
    const updated = { ...puzzles, [selectedTile]: currentPuzzle };
    setPuzzles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    alert("Puzzle saved!");
  };

  const handleTeamNameChange = (team: "team1" | "team2", name: string) => {
    const updated = { ...teamNames, [team]: name };
    setTeamNames(updated);
    localStorage.setItem(TEAM_NAMES_KEY, JSON.stringify(updated));
  };

  const handleTimerSettingsChange = (setting: keyof TimerSettings, value: number) => {
    const updated = { ...timerSettings, [setting]: value };
    setTimerSettings(updated);
    localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(updated));
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

  const handleFileUpload = async (
    round: 1 | 2,
    index: number,
    file: File,
    type: "image" | "audio"
  ) => {
    if (!currentPuzzle) return;

    // Convert file to data URL for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const newHintFiles = [...(round === 1 ? currentPuzzle.round1.hintFiles : currentPuzzle.round2.hintFiles)];
      const newHintTypes = [...(round === 1 ? currentPuzzle.round1.hintTypes : currentPuzzle.round2.hintTypes)];
      
      newHintFiles[index] = dataUrl;
      newHintTypes[index] = type;

      setCurrentPuzzle({
        ...currentPuzzle,
        [round === 1 ? "round1" : "round2"]: {
          ...(round === 1 ? currentPuzzle.round1 : currentPuzzle.round2),
          hintFiles: newHintFiles,
          hintTypes: newHintTypes,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleHintTypeChange = (round: 1 | 2, index: number, type: "text" | "image" | "audio") => {
    if (!currentPuzzle) return;
    const newHintTypes = [...(round === 1 ? currentPuzzle.round1.hintTypes : currentPuzzle.round2.hintTypes)];
    newHintTypes[index] = type;

    setCurrentPuzzle({
      ...currentPuzzle,
      [round === 1 ? "round1" : "round2"]: {
        ...(round === 1 ? currentPuzzle.round1 : currentPuzzle.round2),
        hintTypes: newHintTypes,
      },
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

        {/* Team Names Section */}
        <div className="mb-8 border-2 border-gray-300 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Team Names</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Team 1 Name
              </label>
              <input
                type="text"
                value={teamNames.team1}
                onChange={(e) => handleTeamNameChange("team1", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="Enter team 1 name"
              />
              <p className="text-xs text-gray-500 mt-1">Will display as "Team {teamNames.team1}"</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Team 2 Name
              </label>
              <input
                type="text"
                value={teamNames.team2}
                onChange={(e) => handleTeamNameChange("team2", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="Enter team 2 name"
              />
              <p className="text-xs text-gray-500 mt-1">Will display as "Team {teamNames.team2}"</p>
            </div>
          </div>
        </div>

        {/* Timer Settings Section */}
        <div className="mb-8 border-2 border-gray-300 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Timer Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Guessing Time: {timerSettings.defaultGuessingTime}s
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={timerSettings.defaultGuessingTime}
                onChange={(e) => handleTimerSettingsChange("defaultGuessingTime", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>60s</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Initial time when puzzle starts</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Steal Time: {timerSettings.defaultStealTime}s
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={timerSettings.defaultStealTime}
                onChange={(e) => handleTimerSettingsChange("defaultStealTime", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5s</span>
                <span>30s</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Time for steal attempts</p>
            </div>
          </div>
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
                    {currentPuzzle.round1.hints.map((hint, index) => {
                      const hintType = currentPuzzle.round1.hintTypes?.[index] || "text";
                      const hintFile = currentPuzzle.round1.hintFiles?.[index] || null;
                      
                      return (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">
                            Hint {index + 1}
                          </label>
                          <select
                            value={hintType}
                            onChange={(e) => handleHintTypeChange(1, index, e.target.value as "text" | "image" | "audio")}
                            className="px-2 py-1 text-xs border border-gray-300 rounded"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                            <option value="audio">Audio (MP3)</option>
                          </select>
                        </div>
                        {hintType === "text" ? (
                          <input
                            type="text"
                            value={hint}
                            onChange={(e) => handleRound1HintChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            placeholder={`Enter hint ${index + 1}`}
                          />
                        ) : currentPuzzle.round1.hintTypes[index] === "image" ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(1, index, file, "image");
                              }}
                              className="w-full text-sm"
                            />
                            {hintFile && (
                              <img
                                src={hintFile}
                                alt={`Hint ${index + 1}`}
                                className="max-w-full h-32 object-contain border border-gray-300 rounded"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="audio/mpeg,audio/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(1, index, file, "audio");
                              }}
                              className="w-full text-sm"
                            />
                            {hintFile && (
                              <audio
                                src={hintFile}
                                controls
                                className="w-full"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
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
                    {currentPuzzle.round2.hints.map((hint, index) => {
                      const hintType = currentPuzzle.round2.hintTypes?.[index] || "text";
                      const hintFile = currentPuzzle.round2.hintFiles?.[index] || null;
                      
                      return (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">
                            Hint {index + 1}
                          </label>
                          <select
                            value={hintType}
                            onChange={(e) => handleHintTypeChange(2, index, e.target.value as "text" | "image" | "audio")}
                            className="px-2 py-1 text-xs border border-gray-300 rounded"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                            <option value="audio">Audio (MP3)</option>
                          </select>
                        </div>
                        {hintType === "text" ? (
                          <input
                            type="text"
                            value={hint}
                            onChange={(e) => handleRound2HintChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            placeholder={`Enter hint ${index + 1}`}
                          />
                        ) : hintType === "image" ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(2, index, file, "image");
                              }}
                              className="w-full text-sm"
                            />
                            {hintFile && (
                              <img
                                src={hintFile}
                                alt={`Hint ${index + 1}`}
                                className="max-w-full h-32 object-contain border border-gray-300 rounded"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="audio/mpeg,audio/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(2, index, file, "audio");
                              }}
                              className="w-full text-sm"
                            />
                            {hintFile && (
                              <audio
                                src={hintFile}
                                controls
                                className="w-full"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
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
