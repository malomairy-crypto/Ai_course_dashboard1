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
  Completed: 'bg-[#e6faf5] text-[#10b981] border-[#a7f3d0]',
  'In Progress': 'bg-[#fef3e6] text-[#f59e0b] border-[#fcd34d]',
  'Ready for Pickup': 'bg-[#f0eeea] text-[#5a5a5a] border-[#e8e4dc]',
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a9a9a]">
            Riyadh Roast
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0f0e0e]">Analytics</h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#e8e4dc] bg-white px-3 py-1.5">
          <span className="font-mono text-[11px] text-[#9a9a9a]">Mar 2025 – Feb 2026</span>
        </div>
      </div>

      {/* Top stat cards */}
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
              <p className="font-mono text-[26px] font-bold leading-none tracking-tight text-[#0f0e0e]">
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
        {/* Weekly customers area chart */}
        <div
          className="col-span-2 rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">
              Customer Traffic
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#5a5a5a]">Weekly visits · 12 weeks</p>
          </div>
          <WeeklyCustomersChart data={weeklyCustomers} />
        </div>

        {/* Sales by category donut */}
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
          <SalesByCategoryChart data={salesByCategory} />
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
        <MonthlyComparisonChart data={monthlyRevenue} />
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
            <p className="mt-0.5 text-sm font-medium text-[#5a5a5a]">Latest {recentOrders.length} transactions</p>
          </div>
          <span className="rounded-full border border-[#e8e4dc] px-3 py-1 font-mono text-[11px] text-[#9a9a9a]">
            Feb 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e4dc]">
                {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map((h) => (
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
                  <td className="px-5 py-3.5 font-mono text-[12px] text-[#9a9a9a]">{order.id}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#5a5a5a]">
                    {order.customer}
                  </td>
                  <td className="max-w-[220px] px-5 py-3.5 text-[12px] text-[#9a9a9a]">
                    <span className="line-clamp-1">{order.product}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-[#0f0e0e]">
                    {order.amount}
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
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#c0bcb5]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
