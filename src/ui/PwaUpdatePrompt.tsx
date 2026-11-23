import { useRegisterSW } from 'virtual:pwa-register/react'
import { UpdateBanner } from './components/UpdateBanner'

const HOURLY = 60 * 60 * 1000

/**
 * Registers the service worker and shows the update banner when a new version
 * is waiting. Kept out of tests: it depends on the PWA plugin's virtual module.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Also notice new versions while the app stays open.
      if (registration) setInterval(() => void registration.update(), HOURLY)
    },
  })

  if (!needRefresh) return null
  return <UpdateBanner onUpdate={() => void updateServiceWorker(true)} onLater={() => setNeedRefresh(false)} />
}
