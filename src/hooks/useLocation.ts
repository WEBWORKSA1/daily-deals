'use client'
import { useState, useEffect } from 'react'
import { UserLocation } from '@/types'

const STORAGE_KEY = 'dd_location'

function isValidUSZip(zip: string): boolean {
  return /^\d{5}$/.test(zip)
}
function isValidCAPostal(postal: string): boolean {
  return /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(postal)
}
function isValidCAFSA(input: string): boolean {
  // First 3 chars of Canadian postal (FSA) — also valid input
  return /^[A-Za-z]\d[A-Za-z]$/.test(input.replace(/\s/g, ''))
}

async function lookupCode(code: string): Promise<UserLocation | null> {
  try {
    const res = await fetch(`/api/location/lookup?code=${encodeURIComponent(code)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.found) return null
    return {
      city: data.city,
      stateProvince: data.province_state,
      stateCode: data.state_code,
      postalCode: code.toUpperCase(),
      country: data.country,
      isDetected: false,
      latitude: data.latitude,
      longitude: data.longitude,
    }
  } catch { return null }
}

async function detectByIP(): Promise<UserLocation | null> {
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) return null
    const data = await res.json()
    if (!['US', 'CA'].includes(data.country_code)) return null
    return {
      city: data.city || '',
      stateProvince: data.region || '',
      stateCode: data.region_code || '',
      postalCode: data.postal || '',
      country: data.country_code as 'US' | 'CA',
      isDetected: true,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
    }
  } catch { return null }
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setLocation(JSON.parse(stored)); setLoading(false); return } catch {}
    }
    detectByIP().then(loc => {
      if (loc) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
        setLocation(loc)
      }
      setLoading(false)
    })
  }, [])

  async function setManualLocation(input: string): Promise<boolean> {
    setError(null)
    const trimmed = input.trim().toUpperCase()
    if (!isValidUSZip(trimmed) && !isValidCAPostal(trimmed) && !isValidCAFSA(trimmed)) {
      setError('Enter a valid ZIP (e.g. 10001) or Canadian postal (e.g. M5V 1A1)')
      return false
    }
    const resolved = await lookupCode(trimmed)
    if (!resolved) {
      setError(`We don't have ${trimmed} mapped yet. Try a major city ZIP/postal.`)
      return false
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved))
    setLocation(resolved)
    return true
  }

  function clearLocation() {
    localStorage.removeItem(STORAGE_KEY)
    setLocation(null)
    setError(null)
  }

  return { location, loading, error, setManualLocation, clearLocation }
}
