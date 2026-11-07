'use client'
import { useState } from 'react'
import type { Video } from '@/lib/videos'

// Lite embed: thumbnail until clicked, then a privacy-enhanced YouTube iframe.
export default function VideoCard({ v }: { v: Video }) {
  const [play, setPlay] = useState(false)
  const date = new Date(v.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <article className="group">
      <div className="relative aspect-video bg-ink overflow-hidden border border-rule">
        {play ? (
          <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
            title={v.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <button type="button" onClick={() => setPlay(true)} className="absolute inset-0 w-full h-full" aria-label={`Play: ${v.title}`}>
            <img src={v.thumb} alt="" loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-xl shadow-lg">▶</span>
            </span>
          </button>
        )}
      </div>
      <div className="pt-3">
        <div className="badge-eyebrow mb-1">{v.channel.toUpperCase()} · {date.toUpperCase()}</div>
        <h3 className="text-sm text-ink leading-snug line-clamp-2">{v.title}</h3>
      </div>
    </article>
  )
}
