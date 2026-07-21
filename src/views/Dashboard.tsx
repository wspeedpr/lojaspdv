import { TrendingUp, ShoppingCart, Clock, AlertTriangle, BarChart2, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { DASHBOARD_METRICS, MONTHLY_CHART, SALES, PRODUCTS, type Store } from '../data/mockData'

interface DashboardProps { store: Store }

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard({ store }: DashboardProps) {
  const metrics = DASHBOARD_METRICS[store.id as keyof typeof DASHBOARD_METRICS]
  const storeSales = SALES.filter(s => s.storeId === store.id)
  const storeProducts = PRODUCTS.filter(p => p.storeId === store.id)
  const lowStock = storeProducts.filter(p => p.stock < 15 && p.stock < 999)

  const chartData = MONTHLY_CHART.map(m => ({
    mes: m.mes,
    vendas: [m.loja1, m.loja2, m.loja3, m.loja4, m.loja5][store.id - 1],
  }))

  const StatCard = ({ icon: Icon, label, value, sub, color }: {
    icon: typeof TrendingUp; label: string; value: string; sub?: string; color: string
  }) => (
    <div className="bg-[#111118] border border-white/8 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">{store.name} · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Sistema Online</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Vendas Hoje" value={fmt(metrics.todaySales)} sub={`+12% vs ontem`} color={store.accentColor} />
        <StatCard icon={ShoppingCart} label="Pedidos Hoje" value={String(metrics.todayOrders)} sub="transações" color="#60A5FA" />
        <StatCard icon={Clock} label="PIX Pendente" value={String(metrics.pendingPix)} sub="aguardando confirmação" color="#FBBF24" />
        <StatCard icon={BarChart2} label="Faturamento Mês" value={fmt(metrics.monthSales)} sub="mês atual" color="#34D399" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="xl:col-span-2 bg-[#111118] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-sm">Evolução de Vendas 2026</h3>
            <span className="text-xs text-slate-500">mensal</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={store.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={store.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                formatter={(v: number) => [fmt(v), 'Vendas']}
              />
              <Area type="monotone" dataKey="vendas" stroke={store.color} strokeWidth={2} fill="url(#colorVendas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart - products */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-5">Produtos por Margem</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={storeProducts.slice(0, 4)} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                formatter={(v: number) => [`${v}%`, 'Margem']}
              />
              <Bar dataKey="margin" fill={store.color} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent sales */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Últimas Vendas</h3>
            <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
              Ver todas <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {storeSales.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">Nenhuma venda registrada hoje</p>
          ) : (
            <div className="space-y-3">
              {storeSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{sale.customerName}</p>
                    <p className="text-slate-500 text-xs">{sale.employeeName} · {sale.paymentMethod.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm">{fmt(sale.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sale.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {sale.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock alerts */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h3 className="text-white font-semibold text-sm">Alertas de Estoque</h3>
            {lowStock.length > 0 && (
              <span className="ml-auto text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">{lowStock.length} produto(s)</span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-2xl mb-2">✅</span>
              <p className="text-slate-500 text-sm">Estoque normalizado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white text-sm">{p.name}</p>
                    <p className="text-slate-500 text-xs">{p.category} · {p.code}</p>
                  </div>
                  <span className={`text-sm font-bold ${p.stock < 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {p.stock} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
