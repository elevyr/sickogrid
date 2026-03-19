import { forwardRef } from 'react'
import type { Game } from '@/features/games/data/mockGames'

interface Props {
  game: Game
}

function getChaosColor(score: number): string {
  if (score >= 8.5) return '#FF2D78'
  if (score >= 7.0) return '#FF6B00'
  if (score >= 5.0) return '#FFE600'
  return '#00F5FF'
}

function getChaosHeadline(score: number): string {
  if (score >= 9.0) return 'MIRACLE IN PROGRESS'
  if (score >= 8.0) return 'BAD BEAT ALERT'
  if (score >= 7.0) return 'GAME ON FIRE'
  if (score >= 5.0) return 'HEATING UP'
  return 'WATCH THIS GAME'
}

/**
 * Fixed-size 1080×1080 card rendered offscreen and captured as PNG.
 * All styles are inline to ensure html-to-image captures them correctly.
 */
export const ShareableCard = forwardRef<HTMLDivElement, Props>(({ game }, ref) => {
  const { homeTeam, awayTeam, chaosScore, round, clock } = game
  const color = getChaosColor(chaosScore)
  const headline = getChaosHeadline(chaosScore)
  // Determine leading team
  const homeLeading = homeTeam.score >= awayTeam.score

  return (
    <div
      ref={ref}
      style={{
        width: 540,
        height: 540,
        background: '#050505',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px',
        boxSizing: 'border-box',
      }}
    >
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 300, height: 300, borderRadius: '50%',
        background: `${color}18`,
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 240, height: 240, borderRadius: '50%',
        background: '#00F5FF12',
        filter: 'blur(50px)',
      }} />

      {/* Header: logo + round */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: '-1px',
            color: '#FF2D78',
            textShadow: '0 0 12px #FF2D78',
          }}>SICKO</span>
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: '-1px',
            color: '#00F5FF',
            textShadow: '0 0 12px #00F5FF',
          }}>GRID</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#39FF14' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', fontWeight: 600 }}>
            {round.toUpperCase()} · {clock}
          </span>
        </div>
      </div>

      {/* Headline */}
      <div style={{
        fontSize: 13, fontWeight: 800, letterSpacing: '0.18em',
        color, textShadow: `0 0 8px ${color}`,
        marginBottom: 20,
      }}>
        ⚡ {headline} ⚡
      </div>

      {/* Teams + Scores */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
        {[awayTeam, homeTeam].map((team, i) => {
          const isLeading = i === 0 ? awayTeam.score > homeTeam.score : homeLeading
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderRadius: 12,
              background: isLeading ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              border: isLeading ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {team.seed > 0 && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, minWidth: 24 }}>
                    #{team.seed}
                  </span>
                )}
                <span style={{
                  fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px',
                  color: isLeading ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                }}>
                  {team.shortName}
                </span>
              </div>
              <span style={{
                fontSize: 40, fontWeight: 900, letterSpacing: '-1px',
                color: isLeading ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {team.score}
              </span>
            </div>
          )
        })}
      </div>

      {/* Chaos Score */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 20, margin: '24px 0 20px',
      }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color}40)` }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 64, fontWeight: 900, lineHeight: 1,
            color, textShadow: `0 0 20px ${color}, 0 0 40px ${color}60`,
            letterSpacing: '-2px',
          }}>
            {chaosScore.toFixed(1)}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.4)', marginTop: 4,
          }}>
            CHAOS SCORE
          </div>
        </div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${color}40)` }} />
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 16,
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
          CHAOS <span style={{ color: 'rgba(255,255,255,0.5)' }}>{chaosScore.toFixed(1)}</span>
        </span>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: '#FF2D78', letterSpacing: '0.05em',
        }}>
          sickogrid.com
        </span>
      </div>
    </div>
  )
})

ShareableCard.displayName = 'ShareableCard'
