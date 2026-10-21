import { useCallback, useEffect, useState, useRef } from "react";
import { TwoReeds, Lion, TwistedFlax, HornedViper, Water, EyeOfHorus } from "./Hieroglyphs";
import { isMuted, registerAudio, unregisterAudio } from "../utils/audioManager";

const TIMER_SETTINGS_KEY = "onlyconnect_timer_settings";
const DEFAULT_TIMER_SETTINGS = { defaultGuessingTime: 40, defaultStealTime: 15 };
const TICK_MS = 100;

// Points for a correct answer, by how many clues were showing when the team buzzed
const CLUE_POINTS = [5, 3, 2, 1];
const STEAL_POINTS = 1;

type Team = "team1" | "team2";

/*
 * Question flow:
 *   guess  -> clock runs for the playing team; host hits Buzz when they buzz in
 *   buzzed -> clock stopped; host marks Correct (points) or Wrong (other team steals)
 *   steal  -> steal clock runs for the other team; host marks Correct (+1) or Wrong
 *   result -> points settled; host can undo, reveal the answer and finish
 * Running out of guess time goes straight to a steal; running out of steal time ends with no points.
 */
type Phase = "guess" | "buzzed" | "steal" | "result";

interface Outcome {
  team: Team | null;
  points: number;
  label: string;
}

interface TimerSettings {
  defaultGuessingTime: number;
  defaultStealTime: number;
}

