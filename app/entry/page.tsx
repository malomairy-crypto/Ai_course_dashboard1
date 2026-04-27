'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

type Tab = 'sale' | 'expense'

const SALE_CATEGORIES  = ['Electronics', 'Clothing', 'Home & Garden', 'Food & Beverage', 'Services']
const SALE_STATUSES    = ['Completed', 'Processing', 'Shipped', 'Returned']
const PAYMENT_METHODS  = ['Cash', 'Credit Card', 'Bank Transfer', 'Online Payment']
const EXPENSE_CATS     = ['Rent', 'Salaries', 'Utilities', 'Marketing', 'Supplies', 'Maintenance', 'Other']

const todayStr = () => new Date().toISOString().split('T')[0]

type SaleForm = {
  date: string; customer_name: string; product: string; category: string
  amount_sar: string; status: string; payment_method: string; notes: string
}
type ExpenseForm = {
  date: string; category: string; description: string
  amount_sar: string; payment_method: string; recurring: boolean
}
type Errors<T> = Partial<Record<keyof T, string>>

const emptySale    = (): SaleForm    => ({ date: todayStr(), customer_name: '', product: '', category: '', amount_sar: '', status: '', payment_method: '', notes: '' })
const emptyExpense = (): ExpenseForm => ({ date: todayStr(), category: '', description: '', amount_sar: '', payment_method: '', recurring: false })

function validateSale(f: SaleForm): Errors<SaleForm> {
  const e: Errors<SaleForm> = {}
  if (!f.date)                                                      e.date           = 'Required'
  if (!f.customer_name.trim())                                      e.customer_name  = 'Required'
  if (!f.product.trim())                                            e.product        = 'Required'
  if (!f.category)                                                  e.category       = 'Required'
  if (!f.amount_sar || isNaN(+f.amount_sar) || +f.amount_sar <= 0) e.amount_sar     = 'Enter a valid amount'
  if (!f.status)                                                    e.status         = 'Required'
  if (!f.payment_method)                                            e.payment_method = 'Required'
  return e
}

function validateExpense(f: ExpenseForm): Errors<ExpenseForm> {
  const e: Errors<ExpenseForm> = {}
  if (!f.date)                                                      e.date           = 'Required'
  if (!f.category)                                                  e.category       = 'Required'
  if (!f.description.trim())                                        e.description    = 'Required'
  if (!f.amount_sar || isNaN(+f.amount_sar) || +f.amount_sar <= 0) e.amount_sar     = 'Enter a valid amount'
  if (!f.payment_method)                                            e.payment_method = 'Required'
  return e
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#9a9a9a]">{label}</label>
      {children}
      {error && <p className="text-[11px] font-medium text-[#ef4444]">{error}</p>}
    </div>
  )
}

const inputBase = 'w-full rounded-lg border px-3 py-2.5 text-[13px] text-[#0f0e0e] outline-none transition-colors placeholder:text-[#c0bcb5] focus:border-[#0f0e0e]'
const inputCls  = (err?: string) => err
  ? `${inputBase} border-[#ef4444] bg-[#fff8f8]`
  : `${inputBase} border-[#e8e4dc] bg-white hover:border-[#c0bcb5]`

