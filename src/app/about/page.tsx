import { Metadata } from 'next'
import Link from 'next/link'
import { PageHero, Prose } from '@/components/ui/Editorial'

export const metadata: Metadata = {
  title: 'About Daily.Deals — How We Find and Rank Deals',
  description: 'Daily.Deals is an independent, automation-first deal publication for US and Canadian shoppers. Learn how we find deals, how we rank them, and how we make money.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <main>
      <PageHero eyebrow="ABOUT US" title="Daily Deals. Every Day." dek="Daily.Deals is an independent deal publication for shoppers in the United States and Canada. We combine round-the-clock automation with editorial standards so you can find a real bargain in minutes, not hours." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Prose sections={[
          { h: 'What we do', body: [
            'Every day, our systems collect offers from retailer pages and established public deal sources across North America. We remove duplicates, classify each deal by category and country, and rank what is left by how good it actually is. The result is a front page that is fresh every morning and keeps updating all day.',
            'Alongside the deals, we publish original shopping guides, store-by-store savings strategies, a self-updating video desk of trusted reviews, and free tools like Deal Concierge price watching.',
          ]},
          { h: 'How we pick and rank deals', body: [
            'Each deal receives a 0–100 hotness score. The score weighs the size of the discount, how recently the deal appeared, whether the “was” price is believable, and how shoppers engage with it. Curated deals also pass an editorial rubric that rewards reputable brands and real price drops, and rejects anchor pricing — inflated comparison prices designed to make a routine price look like a sale.',
            '- We favour deals from recognizable retailers with clear return policies.',
            '- We credit the source when a deal was first spotted by another publication or community.',
            '- We never accept payment to change a deal’s score. Sponsored placements are always labelled “Sponsored”.',
          ]},
          { h: 'Automation, with people in charge', body: [
            'Automation lets a small team cover far more ground than a newsroom of editors could. People design the rules, review edge cases, write the guides and handle reader messages. If something looks wrong, tell us and we will fix it.',
          ]},
          { h: 'How we make money', body: [
            'Daily.Deals is free to use. We earn money in three ways: commissions from retailers when you buy through some of our links (at no extra cost to you), clearly labelled advertising — including Google ads — and sponsored placements. Readers can also choose to support us directly. None of these affect how we score deals.',
          ]},
          { h: 'Who runs Daily.Deals', body: [
            'Daily.Deals is owned and operated by Webworks, an independent digital publisher. We are not owned by, or affiliated with, any retailer.',
          ]},
        ]} />
        <div id="how-we-pick" className="mt-10 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">Contact us</Link>
          <Link href="/disclosure" className="btn-outline">Affiliate disclosure</Link>
          <Link href="/guides" className="btn-outline">Read our guides</Link>
        </div>
      </div>
    </main>
  )
}
