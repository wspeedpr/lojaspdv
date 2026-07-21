import { useState } from 'react'
import { Settings, Save, Shield, Bell, Palette, Database, CreditCard } from 'lucide-react'
import type { Store } from '../data/mockData'

interface ConfigProps { store: Store }

export default function Config({ store }: ConfigProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'notifications' | 'security'>('general')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'general' as const, label: 'Geral', icon: Settings },
    { id: 'payments' as const, label: 'Pagamentos', icon: CreditCard },
    { id: 'notifications' as const, label: 'Notificações', icon: Bell },
    { id: 'security' as const, label: 'Segurança', icon: Shield },
  ]

  const InputField = ({ label, defaultValue, type = 'text', hint }: { label: string; defaultValue: string; type?: string; hint?: string }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <input type={type} defaultValue={defaultValue}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all" />
      {hint && <p className="text-slate-600 text-xs mt-1">{hint}</p>}
    </div>
  )

  const Toggle = ({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) => {
    const [checked, setChecked] = useState(defaultChecked)
    return (
      <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-slate-500 text-xs mt-0.5">{description}</p>
        </div>
        <button onClick={() => setChecked(!checked)}
          className={`relative w-10 h-5 rounded-full transition-all ${checked ? '' : 'bg-white/10'}`}
          style={checked ? { backgroundColor: store.color } : {}}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Configurações</h1>
          <p className="text-slate-500 text-sm mt-0.5">{store.name} · {store.db}</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: saved ? '#059669' : store.color }}>
          <Save className="w-4 h-4" />
          {saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'text-white shadow' : 'text-slate-500 hover:text-slate-300'
              }`}
              style={activeTab === tab.id ? { backgroundColor: store.color } : {}}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="bg-[#111118] border border-white/8 rounded-2xl p-6 space-y-5">
        {activeTab === 'general' && (
          <>
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">Informações da Loja</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Nome da Loja" defaultValue={store.name} />
              <InputField label="CNPJ" defaultValue={store.cnpj} />
              <div className="col-span-2"><InputField label="Endereço" defaultValue={store.address} /></div>
              <InputField label="Banco de Dados" defaultValue={store.db} hint="Identificador do banco isolado desta loja" />
              <InputField label="Fuso Horário" defaultValue="America/Sao_Paulo" />
            </div>
            <div className="pt-2">
              <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3 mb-4">Preferências</h3>
              <Toggle label="Modo Caixa Simplificado" description="Interface reduzida para operadores de caixa" defaultChecked />
              <Toggle label="Impressão Automática" description="Imprimir cupom fiscal após cada venda" />
              <Toggle label="Avisos de Estoque Baixo" description="Alertar quando produto atingir quantidade mínima" defaultChecked />
            </div>
          </>
        )}

        {activeTab === 'payments' && (
          <>
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">Gateways de Pagamento PIX</h3>
            {[
              { name: 'Asaas', logo: '🟡', fields: [{ label: 'API Key Asaas', key: 'asaas_key', ph: 'aact_xxxx...' }, { label: 'Ambiente', key: 'asaas_env', ph: 'production' }] },
              { name: 'EFI Bank', logo: '🟢', fields: [{ label: 'Client ID', key: 'efi_id', ph: 'Client_Id_xxx' }, { label: 'Client Secret', key: 'efi_secret', ph: 'Client_Secret_xxx' }] },
              { name: 'Lytex', logo: '🔵', fields: [{ label: 'Token Lytex', key: 'lytex_token', ph: 'lytex_token_xxx' }] },
              { name: 'Cora', logo: '🟠', fields: [{ label: 'API Token Cora', key: 'cora_token', ph: 'cora_xxx' }] },
            ].map(gw => (
              <div key={gw.name} className="border border-white/8 rounded-xl p-4 mb-3 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{gw.logo}</span>
                  <span className="text-white font-medium text-sm">{gw.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {gw.fields.map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                      <input type="password" placeholder={f.ph}
                        className="w-full bg-white/5 border border-white/8 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'notifications' && (
          <>
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">Notificações</h3>
            <Toggle label="Venda Realizada" description="Notificar gerente a cada venda concluída" defaultChecked />
            <Toggle label="PIX Recebido" description="Notificar quando PIX for confirmado" defaultChecked />
            <Toggle label="Estoque Crítico" description="Alertar quando produto atingir estoque mínimo" defaultChecked />
            <Toggle label="Novo Atendimento CRM" description="Notificar quando novo ticket for aberto" defaultChecked />
            <Toggle label="Relatório Diário" description="Enviar resumo de vendas ao final do dia" />
            <Toggle label="Comissão Calculada" description="Notificar funcionário sobre comissão do mês" />
          </>
        )}

        {activeTab === 'security' && (
          <>
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">Segurança</h3>
            <div className="grid grid-cols-1 gap-4">
              <InputField label="Senha Atual" defaultValue="" type="password" />
              <InputField label="Nova Senha" defaultValue="" type="password" hint="Mínimo 8 caracteres, letras e números" />
              <InputField label="Confirmar Nova Senha" defaultValue="" type="password" />
            </div>
            <div className="pt-2 border-t border-white/8">
              <Toggle label="Autenticação em 2 Fatores" description="Requer código SMS ao fazer login" />
              <Toggle label="Sessão Automática" description="Encerrar sessão após 30 minutos de inatividade" defaultChecked />
              <Toggle label="Log de Acessos" description="Registrar todos os acessos ao sistema" defaultChecked />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