export default function EntryPage() {
  const [tab, setTab]                   = useState<Tab>('sale')
  const [sale, setSale]                 = useState<SaleForm>(emptySale)
  const [expense, setExpense]           = useState<ExpenseForm>(emptyExpense)
  const [saleErr, setSaleErr]           = useState<Errors<SaleForm>>({})
  const [expenseErr, setExpenseErr]     = useState<Errors<ExpenseForm>>({})
  const [loading, setLoading]           = useState(false)
  const [success, setSuccess]           = useState<string | null>(null)
  const [serverError, setServerError]   = useState<string | null>(null)

  function switchTab(t: Tab) {
    setTab(t)
    setSuccess(null)
    setServerError(null)
  }

  async function submitSale(e: React.FormEvent) {
    e.preventDefault()
    const errors = validateSale(sale)
    setSaleErr(errors)
    if (Object.keys(errors).length) return

    setLoading(true); setSuccess(null); setServerError(null)
    const { error } = await supabase.from('sales').insert({
      date:           sale.date,
      customer_name:  sale.customer_name.trim(),
      product:        sale.product.trim(),
      category:       sale.category,
      amount_sar:     +sale.amount_sar,
      status:         sale.status,
      payment_method: sale.payment_method,
      notes:          sale.notes.trim() || null,
    })
    setLoading(false)

    if (error) {
      setServerError(error.message)
    } else {
      setSuccess('Sale saved to Supabase.')
      setSale(emptySale()); setSaleErr({})
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  async function submitExpense(e: React.FormEvent) {
    e.preventDefault()
    const errors = validateExpense(expense)
    setExpenseErr(errors)
    if (Object.keys(errors).length) return

    setLoading(true); setSuccess(null); setServerError(null)
    const { error } = await supabase.from('expenses').insert({
      date:           expense.date,
      category:       expense.category,
      description:    expense.description.trim(),
      amount_sar:     +expense.amount_sar,
      payment_method: expense.payment_method,
      recurring:      expense.recurring,
    })
    setLoading(false)

    if (error) {
      setServerError(error.message)
    } else {
      setSuccess('Expense saved to Supabase.')
      setExpense(emptyExpense()); setExpenseErr({})
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0f0e0e]">Add Entry</h1>
        <p className="mt-1 text-[13px] text-[#9a9a9a]">Record daily business metrics directly to Supabase</p>
      </div>

      {/* Banners */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-[#bbf2da] bg-[#e6faf5] px-4 py-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-[13px] font-medium text-[#0a7f5a]">{success}</p>
        </div>
      )}
      {serverError && (
        <div className="flex items-center gap-3 rounded-xl border border-[#fecaca] bg-[#fff8f8] px-4 py-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[13px] font-medium text-[#dc2626]">{serverError}</p>
        </div>
      )}

      {/* Card */}
      <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}>

        {/* Tab switcher */}
        <div className="mb-6 flex gap-1 rounded-lg bg-[#f5f3ef] p-1">
          {(['sale', 'expense'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={[
                'flex-1 rounded-md py-2 text-[13px] font-medium transition-all duration-150 capitalize',
                tab === t ? 'bg-white text-[#0f0e0e] shadow-sm' : 'text-[#9a9a9a] hover:text-[#5a5a5a]',
              ].join(' ')}
            >
              {t === 'sale' ? 'Sale' : 'Expense'}
            </button>
          ))}
        </div>

        {/* ── Sale form ── */}
        {tab === 'sale' && (
          <form onSubmit={submitSale} noValidate className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <Field label="Date" error={saleErr.date}>
                <input type="date" value={sale.date}
                  onChange={e => setSale(s => ({ ...s, date: e.target.value }))}
                  className={inputCls(saleErr.date)} />
              </Field>
              <Field label="Amount (SAR)" error={saleErr.amount_sar}>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={sale.amount_sar}
                  onChange={e => setSale(s => ({ ...s, amount_sar: e.target.value }))}
                  className={inputCls(saleErr.amount_sar)} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Customer Name" error={saleErr.customer_name}>
                <input type="text" placeholder="e.g. Ahmed Al-Rashidi" value={sale.customer_name}
                  onChange={e => setSale(s => ({ ...s, customer_name: e.target.value }))}
                  className={inputCls(saleErr.customer_name)} />
              </Field>
              <Field label="Product" error={saleErr.product}>
                <input type="text" placeholder="e.g. Laptop Pro 15" value={sale.product}
                  onChange={e => setSale(s => ({ ...s, product: e.target.value }))}
                  className={inputCls(saleErr.product)} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <Field label="Category" error={saleErr.category}>
                <select value={sale.category}
                  onChange={e => setSale(s => ({ ...s, category: e.target.value }))}
                  className={inputCls(saleErr.category)}>
                  <option value="">Select…</option>
                  {SALE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Status" error={saleErr.status}>
                <select value={sale.status}
                  onChange={e => setSale(s => ({ ...s, status: e.target.value }))}
                  className={inputCls(saleErr.status)}>
                  <option value="">Select…</option>
                  {SALE_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Payment Method" error={saleErr.payment_method}>
                <select value={sale.payment_method}
                  onChange={e => setSale(s => ({ ...s, payment_method: e.target.value }))}
                  className={inputCls(saleErr.payment_method)}>
                  <option value="">Select…</option>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Notes (optional)">
              <textarea rows={3} placeholder="Any additional notes…" value={sale.notes}
                onChange={e => setSale(s => ({ ...s, notes: e.target.value }))}
                className={`${inputCls()} resize-none`} />
            </Field>

            <div className="flex items-center justify-between border-t border-[#f0ede8] pt-5">
              <p className="text-[12px] text-[#c0bcb5]">All fields marked required unless stated otherwise</p>
              <button type="submit" disabled={loading}
                className="rounded-lg bg-[#0f0e0e] px-6 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-75 disabled:opacity-40">
                {loading ? 'Saving…' : 'Save Sale'}
              </button>
            </div>
          </form>
        )}

        {/* ── Expense form ── */}
        {tab === 'expense' && (
          <form onSubmit={submitExpense} noValidate className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <Field label="Date" error={expenseErr.date}>
                <input type="date" value={expense.date}
                  onChange={e => setExpense(ex => ({ ...ex, date: e.target.value }))}
                  className={inputCls(expenseErr.date)} />
              </Field>
              <Field label="Amount (SAR)" error={expenseErr.amount_sar}>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={expense.amount_sar}
                  onChange={e => setExpense(ex => ({ ...ex, amount_sar: e.target.value }))}
                  className={inputCls(expenseErr.amount_sar)} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Category" error={expenseErr.category}>
                <select value={expense.category}
                  onChange={e => setExpense(ex => ({ ...ex, category: e.target.value }))}
                  className={inputCls(expenseErr.category)}>
                  <option value="">Select…</option>
                  {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Payment Method" error={expenseErr.payment_method}>
                <select value={expense.payment_method}
                  onChange={e => setExpense(ex => ({ ...ex, payment_method: e.target.value }))}
                  className={inputCls(expenseErr.payment_method)}>
                  <option value="">Select…</option>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Description" error={expenseErr.description}>
              <input type="text" placeholder="e.g. Monthly office rent" value={expense.description}
                onChange={e => setExpense(ex => ({ ...ex, description: e.target.value }))}
                className={inputCls(expenseErr.description)} />
            </Field>

            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={expense.recurring}
                onChange={e => setExpense(ex => ({ ...ex, recurring: e.target.checked }))}
                className="h-4 w-4 rounded accent-[#0f0e0e]" />
              <span className="text-[13px] text-[#5a5a5a]">Recurring expense</span>
            </label>

            <div className="flex items-center justify-between border-t border-[#f0ede8] pt-5">
              <p className="text-[12px] text-[#c0bcb5]">All fields marked required unless stated otherwise</p>
              <button type="submit" disabled={loading}
                className="rounded-lg bg-[#0f0e0e] px-6 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-75 disabled:opacity-40">
                {loading ? 'Saving…' : 'Save Expense'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}