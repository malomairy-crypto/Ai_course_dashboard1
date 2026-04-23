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
import {
  dailyData,
  weeklyReportData,
  quarterlyData,
  annualData,
} from '../../frontend-sample-data'

type TimeFrame = 'daily' | 'weekly' | 'quarterly' | 'annual'
type Row = Record<string, string | number>

const TABS: { key: TimeFrame; label: string; range: string }[] = [
  { key: 'daily',     label: 'Daily',     range: 'Apr 17 – Apr 23, 2026' },
  { key: 'weekly',    label: 'Weekly',    range: 'Feb 24 – Apr 14, 2026' },
  { key: 'quarterly', label: 'Quarterly', range: 'FY2025 · 4 Quarters'   },
  { key: 'annual',    label: 'Annual',    range: 'FY2023 – FY2025'       },
]

const TABLE_CONFIG: Record<TimeFrame, { headers: string[]; keys: string[] }> = {
  daily: {
    headers: ['Day', 'Revenue', 'Orders', 'Customers', 'Avg Ticket'],
    keys:    ['day', 'revenue', 'orders', 'customers', 'avgTicket'],
  },
  weekly: {
    headers: ['Week of', 'Revenue', 'Orders', 'Customers', 'Avg Ticket'],
    keys:    ['week',    'revenue', 'orders', 'customers', 'avgTicket'],
  },
  quarterly: {
    headers: ['Quarter', 'Revenue', 'Expenses', 'Net Profit', 'Orders', 'Customers'],
    keys:    ['quarter', 'revenue', 'expenses', 'profit',     'orders', 'customers'],
  },
  annual: {
    headers: ['Year', 'Revenue', 'Expenses', 'Net Profit', 'Orders', 'Customers'],
    keys:    ['year', 'revenue', 'expenses', 'profit',     'orders', 'customers'],
  },
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return '+0.0%'
  const d = ((curr - prev) / prev) * 100
  return `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`
}

