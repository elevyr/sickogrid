/** ESPN Scoreboard API response */
export interface EspnScoreboard {
  events: EspnEvent[]
  day: { date: string }
}

export interface EspnEvent {
  id: string
  date: string
  name: string
  shortName: string
  competitions: EspnCompetition[]
}

export interface EspnCompetition {
  id: string
  date: string
  competitors: EspnCompetitor[]
  status: EspnStatus
  notes?: Array<{ headline: string }>
  venue?: {
    fullName: string
    address?: { city: string; state: string }
  }
}

export interface EspnCompetitor {
  homeAway: 'home' | 'away'
  score: string
  winner?: boolean
  curatedRank?: { current: number }
  team: {
    id: string
    abbreviation: string
    displayName: string
    shortDisplayName: string
    color: string
    logo: string
  }
}

export interface EspnStatus {
  clock: number
  displayClock: string
  period: number
  type: {
    id: string
    name: string
    state: 'pre' | 'in' | 'post'
    completed: boolean
    description: string
    detail: string
    shortDetail: string
  }
}

/** Normalized game used throughout the app */
export interface NormalizedGame {
  id: string
  homeTeam: string
  awayTeam: string
  homeAbbr: string
  awayAbbr: string
  homeScore: number
  awayScore: number
  homeSeed: number
  awaySeed: number
  commenceTime: string
  status: 'live' | 'upcoming' | 'final'
  clock: string          // e.g. "6:48 - 1st Half" or "Final" or "7:30 PM"
  round: string          // e.g. "South - 1st Round"
  period: number
  displayClock: string   // raw clock e.g. "6:48"
  clockSeconds: number   // seconds remaining in current half
}
