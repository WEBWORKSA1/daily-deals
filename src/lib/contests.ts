// The Daily Draw — a monthly giveaway that rolls over automatically.
// Every calendar month (Toronto time) is a new draw: entries open on the 1st, close at
// 11:59 pm ET on the last day, and the winner is drawn on the 3rd of the following month.
// Change PRIZE below (or set CONTEST_PRIZE / CONTEST_PRIZE_VALUE env vars) before promoting.

export const PRIZE = process.env.NEXT_PUBLIC_CONTEST_PRIZE || 'A $50 gift card to Amazon, Walmart or Best Buy (winner’s choice, in their country’s currency)'
export const PRIZE_VALUE = process.env.NEXT_PUBLIC_CONTEST_PRIZE_VALUE || 'USD $50 or CAD $50'
export const SKILL_QUESTION = '(10 × 3) − 10 + 5 = ?'

export interface Draw { id: string; title: string; opens: Date; closes: Date; drawDate: Date; monthLabel: string }

export function currentDraw(now = new Date()): Draw {
  const t = new Date(now.toLocaleString('en-US', { timeZone: 'America/Toronto' }))
  const y = t.getFullYear(), m = t.getMonth()
  const opens = new Date(y, m, 1, 0, 0, 0)
  const closes = new Date(y, m + 1, 0, 23, 59, 59)
  const drawDate = new Date(y, m + 1, 3, 12, 0, 0)
  const monthLabel = opens.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return { id: `${y}-${String(m + 1).padStart(2, '0')}`, title: `The Daily Draw — ${monthLabel}`, opens, closes, drawDate, monthLabel }
}

export const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
