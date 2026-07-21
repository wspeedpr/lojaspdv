export type UserRole = 'superadmin' | 'admin' | 'manager' | 'employee'

export interface SystemUser {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  storeIds: number[]   // lojas que este usuário pode acessar
  active: boolean
  createdAt: string
}

const STORAGE_KEY = 'pdv_system_users'

const DEFAULT_USERS: SystemUser[] = [
  {
    id: 'superadmin-1',
    name: 'Super Administrador',
    email: 'wspeedpr@gmail.com',
    password: 'p1p2c4cxcx',
    role: 'superadmin',
    storeIds: [1, 2, 3, 4, 5],
    active: true,
    createdAt: '2026-07-21',
  },
]

export function getUsers(): SystemUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
      return DEFAULT_USERS
    }
    const users: SystemUser[] = JSON.parse(stored)
    // Garante que o superadmin sempre existe
    const hasSuperAdmin = users.some(u => u.email === 'wspeedpr@gmail.com')
    if (!hasSuperAdmin) {
      const all = [DEFAULT_USERS[0], ...users]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
      return all
    }
    return users
  } catch { return DEFAULT_USERS }
}

export function saveUsers(users: SystemUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function authenticate(email: string, password: string): SystemUser | null {
  const users = getUsers()
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active
  )
  return user || null
}

export function addUser(user: Omit<SystemUser, 'id' | 'createdAt'>): SystemUser {
  const users = getUsers()
  const newUser: SystemUser = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toLocaleDateString('pt-BR'),
  }
  saveUsers([...users, newUser])
  return newUser
}

export function updateUser(id: string, data: Partial<SystemUser>) {
  const users = getUsers()
  const updated = users.map(u => u.id === id ? { ...u, ...data } : u)
  saveUsers(updated)
}

export function deleteUser(id: string) {
  const users = getUsers()
  saveUsers(users.filter(u => u.id !== id))
}

export const roleLabel: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  manager: 'Gerente',
  employee: 'Funcionário',
}
