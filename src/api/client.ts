import type { LiveGame } from './types'

/** Fetch live games from our Vercel Edge Function proxy */
export async function fetchLiveGames(sportKey: string): Promise<LiveGame[]> {
  const url = `/api/odds?sport=${encodeURIComponent(sportKey)}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Odds API proxy error: ${res.status}`)
  }
  return res.json() as Promise<LiveGame[]>
}