function formatCell(key: string, row: Row): string {
  const r = row.revenue  as number
  const e = (row.expenses ?? 0) as number
  const o = row.orders   as number
  if (key === 'avgTicket') return `SAR ${(r / o).toFixed(1)}`
  if (key === 'profit')    return `SAR ${(r - e).toLocaleString()}`
  if (key === 'revenue' || key === 'expenses') return `SAR ${(row[key] as number).toLocaleString()}`
  if (key === 'orders' || key === 'customers') return (row[key] as number).toLocaleString()
  return String(row[key])
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[#e6eaf4] bg-white px-4 py-3 shadow-lg">
      {label && <p className="mb-2 text-[11px] font-semibold text-[#9aa5b8]">{label}</p>}
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: e.color }} />
          <span className="text-[12px] text-[#5a6a85]">
            {e.name.charAt(0).toUpperCase() + e.name.slice(1)}:{' '}
            <span className="font-semibold text-[#1a2232]">
              {e.name === 'revenue' || e.name === 'expenses'
                ? `SAR ${e.value.toLocaleString()}`
                : e.value.toLocaleString()}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [frame, setFrame] = useState<TimeFrame>('weekly')

  const dataMap: Record<TimeFrame, Row[]> = {
    daily:     dailyData        as Row[],
    weekly:    weeklyReportData as Row[],
    quarterly: quarterlyData    as Row[],
    annual:    annualData       as Row[],
  }

  const xKeyMap: Record<TimeFrame, string> = {
    daily: 'day', weekly: 'week', quarterly: 'quarter', annual: 'year',
  }

  const data    = dataMap[frame]
  const current = data[data.length - 1]
  const prev    = data[data.length - 2]
  const tab     = TABS.find((t) => t.key === frame)!
  const hasExpenses = frame === 'quarterly' || frame === 'annual'

  const cr  = current.revenue   as number
  const pr  = prev.revenue      as number
  const ce  = (current.expenses ?? 0) as number
  const pe  = (prev.expenses    ?? 0) as number
  const co  = current.orders    as number
  const po  = prev.orders       as number
  const cc  = current.customers as number
  const pc  = prev.customers    as number

  const kpis = hasExpenses
    ? [
        { label: 'Revenue',    value: `SAR ${cr.toLocaleString()}`,           change: pctChange(cr, pr),                    up: cr >= pr,                   accent: '#4a7de8', sub: 'total income'   },
        { label: 'Expenses',   value: `SAR ${ce.toLocaleString()}`,           change: pctChange(ce, pe),                    up: ce <= pe,                   accent: '#f59e0b', sub: 'operating costs' },
        { label: 'Net Profit', value: `SAR ${(cr - ce).toLocaleString()}`,    change: pctChange(cr - ce, pr - pe),          up: (cr - ce) >= (pr - pe),     accent: '#10b981', sub: 'after expenses'  },
        { label: 'Orders',     value: co.toLocaleString(),                    change: pctChange(co, po),                    up: co >= po,                   accent: '#8b5cf6', sub: 'transactions'    },
      ]
    : [
        { label: 'Revenue',    value: `SAR ${cr.toLocaleString()}`,           change: pctChange(cr, pr),                    up: cr >= pr,                   accent: '#4a7de8', sub: tab.range         },
        { label: 'Orders',     value: co.toLocaleString(),                    change: pctChange(co, po),                    up: co >= po,                   accent: '#f97316', sub: 'transactions'    },
        { label: 'Customers',  value: cc.toLocaleString(),                    change: pctChange(cc, pc),                    up: cc >= pc,                   accent: '#10b981', sub: 'unique visits'   },
        { label: 'Avg Ticket', value: `SAR ${(cr / co).toFixed(1)}`,          change: pctChange(cr / co, pr / po),          up: (cr / co) >= (pr / po),     accent: '#8b5cf6', sub: 'per order'       },
      ]

  const table = TABLE_CONFIG[frame]

  const pluralLabel: Record<TimeFrame, string> = {
    daily: 'days', weekly: 'weeks', quarterly: 'quarters', annual: 'years',
  }

  return (
    <div className="flex flex-col gap-8 p-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa5b8]">
            Riyadh Roast
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1a2232]">Reports</h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#e6eaf4] bg-white px-3 py-1.5">
          <span className="font-mono text-[11px] text-[#9aa5b8]">{tab.range}</span>
        </div>
      </div>

      {/* Time-frame tab bar */}
      <div
        className="flex gap-1 rounded-xl border border-[#e6eaf4] bg-white p-1"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: 'fit-content' }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFrame(t.key)}
            className={[
              'rounded-lg px-5 py-2 text-[13px] font-medium transition-all duration-150',
              frame === t.key
                ? 'bg-[#4a7de8] text-white shadow-sm'
                : 'text-[#5a6a85] hover:bg-[#f0f2f8]',
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
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(99,115,163,0.09)',
              animationDelay: `${0.05 + i * 0.06}s`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: k.accent }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9aa5b8]">
              {k.label}
            </span>
            <div>
              <p className="font-mono text-[22px] font-bold leading-none tracking-tight text-[#1a2232]">
                {k.value}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                  style={{
                    color:      k.up ? '#10b981' : '#f56565',
                    background: k.up ? '#10b98118' : '#f5656518',
                  }}
                >
                  {k.change}
                </span>
                <span className="text-[11px] text-[#b8c0d0]">{k.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div
        className="rounded-xl bg-white p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(99,115,163,0.09)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9aa5b8]">
              Revenue {hasExpenses ? 'vs Expenses' : 'Overview'}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a6a85]">{tab.range}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#7c8ef0]" />
              <span className="font-mono text-[10px] text-[#9aa5b8]">Revenue</span>
            </div>
            {hasExpenses && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-[#e6eaf4]" />
                <span className="font-mono text-[10px] text-[#9aa5b8]">Expenses</span>
              </div>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barGap={2}>
            <CartesianGrid stroke="#f0f2f8" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey={xKeyMap[frame]}
              tick={{ fontSize: 10, fill: '#9aa5b8', fontFamily: 'var(--font-geist-mono)' }}
              tickFormatter={(v: string) => {
                if (frame === 'daily')     return v.split(' ').slice(1).join(' ')
                if (frame === 'quarterly') return v.split(' ')[0]
                return v
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9aa5b8', fontFamily: 'var(--font-geist-mono)' }}
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1_000   ? `${(v / 1_000).toFixed(0)}k`
                :                String(v)
              }
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,115,163,0.04)' }} />
            {hasExpenses && (
              <Bar dataKey="expenses" name="expenses" fill="#e6eaf4" radius={[3, 3, 0, 0]} />
            )}
            <Bar dataKey="revenue" name="revenue" fill="#7c8ef0" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div
        className="rounded-xl bg-white"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(99,115,163,0.09)' }}
      >
        <div className="flex items-center justify-between border-b border-[#e6eaf4] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9aa5b8]">
              {tab.label} Breakdown
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a6a85]">{tab.range}</p>
          </div>
          <span className="rounded-full border border-[#e6eaf4] px-3 py-1 font-mono text-[11px] text-[#9aa5b8]">
            {data.length} {pluralLabel[frame]}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e6eaf4]">
                {table.headers.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#b8c0d0]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className={[
                    'border-b border-[#f0f2f8] transition-colors hover:bg-[#f8f9fc]',
                    i === data.length - 1 ? 'border-transparent bg-[#f8f9fc]' : '',
                  ].join(' ')}
                >
                  {table.keys.map((key, j) => (
                    <td
                      key={key}
                      className={[
                        'px-5 py-3.5',
                        j === 0
                          ? 'text-[13px] font-medium text-[#5a6a85]'
                          : key === 'revenue'
                          ? 'font-mono text-[13px] font-semibold text-[#4a7de8]'
                          : key === 'expenses'
                          ? 'font-mono text-[13px] text-[#f59e0b]'
                          : key === 'profit'
                          ? 'font-mono text-[13px] font-semibold text-[#10b981]'
                          : 'font-mono text-[12px] text-[#9aa5b8]',
                      ].join(' ')}
                    >
                      {formatCell(key, row)}
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
