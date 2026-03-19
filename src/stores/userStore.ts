import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserStore {
  followedTeams: Set<string>
  toggleFollow: (teamId: string) => void
  isFollowing: (teamId: string) => boolean
}

// Zustand persist doesn't handle Set natively — store as array
interface PersistedState {
  followedTeams: string[]
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      followedTeams: new Set<string>(),

      toggleFollow: (teamId) =>
        set((state) => {
          const next = new Set(state.followedTeams)
          if (next.has(teamId)) {
            next.delete(teamId)
          } else {
            next.add(teamId)
          }
          return { followedTeams: next }
        }),

      isFollowing: (teamId) => get().followedTeams.has(teamId),
    }),
    {
      name: 'sickogrid-user',
      // Serialize Set → array for localStorage
      storage: {
        getItem: (key) => {
          const raw = localStorage.getItem(key)
          if (!raw) return null
          const parsed = JSON.parse(raw) as { state: PersistedState }
          return {
            ...parsed,
            state: {
              ...parsed.state,
              followedTeams: new Set(parsed.state.followedTeams ?? []),
            },
          }
        },
        setItem: (key, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              followedTeams: Array.from(value.state.followedTeams),
            },
          }
          localStorage.setItem(key, JSON.stringify(serialized))
        },
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  ),
)
