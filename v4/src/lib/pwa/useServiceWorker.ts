'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null
  isInstalled: boolean
  isWaitingUpdate: boolean
  isOffline: boolean
  isUpdateAvailable: boolean
}

interface ServiceWorkerActions {
  updateServiceWorker: () => void
  skipWaiting: () => void
  sendMessage: (message: any) => void
}

export function useServiceWorker(): ServiceWorkerState & ServiceWorkerActions {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isWaitingUpdate, setIsWaitingUpdate] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    // Set up online/offline detection
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial offline state
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      console.log('[PWA] Service worker registered:', reg.scope)
      setRegistration(reg)

      // Check if service worker is already installed
      if (reg.active) {
        setIsInstalled(true)
      }

      // Listen for service worker updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          console.log('[PWA] New service worker found')
          setIsUpdateAvailable(true)

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker installed, update available
                setIsWaitingUpdate(true)
                console.log('[PWA] New service worker installed, waiting to activate')
              } else {
                // First time install
                setIsInstalled(true)
                console.log('[PWA] Service worker installed for the first time')
              }
            }

            if (newWorker.state === 'activated') {
              setIsInstalled(true)
              setIsWaitingUpdate(false)
              console.log('[PWA] New service worker activated')
            }
          })
        }
      })

      // Listen for controller change (new service worker took control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker took control')
        setIsWaitingUpdate(false)
        window.location.reload()
      })

      // Check for immediate updates
      reg.update()

    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error)
    }
  }

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  const skipWaiting = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setIsWaitingUpdate(false)
    }
  }

  const sendMessage = (message: any) => {
    if (registration && registration.active) {
      registration.active.postMessage(message)
    }
  }

  return {
    registration,
    isInstalled,
    isWaitingUpdate,
    isOffline,
    isUpdateAvailable,
    updateServiceWorker,
    skipWaiting,
    sendMessage
  }
}

// Hook for managing offline RSVP submissions
export function useOfflineRSVP() {
  const { sendMessage, isOffline } = useServiceWorker()
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([])

  const submitOfflineRSVP = (rsvpData: any) => {
    if (isOffline) {
      // Store locally and queue for sync
      const submission = {
        id: Date.now().toString(),
        data: rsvpData,
        timestamp: new Date().toISOString()
      }

      setPendingSubmissions(prev => [...prev, submission])
      
      // Send to service worker for background sync
      sendMessage({
        type: 'OFFLINE_RSVP',
        payload: submission
      })

      return { success: true, offline: true, id: submission.id }
    }

    return null
  }

  const clearPendingSubmission = (id: string) => {
    setPendingSubmissions(prev => prev.filter(submission => submission.id !== id))
  }

  return {
    submitOfflineRSVP,
    clearPendingSubmission,
    pendingSubmissions,
    hasPendingSubmissions: pendingSubmissions.length > 0
  }
}

// Hook for push notifications
export function usePushNotifications() {
  const { registration } = useServiceWorker()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  const subscribeToPush = async () => {
    if (!registration || permission !== 'granted') {
      return null
    }

    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      setSubscription(sub)

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON()
        })
      })

      return sub
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error)
      return null
    }
  }

  const unsubscribeFromPush = async () => {
    if (subscription) {
      await subscription.unsubscribe()
      setSubscription(null)

      // Remove subscription from server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })
    }
  }

  return {
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    isSupported: 'Notification' in window && 'PushManager' in window
  }
}

// Hook for app installation prompt
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('[PWA] Install prompt available')
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('[PWA] App installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const showInstallPrompt = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt')
      } else {
        console.log('[PWA] User dismissed install prompt')
      }

      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  return {
    isInstallable,
    isInstalled,
    showInstallPrompt
  }
}