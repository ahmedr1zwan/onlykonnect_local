import { useState } from "react";

interface TileButtonProps {
  symbol: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export function TileButton({ 
  symbol, 
  Icon, 
  onClick,
  isSelected = false,
  disabled = false
}: TileButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`
        aspect-[5/4] bg-gradient-to-br from-blue-950 to-blue-900 
        border-2 rounded-lg transition-all duration-300 group relative overflow-hidden
        ${isSelected 
          ? 'border-blue-400/60 opacity-50 cursor-not-allowed' 
          : 'border-blue-400/30 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20'
        }
        ${disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onMouseEnter={() => !disabled && !isSelected && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={disabled || isSelected}
      aria-label={symbol}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative h-full flex items-center justify-center">
        <Icon className={`w-32 h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 transition-transform duration-300 ${
          isHovered && !disabled && !isSelected ? 'scale-110' : 'scale-100'
        }`} />
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className={`text-base md:text-lg tracking-wider ${
          isSelected ? 'text-blue-200/40' : 'text-blue-200/60'
        }`}>
          {symbol}
        </span>
      </div>
    </button>
  );
}

