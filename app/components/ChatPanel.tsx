'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type MicState = 'idle' | 'recording' | 'transcribing'

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

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return types.find(t => MediaRecorder.isTypeSupported(t)) ?? ''
}

function mimeToExt(mime: string): string {
  if (mime.includes('mp4'))  return 'mp4'
  if (mime.includes('ogg'))  return 'ogg'
  return 'webm'
}

const STARTERS = [
  'Top products by revenue?',
  'Which city has the most sales?',
  'Items with low stock?',
]

export default function ChatPanel() {
  const [open,           setOpen]           = useState(false)
  const [input,          setInput]          = useState('')
  const [messages,       setMessages]       = useState<Message[]>([])
  const [loading,        setLoading]        = useState(false)
  const [micState,       setMicState]       = useState<MicState>('idle')
  const [speakingIdx,    setSpeakingIdx]    = useState<number | null>(null)
  const [loadingAudioIdx, setLoadingAudioIdx] = useState<number | null>(null)

  const dataRef          = useRef<Record<string, unknown> | null>(null)
  const bottomRef        = useRef<HTMLDivElement>(null)
  const inputRef         = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef   = useRef<Blob[]>([])
  const currentAudioRef  = useRef<HTMLAudioElement | null>(null)
  const streamRef        = useRef<MediaStream | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      currentAudioRef.current?.pause()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const send = useCallback(async (text?: string) => {
    const question = (text ?? input).trim()
    if (!question || loading) return
    setInput('')
    setLoading(true)

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

    const history = messages
    setMessages(prev => [...prev, { role: 'user', content: question }])

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

  const toggleMic = async () => {
    if (micState === 'recording') {
      mediaRecorderRef.current?.stop()
      return
    }
    if (micState !== 'idle') return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()
      const recorder  = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      audioChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null

        const actualMime = recorder.mimeType || mimeType || 'audio/webm'
        const ext  = mimeToExt(actualMime)
        const blob = new Blob(audioChunksRef.current, { type: actualMime })

        setMicState('transcribing')
        try {
          const fd = new FormData()
          fd.append('file', new File([blob], `recording.${ext}`, { type: actualMime }))
          const res  = await fetch('/api/transcribe', { method: 'POST', body: fd })
          const json = await res.json()
          if (json.text) setInput(json.text)
        } catch { /* ignore */ }
        setMicState('idle')
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setMicState('recording')
    } catch {
      setMicState('idle')
    }
  }

  const speak = async (text: string, idx: number) => {
    if (speakingIdx === idx) {
      currentAudioRef.current?.pause()
      currentAudioRef.current = null
      setSpeakingIdx(null)
      return
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
      setSpeakingIdx(null)
    }

    setLoadingAudioIdx(idx)
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('Speech failed')

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const audio = new Audio(url)
      currentAudioRef.current = audio
      setLoadingAudioIdx(null)
      setSpeakingIdx(idx)

      audio.onended = () => {
        setSpeakingIdx(null)
        currentAudioRef.current = null
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        setSpeakingIdx(null)
        setLoadingAudioIdx(null)
        currentAudioRef.current = null
        URL.revokeObjectURL(url)
      }

      audio.play()
    } catch {
      setLoadingAudioIdx(null)
      setSpeakingIdx(null)
    }
  }

  const handleClose = () => {
    currentAudioRef.current?.pause()
    setSpeakingIdx(null)
    setLoadingAudioIdx(null)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => open ? handleClose() : setOpen(true)}
        aria-label="Toggle chat"
        className="flex items-center gap-2 rounded-full bg-[#0c0b0b] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          height: '2.75rem', paddingLeft: '1rem', paddingRight: '1rem',
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
            position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 9999,
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
              onClick={handleClose}
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
              <div
                key={i}
                className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-[#0c0b0b] text-white'
                      : 'rounded-bl-sm bg-[#f5f3ef] text-[#0f0e0e]'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Speaker button for AI replies */}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speak(msg.content, i)}
                    disabled={loadingAudioIdx !== null}
                    title={speakingIdx === i ? 'Stop' : 'Listen'}
                    className={`flex h-5 w-5 items-center justify-center rounded transition-colors disabled:opacity-30 ${
                      speakingIdx === i
                        ? 'text-[#0f0e0e]'
                        : 'text-[#c0bcb5] hover:text-[#5a5a5a]'
                    }`}
                  >
                    {loadingAudioIdx === i
                      ? <SpinnerIcon />
                      : speakingIdx === i
                      ? <SpeakerPlayingIcon />
                      : <SpeakerIcon />}
                  </button>
                )}
              </div>
            ))}

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
                placeholder={
                  micState === 'recording'    ? 'Recording…' :
                  micState === 'transcribing' ? 'Transcribing…' :
                  'Ask about sales, customers, inventory…'
                }
                rows={1}
                disabled={loading || micState !== 'idle'}
                className="flex-1 resize-none bg-transparent text-[13px] text-[#0f0e0e] placeholder-[#c0bcb5] outline-none disabled:opacity-50"
                style={{ maxHeight: '80px' }}
              />

              {/* Mic button */}
              <button
                onClick={toggleMic}
                disabled={loading}
                title={micState === 'recording' ? 'Stop recording' : 'Record voice'}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-30 ${
                  micState === 'recording'
                    ? 'animate-pulse bg-[#ef4444] text-white'
                    : micState === 'transcribing'
                    ? 'bg-[#f5f3ef] text-[#9a9a9a]'
                    : 'text-[#9a9a9a] hover:bg-[#f0eeea] hover:text-[#0f0e0e]'
                }`}
              >
                {micState === 'transcribing'
                  ? <SpinnerIcon />
                  : micState === 'recording'
                  ? <StopIcon />
                  : <MicIcon />}
              </button>

              {/* Send button */}
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

// ── Icons ──────────────────────────────────────────────────────────────────────

function ChatIcon({ small, muted }: { small?: boolean; muted?: boolean }) {
  const size   = small ? 12 : 18
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

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

function SpeakerPlayingIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
