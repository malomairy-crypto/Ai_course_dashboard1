'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

async function fetchAllData() {
  const [sales, customers, products, expenses, inventory, feedback] = await Promise.all([
    supabase.from('sales').select('id, date, customer_id, product_id, amount_sar, status').limit(500),
    supabase.from('customers').select('id, name, city, loyalty_tier, total_spent_sar'),
    supabase.from('products').select('id, name, category, price_sar, cost_sar, stock_qty'),
    supabase.from('expenses').select('id, date, category, amount_sar').limit(300),
    supabase.from('inventory').select('product_id, qty_on_hand, reorder_at'),
    supabase.from('feedback').select('id, customer_id, rating, comment'),
  ])
  return {
    sales:     sales.data     ?? [],
    customers: customers.data ?? [],
    products:  products.data  ?? [],
    expenses:  expenses.data  ?? [],
    inventory: inventory.data ?? [],
    feedback:  feedback.data  ?? [],
  }
}

const STARTERS = [
  'Top products by revenue?',
  'Which city has the most sales?',
  'Items with low stock?',
]

export default function ChatPanel() {
  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(false)
  const dataRef    = useRef<Record<string, unknown> | null>(null)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const send = useCallback(async (text?: string) => {
    const question = (text ?? input).trim()
    if (!question || loading) return
    setInput('')
    setLoading(true)

    // Lazy-fetch Supabase data on first call
    if (!dataRef.current) {
      try {
        dataRef.current = await fetchAllData() as Record<string, unknown>
      } catch {
        setMessages(prev => [...prev,
          { role: 'user',      content: question },
          { role: 'assistant', content: 'Could not load data from Supabase. Please try again.' },
        ])
        setLoading(false)
        return
      }
    }

    // history = all turns so far (excludes current question)
    const history = messages
    const nextMessages: Message[] = [...messages, { role: 'user', content: question }]
    setMessages(nextMessages)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, data: dataRef.current, history }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Request failed')
      setMessages(prev => [...prev, { role: 'assistant', content: json.answer }])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle chat"
        className="flex items-center gap-2 rounded-full bg-[#0c0b0b] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          height: '2.75rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        {open ? <XIcon /> : <ChatIcon />}
        <span style={{ fontSize: '13px', fontWeight: 600 }}>
          {open ? 'Close' : 'Chat'}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="flex w-[390px] flex-col overflow-hidden rounded-2xl bg-white"
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '1.5rem',
            zIndex: 9999,
            height: '540px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#e8e4dc] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0c0b0b]">
                <ChatIcon small />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#0f0e0e]">Noor AI</p>
                <p className="text-[10px] text-[#9a9a9a]">Business analyst · Noor Trading Co.</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-[#9a9a9a] transition-colors hover:bg-[#f5f3ef] hover:text-[#0f0e0e]"
            >
              <XIcon small />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f3ef]">
                  <ChatIcon muted />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#0f0e0e]">Ask anything about your data</p>
                  <p className="mt-0.5 text-[11px] text-[#9a9a9a]">Sales · Customers · Products · Inventory</p>
                </div>
                <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                  {STARTERS.map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-[#e8e4dc] px-3 py-1 text-[11px] text-[#5a5a5a] transition-colors hover:bg-[#f5f3ef]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-[#0c0b0b] text-white'
                      : 'rounded-bl-sm bg-[#f5f3ef] text-[#0f0e0e]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-[#f5f3ef] px-4 py-3">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9a9a9a]"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-[#e8e4dc] p-3">
            <div className="flex items-end gap-2 rounded-xl border border-[#e8e4dc] bg-[#fafafa] px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about sales, customers, inventory…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-transparent text-[13px] text-[#0f0e0e] placeholder-[#c0bcb5] outline-none disabled:opacity-50"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0c0b0b] text-white transition-opacity hover:opacity-80 disabled:opacity-30"
              >
                <SendIcon />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-[#c0bcb5]">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </div>
      )}
    </>
  )
}

// ── Icon helpers ───────────────────────────────────────────────────────────────

function ChatIcon({ small, muted }: { small?: boolean; muted?: boolean }) {
  const size = small ? 12 : 18
  const stroke = muted ? '#9a9a9a' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function XIcon({ small }: { small?: boolean }) {
  const size = small ? 14 : 18
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}
