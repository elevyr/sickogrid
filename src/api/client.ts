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

      // Parse round from notes
      const note = comp.notes?.[0]?.headline ?? ''
      const round = note
        .replace("NCAA Men's Basketball Championship - ", '')
        .replace(' Round', '')
        .trim() || 'NCAA Tournament'

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
      }
    })
}
