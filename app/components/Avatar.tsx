// Mii-inspired avatars drawn entirely in SVG from a small config of part
// indices, so they cost nothing to store and need no image uploads.

export interface AvatarConfig {
  face: number;
  skin: number;
  hair: number;
  hairColor: number;
  eyes: number;
  eyeColor: number;
  brows: number;
  nose: number;
  mouth: number;
  facialHair: number;
  glasses: number;
  shirt: number;
}

export const SKIN_TONES = ["#FFE3CC", "#F9D2AE", "#EFBE92", "#DCA46C", "#C68642", "#A8693D", "#8D5524", "#5C3A1E"];
export const HAIR_COLORS = ["#1F1A17", "#3B2A20", "#6B4226", "#A0522D", "#C68E3F", "#E6C27A", "#B8B8B8", "#F4F1EA", "#C0392B", "#7C6CF0"];
export const EYE_COLORS = ["#2B2B2B", "#5A3B2E", "#2E6DA4", "#3B7D4F"];
export const SHIRT_COLORS = ["#38BDF8", "#0EA5E9", "#F87171", "#FBBF24", "#4ADE80", "#A78BFA", "#F472B6", "#FB923C", "#94A3B8", "#334155"];

export const FACE_SHAPES = ["Round", "Oval", "Square", "Pointed"];
export const HAIR_STYLES = ["Bald", "Buzz", "Short", "Spiky", "Side part", "Bob", "Long", "Bun", "Ponytail", "Curly", "Afro"];
export const EYE_STYLES = ["Round", "Dots", "Happy", "Sleepy", "Wide", "Wink"];
export const BROW_STYLES = ["None", "Thin", "Thick", "Angled", "Raised"];
export const NOSE_STYLES = ["None", "Dot", "Button", "Line"];
export const MOUTH_STYLES = ["Smile", "Grin", "Flat", "Surprised", "Smirk"];
export const FACIAL_HAIR_STYLES = ["None", "Moustache", "Beard", "Goatee"];
export const GLASSES_STYLES = ["None", "Round", "Square", "Shades"];

// How many choices each part has, used by the editor and for random avatars
export const PART_COUNTS: Record<keyof AvatarConfig, number> = {
  face: FACE_SHAPES.length,
  skin: SKIN_TONES.length,
  hair: HAIR_STYLES.length,
  hairColor: HAIR_COLORS.length,
  eyes: EYE_STYLES.length,
  eyeColor: EYE_COLORS.length,
  brows: BROW_STYLES.length,
  nose: NOSE_STYLES.length,
  mouth: MOUTH_STYLES.length,
  facialHair: FACIAL_HAIR_STYLES.length,
  glasses: GLASSES_STYLES.length,
  shirt: SHIRT_COLORS.length,
};

export const DEFAULT_AVATAR: AvatarConfig = {
  face: 0, skin: 1, hair: 2, hairColor: 2, eyes: 0, eyeColor: 0,
  brows: 1, nose: 1, mouth: 0, facialHair: 0, glasses: 0, shirt: 0,
};

export function randomAvatar(random: () => number = Math.random): AvatarConfig {
  const pick = (part: keyof AvatarConfig) => Math.floor(random() * PART_COUNTS[part]);
  return {
    face: pick("face"),
    skin: pick("skin"),
    hair: pick("hair"),
    hairColor: pick("hairColor"),
    eyes: pick("eyes"),
    eyeColor: pick("eyeColor"),
    brows: pick("brows"),
    nose: pick("nose"),
    mouth: pick("mouth"),
    // Keep extras occasional so random line-ups don't all wear glasses and beards
    facialHair: random() < 0.25 ? 1 + Math.floor(random() * 3) : 0,
    glasses: random() < 0.3 ? 1 + Math.floor(random() * 3) : 0,
    shirt: pick("shirt"),
  };
}

