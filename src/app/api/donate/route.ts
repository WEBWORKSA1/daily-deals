import { NextRequest, NextResponse } from 'next/server'
import { donationReceiver } from '@/lib/server/forms'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PURPOSES: Record<string, string> = {
  operations: 'Ongoing operations (hosting, data, tools)',
  marketing: 'Promotions & marketing',
  talent: 'Hiring editors, creators & developers',
  prizes: 'Contests & giveaway prizes',
  general: 'Where it is needed most',
}

// Builds the payment link server-side so the receiving account never appears on the site.
// Priority: Stripe Payment Link (STRIPE_DONATION_LINK) → PayPal (PAYPAL_HOSTED_BUTTON_ID or receiver address).
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const amount = Math.min(10000, Math.max(1, Math.round(Number(p.get('amount') || 25))))
  const purpose = PURPOSES[p.get('purpose') || 'general'] ? (p.get('purpose') || 'general') : 'general'
  const monthly = p.get('freq') === 'monthly'
  const currency = p.get('currency') === 'CAD' ? 'CAD' : 'USD'
  const label = `Daily.Deals support — ${PURPOSES[purpose]}`
  const back = new URL('/support?thanks=1', req.url).toString()

  const stripe = monthly ? process.env.STRIPE_MONTHLY_LINK : process.env.STRIPE_DONATION_LINK
  if (stripe) {
    const u = new URL(stripe)
    u.searchParams.set('client_reference_id', `${purpose}-${amount}`)
    return NextResponse.redirect(u.toString(), 302)
  }

  const hosted = process.env.PAYPAL_HOSTED_BUTTON_ID
  if (hosted && !monthly) {
    return NextResponse.redirect(`https://www.paypal.com/donate/?hosted_button_id=${encodeURIComponent(hosted)}&amount=${amount}&currency_code=${currency}`, 302)
  }

  const q = new URLSearchParams({ business: donationReceiver(), item_name: label, currency_code: currency, return: back, cancel_return: new URL('/support', req.url).toString(), no_shipping: '1' })
  if (monthly) {
    q.set('cmd', '_xclick-subscriptions'); q.set('a3', String(amount)); q.set('p3', '1'); q.set('t3', 'M'); q.set('src', '1')
  } else {
    q.set('cmd', '_donations'); q.set('amount', String(amount))
  }
  const res = NextResponse.redirect(`https://www.paypal.com/cgi-bin/webscr?${q.toString()}`, 302)
  res.headers.set('X-Robots-Tag', 'noindex')
  return res
}
