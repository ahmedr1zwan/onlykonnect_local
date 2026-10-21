import { useState, useEffect } from "react";
import type { Route } from "./+types/game-creator";
import { Link } from "react-router";
import { DEFAULT_POINTS, loadPointsSettings, savePointsSettings, type PointsSettings } from "../utils/pointsSettings";
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
const STARTING_TEAMS_KEY = "onlyconnect_starting_teams";
const SKIP_INTRO_KEY = "onlyconnect_skip_intro";
const SHOW_SCORES_KEY = "onlyconnect_show_scores";

interface StartingTeams {
  round1: "team1" | "team2";
  round2: "team1" | "team2";
}

interface TeamNames {
  team1: string;
  team2: string;
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "OnlyKonnect - Game Creator" },
    { name: "description", content: "Build your own OnlyKonnect puzzles with text, image and audio clues, and set timers and points." },
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
  const [startingTeams, setStartingTeams] = useState<StartingTeams>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STARTING_TEAMS_KEY);
      return stored ? JSON.parse(stored) : { round1: "team1", round2: "team1" };
    }
    return { round1: "team1", round2: "team1" };
  });
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(TIMER_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : { defaultGuessingTime: 40, defaultStealTime: 15 };
    }
    return { defaultGuessingTime: 40, defaultStealTime: 15 };
  });
  const [skipIntro, setSkipIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SKIP_INTRO_KEY) === "true";
    }
    return false;
  });
  const [pointsSettings, setPointsSettings] = useState<PointsSettings>(DEFAULT_POINTS);
  // Score totals are hidden on the game board unless the host opts in
  const [showScores, setShowScores] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SHOW_SCORES_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    setPointsSettings(loadPointsSettings());

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

  const handleStartingTeamChange = (round: "round1" | "round2", team: "team1" | "team2") => {
    const updated = { ...startingTeams, [round]: team };
    setStartingTeams(updated);
    localStorage.setItem(STARTING_TEAMS_KEY, JSON.stringify(updated));
  };

  const handleTimerSettingsChange = (setting: keyof TimerSettings, value: number) => {
    const updated = { ...timerSettings, [setting]: value };
    setTimerSettings(updated);
    localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(updated));
  };

  const handlePointsChange = (slot: number | "steal", value: string) => {
    const points = Math.max(0, Math.min(99, parseInt(value, 10) || 0));
    const updated: PointsSettings = slot === "steal"
      ? { ...pointsSettings, stealPoints: points }
      : {
          ...pointsSettings,
          cluePoints: pointsSettings.cluePoints.map((p, i) => (i === slot ? points : p)) as PointsSettings["cluePoints"],
        };
    setPointsSettings(updated);
    savePointsSettings(updated);
  };

  const handleShowScoresChange = (enabled: boolean) => {
    setShowScores(enabled);
    localStorage.setItem(SHOW_SCORES_KEY, enabled.toString());
  };

  const handleSkipIntroChange = (enabled: boolean) => {
    setSkipIntro(enabled);
    localStorage.setItem(SKIP_INTRO_KEY, enabled.toString());
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
    <div className="ok-page p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="ok-kicker">Build your puzzles</p>
            <h1 className="ok-title-3d mt-2 text-3xl md:text-4xl">Game Creator</h1>
          </div>
          <Link to="/" className="ok-btn ok-btn-light ok-btn-sm">
            Back to Home
          </Link>
        </div>

        {/* Compact Settings Bar */}
        <div className="ok-panel mb-8 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {/* Team Names - Compact */}
            <div>
              <label className="ok-label">Team 1</label>
              <input
                type="text"
                value={teamNames.team1}
                onChange={(e) => handleTeamNameChange("team1", e.target.value)}
                className="ok-input py-1.5 text-sm"
                placeholder="Team 1"
              />
            </div>
            <div>
              <label className="ok-label">Team 2</label>
              <input
                type="text"
                value={teamNames.team2}
                onChange={(e) => handleTeamNameChange("team2", e.target.value)}
                className="ok-input py-1.5 text-sm"
                placeholder="Team 2"
              />
            </div>
            {/* Timer Settings - Compact */}
            <div>
              <label className="ok-label">
                Guessing Time: {timerSettings.defaultGuessingTime >= 60
                  ? `${Math.floor(timerSettings.defaultGuessingTime / 60)}:${String(timerSettings.defaultGuessingTime % 60).padStart(2, '0')}`
                  : `${timerSettings.defaultGuessingTime}s`}
              </label>
              <input
                type="range"
                min="10"
                max="150"
                step="10"
                value={timerSettings.defaultGuessingTime}
                onChange={(e) => handleTimerSettingsChange("defaultGuessingTime", parseInt(e.target.value))}
                className="ok-range mt-2"
              />
            </div>
            <div>
              <label className="ok-label">
                Steal Time (other team): {timerSettings.defaultStealTime >= 60
                  ? `${Math.floor(timerSettings.defaultStealTime / 60)}:${String(timerSettings.defaultStealTime % 60).padStart(2, '0')}`
                  : `${timerSettings.defaultStealTime}s`}
              </label>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={timerSettings.defaultStealTime}
                onChange={(e) => handleTimerSettingsChange("defaultStealTime", parseInt(e.target.value))}
                className="ok-range mt-2"
              />
            </div>
            {/* Starting Teams */}
            <div>
              <label className="ok-label">R1 First Team</label>
              <select
                value={startingTeams.round1}
                onChange={(e) => handleStartingTeamChange("round1", e.target.value as "team1" | "team2")}
                className="ok-input py-1.5 text-sm"
              >
                <option value="team1">{teamNames.team1 ? teamNames.team1 : "Team 1"}</option>
                <option value="team2">{teamNames.team2 ? teamNames.team2 : "Team 2"}</option>
              </select>
            </div>
            <div>
              <label className="ok-label">R2 First Team</label>
              <select
                value={startingTeams.round2}
                onChange={(e) => handleStartingTeamChange("round2", e.target.value as "team1" | "team2")}
                className="ok-input py-1.5 text-sm"
              >
                <option value="team1">{teamNames.team1 ? teamNames.team1 : "Team 1"}</option>
                <option value="team2">{teamNames.team2 ? teamNames.team2 : "Team 2"}</option>
              </select>
            </div>
            <div>
              <span className="ok-label">Opening</span>
              <label className="ok-input flex h-[34px] items-center gap-2 py-0 text-sm">
                <input
                  type="checkbox"
                  checked={skipIntro}
                  onChange={(e) => handleSkipIntroChange(e.target.checked)}
                  className="h-4 w-4 accent-sky-500"
                />
                <span>Skip intro</span>
              </label>
            </div>
            <div>
              <span className="ok-label">Scores</span>
              <label className="ok-input flex h-[34px] items-center gap-2 py-0 text-sm">
                <input
                  type="checkbox"
                  checked={showScores}
                  onChange={(e) => handleShowScoresChange(e.target.checked)}
                  className="h-4 w-4 accent-sky-500"
                />
                <span>Show tally</span>
              </label>
            </div>
          </div>

          {/* Points per question */}
          <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2 border-t border-sky-100 pt-4">
            <div className="mr-2">
              <span className="ok-label">Points</span>
              <p className="text-xs text-slate-500">For a correct answer after…</p>
            </div>
            {pointsSettings.cluePoints.map((points, i) => (
              <label key={i} className="w-20">
                <span className="ok-label">{i + 1} clue{i === 0 ? "" : "s"}</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={points}
                  onChange={(e) => handlePointsChange(i, e.target.value)}
                  className="ok-input py-1.5 text-sm"
                />
              </label>
            ))}
            <label className="w-20">
              <span className="ok-label">Steal</span>
              <input
                type="number"
                min="0"
                max="99"
                value={pointsSettings.stealPoints}
                onChange={(e) => handlePointsChange("steal", e.target.value)}
                className="ok-input py-1.5 text-sm"
              />
            </label>
            <button
              onClick={() => {
                setPointsSettings(DEFAULT_POINTS);
                savePointsSettings(DEFAULT_POINTS);
              }}
              className="ok-btn ok-btn-light ok-btn-sm mb-0.5"
            >
              Reset 5·3·2·1
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Tile Selection */}
          <div>
            <h2 className="ok-heading-3d text-xl mb-5">Select Tile</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(tileMap).map((tile, index) => {
                const tileId = index + 1;
                const TileIcon = tile.Icon;
                return (
                  <button
                    key={tileId}
                    onClick={() => handleTileSelect(tileId)}
                    className={`ok-tile p-4 cursor-pointer ${selectedTile === tileId
                        ? "ring-4 ring-sky-300"
                        : ""
                      }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <TileIcon className="w-14 h-14 drop-shadow-[0_2px_3px_rgba(14,165,233,0.35)]" />
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700/80">{tile.symbol}</span>
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
                    className="ok-btn"
                  >
                    Save Puzzle
                  </button>
                </div>

                <div className="space-y-6">
                  <h2 className="ok-heading-3d text-xl">Edit Puzzle: {tileMap[selectedTile].symbol}</h2>

                  {/* Round 1: Connections */}
                  <div className="ok-panel p-5">
                    <h3 className="ok-kicker text-sm mb-4">Round 1: Connections</h3>
                    <div className="space-y-3 mb-3">
                      {currentPuzzle.round1.hints.map((hint, index) => {
                        const hintType = currentPuzzle.round1.hintTypes?.[index] || "text";
                        const hintFile = currentPuzzle.round1.hintFiles?.[index] || null;

                        return (
                          <div key={index} className="ok-inset p-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className="ok-label mb-0">
                                Hint {index + 1}
                              </label>
                              <select
                                value={hintType}
                                onChange={(e) => handleHintTypeChange(1, index, e.target.value as "text" | "image" | "audio")}
                                className="ok-input w-auto px-2 py-1 text-xs"
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
                                className="ok-input"
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
                                  className="ok-input"
                                />
                                {hintFile && (
                                  <img
                                    src={hintFile}
                                    alt={`Hint ${index + 1}`}
                                    className="max-w-full h-32 object-contain rounded-lg border border-sky-100 bg-white"
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
                                  className="ok-input"
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
                      <label className="ok-label mt-4">
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
                        className="ok-input"
                        placeholder="e.g., Things that are red"
                      />
                    </div>
                  </div>

                  {/* Round 2: Sequences */}
                  <div className="ok-panel p-5">
                    <h3 className="ok-kicker text-sm mb-4">Round 2: Sequences</h3>
                    <div className="space-y-3 mb-3">
                      {currentPuzzle.round2.hints.map((hint, index) => {
                        const hintType = currentPuzzle.round2.hintTypes?.[index] || "text";
                        const hintFile = currentPuzzle.round2.hintFiles?.[index] || null;

                        return (
                          <div key={index} className="ok-inset p-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className="ok-label mb-0">
                                Hint {index + 1}
                              </label>
                              <select
                                value={hintType}
                                onChange={(e) => handleHintTypeChange(2, index, e.target.value as "text" | "image" | "audio")}
                                className="ok-input w-auto px-2 py-1 text-xs"
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
                                className="ok-input"
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
                                  className="ok-input"
                                />
                                {hintFile && (
                                  <img
                                    src={hintFile}
                                    alt={`Hint ${index + 1}`}
                                    className="max-w-full h-32 object-contain rounded-lg border border-sky-100 bg-white"
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
                                  className="ok-input"
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
                      <label className="ok-label mt-4">
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
                        className="ok-input"
                        placeholder="e.g., Fibonacci sequence"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="ok-panel text-slate-500 text-center py-16">
                Select a tile to edit its puzzle
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
