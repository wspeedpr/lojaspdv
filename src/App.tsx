import { useState } from 'react'
import Login from './views/Login'
import StoreSelect from './views/StoreSelect'
import Dashboard from './views/Dashboard'
import PDV from './views/PDV'
import Retaguarda from './views/Retaguarda'
import Funcionarios from './views/Funcionarios'
import CRM from './views/CRM'
import Comissoes from './views/Comissoes'
import SGP from './views/SGP'
import Config from './views/Config'
import Faturas from './views/Faturas'
import Usuarios from './views/Usuarios'
import Sidebar, { type View } from './components/Sidebar'
import type { Store } from './data/mockData'
import type { SystemUser } from './data/auth'

type Screen = 'login' | 'store-select' | 'app'

export default function App() {
  const savedUser: SystemUser | null = (() => { try { return JSON.parse(localStorage.getItem('pdv_user') || 'null') } catch { return null } })()
  const savedStore: Store | null = (() => { try { return JSON.parse(localStorage.getItem('pdv_store') || 'null') } catch { return null } })()
  const initialScreen: Screen = savedUser && savedStore ? 'app' : savedUser ? 'store-select' : 'login'

  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [user, setUser] = useState<SystemUser | null>(savedUser)
  const [store, setStore] = useState<Store | null>(savedStore)
  const [view, setView] = useState<View>('dashboard')

  const handleLogin = (u: SystemUser) => {
    setUser(u)
    localStorage.setItem('pdv_user', JSON.stringify(u))
    // superadmin com acesso a todas as lojas vai direto para seleção
    setScreen('store-select')
  }

  const handleSelectStore = (s: Store) => {
    setStore(s)
    localStorage.setItem('pdv_store', JSON.stringify(s))
    setView('dashboard')
    setScreen('app')
  }

  const handleChangeStore = () => {
    setStore(null)
    localStorage.removeItem('pdv_store')
    setScreen('store-select')
  }

  const handleLogout = () => {
    setUser(null)
    setStore(null)
    localStorage.removeItem('pdv_user')
    localStorage.removeItem('pdv_store')
    setScreen('login')
  }

  if (screen === 'login') {
    return <Login onLogin={handleLogin} />
  }

  if (screen === 'store-select' && user) {
    return <StoreSelect user={user} onSelect={handleSelectStore} onLogout={handleLogout} />
  }

  if (screen === 'app' && store && user) {
    const viewMap: Record<View, React.ReactNode> = {
      dashboard: <Dashboard store={store} />,
      pdv: <PDV store={store} />,
      faturas: <Faturas store={store} />,
      retaguarda: <Retaguarda store={store} />,
      funcionarios: <Funcionarios store={store} />,
      crm: <CRM store={store} />,
      comissoes: <Comissoes store={store} />,
      sgp: <SGP store={store} />,
      config: <Config store={store} />,
      usuarios: <Usuarios />,
    }

    const fullHeight = view === 'pdv' || view === 'crm'

    return (
      <div className="flex min-h-screen bg-[#0A0A0F]">
        <Sidebar
          store={store}
          currentView={view}
          onNavigate={setView}
          onChangeStore={handleChangeStore}
          onLogout={handleLogout}
          user={user}
        />
        <main className={`flex-1 overflow-hidden ${fullHeight ? 'flex flex-col' : 'overflow-y-auto'}`}
          style={{ minHeight: '100vh' }}>
          {fullHeight ? (
            <div className="flex-1 overflow-hidden" style={{ height: '100vh' }}>
              {viewMap[view]}
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ height: '100vh' }}>
              {viewMap[view]}
            </div>
          )}
        </main>
      </div>
    )
  }

  return null
}