// Repairs configs from storage (missing fields or out-of-range values)
export function normalizeAvatar(value: unknown): AvatarConfig {
  const source = (value && typeof value === "object" ? value : {}) as Partial<Record<keyof AvatarConfig, unknown>>;
  const result = { ...DEFAULT_AVATAR };
  (Object.keys(PART_COUNTS) as (keyof AvatarConfig)[]).forEach((part) => {
    const n = Number(source[part]);
    if (Number.isInteger(n) && n >= 0 && n < PART_COUNTS[part]) result[part] = n;
  });
  return result;
}

function shade(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor)));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

const LINE = "#3F3A36";

function Head({ shape, fill }: { shape: number; fill: string }) {
  switch (shape) {
    case 1:
      return <ellipse cx="50" cy="48" rx="24" ry="30" fill={fill} />;
    case 2:
      return <rect x="24" y="20" width="52" height="57" rx="17" fill={fill} />;
    case 3:
      return <path d="M24 44 Q24 18 50 18 Q76 18 76 44 Q76 64 50 79 Q24 64 24 44Z" fill={fill} />;
    default:
      return <ellipse cx="50" cy="48" rx="26" ry="28" fill={fill} />;
  }
}

// Parts of each hair style drawn behind the head (long hair, buns, afros)
function HairBack({ style, fill }: { style: number; fill: string }) {
  switch (style) {
    case 5:
      return <path d="M20 40 Q20 10 50 10 Q80 10 80 40 L80 72 Q70 76 62 72 L38 72 Q30 76 20 72Z" fill={fill} />;
    case 6:
      return <path d="M18 40 Q18 8 50 8 Q82 8 82 40 L84 100 Q66 104 60 96 L40 96 Q34 104 16 100Z" fill={fill} />;
    case 7:
      return <circle cx="50" cy="10" r="10" fill={fill} />;
    case 8:
      return <path d="M70 24 Q94 30 86 72 Q84 82 77 77 Q82 50 68 36Z" fill={fill} />;
    case 10:
      return <circle cx="50" cy="40" r="34" fill={fill} />;
    default:
      return null;
  }
}

// Fringe and crown drawn over the forehead
function HairFront({ style, fill }: { style: number; fill: string }) {
  switch (style) {
    case 1:
      return <path d="M23 44 Q22 16 50 15 Q78 16 77 44 Q72 30 50 29 Q28 30 23 44Z" fill={fill} />;
    case 2:
      return <path d="M22 46 Q20 12 50 12 Q80 12 78 46 Q76 34 68 30 Q58 34 44 30 Q32 32 22 46Z" fill={fill} />;
    case 3:
      return (
        <path
          d="M22 44 L19 26 L28 30 L27 13 L38 22 L44 7 L50 20 L57 7 L62 22 L73 13 L72 30 L81 26 L78 44 Q72 30 50 30 Q28 30 22 44Z"
          fill={fill}
        />
      );
    case 4:
      return <path d="M22 48 Q20 12 50 12 Q80 13 78 46 Q74 32 66 28 Q52 37 36 30 Q28 34 22 48Z" fill={fill} />;
    case 5:
      return <path d="M22 44 Q20 12 50 12 Q80 12 78 44 Q70 33 50 35 Q30 33 22 44Z" fill={fill} />;
    case 6:
      return <path d="M22 46 Q20 12 50 12 Q80 12 78 46 Q70 26 52 30 Q40 36 22 46Z" fill={fill} />;
    case 7:
    case 8:
      return <path d="M23 44 Q22 15 50 14 Q78 15 77 44 Q70 30 50 30 Q30 30 23 44Z" fill={fill} />;
    case 9:
      return (
        <g fill={fill}>
          {[
            [27, 36], [32, 24], [42, 17], [54, 16], [64, 21], [72, 32],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="10" />
          ))}
        </g>
      );
    case 10:
      return <path d="M20 46 Q16 10 50 8 Q84 10 80 46 Q74 30 50 32 Q26 30 20 46Z" fill={fill} />;
    default:
      return null;
  }
}

