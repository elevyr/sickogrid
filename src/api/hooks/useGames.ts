import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchGames } from '@/api/client'
import { computeChaosScore } from '@/core/chaos/chaosEngine'
import { mockGames } from '@/features/games/data/mockGames'
import type { Game } from '@/features/games/data/mockGames'
import type { NormalizedGame } from '@/api/types'

export interface GameGroups {
  live: Game[]
  upcoming: { label: string; games: Game[] }[]
  final: Game[]
}

/** Smart poll interval based on game state */
function getPollInterval(data: NormalizedGame[] | undefined): number | false {
  if (!data) return 30_000 // initial load
  const hasLive = data.some((g) => g.status === 'live')
  if (hasLive) return 15_000 // 15s when games are live
  const hasUpcoming = data.some((g) => g.status === 'upcoming')
  if (hasUpcoming) return 2 * 60_000 // 2 min when waiting for games
  return false // no polling when all games are done
}

/** Determine if a date is today, tomorrow, or later */
function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const gameDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((gameDay.getTime() - today.getTime()) / 86_400_000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function toGame(g: NormalizedGame): Game {
  return {
    id: g.id,
    status: g.status,
    clock: g.clock,
    round: g.round,
    commenceTime: g.commenceTime,
    homeTeam: {
      name: g.homeTeam,
      shortName: g.homeAbbr,
      seed: g.homeSeed,
      score: g.homeScore,
    },
    awayTeam: {
      name: g.awayTeam,
      shortName: g.awayAbbr,
      seed: g.awaySeed,
      score: g.awayScore,
    },
    chaosScore: computeChaosScore(g),
    broadcast: g.broadcast,
  }
}

export function useGames() {
  const query = useQuery({
    queryKey: ['espn-games'],
    queryFn: fetchGames,
    refetchInterval: (query) => getPollInterval(query.state.data),
    refetchIntervalInBackground: true,
    staleTime: 10_000,
    retry: 2,
  })

  const groups = useMemo<GameGroups>(() => {
    if (!query.data || query.data.length === 0) {
      return {
        live: mockGames.filter((g) => g.status === 'live'),
        upcoming: [],
        final: mockGames.filter((g) => g.status === 'final'),
      }
    }

    const allGames = query.data.map(toGame)

    const live = allGames
      .filter((g) => g.status === 'live')
      .sort((a, b) => b.chaosScore - a.chaosScore)

    const final = allGames
      .filter((g) => g.status === 'final')
      .sort((a, b) => b.chaosScore - a.chaosScore)

    const upcomingGames = allGames
      .filter((g) => g.status === 'upcoming')
      .sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime())

    const upcomingByDay = new Map<string, Game[]>()
    for (const g of upcomingGames) {
      const label = getDayLabel(g.commenceTime)
      const list = upcomingByDay.get(label) ?? []
      list.push(g)
      upcomingByDay.set(label, list)
    }
    const upcoming = Array.from(upcomingByDay.entries()).map(([label, games]) => ({
      label,
      games,
    }))

    return { live, upcoming, final }
  }, [query.data])

  const totalGames = groups.live.length + groups.final.length +
    groups.upcoming.reduce((n, g) => n + g.games.length, 0)

  return {
    groups,
    totalGames,
    isLoading: query.isLoading,
    isError: query.isError,
    isMock: !query.data || query.data.length === 0,
    lastUpdated: query.dataUpdatedAt,
  }
}
