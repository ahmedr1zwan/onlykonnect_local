import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Avatar } from "./Avatar";
import { isMuted, registerAudio } from "../utils/audioManager";
import type { Lineup, Person } from "../utils/lineup";

type Team = "team1" | "team2";
type Slide = { kind: "host" } | { kind: "team"; team: Team };

const SLIDES: Slide[] = [{ kind: "host" }, { kind: "team", team: "team1" }, { kind: "team", team: "team2" }];

interface TeamIntroProps {
  lineup: Lineup;
  teamNames: Record<Team, string>;
  sfxVolume: number;
  onComplete: () => void;
}

function Contestant({ person, label, index, large = false }: { person: Person; label: string; index: number; large?: boolean }) {
  return (
    <div className="ok-lineup-member flex flex-col items-center" style={{ "--i": index } as CSSProperties}>
      <div
        className={`ok-avatar-disc ${large ? "h-[min(46vw,18rem)] w-[min(46vw,18rem)]" : "h-[min(26vw,12rem)] w-[min(26vw,12rem)]"}`}
      >
        <Avatar config={person.avatar} className="h-full w-full" title={person.name} />
      </div>
      <div
        className="ok-lineup-plate ok-panel mt-4 min-w-[8rem] max-w-[14rem] px-4 py-2 text-center"
        style={{ "--i": index } as CSSProperties}
      >
        <p className="ok-label mb-0">{label}</p>
        <p className={`truncate font-black text-slate-800 ${large ? "text-2xl" : "text-lg md:text-xl"}`}>
          {person.name || "—"}
        </p>
      </div>
    </div>
  );
}

// Plays after the opening titles: host card, then each team's line-up, like the show
export function TeamIntro({ lineup, teamNames, sfxVolume, onComplete }: TeamIntroProps) {
  const [index, setIndex] = useState(0);
  const volumeRef = useRef(sfxVolume);
  volumeRef.current = sfxVolume;
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const next = useCallback(() => {
    if (isLast) onComplete();
    else setIndex((i) => i + 1);
  }, [isLast, onComplete]);

  // A little sting as each card arrives
  useEffect(() => {
    if (isMuted()) return;
    const audio = new Audio("/sounds/solveClue.mp3");
    audio.volume = volumeRef.current;
    audio.play().catch(() => {});
    registerAudio(audio);
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" && index > 0) {
        setIndex((i) => i - 1);
      } else if (e.key === "Escape") {
        onComplete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, index, onComplete]);

  const teamName = (team: Team) => teamNames[team] || (team === "team1" ? "Team 1" : "Team 2");

  return (
    <div
      className="ok-page fixed inset-0 z-[9000] flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Team introductions"
    >
      <div className="ok-floor" />

      <button onClick={onComplete} className="ok-btn ok-btn-light ok-btn-sm absolute right-4 top-4 z-10">
        Skip intros
      </button>

      {/* Remount per slide so the entrance animations replay */}
      <div key={index} className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-8 px-4 pt-16">
        <div className="ok-lineup-title text-center">
          <p className="ok-kicker">
            {slide.kind === "host" ? "Your host tonight" : index === 1 ? "Introducing" : "And facing them"}
          </p>
          <h1 className="ok-title-3d mt-3 text-[clamp(2rem,7vw,4.5rem)] leading-none">
            {slide.kind === "host" ? lineup.host.name || "Host" : teamName(slide.team)}
          </h1>
        </div>

        {slide.kind === "host" ? (
          <Contestant person={lineup.host} label="Quizmaster" index={0} large />
        ) : (
          <div className="flex flex-wrap items-end justify-center gap-[clamp(1rem,4vw,3.5rem)]">
            {lineup[slide.team].map((player, i) => (
              <Contestant key={i} person={player} label={i === 0 ? "Captain" : "Player"} index={i} />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-[1] flex items-center justify-center gap-6 pb-8 pt-4">
        <div className="flex gap-2" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-sky-500" : "w-2.5 bg-sky-200"}`}
            />
          ))}
        </div>
        <button onClick={next} className="ok-btn">
          {isLast ? "Start the game" : "Next"}
          <kbd className="ml-1 rounded-md bg-black/15 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold leading-none">Space</kbd>
        </button>
      </div>
    </div>
  );
}
