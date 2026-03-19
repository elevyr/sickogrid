/**
 * ChaosEngine — Sport-agnostic Chaos Score calculator.
 * Produces a 1–10 score from a composite of:
 *   - Velocity:  how fast the line is moving (pts/min)
 *   - Magnitude: total absolute swing since game start
 *   - Rank:      z-score vs. all other live games today
 */

export interface OddsSnapshot {
  timestamp: number; // Unix ms
  spread: number;    // negative = home favored
}

export interface ChaosInput {
  snapshots: OddsSnapshot[];
}

/** Weight config — tweak to change algorithm feel */
const WEIGHTS = {
  velocity:  0.40,
  magnitude: 0.35,
  rank:      0.25,
} as const;

/** Clamp a value between min and max */
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/** Map a raw value to 1–10 given expected min/max */
const normalize = (v: number, min: number, max: number): number =>
  clamp(1 + ((v - min) / (max - min)) * 9, 1, 10);

/**
 * Calculate velocity: average absolute spread change per minute
 * over the last N snapshots.
 */
export function calcVelocity(snapshots: OddsSnapshot[]): number {
  if (snapshots.length < 2) return 0;
  const recent = snapshots.slice(-6); // last 6 snapshots (~3 min at 30s)
  let totalChange = 0;
  let totalMinutes = 0;
  for (let i = 1; i < recent.length; i++) {
    const deltaSpread = Math.abs(recent[i].spread - recent[i - 1].spread);
    const deltaMin = (recent[i].timestamp - recent[i - 1].timestamp) / 60000;
    if (deltaMin > 0) {
      totalChange += deltaSpread;
      totalMinutes += deltaMin;
    }
  }
  return totalMinutes > 0 ? totalChange / totalMinutes : 0;
}

/**
 * Calculate magnitude: total absolute swing from game-open spread.
 */
export function calcMagnitude(snapshots: OddsSnapshot[]): number {
  if (snapshots.length < 2) return 0;
  const open = snapshots[0].spread;
  return snapshots.reduce((max, s) => Math.max(max, Math.abs(s.spread - open)), 0);
}

/**
 * Compute a z-score for this game's magnitude vs. the field.
 * Returns a normalized 1–10 score.
 */
export function calcRankScore(gameMagnitude: number, allMagnitudes: number[]): number {
  if (allMagnitudes.length < 2) return 5;
  const mean = allMagnitudes.reduce((a, b) => a + b, 0) / allMagnitudes.length;
  const variance = allMagnitudes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allMagnitudes.length;
  const std = Math.sqrt(variance) || 1;
  const z = (gameMagnitude - mean) / std;
  // z typically in [-3, 3]; map to [1, 10]
  return clamp(5 + (z / 3) * 4.5, 1, 10);
}

/**
 * Primary export: compute composite Chaos Score for a single game.
 * Pass allMagnitudes (from all other games) for rank calculation.
 */
export function computeChaosScore(
  input: ChaosInput,
  allMagnitudes: number[] = [],
): number {
  const velocity  = calcVelocity(input.snapshots);
  const magnitude = calcMagnitude(input.snapshots);

  const vScore = normalize(velocity,  0, 2);    // 2 pts/min = max chaos
  const mScore = normalize(magnitude, 0, 14);   // 14pt swing = max chaos
  const rScore = calcRankScore(magnitude, allMagnitudes);

  const composite =
    vScore  * WEIGHTS.velocity +
    mScore  * WEIGHTS.magnitude +
    rScore  * WEIGHTS.rank;

  return Math.round(clamp(composite, 1, 10) * 10) / 10;
}

/**
 * Batch: compute chaos scores for all games at once (enables rank calculation).
 */
export function computeAllChaosScores(
  inputs: ChaosInput[],
): number[] {
  const magnitudes = inputs.map(i => calcMagnitude(i.snapshots));
  return inputs.map((input, idx) => {
    const otherMags = magnitudes.filter((_, i) => i !== idx);
    return computeChaosScore(input, otherMags);
  });
}
