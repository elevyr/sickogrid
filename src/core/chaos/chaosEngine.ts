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
  // A 0-point game = 10, a 20+ point game = ~1
  const closeness = clamp(10 - scoreDiff * 0.5, 1, 10)

  // ── Upset factor (0–10): is the underdog winning? ──
  let upsetScore = 1
  if (homeSeed > 0 && awaySeed > 0) {
    const seedDiff = Math.abs(homeSeed - awaySeed)
    const higherSeed = homeSeed > awaySeed ? 'home' : 'away' // higher number = underdog
    const underdogLeading =
      (higherSeed === 'home' && homeScore > awayScore) ||
      (higherSeed === 'away' && awayScore > homeScore)

    if (underdogLeading) {
      // Scale by seed difference: a 16 beating a 1 is max chaos
      upsetScore = clamp(1 + seedDiff * 0.8, 1, 10)
    } else if (scoreDiff <= 5) {
      // Underdog is close — still chaotic
      upsetScore = clamp(1 + seedDiff * 0.4, 1, 7)
    }
  }

  // ── Late game bonus (0–10): close games in final minutes ──
  let lateBonus = 1
  if (status === 'live') {
    const isSecondHalf = period >= 2
    const minutesLeft = clockSeconds / 60

    if (isSecondHalf && minutesLeft <= 5 && scoreDiff <= 8) {
      // Under 5 min, within 8 points — heating up
      lateBonus = clamp(10 - minutesLeft, 5, 10)
      if (scoreDiff <= 3) lateBonus = clamp(lateBonus + 2, 1, 10)
    } else if (isSecondHalf && minutesLeft <= 10 && scoreDiff <= 5) {
      lateBonus = clamp(7 - minutesLeft * 0.3, 3, 7)
    }
  }

  // ── Final game bonus: close finals are notable ──
  if (status === 'final') {
    if (scoreDiff <= 3) lateBonus = 6
    else if (scoreDiff <= 6) lateBonus = 3
  }

  // ── Weighted composite ──
  const WEIGHTS = {
    closeness: 0.35,
    upset: 0.40,
    late: 0.25,
  }

  const composite =
    closeness * WEIGHTS.closeness +
    upsetScore * WEIGHTS.upset +
    lateBonus * WEIGHTS.late

  return Math.round(clamp(composite, 1, 10) * 10) / 10
}

/**
 * Batch: compute chaos scores for all games.
 */
export function computeAllChaosScores(games: NormalizedGame[]): number[] {
  return games.map(computeChaosScore)
}
