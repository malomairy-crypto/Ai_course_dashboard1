import {
  metrics,
  monthlyRevenue,
  weeklyCustomers,
  salesByCategory,
  recentOrders,
} from '../../frontend-sample-data'
import {
  WeeklyCustomersChart,
  MonthlyComparisonChart,
  SalesByCategoryChart,
} from '../components/AnalyticsCharts'

const statusStyles: Record<string, string> = {
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Ready for Pickup': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}

const peakWeek = weeklyCustomers.reduce((a, b) => (a.customers > b.customers ? a : b))
const totalCustomers = weeklyCustomers.reduce((s, w) => s + w.customers, 0)
const hotDrinkShare = salesByCategory.find((c) => c.category === 'Hot Drinks')
const hotPct = hotDrinkShare
  ? ((hotDrinkShare.value / salesByCategory.reduce((s, c) => s + c.value, 0)) * 100).toFixed(1)
  : '0'

const topStats = [
  {
    label: 'Drinks Sold',
    value: metrics[1].value,
    change: metrics[1].change,
    period: metrics[1].period,
    accent: '#f97316',
  },
  {
    label: 'Avg Ticket',
    value: metrics[2].value,
    change: metrics[2].change,
    period: metrics[2].period,
    accent: '#10b981',
  },
  {
    label: 'Hot Drinks Share',
    value: `${hotPct}%`,
    change: '#1 Category',
    period: 'of total sales',
    accent: '#6366f1',
  },
  {
    label: 'Peak Week',
    value: peakWeek.customers.toLocaleString(),
    change: peakWeek.week,
    period: `of ${totalCustomers.toLocaleString()} total`,
    accent: '#8b5cf6',
  },
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Riyadh Roast
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">Analytics</h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#1a1a22] bg-[#0d0d11] px-3 py-1.5">
          <span className="font-mono text-[11px] text-slate-500">Mar 2025 – Feb 2026</span>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {topStats.map((s, i) => (
          <div
            key={s.label}
            className="metric-card relative flex flex-col gap-4 overflow-hidden rounded-xl bg-[#0f0f15] p-5"
            style={{
              boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)`,
              animationDelay: `${0.05 + i * 0.06}s`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: s.accent }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">
              {s.label}
            </span>
            <div>
              <p className="font-mono text-[26px] font-bold leading-none tracking-tight text-slate-100">
                {s.value}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                  style={{ color: s.accent, background: `${s.accent}18` }}
                >
                  {s.change}
                </span>
                <span className="text-[11px] text-slate-700">{s.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Weekly customers area chart */}
        <div
          className="col-span-2 rounded-xl bg-[#0f0f15] p-5"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">
              Customer Traffic
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-300">Weekly visits · 12 weeks</p>
          </div>
          <WeeklyCustomersChart data={weeklyCustomers} />
        </div>

        {/* Sales by category donut */}
        <div
          className="rounded-xl bg-[#0f0f15] p-5"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">
              Sales Mix
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-300">Revenue by category</p>
          </div>
          <SalesByCategoryChart data={salesByCategory} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div
        className="rounded-xl bg-[#0f0f15] p-5"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">
              Revenue vs Expenses
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-300">Monthly comparison · 12 months</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#f97316]" />
              <span className="font-mono text-[10px] text-slate-600">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#1e293b]" />
              <span className="font-mono text-[10px] text-slate-600">Expenses</span>
            </div>
          </div>
        </div>
        <MonthlyComparisonChart data={monthlyRevenue} />
      </div>

      {/* Orders table */}
      <div
        className="rounded-xl bg-[#0f0f15]"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center justify-between border-b border-[#1a1a22] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">
              Recent Orders
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-300">Latest {recentOrders.length} transactions</p>
          </div>
          <span className="rounded-full border border-[#1a1a22] px-3 py-1 font-mono text-[11px] text-slate-600">
            Feb 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a22]">
                {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-700"
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
                  className={`border-b border-[#13131a] transition-colors hover:bg-white/[0.02] ${
                    i === recentOrders.length - 1 ? 'border-transparent' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 font-mono text-[12px] text-slate-500">{order.id}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-slate-300">
                    {order.customer}
                  </td>
                  <td className="max-w-[220px] px-5 py-3.5 text-[12px] text-slate-500">
                    <span className="line-clamp-1">{order.product}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-slate-200">
                    {order.amount}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                        statusStyles[order.status] ?? 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-700">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
