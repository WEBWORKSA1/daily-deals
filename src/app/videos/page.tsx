import { Metadata } from 'next'
import { getVideos, VIDEO_TOPICS, VIDEO_SEARCHES } from '@/lib/videos'
import { PageHero, SectionHead } from '@/components/ui/Editorial'
import VideoCard from '@/components/ui/VideoCard'
import AdSlot from '@/components/ads/AdSlot'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'Deal Videos — Reviews & Buying Advice Before You Buy',
  description: 'The latest product reviews, buying advice and money-saving videos from trusted creators, collected automatically and updated throughout the day.',
  alternates: { canonical: '/videos' },
}

export default async function VideosPage() {
  const videos = await getVideos().catch(() => [])
  return (
    <main>
      <PageHero eyebrow="WATCH BEFORE YOU BUY" title="Reviews & buying advice" dek="A self-updating feed of the newest reviews and money-saving videos from trusted creators — so you can check the product before you check the price." />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {VIDEO_TOPICS.map((t, i) => {
          const list = videos.filter(v => v.topic === t.slug).slice(0, 8)
          if (!list.length) return null
          return (
            <section key={t.slug}>
              <SectionHead n={String(i + 1).padStart(2, '0')} eyebrow="VIDEO DESK" title={t.label} />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{list.map(v => <VideoCard key={v.id} v={v} />)}</div>
              {i === 0 && <AdSlot kind="leaderboard" />}
            </section>
          )
        })}
        <section>
          <SectionHead n="05" eyebrow="ON YOUTUBE" title="Popular buying-advice searches" sub="Jump straight to the latest videos on the topics shoppers ask about most." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
            {VIDEO_SEARCHES.map(([label, q]) => (
              <a key={q} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noopener" className="bg-white p-5 hover:bg-paper-2 group">
                <div className="font-serif text-lg text-ink group-hover:text-accent">{label}</div>
                <div className="text-[11px] text-ink-muted tracking-wider">WATCH ON YOUTUBE ↗</div>
              </a>
            ))}
          </div>
        </section>
        <p className="text-xs text-ink-muted">Videos are embedded from YouTube and belong to their creators. Daily.Deals is not affiliated with these channels. Playback uses YouTube’s privacy-enhanced mode.</p>
      </div>
    </main>
  )
}
