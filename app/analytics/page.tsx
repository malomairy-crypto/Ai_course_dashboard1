import { supabase } from '../../lib/supabase'
import {
  MonthlyRevenueChart,
  MonthlyComparisonChart,
  SalesByCategoryChart,
} from '../components/AnalyticsCharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CATEGORY_COLORS: Record<string, string> = {
  'Electronics':    '#111111',
  'Clothing':       '#10b981',
  'Home & Garden':  '#6366f1',
  'Food & Beverage':'#f59e0b',
  'Services':       '#8b5cf6',
}

function monthLabel(d: string) {
  return `${MONTHS[parseInt(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`
}
function monthSort(d: string) {
  return parseInt(d.slice(0, 4)) * 100 + parseInt(d.slice(5, 7))
}

function buildMonthly(
  sales: Array<{ date: string; amount_sar: string | number }>,
  expenses: Array<{ date: string; amount_sar: string | number }>
) {
  const revMap  = new Map<string, number>()
  const expMap  = new Map<string, number>()
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

const statusStyles: Record<string, string> = {
  Completed:  'bg-[#e6faf5] text-[#10b981] border-[#a7f3d0]',
  Processing: 'bg-[#fef3e6] text-[#f59e0b] border-[#fcd34d]',
  Shipped:    'bg-[#eff0ff] text-[#6366f1] border-[#c7d2fe]',
  Returned:   'bg-[#fef2f2] text-[#ef4444] border-[#fca5a5]',
}

export default async function AnalyticsPage() {
  const [
    { data: salesRaw },
    { data: expensesRaw },
    { data: recentOrdersRaw },
  ] = await Promise.all([
    supabase.from('sales').select('date, amount_sar, category, status'),
    supabase.from('expenses').select('date, amount_sar'),
    supabase
      .from('sales')
      .select('id, date, customer_name, product, amount_sar, status')
      .order('date', { ascending: false })
      .limit(10),
  ])

  const allSales     = salesRaw      ?? []
  const expenses     = expensesRaw   ?? []
  const recentOrders = recentOrdersRaw ?? []

  const completedSales = allSales.filter(s => s.status !== 'Returned')
  const totalRevenue   = completedSales.reduce((s, r) => s + Number(r.amount_sar), 0)
  const totalExpenses  = expenses.reduce((s, e) => s + Number(e.amount_sar), 0)

  // Monthly chart data
  const monthlyData    = buildMonthly(completedSales, expenses)
  const monthlyRevenue = monthlyData.map(({ month, revenue }) => ({ month, revenue }))

  // Peak month
  const topMonth = monthlyData.reduce(
    (a, b) => (a.revenue > b.revenue ? a : b),
    { month: '—', revenue: 0, expenses: 0 }
  )

  // Category donut
  const catMap = new Map<string, number>()
  for (const s of completedSales) {
    catMap.set(s.category, (catMap.get(s.category) ?? 0) + Number(s.amount_sar))
  }
  const categoryData = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, value]) => ({
      category,
      value,
      color: CATEGORY_COLORS[category] ?? '#9a9a9a',
    }))

  const topCategory    = categoryData[0] ?? { category: '—', value: 0, color: '#9a9a9a' }
  const topCategoryPct = totalRevenue > 0
    ? ((topCategory.value / totalRevenue) * 100).toFixed(0)
    : '0'

  const avgOrderValue = completedSales.length > 0
    ? Math.round(totalRevenue / completedSales.length)
    : 0

  const completedCount = allSales.filter(s => s.status === 'Completed').length
  const completionRate = allSales.length > 0
    ? ((completedCount / allSales.length) * 100).toFixed(0)
    : '0'

  const topStats = [
    {
      label:  'Top Category',
      value:  topCategory.category,
      change: `${topCategoryPct}%`,
      period: 'of total revenue',
      accent: CATEGORY_COLORS[topCategory.category] ?? '#111111',
    },
    {
      label:  'Avg Order Value',
      value:  `SAR ${avgOrderValue}`,
      change: `${completedSales.length} orders`,
      period: 'all time',
      accent: '#10b981',
    },
    {
      label:  'Total Expenses',
      value:  `SAR ${(totalExpenses / 1000).toFixed(0)}k`,
      change: totalRevenue > 0 ? `${((totalExpenses / totalRevenue) * 100).toFixed(0)}%` : '—',
      period: 'of revenue',
      accent: '#f97316',
    },
    {
      label:  'Completion Rate',
      value:  `${completionRate}%`,
      change: `${completedCount} orders`,
      period: `of ${allSales.length} total`,
      accent: '#6366f1',
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">
            Mar 2025 – Feb 2026
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0f0e0e]">Analytics</h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#e8e4dc] bg-white px-3 py-1.5">
          <span className="font-mono text-[11px] text-[#9a9a9a]">12 months</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {topStats.map((s, i) => (
          <div
            key={s.label}
            className="metric-card relative flex flex-col gap-4 overflow-hidden rounded-xl bg-white p-5"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)',
              animationDelay: `${0.05 + i * 0.06}s`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: s.accent }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              {s.label}
            </span>
            <div>
              <p className="font-mono text-[22px] font-bold leading-none tracking-tight text-[#0f0e0e]">
                {s.value}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                  style={{ color: s.accent, background: `${s.accent}18` }}
                >
                  {s.change}
                </span>
                <span className="text-[11px] text-[#c0bcb5]">{s.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div
          className="col-span-2 rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              Revenue Trend
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a5a5a]">Monthly sales · 12 months</p>
          </div>
          <MonthlyRevenueChart data={monthlyRevenue} />
        </div>

        <div
          className="rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              Sales Mix
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a5a5a]">Revenue by category</p>
          </div>
          <SalesByCategoryChart data={categoryData} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div
        className="rounded-xl bg-white p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              Revenue vs Expenses
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a5a5a]">Monthly comparison · 12 months</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#111111]" />
              <span className="font-mono text-[10px] text-[#9a9a9a]">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#d4cfc8]" />
              <span className="font-mono text-[10px] text-[#9a9a9a]">Expenses</span>
            </div>
          </div>
        </div>
        <MonthlyComparisonChart data={monthlyData} />
      </div>

      {/* Orders table */}
      <div
        className="rounded-xl bg-white"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between border-b border-[#e8e4dc] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              Recent Orders
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a5a5a]">
              Latest {recentOrders.length} transactions
            </p>
          </div>
          <span className="rounded-full border border-[#e8e4dc] px-3 py-1 font-mono text-[11px] text-[#9a9a9a]">
            peak: {topMonth.month}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e4dc]">
                {['#', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map((h) => (
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
              {recentOrders.map((order, i) => (
                <tr
                  key={order.id}
                  className={`border-b border-[#f5f3ef] transition-colors hover:bg-[#f5f4f1] ${
                    i === recentOrders.length - 1 ? 'border-transparent' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 font-mono text-[12px] text-[#9a9a9a]">
                    #{order.id}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#5a5a5a]">
                    {order.customer_name ?? 'Walk-in'}
                  </td>
                  <td className="max-w-[200px] px-5 py-3.5 text-[12px] text-[#9a9a9a]">
                    <span className="line-clamp-1">{order.product}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-[#0f0e0e]">
                    SAR {Number(order.amount_sar).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                        statusStyles[order.status] ?? 'border-[#e8e4dc] bg-[#f5f4f1] text-[#5a5a5a]'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#c0bcb5]">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
