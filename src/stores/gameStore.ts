import { create } from 'zustand'
import type { OddsSnapshot } from '@/core/chaos/chaosEngine'

/** Max snapshots to keep per game (30s × 120 = 1 hour) */
const MAX_SNAPSHOTS = 120

interface GameStore {
  /** gameId → ordered list of spread snapshots */
  history: Record<string, OddsSnapshot[]>
  /** Append a new snapshot for a game (deduplicates by timestamp) */
  addSnapshot: (gameId: string, spread: number, timestamp?: number) => void
  /** Get snapshot history for a game */
  getHistory: (gameId: string) => OddsSnapshot[]
  /** Prune games not seen in the last poll */
  pruneGames: (activeIds: string[]) => void
}

export const useGameStore = create<GameStore>()((set, get) => ({
  history: {},

  addSnapshot: (gameId, spread, timestamp = Date.now()) => {
    set((state) => {
      const existing = state.history[gameId] ?? []
      // Skip if last snapshot has same spread (no movement)
      const last = existing.at(-1)
      if (last && last.spread === spread && Date.now() - last.timestamp < 25_000) {
        return state
      }
      const updated = [...existing, { timestamp, spread }].slice(-MAX_SNAPSHOTS)
      return { history: { ...state.history, [gameId]: updated } }
    })
  },

  getHistory: (gameId) => get().history[gameId] ?? [],

  pruneGames: (activeIds) => {
    set((state) => {
      const next: Record<string, OddsSnapshot[]> = {}
      activeIds.forEach((id) => {
        if (state.history[id]) next[id] = state.history[id]
      })
      return { history: next }
    })
  },
}))
