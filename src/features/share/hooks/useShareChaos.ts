import { useRef, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import type { Game } from '@/features/games/data/mockGames'

type ShareStatus = 'idle' | 'generating' | 'sharing' | 'copied' | 'downloaded' | 'error'

interface UseShareChaosReturn {
  cardRef: React.RefObject<HTMLDivElement | null>
  status: ShareStatus
  share: () => Promise<void>
  label: string
}

export function useShareChaos(_game: Game): UseShareChaosReturn {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<ShareStatus>('idle')

  const share = useCallback(async () => {
    if (!cardRef.current || status === 'generating' || status === 'sharing') return

    try {
      setStatus('generating')

      // Capture the card as a PNG blob
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,         // Retina-quality output
        skipAutoScale: true,
      })

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'sickogrid-chaos.png', { type: 'image/png' })

      setStatus('sharing')

      // 1. Try native Web Share API (mobile)
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'SickoGrid — Chaos Alert',
          text: 'This game is INSANE. Check the Chaos Score 👀',
        })
        setStatus('idle')
        return
      }

      // 2. Try clipboard API (modern desktop browsers)
      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setStatus('copied')
        setTimeout(() => setStatus('idle'), 2500)
        return
      }

      // 3. Fallback: trigger download
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'sickogrid-chaos.png'
      link.click()
      setStatus('downloaded')
      setTimeout(() => setStatus('idle'), 2500)

    } catch (err) {
      // User cancelled native share — treat as idle, not error
      const message = err instanceof Error ? err.message : ''
      if (message.includes('cancel') || message.includes('abort') || message.includes('AbortError')) {
        setStatus('idle')
      } else {
        console.error('Share failed:', err)
        setStatus('error')
        setTimeout(() => setStatus('idle'), 2500)
      }
    }
  }, [status])

  const label: Record<ShareStatus, string> = {
    idle:       'Share Chaos',
    generating: 'Capturing…',
    sharing:    'Opening…',
    copied:     'Copied! ✓',
    downloaded: 'Saved! ✓',
    error:      'Try again',
  }

  return { cardRef, status, share, label: label[status] }
}
