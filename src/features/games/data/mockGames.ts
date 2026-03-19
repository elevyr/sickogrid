/**
 * Game type used throughout the UI.
 * Derived from ESPN data + chaos score.
 */
export interface Team {
  name: string
  shortName: string
  seed: number
  score: number
}

export interface Game {
  id: string
  homeTeam: Team
  awayTeam: Team
  status: 'live' | 'upcoming' | 'final'
  clock: string
  round: string
  commenceTime: string
  chaosScore: number
}

/** Fallback mock games for when the API is unavailable */
export const mockGames: Game[] = [
  {
    id: 'mock1',
    status: 'live',
    clock: '6:48 - 1st',
    round: 'South - 1st',
    commenceTime: new Date().toISOString(),
    homeTeam: { name: 'North Carolina', shortName: 'UNC', seed: 6, score: 26 },
    awayTeam: { name: 'VCU', shortName: 'VCU', seed: 11, score: 20 },
    chaosScore: 4.2,
  },
  {
    id: 'mock2',
    status: 'final',
    clock: 'Final',
    round: 'West - 1st',
    commenceTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    homeTeam: { name: 'Wisconsin', shortName: 'WIS', seed: 5, score: 82 },
    awayTeam: { name: 'High Point', shortName: 'HPU', seed: 12, score: 83 },
    chaosScore: 8.5,
  },
  {
    id: 'mock3',
    status: 'final',
    clock: 'Final',
    round: 'East - 1st',
    commenceTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    homeTeam: { name: 'Duke', shortName: 'DUKE', seed: 1, score: 71 },
    awayTeam: { name: 'Siena', shortName: 'SIE', seed: 16, score: 65 },
    chaosScore: 3.8,
  },
]
