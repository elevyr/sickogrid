import type { Game } from '../data/mockGames'
import { ChaosScoreBadge } from './ChaosScoreBadge'
import { useUserStore } from '@/stores/userStore'
import { useShareChaos } from '@/features/share/hooks/useShareChaos'
import { ShareableCard } from '@/features/share/components/ShareableCard'

interface Props {
  game: Game
  rank: number
}

export function GameCard({ game, rank }: Props) {
  const { homeTeam, awayTeam, clock, round, chaosScore } = game
  const { toggleFollow, isFollowing } = useUserStore()
  const { cardRef, status, share, label } = useShareChaos(game)
  const isHedge = chaosScore >= 8.0
  const spread = game.snapshots.at(-1)?.spread ?? 0
  const spreadStr = spread === 0 ? 'PK' : spread > 0 ? `+${spread}` : `${spread}`
  const isSharing = status === 'generating' || status === 'sharing'

  return (
    <div
      className="relative rounded-xl p-4 flex flex-col gap-3 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
        border: isHedge
          ? '1px solid #FF2D78'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isHedge
          ? '0 0 20px #FF2D7840, inset 0 0 20px #FF2D7808'
          : '0 2px 12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Hidden shareable card — captured by html-to-image */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none', zIndex: -1 }}>
        <ShareableCard ref={cardRef} game={game} />
      </div>

      {/* Rank badge */}
      <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white/50">#{rank}</span>
      </div>

      {/* Top row: round + clock */}
      <div className="flex items-center justify-between pl-6">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#00F5FF]">
          {round}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] animate-pulse" />
          <span className="text-[11px] text-white/60 font-mono">{clock}</span>
        </div>
      </div>

      {/* Main: teams + chaos badge */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col gap-2">
          {[awayTeam, homeTeam].map((team, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30 font-mono w-4">#{team.seed}</span>
                <span className="font-bold text-sm text-white tracking-tight">{team.shortName}</span>
              </div>
              <span
                className="font-black text-xl tabular-nums"
                style={{ color: team.score > (i === 0 ? homeTeam.score : awayTeam.score) ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
              >
                {team.score}
              </span>
            </div>
          ))}
        </div>

        <div className="w-px h-10 bg-white/10" />
        <ChaosScoreBadge score={chaosScore} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-[11px] text-white/40 font-mono">
          SPREAD <span className="text-white/70">{spreadStr}</span>
        </span>

        <div className="flex items-center gap-2">
          {/* Follow buttons */}
          {[awayTeam, homeTeam].map((team) => {
            const followed = isFollowing(team.shortName)
            return (
              <button
                key={team.shortName}
                onClick={() => toggleFollow(team.shortName)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200"
                style={{
                  border: followed ? '1px solid #00F5FF' : '1px solid rgba(255,255,255,0.12)',
                  color: followed ? '#00F5FF' : 'rgba(255,255,255,0.35)',
                  boxShadow: followed ? '0 0 6px #00F5FF50' : 'none',
                }}
              >
                {followed ? '★' : '☆'} {team.shortName}
              </button>
            )
          })}

          {/* Share button */}
          <button
            onClick={share}
            disabled={isSharing}
            className="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200"
            style={{
              border: '1px solid rgba(255,46,120,0.4)',
              color: isSharing ? 'rgba(255,255,255,0.3)' : '#FF2D78',
              opacity: isSharing ? 0.6 : 1,
            }}
          >
            {isSharing ? '⏳' : '⚡'} {label}
          </button>

          {/* Hedge button */}
          {isHedge && (
            <button
              className="px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase text-black animate-pulse"
              style={{
                background: '#FF2D78',
                boxShadow: '0 0 10px #FF2D78, 0 0 20px #FF2D7860',
              }}
            >
              HEDGE
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
