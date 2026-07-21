import { useState } from 'react'
import { Users, Plus, Pencil, Trash2, X, Check, Shield, ChevronDown } from 'lucide-react'
import {
  getUsers, addUser, updateUser, deleteUser,
  type SystemUser, type UserRole, roleLabel,
} from '../data/auth'
import { STORES } from '../data/mockData'

const roleBadgeStyle: Record<UserRole, string> = {
  superadmin: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  admin: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  employee: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
}

interface FormState {
  name: string
  email: string
  password: string
  role: UserRole
  storeIds: number[]
  active: boolean
}

const emptyForm: FormState = {
  name: '', email: '', password: '', role: 'employee', storeIds: [], active: true,
}

export default function Usuarios() {
  const [users, setUsers] = useState<SystemUser[]>(getUsers)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<SystemUser | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState('')

  const refresh = () => setUsers(getUsers())

  const openAdd = () => {
    setForm(emptyForm)
    setError('')
    setModal('add')
  }

  const openEdit = (u: SystemUser) => {
    setEditTarget(u)
    setForm({ name: u.name, email: u.email, password: u.password, role: u.role, storeIds: u.storeIds, active: u.active })
    setError('')
    setModal('edit')
  }

  const toggleStore = (id: number) => {
    setForm(f => ({
      ...f,
      storeIds: f.storeIds.includes(id) ? f.storeIds.filter(s => s !== id) : [...f.storeIds, id],
    }))
  }

  const validate = (): boolean => {
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return false }
    if (!form.email.trim()) { setError('E-mail é obrigatório.'); return false }
    if (!form.password.trim()) { setError('Senha é obrigatória.'); return false }
    if (form.storeIds.length === 0) { setError('Selecione ao menos uma loja.'); return false }
    const all = getUsers()
    const emailExists = all.some(u => u.email.toLowerCase() === form.email.toLowerCase() && u.id !== editTarget?.id)
    if (emailExists) { setError('E-mail já cadastrado.'); return false }
    return true
  }

  const handleSave = () => {
    if (!validate()) return
    if (modal === 'add') {
      addUser({ name: form.name, email: form.email, password: form.password, role: form.role, storeIds: form.storeIds, active: form.active })
    } else if (modal === 'edit' && editTarget) {
      updateUser(editTarget.id, { name: form.name, email: form.email, password: form.password, role: form.role, storeIds: form.storeIds, active: form.active })
    }
    refresh()
    setModal(null)
  }

  const handleDelete = (id: string) => {
    deleteUser(id)
    refresh()
    setDeleteConfirm(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Usuários do Sistema</h1>
            <p className="text-slate-500 text-xs mt-0.5">Gerencie funcionários e suas permissões de acesso</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left py-3.5 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">Usuário</th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Perfil</th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Lojas</th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-3.5 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={`border-b border-white/4 ${i % 2 === 0 ? '' : 'bg-white/[0.015]'} hover:bg-white/5 transition-colors`}>
                  <td className="py-4 px-5">
                    <div>
                      <p className="text-white font-medium text-sm">{u.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${roleBadgeStyle[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.storeIds.map(sid => {
                        const s = STORES.find(st => st.id === sid)
                        return s ? (
                          <span key={sid} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-slate-400">
                            {s.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${u.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    {u.email !== 'wspeedpr@gmail.com' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 flex items-center justify-center transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(u.id)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {u.email === 'wspeedpr@gmail.com' && (
                      <span className="flex items-center justify-end gap-1 text-slate-600 text-xs">
                        <Shield className="w-3 h-3" /> Protegido
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/6">
          <p className="text-slate-600 text-xs">{users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-white font-semibold text-base">
                {modal === 'add' ? 'Novo Usuário' : 'Editar Usuário'}
              </h2>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Nome completo</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="João Silva"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="funcionario@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Senha</label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="senha123"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Perfil</label>
                  <div className="relative">
                    <select
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                      className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 pr-8 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="employee" className="bg-[#111118]">Funcionário</option>
                      <option value="manager" className="bg-[#111118]">Gerente</option>
                      <option value="admin" className="bg-[#111118]">Administrador</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">Lojas com acesso</label>
                <div className="grid grid-cols-1 gap-2">
                  {STORES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStore(s.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        form.storeIds.includes(s.id)
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-white'
                          : 'bg-white/3 border-white/8 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${form.storeIds.includes(s.id) ? 'bg-indigo-600' : 'bg-white/10'}`}>
                        {form.storeIds.includes(s.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-xs text-slate-600 font-mono ml-auto">{s.db}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-emerald-600' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-slate-300">Usuário {form.active ? 'ativo' : 'inativo'}</span>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                {modal === 'add' ? 'Cadastrar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-white font-semibold mb-2">Remover usuário?</h2>
            <p className="text-slate-400 text-sm mb-6">Esta ação não pode ser desfeita. O funcionário perderá o acesso ao sistema.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
