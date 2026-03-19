interface Props {
  title: string
  count: number
  variant: 'live' | 'upcoming' | 'final'
}

const STYLES = {
  live: { color: '#FF2D78', dot: true },
  upcoming: { color: '#00F5FF', dot: false },
  final: { color: 'rgba(255,255,255,0.35)', dot: false },
} as const

export function SectionHeader({ title, count, variant }: Props) {
  const { color, dot } = STYLES[variant]

  return (
    <div className="flex items-center gap-2 mb-3">
      {dot && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />}
      <h2
        className="text-sm font-black tracking-widest uppercase"
        style={{ color }}
      >
        {title}
      </h2>
      <span className="text-xs font-mono text-white/30">({count})</span>
      <div className="flex-1 h-px" style={{ background: `${color}30` }} />
    </div>
  )
}
