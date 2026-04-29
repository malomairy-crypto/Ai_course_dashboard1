'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const ANGLES = [
  'what is going well',
  'what to watch',
  'biggest opportunity',
  'biggest risk',
  'what changed vs last period',
] as const

type Angle = typeof ANGLES[number]

const ANGLE_LABELS: Record<Angle, string> = {
  'what is going well':        'Going Well',
  'what to watch':             'Watch',
  'biggest opportunity':       'Opportunity',
  'biggest risk':              'Risk',
  'what changed vs last period': 'vs Last Period',
}

const CACHE_KEY = 'insights_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000

interface Cache {
  bullets: string[]
  angle: Angle
  timestamp: number
}

async function buildMetrics() {
  const [sales, customers, feedback, expenses] = await Promise.all([
    supabase.from('sales').select('date, amount_sar, product, status').neq('status', 'Returned'),
    supabase.from('customers').select('loyalty_tier'),
    supabase.from('feedback').select('rating, response_status'),
    supabase.from('expenses').select('date, amount_sar'),
  ])

  const allSales     = sales.data     ?? []
  const allExpenses  = expenses.data  ?? []
  const allCustomers = customers.data ?? []
  const allFeedback  = feedback.data  ?? []

  const revByMonth: Record<string, number> = {}
  const ordsByMonth: Record<string, number> = {}
  const prodRev: Record<string, { revenue: number; orders: number }> = {}

  for (const s of allSales) {
    const m = s.date?.slice(0, 7) ?? 'unknown'
    revByMonth[m] = (revByMonth[m] ?? 0) + Number(s.amount_sar)
    ordsByMonth[m] = (ordsByMonth[m] ?? 0) + 1
    if (!prodRev[s.product]) prodRev[s.product] = { revenue: 0, orders: 0 }
    prodRev[s.product].revenue += Number(s.amount_sar)
    prodRev[s.product].orders  += 1
  }

  const expByMonth: Record<string, number> = {}
  for (const e of allExpenses) {
    const m = e.date?.slice(0, 7) ?? 'unknown'
    expByMonth[m] = (expByMonth[m] ?? 0) + Number(e.amount_sar)
  }

  const months = Object.keys(revByMonth).sort().reverse()
  const cur  = months[0] ?? 'n/a'
  const prev = months[1] ?? 'n/a'

  const tiers: Record<string, number> = {}
  for (const c of allCustomers) tiers[c.loyalty_tier] = (tiers[c.loyalty_tier] ?? 0) + 1

  const avgRating = allFeedback.length
    ? allFeedback.reduce((s, f) => s + f.rating, 0) / allFeedback.length
    : 0

  const topProducts = Object.entries(prodRev)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([product, { revenue, orders }]) => ({
      product,
      revenue_sar: Math.round(revenue),
      orders,
    }))

  return {
    revenue: {
      current_month:  { month: cur,  total_sar: Math.round(revByMonth[cur]  ?? 0), orders: ordsByMonth[cur]  ?? 0 },
      previous_month: { month: prev, total_sar: Math.round(revByMonth[prev] ?? 0), orders: ordsByMonth[prev] ?? 0 },
    },
    expenses: {
      current_month:  { month: cur,  total_sar: Math.round(expByMonth[cur]  ?? 0) },
      previous_month: { month: prev, total_sar: Math.round(expByMonth[prev] ?? 0) },
    },
    customers: { total: allCustomers.length, by_tier: tiers },
    feedback: {
      avg_rating:        parseFloat(avgRating.toFixed(1)),
      total_responses:   allFeedback.length,
      pending_responses: allFeedback.filter(f => f.response_status === 'Pending').length,
    },
    top_products_by_revenue: topProducts,
  }
}

function parseBullets(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const bullets = lines
    .filter(l => /^[•\-*]|^\d+\./.test(l))
    .map(l => l.replace(/^[•\-*]\s*|^\d+\.\s*/, ''))
    .slice(0, 3)
  return bullets.length >= 1 ? bullets : lines.slice(0, 3)
}

function timeAgo(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60_000)
  if (min < 1)   return 'just now'
  if (min < 60)  return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 24)    return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AiInsightsCard() {
  const [bullets,   setBullets]   = useState<string[]>([])
  const [angle,     setAngle]     = useState<Angle | ''>('')
  const [timestamp, setTimestamp] = useState<number | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [, tick]                  = useState(0)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const metrics     = await buildMetrics()
      const pickedAngle = ANGLES[Math.floor(Math.random() * ANGLES.length)]

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Focus on: ${pickedAngle}. Reply with exactly 3 concise bullet points — each starting with •, one per line. No intro, no headers, no extra text.`,
          data: metrics,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Request failed')

      const parsed = parseBullets(json.answer)
      const ts     = Date.now()
      setBullets(parsed)
      setAngle(pickedAngle)
      setTimestamp(ts)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ bullets: parsed, angle: pickedAngle, timestamp: ts } as Cache))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const cache: Cache = JSON.parse(raw)
        if (Date.now() - cache.timestamp < CACHE_TTL) {
          setBullets(cache.bullets)
          setAngle(cache.angle)
          setTimestamp(cache.timestamp)
          return
        }
      }
    } catch { /* corrupt cache — fetch fresh */ }
    fetchInsights()
  }, [fetchInsights])

  // Re-render every minute so "X min ago" stays current
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const hasCached = bullets.length > 0

  return (
    <div
      className="rounded-xl bg-white p-5"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
            AI Insights
          </p>
          {angle && (
            <p className="mt-0.5 text-sm font-medium text-[#0f0e0e]">
              {ANGLE_LABELS[angle]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {timestamp && (
            <span className="text-[11px] text-[#c0bcb5]">
              Updated {timeAgo(timestamp)}
            </span>
          )}
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-[#e8e4dc] bg-white px-3 py-1.5 text-[11px] font-medium text-[#5a5a5a] transition-opacity hover:opacity-70 disabled:opacity-40"
          >
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <path d="M21.5 2v6h-6" />
              <path d="M2.5 12A10 10 0 0 1 18.5 4.3L21.5 8" />
              <path d="M2.5 22v-6h6" />
              <path d="M21.5 12A10 10 0 0 1 5.5 19.7L2.5 16" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Skeleton — first load only */}
      {loading && !hasCached && (
        <div className="flex flex-col gap-3">
          {[72, 88, 60].map((w, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8e4dc]" />
              <div
                className="h-3.5 animate-pulse rounded bg-[#f0eeea]"
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Bullets (dimmed while refreshing) */}
      {hasCached && (
        <div className={`flex flex-col gap-3 transition-opacity duration-200 ${loading ? 'opacity-40' : 'opacity-100'}`}>
          {bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f0e0e]" />
              <p className="text-[13px] leading-relaxed text-[#3a3a3a]">{bullet}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-1 text-[12px] text-[#ef4444]">{error}</p>
      )}
    </div>
  )
}
