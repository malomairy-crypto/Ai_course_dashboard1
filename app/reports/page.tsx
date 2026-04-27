import { supabase } from '../../lib/supabase'
import ReportsClient, { type ReportRow, type ReportsData } from './ReportsClient'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function monthLabel(d: string)   { return `${MONTHS[parseInt(d.slice(5,7)) - 1]} ${d.slice(0,4)}` }
function monthSort(d: string)    { return parseInt(d.slice(0,4)) * 100 + parseInt(d.slice(5,7)) }

function quarterLabel(d: string) {
  const m = parseInt(d.slice(5,7))
  return `Q${Math.ceil(m / 3)} ${d.slice(0,4)}`
}
function quarterSort(d: string)  {
  return parseInt(d.slice(0,4)) * 10 + Math.ceil(parseInt(d.slice(5,7)) / 3)
}

function yearLabel(d: string)    { return d.slice(0,4) }
function yearSort(d: string)     { return parseInt(d.slice(0,4)) }

function buildGrouped(
  sales:    Array<{ date: string; amount_sar: string | number }>,
  expenses: Array<{ date: string; amount_sar: string | number }>,
  labelFn:  (d: string) => string,
  sortFn:   (d: string) => number
): ReportRow[] {
  type Entry = { revenue: number; expenses: number; orders: number; sk: number }
  const map = new Map<string, Entry>()

  for (const s of sales) {
    const lbl = labelFn(s.date)
    const e = map.get(lbl) ?? { revenue: 0, expenses: 0, orders: 0, sk: sortFn(s.date) }
    map.set(lbl, { ...e, revenue: e.revenue + Number(s.amount_sar), orders: e.orders + 1 })
  }
  for (const ex of expenses) {
    const lbl = labelFn(ex.date)
    const e = map.get(lbl) ?? { revenue: 0, expenses: 0, orders: 0, sk: sortFn(ex.date) }
    map.set(lbl, { ...e, expenses: e.expenses + Number(ex.amount_sar) })
  }

  return [...map.entries()]
    .sort((a, b) => a[1].sk - b[1].sk)
    .map(([label, d]) => ({ label, revenue: d.revenue, expenses: d.expenses, orders: d.orders }))
}

export default async function ReportsPage() {
  const [{ data: salesRaw }, { data: expensesRaw }] = await Promise.all([
    supabase.from('sales').select('date, amount_sar, category').neq('status', 'Returned'),
    supabase.from('expenses').select('date, amount_sar'),
  ])

  const sales    = salesRaw    ?? []
  const expenses = expensesRaw ?? []

  const monthly   = buildGrouped(sales, expenses, monthLabel,   monthSort)
  const quarterly = buildGrouped(sales, expenses, quarterLabel, quarterSort)
  const annual    = buildGrouped(sales, expenses, yearLabel,    yearSort)

  // Category grouping (no expense mapping)
  const catMap = new Map<string, { revenue: number; orders: number }>()
  for (const s of sales) {
    const e = catMap.get(s.category) ?? { revenue: 0, orders: 0 }
    catMap.set(s.category, { revenue: e.revenue + Number(s.amount_sar), orders: e.orders + 1 })
  }
  const category: ReportRow[] = [...catMap.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([label, d]) => ({ label, revenue: d.revenue, expenses: 0, orders: d.orders }))

  const data: ReportsData = { monthly, quarterly, annual, category }

  return <ReportsClient data={data} />
}
