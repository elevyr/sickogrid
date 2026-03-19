/** Raw shape returned by The Odds API /v4/sports/{sport}/odds */
export interface OddsApiGame {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: OddsApiBookmaker[]
}

export interface OddsApiBookmaker {
  key: string
  title: string
  markets: OddsApiMarket[]
}

export interface OddsApiMarket {
  key: 'spreads' | 'h2h'
  outcomes: OddsApiOutcome[]
}

export interface OddsApiOutcome {
  name: string
  price: number   // American odds
  point?: number  // Spread value (negative = favorite)
}

/** Raw shape returned by The Odds API /v4/sports/{sport}/scores */
export interface OddsApiScore {
  id: string
  sport_key: string
  commence_time: string
  completed: boolean
  home_team: string
  away_team: string
  scores: Array<{ name: string; score: string }> | null
  last_update: string | null
}

/** Merged, normalized game returned by our Edge Function */
export interface LiveGame {
  id: string
  sport: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  commenceTime: string
  completed: boolean
  /** Current spread (home perspective, negative = home favored) */
  spread: number | null
  /** Home moneyline */
  homeMoneyline: number | null
  awayMoneyline: number | null
}
