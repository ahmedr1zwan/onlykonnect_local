import { useState, useRef } from "react";
import { isMuted, registerAudio } from "../utils/audioManager";

interface TileButtonProps {
  symbol: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
  sfxVolume?: number;
}

export function TileButton({ 
  symbol, 
  Icon, 
  onClick,
  isSelected = false,
  disabled = false,
  sfxVolume = 0.7
}: TileButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedSoundRef = useRef(false);

  return (
    <button
      className={`ok-tile @container aspect-[5/4] group
        ${isSelected || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onMouseMove={(e) => {
        if (disabled || isSelected) return;
        // Tilt the slab toward the cursor and move the glare with it
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const style = e.currentTarget.style;
        style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
        style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
        style.setProperty("--gx", `${x * 100}%`);
        style.setProperty("--gy", `${y * 100}%`);
      }}
      onMouseEnter={() => {
        if (!disabled && !isSelected) {
          setIsHovered(true);
          // Play hover sound only once per hover
          if (!hasPlayedSoundRef.current && typeof window !== "undefined" && !isMuted()) {
            const audio = new Audio("/sounds/hoverButtonSound.mp3");
            audio.volume = sfxVolume;
            audio.play().catch((e) => console.error("Error playing hover sound:", e));
            hoverSoundRef.current = audio;
            hasPlayedSoundRef.current = true;
            registerAudio(audio);
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty("--rx", "0deg");
        e.currentTarget.style.setProperty("--ry", "0deg");
        setIsHovered(false);
        hasPlayedSoundRef.current = false;
        if (hoverSoundRef.current) {
          hoverSoundRef.current = null;
        }
      }}
      onClick={onClick}
      disabled={disabled || isSelected}
      aria-label={symbol}
    >
      <div className="ok-tile-glare" />
      <div className="absolute inset-[6%] rounded-xl border border-sky-200/70 pointer-events-none" />

      <div className="relative h-full flex items-center justify-center">
        <Icon className={`w-[44cqw] h-[44cqw] drop-shadow-[0_3px_4px_rgba(14,165,233,0.35)] transition-transform duration-300 ${
          isHovered && !disabled && !isSelected ? 'scale-110' : 'scale-100'
        }`} />
      </div>
      
      <div className="absolute bottom-[5cqw] left-0 right-0 text-center">
        <span className="text-[clamp(0.625rem,4cqw,0.875rem)] font-bold uppercase tracking-[0.2em] text-sky-700/70">
          {symbol}
        </span>
      </div>
    </button>
  );
}

