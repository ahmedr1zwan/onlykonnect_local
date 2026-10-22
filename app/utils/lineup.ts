// Host and team line-ups (names + avatars), edited in the Game Creator and
// shown in the team introductions and on the scoreboard.
import { normalizeAvatar, type AvatarConfig } from "../components/Avatar";

export const LINEUP_KEY = "onlyconnect_lineup";
export const TEAM_INTRO_KEY = "onlyconnect_team_intro";
export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 4;

export interface Person {
  name: string;
  avatar: AvatarConfig;
}

export interface Lineup {
  host: Person;
  team1: Person[];
  team2: Person[];
}

const preset = (values: Partial<AvatarConfig>): AvatarConfig => normalizeAvatar(values);

// Fixed (not random) defaults so the server and browser render the same thing
export const DEFAULT_LINEUP: Lineup = {
  host: {
    name: "Host",
    avatar: preset({ face: 1, skin: 2, hair: 4, hairColor: 1, eyes: 0, brows: 2, nose: 3, mouth: 4, glasses: 1, shirt: 9 }),
  },
  team1: [
    { name: "Player 1", avatar: preset({ face: 0, skin: 1, hair: 3, hairColor: 0, eyes: 0, brows: 1, nose: 1, mouth: 1, shirt: 0 }) },
    { name: "Player 2", avatar: preset({ face: 1, skin: 4, hair: 7, hairColor: 2, eyes: 4, eyeColor: 1, brows: 4, nose: 2, mouth: 0, shirt: 0 }) },
    { name: "Player 3", avatar: preset({ face: 2, skin: 0, hair: 2, hairColor: 5, eyes: 2, eyeColor: 2, brows: 1, nose: 1, mouth: 4, facialHair: 1, shirt: 0 }) },
  ],
  team2: [
    { name: "Player 1", avatar: preset({ face: 3, skin: 6, hair: 10, hairColor: 0, eyes: 0, brows: 2, nose: 2, mouth: 1, shirt: 2 }) },
    { name: "Player 2", avatar: preset({ face: 0, skin: 2, hair: 6, hairColor: 8, eyes: 5, eyeColor: 3, brows: 1, nose: 1, mouth: 0, shirt: 2 }) },
    { name: "Player 3", avatar: preset({ face: 2, skin: 3, hair: 1, hairColor: 6, eyes: 1, brows: 3, nose: 3, mouth: 2, facialHair: 2, glasses: 2, shirt: 2 }) },
  ],
};

function normalizePerson(value: unknown, fallback: Person): Person {
  const source = (value && typeof value === "object" ? value : {}) as { name?: unknown; avatar?: unknown };
  return {
    name: typeof source.name === "string" ? source.name.slice(0, 40) : fallback.name,
    avatar: source.avatar ? normalizeAvatar(source.avatar) : fallback.avatar,
  };
}

function normalizeTeam(value: unknown, fallback: Person[]): Person[] {
  if (!Array.isArray(value) || value.length < MIN_PLAYERS) return fallback;
  return value.slice(0, MAX_PLAYERS).map((p, i) => normalizePerson(p, fallback[i] ?? fallback[0]));
}

export function loadLineup(): Lineup {
  if (typeof window === "undefined") return DEFAULT_LINEUP;
  try {
    const stored = localStorage.getItem(LINEUP_KEY);
    if (!stored) return DEFAULT_LINEUP;
    const parsed = JSON.parse(stored);
    return {
      host: normalizePerson(parsed.host, DEFAULT_LINEUP.host),
      team1: normalizeTeam(parsed.team1, DEFAULT_LINEUP.team1),
      team2: normalizeTeam(parsed.team2, DEFAULT_LINEUP.team2),
    };
  } catch {
    return DEFAULT_LINEUP;
  }
}

export function saveLineup(lineup: Lineup) {
  localStorage.setItem(LINEUP_KEY, JSON.stringify(lineup));
}

// Team introductions play after the opening titles unless turned off
export function loadTeamIntroEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TEAM_INTRO_KEY) !== "false";
}

export function saveTeamIntroEnabled(enabled: boolean) {
  localStorage.setItem(TEAM_INTRO_KEY, enabled.toString());
}
