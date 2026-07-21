import { Building2, Database, ChevronRight, LogOut } from 'lucide-react'
import { STORES, type Store } from '../data/mockData'
import { voceEleganteLogo, cellCenterLogo, allHomeLogo } from '../data/logos'

interface StoreSelectProps {
  user: { name: string; role: string; email: string }
  onSelect: (store: Store) => void
  onLogout: () => void
}

const storeTypeLabel: Record<string, string> = {
  fashion: 'Moda & Vestuário',
  general: 'Acessórios de Celular',
  convenience: 'Tudo para sua Casa',
  gym: 'Academia',
  pharmacy: 'Farmácia',
}

export default function StoreSelect({ user, onSelect, onLogout }: StoreSelectProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-slate-500 text-sm">Bem-vindo de volta,</p>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-slate-400 text-sm uppercase tracking-widest font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Selecionar Loja
          </h2>
          <p className="text-slate-600 text-xs mt-1">Cada loja possui banco de dados isolado</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {STORES.map(store => (
            <button
              key={store.id}
              onClick={() => onSelect(store)}
              className="group flex items-center gap-5 bg-[#111118] border border-white/8 hover:border-white/20 rounded-2xl p-5 text-left transition-all duration-200 hover:bg-white/5"
            >
              {/* Icon */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: store.color + '20', border: `1px solid ${store.color}40` }}
              >
                {store.id === 1 ? (
                  <img src={voceEleganteLogo} alt="Você Elegante" className="w-12 h-12 object-contain" />
                ) : store.id === 2 ? (
                  <img src={cellCenterLogo} alt="Cell Center" className="w-12 h-12 object-contain" />
                ) : store.id === 3 ? (
                  <img src={allHomeLogo} alt="All Home" className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">{store.icon}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white text-base">{store.name}</span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: store.color + '20', color: store.accentColor }}
                  >
                    {storeTypeLabel[store.type]}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5 truncate">{store.address}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Database className="w-3 h-3 text-slate-600" />
                  <span className="text-slate-600 text-xs font-mono">{store.db}</span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-700 mt-8">
          CNPJ e dados isolados por banco · Integração SGP ativa
        </p>
      </div>
    </div>
  )
}
