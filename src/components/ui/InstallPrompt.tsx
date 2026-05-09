'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed in last 7 days
    const dismissed = localStorage.getItem('dd_install_dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    // iOS detection — Apple doesn't fire beforeinstallprompt
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches
    if (isIOSDevice && !isStandalone) {
      setIsIOS(true)
      setTimeout(() => setShow(true), 8000)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShow(true), 8000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem('dd_install_dismissed', String(Date.now()))
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    dismiss()
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-white text-gray-900 rounded-lg shadow-2xl p-4 z-50 border-l-4 border-brand-red">
      <div className="flex items-start gap-3">
        <img src="/icon.svg" alt="" className="w-12 h-12 rounded flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-heading font-900 text-base">Install Daily.Deals</div>
          {isIOS ? (
            <p className="text-xs mt-1 text-gray-700">
              Tap <span className="font-bold">Share</span> ⬆️ then <span className="font-bold">Add to Home Screen</span>
            </p>
          ) : (
            <p className="text-xs mt-1 text-gray-700">
              Get instant access to deals + price drop notifications.
            </p>
          )}
          <div className="flex gap-2 mt-3">
            {!isIOS && (
              <button
                onClick={install}
                className="flex-1 bg-brand-red text-white font-bold text-xs px-4 py-2 rounded hover:bg-red-700"
              >
                Install
              </button>
            )}
            <button
              onClick={dismiss}
              className="flex-1 bg-gray-200 text-gray-900 font-bold text-xs px-4 py-2 rounded hover:bg-gray-300"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
