import { useEffect, useState, useRef } from "react";
import { TwoReeds, Lion, TwistedFlax, HornedViper, Water, EyeOfHorus } from "./Hieroglyphs";

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
  revealedHints = 0
}: TileRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [time, setTime] = useState(40);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [stealTime, setStealTime] = useState(15);
  const [showStealControls, setShowStealControls] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  // Both rounds start with first hint revealed, host clicks to reveal more
  const [revealedHintIndices, setRevealedHintIndices] = useState<Set<number>>(
    new Set([0]) // Both rounds start with first hint revealed
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tile = tileMap[tileId];

  useEffect(() => {
    setIsVisible(true);
    // Start timer automatically when component mounts
    setIsTimerActive(true);
    setTime(40);
    setShowStealControls(false);
    setIsAnswerRevealed(false);
    // Reset revealed hints - both rounds start with first hint revealed
    setRevealedHintIndices(new Set([0]));
  }, [tileId, round]);

  useEffect(() => {
    if (isTimerActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setShowStealControls(true);
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
  }, [isTimerActive, time]);

  const handlePauseResume = () => {
    setIsTimerActive(prev => !prev);
  };

  const handleReset = () => {
    setIsTimerActive(false);
    setTime(40);
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
    // If timer is paused (team buzzed in), set to 15s for other team to steal
    if (!isTimerActive && time > 0) {
      setTime(15);
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
          onClick={onClose}
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
        <div className="flex-shrink-0 flex justify-center py-2">
          <div className="bg-gray-800/90 border-2 border-blue-400/30 rounded-lg px-6 py-3 flex flex-col items-center gap-3">
            {/* Main Timer Display */}
            <div className="flex items-center gap-4">
              {/* Time adjustment controls - only when paused */}
              {!isTimerActive && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleAdjustTime(5)}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                    title="Add 5 seconds"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => handleAdjustTime(-5)}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                    title="Subtract 5 seconds"
                  >
                    -5
                  </button>
                </div>
              )}
              
              <span className={`text-4xl font-bold min-w-[5rem] text-center ${
                time <= 10 ? 'text-red-400' : 'text-white'
              }`}>
                {time}s
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={handlePauseResume}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
                  title={isTimerActive ? 'Pause timer' : 'Resume timer'}
                >
                  {isTimerActive ? '⏸' : '▶'}
                </button>
                {!isTimerActive && time > 0 && (
                  <button
                    onClick={handleWrongAnswer}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors"
                    title="Wrong answer - resume for other team"
                  >
                    ✗
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-colors"
                  title="Reset to 40s"
                >
                  ↻
                </button>
              </div>
            </div>
            
            {/* Steal Controls - Show when timer reaches 0 */}
            {showStealControls && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-600/50 w-full">
                <span className="text-white/70 text-xs">Steal:</span>
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
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-semibold transition-colors"
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
              onClick={() => setIsAnswerRevealed(true)}
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
