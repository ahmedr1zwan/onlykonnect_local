import { useEffect, useState, useRef } from "react";
import { TwoReeds, Lion, TwistedFlax, HornedViper, Water, EyeOfHorus } from "./Hieroglyphs";

const TIMER_SETTINGS_KEY = "onlyconnect_timer_settings";

interface TimerSettings {
  defaultGuessingTime: number;
  defaultStealTime: number;
}

interface TileRevealProps {
  tileId: number;
  round: 1 | 2;
  onClose: () => void;
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
    // Reset revealed hints - both rounds start with first hint revealed
    setRevealedHintIndices(new Set([0]));
    
    // Play gameplay music
    const audio = new Audio("/sounds/gameplayBedLong.mp3");
    audio.volume = sfxVolume;
    audio.loop = true;
    audio.play().catch((e) => console.error("Error playing gameplay music:", e));
    gameplayAudioRef.current = audio;
    
    return () => {
      if (gameplayAudioRef.current) {
        gameplayAudioRef.current.pause();
        gameplayAudioRef.current = null;
      }
    };
  }, [tileId, round, sfxVolume]);

  useEffect(() => {
    if (isTimerActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setShowStealControls(true);
            // Play timeUp sound when timer hits 0
            const audio = new Audio("/sounds/timeUp.mp3");
            audio.volume = sfxVolume;
            audio.play().catch((e) => console.error("Error playing timeUp sound:", e));
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
  }, [isTimerActive, time, sfxVolume]);

  const handlePauseResume = () => {
    setIsTimerActive(prev => !prev);
  };

  const handleReset = () => {
    setIsTimerActive(false);
    // Reset to default guessing time
    setTime(defaultGuessingTime);
    setShowStealControls(false);
    // Auto-start after reset
    setTimeout(() => {
      setIsTimerActive(true);
    }, 100);
  };

  const handleAdjustTime = (delta: number) => {
    if (!isTimerActive) {
      setTime(prev => Math.max(0, Math.min(60, prev + delta)));
    }
  };

  const handleWrongAnswer = () => {
    // If timer is paused (team buzzed in), set to steal time for other team to steal
    if (!isTimerActive && time > 0) {
      setTime(stealTime);
      setIsTimerActive(true);
    }
    // If timer reached 0, give other team a chance to steal
    else if (time === 0 && showStealControls) {
      setTime(stealTime);
      setIsTimerActive(true);
      setShowStealControls(false);
    }
  };

  const handleStartSteal = () => {
    // When timer reaches 0, allow other team to steal with custom time
    if (time === 0 && showStealControls) {
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
    }
  };

  // Determine what to show at the bottom
  // Only show puzzle/sequence name when host clicks "Reveal Answer"
  const isAllHintsRevealed = revealedHintIndices.size >= 4;

  const bottomText = isAnswerRevealed
    ? (round === 1 
        ? (puzzleName || `Round 1 : Connections`)
        : (sequenceName || `Round 2 : Sequences`))
    : (round === 1 ? `Round 1 : Connections` : `Round 2 : Sequences`);

  return (
    <div
      className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className="h-full w-full bg-gradient-to-br from-blue-950 to-blue-900 flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Done Button - Top Right */}
        <button
          onClick={() => {
            // Stop gameplay music when closing
            if (gameplayAudioRef.current) {
              gameplayAudioRef.current.pause();
              gameplayAudioRef.current = null;
            }
            onClose();
          }}
          className="absolute top-4 right-4 px-6 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 z-10 font-semibold"
          aria-label="Done"
        >
          Done
        </button>

        {/* Top Section - Hieroglyphic Name */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center pt-8 pb-2">
          <h1 className="text-white text-3xl font-bold tracking-wider">
            {tile.symbol}
          </h1>
        </div>

        {/* Divider */}
        <div className="flex-shrink-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-8" />

        {/* Timer - Just Above Hints */}
        <div className="flex-shrink-0 flex justify-center py-2 px-8">
          <div className="bg-gray-800/90 border-2 border-blue-400/30 rounded-lg px-6 py-4 flex flex-col items-center gap-3 w-full max-w-2xl">
            {/* Timer Progress Bar */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl font-bold ${
                  time <= 10 ? 'text-red-400' : 'text-white'
                }`}>
                  {time}s
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePauseResume}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
                    title={isTimerActive ? 'Pause timer' : 'Resume timer'}
                  >
                    {isTimerActive ? '⏸' : '▶'}
                  </button>
                  {!isTimerActive && time > 0 && (
                    <button
                      onClick={handleWrongAnswer}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors"
                      title="Wrong answer - resume for other team"
                    >
                      ✗
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-colors"
                    title="Reset to 40s"
                  >
                    ↻
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    time <= defaultGuessingTime / 4 ? 'bg-red-500' : time <= defaultGuessingTime / 2 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${(time / defaultGuessingTime) * 100}%` 
                  }}
                />
              </div>
            </div>
            
            {/* Steal Time Slider - Show when paused */}
            {!isTimerActive && time > 0 && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-600/50 w-full">
                <span className="text-white/70 text-sm">Steal Time:</span>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={stealTime}
                  onChange={(e) => setStealTime(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-white text-sm font-semibold min-w-[2.5rem] text-center">
                  {stealTime}s
                </span>
              </div>
            )}
            
            {/* Steal Controls - Show when timer reaches 0 */}
            {showStealControls && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-600/50 w-full">
                <span className="text-white/70 text-sm">Steal Time:</span>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={stealTime}
                  onChange={(e) => setStealTime(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-white text-sm font-semibold min-w-[2.5rem] text-center">
                  {stealTime}s
                </span>
                <button
                  onClick={handleStartSteal}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-semibold transition-colors"
                >
                  Start
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle Section - Grid of Hints (2x2 for both rounds) */}
        <div className="flex-1 flex items-center justify-center min-h-0 py-2">
          <div className="grid grid-cols-2 gap-4 max-w-5xl w-full h-full px-8 auto-rows-fr">
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
                  className={`bg-blue-900/50 border-2 rounded-lg p-6 flex items-center justify-center transition-all overflow-hidden min-h-0 ${
                    isClickable
                      ? 'border-blue-400/50 cursor-pointer hover:border-blue-400 hover:bg-blue-900/70'
                      : isRevealed
                      ? 'border-blue-400/30'
                      : 'border-blue-400/20 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isRevealed ? (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden min-h-0">
                      {hintType === "image" && hintFile ? (
                        <img
                          src={hintFile}
                          alt={`Hint ${index + 1}`}
                          className="max-w-full max-h-full w-auto h-auto object-contain"
                          style={{ maxHeight: 'calc(100% - 1rem)', maxWidth: 'calc(100% - 1rem)' }}
                        />
                      ) : hintType === "audio" && hintFile ? (
                        <audio
                          src={hintFile}
                          controls
                          className="w-full max-w-md"
                        />
                      ) : (
                        <p className="text-white text-xl text-center">
                          {isEmpty ? `Hint ${index + 1}` : hint}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/40 text-xl text-center">
                      {round === 2 && index === 3 ? "Final hint" : "Click to reveal"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex-shrink-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-8" />

        {/* Bottom Section - Round Name or Puzzle/Sequence Name with Reveal Answer Button */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center py-6 space-y-3">
          <p className="text-white/80 text-xl font-semibold tracking-wider">
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
                const audio = new Audio("/sounds/solveClue.mp3");
                audio.volume = sfxVolume;
                audio.play().catch((e) => console.error("Error playing solveClue sound:", e));
                setIsAnswerRevealed(true);
              }}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-base font-semibold transition-colors"
            >
              Reveal Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
