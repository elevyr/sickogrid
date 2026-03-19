import { useTimezoneStore, TIMEZONES } from '@/stores/timezoneStore'
import type { Timezone } from '@/stores/timezoneStore'

export function Header() {
  const { timezone, setTimezone } = useTimezoneStore()

  return (
    <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xl font-black tracking-tighter"
          style={{
            color: '#FF2D78',
            textShadow: '0 0 10px #FF2D78, 0 0 30px #FF2D7860',
          }}
        >
          SICKO
        </span>
        <span
          className="text-xl font-black tracking-tighter"
          style={{
            color: '#00F5FF',
            textShadow: '0 0 10px #00F5FF, 0 0 30px #00F5FF60',
          }}
        >
          GRID
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Timezone selector */}
        <div className="flex items-center rounded-full overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {TIMEZONES.map((tz) => (
            <button
              key={tz.id}
              onClick={() => setTimezone(tz.id as Timezone)}
              className="px-2 py-0.5 text-[11px] font-bold tracking-wide transition-all duration-150"
              style={{
                color: timezone === tz.id ? '#00F5FF' : 'rgba(255,255,255,0.25)',
                background: timezone === tz.id ? 'rgba(0,245,255,0.1)' : 'transparent',
              }}
            >
              {tz.label}
            </button>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          <span className="text-[11px] font-semibold text-white/50 tracking-widest uppercase">
            Live
          </span>
        </div>
      </div>
    </header>
  )
}
