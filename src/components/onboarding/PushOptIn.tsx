import { useState } from 'react'

const DISMISSED_KEY = 'sickogrid-push-dismissed'
const PREFS_KEY = 'sickogrid-push-prefs'

interface PushPrefs {
  gameOn: boolean
  nuclear: boolean
}

const DEFAULT_PREFS: PushPrefs = {
  gameOn: false,
  nuclear: true,
}

export function PushOptIn() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === '1'
  )
  const [showPrefs, setShowPrefs] = useState(false)
  const [prefs, setPrefs] = useState<PushPrefs>(DEFAULT_PREFS)
  const [requesting, setRequesting] = useState(false)

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  async function requestPermission() {
    setRequesting(true)
    try {
      // Try OneSignal first, fall back to native Notification API
      const w = window as Window & { OneSignal?: { showSlidedownPrompt?: () => Promise<void>; Slidedown?: { promptPush?: () => Promise<void> } } }
      if (w.OneSignal?.showSlidedownPrompt) {
        await w.OneSignal.showSlidedownPrompt()
      } else if (w.OneSignal?.Slidedown?.promptPush) {
        await w.OneSignal.Slidedown.promptPush()
      } else if ('Notification' in window) {
        await Notification.requestPermission()
      }
      setShowPrefs(true)
    } catch {
      // Permission denied or unavailable
      dismiss()
    } finally {
      setRequesting(false)
    }
  }

  function savePrefs() {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    dismiss()
  }

  function togglePref(key: keyof PushPrefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (showPrefs) {
    return (
      <div
        className="px-4 py-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255,45,120,0.06) 0%, rgba(255,230,0,0.04) 100%)',
          borderBottom: '1px solid rgba(255,45,120,0.15)',
        }}
      >
        <div className="max-w-lg mx-auto">
          <p className="text-sm font-bold text-white/90 mb-3">When should we alert you?</p>
          <div className="flex flex-col gap-2.5 mb-4">
            <ToggleRow
              label="Game On (Chaos 8.0+)"
              emoji="💥"
              checked={prefs.gameOn}
              onChange={() => togglePref('gameOn')}
              color="#FF2D78"
            />
            <ToggleRow
              label="Nuclear (Chaos 9.0+)"
              emoji="☢️"
              checked={prefs.nuclear}
              onChange={() => togglePref('nuclear')}
              color="#FFE600"
            />
          </div>
          <button
            onClick={savePrefs}
            className="w-full py-2 rounded-lg text-sm font-black tracking-widest uppercase transition-all"
            style={{
              background: '#FF2D78',
              color: '#000',
              boxShadow: '0 0 12px #FF2D7860',
            }}
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative px-4 py-3"
      style={{
        background: 'rgba(255,45,120,0.06)',
        borderBottom: '1px solid rgba(255,45,120,0.12)',
      }}
    >
      <button
        onClick={requestPermission}
        disabled={requesting}
        className="w-full text-left text-sm text-white/75 hover:text-white/90 transition-colors max-w-lg mx-auto block pr-8"
      >
        <span className="mr-1.5">🔔</span>
        {requesting
          ? 'Requesting permission…'
          : 'Get notified when a game goes nuclear — tap to enable alerts'}
      </button>
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

function ToggleRow({
  label,
  emoji,
  checked,
  onChange,
  color,
}: {
  label: string
  emoji: string
  checked: boolean
  onChange: () => void
  color: string
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between w-full py-2 px-3 rounded-lg transition-all"
      style={{
        background: checked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
        border: checked ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span className="text-sm text-white/80">
        <span className="mr-2">{emoji}</span>
        {label}
      </span>
      <div
        className="w-10 h-5 rounded-full relative transition-all duration-200"
        style={{
          background: checked ? color : 'rgba(255,255,255,0.1)',
          boxShadow: checked ? `0 0 8px ${color}60` : 'none',
        }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
          style={{ left: checked ? 22 : 2 }}
        />
      </div>
    </button>
  )
}
