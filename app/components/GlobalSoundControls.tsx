import { useState, useEffect, useRef } from "react";
import { setPlayingVolume, stopAllAudio } from "../utils/audioManager";

const MUTE_STATE_KEY = "onlyconnect_mute_state";
const SFX_VOLUME_KEY = "onlyconnect_sfx_volume";
const PREVIEW_SOUND = "/sounds/hoverButtonSound.mp3";

function SpeakerIcon({ muted, level }: { muted: boolean; level: number }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
      {muted ? (
        <path strokeLinecap="round" d="M16 9l5 6m0-6l-5 6" />
      ) : (
        <>
          {level > 0 && <path strokeLinecap="round" d="M15.536 8.464a5 5 0 010 7.072" />}
          {level > 0.5 && <path strokeLinecap="round" d="M18.364 5.636a9 9 0 010 12.728" />}
        </>
      )}
    </svg>
  );
}

// One always-visible control: tap the speaker to mute, drag to set the volume.
export function GlobalSoundControls() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(MUTE_STATE_KEY) === "true";
    }
    return false;
  });

  const [sfxVolume, setSfxVolume] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SFX_VOLUME_KEY);
      return stored ? parseFloat(stored) : 0.7;
    }
    return 0.7;
  });

  const previewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem(MUTE_STATE_KEY, isMuted.toString());
    if (isMuted) stopAllAudio();
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem(SFX_VOLUME_KEY, sfxVolume.toString());
    setPlayingVolume(sfxVolume);
    // Same-tab listeners (the storage event only fires in other tabs)
    window.dispatchEvent(new Event("sfxVolumeChanged"));
  }, [sfxVolume]);

  const changeVolume = (volume: number) => {
    setSfxVolume(volume);
    // Moving the slider is a clear sign the host wants sound on
    if (isMuted && volume > 0) setIsMuted(false);
  };

  // A short blip after adjusting so the host can hear the new level
  const playPreview = () => {
    if (isMuted || sfxVolume === 0) return;
    previewRef.current?.pause();
    const audio = new Audio(PREVIEW_SOUND);
    audio.volume = sfxVolume;
    audio.play().catch(() => {});
    previewRef.current = audio;
  };

  const percent = Math.round(sfxVolume * 100);
  const effectiveLevel = isMuted ? 0 : sfxVolume;

  return (
    <div
      className="ok-panel fixed top-4 left-4 z-[10000] flex items-center gap-2 rounded-2xl py-1.5 pl-1.5 pr-3"
      role="group"
      aria-label="Sound"
    >
      <button
        onClick={() => setIsMuted((m) => !m)}
        className={`ok-btn ok-btn-icon ${isMuted ? "ok-btn-red" : "ok-btn-light"}`}
        aria-pressed={isMuted}
        aria-label={isMuted ? "Unmute sound" : "Mute sound"}
        title={isMuted ? "Sound is off. Click to turn it on" : "Click to mute all sound"}
      >
        <SpeakerIcon muted={isMuted} level={sfxVolume} />
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={sfxVolume}
        onChange={(e) => changeVolume(parseFloat(e.target.value))}
        onPointerUp={playPreview}
        onKeyUp={playPreview}
        className={`ok-range w-24 md:w-28 ${isMuted ? "opacity-40" : ""}`}
        aria-label="Volume"
        title="Volume"
      />
      <span className="w-10 text-right text-xs font-black tabular-nums text-slate-600">
        {effectiveLevel === 0 ? "Off" : `${percent}%`}
      </span>
    </div>
  );
}
