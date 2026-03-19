import { createContext, useContext, useState, type ReactNode } from 'react'

export type SportId = 'ncaa' | 'mlb' | 'nfl'

export interface SportConfig {
  id: SportId
  displayName: string
  apiKey: string        // The Odds API sport key
  season: string
  emoji: string
}

const SPORT_CONFIGS: Record<SportId, SportConfig> = {
  ncaa: {
    id: 'ncaa',
    displayName: 'NCAA Tournament',
    apiKey: 'basketball_ncaab',
    season: '2025-26',
    emoji: '🏀',
  },
  mlb: {
    id: 'mlb',
    displayName: 'MLB',
    apiKey: 'baseball_mlb',
    season: '2026',
    emoji: '⚾',
  },
  nfl: {
    id: 'nfl',
    displayName: 'NFL',
    apiKey: 'americanfootball_nfl',
    season: '2026',
    emoji: '🏈',
  },
}

interface SportContextValue {
  sport: SportConfig
  setSport: (id: SportId) => void
  allSports: SportConfig[]
}

const SportContext = createContext<SportContextValue | null>(null)

interface Props {
  children: ReactNode
  defaultSport?: SportId
}

export function SportProvider({ children, defaultSport = 'ncaa' }: Props) {
  const [sportId, setSportId] = useState<SportId>(defaultSport)

  const value: SportContextValue = {
    sport: SPORT_CONFIGS[sportId],
    setSport: setSportId,
    allSports: Object.values(SPORT_CONFIGS),
  }

  return <SportContext.Provider value={value}>{children}</SportContext.Provider>
}

export function useSport(): SportContextValue {
  const ctx = useContext(SportContext)
  if (!ctx) throw new Error('useSport must be used inside <SportProvider>')
  return ctx
}
