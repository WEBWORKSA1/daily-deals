'use client'
import { useEffect, useState } from 'react'

interface Comment {
  id: number
  body: string
  created_at: string
  upvote_count: number
  users: { username: string, display_name: string | null, karma_score: number } | null
}

export default function Comments({ dealId }: { dealId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [error, setError] = useState('')
  const [showFlagModal, setShowFlagModal] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(j => setSignedIn(!!j.user))
    loadComments()
  }, [dealId])

  async function loadComments() {
    try {
      const res = await fetch(`/api/comments?deal_id=${dealId}`)
      const json = await res.json()
      setComments(json.comments || [])
    } finally { setLoading(false) }
  }

  async function postComment() {
    if (!body.trim()) return
    setPosting(true)
    setError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: dealId, body: body.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed')
      } else {
        setBody('')
        await loadComments()
      }
    } finally { setPosting(false) }
  }

  async function flagDeal(reason: string) {
    await fetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_type: 'deal', target_id: dealId, reason }),
    })
    setShowFlagModal(null)
  }

  return (
    <section className="bg-brand-dark-3 border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          💬 Discussion
          <span className="text-brand-gray text-xs font-normal">({comments.length})</span>
        </h3>
        <button onClick={() => setShowFlagModal(dealId)}
          className="text-brand-gray text-xs hover:text-brand-red">
          🚩 Report deal
        </button>
      </div>

      {/* COMPOSE */}
      {signedIn ? (
        <div className="mb-6">
          <textarea value={body} onChange={e => setBody(e.target.value)}
            placeholder="Share your thoughts on this deal..."
            className="input-dark w-full p-3 min-h-[80px] resize-y" maxLength={2000} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-brand-gray text-xs">{body.length}/2000</span>
            <button onClick={postComment} disabled={posting || !body.trim()}
              className="btn-primary px-4 py-1.5 text-xs">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
          {error && <p className="text-brand-red text-xs mt-1">{error}</p>}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-center mb-6">
          <a href="/signin" className="text-brand-red text-sm hover:underline">Sign in</a>
          <span className="text-brand-gray text-sm"> to join the conversation</span>
        </div>
      )}

      {/* COMMENTS */}
      {loading ? (
        <div className="text-brand-gray text-sm">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-brand-gray text-sm text-center py-8">
          No comments yet. Be the first.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="border-b border-white/5 pb-3 last:border-0">
              <div className="flex items-center gap-2 text-xs text-brand-gray mb-1">
                <span className="text-white font-bold">
                  {c.users?.username || c.users?.display_name || 'Anonymous'}
                </span>
                {c.users && c.users.karma_score > 0 && (
                  <span className="text-brand-gold">✨{c.users.karma_score}</span>
                )}
                <span>·</span>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-brand-gray-2 text-sm whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* FLAG MODAL */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
             onClick={() => setShowFlagModal(null)}>
          <div className="bg-brand-dark-3 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
               onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-3">Report this deal</h3>
            <p className="text-brand-gray text-xs mb-4">Why are you reporting?</p>
            <div className="space-y-2">
              {[
                { v: 'expired', l: 'Deal expired or no longer working' },
                { v: 'wrong_price', l: 'Price is wrong' },
                { v: 'spam', l: 'Spam or scam' },
                { v: 'inappropriate', l: 'Inappropriate content' },
                { v: 'other', l: 'Other' },
              ].map(r => (
                <button key={r.v} onClick={() => flagDeal(r.v)}
                  className="w-full text-left text-sm bg-white/5 hover:bg-white/10 text-white
                             px-3 py-2 rounded-md transition-colors">
                  {r.l}
                </button>
              ))}
            </div>
            <button onClick={() => setShowFlagModal(null)}
              className="w-full text-brand-gray text-xs mt-3 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
