import { useState } from 'react'

interface Props {
  score: number
}

function getChaosColor(score: number): string {
  if (score >= 8.5) return '#FF2D78' // neon pink — INSANE
  if (score >= 7.0) return '#FF6B00' // orange — HOT
  if (score >= 5.0) return '#FFE600' // yellow — HEATING UP
  return '#00F5FF'                   // cyan — COOL
}

function getChaosLabel(score: number): string {
  if (score >= 8.5) return 'INSANE'
  if (score >= 7.0) return 'HOT'
  if (score >= 5.0) return 'LIVE'
  return 'COOL'
}

const TOOLTIP_TEXT =
  'Chaos Score measures how wild this game is right now. Factors: score gap, time remaining, and seed upset potential. 8.5+ = drop everything and watch.'

export function ChaosScoreBadge({ score }: Props) {
  const color = getChaosColor(score)
  const label = getChaosLabel(score)
  const isOnFire = score >= 8.5
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="flex flex-col items-center gap-0.5 relative">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl tabular-nums"
        style={{
          border: `2px solid ${color}`,
          color,
          boxShadow: `0 0 12px ${color}80, 0 0 28px ${color}30`,
          animation: isOnFire ? 'pulse 1.2s ease-in-out infinite' : undefined,
        }}
      >
        {score.toFixed(1)}
      </div>
      <div className="flex items-center gap-1">
        <span
          className="text-[10px] font-bold tracking-widest"
          style={{ color }}
        >
          {label}
        </span>
        <button
          className="text-[11px] leading-none transition-opacity"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onClick={() => setShowTooltip((v) => !v)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label="What is Chaos Score?"
        >
          {'\u24D8'}
        </button>
      </div>

      {showTooltip && (
        <div
          className="absolute top-full mt-2 right-0 z-50 w-56 p-3 rounded-lg text-xs leading-relaxed text-white/80"
          style={{
            background: 'rgba(10,10,10,0.95)',
            border: `1px solid ${color}40`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 8px ${color}20`,
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowTooltip(false)}
        >
          {TOOLTIP_TEXT}
        </div>
      )}
    </div>
  )
}
