'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  type TooltipProps,
} from 'recharts'

type DataPoint = {
  month: string
  revenue: number
  expenses: number
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#2a2a35] bg-[#0d0d14] px-4 py-3 shadow-2xl">
      <p className="mb-2 font-mono text-[11px] font-semibold text-slate-400">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
          <span className="font-mono text-[12px] capitalize text-slate-300">
            {entry.name}:&nbsp;
            <span className="font-semibold text-slate-100">
              SAR {Number(entry.value).toLocaleString()}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#1c1c26" strokeDasharray="4 4" vertical={false} />

        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: '#475569', fontFamily: 'var(--font-geist-mono)' }}
          tickFormatter={(v: string) => v.split(' ')[0]}
          axisLine={false}
          tickLine={false}
          interval={0}
        />

        <YAxis
          tick={{ fontSize: 10, fill: '#475569', fontFamily: 'var(--font-geist-mono)' }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
          width={36}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a2a38', strokeWidth: 1 }} />

        <Legend
          wrapperStyle={{ paddingTop: 16, fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: '#64748b' }}
          iconType="circle"
          iconSize={6}
        />

        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#334155"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: '#475569', strokeWidth: 0 }}
        />

        <Line
          type="monotone"
          dataKey="revenue"
          stroke="url(#revenueGrad)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#fbbf24', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
