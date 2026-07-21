export type StoreType = 'fashion' | 'general' | 'convenience' | 'gym' | 'pharmacy'

export interface Store {
  id: number
  name: string
  type: StoreType
  cnpj: string
  address: string
  color: string
  accentColor: string
  icon: string
  db: string
  invoicePrefix: string
}

export interface Invoice {
  id: string
  storeId: number
  storeName: string
  invoiceNumber: string
  customerId: number
  customerName: string
  customerCpf: string
  employeeId: number
  employeeName: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash'
  status: 'open' | 'paid' | 'cancelled'
  paidAt?: string
  createdAt: string
  dueDate: string
  commission: number
  notes?: string
}

export interface Product {
  id: number
  storeId: number
  code: string
  name: string
  category: string
  costPrice: number
  salePrice: number
  margin: number
  stock: number
  unit: string
  commission: number
}

export interface Employee {
  id: number
  storeId: number
  name: string
  role: string
  cpf: string
  phone: string
  commissionRate: number
  sales: number
  totalCommission: number
  status: 'active' | 'inactive'
}

export interface Customer {
  id: number
  name: string
  cpf: string
  phone: string
  email: string
  address: string
  source: 'sgp' | 'manual'
  storeIds: number[]
  lastPurchase: string
  totalSpent: number
}

export interface Sale {
  id: number
  storeId: number
  customerId: number
  customerName: string
  employeeId: number
  employeeName: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash'
  pixKey?: string
  status: 'pending' | 'paid' | 'cancelled'
  date: string
  commission: number
}

export interface SaleItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  total: number
  commission: number
}

export interface CRMTicket {
  id: number
  storeId: number
  customerId: number
  customerName: string
  customerPhone: string
  channel: 'whatsapp' | 'phone' | 'inperson'
  subject: string
  status: 'open' | 'inprogress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  messages: CRMMessage[]
  createdAt: string
  updatedAt: string
}

export interface CRMMessage {
  id: number
  from: 'customer' | 'agent'
  text: string
  timestamp: string
  read: boolean
}

export const STORES: Store[] = [
  {
    id: 1,
    name: 'Você Elegante',
    type: 'fashion',
    cnpj: '12.345.678/0001-01',
    address: 'Rua das Flores, 100 - Centro',
    color: '#7C3AED',
    accentColor: '#A78BFA',
    icon: '👗',
    db: 'db_loja1',
    invoicePrefix: 'VE',
  },
  {
    id: 2,
    name: 'Cell Center',
    type: 'general',
    cnpj: '12.345.678/0002-02',
    address: 'Av. Comercial, 200 - Bairro Novo',
    color: '#0369A1',
    accentColor: '#38BDF8',
    icon: '🛒',
    db: 'db_loja2',
    invoicePrefix: 'CC',
  },
  {
    id: 3,
    name: 'All Home',
    type: 'convenience',
    cnpj: '12.345.678/0003-03',
    address: 'Rua Principal, 300 - Vila Alta',
    color: '#059669',
    accentColor: '#34D399',
    icon: '🏪',
    db: 'db_loja3',
    invoicePrefix: 'AH',
  },
  {
    id: 4,
    name: 'Iron Fit',
    type: 'gym',
    cnpj: '12.345.678/0004-04',
    address: 'Av. Saúde, 400 - Jardim',
    color: '#DC2626',
    accentColor: '#F87171',
    icon: '🏋️',
    db: 'db_academia',
    invoicePrefix: 'IF',
  },
  {
    id: 5,
    name: 'Farmácia Vida',
    type: 'pharmacy',
    cnpj: '12.345.678/0005-05',
    address: 'Rua da Saúde, 500 - Centro',
    color: '#D97706',
    accentColor: '#FCD34D',
    icon: '💊',
    db: 'db_farmacia',
    invoicePrefix: 'FV',
  },
]

// Gerador de número de fatura por loja
export function generateInvoiceNumber(prefix: string, storeId: number): string {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `${prefix}-${year}-${seq}`
}

// Storage de faturas por loja (chave no localStorage)
export function getInvoiceStorageKey(storeId: number) {
  return `pdv_invoices_store_${storeId}`
}

export function loadInvoices(storeId: number): Invoice[] {
  try {
    return JSON.parse(localStorage.getItem(getInvoiceStorageKey(storeId)) || '[]')
  } catch { return [] }
}

export function saveInvoices(storeId: number, invoices: Invoice[]) {
  localStorage.setItem(getInvoiceStorageKey(storeId), JSON.stringify(invoices))
}

