import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Package, X, Save, AlertTriangle } from 'lucide-react'
import { PRODUCTS, type Store, type Product } from '../data/mockData'

interface RetaguardaProps { store: Store }

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type ProductForm = Omit<Product, 'id' | 'storeId'>

const emptyForm: ProductForm = {
  code: '', name: '', category: '', costPrice: 0, salePrice: 0,
  margin: 0, stock: 0, unit: 'un', commission: 0,
}

export default function Retaguarda({ store }: RetaguardaProps) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS.filter(p => p.storeId === store.id))
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p: Product) => { setEditing(p); setForm({ ...p }); setShowModal(true) }

  const handleSave = () => {
    const margin = form.costPrice > 0 ? Math.round(((form.salePrice - form.costPrice) / form.salePrice) * 100) : form.margin
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...form, margin } : p))
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1
      setProducts(prev => [...prev, { id: newId, storeId: store.id, ...form, margin }])
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Remover produto?')) setProducts(prev => prev.filter(p => p.id !== id))
  }

  const field = (key: keyof ProductForm, label: string, type = 'text', opts?: string[]) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {opts ? (
        <select
          value={String(form[key])}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
        >
          {opts.map(o => <option key={o} value={o} className="bg-[#1A1A2E]">{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={String(form[key])}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
        />
      )}
    </div>
  )

  const categories = [...new Set(PRODUCTS.filter(p => p.storeId === store.id).map(p => p.category))]

  return (
    <div className="p-6">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">{editing ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field('code', 'Código')}
              {field('unit', 'Unidade', 'text', ['un', 'cx', 'kg', 'lt', 'par', 'kit', 'mês', 'trim'])}
              <div className="col-span-2">{field('name', 'Nome do Produto')}</div>
              <div className="col-span-2">{field('category', 'Categoria')}</div>
              {field('costPrice', 'Preço de Custo (R$)', 'number')}
              {field('salePrice', 'Preço de Venda (R$)', 'number')}
              {field('stock', 'Estoque', 'number')}
              {field('commission', 'Comissão (%)', 'number')}
            </div>

            {form.costPrice > 0 && form.salePrice > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 text-sm">
                  Margem calculada: <strong>{Math.round(((form.salePrice - form.costPrice) / form.salePrice) * 100)}%</strong>
                  {' '}· Lucro: <strong>{fmt(form.salePrice - form.costPrice)}</strong> por unidade
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ backgroundColor: store.color }}>
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Produtos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{products.length} produto(s) cadastrado(s) em {store.name}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: store.color }}
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, código ou categoria..."
          className="w-full bg-[#111118] border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setSearch('')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!search ? 'text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          style={!search ? { backgroundColor: store.color } : {}}>Todos</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSearch(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${search === cat ? 'text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            style={search === cat ? { backgroundColor: store.color } : {}}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Código', 'Produto', 'Categoria', 'Custo', 'Venda', 'Margem', 'Estoque', 'Comis.', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{p.code}</td>
                  <td className="px-4 py-3 text-sm text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{fmt(p.costPrice)}</td>
                  <td className="px-4 py-3 text-sm text-white font-semibold">{fmt(p.salePrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${p.margin}%`, backgroundColor: store.color }} />
                      </div>
                      <span className="text-xs text-slate-300">{p.margin}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${p.stock < 5 ? 'text-red-400' : p.stock < 15 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {p.stock < 999 ? p.stock : '∞'} {p.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{p.commission}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-500 text-sm">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
