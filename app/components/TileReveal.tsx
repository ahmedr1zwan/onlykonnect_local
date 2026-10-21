import { useEffect, useState, useRef } from "react";
import { TwoReeds, Lion, TwistedFlax, HornedViper, Water, EyeOfHorus } from "./Hieroglyphs";
import { isMuted, registerAudio, unregisterAudio } from "../utils/audioManager";

const TIMER_SETTINGS_KEY = "onlyconnect_timer_settings";

interface TimerSettings {
  defaultGuessingTime: number;
  defaultStealTime: number;
}

interface TileRevealProps {
  tileId: number;
  round: 1 | 2;
  onClose: () => void;
  currentTeam?: "team1" | "team2";
  teamNames?: {
    team1: string;
    team2: string;
  };
  hints?: string[];
  hintTypes?: ("text" | "image" | "audio")[];
  hintFiles?: (string | null)[];
  puzzleName?: string;
  sequenceName?: string;
  revealedHints?: number; // Track how many hints have been revealed
  sfxVolume?: number; // Sound effects volume
}

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

export function TileReveal({
  tileId,
  round,
  onClose,
  currentTeam = "team1",
  teamNames = { team1: "1", team2: "2" },
  hints = [],
  hintTypes = [],
  hintFiles = [],
  puzzleName,
  sequenceName,
  revealedHints = 0,
  sfxVolume = 0.7
}: TileRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [defaultGuessingTime, setDefaultGuessingTime] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(TIMER_SETTINGS_KEY);
      const settings: TimerSettings = stored ? JSON.parse(stored) : { defaultGuessingTime: 40, defaultStealTime: 15 };
      return settings.defaultGuessingTime;
    }
    return 40;
  });
  const [time, setTime] = useState(defaultGuessingTime);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [stealTime, setStealTime] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(TIMER_SETTINGS_KEY);
      const settings: TimerSettings = stored ? JSON.parse(stored) : { defaultGuessingTime: 40, defaultStealTime: 15 };
      return settings.defaultStealTime;
    }
    return 15;
  });
  const [showStealControls, setShowStealControls] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timerMode, setTimerMode] = useState<"guess" | "steal">("guess");
  const [activeTeam, setActiveTeam] = useState<"team1" | "team2">(currentTeam);
  // Both rounds start with first hint revealed, host clicks to reveal more
  const [revealedHintIndices, setRevealedHintIndices] = useState<Set<number>>(
    new Set([0]) // Both rounds start with first hint revealed
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameplayAudioRef = useRef<HTMLAudioElement | null>(null);
  const tile = tileMap[tileId];

  useEffect(() => {
    setIsVisible(true);
    // Load timer settings
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(TIMER_SETTINGS_KEY);
      const settings: TimerSettings = stored ? JSON.parse(stored) : { defaultGuessingTime: 40, defaultStealTime: 15 };
      setDefaultGuessingTime(settings.defaultGuessingTime);
      setTime(settings.defaultGuessingTime);
      setStealTime(settings.defaultStealTime);
    } else {
      setDefaultGuessingTime(40);
      setTime(40);
      setStealTime(15);
    }
    // Start timer automatically when component mounts
    setIsTimerActive(true);
    setShowStealControls(false);
    setIsAnswerRevealed(false);
    setTimerMode("guess");
    setActiveTeam(currentTeam);
    // Reset revealed hints - both rounds start with first hint revealed
    setRevealedHintIndices(new Set([0]));

    // Play gameplay music
    if (!isMuted()) {
      const audio = new Audio("/sounds/gameplayBedLong.mp3");
      audio.volume = sfxVolume;
      audio.loop = true;
      audio.play().catch((e) => console.error("Error playing gameplay music:", e));
      gameplayAudioRef.current = audio;
      registerAudio(audio);
    }

    return () => {
      if (gameplayAudioRef.current) {
        unregisterAudio(gameplayAudioRef.current);
        gameplayAudioRef.current.pause();
        gameplayAudioRef.current = null;
      }
    };
  }, [tileId, round, sfxVolume, currentTeam]);

  useEffect(() => {
    if (isTimerActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            if (timerMode === "guess") {
              setShowStealControls(true);
              setActiveTeam(currentTeam === "team1" ? "team2" : "team1");
            }
            // Play timeUp sound when timer hits 0
            if (!isMuted()) {
              const audio = new Audio("/sounds/timeUp.mp3");
              audio.volume = sfxVolume;
              audio.play().catch((e) => console.error("Error playing timeUp sound:", e));
              registerAudio(audio);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerActive, time, sfxVolume, timerMode, currentTeam]);

  const handlePauseResume = () => {
    setIsTimerActive(prev => !prev);
  };

  const handleReset = () => {
    setIsTimerActive(false);
    // Reset to default guessing time
    setTime(defaultGuessingTime);
    setTimerMode("guess");
    setActiveTeam(currentTeam);
    setShowStealControls(false);
    // Auto-start after reset
    setTimeout(() => {
      setIsTimerActive(true);
    }, 100);
  };

  const handleAdjustTime = (delta: number) => {
    if (!isTimerActive) {
      setTime(prev => Math.max(0, Math.min(150, prev + delta)));
    }
  };

  // Helper function to format time as m:ss when above 60 seconds
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const handleWrongAnswer = () => {
    if (timerMode === "steal") return;

    setTimerMode("steal");
    setActiveTeam(currentTeam === "team1" ? "team2" : "team1");
    setTime(stealTime);
    setIsTimerActive(true);
    setShowStealControls(false);
  };

  const handleStartSteal = () => {
    // When timer reaches 0, allow other team to steal with custom time
    if (time === 0 && showStealControls) {
      setTimerMode("steal");
      setActiveTeam(currentTeam === "team1" ? "team2" : "team1");
      setTime(stealTime);
      setIsTimerActive(true);
      setShowStealControls(false);
    }
  };

  if (!tile) return null;

  // Use provided hints or fallback to placeholders
  const defaultHints = [
    "Hint 1",
    "Hint 2",
    "Hint 3",
    "Hint 4",
  ];
  const allHints = hints.length > 0 ? hints : defaultHints;

  // Both rounds show all 4 hints in 2x2 grid
  const displayHints = allHints;

  // Round 2: Can't reveal last hint (index 3) until the end
  // Round 1: Can reveal all hints
  const canRevealHint = (index: number) => {
    if (round === 2 && index === 3) {
      // Last hint in Round 2 can only be revealed if all other hints are revealed
      return revealedHintIndices.size >= 3;
    }
    // Can reveal if previous hint is revealed (or it's the first one)
    return index === 0 || revealedHintIndices.has(index - 1);
  };

  const handleHintClick = (index: number) => {
    // Only allow revealing if conditions are met
    if (canRevealHint(index) && !revealedHintIndices.has(index)) {
      setRevealedHintIndices(new Set([...revealedHintIndices, index]));
      // Play sound when hint is revealed
      if (typeof window !== "undefined" && !isMuted()) {
        const audio = new Audio("/sounds/solveClue.mp3");
        audio.volume = sfxVolume;
        audio.play().catch((e) => console.error("Error playing hint reveal sound:", e));
        registerAudio(audio);
      }
    }
  };

  // Determine what to show at the bottom
  // Only show puzzle/sequence name when host clicks "Reveal Answer"
  const isAllHintsRevealed = revealedHintIndices.size >= 4;
  const timerMax = timerMode === "steal" ? stealTime : defaultGuessingTime;
  const activeTeamName = teamNames[activeTeam] || (activeTeam === "team1" ? "1" : "2");
  const opposingTeam = currentTeam === "team1" ? "team2" : "team1";
  const opposingTeamName = teamNames[opposingTeam] || (opposingTeam === "team1" ? "1" : "2");

  const bottomText = isAnswerRevealed
    ? (round === 1
      ? (puzzleName || `Round 1 : Connections`)
      : (sequenceName || `Round 2 : Sequences`))
    : (round === 1 ? `Round 1 : Connections` : `Round 2 : Sequences`);

  return (
    <div
      className={`fixed inset-0 bg-sky-50 z-50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
        }`}
      onClick={onClose}
    >
      <div
        className="ok-page h-full w-full flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Done Button - Top Right */}
        <button
          onClick={() => {
            // Stop gameplay music when closing
            if (gameplayAudioRef.current) {
              unregisterAudio(gameplayAudioRef.current);
              gameplayAudioRef.current.pause();
              gameplayAudioRef.current = null;
            }
            onClose();
          }}
          className="ok-btn ok-btn-light absolute top-4 right-4 z-10"
          aria-label="Done"
        >
          Done
        </button>

        {/* Top Section - Hieroglyphic Name */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center pt-6 pb-3">
          <p className="ok-kicker">{round === 1 ? "Connections" : "Sequences"}</p>
          <h1 className="ok-title-3d mt-2 text-3xl md:text-4xl">
            {tile.symbol}
          </h1>
        </div>

        {/* Timer - Just Above Hints */}
        <div className="flex-shrink-0 flex justify-center py-2 px-8">
          <div className="ok-panel px-6 py-4 flex flex-col items-center gap-3 w-full max-w-2xl">
            {/* Timer Progress Bar */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className={`text-3xl font-black tabular-nums ${time <= 10 ? 'text-red-500' : 'text-sky-600'
                    }`}>
                    {formatTime(time)}
                  </span>
                  <p className="ok-label mb-0">
                    Team {activeTeamName} {timerMode === "steal" ? "steal" : "guess"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePauseResume}
                    className="ok-btn ok-btn-sm min-w-[2.75rem]"
                    title={isTimerActive ? 'Pause timer' : 'Resume timer'}
                  >
                    {isTimerActive ? '⏸' : '▶'}
                  </button>
                  {!isTimerActive && time > 0 && (
                    <button
                      onClick={handleWrongAnswer}
                      disabled={timerMode === "steal"}
                      className="ok-btn ok-btn-red ok-btn-sm"
                      title={timerMode === "steal" ? "No further steal after steal attempt" : `Wrong answer - Team ${opposingTeamName} steals`}
                    >
                      Wrong
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="ok-btn ok-btn-light ok-btn-sm min-w-[2.75rem]"
                    title="Reset to 40s"
                  >
                    ↻
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="ok-inset w-full h-4 rounded-full overflow-hidden p-0">
                <div
                  className={`h-full ${isTimerActive ? 'transition-all duration-1000 ease-linear' : 'transition-none'} ${time <= timerMax / 4 ? 'bg-gradient-to-b from-red-300 to-red-500' : time <= timerMax / 2 ? 'bg-gradient-to-b from-amber-200 to-amber-400' : 'bg-gradient-to-b from-sky-300 to-sky-500'
                    } rounded-full`}
                  style={{
                    width: `${(time / timerMax) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Steal Time Slider - Show when paused */}
            {!isTimerActive && time > 0 && timerMode === "guess" && (
              <div className="flex items-center gap-3 pt-3 border-t border-sky-100 w-full">
                <span className="text-slate-600 text-sm">
                  If Team {activeTeamName} is wrong, Team {opposingTeamName} gets:
                </span>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={stealTime}
                  onChange={(e) => setStealTime(Number(e.target.value))}
                  className="ok-range flex-1"
                />
                <span className="text-sky-700 text-sm font-bold tabular-nums min-w-[3rem] text-center">
                  {formatTime(stealTime)}
                </span>
              </div>
            )}

            {/* Steal Controls - Show when timer reaches 0 */}
            {showStealControls && (
              <div className="flex items-center gap-3 pt-3 border-t border-sky-100 w-full">
                <span className="text-slate-600 text-sm">
                  Team {opposingTeamName} steal time:
                </span>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={stealTime}
                  onChange={(e) => setStealTime(Number(e.target.value))}
                  className="ok-range flex-1"
                />
                <span className="text-sky-700 text-sm font-bold tabular-nums min-w-[3rem] text-center">
                  {formatTime(stealTime)}
                </span>
                <button
                  onClick={handleStartSteal}
                  className="ok-btn ok-btn-amber ok-btn-sm"
                >
                  Start Steal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle Section - Grid of Hints (2x2 for both rounds) */}
        <div className="flex-1 flex items-center justify-center min-h-0 py-2">
          <div className="grid grid-cols-2 gap-6 max-w-5xl w-full h-full px-8 py-2 auto-rows-fr">
            {displayHints.map((hint, index) => {
              const isRevealed = revealedHintIndices.has(index);
              const isEmpty = !hint || hint.trim() === "";
              const isClickable = !isRevealed && canRevealHint(index);
              const hintType = hintTypes[index] || "text";
              const hintFile = hintFiles[index];

              return (
                <div
                  key={index}
                  onClick={() => isClickable && handleHintClick(index)}
                  className={`ok-flip min-h-0 ${isRevealed ? 'is-flipped' : ''} ${isClickable
                    ? 'cursor-pointer'
                    : isRevealed
                      ? ''
                      : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <div className="ok-flip-inner">
                    {/* Face-down side */}
                    <div className={`ok-flip-face ok-flip-back transition-transform ${isClickable ? 'hover:-translate-y-1' : ''}`}>
                      <p className="ok-kicker text-sky-600/80">
                        {round === 2 && index === 3 ? "Final hint" : isClickable ? "Click to reveal" : `Hint ${index + 1}`}
                      </p>
                    </div>

                    {/* Revealed side */}
                    <div className="ok-flip-face ok-flip-front">
                      {isRevealed && (hintType === "image" && hintFile ? (
                        <img
                          src={hintFile}
                          alt={`Hint ${index + 1}`}
                          className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                        />
                      ) : hintType === "audio" && hintFile ? (
                        <audio
                          src={hintFile}
                          controls
                          className="w-full max-w-md"
                        />
                      ) : (
                        <p className="text-slate-800 text-xl md:text-2xl font-semibold text-center">
                          {isEmpty ? `Hint ${index + 1}` : hint}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ok-rule flex-shrink-0 mx-8" />

        {/* Bottom Section - Round Name or Puzzle/Sequence Name with Reveal Answer Button */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center py-6 space-y-3">
          <p className={isAnswerRevealed ? "ok-title-3d text-2xl md:text-3xl text-center" : "ok-heading-3d text-xl"}>
            {bottomText}
          </p>
          {isAllHintsRevealed && !isAnswerRevealed && (
            <button
              onClick={() => {
                // Stop gameplay music
                if (gameplayAudioRef.current) {
                  gameplayAudioRef.current.pause();
                  gameplayAudioRef.current = null;
                }
                // Play solveClue sound
                if (!isMuted()) {
                  const audio = new Audio("/sounds/solveClue.mp3");
                  audio.volume = sfxVolume;
                  audio.play().catch((e) => console.error("Error playing solveClue sound:", e));
                  registerAudio(audio);
                }
                setIsAnswerRevealed(true);
              }}
              className="ok-btn ok-btn-green"
            >
              Reveal Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
