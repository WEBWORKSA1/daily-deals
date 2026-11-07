'use client'
import SmartForm, { FieldDef } from './SmartForm'

const CATS = ['Electronics', 'Computers & Laptops', 'TV & Home Theatre', 'Phones & Wearables', 'Gaming', 'Home & Kitchen', 'Appliances', 'Furniture & Mattresses', 'Fashion & Shoes', 'Beauty', 'Sports & Outdoors', 'Tools & Garden', 'Toys & Kids', 'Travel', 'Groceries', 'Other']

export const CONCIERGE_FIELDS: FieldDef[] = [
  { name: 'product', label: 'What are you shopping for?', required: true, placeholder: 'e.g. Sony WH-1000XM6 headphones, 65" OLED TV, air fryer' },
  { name: 'category', label: 'Category', type: 'select', options: CATS, half: true },
  { name: 'target_price', label: 'Target price', type: 'number', placeholder: 'e.g. 250', half: true, help: 'We alert you at or below this price.' },
  { name: 'timeframe', label: 'When do you need it?', type: 'radio', options: [['asap', 'This week'], ['month', 'This month'], ['flexible', 'Flexible — wait for the best price']] },
  { name: 'name', label: 'First name', half: true, placeholder: 'Your first name' },
  { name: 'email', label: 'Email', type: 'email', required: true, half: true, placeholder: 'you@email.com' },
  { name: 'country', label: 'Country', type: 'select', options: [['US', 'United States'], ['CA', 'Canada']], half: true, defaultValue: 'US' },
  { name: 'postal', label: 'ZIP / postal code (optional)', half: true, placeholder: 'For in-store deals near you' },
  { name: 'notes', label: 'Must-haves or brands (optional)', type: 'textarea', rows: 2, placeholder: 'Colour, size, brand, features…' },
  { name: 'consent', label: 'Email me matching deals and the Daily Edition newsletter. I can unsubscribe anytime.', type: 'checkbox', required: true },
]

const COMPACT: FieldDef[] = [
  CONCIERGE_FIELDS[0],
  { ...CONCIERGE_FIELDS[2], half: true },
  { ...CONCIERGE_FIELDS[5], half: true },
  { ...CONCIERGE_FIELDS[6], half: true },
  { ...CONCIERGE_FIELDS[7], half: true },
  CONCIERGE_FIELDS[9],
]

export default function ConciergeInline({ compact }: { compact?: boolean }) {
  return (
    <SmartForm
      formType="concierge"
      fields={compact ? COMPACT : CONCIERGE_FIELDS}
      submitLabel="Watch this price for me →"
      successTitle="Your deal watch is on."
      successBody="We’ll email you when we spot a matching deal at or under your target price. Add the Daily Edition to your contacts so our alerts land in your inbox."
      compact={compact}
      footnote={<>Free, no spam, never sold. See our <a href="/privacy" className="underline">Privacy Policy</a>.</>}
    />
  )
}
