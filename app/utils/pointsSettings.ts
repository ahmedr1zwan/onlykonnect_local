// Points awarded per question, editable in the Game Creator.

export const POINTS_SETTINGS_KEY = "onlyconnect_points";

export interface PointsSettings {
  // Points for a correct answer, by how many clues were showing at the buzz (1-4)
  cluePoints: [number, number, number, number];
  stealPoints: number;
}

export const DEFAULT_POINTS: PointsSettings = {
  cluePoints: [5, 3, 2, 1],
  stealPoints: 1,
};

export function loadPointsSettings(): PointsSettings {
  if (typeof window === "undefined") return DEFAULT_POINTS;
  try {
    const stored = localStorage.getItem(POINTS_SETTINGS_KEY);
    if (!stored) return DEFAULT_POINTS;
    const parsed = JSON.parse(stored);
    const clues = Array.isArray(parsed.cluePoints) && parsed.cluePoints.length === 4
      ? parsed.cluePoints
      : DEFAULT_POINTS.cluePoints;
    return {
      cluePoints: clues.map((n: unknown) => Math.max(0, Number(n) || 0)) as PointsSettings["cluePoints"],
      stealPoints: Math.max(0, Number(parsed.stealPoints ?? DEFAULT_POINTS.stealPoints) || 0),
    };
  } catch {
    return DEFAULT_POINTS;
  }
}

export function savePointsSettings(settings: PointsSettings) {
  localStorage.setItem(POINTS_SETTINGS_KEY, JSON.stringify(settings));
}
