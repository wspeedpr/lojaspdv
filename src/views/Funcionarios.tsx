import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Users, X, Save, Phone, User } from 'lucide-react'
import { EMPLOYEES, type Store, type Employee } from '../data/mockData'

interface FuncionariosProps { store: Store }

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type EmpForm = Omit<Employee, 'id' | 'storeId' | 'sales' | 'totalCommission'>

const emptyForm: EmpForm = { name: '', role: '', cpf: '', phone: '', commissionRate: 0, status: 'active' }

export default function Funcionarios({ store }: FuncionariosProps) {
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES.filter(e => e.storeId === store.id))
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmpForm>(emptyForm)

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (e: Employee) => { setEditing(e); setForm({ name: e.name, role: e.role, cpf: e.cpf, phone: e.phone, commissionRate: e.commissionRate, status: e.status }); setShowModal(true) }

  const handleSave = () => {
    if (editing) {
      setEmployees(prev => prev.map(e => e.id === editing.id ? { ...e, ...form } : e))
    } else {
      const newId = Math.max(...employees.map(e => e.id), 0) + 1
      setEmployees(prev => [...prev, { id: newId, storeId: store.id, ...form, sales: 0, totalCommission: 0 }])
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Remover funcionário?')) setEmployees(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="p-6">
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">{editing ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Nome Completo' },
                { key: 'role', label: 'Cargo' },
                { key: 'cpf', label: 'CPF' },
                { key: 'phone', label: 'Telefone' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input
                    value={String(form[key as keyof EmpForm])}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Comissão (%)</label>
                <input type="number" min={0} max={100}
                  value={form.commissionRate}
                  onChange={e => setForm(f => ({ ...f, commissionRate: Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500">
                  <option value="active" className="bg-[#1A1A2E]">Ativo</option>
                  <option value="inactive" className="bg-[#1A1A2E]">Inativo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: store.color }}>
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Funcionários</h1>
          <p className="text-slate-500 text-sm mt-0.5">{employees.length} colaborador(es) em {store.name}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ backgroundColor: store.color }}>
          <Plus className="w-4 h-4" /> Novo Funcionário
        </button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou cargo..."
          className="w-full bg-[#111118] border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-[#111118] border border-white/8 rounded-2xl p-5 flex items-center gap-5 hover:border-white/15 transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
              style={{ backgroundColor: store.color + '25' }}>
              {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-white font-semibold text-sm">{emp.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                  {emp.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-slate-500 text-xs">{emp.role}</p>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-600">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{emp.phone}</span>
                <span className="font-mono">{emp.cpf}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-slate-400 text-xs mb-0.5">{emp.sales} vendas</p>
              <p className="font-bold text-sm" style={{ color: store.accentColor }}>{fmt(emp.totalCommission)}</p>
              <p className="text-slate-600 text-xs">comissão ({emp.commissionRate}%)</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(emp)} className="p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(emp.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[#111118] border border-white/8 rounded-2xl">
            <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-500">Nenhum funcionário encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
