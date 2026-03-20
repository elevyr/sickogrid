import type { Game } from '../data/mockGames'
import { ChaosScoreBadge } from './ChaosScoreBadge'
import { useUserStore } from '@/stores/userStore'
import { useShareChaos } from '@/features/share/hooks/useShareChaos'
import { ShareableCard } from '@/features/share/components/ShareableCard'

const DRAFTKINGS_URL =
  'https://sportsbook.draftkings.com/leagues/basketball/ncaab'

const BROADCAST_COLORS: Record<string, string> = {
  CBS: '#1a5eab',
  TNT: '#8b5cf6',
  TBS: '#e67e22',
  truTV: '#22c55e',
  'TBS/TNT': '#eab308',
}

interface Props {
  game: Game
  rank?: number
}

/** Detect if a final game was an upset based on seed differential */
function getUpsetInfo(game: Game): { isUpset: boolean; label: string } | null {
  if (game.status !== 'final') return null
  const { homeTeam, awayTeam } = game
  if (!homeTeam.seed || !awayTeam.seed) return null

  const winner = homeTeam.score > awayTeam.score ? homeTeam : awayTeam
  const loser = homeTeam.score > awayTeam.score ? awayTeam : homeTeam

  const seedDiff = winner.seed - loser.seed
  if (seedDiff <= 0) return null

  if (seedDiff >= 8) return { isUpset: true, label: 'MADNESS' }
  if (seedDiff >= 5) return { isUpset: true, label: 'UPSET' }
  if (seedDiff >= 3) return { isUpset: true, label: 'STUNNER' }
  return null
}

