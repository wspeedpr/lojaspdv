import { useState, useEffect } from 'react'
import { FileText, CheckCircle, XCircle, Clock, Search, ChevronDown, ChevronUp, Printer, AlertCircle } from 'lucide-react'
import { type Store, type Invoice, loadInvoices, saveInvoices } from '../data/mockData'

interface FaturasProps { store: Store }

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const statusConfig = {
  open:      { label: 'Em Aberto',   color: 'bg-yellow-500/10 text-yellow-400',  icon: Clock },
  paid:      { label: 'Paga',         color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle },
  cancelled: { label: 'Cancelada',   color: 'bg-red-500/10 text-red-400',        icon: XCircle },
}

const paymentLabel: Record<string, string> = {
  pix: 'PIX', credit: 'Cartão Crédito', debit: 'Cartão Débito', cash: 'Dinheiro',
}

export default function Faturas({ store }: FaturasProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'paid' | 'cancelled'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmBaixa, setConfirmBaixa] = useState<Invoice | null>(null)

  useEffect(() => {
    setInvoices(loadInvoices(store.id))
  }, [store.id])

  const filtered = invoices.filter(inv => {
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerCpf.includes(search)
    return matchStatus && matchSearch
  })

  const doBaixa = (invoice: Invoice) => {
    const now = new Date().toLocaleString('pt-BR')
    const updated = invoices.map(inv =>
      inv.id === invoice.id ? { ...inv, status: 'paid' as const, paidAt: now } : inv
    )
    setInvoices(updated)
    saveInvoices(store.id, updated)
    setConfirmBaixa(null)
  }

  const doCancellar = (invoice: Invoice) => {
    if (!confirm(`Cancelar a fatura ${invoice.invoiceNumber}?`)) return
    const updated = invoices.map(inv =>
      inv.id === invoice.id ? { ...inv, status: 'cancelled' as const } : inv
    )
    setInvoices(updated)
    saveInvoices(store.id, updated)
  }

  const totals = {
    open: invoices.filter(i => i.status === 'open').reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    count: invoices.length,
  }

  return (
    <div className="p-6 space-y-6">

      {/* Confirm baixa modal */}
      {confirmBaixa && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="text-center mb-5">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">Confirmar Baixa</h3>
              <p className="text-slate-400 text-sm mt-1">Fatura <span className="text-white font-mono font-bold">{confirmBaixa.invoiceNumber}</span></p>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Loja</span>
                <span className="text-white font-medium">{confirmBaixa.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente</span>
                <span className="text-white">{confirmBaixa.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pagamento</span>
                <span className="text-white">{paymentLabel[confirmBaixa.paymentMethod]}</span>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-2">
                <span className="text-slate-400 font-semibold">Total</span>
                <span className="font-bold text-base" style={{ color: store.accentColor }}>{fmt(confirmBaixa.total)}</span>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-xs">A baixa será registrada em <strong>{confirmBaixa.storeName}</strong> ({store.db}). Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmBaixa(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={() => doBaixa(confirmBaixa)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Dar Baixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Faturas & Baixas</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {store.name} · Prefixo <span className="font-mono text-white">{store.invoicePrefix}-</span> · Banco <span className="font-mono">{store.db}</span>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Total de Faturas</p>
          <p className="text-2xl font-bold text-white">{totals.count}</p>
          <p className="text-slate-500 text-xs mt-1">emitidas nesta loja</p>
        </div>
        <div className="bg-[#111118] border border-yellow-500/20 rounded-2xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Em Aberto</p>
          <p className="text-2xl font-bold text-yellow-400">{fmt(totals.open)}</p>
          <p className="text-slate-500 text-xs mt-1">{invoices.filter(i => i.status === 'open').length} fatura(s)</p>
        </div>
        <div className="bg-[#111118] border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Total Recebido</p>
          <p className="text-2xl font-bold text-emerald-400">{fmt(totals.paid)}</p>
          <p className="text-slate-500 text-xs mt-1">{invoices.filter(i => i.status === 'paid').length} baixa(s)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nº fatura, cliente ou CPF..."
            className="w-full bg-[#111118] border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'open', 'paid', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                filterStatus === s ? 'text-white border-transparent' : 'border-white/8 text-slate-500 hover:text-slate-300 bg-transparent'
              }`}
              style={filterStatus === s ? { backgroundColor: store.color } : {}}>
              {s === 'all' ? 'Todas' : s === 'open' ? 'Em Aberto' : s === 'paid' ? 'Pagas' : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      {filtered.length === 0 ? (
        <div className="bg-[#111118] border border-white/8 rounded-2xl py-16 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-500 text-sm">Nenhuma fatura encontrada</p>
          <p className="text-slate-600 text-xs mt-1">As faturas são geradas automaticamente pelo PDV</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => {
            const StatusIcon = statusConfig[inv.status].icon
            const isExpanded = expandedId === inv.id
            return (
              <div key={inv.id} className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all">
                {/* Row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Invoice number */}
                  <div className="flex-shrink-0">
                    <p className="text-white font-mono font-bold text-sm">{inv.invoiceNumber}</p>
                    <p className="text-slate-600 text-xs">{inv.createdAt}</p>
                  </div>

                  {/* Customer */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{inv.customerName}</p>
                    <p className="text-slate-500 text-xs">{inv.employeeName} · {paymentLabel[inv.paymentMethod]}</p>
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base" style={{ color: store.accentColor }}>{fmt(inv.total)}</p>
                    {inv.discount > 0 && <p className="text-slate-600 text-xs">Desc: {fmt(inv.discount)}</p>}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full ${statusConfig[inv.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[inv.status].label}
                    </span>
                    {inv.paidAt && <p className="text-slate-600 text-xs mt-0.5 text-right">{inv.paidAt}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {inv.status === 'open' && (
                      <>
                        <button onClick={() => setConfirmBaixa(inv)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Dar Baixa
                        </button>
                        <button onClick={() => doCancellar(inv)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-white/8 px-5 py-4 bg-white/3">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-3">Itens da Fatura</p>
                        <div className="space-y-2">
                          {inv.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-slate-300">{item.quantity}x {item.productName}</span>
                              <span className="text-white font-medium">{fmt(item.total)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/8 space-y-1 text-sm">
                          <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span><span>{fmt(inv.subtotal)}</span>
                          </div>
                          {inv.discount > 0 && (
                            <div className="flex justify-between text-red-400">
                              <span>Desconto</span><span>- {fmt(inv.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-white font-bold pt-1 border-t border-white/8">
                            <span>Total</span><span style={{ color: store.accentColor }}>{fmt(inv.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-3">Informações</p>
                        <div className="space-y-2 text-sm">
                          {[
                            { label: 'Nº Fatura', value: inv.invoiceNumber },
                            { label: 'Loja', value: inv.storeName },
                            { label: 'Banco', value: store.db },
                            { label: 'CPF Cliente', value: inv.customerCpf },
                            { label: 'Vendedor', value: inv.employeeName },
                            { label: 'Comissão', value: fmt(inv.commission) },
                            { label: 'Forma Pgto.', value: paymentLabel[inv.paymentMethod] },
                            { label: 'Emissão', value: inv.createdAt },
                            ...(inv.paidAt ? [{ label: 'Baixa em', value: inv.paidAt }] : []),
                          ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between">
                              <span className="text-slate-500">{label}</span>
                              <span className="text-white font-mono text-xs">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
