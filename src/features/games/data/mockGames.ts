import { computeAllChaosScores, type OddsSnapshot } from '@/core/chaos/chaosEngine'

export interface Team {
  name: string
  shortName: string
  seed: number
  score: number
}

export interface Game {
  id: string
  sport: 'ncaa' | 'mlb' | 'nfl'
  homeTeam: Team
  awayTeam: Team
  status: 'live' | 'upcoming' | 'final'
  clock: string       // e.g. "2H 8:34"
  round: string       // e.g. "Sweet 16"
  snapshots: OddsSnapshot[]
  chaosScore: number  // filled by engine
}

/** Helper to build a fake odds history with realistic swings */
function buildSnapshots(
  openSpread: number,
  swings: number[],
  baseTime: number = Date.now() - 40 * 60 * 1000,
): OddsSnapshot[] {
  const snapshots: OddsSnapshot[] = [{ timestamp: baseTime, spread: openSpread }]
  let current = openSpread
  swings.forEach((delta, i) => {
    current += delta
    snapshots.push({
      timestamp: baseTime + (i + 1) * (40 * 60 * 1000 / swings.length),
      spread: Math.round(current * 2) / 2, // half-point increments
    })
  })
  return snapshots
}

const rawGames: Omit<Game, 'chaosScore'>[] = [
  {
    id: 'g1',
    sport: 'ncaa',
    round: 'Sweet 16',
    status: 'live',
    clock: '2H 4:22',
    homeTeam: { name: 'Duke Blue Devils',    shortName: 'DUKE', seed: 2, score: 68 },
    awayTeam: { name: 'Houston Cougars',     shortName: 'HOU',  seed: 11, score: 71 },
    snapshots: buildSnapshots(-6.5, [-1, 1.5, -2, 3, -3.5, 2, 4.5, -3]),
  },
  {
    id: 'g2',
    sport: 'ncaa',
    round: 'Sweet 16',
    status: 'live',
    clock: '2H 12:01',
    homeTeam: { name: 'Kansas Jayhawks',     shortName: 'KAN', seed: 1, score: 54 },
    awayTeam: { name: 'Marquette Golden Eagles', shortName: 'MU', seed: 5, score: 48 },
    snapshots: buildSnapshots(-7, [0.5, -0.5, 1, -1, 0.5]),
  },
  {
    id: 'g3',
    sport: 'ncaa',
    round: 'Elite 8',
    status: 'live',
    clock: '1H 2:55',
    homeTeam: { name: 'UConn Huskies',       shortName: 'UCONN', seed: 1, score: 32 },
    awayTeam: { name: 'Illinois Fighting Illini', shortName: 'ILL', seed: 3, score: 38 },
    snapshots: buildSnapshots(-4, [2, -1.5, 3, -2, 4, -3.5, 5, -4, 6]),
  },
  {
    id: 'g4',
    sport: 'ncaa',
    round: 'Sweet 16',
    status: 'live',
    clock: '2H 18:45',
    homeTeam: { name: 'Gonzaga Bulldogs',    shortName: 'GONZ', seed: 3, score: 61 },
    awayTeam: { name: 'Purdue Boilermakers', shortName: 'PUR',  seed: 2, score: 59 },
    snapshots: buildSnapshots(-3, [1, 2, -1, 3, -2, 4, -3, 5]),
  },
  {
    id: 'g5',
    sport: 'ncaa',
    round: 'Elite 8',
    status: 'live',
    clock: '2H 1:12',
    homeTeam: { name: 'Tennessee Volunteers', shortName: 'TENN', seed: 2, score: 77 },
    awayTeam: { name: 'Creighton Bluejays',   shortName: 'CREI', seed: 6, score: 74 },
    snapshots: buildSnapshots(-5.5, [2, -3, 5, -4, 6, -2, 3, -5, 7]),
  },
  {
    id: 'g6',
    sport: 'ncaa',
    round: 'Sweet 16',
    status: 'live',
    clock: '2H 9:33',
    homeTeam: { name: 'Baylor Bears',         shortName: 'BAY', seed: 4, score: 44 },
    awayTeam: { name: 'Arizona Wildcats',      shortName: 'ARIZ', seed: 2, score: 47 },
    snapshots: buildSnapshots(-2, [0.5, -0.5]),
  },
]

// Compute chaos scores via the engine
const chaosScores = computeAllChaosScores(rawGames.map(g => ({ snapshots: g.snapshots })))

export const mockGames: Game[] = rawGames.map((g, i) => ({
  ...g,
  chaosScore: chaosScores[i],
})).sort((a, b) => b.chaosScore - a.chaosScore)
