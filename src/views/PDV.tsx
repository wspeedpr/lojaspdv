import { useState } from 'react'
import { Search, Plus, Minus, Trash2, QrCode, CreditCard, Banknote, CheckCircle, X, User, ChevronDown, ShoppingCart } from 'lucide-react'
import {
  PRODUCTS, CUSTOMERS, EMPLOYEES, type Store, type Product, type Customer,
  type Invoice, generateInvoiceNumber, loadInvoices, saveInvoices,
} from '../data/mockData'

interface PDVProps { store: Store }

interface CartItem { product: Product; qty: number }

type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function PixModal({ total, onClose }: { total: number; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false)
  const pixKey = 'empresa@pdv.com'
  const txId = `NXO${Date.now().toString().slice(-8)}`

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111118] border border-white/10 rounded-2xl p-7 w-full max-w-sm mx-4">
        {confirmed ? (
          <div className="text-center">
            <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Pagamento Confirmado!</h3>
            <p className="text-slate-400 text-sm mb-2">PIX recebido com sucesso</p>
            <p className="text-emerald-400 font-bold text-2xl">{fmt(total)}</p>
            <p className="text-slate-600 text-xs mt-1 font-mono">{txId}</p>
            <button onClick={onClose} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors">
              Finalizar Venda
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2"><QrCode className="w-5 h-5 text-indigo-400" /> Pagar com PIX</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* QR Code simulado */}
            <div className="bg-white rounded-xl p-4 mx-auto w-44 h-44 flex items-center justify-center mb-4">
              <div className="grid grid-cols-7 gap-0.5 w-full h-full">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} className="rounded-sm" style={{ backgroundColor: Math.random() > 0.5 ? '#000' : '#fff', aspectRatio: '1' }} />
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Chave PIX</span>
                <span className="text-white font-mono text-xs">{pixKey}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Valor</span>
                <span className="text-white font-bold">{fmt(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Cód. Transação</span>
                <span className="text-white font-mono text-xs">{txId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Gateway</span>
                <span className="text-indigo-400 text-xs">Asaas / EFI / Lytex</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-4 text-xs text-slate-400 text-center">
              Aguardando confirmação do pagamento...
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse ml-2" />
            </div>

            <button
              onClick={() => setConfirmed(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Simular Confirmação PIX
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PDV({ store }: PDVProps) {
  const products = PRODUCTS.filter(p => p.storeId === store.id)
  const employees = EMPLOYEES.filter(e => e.storeId === store.id)
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0] || null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [discount, setDiscount] = useState(0)
  const [showPix, setShowPix] = useState(false)
  const [showCustomers, setShowCustomers] = useState(false)
  const [salesComplete, setSalesComplete] = useState(false)
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1 }]
    })
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev
      .map(i => i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      .filter(i => i.qty > 0)
    )
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.salePrice * i.qty, 0)
  const total = Math.max(0, subtotal - discount)
  const commission = cart.reduce((sum, i) => sum + (i.product.salePrice * i.qty * i.product.commission / 100), 0)

  const buildInvoice = (status: 'open' | 'paid'): Invoice => {
    const invoiceNumber = generateInvoiceNumber(store.invoicePrefix, store.id)
    const now = new Date()
    const items = cart.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.qty,
      unitPrice: i.product.salePrice,
      total: i.product.salePrice * i.qty,
      commission: i.product.salePrice * i.qty * i.product.commission / 100,
    }))
    return {
      id: `${store.invoicePrefix}-${Date.now()}`,
      storeId: store.id,
      storeName: store.name,
      invoiceNumber,
      customerId: selectedCustomer?.id ?? 0,
      customerName: selectedCustomer?.name ?? 'Cliente não identificado',
      customerCpf: selectedCustomer?.cpf ?? '-',
      employeeId: selectedEmployee?.id ?? 0,
      employeeName: selectedEmployee?.name ?? '-',
      items,
      subtotal,
      discount,
      total,
      paymentMethod,
      status,
      paidAt: status === 'paid' ? now.toLocaleString('pt-BR') : undefined,
      createdAt: now.toLocaleString('pt-BR'),
      dueDate: now.toLocaleDateString('pt-BR'),
      commission,
    }
  }

  const persistInvoice = (invoice: Invoice) => {
    const existing = loadInvoices(store.id)
    saveInvoices(store.id, [invoice, ...existing])
  }

  const handleFinalize = () => {
    if (paymentMethod === 'pix') { setShowPix(true); return }
    const invoice = buildInvoice('paid')
    persistInvoice(invoice)
    setLastInvoiceNumber(invoice.invoiceNumber)
    setSalesComplete(true)
    setTimeout(() => { setSalesComplete(false); setCart([]); setDiscount(0); setSelectedCustomer(null) }, 2500)
  }

  const handlePixClose = () => {
    const invoice = buildInvoice('paid')
    persistInvoice(invoice)
    setLastInvoiceNumber(invoice.invoiceNumber)
    setShowPix(false)
    setCart([])
    setDiscount(0)
    setSelectedCustomer(null)
  }

  const paymentButtons: { id: PaymentMethod; label: string; icon: typeof QrCode }[] = [
    { id: 'pix', label: 'PIX', icon: QrCode },
    { id: 'credit', label: 'Crédito', icon: CreditCard },
    { id: 'debit', label: 'Débito', icon: CreditCard },
    { id: 'cash', label: 'Dinheiro', icon: Banknote },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {showPix && <PixModal total={total} onClose={handlePixClose} />}

      {/* Products panel */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/8">
        <div className="p-5 border-b border-white/8">
          <h1 className="text-white font-bold text-lg mb-3">Caixa / PDV</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produto ou código..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-[#111118] border border-white/8 hover:border-white/20 rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-500 font-mono">{product.code}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{product.unit}</span>
                </div>
                <p className="text-white text-sm font-medium leading-tight mb-2">{product.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold" style={{ color: store.accentColor }}>{fmt(product.salePrice)}</span>
                  <span className="text-slate-600 text-xs">Estq: {product.stock}</span>
                </div>
                <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${product.margin}%`, backgroundColor: store.color }} />
                </div>
                <span className="text-xs text-slate-600 mt-1 inline-block">Margem: {product.margin}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart panel */}
      <div className="w-80 flex flex-col bg-[#0D0D14]">
        {/* Customer & Employee */}
        <div className="p-4 border-b border-white/8 space-y-2">
          {/* Customer */}
          <div className="relative">
            <button
              onClick={() => setShowCustomers(!showCustomers)}
              className="w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-left hover:border-white/20 transition-all"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span className={selectedCustomer ? 'text-white' : 'text-slate-500'}>
                {selectedCustomer ? selectedCustomer.name : 'Selecionar cliente'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-600 ml-auto" />
            </button>
            {showCustomers && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A2E] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl">
                {CUSTOMERS.filter(c => c.storeIds.includes(store.id)).map(c => (
                  <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomers(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 text-left transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs text-indigo-400 font-bold">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{c.name}</p>
                      <p className="text-slate-500 text-xs">{c.source === 'sgp' ? '🔗 SGP' : '✍️ Manual'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Employee */}
          <select
            value={selectedEmployee?.id || ''}
            onChange={e => setSelectedEmployee(employees.find(emp => emp.id === Number(e.target.value)) || null)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none"
          >
            {employees.map(e => <option key={e.id} value={e.id} className="bg-[#1A1A2E]">{e.name} — {e.commissionRate}% com.</option>)}
          </select>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Carrinho vazio</p>
              <p className="text-xs mt-1">Clique em um produto para adicionar</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} className="bg-white/5 border border-white/8 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-white text-xs font-medium leading-tight flex-1">{item.product.name}</span>
                <button onClick={() => updateQty(item.product.id, -item.qty)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white text-sm font-bold w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-white font-bold text-sm" style={{ color: store.accentColor }}>
                  {fmt(item.product.salePrice * item.qty)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals & payment */}
        <div className="p-4 border-t border-white/8 space-y-3">
          {/* Discount */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs flex-1">Desconto (R$)</span>
            <input
              type="number"
              min={0}
              max={subtotal}
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
              className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm text-right focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && <div className="flex justify-between text-red-400">
              <span>Desconto</span><span>- {fmt(discount)}</span>
            </div>}
            <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-white/8">
              <span>Total</span><span style={{ color: store.accentColor }}>{fmt(total)}</span>
            </div>
            {selectedEmployee && commission > 0 && (
              <div className="flex justify-between text-emerald-400 text-xs">
                <span>Comissão ({selectedEmployee.commissionRate}%)</span>
                <span>{fmt(commission)}</span>
              </div>
            )}
          </div>

          {/* Payment methods */}
          <div className="grid grid-cols-4 gap-1.5">
            {paymentButtons.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPaymentMethod(id)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === id
                    ? 'border-white/20 text-white'
                    : 'border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-300'
                }`}
                style={paymentMethod === id ? { backgroundColor: store.color + '20', borderColor: store.color + '60' } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleFinalize}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${
              cart.length === 0
                ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                : 'hover:opacity-90 active:scale-95'
            }`}
            style={cart.length > 0 ? { backgroundColor: store.color } : {}}
          >
            {salesComplete ? `✓ Fatura ${lastInvoiceNumber}` : `Finalizar · ${fmt(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

