import { SITE_URL } from '@/lib/site'

export default function ShareLinks({ path, title }: { path: string; title: string }) {
  const u = encodeURIComponent(`${SITE_URL}${path}`)
  const t = encodeURIComponent(title)
  const links: Array<[string, string]> = [
    ['X', `https://twitter.com/intent/tweet?url=${u}&text=${t}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['Pinterest', `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`],
    ['Reddit', `https://www.reddit.com/submit?url=${u}&title=${t}`],
    ['WhatsApp', `https://wa.me/?text=${t}%20${u}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="section-eyebrow mr-1">SHARE</span>
      {links.map(([n, h]) => <a key={n} href={h} target="_blank" rel="noopener nofollow" className="border border-rule px-3 py-1.5 hover:border-ink text-ink-2 hover:text-ink">{n}</a>)}
    </div>
  )
}
