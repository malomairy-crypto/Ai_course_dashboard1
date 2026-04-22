import { metrics, monthlyRevenue, recentActivity } from '../frontend-sample-data'
import RevenueChart from './components/RevenueChart'

// Compute 6-month growth rate from monthlyRevenue
const firstMonth = monthlyRevenue[0].revenue
const lastMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue
const growthRate = (((lastMonth - firstMonth) / firstMonth) * 100).toFixed(1)

const metricCards = [
  {
    title: 'Total Revenue',
    value: metrics[0].value,
    change: metrics[0].change,
    period: metrics[0].period,
    trend: 'up' as const,
    accent: '#f59e0b',
    shadow: '0 0 0 1px rgba(245,158,11,0.12), 0 8px 32px rgba(0,0,0,0.45)',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Active Users',
    value: metrics[3].value,
    change: metrics[3].change,
    period: metrics[3].period,
    trend: 'up' as const,
    accent: '#10b981',
    shadow: '0 0 0 1px rgba(16,185,129,0.12), 0 8px 32px rgba(0,0,0,0.45)',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Growth Rate',
    value: `${growthRate}%`,
    change: '+4.2pp',
    period: 'Sep 2025 – Feb 2026',
    trend: 'up' as const,
    accent: '#6366f1',
    shadow: '0 0 0 1px rgba(99,102,241,0.12), 0 8px 32px rgba(0,0,0,0.45)',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    title: 'AI Insights',
    value: '6',
    change: 'Active',
    period: 'Feb 2026 analysis',
    trend: 'neutral' as const,
    accent: '#8b5cf6',
    shadow: '0 0 0 1px rgba(139,92,246,0.12), 0 8px 32px rgba(0,0,0,0.45)',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
]


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Riyadh Roast
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#1a1a22] bg-[#0d0d11] px-3 py-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="font-mono text-[11px] text-slate-500">Apr 22, 2026</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metricCards.map((card, i) => (
          <div
            key={card.title}
            className="metric-card relative flex flex-col gap-5 overflow-hidden rounded-xl bg-[#0f0f15] p-5"
            style={{
              boxShadow: card.shadow,
              animationDelay: `${0.08 + i * 0.07}s`,
            }}
          >
            {/* Colored top accent bar */}
            <div
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: card.accent }}
            />

            {/* Title + icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                {card.title}
              </span>
              <span className="rounded-md p-1.5" style={{ color: card.accent, background: `${card.accent}18` }}>
                <card.icon />
              </span>
            </div>

            {/* Value */}
            <div>
              <p className="font-mono text-[26px] font-bold leading-none tracking-tight text-slate-100">
                {card.value}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {card.trend !== 'neutral' ? (
                  <span
                    className="flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ color: card.accent, background: `${card.accent}18` }}
                  >
                    ↑ {card.change}
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ color: card.accent, background: `${card.accent}18` }}
                  >
                    {card.change}
                  </span>
                )}
                <span className="text-[11px] text-slate-700">{card.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Monthly Revenue Line Chart */}
        <div
          className="col-span-2 rounded-xl bg-[#0f0f15] p-5"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">Revenue</p>
              <p className="mt-0.5 text-sm font-medium text-slate-300">12 months — Mar 2025 to Feb 2026</p>
            </div>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-400">
              +{growthRate}%
            </span>
          </div>
          <RevenueChart data={monthlyRevenue} />
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-xl bg-[#0f0f15] p-5"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">Activity</p>
            <p className="mt-0.5 text-sm font-medium text-slate-300">Live feed</p>
          </div>
          <div className="flex flex-col gap-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60 ring-2 ring-amber-500/20" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[12px] font-medium leading-snug text-slate-300">
                    {item.action}
                  </span>
                  <span className="truncate text-[11px] leading-snug text-slate-600">
                    {item.detail}
                  </span>
                  <span className="font-mono text-[10px] text-slate-700">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
