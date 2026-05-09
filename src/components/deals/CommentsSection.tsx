'use client'

import { useEffect, useState } from 'react'

type Comment = {
  id: number
  body: string
  parent_id: number | null
  upvote_count: number
  flag_count: number
  created_at: string
  users: {
    id: number
    username: string | null
    display_name: string | null
    avatar_url: string | null
    karma_score: number
  } | null
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function CommentsSection({ dealId }: { dealId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<number | null>(null)

  useEffect(() => {
    loadComments()
  }, [dealId])

  async function loadComments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/deals/${dealId}/comments`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {}
    setLoading(false)
  }

  async function postComment() {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/deals/${dealId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text.trim(), parent_id: replyTo }),
      })
      const data = await res.json()
      if (res.ok) {
        setText('')
        setReplyTo(null)
        loadComments()
      } else if (res.status === 401) {
        setError('Please sign in to comment')
      } else {
        setError(data.message || data.error || 'Failed to post')
      }
    } catch {
      setError('Network error')
    }
    setSubmitting(false)
  }

  async function flagComment(commentId: number) {
    if (!confirm('Flag this comment as inappropriate, spam, or misleading?')) return
    try {
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'comment',
          target_id: commentId,
          reason: 'inappropriate',
        }),
      })
      if (res.ok) {
        alert('Thanks — moderators will review this comment.')
      } else if (res.status === 401) {
        alert('Sign in to flag content.')
      }
    } catch {}
  }

  // Build threaded tree
  const topLevel = comments.filter(c => !c.parent_id)
  const replies = (parentId: number) => comments.filter(c => c.parent_id === parentId)

  function renderComment(c: Comment, depth: number = 0): JSX.Element {
    const author = c.users?.display_name || c.users?.username || 'Anonymous'
    const initial = author[0]?.toUpperCase() || 'A'
    return (
      <div key={c.id} className={depth > 0 ? 'ml-6 pl-4 border-l border-brand-dark-4' : ''}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-red to-brand-dark-4
                          flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-white font-bold text-sm">{author}</span>
              {c.users?.karma_score != null && c.users.karma_score > 0 && (
                <span className="text-brand-gold text-[10px] font-mono">★ {c.users.karma_score}</span>
              )}
              <span className="text-brand-gray text-xs">{timeAgo(c.created_at)}</span>
            </div>
            <p className="text-white/90 text-sm whitespace-pre-wrap break-words leading-relaxed">{c.body}</p>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                className="text-brand-gray hover:text-brand-red text-xs font-medium transition-colors">
                {replyTo === c.id ? 'Cancel' : 'Reply'}
              </button>
              <button onClick={() => flagComment(c.id)}
                className="text-brand-gray hover:text-brand-red text-xs transition-colors"
                title="Report this comment">
                ⚠ Flag
              </button>
            </div>
          </div>
        </div>

        {replyTo === c.id && (
          <div className="ml-12 mt-3">
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder={`Reply to ${author}...`} rows={2}
              className="w-full bg-brand-dark-2 border border-brand-dark-4 text-white text-sm rounded-md p-3
                         focus:outline-none focus:border-brand-red transition-colors resize-none" />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { setReplyTo(null); setText('') }}
                className="text-brand-gray hover:text-white text-xs px-3 py-1.5">Cancel</button>
              <button onClick={postComment} disabled={submitting || !text.trim()}
                className="bg-brand-red hover:bg-brand-red/80 disabled:bg-brand-dark-4 disabled:text-brand-gray
                           text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-md transition-colors">
                {submitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {replies(c.id).map(r => renderComment(r, depth + 1))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-brand-dark-3 border border-brand-dark-4 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-900 text-white uppercase tracking-tight">
          💬 Discussion
        </h3>
        <span className="text-xs text-brand-gray">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Top-level composer */}
      {!replyTo && (
        <div className="mb-6">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share your experience or ask a question..." rows={3}
            className="w-full bg-brand-dark-2 border border-brand-dark-4 text-white text-sm rounded-md p-3
                       focus:outline-none focus:border-brand-red transition-colors resize-none" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-brand-gray text-xs">
              {text.length}/2000 chars
            </span>
            <button onClick={postComment} disabled={submitting || !text.trim()}
              className="bg-brand-red hover:bg-brand-red/80 disabled:bg-brand-dark-4 disabled:text-brand-gray
                         text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-md transition-colors">
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
          {error && <div className="text-brand-red text-xs mt-2">{error}</div>}
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="bg-brand-dark-4 h-16 rounded-md animate-pulse" />)}
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-brand-gray text-sm text-center py-6">
          No comments yet. Be the first to share your thoughts on this deal.
        </p>
      ) : (
        <div className="space-y-6">
          {topLevel.map(c => renderComment(c, 0))}
        </div>
      )}
    </div>
  )
}