export function GameCard({ game, rank }: Props) {
  const { homeTeam, awayTeam, clock, round, chaosScore, status, broadcast } = game
  const { toggleFollow, isFollowing } = useUserStore()
  const { cardRef, status: shareStatus, share, label } = useShareChaos(game)
  const isLive = status === 'live'
  const shouldPulseHedge = isLive && chaosScore >= 8.0
  const isSharing = shareStatus === 'generating' || shareStatus === 'sharing'
  const isFinal = status === 'final'
  const isUpcoming = status === 'upcoming'
  const upset = getUpsetInfo(game)
  const broadcastColor = broadcast ? BROADCAST_COLORS[broadcast] : null

  return (
    <div
      className="relative rounded-xl p-4 flex flex-col gap-3 transition-all duration-300"
      style={{
        background: isFinal
          ? 'linear-gradient(135deg, #0d0d0d 0%, #080808 100%)'
          : 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
        border: shouldPulseHedge
          ? '1px solid #FF2D78'
          : upset
            ? '1px solid rgba(255, 230, 0, 0.3)'
            : isFinal
              ? '1px solid rgba(255,255,255,0.04)'
              : '1px solid rgba(255,255,255,0.08)',
        boxShadow: shouldPulseHedge
          ? '0 0 20px #FF2D7840, inset 0 0 20px #FF2D7808'
          : upset
            ? '0 0 12px rgba(255, 230, 0, 0.15)'
            : '0 2px 12px rgba(0,0,0,0.5)',
        opacity: isFinal && !upset ? 0.65 : 1,
      }}
    >
      {/* Hidden shareable card */}
      {isLive && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none', zIndex: -1 }}>
          <ShareableCard ref={cardRef} game={game} />
        </div>
      )}

      {/* Rank badge (live only) */}
      {rank != null && (
        <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-xs font-bold text-white/50">#{rank}</span>
        </div>
      )}

      {/* Top row: round + TV badge + clock/status */}
      <div className="flex items-center justify-between pl-7">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#00F5FF]">
            {round}
          </span>
          {broadcastColor && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wide"
              style={{
                background: broadcastColor,
                color: '#fff',
              }}
            >
              {broadcast}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {upset && (
            <span
              className="text-[11px] font-black tracking-widest"
              style={{ color: '#FFE600', textShadow: '0 0 8px #FFE60060' }}
            >
              {upset.label}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] animate-pulse" />
            )}
            <span className="text-xs text-white/60 font-mono">{clock}</span>
          </div>
        </div>
      </div>

      {/* Main: teams + chaos badge */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col gap-2.5">
          {[awayTeam, homeTeam].map((team, i) => {
            const otherTeam = i === 0 ? homeTeam : awayTeam
            const isWinning = team.score > otherTeam.score
            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {team.seed > 0 && (
                    <span className="text-xs text-white/35 font-mono w-5 text-right">{team.seed}</span>
                  )}
                  <span
                    className="font-bold text-base tracking-tight"
                    style={{
                      color: isFinal
                        ? isWinning ? '#FFFFFF' : 'rgba(255,255,255,0.4)'
                        : '#FFFFFF',
                    }}
                  >
                    {team.shortName}
                  </span>
                </div>
                {isUpcoming ? (
                  <span className="text-sm text-white/30 font-mono">&mdash;</span>
                ) : (
                  <span
                    className="font-black text-2xl tabular-nums"
                    style={{ color: isWinning ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                  >
                    {team.score}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="w-px h-12 bg-white/10" />

        {isUpcoming ? (
          <div className="flex flex-col items-center gap-0.5 w-16">
            <span className="text-xs text-white/40 font-mono">TIP</span>
            <span className="text-sm font-bold text-white/70 font-mono">{clock}</span>
          </div>
        ) : (
          <ChaosScoreBadge score={chaosScore} />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-xs text-white/40 font-mono">
          {isUpcoming
            ? new Date(game.commenceTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            : `${awayTeam.seed > 0 ? '#' + awayTeam.seed + ' ' : ''}${awayTeam.shortName} vs ${homeTeam.seed > 0 ? '#' + homeTeam.seed + ' ' : ''}${homeTeam.shortName}`
          }
        </span>

        <div className="flex items-center gap-2">
          {/* Follow buttons */}
          {[awayTeam, homeTeam].map((team) => {
            const followed = isFollowing(team.shortName)
            return (
              <button
                key={team.shortName}
                onClick={() => toggleFollow(team.shortName)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200"
                style={{
                  border: followed ? '1px solid #00F5FF' : '1px solid rgba(255,255,255,0.12)',
                  color: followed ? '#00F5FF' : 'rgba(255,255,255,0.35)',
                  boxShadow: followed ? '0 0 6px #00F5FF50' : 'none',
                }}
              >
                {followed ? '\u2605' : '\u2606'} {team.shortName}
              </button>
            )
          })}

          {/* Share button (live only) */}
          {isLive && (
            <button
              onClick={share}
              disabled={isSharing}
              className="px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide transition-all duration-200 animate-slow-glow"
              style={{
                border: '1.5px solid #FF2D78',
                color: isSharing ? 'rgba(255,255,255,0.3)' : '#FF2D78',
                opacity: isSharing ? 0.6 : 1,
                animation: isSharing ? 'none' : undefined,
              }}
            >
              {isSharing ? '\u23F3' : '\u26A1'} {label}
            </button>
          )}
        </div>
      </div>

      {/* Hedge Now button — all live games */}
      {isLive && (
        <div className="flex flex-col items-center gap-1 pt-1">
          <a
            href={DRAFTKINGS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase text-black transition-all${shouldPulseHedge ? ' animate-pulse' : ''}`}
            style={{
              background: '#FF2D78',
              boxShadow: shouldPulseHedge
                ? '0 0 10px #FF2D78, 0 0 20px #FF2D7860'
                : '0 0 6px #FF2D7840',
            }}
          >
            HEDGE NOW
          </a>
          <span className="text-[9px] text-white/25 text-center leading-tight">
            21+ Only. Gambling problem? Call 1-800-GAMBLER
          </span>
        </div>
      )}
    </div>
  )
}
