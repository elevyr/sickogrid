/**
 * Vercel Edge Function — Odds API Proxy
 * Route: /api/odds?sport=basketball_ncaab
 *
 * Fetches odds + scores from The Odds API, merges them,
 * and returns a clean LiveGame[] array to the client.
 * The API key stays server-side and is never exposed.
 */

import type { OddsApiGame, OddsApiScore, LiveGame } from '../src/api/types'

export const config = { runtime: 'edge' }

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4'
const BOOKMAKER_PRIORITY = ['draftkings', 'fanduel', 'betmgm', 'williamhill_us']
const CACHE_SECONDS = 28

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const sport = searchParams.get('sport') ?? 'basketball_ncaab'

  const apiKey = process.env.ODDS_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ODDS_API_KEY not configured' }), {
      status: 500,
      headers: corsHeaders('application/json'),
    })
  }

  try {
    // Fetch odds + scores in parallel
    const [oddsRes, scoresRes] = await Promise.all([
      fetch(
        `${ODDS_API_BASE}/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=spreads,h2h&oddsFormat=american`,
      ),
      fetch(
        `${ODDS_API_BASE}/sports/${sport}/scores/?apiKey=${apiKey}&daysFrom=1`,
      ),
    ])

    if (!oddsRes.ok) {
      throw new Error(`Odds API error: ${oddsRes.status}`)
    }

    const oddsData = (await oddsRes.json()) as OddsApiGame[]
    const scoresData = oddsRes.ok && scoresRes.ok
      ? ((await scoresRes.json()) as OddsApiScore[])
      : []

    // Build score lookup map
    const scoreMap = new Map<string, OddsApiScore>()
    scoresData.forEach((s) => scoreMap.set(s.id, s))

    // Merge + normalize
    const games: LiveGame[] = oddsData.map((game) => {
      const scoreInfo = scoreMap.get(game.id)

      // Find best bookmaker for odds
      const bookmaker =
        BOOKMAKER_PRIORITY.map((k) => game.bookmakers.find((b) => b.key === k))
          .find(Boolean) ?? game.bookmakers[0]

      const spreadMarket = bookmaker?.markets.find((m) => m.key === 'spreads')
      const h2hMarket    = bookmaker?.markets.find((m) => m.key === 'h2h')

      // Extract home spread (negative = home favored)
      const homeSpreadOutcome = spreadMarket?.outcomes.find(
        (o) => o.name === game.home_team,
      )
      const spread = homeSpreadOutcome?.point ?? null

      // Extract moneylines
      const homeML = h2hMarket?.outcomes.find((o) => o.name === game.home_team)?.price ?? null
      const awayML = h2hMarket?.outcomes.find((o) => o.name === game.away_team)?.price ?? null

      // Extract scores
      const homeScoreEntry = scoreInfo?.scores?.find((s) => s.name === game.home_team)
      const awayScoreEntry = scoreInfo?.scores?.find((s) => s.name === game.away_team)

      return {
        id: game.id,
        sport: game.sport_key,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        homeScore: homeScoreEntry ? parseInt(homeScoreEntry.score, 10) : null,
        awayScore: awayScoreEntry ? parseInt(awayScoreEntry.score, 10) : null,
        commenceTime: game.commence_time,
        completed: scoreInfo?.completed ?? false,
        spread,
        homeMoneyline: homeML,
        awayMoneyline: awayML,
      }
    })

    return new Response(JSON.stringify(games), {
      status: 200,
      headers: {
        ...corsHeaders('application/json'),
        'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=5`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: corsHeaders('application/json'),
    })
  }
}

function corsHeaders(contentType: string): Record<string, string> {
  return {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }
}
