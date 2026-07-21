import { useState } from 'react'
import { MessageSquare, Phone, User, Send, Smartphone, CheckCircle, Clock, X, Plus, Wifi, WifiOff } from 'lucide-react'
import { CRM_TICKETS, CUSTOMERS, type Store, type CRMTicket } from '../data/mockData'

interface CRMProps { store: Store }

const statusLabel = { open: 'Aberto', inprogress: 'Em Atendimento', resolved: 'Resolvido', closed: 'Fechado' }
const statusColor = {
  open: 'bg-blue-500/10 text-blue-400',
  inprogress: 'bg-yellow-500/10 text-yellow-400',
  resolved: 'bg-emerald-500/10 text-emerald-400',
  closed: 'bg-slate-500/10 text-slate-400',
}
const priorityColor = {
  low: 'bg-slate-500/10 text-slate-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  high: 'bg-red-500/10 text-red-400',
}
const channelIcon = { whatsapp: '💬', phone: '📞', inperson: '🏪' }

export default function CRM({ store }: CRMProps) {
  const storeTickets = CRM_TICKETS.filter(t => t.storeId === store.id)
  const [tickets, setTickets] = useState<CRMTicket[]>(storeTickets)
  const [selectedTicket, setSelectedTicket] = useState<CRMTicket | null>(tickets[0] || null)
  const [reply, setReply] = useState('')
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [showWAModal, setShowWAModal] = useState(false)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({ customerName: '', phone: '', subject: '', channel: 'whatsapp' as 'whatsapp' | 'phone' | 'inperson' })

  const sendReply = () => {
    if (!reply.trim() || !selectedTicket) return
    const msg = { id: Date.now(), from: 'agent' as const, text: reply, timestamp: new Date().toLocaleString('pt-BR'), read: true }
    const updated = { ...selectedTicket, messages: [...selectedTicket.messages, msg], updatedAt: msg.timestamp }
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updated : t))
    setSelectedTicket(updated)
    setReply('')
  }

  const updateStatus = (status: CRMTicket['status']) => {
    if (!selectedTicket) return
    const updated = { ...selectedTicket, status }
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updated : t))
    setSelectedTicket(updated)
  }

  const handleNewTicket = () => {
    const ticket: CRMTicket = {
      id: Date.now(), storeId: store.id, customerId: 0,
      customerName: newTicket.customerName, customerPhone: newTicket.phone,
      channel: newTicket.channel, subject: newTicket.subject,
      status: 'open', priority: 'medium', messages: [],
      createdAt: new Date().toLocaleString('pt-BR'), updatedAt: new Date().toLocaleString('pt-BR'),
    }
    setTickets(prev => [ticket, ...prev])
    setSelectedTicket(ticket)
    setShowNewTicket(false)
    setNewTicket({ customerName: '', phone: '', subject: '', channel: 'whatsapp' })
  }

  const unreadCount = tickets.reduce((sum, t) => sum + t.messages.filter(m => m.from === 'customer' && !m.read).length, 0)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* WhatsApp Modal */}
      {showWAModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <span className="text-2xl">💬</span> Conectar WhatsApp
              </h3>
              <button onClick={() => setShowWAModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
              <p className="text-emerald-400 text-sm font-medium mb-1">Como funciona:</p>
              <ul className="text-emerald-300/70 text-xs space-y-1">
                <li>• Conecte via WhatsApp Business API ou Z-API</li>
                <li>• Receba e envie mensagens direto no CRM</li>
                <li>• Atendimento multi-agente por loja</li>
              </ul>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Número do WhatsApp Business</label>
                <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="+55 (11) 99999-9999"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Token API (Z-API / Business)</label>
                <input type="password" placeholder="••••••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center cursor-pointer hover:border-white/20 transition-all">
                <span className="text-2xl mb-1 block">⚡</span>
                <p className="text-white text-xs font-medium">Z-API</p>
                <p className="text-slate-500 text-xs">Fácil setup</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center cursor-pointer hover:border-white/20 transition-all">
                <span className="text-2xl mb-1 block">🟢</span>
                <p className="text-white text-xs font-medium">Business API</p>
                <p className="text-slate-500 text-xs">Oficial Meta</p>
              </div>
            </div>
            <button onClick={() => { setWhatsappConnected(true); setShowWAModal(false) }}
              className="w-full mt-5 py-3 rounded-xl text-white font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 transition-colors">
              Conectar WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* New ticket modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Novo Atendimento</h3>
              <button onClick={() => setShowNewTicket(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nome do Cliente</label>
                <input value={newTicket.customerName} onChange={e => setNewTicket(f => ({ ...f, customerName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Telefone</label>
                <input value={newTicket.phone} onChange={e => setNewTicket(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Assunto</label>
                <input value={newTicket.subject} onChange={e => setNewTicket(f => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Canal</label>
                <select value={newTicket.channel} onChange={e => setNewTicket(f => ({ ...f, channel: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500">
                  <option value="whatsapp" className="bg-[#1A1A2E]">💬 WhatsApp</option>
                  <option value="phone" className="bg-[#1A1A2E]">📞 Telefone</option>
                  <option value="inperson" className="bg-[#1A1A2E]">🏪 Presencial</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewTicket(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">Cancelar</button>
              <button onClick={handleNewTicket} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: store.color }}>Criar Atendimento</button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets list */}
      <div className="w-72 flex-shrink-0 border-r border-white/8 flex flex-col bg-[#0D0D14]">
        {/* Header */}
        <div className="p-4 border-b border-white/8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-white font-bold text-base">CRM</h1>
            <button onClick={() => setShowNewTicket(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* WhatsApp status */}
          <button onClick={() => setShowWAModal(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              whatsappConnected
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
            }`}>
            {whatsappConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {whatsappConnected ? `WhatsApp conectado · ${whatsappNumber || '(11) 99999-0000'}` : 'Conectar WhatsApp'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 p-3 border-b border-white/8">
          {[
            { label: 'Abertos', count: tickets.filter(t => t.status === 'open').length, color: 'text-blue-400' },
            { label: 'Andamento', count: tickets.filter(t => t.status === 'inprogress').length, color: 'text-yellow-400' },
            { label: 'Resolvidos', count: tickets.filter(t => t.status === 'resolved').length, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="text-center py-2 rounded-xl bg-white/3">
              <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
              <p className="text-slate-600 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum atendimento</p>
            </div>
          ) : tickets.map(ticket => {
            const unread = ticket.messages.filter(m => m.from === 'customer' && !m.read).length
            return (
              <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'border-white/15 bg-white/5'
                    : 'border-transparent hover:bg-white/3'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-white text-xs font-semibold truncate flex-1">{ticket.customerName}</span>
                  {unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center flex-shrink-0">{unread}</span>
                  )}
                </div>
                <p className="text-slate-500 text-xs truncate mb-1.5">{ticket.subject}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{channelIcon[ticket.channel]}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColor[ticket.status]}`}>{statusLabel[ticket.status]}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat panel */}
      {selectedTicket ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ backgroundColor: store.color + '25', color: store.accentColor }}>
                {selectedTicket.customerName[0]}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{selectedTicket.customerName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{selectedTicket.customerPhone}</span>
                  <span className="text-xs">{channelIcon[selectedTicket.channel]}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${priorityColor[selectedTicket.priority]}`}>
                    {selectedTicket.priority === 'high' ? 'Urgente' : selectedTicket.priority === 'medium' ? 'Normal' : 'Baixa'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(['open', 'inprogress', 'resolved'] as const).map(s => (
                <button key={s} onClick={() => updateStatus(s)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${selectedTicket.status === s ? statusColor[s] + ' border-current/30' : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedTicket.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                  msg.from === 'agent'
                    ? 'text-white rounded-br-sm'
                    : 'bg-white/8 border border-white/10 text-slate-200 rounded-bl-sm'
                }`} style={msg.from === 'agent' ? { backgroundColor: store.color } : {}}>
                  <p>{msg.text}</p>
                  <p className="text-xs mt-1 opacity-60 text-right">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            {selectedTicket.messages.length === 0 && (
              <div className="text-center py-8 text-slate-600">
                <p className="text-sm">Nenhuma mensagem ainda</p>
                <p className="text-xs mt-1">Inicie o atendimento abaixo</p>
              </div>
            )}
          </div>

          {/* Reply box */}
          <div className="p-4 border-t border-white/8">
            <div className="flex gap-3">
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                placeholder="Digite sua resposta... (Enter para enviar)"
                rows={2}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none transition-all" />
              <button onClick={sendReply} disabled={!reply.trim()}
                className="w-12 h-full rounded-xl flex items-center justify-center text-white transition-all hover:opacity-80 disabled:opacity-30"
                style={{ backgroundColor: store.color }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-600">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Selecione um atendimento</p>
          </div>
        </div>
      )}
    </div>
  )
}
