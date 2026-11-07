import { INQUIRY_URL } from '@/lib/site'

// Sitewide inquiry strip — rendered above the header on every page by the root layout.
// The destination is carried only by the link; no address is printed on the page.
export default function TopBanner() {
  return (
    <div className="bg-ink text-white text-center">
      <a href={INQUIRY_URL} target="_blank" rel="noopener"
        className="block max-w-screen-2xl mx-auto px-4 py-2 text-[12px] sm:text-[13px] leading-snug hover:text-white/80 transition-colors">
        <span className="underline underline-offset-2 decoration-accent decoration-2 font-medium">Contact</span>
        <span>, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership</span>
        <span aria-hidden className="ml-1.5 text-accent">→</span>
      </a>
    </div>
  )
}
