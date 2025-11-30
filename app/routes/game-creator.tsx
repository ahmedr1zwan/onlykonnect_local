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

  // Compress image before storing
  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed Data URL
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    round: 1 | 2,
    index: number,
    file: File,
    type: "image" | "audio"
  ) => {
    if (!currentPuzzle) return;

    // File size validation
    const maxImageSize = 500 * 1024; // 500KB for images
    const maxAudioSize = 1000 * 1024; // 1MB for audio
    const maxSize = type === "image" ? maxImageSize : maxAudioSize;
    
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      alert(
        `File too large! Maximum size is ${maxSizeMB}MB, but your file is ${fileSizeMB}MB. ` +
        (type === "image" 
          ? "The image will be compressed automatically, but please try a smaller file if possible."
          : "Please compress your audio file or use a shorter clip.")
      );
      
      // For images, still try to compress even if over limit
      if (type === "image") {
        try {
          const compressed = await compressImage(file, 1920, 0.7);
          const compressedSize = (compressed.length * 3) / 4; // Approximate base64 size
          if (compressedSize > maxSize * 1.5) {
            alert("File is still too large after compression. Please use a smaller image.");
            return;
          }
          
          const newHintFiles = [...(round === 1 ? currentPuzzle.round1.hintFiles : currentPuzzle.round2.hintFiles)];
          const newHintTypes = [...(round === 1 ? currentPuzzle.round1.hintTypes : currentPuzzle.round2.hintTypes)];
          
          newHintFiles[index] = compressed;
          newHintTypes[index] = type;

          setCurrentPuzzle({
            ...currentPuzzle,
            [round === 1 ? "round1" : "round2"]: {
              ...(round === 1 ? currentPuzzle.round1 : currentPuzzle.round2),
              hintFiles: newHintFiles,
              hintTypes: newHintTypes,
            },
          });
        } catch (error) {
          alert("Failed to compress image. Please try a different file.");
          console.error("Image compression error:", error);
        }
      }
      return;
    }

    // For images, always compress to save space
    if (type === "image") {
      try {
        const compressed = await compressImage(file, 1920, 0.8);
        const newHintFiles = [...(round === 1 ? currentPuzzle.round1.hintFiles : currentPuzzle.round2.hintFiles)];
        const newHintTypes = [...(round === 1 ? currentPuzzle.round1.hintTypes : currentPuzzle.round2.hintTypes)];
        
        newHintFiles[index] = compressed;
        newHintTypes[index] = type;

        setCurrentPuzzle({
          ...currentPuzzle,
          [round === 1 ? "round1" : "round2"]: {
            ...(round === 1 ? currentPuzzle.round1 : currentPuzzle.round2),
            hintFiles: newHintFiles,
            hintTypes: newHintTypes,
          },
        });
      } catch (error) {
        alert("Failed to process image. Please try again.");
        console.error("Image processing error:", error);
      }
      return;
    }

    // For audio files, convert directly (no compression available in browser)
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
    reader.onerror = () => {
      alert("Failed to read audio file. Please try again.");
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black/80">Game Creator</h1>
          <Link to="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Back to Home
          </Link>
        </div>

        {/* Compact Settings Bar */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="grid grid-cols-4 gap-4">
            {/* Team Names - Compact */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Team 1</label>
              <input
                type="text"
                value={teamNames.team1}
                onChange={(e) => handleTeamNameChange("team1", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                placeholder="Team 1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Team 2</label>
              <input
                type="text"
                value={teamNames.team2}
                onChange={(e) => handleTeamNameChange("team2", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                placeholder="Team 2"
              />
            </div>
            {/* Timer Settings - Compact */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Guessing Time: {timerSettings.defaultGuessingTime}s
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={timerSettings.defaultGuessingTime}
                onChange={(e) => handleTimerSettingsChange("defaultGuessingTime", parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">
                Steal Time: {timerSettings.defaultStealTime}s
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={timerSettings.defaultStealTime}
                onChange={(e) => handleTimerSettingsChange("defaultStealTime", parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
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
          <div className="relative">
            {selectedTile && currentPuzzle ? (
              <>
                {/* Sticky Save Button */}
                <div className="sticky top-4 z-10 mb-4 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg transition-colors"
                  >
                    💾 Save Puzzle
                  </button>
                </div>
                
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
                </div>
              </>
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