interface TileRevealProps {
  tileId: number;
  round: 1 | 2;
  onClose: () => void;
  onAward?: (team: Team, points: number) => void;
  currentTeam?: Team;
  teamNames?: {
    team1: string;
    team2: string;
  };
  hints?: string[];
  hintTypes?: ("text" | "image" | "audio")[];
  hintFiles?: (string | null)[];
  puzzleName?: string;
  sequenceName?: string;
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

function loadTimerSettings(): TimerSettings {
  if (typeof window === "undefined") return DEFAULT_TIMER_SETTINGS;
  try {
    const stored = localStorage.getItem(TIMER_SETTINGS_KEY);
    return stored ? { ...DEFAULT_TIMER_SETTINGS, ...JSON.parse(stored) } : DEFAULT_TIMER_SETTINGS;
  } catch {
    return DEFAULT_TIMER_SETTINGS;
  }
}

// m:ss above a minute, plain seconds below
const formatTime = (seconds: number) => {
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${seconds}`;
};

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="ml-1 rounded-md bg-black/15 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold leading-none">
      {children}
    </kbd>
  );
}

export function TileReveal({
  tileId,
  round,
  onClose,
  onAward,
  currentTeam = "team1",
  teamNames = { team1: "1", team2: "2" },
  hints = [],
  hintTypes = [],
  hintFiles = [],
  puzzleName,
  sequenceName,
  sfxVolume = 0.7
}: TileRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [settings] = useState(loadTimerSettings);
  const [phase, setPhase] = useState<Phase>("guess");
  const [remainingMs, setRemainingMs] = useState(settings.defaultGuessingTime * 1000);
  const [isRunning, setIsRunning] = useState(true);
  // Bumped to restart the clock effect (e.g. Restart clock while already running)
  const [clockEpoch, setClockEpoch] = useState(0);
  // Bumped each time a running clock reaches zero
  const [timeUpCount, setTimeUpCount] = useState(0);
  const [buzzPoints, setBuzzPoints] = useState(CLUE_POINTS[0]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  // Both rounds start with first hint revealed, host clicks to reveal more
  const [revealedHintIndices, setRevealedHintIndices] = useState<Set<number>>(
    new Set([0])
  );
  const endAtRef = useRef<number | null>(null);
  const undoRef = useRef<{ phase: Phase; remainingMs: number } | null>(null);
  const gameplayAudioRef = useRef<HTMLAudioElement | null>(null);
  // Read volume through a ref so changing it mid-question doesn't restart anything
  const volumeRef = useRef(sfxVolume);
  volumeRef.current = sfxVolume;
  const tile = tileMap[tileId];

  const otherTeam: Team = currentTeam === "team1" ? "team2" : "team1";
  const nameOf = (team: Team) => teamNames[team] || (team === "team1" ? "1" : "2");
  const activeTeam: Team = phase === "steal" || (phase === "result" && outcome?.team === otherTeam)
    ? otherTeam
    : currentTeam;

  const playSound = useCallback((src: string) => {
    if (typeof window === "undefined" || isMuted()) return;
    const audio = new Audio(src);
    audio.volume = volumeRef.current;
    audio.play().catch((e) => console.error(`Error playing ${src}:`, e));
    registerAudio(audio);
  }, []);

  const stopMusic = useCallback(() => {
    if (gameplayAudioRef.current) {
      unregisterAudio(gameplayAudioRef.current);
      gameplayAudioRef.current.pause();
      gameplayAudioRef.current = null;
    }
  }, []);

  useEffect(() => {
    setIsVisible(true);

    // Play gameplay music
    if (!isMuted()) {
      const audio = new Audio("/sounds/gameplayBedLong.mp3");
      audio.volume = volumeRef.current;
      audio.loop = true;
      audio.play().catch((e) => console.error("Error playing gameplay music:", e));
      gameplayAudioRef.current = audio;
      registerAudio(audio);
    }

    return stopMusic;
  }, [tileId, round, stopMusic]);

  // Keep the music in step with the volume control
  useEffect(() => {
    if (gameplayAudioRef.current) gameplayAudioRef.current.volume = sfxVolume;
  }, [sfxVolume]);

  // Deadline-based clock: smooth display and no drift from re-created intervals
  useEffect(() => {
    if (!isRunning) {
      endAtRef.current = null;
      return;
    }
    endAtRef.current = performance.now() + remainingMs;
    const id = window.setInterval(() => {
      const left = Math.max(0, (endAtRef.current ?? 0) - performance.now());
      setRemainingMs(left);
      if (left === 0) {
        setIsRunning(false);
        setTimeUpCount((n) => n + 1);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
    // remainingMs is only the starting point when the clock (re)starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, clockEpoch]);

  const finish = useCallback((next: Outcome) => {
    undoRef.current = { phase, remainingMs };
    setIsRunning(false);
    setOutcome(next);
    setPhase("result");
    stopMusic();
    if (next.team) onAward?.(next.team, next.points);
  }, [phase, remainingMs, onAward, stopMusic]);

  const startSteal = useCallback(() => {
    setPhase("steal");
    setRemainingMs(settings.defaultStealTime * 1000);
    setIsRunning(true);
  }, [settings.defaultStealTime]);

  // Clock ran out (only fires on the transition, so Undo can sit at 0:00 safely)
  useEffect(() => {
    if (timeUpCount === 0) return;
    if (phase === "guess") {
      playSound("/sounds/timeUp.mp3");
      startSteal();
    } else if (phase === "steal") {
      playSound("/sounds/timeUp.mp3");
      finish({ team: null, points: 0, label: "Time's up · no points" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUpCount]);

  const revealedCount = revealedHintIndices.size;
  const pointsNow = CLUE_POINTS[Math.min(revealedCount, CLUE_POINTS.length) - 1];

  const handleBuzz = () => {
    setIsRunning(false);
    setBuzzPoints(pointsNow);
    setPhase("buzzed");
  };

  const handleResume = () => {
    setPhase("guess");
    setIsRunning(true);
  };

  const handleCorrect = () => {
    playSound("/sounds/solveClue.mp3");
    if (phase === "steal") {
      finish({ team: otherTeam, points: STEAL_POINTS, label: `Team ${nameOf(otherTeam)} steals ${STEAL_POINTS} point` });
    } else {
      finish({ team: currentTeam, points: buzzPoints, label: `Team ${nameOf(currentTeam)} scores ${buzzPoints} point${buzzPoints === 1 ? "" : "s"}` });
    }
  };

  const handleWrong = () => {
    if (phase === "steal") {
      finish({ team: null, points: 0, label: "No points this time" });
    } else {
      startSteal();
    }
  };

  const handleUndo = () => {
    const previous = undoRef.current;
    if (!previous) return;
    if (outcome?.team) onAward?.(outcome.team, -outcome.points);
    setOutcome(null);
    setPhase(previous.phase);
    // Back to the moment before judging, with the clock stopped so the host can re-decide
    setRemainingMs(previous.remainingMs);
    setIsRunning(false);
    undoRef.current = null;
  };

  const handleRestartClock = () => {
    setRemainingMs((phase === "steal" ? settings.defaultStealTime : settings.defaultGuessingTime) * 1000);
    if (phase === "buzzed") setPhase("guess");
    setIsRunning(true);
    setClockEpoch((n) => n + 1);
  };

  const revealAnswer = () => {
    stopMusic();
    playSound("/sounds/solveClue.mp3");
    // Show every clue alongside the answer
    setRevealedHintIndices(new Set(hints.map((_, i) => i).concat([0, 1, 2, 3])));
    setIsAnswerRevealed(true);
  };

  // Host keyboard shortcuts: Space = buzz / resume, C = correct, W = wrong
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === " ") {
        if (phase === "guess" && isRunning) handleBuzz();
        else if (phase === "buzzed") handleResume();
        else if (phase === "guess" || phase === "steal") setIsRunning(true);
        else return;
      } else if (key === "c" && (phase === "buzzed" || phase === "steal")) {
        handleCorrect();
      } else if (key === "w" && (phase === "buzzed" || phase === "steal")) {
        handleWrong();
      } else {
        return;
      }
      // Stop a focused button from also being "clicked" by the same key
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

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
      playSound("/sounds/solveClue.mp3");
    }
  };

  const isAllHintsRevealed = revealedHintIndices.size >= 4;
  const timerMaxMs = (phase === "steal" ? settings.defaultStealTime : settings.defaultGuessingTime) * 1000;
  const seconds = Math.ceil(remainingMs / 1000);
  const fraction = timerMaxMs > 0 ? remainingMs / timerMaxMs : 0;
  const ringColor = fraction <= 0.25 ? "#ef4444" : fraction <= 0.5 ? "#f59e0b" : "#0ea5e9";
  const RING_R = 52;
  const RING_C = 2 * Math.PI * RING_R;

  const bottomText = isAnswerRevealed
    ? (round === 1
      ? (puzzleName || `Round 1 : Connections`)
      : (sequenceName || `Round 2 : Sequences`))
    : (round === 1 ? `Round 1 : Connections` : `Round 2 : Sequences`);

  const status = {
    guess: isRunning
      ? `Clock running. Press Buzz when Team ${nameOf(currentTeam)} buzzes in.`
      : "Clock paused.",
    buzzed: `Team ${nameOf(currentTeam)} buzzed in. Were they right?`,
    steal: isRunning
      ? `Team ${nameOf(otherTeam)} can steal for ${STEAL_POINTS} point.`
      : `Steal clock paused.`,
    result: outcome?.label ?? "",
  }[phase];

  return (
    <div
      className={`fixed inset-0 bg-sky-50 z-50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
        }`}
    >
      <div className="ok-page h-full w-full flex flex-col relative overflow-hidden">
        {/* Done Button - Top Right */}
        <button
          onClick={() => {
            stopMusic();
            onClose();
          }}
          className={`ok-btn ${phase === "result" ? "" : "ok-btn-light"} absolute top-4 right-4 z-10`}
          aria-label="Done"
        >
          {phase === "result" ? "Next tile" : "Done"}
        </button>

        {/* Top Section - Hieroglyphic Name */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center pt-6 pb-3">
          <p className="ok-kicker">{round === 1 ? "Connections" : "Sequences"}</p>
          <h1 className="ok-title-3d mt-2 text-3xl md:text-4xl">
            {tile.symbol}
          </h1>
        </div>

        {/* Host timer panel */}
        <div className="flex-shrink-0 flex justify-center py-2 px-4 md:px-8">
          <div className="ok-panel flex w-full max-w-4xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
            {/* Countdown ring */}
            <div className="relative h-28 w-28 flex-shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r={RING_R} fill="none" stroke="#e0f2fe" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r={RING_R}
                  fill="none"
                  stroke={phase === "result" ? "#cbd5e1" : ringColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - fraction)}
                  style={{ transition: `stroke-dashoffset ${TICK_MS}ms linear, stroke 300ms ease` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-black tabular-nums leading-none ${phase !== "result" && fraction <= 0.25 ? "text-red-500" : "text-slate-800"}`}
                >
                  {formatTime(seconds)}
                </span>
                <span className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {isRunning ? "seconds" : phase === "result" ? "done" : "paused"}
                </span>
              </div>
            </div>

            {/* Who's playing + what to do */}
            <div className="min-w-[12rem] flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${phase === "steal" ? "bg-amber-100 text-amber-700" : phase === "result" ? "bg-slate-100 text-slate-600" : "bg-sky-100 text-sky-700"}`}
                >
                  {phase === "steal" ? "Steal" : phase === "result" ? "Result" : "Guessing"}
                </span>
                <span className="text-lg font-black text-slate-800">Team {nameOf(activeTeam)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{status}</p>
              {(phase === "guess" || phase === "buzzed") && (
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-600">
                  {phase === "buzzed"
                    ? `Buzzed on clue ${CLUE_POINTS.indexOf(buzzPoints) + 1} · worth ${buzzPoints}`
                    : `Clue ${revealedCount} showing · worth ${pointsNow}`}
                </p>
              )}
            </div>

            {/* Actions for the current step */}
            <div className="flex flex-wrap items-center gap-3">
              {phase === "guess" && (
                <>
                  {isRunning ? (
                    <button onClick={handleBuzz} className="ok-btn ok-btn-amber px-8 py-4 text-lg">
                      Buzz · stop clock <Kbd>Space</Kbd>
                    </button>
                  ) : (
                    <button onClick={() => setIsRunning(true)} className="ok-btn px-6 py-4">
                      Resume clock <Kbd>Space</Kbd>
                    </button>
                  )}
                </>
              )}

              {(phase === "buzzed" || phase === "steal") && (
                <>
                  <button onClick={handleCorrect} className="ok-btn ok-btn-green px-6 py-4">
                    Correct · +{phase === "steal" ? STEAL_POINTS : buzzPoints} <Kbd>C</Kbd>
                  </button>
                  <button onClick={handleWrong} className="ok-btn ok-btn-red px-6 py-4">
                    {phase === "steal" ? "Wrong" : `Wrong · Team ${nameOf(otherTeam)} steals`} <Kbd>W</Kbd>
                  </button>
                </>
              )}

              {phase === "result" && (
                <>
                  {!isAnswerRevealed && (
                    <button onClick={revealAnswer} className="ok-btn ok-btn-green px-6 py-4">
                      Reveal answer
                    </button>
                  )}
                  <button onClick={handleUndo} className="ok-btn ok-btn-light ok-btn-sm" title="Undo the last decision and its points">
                    Undo
                  </button>
                </>
              )}
            </div>

            {/* Secondary clock controls */}
            {phase !== "result" && (
              <div className="flex w-full flex-wrap items-center justify-end gap-2 border-t border-sky-100 pt-3 text-xs">
                {phase === "buzzed" ? (
                  <button onClick={handleResume} className="ok-btn ok-btn-light ok-btn-sm">
                    False buzz · resume clock
                  </button>
                ) : (
                  isRunning && (
                    <button onClick={() => setIsRunning(false)} className="ok-btn ok-btn-light ok-btn-sm">
                      Pause
                    </button>
                  )
                )}
                {phase === "steal" && !isRunning && (
                  <button onClick={() => setIsRunning(true)} className="ok-btn ok-btn-light ok-btn-sm">
                    Resume <Kbd>Space</Kbd>
                  </button>
                )}
                <button onClick={handleRestartClock} className="ok-btn ok-btn-light ok-btn-sm" title="Put the full time back on the clock">
                  Restart clock
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

        {/* Bottom Section - Round Name or Puzzle/Sequence Name */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center py-6 space-y-3">
          <p className={isAnswerRevealed ? "ok-title-3d text-2xl md:text-3xl text-center" : "ok-heading-3d text-xl"}>
            {bottomText}
          </p>
          {phase !== "result" && isAllHintsRevealed && !isAnswerRevealed && (
            <button onClick={revealAnswer} className="ok-btn ok-btn-light ok-btn-sm">
              Reveal answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
