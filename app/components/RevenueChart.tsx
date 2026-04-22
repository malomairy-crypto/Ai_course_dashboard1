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
} from 'recharts'

type DataPoint = { month: string; revenue: number; expenses: number }

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[#e6eaf4] bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-[11px] font-semibold text-[#9aa5b8]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-[12px] capitalize text-[#5a6a85]">
            {entry.name}:&nbsp;
            <span className="font-semibold text-[#1a2232]">SAR {Number(entry.value).toLocaleString()}</span>
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
        <CartesianGrid stroke="#f0f2f8" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: '#9aa5b8', fontFamily: 'var(--font-geist-mono)' }}
          tickFormatter={(v: string) => v.split(' ')[0]}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9aa5b8', fontFamily: 'var(--font-geist-mono)' }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e6eaf4', strokeWidth: 1 }} />
        <Legend
          wrapperStyle={{ paddingTop: 16, fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: '#9aa5b8' }}
          iconType="circle"
          iconSize={6}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#d0d6e8"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: '#d0d6e8', strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#7c8ef0"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#7c8ef0', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