export const PRODUCTS: Product[] = [
  // Loja Fashion
  { id: 1, storeId: 1, code: 'CAM001', name: 'Camisa Social Slim', category: 'Camisas', costPrice: 45, salePrice: 129.9, margin: 65, stock: 30, unit: 'un', commission: 5 },
  { id: 2, storeId: 1, code: 'CAL001', name: 'Calça Jeans Premium', category: 'Calças', costPrice: 89, salePrice: 249.9, margin: 64, stock: 15, unit: 'un', commission: 5 },
  { id: 3, storeId: 1, code: 'VES001', name: 'Vestido Midi Floral', category: 'Vestidos', costPrice: 65, salePrice: 189.9, margin: 66, stock: 20, unit: 'un', commission: 5 },
  { id: 4, storeId: 1, code: 'TEN001', name: 'Tênis Casual Branco', category: 'Calçados', costPrice: 110, salePrice: 299.9, margin: 63, stock: 12, unit: 'par', commission: 4 },
  // Loja Geral
  { id: 5, storeId: 2, code: 'ELE001', name: 'Fone Bluetooth Pro', category: 'Eletrônicos', costPrice: 89, salePrice: 199.9, margin: 55, stock: 25, unit: 'un', commission: 4 },
  { id: 6, storeId: 2, code: 'ELE002', name: 'Caixa de Som Portátil', category: 'Eletrônicos', costPrice: 120, salePrice: 289.9, margin: 58, stock: 18, unit: 'un', commission: 4 },
  { id: 7, storeId: 2, code: 'DOM001', name: 'Jogo de Panelas 5pcs', category: 'Domésticos', costPrice: 145, salePrice: 349.9, margin: 59, stock: 10, unit: 'kit', commission: 3 },
  // Conveniência
  { id: 8, storeId: 3, code: 'BEB001', name: 'Água Mineral 500ml', category: 'Bebidas', costPrice: 0.9, salePrice: 3.5, margin: 74, stock: 200, unit: 'un', commission: 0 },
  { id: 9, storeId: 3, code: 'SNK001', name: 'Salgadinho Elma Chips', category: 'Snacks', costPrice: 3.5, salePrice: 8.9, margin: 61, stock: 80, unit: 'un', commission: 0 },
  { id: 10, storeId: 3, code: 'HIG001', name: 'Shampoo Pantene 400ml', category: 'Higiene', costPrice: 12, salePrice: 28.9, margin: 58, stock: 40, unit: 'un', commission: 0 },
  // Academia
  { id: 11, storeId: 4, code: 'PLN001', name: 'Plano Mensal', category: 'Planos', costPrice: 0, salePrice: 89.9, margin: 100, stock: 999, unit: 'mês', commission: 8 },
  { id: 12, storeId: 4, code: 'PLN002', name: 'Plano Trimestral', category: 'Planos', costPrice: 0, salePrice: 229.9, margin: 100, stock: 999, unit: 'trim', commission: 8 },
  { id: 13, storeId: 4, code: 'SUP001', name: 'Whey Protein 900g', category: 'Suplementos', costPrice: 89, salePrice: 189.9, margin: 53, stock: 22, unit: 'un', commission: 6 },
  { id: 14, storeId: 4, code: 'AVA001', name: 'Avaliação Física', category: 'Serviços', costPrice: 0, salePrice: 49.9, margin: 100, stock: 999, unit: 'un', commission: 15 },
  // Farmácia
  { id: 15, storeId: 5, code: 'MED001', name: 'Dipirona 500mg (10cp)', category: 'Analgésicos', costPrice: 2.5, salePrice: 7.9, margin: 68, stock: 100, unit: 'cx', commission: 2 },
  { id: 16, storeId: 5, code: 'MED002', name: 'Amoxicilina 500mg', category: 'Antibióticos', costPrice: 18, salePrice: 42.9, margin: 58, stock: 50, unit: 'cx', commission: 2 },
  { id: 17, storeId: 5, code: 'VIT001', name: 'Vitamina C 1000mg (30cp)', category: 'Vitaminas', costPrice: 22, salePrice: 54.9, margin: 60, stock: 60, unit: 'cx', commission: 3 },
  { id: 18, storeId: 5, code: 'COS001', name: 'Protetor Solar FPS 50', category: 'Cosméticos', costPrice: 28, salePrice: 69.9, margin: 60, stock: 35, unit: 'un', commission: 3 },
]

