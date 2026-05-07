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

async function resolveUSZip(zip: string): Promise<UserLocation | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
    if (!res.ok) return null
    const data = await res.json()
    const place = data.places?.[0]
    if (!place) return null
    return { city: place['place name'], stateProvince: place.state, stateCode: place['state abbreviation'], postalCode: zip, country: 'US', isDetected: false }
  } catch { return null }
}

async function resolveCAPostal(postal: string): Promise<UserLocation | null> {
  try {
    const fsa = postal.replace(/\s/g, '').slice(0, 3).toUpperCase()
    const res = await fetch(`https://api.zippopotam.us/ca/${fsa}`)
    if (!res.ok) return null
    const data = await res.json()
    const place = data.places?.[0]
    if (!place) return null
    return { city: place['place name'], stateProvince: place['state'], stateCode: place['state abbreviation'], postalCode: postal.toUpperCase(), country: 'CA', isDetected: false }
  } catch { return null }
}

async function detectByIP(): Promise<UserLocation | null> {
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) return null
    const data = await res.json()
    if (!['US', 'CA'].includes(data.country_code)) return null
    return { city: data.city || '', stateProvince: data.region || '', stateCode: data.region_code || '', postalCode: data.postal || '', country: data.country_code as 'US' | 'CA', isDetected: true }
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
      if (loc) { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); setLocation(loc) }
      setLoading(false)
    })
  }, [])

  async function setManualLocation(input: string): Promise<boolean> {
    setError(null)
    const trimmed = input.trim()
    let resolved: UserLocation | null = null
    if (isValidUSZip(trimmed)) resolved = await resolveUSZip(trimmed)
    else if (isValidCAPostal(trimmed)) resolved = await resolveCAPostal(trimmed)
    else { setError('Enter a valid US ZIP (e.g. 23220) or Canadian postal code (e.g. L3R 1A1)'); return false }
    if (!resolved) { setError('Could not find that location. Please try again.'); return false }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved))
    setLocation(resolved)
    return true
  }

  function clearLocation() { localStorage.removeItem(STORAGE_KEY); setLocation(null) }

  return { location, loading, error, setManualLocation, clearLocation }
}
