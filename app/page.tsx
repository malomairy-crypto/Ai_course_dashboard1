import { metrics, monthlyRevenue, recentActivity } from '../frontend-sample-data'
import RevenueChart from './components/RevenueChart'

const firstMonth = monthlyRevenue[0].revenue
const lastMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue
const growthRate = (((lastMonth - firstMonth) / firstMonth) * 100).toFixed(1)

const metricCards = [
  {
    title: 'Total Revenue',
    value: metrics[0].value,
    change: metrics[0].change,
    period: metrics[0].period,
    up: true,
    iconBg: '#eef2fd',
    iconColor: '#4a7de8',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    up: true,
    iconBg: '#e6faf5',
    iconColor: '#10b981',
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
    title: 'Growth Rate',
    value: `${growthRate}%`,
    change: '+4.2pp',
    period: 'Sep 2025 – Feb 2026',
    up: true,
    iconBg: '#f0eeff',
    iconColor: '#7c8ef0',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    up: null,
    iconBg: '#fef3e6',
    iconColor: '#f59e0b',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1a2232]">Dashboard</h1>
        <div className="flex items-center gap-2 rounded-lg border border-[#e6eaf4] bg-white px-3 py-1.5 shadow-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9aa5b8]">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[12px] text-[#5a6a85]">Apr 22, 2026</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metricCards.map((card, i) => (
          <div
            key={card.title}
            className="metric-card flex flex-col gap-4 rounded-xl bg-white p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(99,115,163,0.09)', animationDelay: `${0.06 + i * 0.07}s` }}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9aa5b8]">
                {card.title}
              </p>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: card.iconBg, color: card.iconColor }}>
                <card.icon />
              </span>
            </div>
            <div>
              <p className="text-[26px] font-bold leading-none tracking-tight text-[#1a2232]">
                {card.value}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[12px]">
                {card.up === true && (
                  <span className="font-semibold text-[#10b981]">↑ {card.change}</span>
                )}
                {card.up === false && (
                  <span className="font-semibold text-[#f56565]">↓ {card.change}</span>
                )}
                {card.up === null && (
                  <span className="font-semibold text-[#4a7de8]">{card.change}</span>
                )}
                <span className="text-[#9aa5b8]">{card.period}</span>
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
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(99,115,163,0.09)' }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9aa5b8]">Revenue</p>
              <p className="mt-0.5 text-sm font-medium text-[#1a2232]">12 months — Mar 2025 to Feb 2026</p>
            </div>
            <span className="rounded-full bg-[#e6faf5] px-2.5 py-1 text-[11px] font-semibold text-[#10b981]">
              +{growthRate}%
            </span>
          </div>
          <RevenueChart data={monthlyRevenue} />
        </div>

        {/* Recent activity */}
        <div
          className="rounded-xl bg-white p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(99,115,163,0.09)' }}
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9aa5b8]">Activity</p>
            <p className="mt-0.5 text-sm font-medium text-[#1a2232]">Live feed</p>
          </div>
          <div className="flex flex-col gap-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4a7de8] ring-2 ring-[#eef2fd]" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[12px] font-medium leading-snug text-[#1a2232]">{item.action}</span>
                  <span className="truncate text-[11px] leading-snug text-[#9aa5b8]">{item.detail}</span>
                  <span className="text-[10px] text-[#b8c0d0]">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
