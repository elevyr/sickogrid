import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Timezone = 'ET' | 'CT' | 'MT' | 'PT'

export interface TimezoneConfig {
  id: Timezone
  label: string
  iana: string
}

export const TIMEZONES: TimezoneConfig[] = [
  { id: 'ET', label: 'ET', iana: 'America/New_York' },
  { id: 'CT', label: 'CT', iana: 'America/Chicago' },
  { id: 'MT', label: 'MT', iana: 'America/Denver' },
  { id: 'PT', label: 'PT', iana: 'America/Los_Angeles' },
]

function detectTimezone(): Timezone {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const match = TIMEZONES.find((t) => t.iana === tz)
    if (match) return match.id
    // Rough offset-based fallback
    const offset = new Date().getTimezoneOffset()
    if (offset <= 300) return 'ET'
    if (offset <= 360) return 'CT'
    if (offset <= 420) return 'MT'
    return 'PT'
  } catch {
    return 'ET'
  }
}

interface TimezoneState {
  timezone: Timezone
  setTimezone: (tz: Timezone) => void
}

export const useTimezoneStore = create<TimezoneState>()(
  persist(
    (set) => ({
      timezone: detectTimezone(),
      setTimezone: (tz) => set({ timezone: tz }),
    }),
    { name: 'sickogrid-tz' },
  ),
)

/** Format an ISO date string to a time in the user's chosen timezone */
export function formatTime(isoDate: string, tz: Timezone): string {
  const config = TIMEZONES.find((t) => t.id === tz)!
  return new Date(isoDate).toLocaleTimeString('en-US', {
    timeZone: config.iana,
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Format date for display (e.g. "Thu, Mar 20") */
export function formatDate(isoDate: string, tz: Timezone): string {
  const config = TIMEZONES.find((t) => t.id === tz)!
  return new Date(isoDate).toLocaleDateString('en-US', {
    timeZone: config.iana,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
