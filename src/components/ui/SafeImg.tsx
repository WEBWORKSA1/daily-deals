'use client'
import { useEffect, useRef, useState } from 'react'

/** <img> that disappears cleanly (leaving the container's placeholder) if the source fails — even before hydration. */
export default function SafeImg({ src, alt = '', className = '' }: { src: string; alt?: string; className?: string }) {
  const [ok, setOk] = useState(true)
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setOk(false) }, [])
  if (!ok) return null
  return <img ref={ref} src={src} alt={alt} loading="lazy" onError={() => setOk(false)} className={className} />
}
