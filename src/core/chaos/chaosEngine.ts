/**
 * ChaosEngine — Chaos Score calculator based on ESPN live data.
 * Produces a 1–10 score from:
 *   - Closeness:    how tight the score is relative to time remaining
 *   - Upset factor: lower seed (higher number) leading or winning
 *   - Late game:    bonus for close games in the final minutes
 */

import type { NormalizedGame } from '@/api/types'

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

/**
 * Compute chaos score for a single game.
 */
export function computeChaosScore(game: NormalizedGame): number {
  if (game.status === 'upcoming') return 0

  const { homeScore, awayScore, homeSeed, awaySeed, period, clockSeconds, status } = game
  const scoreDiff = Math.abs(homeScore - awayScore)
  const totalPoints = homeScore + awayScore

  // Avoid divide-by-zero on games that just started
  if (totalPoints === 0) return 1

  // ── Closeness (0–10): how tight is the game? ──
  // Time-aware: a 6-pt lead with 10 seconds left is a lock, not a "close game"
  // In late-game situations, treat any within-reach deficit as close
  let closeness = clamp(10 - scoreDiff * 0.45, 1, 10)
  if (status === 'live' && period >= 2) {
    const minutesLeft = clockSeconds / 60
    if (minutesLeft <= 2 && scoreDiff <= 8) {
      // Under 2 min: anything within ~8 is still a game, boost closeness
      closeness = clamp(10 - scoreDiff * 0.2, 7, 10)
    } else if (minutesLeft <= 5 && scoreDiff <= 6) {
      closeness = clamp(10 - scoreDiff * 0.3, 6, 10)
    }
  }

  // ── Upset factor (0–10): seed mismatch tension ──
  let upsetScore = 1
  if (homeSeed > 0 && awaySeed > 0) {
    const seedDiff = Math.abs(homeSeed - awaySeed)
    const higherSeed = homeSeed > awaySeed ? 'home' : 'away' // higher number = underdog
    const underdogLeading =
      (higherSeed === 'home' && homeScore > awayScore) ||
      (higherSeed === 'away' && awayScore > homeScore)

    if (underdogLeading) {
      // Underdog winning — max chaos potential
      upsetScore = clamp(2 + seedDiff * 1.0, 1, 10)

      // Clinch bonus: under 1 min + underdog leading = upset is happening
      if (status === 'live' && period >= 2 && clockSeconds <= 60 && scoreDiff >= 3) {
        upsetScore = clamp(upsetScore + 2, 1, 10)
      }
    } else if (scoreDiff <= 10) {
      // Underdog within striking distance — still very chaotic
      const proximityBoost = clamp((11 - scoreDiff) / 10, 0, 1)
      upsetScore = clamp(2 + seedDiff * 0.9 * proximityBoost, 1, 9)
    }
  }

  // ── Late game bonus (0–10): close games in final minutes ──
  let lateBonus = 1
  const isOT = period >= 3 // OT periods are 3+
  if (status === 'live') {
    const isSecondHalf = period >= 2
    const minutesLeft = clockSeconds / 60

    if (isOT) {
      // Any OT game is inherently chaotic — start at 8 minimum
      lateBonus = clamp(10 - minutesLeft * 0.4, 8, 10)
      if (scoreDiff <= 3) lateBonus = 10
    } else if (isSecondHalf && minutesLeft <= 5 && scoreDiff <= 10) {
      // Under 5 min — heating up, tighter games get extra boost
      lateBonus = clamp(10 - minutesLeft, 5, 10)
      if (scoreDiff <= 3) lateBonus = clamp(lateBonus + 2, 1, 10)
      else if (scoreDiff <= 6) lateBonus = clamp(lateBonus + 1, 1, 10)
    } else if (isSecondHalf && minutesLeft <= 10 && scoreDiff <= 8) {
      lateBonus = clamp(8 - minutesLeft * 0.4, 3, 8)
    }
  }

  // ── Final game bonus: close finals are notable ──
  if (status === 'final') {
    if (isOT) {
      lateBonus = scoreDiff <= 3 ? 9 : 7
    } else if (scoreDiff <= 3) {
      lateBonus = 7
    } else if (scoreDiff <= 6) {
      lateBonus = 4
    } else if (scoreDiff <= 10) {
      lateBonus = 2
    }
  }

  // ── Weighted composite ──
  // Late-game tension is the biggest chaos driver when clock is low
  const WEIGHTS = {
    closeness: 0.30,
    upset: 0.35,
    late: 0.35,
  }

  let composite =
    closeness * WEIGHTS.closeness +
    upsetScore * WEIGHTS.upset +
    lateBonus * WEIGHTS.late

  // OT floor: any overtime game should be at least 7.5
  if (isOT && status === 'live') {
    composite = Math.max(composite, 7.5)
  }

  return Math.round(clamp(composite, 1, 10) * 10) / 10
}

/**
 * Batch: compute chaos scores for all games.
 */
export function computeAllChaosScores(games: NormalizedGame[]): number[] {
  return games.map(computeChaosScore)
}