function Eyes({ style, color }: { style: number; color: string }) {
  const arc = (x: number) => (
    <path d={`M${x - 4} 51 Q${x} 46 ${x + 4} 51`} stroke={LINE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
  );
  const round = (x: number) => (
    <g key={x}>
      <ellipse cx={x} cy="50" rx="4" ry="5" fill={color} />
      <circle cx={x + 1.4} cy="48.3" r="1.4" fill="#fff" />
    </g>
  );
  switch (style) {
    case 1:
      return <g fill={color}><circle cx="40" cy="50" r="2.8" /><circle cx="60" cy="50" r="2.8" /></g>;
    case 2:
      return <>{arc(40)}{arc(60)}</>;
    case 3:
      return (
        <g>
          {[40, 60].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="51" rx="4" ry="3" fill={color} />
              <path d={`M${x - 5} 49 L${x + 5} 49`} stroke={LINE} strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
        </g>
      );
    case 4:
      return (
        <g>
          {[40, 60].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="50" rx="5.5" ry="6" fill="#fff" stroke={LINE} strokeWidth="0.8" />
              <circle cx={x} cy="50.5" r="3" fill={color} />
              <circle cx={x + 1.2} cy="49" r="1.1" fill="#fff" />
            </g>
          ))}
        </g>
      );
    case 5:
      return <>{round(40)}{arc(60)}</>;
    default:
      return <>{round(40)}{round(60)}</>;
  }
}

function Brows({ style, color }: { style: number; color: string }) {
  const paths: Record<number, [string, string, number]> = {
    1: ["M35 42 Q40 39.5 45 42", "M55 42 Q60 39.5 65 42", 1.6],
    2: ["M35 42 Q40 38.5 45 41.5", "M55 41.5 Q60 38.5 65 42", 3.4],
    3: ["M35 40 L45 43", "M55 43 L65 40", 2.6],
    4: ["M35 41 Q40 35.5 45 39.5", "M55 39.5 Q60 35.5 65 41", 2.2],
  };
  const brow = paths[style];
  if (!brow) return null;
  return (
    <g stroke={color} strokeWidth={brow[2]} strokeLinecap="round" fill="none">
      <path d={brow[0]} />
      <path d={brow[1]} />
    </g>
  );
}

function Nose({ style, skin }: { style: number; skin: string }) {
  switch (style) {
    case 1:
      return <ellipse cx="50" cy="58" rx="2" ry="1.5" fill={shade(skin, 0.72)} />;
    case 2:
      return <circle cx="50" cy="57.5" r="3.2" fill={shade(skin, 0.88)} stroke={shade(skin, 0.75)} strokeWidth="0.8" />;
    case 3:
      return (
        <path d="M50 53 L47.5 59.5 L51.5 59.5" stroke={shade(skin, 0.65)} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      );
    default:
      return null;
  }
}

function Mouth({ style }: { style: number }) {
  switch (style) {
    case 1:
      return (
        <g>
          <path d="M41 64 Q50 76 59 64 Z" fill="#8B2E2E" />
          <path d="M42.5 64.5 L57.5 64.5 L56.5 67 L43.5 67 Z" fill="#fff" />
        </g>
      );
    case 2:
      return <path d="M44 67 L56 67" stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />;
    case 3:
      return <ellipse cx="50" cy="67" rx="3.2" ry="3.8" fill="#8B2E2E" />;
    case 4:
      return <path d="M43 67 Q52 70 58 63" stroke={LINE} strokeWidth="2.2" fill="none" strokeLinecap="round" />;
    default:
      return <path d="M42 65 Q50 72 58 65" stroke={LINE} strokeWidth="2.2" fill="none" strokeLinecap="round" />;
  }
}

