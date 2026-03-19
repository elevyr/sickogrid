import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { fetchLiveGames } from '@/api/client'
import { useGameStore } from '@/stores/gameStore'
import { useSport } from '@/core/providers/SportProvider'
import { computeAllChaosScores } from '@/core/chaos/chaosEngine'
import { mockGames } from '@/features/games/data/mockGames'
import type { Game } from '@/features/games/data/mockGames'

const POLL_INTERVAL = 30_000 // 30 seconds

export function useOddsGames() {
  const { sport } = useSport()
  const { addSnapshot, getHistory, pruneGames } = useGameStore()

  const query = useQuery({
    queryKey: ['odds', sport.apiKey],
    queryFn: () => fetchLiveGames(sport.apiKey),
    refetchInterval: POLL_INTERVAL,
    staleTime: POLL_INTERVAL - 5_000,
    retry: 1,
  })

  // On each successful fetch, accumulate snapshots
  useEffect(() => {
    if (!query.data) return
    const activeIds = query.data.map((g) => g.id)
    pruneGames(activeIds)
    query.data.forEach((game) => {
      if (game.spread !== null) {
        addSnapshot(game.id, game.spread)
      }
    })
  }, [query.data, addSnapshot, pruneGames])

  // Derive processed Game[] with chaos scores
  const games = useMemo<Game[]>(() => {
    if (!query.data || query.data.length === 0) {
      // Fall back to mock data when API is unavailable
      return mockGames
    }

    const snapshots = query.data.map((g) => ({
      snapshots: getHistory(g.id),
    }))

    const chaosScores = computeAllChaosScores(snapshots)

    return query.data
      .map((g, i): Game => ({
        id: g.id,
        sport: sport.id,
        round: 'NCAA Tournament',
        status: g.completed ? 'final' : 'live',
        clock: g.completed ? 'FINAL' : 'LIVE',
        homeTeam: {
          name: g.homeTeam,
          shortName: g.homeTeam.split(' ').at(-1)?.toUpperCase().slice(0, 5) ?? g.homeTeam,
          seed: 0,
          score: g.homeScore ?? 0,
        },
        awayTeam: {
          name: g.awayTeam,
          shortName: g.awayTeam.split(' ').at(-1)?.toUpperCase().slice(0, 5) ?? g.awayTeam,
          seed: 0,
          score: g.awayScore ?? 0,
        },
        snapshots: getHistory(g.id),
        chaosScore: chaosScores[i],
      }))
      .sort((a, b) => b.chaosScore - a.chaosScore)
  }, [query.data, sport.id, getHistory])

  return {
    games,
    isLoading: query.isLoading,
    isError: query.isError,
    isMock: !query.data || query.data.length === 0,
    lastUpdated: query.dataUpdatedAt,
  }
}
