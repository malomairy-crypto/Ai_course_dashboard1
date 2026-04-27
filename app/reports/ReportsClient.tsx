'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export type ReportRow = {
  label:    string
  revenue:  number
  expenses: number
  orders:   number
}

export type ReportsData = {
  monthly:   ReportRow[]
  quarterly: ReportRow[]
  annual:    ReportRow[]
  category:  ReportRow[]
}

type TimeFrame = 'monthly' | 'quarterly' | 'annual' | 'category'

const TABS: { key: TimeFrame; label: string; range: string }[] = [
  { key: 'monthly',   label: 'Monthly',      range: 'Mar 2025 – Feb 2026' },
  { key: 'quarterly', label: 'Quarterly',    range: 'Q1 2025 – Q1 2026'   },
  { key: 'annual',    label: 'Annual',       range: '2025 & 2026'          },
  { key: 'category',  label: 'By Category',  range: 'All time'             },
]

const TABLE_CONFIG: Record<TimeFrame, { headers: string[]; keys: string[] }> = {
  monthly:   { headers: ['Month',    'Revenue', 'Expenses', 'Net Profit', 'Orders'], keys: ['label', 'revenue', 'expenses', 'profit', 'orders'] },
  quarterly: { headers: ['Quarter',  'Revenue', 'Expenses', 'Net Profit', 'Orders'], keys: ['label', 'revenue', 'expenses', 'profit', 'orders'] },
  annual:    { headers: ['Year',     'Revenue', 'Expenses', 'Net Profit', 'Orders'], keys: ['label', 'revenue', 'expenses', 'profit', 'orders'] },
  category:  { headers: ['Category', 'Revenue', 'Orders',  '% Share'],               keys: ['label', 'revenue', 'orders',  'share']            },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Electronics':     '#111111',
  'Clothing':        '#10b981',
  'Home & Garden':   '#6366f1',
  'Food & Beverage': '#f59e0b',
  'Services':        '#8b5cf6',
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return '+0.0%'
  const d = ((curr - prev) / prev) * 100
  return `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`
}