function FacialHair({ style, color, layer }: { style: number; color: string; layer: "under" | "over" }) {
  if (layer === "under" && style === 2) {
    return (
      <path
        d="M24 50 Q25 77 50 81 Q75 77 76 50 Q72 64 63 65 Q57 70 50 70 Q43 70 37 65 Q28 64 24 50Z"
        fill={color}
      />
    );
  }
  if (layer === "over" && (style === 1 || style === 2)) {
    return <path d="M41 63 Q45.5 59 50 61 Q54.5 59 59 63 Q54.5 65 50 63.5 Q45.5 65 41 63Z" fill={color} />;
  }
  if (layer === "over" && style === 3) {
    return <path d="M45 71 Q50 80 55 71 Q50 73.5 45 71Z" fill={color} />;
  }
  return null;
}

function Glasses({ style }: { style: number }) {
  const frame = { stroke: "#334155", strokeWidth: 1.8 };
  switch (style) {
    case 1:
      return (
        <g fill="rgba(255,255,255,0.15)" {...frame}>
          <circle cx="40" cy="50" r="7.5" />
          <circle cx="60" cy="50" r="7.5" />
          <path d="M47.5 49.5 Q50 47.5 52.5 49.5" fill="none" />
        </g>
      );
    case 2:
      return (
        <g fill="rgba(255,255,255,0.15)" {...frame}>
          <rect x="31.5" y="44" width="17" height="12" rx="2.5" />
          <rect x="51.5" y="44" width="17" height="12" rx="2.5" />
          <path d="M48.5 49 L51.5 49" />
        </g>
      );
    case 3:
      return (
        <g fill="#1E293B" {...frame}>
          <path d="M31 45 L49 45 L47.5 53 Q40 57 33 53 Z" />
          <path d="M51 45 L69 45 L67 53 Q60 57 52.5 53 Z" />
          <path d="M49 46 L51 46" />
          <path d="M34 47 L38 47" stroke="rgba(255,255,255,0.45)" />
        </g>
      );
    default:
      return null;
  }
}

interface AvatarProps {
  config: AvatarConfig;
  className?: string;
  // "head" crops in for small thumbnails
  crop?: "full" | "head";
  title?: string;
}

export function Avatar({ config, className = "", crop = "full", title }: AvatarProps) {
  const c = normalizeAvatar(config);
  const skin = SKIN_TONES[c.skin];
  const hair = HAIR_COLORS[c.hairColor];
  const shirt = SHIRT_COLORS[c.shirt];
  const viewBox = crop === "head" ? "10 2 80 90" : "0 0 100 120";

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={title ?? "Avatar"}>
      {title && <title>{title}</title>}
      <HairBack style={c.hair} fill={hair} />
      {/* Shoulders and shirt */}
      <path d="M16 120 Q16 92 50 87 Q84 92 84 120 Z" fill={shirt} />
      <path d="M41 88 L50 99 L59 88" fill={shade(shirt, 0.8)} />
      <rect x="44" y="72" width="12" height="17" rx="5" fill={shade(skin, 0.92)} />
      {/* Ears, then face */}
      <ellipse cx="24.5" cy="51" rx="5" ry="7" fill={shade(skin, 0.95)} />
      <ellipse cx="75.5" cy="51" rx="5" ry="7" fill={shade(skin, 0.95)} />
      <Head shape={c.face} fill={skin} />
      <ellipse cx="35" cy="61" rx="5" ry="3" fill="#F28B82" opacity="0.28" />
      <ellipse cx="65" cy="61" rx="5" ry="3" fill="#F28B82" opacity="0.28" />
      <FacialHair style={c.facialHair} color={hair} layer="under" />
      <Eyes style={c.eyes} color={EYE_COLORS[c.eyeColor]} />
      <Brows style={c.brows} color={shade(hair, 0.85)} />
      <Nose style={c.nose} skin={skin} />
      <Mouth style={c.mouth} />
      <FacialHair style={c.facialHair} color={hair} layer="over" />
      <Glasses style={c.glasses} />
      <HairFront style={c.hair} fill={hair} />
    </svg>
  );
}