export const EMPLOYEES: Employee[] = [
  { id: 1, storeId: 1, name: 'Amanda Ferreira', role: 'Vendedora', cpf: '111.222.333-01', phone: '(11) 98001-0001', commissionRate: 5, sales: 42, totalCommission: 890.5, status: 'active' },
  { id: 2, storeId: 1, name: 'Carlos Mendes', role: 'Vendedor', cpf: '111.222.333-02', phone: '(11) 98001-0002', commissionRate: 5, sales: 38, totalCommission: 720.3, status: 'active' },
  { id: 3, storeId: 2, name: 'Fernanda Lima', role: 'Vendedora', cpf: '111.222.333-03', phone: '(11) 98001-0003', commissionRate: 4, sales: 55, totalCommission: 640.0, status: 'active' },
  { id: 4, storeId: 2, name: 'Rafael Souza', role: 'Caixa', cpf: '111.222.333-04', phone: '(11) 98001-0004', commissionRate: 2, sales: 80, totalCommission: 390.0, status: 'active' },
  { id: 5, storeId: 3, name: 'Patricia Gomes', role: 'Operadora', cpf: '111.222.333-05', phone: '(11) 98001-0005', commissionRate: 0, sales: 120, totalCommission: 0, status: 'active' },
  { id: 6, storeId: 4, name: 'Marcos Oliveira', role: 'Instrutor', cpf: '111.222.333-06', phone: '(11) 98001-0006', commissionRate: 8, sales: 30, totalCommission: 1250.0, status: 'active' },
  { id: 7, storeId: 4, name: 'Juliana Costa', role: 'Recepcionista', cpf: '111.222.333-07', phone: '(11) 98001-0007', commissionRate: 5, sales: 25, totalCommission: 620.0, status: 'active' },
  { id: 8, storeId: 5, name: 'Diego Santos', role: 'Farmacêutico', cpf: '111.222.333-08', phone: '(11) 98001-0008', commissionRate: 3, sales: 95, totalCommission: 780.5, status: 'active' },
  { id: 9, storeId: 5, name: 'Camila Rocha', role: 'Atendente', cpf: '111.222.333-09', phone: '(11) 98001-0009', commissionRate: 2, sales: 88, totalCommission: 510.0, status: 'active' },
]

export const CUSTOMERS: Customer[] = [
  { id: 1, name: 'Ana Paula Rodrigues', cpf: '000.111.222-01', phone: '(11) 99001-0001', email: 'ana@email.com', address: 'Rua A, 10', source: 'sgp', storeIds: [1, 2], lastPurchase: '2026-07-18', totalSpent: 1250.9 },
  { id: 2, name: 'Bruno Carvalho', cpf: '000.111.222-02', phone: '(11) 99001-0002', email: 'bruno@email.com', address: 'Rua B, 20', source: 'sgp', storeIds: [1, 3], lastPurchase: '2026-07-15', totalSpent: 680.5 },
  { id: 3, name: 'Carla Vieira', cpf: '000.111.222-03', phone: '(11) 99001-0003', email: 'carla@email.com', address: 'Rua C, 30', source: 'manual', storeIds: [2], lastPurchase: '2026-07-20', totalSpent: 420.0 },
  { id: 4, name: 'Daniel Nunes', cpf: '000.111.222-04', phone: '(11) 99001-0004', email: 'daniel@email.com', address: 'Rua D, 40', source: 'sgp', storeIds: [4], lastPurchase: '2026-07-10', totalSpent: 899.7 },
  { id: 5, name: 'Elaine Barbosa', cpf: '000.111.222-05', phone: '(11) 99001-0005', email: 'elaine@email.com', address: 'Rua E, 50', source: 'sgp', storeIds: [5, 1], lastPurchase: '2026-07-19', totalSpent: 2100.3 },
  { id: 6, name: 'Fábio Teixeira', cpf: '000.111.222-06', phone: '(11) 99001-0006', email: 'fabio@email.com', address: 'Rua F, 60', source: 'manual', storeIds: [3, 5], lastPurchase: '2026-07-12', totalSpent: 345.0 },
]

export const SALES: Sale[] = [
  {
    id: 1, storeId: 1, customerId: 1, customerName: 'Ana Paula Rodrigues',
    employeeId: 1, employeeName: 'Amanda Ferreira',
    items: [
      { productId: 1, productName: 'Camisa Social Slim', quantity: 2, unitPrice: 129.9, total: 259.8, commission: 13.0 },
      { productId: 3, productName: 'Vestido Midi Floral', quantity: 1, unitPrice: 189.9, total: 189.9, commission: 9.5 },
    ],
    subtotal: 449.7, discount: 0, total: 449.7, paymentMethod: 'pix',
    status: 'paid', date: '2026-07-21', commission: 22.5,
  },
  {
    id: 2, storeId: 2, customerId: 3, customerName: 'Carla Vieira',
    employeeId: 3, employeeName: 'Fernanda Lima',
    items: [
      { productId: 5, productName: 'Fone Bluetooth Pro', quantity: 1, unitPrice: 199.9, total: 199.9, commission: 8.0 },
    ],
    subtotal: 199.9, discount: 10, total: 189.9, paymentMethod: 'credit',
    status: 'paid', date: '2026-07-21', commission: 7.6,
  },
  {
    id: 3, storeId: 4, customerId: 4, customerName: 'Daniel Nunes',
    employeeId: 6, employeeName: 'Marcos Oliveira',
    items: [
      { productId: 11, productName: 'Plano Mensal', quantity: 1, unitPrice: 89.9, total: 89.9, commission: 7.2 },
    ],
    subtotal: 89.9, discount: 0, total: 89.9, paymentMethod: 'pix',
    status: 'paid', date: '2026-07-21', commission: 7.2,
  },
]

