import { supabase } from '../lib/supabase'
import RevenueChart from './components/RevenueChart'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function monthLabel(d: string) {
  return `${MONTHS[parseInt(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`
}
function monthSort(d: string) {
  return parseInt(d.slice(0, 4)) * 100 + parseInt(d.slice(5, 7))
}

function buildMonthlyChart(
  sales: Array<{ date: string; amount_sar: string | number }>,
  expenses: Array<{ date: string; amount_sar: string | number }>
) {
  const revMap = new Map<string, number>()
  const expMap = new Map<string, number>()
  const sortMap = new Map<string, number>()

  for (const s of sales) {
    const lbl = monthLabel(s.date)
    revMap.set(lbl, (revMap.get(lbl) ?? 0) + Number(s.amount_sar))
    if (!sortMap.has(lbl)) sortMap.set(lbl, monthSort(s.date))
  }
  for (const e of expenses) {
    const lbl = monthLabel(e.date)
    expMap.set(lbl, (expMap.get(lbl) ?? 0) + Number(e.amount_sar))
    if (!sortMap.has(lbl)) sortMap.set(lbl, monthSort(e.date))
  }

  const keys = [...new Set([...revMap.keys(), ...expMap.keys()])]
  return keys
    .sort((a, b) => (sortMap.get(a) ?? 0) - (sortMap.get(b) ?? 0))
    .map(month => ({
      month,
      revenue:  revMap.get(month) ?? 0,
      expenses: expMap.get(month) ?? 0,
    }))
}

function formatSAR(amount: number): string {
  if (amount >= 1_000_000) return `SAR ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000)     return `SAR ${(amount / 1_000).toFixed(1)}k`
  return `SAR ${amount.toLocaleString()}`
}

function calcChange(current: number, previous: number): string | null {
  if (previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%'
}

function isPositive(change: string | null) {
  if (!change) return null
  return !change.startsWith('-')
}

export default async function DashboardPage() {
  const [
    { data: salesData },
    { data: customersData },
    { data: recentSalesData },
    { data: feedbackData },
    { data: expensesData },
  ] = await Promise.all([
    supabase.from('sales').select('amount_sar, date').neq('status', 'Returned'),
    supabase.from('customers').select('loyalty_tier'),
    supabase
      .from('sales')
      .select('date, customer_name, product, amount_sar, status')
      .order('date', { ascending: false })
      .limit(6),
    supabase.from('feedback').select('rating, response_status'),
    supabase.from('expenses').select('date, amount_sar'),
  ])

  const sales       = salesData    ?? []
  const customers   = customersData ?? []
  const recentSales = recentSalesData ?? []
  const feedback    = feedbackData ?? []
  const expenses    = expensesData ?? []

  // All-time totals
  const totalRevenue = sales.reduce((s, r) => s + Number(r.amount_sar), 0)
  const totalOrders  = sales.length

  // Month-over-month: Feb 2026 vs Jan 2026
  const feb = sales.filter(s => s.date?.startsWith('2026-02'))
  const jan = sales.filter(s => s.date?.startsWith('2026-01'))
  const febRevenue = feb.reduce((s, r) => s + Number(r.amount_sar), 0)
  const janRevenue = jan.reduce((s, r) => s + Number(r.amount_sar), 0)
  const febOrders  = feb.length
  const janOrders  = jan.length
  const revenueChange = calcChange(febRevenue, janRevenue)
  const ordersChange  = calcChange(febOrders, janOrders)

  // Customers
  const totalCustomers = customers.length
  const platinumCount  = customers.filter(c => c.loyalty_tier === 'Platinum').length
  const goldCount      = customers.filter(c => c.loyalty_tier === 'Gold').length

  // Feedback
  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
      : '—'
  const pendingFeedback = feedback.filter(f => f.response_status === 'Pending').length

  // Chart data — real monthly revenue vs expenses
  const chartData = buildMonthlyChart(sales, expenses)
  const firstRev  = chartData[0]?.revenue ?? 0
  const lastRev   = chartData[chartData.length - 1]?.revenue ?? 0
  const growthRate = firstRev > 0
    ? (((lastRev - firstRev) / firstRev) * 100).toFixed(1)
    : '0'

  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatSAR(totalRevenue),
      change: revenueChange,
      up: isPositive(revenueChange),
      sub: 'Feb vs Jan 2026',
      iconBg: '#f0f0ef',
      iconColor: '#0f0e0e',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: ordersChange,
      up: isPositive(ordersChange),
      sub: 'Feb vs Jan 2026',
      iconBg: '#e6faf5',
      iconColor: '#10b981',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      title: 'Customers',
      value: totalCustomers.toLocaleString(),
      change: null,
      up: null,
      sub: `${platinumCount} Platinum · ${goldCount} Gold`,
      iconBg: '#f0eeff',
      iconColor: '#7c8ef0',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Avg Rating',
      value: avgRating,
      change: null,
      up: null,
      sub: `${pendingFeedback} pending response${pendingFeedback !== 1 ? 's' : ''}`,
      iconBg: '#fef3e6',
      iconColor: '#f59e0b',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ]

  const statusDot: Record<string, string> = {
    Completed:  '#10b981',
    Processing: '#f59e0b',
    Shipped:    '#6366f1',
    Returned:   '#ef4444',
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0f0e0e]">Dashboard</h1>
        <div className="flex items-center gap-2 rounded-lg border border-[#e8e4dc] bg-white px-3 py-1.5 shadow-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9a9a9a]">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8"  y1="2" x2="8"  y2="6" />
            <line x1="3"  y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[12px] text-[#5a5a5a]">Apr 27, 2026</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metricCards.map((card, i) => (
          <div
            key={card.title}
            className="metric-card flex flex-col gap-4 rounded-xl bg-white p-5"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)',
              animationDelay: `${0.06 + i * 0.07}s`,
            }}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
                {card.title}
              </p>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                <card.icon />
              </span>
            </div>
            <div>
              <p className="text-[26px] font-bold leading-none tracking-tight text-[#0f0e0e]">
                {card.value}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[12px]">
                {card.change && card.up === true  && (
                  <span className="font-semibold text-[#10b981]">↑ {card.change}</span>
                )}
                {card.change && card.up === false && (
                  <span className="font-semibold text-[#ef4444]">↓ {card.change}</span>
                )}
                <span className="text-[#9a9a9a]">{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue line chart */}
        <div
          className="col-span-2 rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">Revenue</p>
              <p className="mt-0.5 text-sm font-medium text-[#0f0e0e]">
                12 months — {chartData[0]?.month ?? ''} to {chartData[chartData.length - 1]?.month ?? ''}
              </p>
            </div>
            <span className="rounded-full bg-[#e6faf5] px-2.5 py-1 text-[11px] font-semibold text-[#10b981]">
              +{growthRate}%
            </span>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Recent sales */}
        <div
          className="rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">Recent Sales</p>
            <p className="mt-0.5 text-sm font-medium text-[#0f0e0e]">Latest orders</p>
          </div>
          <div className="flex flex-col gap-4">
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full ring-2 ring-[#f0eeea]"
                  style={{ background: statusDot[sale.status] ?? '#9a9a9a' }}
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[12px] font-medium leading-snug text-[#0f0e0e]">
                    {sale.customer_name ?? 'Walk-in customer'}
                  </span>
                  <span className="truncate text-[11px] leading-snug text-[#9a9a9a]">
                    {sale.product} · {formatSAR(Number(sale.amount_sar))}
                  </span>
                  <span className="text-[10px] text-[#c0bcb5]">
                    {new Date(sale.date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
