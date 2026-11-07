'use client'
import { useState } from 'react'
import SmartForm from '@/components/forms/SmartForm'

function refCode(email: string) {
  let h = 5381
  for (const c of email.toLowerCase()) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0
  return h.toString(36)
}

export default function ContestEntry({ drawId, skillQuestion }: { drawId: string; skillQuestion: string }) {
  const [ref, setRef] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const link = ref ? `https://daily.deals/contests?ref=${ref}` : ''
  return (
    <div className="space-y-5">
      <SmartForm
        formType="contest"
        submitLabel="Enter the draw →"
        successTitle="You’re entered. Good luck!"
        successBody="One entry per person per month. We’ll email the winner after the draw — check your inbox (and spam folder) in early next month."
        onSuccess={v => setRef(refCode(v.email || ''))}
        fields={[
          { name: 'name', label: 'Full name', required: true, half: true },
          { name: 'email', label: 'Email', type: 'email', required: true, half: true },
          { name: 'country', label: 'Country', type: 'select', required: true, options: [['US', 'United States'], ['CA', 'Canada']], half: true, defaultValue: 'US' },
          { name: 'region', label: 'State / province', required: true, half: true, placeholder: 'e.g. NY or ON' },
          { name: 'skill_answer', label: `Skill-testing question (Canada): ${skillQuestion}`, required: true, half: true, showIf: v => v.country === 'CA' },
          { name: 'draw_id', label: 'Draw', defaultValue: drawId, half: true, showIf: () => false },
          { name: 'ref', label: 'Referred by', showIf: () => false },
          { name: 'age_ok', label: 'I am 18 or older (or the age of majority in my province or state).', type: 'checkbox', required: true },
          { name: 'rules_accepted', label: 'I have read and agree to the Official Rules. No purchase necessary.', type: 'checkbox', required: true },
          { name: 'newsletter', label: 'Also send me the Daily Edition newsletter (optional — does not affect your odds).', type: 'checkbox' },
        ]}
        footnote={<>No purchase necessary. A purchase will not improve your chances of winning. Void where prohibited. See the <a href="/contests/rules" className="underline">Official Rules</a>.</>}
      />
      {ref && (
        <div className="border border-rule p-5 bg-paper-2">
          <div className="section-eyebrow mb-2">SHARE THE DRAW</div>
          <p className="text-sm text-ink-2 mb-3">Know someone who loves a deal? Share your personal link — friends who enter through it help us grow the prize pool.</p>
          <div className="flex gap-2">
            <input readOnly value={link} className="input-paper flex-1 font-mono text-xs" aria-label="Your share link" />
            <button type="button" onClick={() => { navigator.clipboard?.writeText(link); setCopied(true) }} className="btn-primary">{copied ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
