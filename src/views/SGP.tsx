import { useState } from 'react'
import { Link2, RefreshCw, CheckCircle, AlertCircle, Search, Download, Eye } from 'lucide-react'
import { CUSTOMERS, type Store } from '../data/mockData'

interface SGPProps { store: Store }

export default function SGP({ store }: SGPProps) {
  const [token, setToken] = useState('SGP-TOKEN-DEMO-2026')
  const [endpoint, setEndpoint] = useState('https://api.sgp.suaempresa.com.br/v1')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [syncedCount, setSyncedCount] = useState(0)

  const sgpCustomers = CUSTOMERS.filter(c => c.source === 'sgp')
  const filtered = sgpCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf.includes(search)
  )

  const handleConnect = () => {
    if (!token) return
    setLoading(true)
    setTimeout(() => { setConnected(true); setLoading(false) }, 1200)
  }

  const handleSync = () => {
    setSyncing(true)
    let count = 0
    const interval = setInterval(() => {
      count++
      setSyncedCount(count)
      if (count >= sgpCustomers.length) { clearInterval(interval); setSyncing(false) }
    }, 300)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Integração SGP</h1>
        <p className="text-slate-500 text-sm mt-0.5">Sincronizar clientes do sistema SGP via Token</p>
      </div>

      {/* Config card */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Configuração SGP</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {connected ? (
                <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400 text-xs">Conectado</span></>
              ) : (
                <><AlertCircle className="w-3.5 h-3.5 text-slate-500" /><span className="text-slate-500 text-xs">Não conectado</span></>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Endpoint da API SGP</label>
            <input value={endpoint} onChange={e => setEndpoint(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Token de Acesso</label>
            <input type="password" value={token} onChange={e => setToken(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono" />
            <p className="text-slate-600 text-xs mt-1">Token gerado pelo painel SGP → Configurações → Integrações → Gerar Token</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleConnect} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: store.color }}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            {loading ? 'Conectando...' : connected ? 'Reconectar' : 'Conectar SGP'}
          </button>

          {connected && (
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 transition-all disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? `Sincronizando (${syncedCount}/${sgpCustomers.length})...` : 'Sincronizar Clientes'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {connected && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Clientes SGP', value: sgpCustomers.length, color: store.accentColor },
            { label: 'Sincronizados', value: syncedCount || sgpCustomers.length, color: '#34D399' },
            { label: 'Loja Destino', value: store.db, color: '#94A3B8', mono: true },
          ].map(s => (
            <div key={s.label} className="bg-[#111118] border border-white/8 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold mb-1 ${s.mono ? 'text-sm font-mono' : ''}`} style={{ color: s.color }}>{s.value}</p>
              <p className="text-slate-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Customer list */}
      {connected && (
        <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Clientes Importados do SGP</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                className="bg-white/5 border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 w-48" />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Nome', 'CPF', 'Telefone', 'E-mail', 'Total Gasto', 'Lojas', 'Ação'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: store.color + '20', color: store.accentColor }}>
                        {c.name[0]}
                      </div>
                      <span className="text-white text-sm font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono">{c.cpf}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{c.phone}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{c.email}</td>
                  <td className="px-5 py-3 text-white text-sm font-semibold">
                    {c.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {c.storeIds.map(id => (
                        <span key={id} className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400">L{id}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 border-t border-white/8 bg-indigo-500/5">
            <p className="text-xs text-indigo-400 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5" />
              Dados consultados via token · Salvos no banco <span className="font-mono">{store.db}</span> isolado por loja
            </p>
          </div>
        </div>
      )}

      {/* Gateway PIX info */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <span className="text-lg">⚡</span> Gateways PIX Configurados
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Asaas', logo: '🟡', status: 'Disponível', active: true },
            { name: 'EFI Bank', logo: '🟢', status: 'Disponível', active: true },
            { name: 'Lytex', logo: '🔵', status: 'Disponível', active: true },
            { name: 'Cora', logo: '🟠', status: 'Disponível', active: true },
          ].map(g => (
            <div key={g.name} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center hover:border-white/15 cursor-pointer transition-all">
              <span className="text-2xl mb-1 block">{g.logo}</span>
              <p className="text-white text-xs font-semibold">{g.name}</p>
              <p className="text-emerald-400 text-xs mt-0.5">{g.status}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-xs mt-3">Configure as credenciais de cada gateway em Configurações → Pagamentos</p>
      </div>
    </div>
  )
}
