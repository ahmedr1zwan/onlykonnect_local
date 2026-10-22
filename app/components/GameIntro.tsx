import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { isMuted, registerAudio, unregisterAudio } from "../utils/audioManager";
import {
  EyeOfHorus,
  HornedViper,
  Lion,
  TwistedFlax,
  TwoReeds,
  Water,
} from "./Hieroglyphs";
import { OnlyConnectFractal } from "./OnlyConnectFractal";

const INTRO_DURATION_MS = 12000;
const AUDIO_FADE_MS = 800;
const TITLE = "OnlyKonnect";

// angle: seat on the 3D carousel. gx/gy: column/row in the final 3x2 board.
const introTiles = [
  { id: 1, symbol: "Two Reeds", Icon: TwoReeds, angle: -120, gx: -1, gy: -1 },
  { id: 2, symbol: "Lion", Icon: Lion, angle: 180, gx: 0, gy: -1 },
  { id: 3, symbol: "Twisted Flax", Icon: TwistedFlax, angle: 120, gx: 1, gy: -1 },
  { id: 4, symbol: "Horned Viper", Icon: HornedViper, angle: -60, gx: -1, gy: 1 },
  { id: 5, symbol: "Water", Icon: Water, angle: 0, gx: 0, gy: 1 },
  { id: 6, symbol: "Eye of Horus", Icon: EyeOfHorus, angle: 60, gx: 1, gy: 1 },
];

interface GameIntroProps {
  onComplete: () => void;
  sfxVolume: number;
}

export function GameIntro({ onComplete, sfxVolume }: GameIntroProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  // Read through a ref so a volume change doesn't restart the intro music
  const volumeRef = useRef(sfxVolume);
  volumeRef.current = sfxVolume;
  // Same for the callback: a new function from the parent mustn't restart the intro
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasCompletedRef = useRef(false);

  const completeIntro = useCallback(() => {
    if (hasCompletedRef.current) return;

    hasCompletedRef.current = true;

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }

    if (audioRef.current) {
      unregisterAudio(audioRef.current);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    onCompleteRef.current();
  }, []);

  useEffect(() => {
    timerRef.current = window.setTimeout(completeIntro, INTRO_DURATION_MS);

    if (!isMuted()) {
      const audio = new Audio("/sounds/openingTitlesWithFlurry.mp3");
      audio.volume = volumeRef.current;
      audioRef.current = audio;
      registerAudio(audio);

      audio.addEventListener("ended", completeIntro);
      audio.play().catch((e) => console.error("Error playing opening music:", e));

      // The track runs longer than the visuals, so fade it out with the titles.
      const fadeStart = performance.now() + INTRO_DURATION_MS - AUDIO_FADE_MS;
      const fadeOut = () => {
        if (audioRef.current !== audio) return;
        const progress = (performance.now() - fadeStart) / AUDIO_FADE_MS;
        if (progress >= 0) audio.volume = volumeRef.current * Math.max(0, 1 - progress);
        if (progress < 1) fadeTimerRef.current = window.setTimeout(fadeOut, 50);
      };
      fadeTimerRef.current = window.setTimeout(fadeOut, INTRO_DURATION_MS - AUDIO_FADE_MS);
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }

      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", completeIntro);
        unregisterAudio(audioRef.current);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [completeIntro]);

  return (
    <div
      className="ok-intro fixed inset-0 z-[9000] overflow-hidden text-slate-800"
      style={{ "--ok-intro-duration": `${INTRO_DURATION_MS}ms` } as CSSProperties}
      onDoubleClick={completeIntro}
      aria-label="OnlyKonnect opening titles. Double click to skip."
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0%,transparent_45%),linear-gradient(165deg,#f7fbff_0%,#e3f2fe_50%,#cbe6fb_100%)]" />
      <div className="ok-intro-floor" />
      <div className="ok-intro-flurry absolute inset-0" />

      <div className="ok-intro-stage absolute inset-0">
        <div className="ok-intro-scene">
          <div className="ok-intro-ring">
            <div className="ok-intro-portal">
              <OnlyConnectFractal className="ok-intro-fractal" />
            </div>

            {introTiles.map(({ id, symbol, Icon, angle, gx, gy }, i) => (
              <div
                key={id}
                className="ok-intro-slot"
                style={
                  {
                    "--a": `${angle}deg`,
                    "--sx": Math.sin((angle * Math.PI) / 180).toFixed(4),
                    "--cz": Math.cos((angle * Math.PI) / 180).toFixed(4),
                    "--gx": gx,
                    "--gy": gy,
                    "--i": i,
                  } as CSSProperties
                }
                aria-label={symbol}
              >
                <div className="ok-intro-card">
                  <div className="ok-intro-face ok-intro-face-front">
                    <div className="absolute inset-[7%] rounded-md border border-sky-300/40" />
                    <Icon className="relative h-[62%] w-[62%] drop-shadow-[0_2px_6px_rgba(14,165,233,0.35)]" />
                  </div>
                  <div className="ok-intro-face ok-intro-face-back" />
                  <div className="ok-intro-edge ok-intro-edge-x ok-intro-edge-left" />
                  <div className="ok-intro-edge ok-intro-edge-x ok-intro-edge-right" />
                  <div className="ok-intro-edge ok-intro-edge-y ok-intro-edge-top" />
                  <div className="ok-intro-edge ok-intro-edge-y ok-intro-edge-bottom" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ok-intro-shade pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
        <p className="ok-intro-kicker text-sm font-bold uppercase tracking-[0.42em] text-sky-600 md:text-base">
          Welcome to
        </p>
        <h1
          className="ok-intro-word ok-title-3d mt-3 whitespace-nowrap text-[clamp(1.75rem,9vw,4.5rem)]"
          aria-label={TITLE}
        >
          {TITLE.split("").map((letter, i) => (
            <span
              key={i}
              className="ok-intro-letter"
              style={{ "--i": i } as CSSProperties}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
        </h1>
        <div className="ok-intro-rule mt-6 h-px w-72 max-w-[70vw] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
      </div>

      <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/50">
          Double click to skip
        </p>
      </div>
    </div>
  );
}
