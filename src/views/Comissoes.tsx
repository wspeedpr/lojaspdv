import { BarChart3, TrendingUp, DollarSign, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { EMPLOYEES, SALES, type Store } from '../data/mockData'

interface ComissoesProps { store: Store }

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Comissoes({ store }: ComissoesProps) {
  const employees = EMPLOYEES.filter(e => e.storeId === store.id)
  const sales = SALES.filter(s => s.storeId === store.id)

  const totalCommission = employees.reduce((sum, e) => sum + e.totalCommission, 0)
  const totalSales = employees.reduce((sum, e) => sum + e.sales, 0)
  const topSeller = employees.sort((a, b) => b.totalCommission - a.totalCommission)[0]

  const chartData = employees.map(e => ({
    name: e.name.split(' ')[0],
    comissao: e.totalCommission,
    vendas: e.sales,
    taxa: e.commissionRate,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Comissões</h1>
        <p className="text-slate-500 text-sm mt-0.5">{store.name} · Mês atual</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: DollarSign, label: 'Total Comissões', value: fmt(totalCommission), sub: 'mês atual', color: store.accentColor },
          { icon: BarChart3, label: 'Total Vendas', value: String(totalSales), sub: 'transações', color: '#60A5FA' },
          { icon: Award, label: 'Maior Comissão', value: topSeller ? topSeller.name.split(' ')[0] : '-', sub: topSeller ? fmt(topSeller.totalCommission) : '', color: '#FBBF24' },
        ].map(card => (
          <div key={card.label} className="bg-[#111118] border border-white/8 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{card.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '20' }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            {card.sub && <p className="text-slate-500 text-xs mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-5">Comissões por Funcionário</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
              formatter={(v: number) => [fmt(v), 'Comissão']} />
            <Bar dataKey="comissao" fill={store.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-white font-semibold text-sm">Detalhamento por Funcionário</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              {['Funcionário', 'Cargo', 'Vendas', 'Taxa', 'Comissão', 'Status'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const empSales = sales.filter(s => s.employeeId === emp.id)
              const calcCommission = empSales.reduce((sum, s) => sum + s.commission, 0)
              return (
                <tr key={emp.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: store.color + '20', color: store.accentColor }}>
                        {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="text-white text-sm font-medium">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{emp.role}</td>
                  <td className="px-5 py-4 text-white text-sm font-bold">{emp.sales}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-300 font-mono">{emp.commissionRate}%</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-sm" style={{ color: store.accentColor }}>{fmt(emp.totalCommission)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {emp.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/8">
              <td colSpan={2} className="px-5 py-4 text-slate-400 text-sm font-semibold">Total</td>
              <td className="px-5 py-4 text-white font-bold">{totalSales}</td>
              <td className="px-5 py-4" />
              <td className="px-5 py-4 font-bold text-base" style={{ color: store.accentColor }}>{fmt(totalCommission)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
