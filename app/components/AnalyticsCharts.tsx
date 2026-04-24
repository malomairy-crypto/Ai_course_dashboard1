'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

type WeeklyPoint = { week: string; customers: number }
type MonthlyPoint = { month: string; revenue: number; expenses: number }
type CategoryPoint = { category: string; value: number; color: string }

type TooltipPayload = {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function LightTooltip({ active, payload, label }: TooltipPayload) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[#e8e4dc] bg-white px-4 py-3 shadow-lg">
      {label && <p className="mb-2 text-[11px] font-semibold text-[#9a9a9a]">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-[12px] text-[#5a5a5a]">
            {entry.name}:{' '}
            <span className="font-semibold text-[#0f0e0e]">
              {entry.name !== 'customers'
                ? `SAR ${entry.value.toLocaleString()}`
                : entry.value.toLocaleString()}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export function WeeklyCustomersChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111111" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#111111" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#f5f3ef" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: '#9a9a9a', fontFamily: 'var(--font-geist-mono)' }}
          tickFormatter={(v: string) => v.replace('Week ', 'W')}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9a9a9a', fontFamily: 'var(--font-geist-mono)' }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<LightTooltip />} cursor={{ stroke: '#e8e4dc', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="customers"
          stroke="#111111"
          strokeWidth={2}
          fill="url(#custGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#111111', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MonthlyComparisonChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke="#f5f3ef" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: '#9a9a9a', fontFamily: 'var(--font-geist-mono)' }}
          tickFormatter={(v: string) => v.split(' ')[0]}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9a9a9a', fontFamily: 'var(--font-geist-mono)' }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<LightTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: '#9a9a9a' }}
          iconType="circle"
          iconSize={6}
        />
        <Bar dataKey="expenses" name="expenses" fill="#d4cfc8" radius={[3, 3, 0, 0]} />
        <Bar dataKey="revenue" name="revenue" fill="#111111" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SalesByCategoryChart({ data }: { data: CategoryPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as CategoryPoint
              return (
                <div className="rounded-xl border border-[#e8e4dc] bg-white px-3 py-2 shadow-lg">
                  <p className="text-[11px] text-[#5a5a5a]">{d.category}</p>
                  <p className="text-[12px] font-bold text-[#0f0e0e]">SAR {d.value.toLocaleString()}</p>
                  <p className="text-[10px] text-[#9a9a9a]">{((d.value / total) * 100).toFixed(1)}%</p>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex w-full flex-col gap-2">
        {data.map((d) => (
          <div key={d.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="text-[12px] text-[#5a5a5a]">{d.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-medium text-[#0f0e0e]">SAR {(d.value / 1000).toFixed(0)}k</span>
              <span className="w-10 text-right text-[11px] text-[#9a9a9a]">{((d.value / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