function formatCell(key: string, row: ReportRow, catTotal: number): string {
  switch (key) {
    case 'label':    return row.label
    case 'revenue':  return `SAR ${row.revenue.toLocaleString()}`
    case 'expenses': return `SAR ${row.expenses.toLocaleString()}`
    case 'profit':   return `SAR ${(row.revenue - row.expenses).toLocaleString()}`
    case 'orders':   return row.orders.toLocaleString()
    case 'share':    return catTotal > 0 ? `${((row.revenue / catTotal) * 100).toFixed(1)}%` : '—'
    default:         return ''
  }
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[#e8e4dc] bg-white px-4 py-3 shadow-lg">
      {label && <p className="mb-2 text-[11px] font-semibold text-[#9a9a9a]">{label}</p>}
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: e.color }} />
          <span className="text-[12px] text-[#5a5a5a]">
            {e.name.charAt(0).toUpperCase() + e.name.slice(1)}:{' '}
            <span className="font-semibold text-[#0f0e0e]">
              SAR {e.value.toLocaleString()}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsClient({ data }: { data: ReportsData }) {
  const [frame, setFrame] = useState<TimeFrame>('monthly')

  const rows    = data[frame]
  const tab     = TABS.find((t) => t.key === frame)!
  const isCategory = frame === 'category'
  const catTotal   = isCategory ? rows.reduce((s, r) => s + r.revenue, 0) : 0

  // KPI cards
  const current = rows[rows.length - 1]
  const prev    = rows[rows.length - 2] ?? rows[rows.length - 1]

  const kpis = isCategory
    ? rows.slice(0, 4).map((row) => ({
        label:  row.label,
        value:  `SAR ${(row.revenue / 1000).toFixed(1)}k`,
        change: catTotal > 0 ? `${((row.revenue / catTotal) * 100).toFixed(1)}%` : '—',
        up:     null as boolean | null,
        accent: CATEGORY_COLORS[row.label] ?? '#9a9a9a',
        sub:    `${row.orders} orders`,
      }))
    : [
        {
          label:  'Revenue',
          value:  `SAR ${current.revenue.toLocaleString()}`,
          change: pctChange(current.revenue, prev.revenue),
          up:     current.revenue >= prev.revenue,
          accent: '#0f0e0e',
          sub:    'total income',
        },
        {
          label:  'Expenses',
          value:  `SAR ${current.expenses.toLocaleString()}`,
          change: pctChange(current.expenses, prev.expenses),
          up:     current.expenses <= prev.expenses,
          accent: '#f59e0b',
          sub:    'operating costs',
        },
        {
          label:  'Net Profit',
          value:  `SAR ${(current.revenue - current.expenses).toLocaleString()}`,
          change: pctChange(
            current.revenue - current.expenses,
            prev.revenue - prev.expenses
          ),
          up:     (current.revenue - current.expenses) >= (prev.revenue - prev.expenses),
          accent: '#10b981',
          sub:    'after expenses',
        },
        {
          label:  'Orders',
          value:  current.orders.toLocaleString(),
          change: pctChange(current.orders, prev.orders),
          up:     current.orders >= prev.orders,
          accent: '#8b5cf6',
          sub:    'transactions',
        },
      ]

  const table = TABLE_CONFIG[frame]
  const pluralLabel: Record<TimeFrame, string> = {
    monthly: 'months', quarterly: 'quarters', annual: 'years', category: 'categories',
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">
            Sales Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0f0e0e]">Reports</h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#e8e4dc] bg-white px-3 py-1.5">
          <span className="font-mono text-[11px] text-[#9a9a9a]">{tab.range}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-xl border border-[#e8e4dc] bg-white p-1"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: 'fit-content' }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFrame(t.key)}
            className={[
              'rounded-lg px-5 py-2 text-[13px] font-medium transition-all duration-150',
              frame === t.key
                ? 'bg-[#0f0e0e] text-white shadow-sm'
                : 'text-[#5a5a5a] hover:bg-[#f5f3ef]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="metric-card relative flex flex-col gap-4 overflow-hidden rounded-xl bg-white p-5"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)',
              animationDelay: `${0.05 + i * 0.06}s`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: k.accent }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              {k.label}
            </span>
            <div>
              <p className="font-mono text-[22px] font-bold leading-none tracking-tight text-[#0f0e0e]">
                {k.value}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                  style={{
                    color: k.up === null
                      ? k.accent
                      : k.up ? '#10b981' : '#f56565',
                    background: k.up === null
                      ? `${k.accent}18`
                      : k.up ? '#10b98118' : '#f5656518',
                  }}
                >
                  {k.change}
                </span>
                <span className="text-[11px] text-[#c0bcb5]">{k.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        className="rounded-xl bg-white p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              {isCategory ? 'Revenue by Category' : 'Revenue vs Expenses'}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a5a5a]">{tab.range}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#111111]" />
              <span className="font-mono text-[10px] text-[#9a9a9a]">Revenue</span>
            </div>
            {!isCategory && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-[#d4cfc8]" />
                <span className="font-mono text-[10px] text-[#9a9a9a]">Expenses</span>
              </div>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rows} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barGap={2}>
            <CartesianGrid stroke="#f5f3ef" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#9a9a9a', fontFamily: 'var(--font-geist-mono)' }}
              tickFormatter={(v: string) => {
                if (frame === 'quarterly') return v.replace(' ', '\n').split(' ')[0]
                if (frame === 'monthly')   return v.split(' ')[0]
                return v
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9a9a9a', fontFamily: 'var(--font-geist-mono)' }}
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1_000   ? `${(v / 1_000).toFixed(0)}k`
                :                String(v)
              }
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            {!isCategory && (
              <Bar dataKey="expenses" name="expenses" fill="#d4cfc8" radius={[3, 3, 0, 0]} />
            )}
            <Bar dataKey="revenue" name="revenue" fill="#111111" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div
        className="rounded-xl bg-white"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between border-b border-[#e8e4dc] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              {tab.label} Breakdown
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a5a5a]">{tab.range}</p>
          </div>
          <span className="rounded-full border border-[#e8e4dc] px-3 py-1 font-mono text-[11px] text-[#9a9a9a]">
            {rows.length} {pluralLabel[frame]}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e4dc]">
                {table.headers.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#c0bcb5]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={[
                    'border-b border-[#f5f3ef] transition-colors hover:bg-[#f5f4f1]',
                    i === rows.length - 1 ? 'border-transparent bg-[#f5f4f1]' : '',
                  ].join(' ')}
                >
                  {table.keys.map((key, j) => (
                    <td
                      key={key}
                      className={[
                        'px-5 py-3.5',
                        j === 0
                          ? 'text-[13px] font-medium text-[#5a5a5a]'
                          : key === 'revenue'
                          ? 'font-mono text-[13px] font-semibold text-[#0f0e0e]'
                          : key === 'expenses'
                          ? 'font-mono text-[13px] text-[#f59e0b]'
                          : key === 'profit'
                          ? 'font-mono text-[13px] font-semibold text-[#10b981]'
                          : 'font-mono text-[12px] text-[#9a9a9a]',
                      ].join(' ')}
                    >
                      {formatCell(key, row, catTotal)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
