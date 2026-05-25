import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('portal_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface PageQuery {
  page?: number
  size?: number
  keyword?: string
  category?: string
  categoryCode?: string
  status?: string
  source?: string
  userType?: string
  role?: string
  termCode?: string
  permission?: string
  position?: string
  department?: string
  college?: string
  featured?: boolean
}

export interface Course {
  id: number
  title: string
  category: string
  teacher: string
  cover: string
  summary: string
  lessons: number
  learners: number
  level: string
  college?: string
  rating?: number
  progress?: number
  enrolled?: boolean
  releasedAt?: string
  duration?: string
  releaseDate?: string
  type?: string
  featured?: boolean
  permission?: string
  permissions?: string[]
  requiredPermission?: string
  requiredRole?: string
  accessAllowed?: boolean
  allowed?: boolean
  launchUrl?: string
  externalCourseId?: string
  termCode?: string
  objectives?: string
  syllabus?: string
}

export interface PortalCollege {
  id?: number
  siteCode?: string
  code?: string
  name: string
  title?: string
  description?: string
  courseCount?: number
  count?: number
  sortOrder?: number
  enabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PortalDictionaryItem {
  id?: number | string
  code?: string
  name?: string
  title?: string
  label?: string
  value?: string
  sortOrder?: number
  enabled?: boolean
}

export interface FriendLink {
  id?: number
  siteCode?: string
  title: string
  name?: string
  url: string
  logoUrl?: string | null
  description?: string
  sortOrder: number
  enabled: boolean
}

export interface AdminCoursePayload {
  id?: number
  externalCourseId?: string
  courseCode?: string
  courseName: string
  teacherName?: string
  department?: string
  category?: string
  credit?: number
  coverUrl?: string
  launchUrl?: string
  status?: string
  permission?: string
  featured?: boolean
  description?: string
}

export interface PortalBanner {
  id?: number
  title: string
  imageUrl: string
  linkUrl?: string
  position?: string
  sortOrder?: number
  enabled?: boolean
  description?: string
}

export interface PortalContent {
  id?: number
  title: string
  summary: string
  sourceName: string
  categoryName: string
  publishedAt: string
  viewCount: number
  coverUrl: string
}

export interface AdminArticle {
  id?: number
  categoryId?: number
  categoryCode?: string
  title: string
  slug?: string
  summary?: string
  content?: string
  coverUrl?: string
  author?: string
  sourceName?: string
  tags?: string
  status?: string
  pinned?: boolean
  featured?: boolean
  allowComment?: boolean
  viewCount?: number
  publishedAt?: string
  offlineAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface PortalTeacher {
  id?: number
  siteCode?: string
  name: string
  title?: string
  college?: string
  achievement?: string
  research?: string
  courseCount?: number
  avatarUrl?: string
  sortOrder?: number
  enabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AdminUser {
  id?: number
  username: string
  displayName: string
  email?: string
  mobile?: string
  userType?: string
  role?: string
  source?: string
  status?: string
  organization?: string
  password?: string
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface PortalHome {
  banners?: unknown[]
  quickLinks?: unknown[]
  externalLinks?: unknown[]
  friendLinks?: unknown[]
  siteConfig?: Record<string, unknown>
  pageConfig?: Record<string, unknown>
  navigation?: unknown[]
  news?: unknown[]
  notices?: unknown[]
  topics?: unknown[]
  courses?: Course[]
  newCourses?: unknown[]
  teachers?: unknown[]
  colleges?: unknown[]
}

export interface PortalPageConfig {
  id?: number | string
  siteCode?: string
  pageCode?: string
  pageTitle?: string
  layoutJson?: string | Record<string, unknown>
  seoJson?: string | Record<string, unknown>
  enabled?: boolean
}

export interface PortalSiteConfigEntry {
  siteCode: string
  configKey: string
  configValue: string
  valueType: string
  description?: string
}

export interface CurrentUser {
  id?: number | string
  name?: string
  displayName?: string
  username?: string
  role?: string
  roles?: string[]
  permissions?: string[]
  department?: string
  college?: string
  major?: string
  studentId?: string
  email?: string
  mobile?: string
  phone?: string
  avatar?: string
}

export interface LoginResponse {
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  user?: CurrentUser & {
    userType?: string
    source?: string
    status?: string
  }
  roles?: string[]
  permissions?: string[]
}

const unwrapData = <T>(payload: unknown): T => {
  const value = payload as { data?: unknown; records?: unknown; list?: unknown }
  if (value && typeof value === 'object' && 'data' in value) return unwrapData<T>(value.data)
  if (value && typeof value === 'object' && Array.isArray(value.records)) return value.records as T
  if (value && typeof value === 'object' && Array.isArray(value.list)) return value.list as T
  return payload as T
}

const requestData = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.request({ url, method: 'GET', ...config })
  return unwrapData<T>(response.data)
}

export const normalizeCourse = (course: Course | Record<string, unknown>): Course => {
  const value = course as Record<string, unknown>
  return {
    id: Number(value.id || 0),
    title: String(value.title || value.courseName || value.name || ''),
    category: String(value.category || ''),
    teacher: String(value.teacher || value.teacherName || ''),
    cover: String(value.cover || value.coverUrl || ''),
    summary: String(value.summary || value.description || ''),
    lessons: Number(value.lessons || value.credit || 0),
    learners: Number(value.learners || 0),
    level: String(value.level || value.type || value.category || ''),
    college: String(value.college || value.department || ''),
    rating: value.rating === undefined ? undefined : Number(value.rating),
    progress: Number(value.progress || 0),
    enrolled: Boolean(value.enrolled),
    releasedAt: String(value.releasedAt || value.lastSyncedAt || ''),
    duration: value.duration ? String(value.duration) : undefined,
    releaseDate: value.releaseDate ? String(value.releaseDate) : undefined,
    type: value.type ? String(value.type) : undefined,
    featured: value.featured === undefined ? false : Boolean(value.featured),
    permission: value.permission ? String(value.permission) : undefined,
    permissions: Array.isArray(value.permissions) ? value.permissions.map((item) => String(item)) : undefined,
    requiredPermission: value.requiredPermission ? String(value.requiredPermission) : undefined,
    requiredRole: value.requiredRole ? String(value.requiredRole) : undefined,
    accessAllowed: typeof value.accessAllowed === 'boolean' ? value.accessAllowed : undefined,
    allowed: typeof value.allowed === 'boolean' ? value.allowed : undefined,
    launchUrl: value.launchUrl ? String(value.launchUrl) : undefined,
    externalCourseId: value.externalCourseId ? String(value.externalCourseId) : undefined,
    termCode: value.termCode ? String(value.termCode) : undefined,
    objectives: value.objectives ? String(value.objectives) : undefined,
    syllabus: value.syllabus ? String(value.syllabus) : undefined
  }
}

export const normalizeAdminCourse = (course: AdminCoursePayload | Record<string, unknown>): AdminCoursePayload => {
  const value = course as Record<string, unknown>
  const courseCode = String(value.courseCode || value.code || value.externalCourseId || '')
  return {
    id: Number(value.id || 0),
    externalCourseId: String(value.externalCourseId || courseCode || value.id || ''),
    courseCode,
    courseName: String(value.courseName || value.name || value.title || ''),
    teacherName: String(value.teacherName || value.teacher || ''),
    department: String(value.department || value.college || ''),
    category: String(value.category || ''),
    credit: Number(value.credit || 0),
    coverUrl: String(value.coverUrl || value.cover || ''),
    launchUrl: String(value.launchUrl || ''),
    status: String(value.status || 'ACTIVE'),
    permission: String(value.permission || 'public'),
    featured: value.featured === undefined ? false : Boolean(value.featured),
    description: String(value.description || value.summary || '')
  }
}

export const normalizeCollege = (item: PortalCollege | Record<string, unknown>): PortalCollege => {
  const value = item as Record<string, unknown>
  const name = String(value.name || value.title || value.college || value.department || '')
  return {
    id: value.id === undefined ? undefined : Number(value.id),
    siteCode: value.siteCode ? String(value.siteCode) : 'main',
    code: value.code ? String(value.code) : undefined,
    name,
    title: value.title ? String(value.title) : undefined,
    description: value.description ? String(value.description) : undefined,
    courseCount: Number(value.courseCount || value.count || 0),
    count: Number(value.count || value.courseCount || 0),
    sortOrder: Number(value.sortOrder || 0),
    enabled: value.enabled === undefined ? true : Boolean(value.enabled),
    createdAt: value.createdAt ? String(value.createdAt) : undefined,
    updatedAt: value.updatedAt ? String(value.updatedAt) : undefined
  }
}

export const normalizeDictionaryLabel = (item: PortalDictionaryItem | string | Record<string, unknown>) => {
  if (typeof item === 'string') return item
  const value = item as Record<string, unknown>
  return String(value.name || value.title || value.label || value.value || value.code || '')
}

export const normalizeBanner = (banner: PortalBanner | Record<string, unknown>): PortalBanner => {
  const value = banner as Record<string, unknown>
  const rawPosition = String(value.position || 'HOME_TOP')
  const position = rawPosition.toLowerCase() === 'home' ? 'HOME_TOP' : rawPosition
  return {
    id: Number(value.id || 0),
    title: String(value.title || value.name || ''),
    imageUrl: String(value.imageUrl || value.image || value.coverUrl || ''),
    linkUrl: String(value.linkUrl || value.link || value.url || ''),
    position,
    sortOrder: Number(value.sortOrder || 0),
    enabled: value.enabled === undefined ? true : Boolean(value.enabled),
    description: value.description ? String(value.description) : undefined
  }
}

export const normalizePortalContent = (item: Record<string, unknown>): PortalContent => ({
  id: item.id === undefined ? undefined : Number(item.id),
  title: String(item.title || ''),
  summary: String(item.summary || item.description || ''),
  sourceName: String(item.sourceName || item.source || item.author || ''),
  categoryName: String(item.categoryName || item.category || item.categoryCode || ''),
  publishedAt: String(item.publishedAt || item.updatedAt || item.createdAt || ''),
  viewCount: Number(item.viewCount || item.views || 0),
  coverUrl: String(item.coverUrl || item.imageUrl || item.image || item.cover || '')
})

export const applyPortalTheme = (config: Record<string, unknown> = {}) => {
  const primary = config['theme.primary']
  const primaryDark = config['theme.primaryDark']
  const dark = config['theme.dark']
  const root = document.documentElement

  if (typeof primary === 'string' && primary.trim()) {
    root.style.setProperty('--portal-primary', primary.trim())
  }
  if (typeof primaryDark === 'string' && primaryDark.trim()) {
    root.style.setProperty('--portal-primary-dark', primaryDark.trim())
  }
  if (typeof dark === 'string' && dark.trim()) {
    root.style.setProperty('--portal-dark', dark.trim())
  }
}

export const portalApi = {
  getHome() {
    return requestData<PortalHome>('/portal/home')
  },
  getCourses(params: PageQuery = {}) {
    return requestData<Course[]>('/portal/courses', { params })
  },
  getCourse(id: number | string) {
    return requestData<Course>(`/portal/courses/${id}`)
  },
  launchCourse(id: number | string) {
    return requestData<{ launchUrl: string; expiresAt?: string }>(`/portal/courses/${id}/launch`, { method: 'POST' })
  },
  getCategories() {
    return requestData<unknown[]>('/portal/categories/tree')
  },
  getCourseCategories() {
    return requestData<PortalDictionaryItem[]>('/portal/course-categories')
  },
  getCourseLevels() {
    return requestData<PortalDictionaryItem[]>('/portal/course-levels')
  },
  getColleges() {
    return requestData<PortalCollege[]>('/portal/colleges')
  },
  getCategoryArticles(code: string, params: PageQuery = {}) {
    return requestData<unknown[]>(`/portal/categories/${code}/articles`, { params })
  },
  getTeachers(siteCode = 'main') {
    return requestData<PortalTeacher[]>('/portal/teachers', { params: { siteCode } })
  },
  searchArticles(params: PageQuery = {}) {
    return requestData<unknown[]>('/portal/articles/search', { params })
  },
  getSiteConfig() {
    return requestData<Record<string, unknown>>('/portal/site-config')
  },
  getSearchKeywords() {
    return requestData<string[]>('/portal/search-keywords')
  },
  getQuickLinks() {
    return requestData<unknown[]>('/portal/quick-links')
  },
  getExternalLinks() {
    return requestData<unknown[]>('/portal/external-links')
  },
  getFriendLinks() {
    return requestData<FriendLink[]>('/portal/friend-links')
  }
}

export const authApi = {
  login(payload: { username: string; password: string }) {
    return requestData<LoginResponse>('/auth/login', { method: 'POST', data: payload })
  },
  register(payload: { username: string; displayName: string; mobile?: string; email?: string; password: string; organization?: string }) {
    return requestData<CurrentUser>('/auth/register', { method: 'POST', data: payload })
  },
  casLoginUrl(redirectUri: string) {
    return apiClient.get('/auth/cas/login-url', { params: { redirectUri } })
  }
}

export const cmsApi = {
  getPages() {
    return requestData<unknown[]>('/admin/categories/tree')
  },
  savePage(payload: unknown) {
    return apiClient.post('/admin/categories', payload)
  },
  getContents(params: PageQuery = {}) {
    return requestData<unknown[]>('/admin/articles', { params })
  },
  getUsers(params: PageQuery = {}) {
    return requestData<any[]>('/admin/users', { params })
  },
  getDashboard() {
    return requestData<Record<string, unknown>>('/admin/dashboard')
  },
  getBanners() {
    return requestData<PortalBanner[]>('/admin/banners')
  },
  createBanner(payload: PortalBanner) {
    return requestData<PortalBanner>('/admin/banners', { method: 'POST', data: payload })
  },
  uploadImage(file: File, folder = 'banners') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return requestData<{ url: string }>('/admin/uploads/images', {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadBannerImage(file: File) {
    return this.uploadImage(file, 'banners')
  },
  uploadCourseCover(file: File) {
    return this.uploadImage(file, 'courses')
  },
  updateBanner(id: number | string, payload: PortalBanner) {
    return requestData<PortalBanner>(`/admin/banners/${id}`, { method: 'PUT', data: payload })
  },
  deleteBanner(id: number | string) {
    return requestData<void>(`/admin/banners/${id}`, { method: 'DELETE' })
  },
  getQuickLinks() {
    return requestData<unknown[]>('/admin/quick-links')
  },
  getFriendLinks(siteCode = 'main') {
    return requestData<FriendLink[]>('/admin/friend-links', { params: { siteCode } })
  },
  createFriendLink(payload: FriendLink) {
    return requestData<FriendLink>('/admin/friend-links', { method: 'POST', data: payload })
  },
  updateFriendLink(id: number | string, payload: FriendLink) {
    return requestData<FriendLink>(`/admin/friend-links/${id}`, { method: 'PUT', data: payload })
  },
  deleteFriendLink(id: number | string) {
    return requestData<void>(`/admin/friend-links/${id}`, { method: 'DELETE' })
  },
  getSiteConfig() {
    return requestData<Record<string, unknown>>('/admin/site-config')
  },
  saveSiteConfig(payload: PortalSiteConfigEntry) {
    return requestData<PortalSiteConfigEntry>('/admin/site-config', { method: 'PUT', data: payload })
  },
  getPageConfig(pageCode: string, siteCode = 'main') {
    return requestData<PortalPageConfig>(`/admin/page-config/${pageCode}`, { params: { siteCode } })
  },
  savePageConfig(pageCode: string, payload: PortalPageConfig, siteCode = 'main') {
    return requestData<PortalPageConfig>(`/admin/page-config/${pageCode}`, {
      method: 'PUT',
      params: { siteCode },
      data: payload
    })
  },
  getCourses(params: PageQuery = {}) {
    return requestData<unknown[]>('/admin/courses', { params })
  },
  createCourse(payload: AdminCoursePayload) {
    return requestData<AdminCoursePayload>('/admin/courses', { method: 'POST', data: payload })
  },
  updateCourse(id: number | string, payload: AdminCoursePayload) {
    return requestData<AdminCoursePayload>(`/admin/courses/${id}`, { method: 'PUT', data: payload })
  },
  deleteCourse(id: number | string) {
    return requestData<void>(`/admin/courses/${id}`, { method: 'DELETE' })
  },
  getColleges(siteCode = 'main') {
    return requestData<PortalCollege[]>('/admin/colleges', { params: { siteCode } })
  },
  createCollege(payload: PortalCollege) {
    return requestData<PortalCollege>('/admin/colleges', { method: 'POST', data: payload })
  },
  updateCollege(id: number | string, payload: PortalCollege) {
    return requestData<PortalCollege>(`/admin/colleges/${id}`, { method: 'PUT', data: payload })
  },
  deleteCollege(id: number | string) {
    return requestData<void>(`/admin/colleges/${id}`, { method: 'DELETE' })
  },
  getNotices(params: PageQuery = {}) {
    return requestData<AdminArticle[]>('/admin/articles', { params: { ...params, categoryCode: params.categoryCode || 'notice' } })
  },
  getArticles(params: PageQuery = {}) {
    return requestData<AdminArticle[]>('/admin/articles', { params })
  },
  getArticle(id: number | string) {
    return requestData<AdminArticle>(`/admin/articles/${id}`)
  },
  createArticle(payload: AdminArticle) {
    return requestData<AdminArticle>('/admin/articles', { method: 'POST', data: payload })
  },
  updateArticle(id: number | string, payload: Partial<AdminArticle>) {
    return requestData<AdminArticle>(`/admin/articles/${id}`, { method: 'PUT', data: payload })
  },
  deleteArticle(id: number | string) {
    return requestData<void>(`/admin/articles/${id}`, { method: 'DELETE' })
  },
  submitArticle(id: number | string) {
    return requestData<AdminArticle>(`/admin/articles/${id}/submit`, { method: 'POST' })
  },
  approveArticle(id: number | string) {
    return requestData<AdminArticle>(`/admin/articles/${id}/approve`, { method: 'POST' })
  },
  publishArticle(id: number | string) {
    return requestData<AdminArticle>(`/admin/articles/${id}/publish`, { method: 'POST' })
  },
  offlineArticle(id: number | string) {
    return requestData<AdminArticle>(`/admin/articles/${id}/offline`, { method: 'POST' })
  },
  getTeachers(siteCode = 'main') {
    return requestData<PortalTeacher[]>('/admin/teachers', { params: { siteCode } })
  },
  createTeacher(payload: PortalTeacher) {
    return requestData<PortalTeacher>('/admin/teachers', { method: 'POST', data: payload })
  },
  updateTeacher(id: number | string, payload: PortalTeacher) {
    return requestData<PortalTeacher>(`/admin/teachers/${id}`, { method: 'PUT', data: payload })
  },
  deleteTeacher(id: number | string) {
    return requestData<void>(`/admin/teachers/${id}`, { method: 'DELETE' })
  },
  createUser(payload: AdminUser) {
    return requestData<AdminUser>('/admin/users', { method: 'POST', data: payload })
  },
  updateUser(id: number | string, payload: Partial<AdminUser>) {
    return requestData<AdminUser>(`/admin/users/${id}`, { method: 'PUT', data: payload })
  },
  deleteUser(id: number | string) {
    return requestData<void>(`/admin/users/${id}`, { method: 'DELETE' })
  },
  getRoles() {
    return requestData<unknown[]>('/admin/roles')
  }
}

export const userApi = {
  getMe() {
    return requestData<CurrentUser & { roles?: string[]; permissions?: string[] }>('/users/me').then((value) => {
      const wrapped = value as unknown as { user?: CurrentUser; roles?: string[]; permissions?: string[] }
      if (wrapped.user) {
        return {
          ...wrapped.user,
          roles: wrapped.roles,
          permissions: wrapped.permissions
        }
      }
      return value
    })
  },
  updateProfile(payload: Partial<CurrentUser>) {
    return requestData<CurrentUser>('/users/me/profile', { method: 'PUT', data: payload })
  }
}

