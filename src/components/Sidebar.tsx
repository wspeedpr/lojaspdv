import {
  LayoutDashboard, ShoppingCart, Package, Users, MessageSquare,
  BarChart3, Link2, Settings, LogOut, ChevronRight, Zap,
  Building2, FileText, UserCog,
} from 'lucide-react'
import type { Store } from '../data/mockData'
import type { SystemUser } from '../data/auth'
import { voceEleganteLogo, cellCenterLogo, allHomeLogo } from '../data/logos'

export type View = 'dashboard' | 'pdv' | 'faturas' | 'retaguarda' | 'funcionarios' | 'crm' | 'comissoes' | 'sgp' | 'config' | 'usuarios'

interface SidebarProps {
  store: Store
  currentView: View
  onNavigate: (view: View) => void
  onChangeStore: () => void
  onLogout: () => void
  user: SystemUser
}

const nav = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pdv' as View, label: 'Caixa / PDV', icon: ShoppingCart },
  { id: 'faturas' as View, label: 'Faturas & Baixas', icon: FileText },
  { id: 'retaguarda' as View, label: 'Produtos', icon: Package },
  { id: 'funcionarios' as View, label: 'Funcionários', icon: Users },
  { id: 'crm' as View, label: 'CRM / Atendimento', icon: MessageSquare },
  { id: 'comissoes' as View, label: 'Comissões', icon: BarChart3 },
  { id: 'sgp' as View, label: 'Integração SGP', icon: Link2 },
  { id: 'config' as View, label: 'Configurações', icon: Settings },
]

const adminNav = [
  { id: 'usuarios' as View, label: 'Usuários do Sistema', icon: UserCog },
]

export default function Sidebar({ store, currentView, onNavigate, onChangeStore, onLogout, user }: SidebarProps) {
  const isSuperAdmin = user.role === 'superadmin' || user.role === 'admin'

  const roleDisplay = user.role === 'superadmin' ? 'Super Administrador'
    : user.role === 'admin' ? 'Administrador'
    : user.role === 'manager' ? 'Gerente'
    : 'Funcionário'

  return (
    <aside className="w-64 min-h-screen bg-[#0D0D14] border-r border-white/8 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">WSpeed PDV</span>
        </div>
      </div>

      {/* Store badge */}
      <button
        onClick={onChangeStore}
        className="mx-4 mt-4 flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
        style={{ backgroundColor: store.color + '10' }}
      >
        {store.id === 1 ? (
          <img src={voceEleganteLogo} alt="Você Elegante" className="w-7 h-7 object-contain" />
        ) : store.id === 2 ? (
          <img src={cellCenterLogo} alt="Cell Center" className="w-7 h-7 object-contain" />
        ) : store.id === 3 ? (
          <img src={allHomeLogo} alt="All Home" className="w-7 h-7 object-cover rounded-md" />
        ) : (
          <span className="text-xl">{store.icon}</span>
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-white text-sm font-semibold truncate">{store.name}</p>
          <p className="text-xs font-mono" style={{ color: store.accentColor }}>{store.db}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-5 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const Icon = item.icon
          const active = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
              style={active ? { backgroundColor: store.color + '20', color: store.accentColor } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          )
        })}

        {/* Admin-only section */}
        {isSuperAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-700 font-medium">Administração</p>
            </div>
            {adminNav.map(item => {
              const Icon = item.icon
              const active = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 space-y-1 border-t border-white/8 pt-4">
        <div className="px-3 py-2">
          <p className="text-white text-sm font-medium truncate">{user.name}</p>
          <p className="text-slate-600 text-xs">{roleDisplay}</p>
        </div>
        <button
          onClick={onChangeStore}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <Building2 className="w-4 h-4" />
          Trocar Loja
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
