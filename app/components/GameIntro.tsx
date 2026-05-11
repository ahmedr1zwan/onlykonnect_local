import { useCallback, useEffect, useRef } from "react";
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

const INTRO_DURATION_MS = 21450;

const introTiles = [
  { id: 1, symbol: "Two Reeds", Icon: TwoReeds, className: "ok-intro-tile-1" },
  { id: 2, symbol: "Lion", Icon: Lion, className: "ok-intro-tile-2" },
  { id: 3, symbol: "Twisted Flax", Icon: TwistedFlax, className: "ok-intro-tile-3" },
  { id: 4, symbol: "Horned Viper", Icon: HornedViper, className: "ok-intro-tile-4" },
  { id: 5, symbol: "Water", Icon: Water, className: "ok-intro-tile-5" },
  { id: 6, symbol: "Eye of Horus", Icon: EyeOfHorus, className: "ok-intro-tile-6" },
];

interface GameIntroProps {
  onComplete: () => void;
  sfxVolume: number;
}

export function GameIntro({ onComplete, sfxVolume }: GameIntroProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  const completeIntro = useCallback(() => {
    if (hasCompletedRef.current) return;

    hasCompletedRef.current = true;

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (audioRef.current) {
      unregisterAudio(audioRef.current);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    onComplete();
  }, [onComplete]);

  useEffect(() => {
    timerRef.current = window.setTimeout(completeIntro, INTRO_DURATION_MS);

    if (!isMuted()) {
      const audio = new Audio("/sounds/openingTitlesWithFlurry.mp3");
      audio.volume = sfxVolume;
      audioRef.current = audio;
      registerAudio(audio);

      audio.addEventListener("ended", completeIntro);
      audio.play().catch((e) => console.error("Error playing opening music:", e));
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", completeIntro);
        unregisterAudio(audioRef.current);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [completeIntro, sfxVolume]);

  return (
    <div
      className="ok-intro fixed inset-0 z-[9000] overflow-hidden bg-slate-950 text-white"
      onDoubleClick={completeIntro}
      aria-label="OnlyKonnect opening titles. Double click to skip."
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.34),transparent_42%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#1e3a8a_100%)]" />
      <div className="ok-intro-scan absolute inset-0 opacity-40" />
      <div className="ok-intro-flurry absolute inset-0" />

      <OnlyConnectFractal className="ok-intro-fractal absolute left-1/2 top-1/2 h-[min(110vw,110vh)] w-[min(110vw,110vh)] -translate-x-1/2 -translate-y-1/2 opacity-20" />

      <div className="ok-intro-stage relative z-10 flex h-full items-center justify-center px-4">
        <div className="ok-intro-tile-field relative aspect-square w-[min(88vw,72vh)] max-w-[760px]">
          {introTiles.map(({ id, symbol, Icon, className }) => (
            <div
              key={id}
              className={`ok-intro-card ${className} absolute left-1/2 top-1/2 flex aspect-[5/4] w-[32%] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-lg border border-sky-300/45 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 shadow-2xl shadow-blue-950/60`}
              aria-label={symbol}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(125,211,252,0.4),transparent_28%)] opacity-80" />
              <div className="absolute inset-[7%] rounded-md border border-sky-200/20" />
              <Icon className="relative h-[62%] w-[62%] drop-shadow-[0_0_16px_rgba(96,165,250,0.75)]" />
            </div>
          ))}

          <div className="ok-intro-title absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.42em] text-sky-200/80 md:text-base">
              Welcome to
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase tracking-[0.16em] text-white drop-shadow-[0_0_28px_rgba(125,211,252,0.85)] md:text-7xl">
              OnlyKonnect
            </h1>
            <div className="mx-auto mt-5 h-px w-72 max-w-[70vw] bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-100/45">
          Double click to skip
        </p>
      </div>
    </div>
  );
}
