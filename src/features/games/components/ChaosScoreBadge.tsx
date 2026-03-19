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

export function ChaosScoreBadge({ score }: Props) {
  const color = getChaosColor(score)
  const label = getChaosLabel(score)
  const isOnFire = score >= 8.5

  return (
    <div className="flex flex-col items-center gap-0.5">
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
      <span
        className="text-[10px] font-bold tracking-widest"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}
