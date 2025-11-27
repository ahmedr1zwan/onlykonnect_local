interface HieroglyphProps {
  className?: string;
}

export function TwoReeds({ className = "" }: HieroglyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#60a5fa" strokeWidth="3" strokeLinecap="round">
        {/* Left reed */}
        <line x1="35" y1="75" x2="35" y2="25" />
        <line x1="35" y1="30" x2="30" y2="20" />
        <line x1="35" y1="30" x2="40" y2="20" />
        
        {/* Right reed */}
        <line x1="65" y1="75" x2="65" y2="25" />
        <line x1="65" y1="30" x2="60" y2="20" />
        <line x1="65" y1="30" x2="70" y2="20" />
      </g>
    </svg>
  );
}

export function Lion({ className = "" }: HieroglyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Lion body - horizontal rectangle */}
        <path d="M 30 45 L 75 45 L 75 58 L 30 58" fill="none" strokeWidth="3" />
        
        {/* Head and neck curve */}
        <path d="M 30 45 Q 20 45 15 48 Q 12 52 15 56 Q 18 58 22 58 L 30 58" fill="none" strokeWidth="3" />
        
        {/* Mane - series of bumps on top */}
        <circle cx="18" cy="42" r="2.5" fill="#60a5fa" />
        <circle cx="24" cy="40" r="2.5" fill="#60a5fa" />
        <circle cx="30" cy="39" r="2.5" fill="#60a5fa" />
        <circle cx="36" cy="39" r="2.5" fill="#60a5fa" />
        <circle cx="42" cy="40" r="2.5" fill="#60a5fa" />
        
        {/* Face details */}
        <circle cx="16" cy="52" r="1.5" fill="#60a5fa" />
        <line x1="20" y1="54" x2="26" y2="54" strokeWidth="2" />
        
        {/* Chest/shoulder detail */}
        <path d="M 30 48 Q 32 50 30 52" fill="none" strokeWidth="2" />
        
        {/* Legs */}
        <line x1="35" y1="58" x2="35" y2="70" strokeWidth="3" />
        <line x1="45" y1="58" x2="45" y2="70" strokeWidth="3" />
        <line x1="60" y1="58" x2="60" y2="70" strokeWidth="3" />
        <line x1="70" y1="58" x2="70" y2="70" strokeWidth="3" />
        
        {/* Paws */}
        <line x1="33" y1="70" x2="37" y2="70" strokeWidth="3" strokeLinecap="round" />
        <line x1="43" y1="70" x2="47" y2="70" strokeWidth="3" strokeLinecap="round" />
        <line x1="58" y1="70" x2="62" y2="70" strokeWidth="3" strokeLinecap="round" />
        <line x1="68" y1="70" x2="72" y2="70" strokeWidth="3" strokeLinecap="round" />
        
        {/* Tail - curved upward */}
        <path d="M 75 52 Q 82 52 85 45 Q 86 42 84 40" fill="none" strokeWidth="3" />
        <circle cx="84" cy="39" r="2.5" fill="#60a5fa" />
      </g>
    </svg>
  );
}

export function TwistedFlax({ className = "" }: HieroglyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Top loop */}
        <ellipse cx="50" cy="20" rx="5" ry="7" strokeWidth="3" />
        
        {/* Twisted rope - figure 8 pattern stacked vertically */}
        {/* First twist */}
        <path d="M 45 27 Q 40 32 40 37 Q 40 42 45 47" strokeWidth="3" />
        <path d="M 55 27 Q 60 32 60 37 Q 60 42 55 47" strokeWidth="3" />
        <path d="M 45 27 Q 50 30 55 27" strokeWidth="3" />
        <path d="M 45 47 Q 50 44 55 47" strokeWidth="3" />
        
        {/* Second twist */}
        <path d="M 45 47 Q 40 52 40 57 Q 40 62 45 67" strokeWidth="3" />
        <path d="M 55 47 Q 60 52 60 57 Q 60 62 55 67" strokeWidth="3" />
        <path d="M 45 67 Q 50 64 55 67" strokeWidth="3" />
        
        {/* Third twist */}
        <path d="M 45 67 Q 40 72 40 77 Q 40 82 45 87" strokeWidth="3" />
        <path d="M 55 67 Q 60 72 60 77 Q 60 82 55 87" strokeWidth="3" />
        <path d="M 45 87 Q 50 84 55 87" strokeWidth="3" />
      </g>
    </svg>
  );
}

export function HornedViper({ className = "" }: HieroglyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Viper body - serpentine curve */}
        <path d="M 15 65 Q 25 50 35 52 Q 45 54 50 60 Q 55 66 60 62 Q 68 56 75 58" 
              fill="#60a5fa" fillOpacity="0.2" strokeWidth="6" />
        
        {/* Head - more triangular/pointed */}
        <path d="M 75 58 L 88 56 L 85 62 Z" fill="#60a5fa" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="2" />
        
        {/* Horns - distinctive feature */}
        <path d="M 82 56 L 82 48 L 80 45" fill="none" strokeWidth="2" />
        <path d="M 86 57 L 88 49 L 90 46" fill="none" strokeWidth="2" />
        
        {/* Eye */}
        <circle cx="83" cy="58" r="1.5" fill="#60a5fa" />
        
        {/* Body markings/scales */}
        <line x1="30" y1="52" x2="32" y2="48" strokeWidth="1.5" />
        <line x1="40" y1="54" x2="42" y2="50" strokeWidth="1.5" />
        <line x1="50" y1="60" x2="52" y2="56" strokeWidth="1.5" />
        <line x1="60" y1="62" x2="62" y2="58" strokeWidth="1.5" />
        <line x1="68" y1="58" x2="70" y2="54" strokeWidth="1.5" />
        
        {/* Tail end */}
        <circle cx="15" cy="65" r="3" fill="#60a5fa" fillOpacity="0.3" />
      </g>
    </svg>
  );
}

export function Water({ className = "" }: HieroglyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" fill="none">
        {/* Water waves */}
        <path d="M 15 40 Q 25 35 35 40 Q 45 45 55 40 Q 65 35 75 40 Q 85 45 95 40" />
        <path d="M 15 52 Q 25 47 35 52 Q 45 57 55 52 Q 65 47 75 52 Q 85 57 95 52" />
        <path d="M 15 64 Q 25 59 35 64 Q 45 69 55 64 Q 65 59 75 64 Q 85 69 95 64" />
      </g>
    </svg>
  );
}

export function EyeOfHorus({ className = "" }: HieroglyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Eye outline */}
        <path d="M 20 50 Q 35 35 50 35 Q 65 35 80 50" fill="none" strokeWidth="3" />
        <path d="M 20 50 Q 35 60 50 60 Q 65 60 80 50" fill="none" strokeWidth="3" />
        {/* Pupil */}
        <circle cx="50" cy="47" r="8" fill="#60a5fa" fillOpacity="0.5" />
        {/* Eye markings */}
        <path d="M 80 50 Q 85 55 82 60" fill="none" strokeWidth="2" />
        <path d="M 50 60 L 50 75" strokeWidth="2" />
        <path d="M 50 75 Q 45 77 42 75" fill="none" strokeWidth="2" />
      </g>
    </svg>
  );
}

