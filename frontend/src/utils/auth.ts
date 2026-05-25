import type { CurrentUser, LoginResponse } from '@/api/client'

const TOKEN_KEY = 'portal_token'
const REFRESH_TOKEN_KEY = 'portal_refresh_token'
const USER_KEY = 'portal_user'

const normalizeRole = (role?: string) => {
  const value = String(role || '').trim().toLowerCase()
  if (value === 'role_admin' || value === 'super_admin') return 'admin'
  return value
}

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const getFirstRole = (payload: LoginResponse) => {
  return payload.user?.role || payload.user?.roles?.[0] || payload.roles?.[0] || ''
}

export const authState = {
  saveSession(payload: LoginResponse) {
    if (!payload.accessToken || !payload.user) {
      throw new Error('Login response is missing accessToken or user.')
    }

    const role = normalizeRole(getFirstRole(payload))
    const roles = (payload.user.roles || payload.roles || []).map((item) => normalizeRole(item))
    const user = {
      ...payload.user,
      role,
      roles,
      permissions: payload.user.permissions || payload.permissions || []
    }

    localStorage.setItem(TOKEN_KEY, payload.accessToken)
    if (payload.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  token() {
    return localStorage.getItem(TOKEN_KEY) || ''
  },

  user() {
    return safeParse<CurrentUser | null>(localStorage.getItem(USER_KEY), null)
  },

  displayName() {
    const user = this.user()
    return user?.displayName || user?.name || user?.username || 'Admin'
  },

  role() {
    return normalizeRole(this.user()?.role)
  },

  isLoggedIn() {
    return Boolean(this.token() && this.user())
  },

  isAdmin() {
    return this.role() === 'admin'
  }
}

export const canAccessCourse = (permission?: string) => {
  const value = permission || 'public'
  if (value === 'public') return true
  if (!authState.isLoggedIn()) return false
  if (authState.isAdmin()) return true
  return value === 'internal' && authState.role() === 'internal'
}