export const CRM_TICKETS: CRMTicket[] = [
  {
    id: 1, storeId: 1, customerId: 1, customerName: 'Ana Paula Rodrigues',
    customerPhone: '(11) 99001-0001', channel: 'whatsapp',
    subject: 'Dúvida sobre troca de produto',
    status: 'open', priority: 'medium',
    messages: [
      { id: 1, from: 'customer', text: 'Oi, gostaria de trocar a camisa que comprei. Ficou grande.', timestamp: '2026-07-21 09:30', read: true },
      { id: 2, from: 'agent', text: 'Olá Ana! Claro, pode trazer a nota fiscal e o produto para fazermos a troca.', timestamp: '2026-07-21 09:35', read: true },
      { id: 3, from: 'customer', text: 'Até que horário vocês atendem?', timestamp: '2026-07-21 09:40', read: false },
    ],
    createdAt: '2026-07-21 09:30', updatedAt: '2026-07-21 09:40',
  },
  {
    id: 2, storeId: 4, customerId: 4, customerName: 'Daniel Nunes',
    customerPhone: '(11) 99001-0004', channel: 'whatsapp',
    subject: 'Cancelamento de plano',
    status: 'inprogress', priority: 'high',
    messages: [
      { id: 1, from: 'customer', text: 'Quero cancelar minha matrícula.', timestamp: '2026-07-20 14:00', read: true },
      { id: 2, from: 'agent', text: 'Olá Daniel! Sentimos muito. Posso entender o motivo?', timestamp: '2026-07-20 14:10', read: true },
    ],
    createdAt: '2026-07-20 14:00', updatedAt: '2026-07-20 14:10',
  },
  {
    id: 3, storeId: 5, customerId: 5, customerName: 'Elaine Barbosa',
    customerPhone: '(11) 99001-0005', channel: 'phone',
    subject: 'Medicamento em falta',
    status: 'resolved', priority: 'low',
    messages: [
      { id: 1, from: 'customer', text: 'Vocês têm Losartana 50mg?', timestamp: '2026-07-19 10:00', read: true },
      { id: 2, from: 'agent', text: 'Verificamos e temos em estoque sim!', timestamp: '2026-07-19 10:05', read: true },
    ],
    createdAt: '2026-07-19 10:00', updatedAt: '2026-07-19 10:05',
  },
]

export const DASHBOARD_METRICS = {
  1: { todaySales: 4890.5, todayOrders: 32, monthSales: 89340, pendingPix: 3, topProduct: 'Vestido Midi Floral', stockAlerts: 2 },
  2: { todaySales: 3210.8, todayOrders: 28, monthSales: 62100, pendingPix: 1, topProduct: 'Fone Bluetooth Pro', stockAlerts: 1 },
  3: { todaySales: 1890.3, todayOrders: 95, monthSales: 38900, pendingPix: 0, topProduct: 'Água Mineral', stockAlerts: 0 },
  4: { todaySales: 2340.0, todayOrders: 18, monthSales: 51200, pendingPix: 2, topProduct: 'Plano Mensal', stockAlerts: 0 },
  5: { todaySales: 5120.9, todayOrders: 142, monthSales: 98700, pendingPix: 4, topProduct: 'Vitamina C', stockAlerts: 3 },
}

export const MONTHLY_CHART = [
  { mes: 'Jan', loja1: 72000, loja2: 51000, loja3: 32000, loja4: 41000, loja5: 81000 },
  { mes: 'Fev', loja1: 68000, loja2: 48000, loja3: 29000, loja4: 44000, loja5: 85000 },
  { mes: 'Mar', loja1: 81000, loja2: 55000, loja3: 35000, loja4: 48000, loja5: 91000 },
  { mes: 'Abr', loja1: 77000, loja2: 52000, loja3: 33000, loja4: 46000, loja5: 88000 },
  { mes: 'Mai', loja1: 90000, loja2: 60000, loja3: 38000, loja4: 52000, loja5: 95000 },
  { mes: 'Jun', loja1: 85000, loja2: 58000, loja3: 36000, loja4: 50000, loja5: 93000 },
  { mes: 'Jul', loja1: 89340, loja2: 62100, loja3: 38900, loja4: 51200, loja5: 98700 },
]
