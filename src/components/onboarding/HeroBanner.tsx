import { useState } from 'react'

const STORAGE_KEY = 'sickogrid-hero-dismissed'

export function HeroBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1'
  )

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      className="relative px-4 py-3"
      style={{
        background: 'linear-gradient(135deg, rgba(0,245,255,0.08) 0%, rgba(255,45,120,0.06) 100%)',
        borderBottom: '1px solid rgba(0,245,255,0.15)',
      }}
    >
      <p className="text-sm text-white/80 leading-relaxed pr-8 max-w-lg mx-auto">
        <span className="font-black text-[#00F5FF]">SickoGrid</span> ranks every live March
        Madness game by chaos.{' '}
        <span className="font-black text-[#FF2D78]">10</span> = absolute mayhem. Find the game
        worth watching right now.
      </p>
      <button
        onClick={dismiss}
        className="absolute top-2 right-3 w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)' }}
        aria-label="Dismiss"
      >
        &#x2715;
      </button>
    </div>
  )
}
