import type { EspnScoreboard, NormalizedGame } from './types'

const ESPN_SCOREBOARD =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard'

/** Fetch today's NCAA tournament games from ESPN */
export async function fetchGames(): Promise<NormalizedGame[]> {
  const res = await fetch(ESPN_SCOREBOARD)
  if (!res.ok) {
    throw new Error(`ESPN API error: ${res.status}`)
  }
  const data = (await res.json()) as EspnScoreboard

  return data.events
    .filter((e) => {
      // Only include NCAA Tournament games
      const note = e.competitions[0]?.notes?.[0]?.headline ?? ''
      return note.includes('Championship')
    })
    .map((e): NormalizedGame => {
      const comp = e.competitions[0]
      const home = comp.competitors.find((c) => c.homeAway === 'home')!
      const away = comp.competitors.find((c) => c.homeAway === 'away')!
      const st = comp.status

      const state = st.type.state
      const status: NormalizedGame['status'] =
        state === 'in' ? 'live' : state === 'post' ? 'final' : 'upcoming'

      // Parse round from notes → map to canonical labels
      const note = comp.notes?.[0]?.headline ?? ''
      const rawRound = note
        .replace("NCAA Men's Basketball Championship - ", '')
        .trim()
      const round = normalizeRound(rawRound)

      // Broadcast network
      const broadcast = comp.broadcasts?.[0]?.names?.[0] ?? ''

      // Clock display
      let clock = st.type.shortDetail
      if (status === 'upcoming') {
        // Show tip time
        clock = new Date(comp.date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
      }

      return {
        id: e.id,
        homeTeam: home.team.shortDisplayName,
        awayTeam: away.team.shortDisplayName,
        homeAbbr: home.team.abbreviation,
        awayAbbr: away.team.abbreviation,
        homeScore: parseInt(home.score, 10) || 0,
        awayScore: parseInt(away.score, 10) || 0,
        homeSeed: home.curatedRank?.current ?? 0,
        awaySeed: away.curatedRank?.current ?? 0,
        commenceTime: e.date,
        status,
        clock,
        round,
        period: st.period,
        displayClock: st.displayClock,
        clockSeconds: st.clock,
        broadcast,
      }
    })
}

/** Map ESPN round text to canonical display labels */
function normalizeRound(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('1st round') || lower.includes('first round') || lower.includes('round of 64'))
    return 'Round of 64'
  if (lower.includes('2nd round') || lower.includes('second round') || lower.includes('round of 32'))
    return 'Round of 32'
  if (lower.includes('sweet 16') || lower.includes('regional semifinal'))
    return 'Sweet 16'
  if (lower.includes('elite 8') || lower.includes('elite eight') || lower.includes('regional final'))
    return 'Elite 8'
  if (lower.includes('final four') || lower.includes('national semifinal'))
    return 'Final Four'
  if (lower.includes('championship') || lower.includes('national championship') || lower.includes('title'))
    return 'Championship'
  return raw || 'NCAA Tournament'
}
