import { createRouter, createWebHistory } from 'vue-router'
import PortalLayout from '@/layouts/PortalLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import HomeView from '@/views/portal/HomeView.vue'
import CoursesView from '@/views/portal/CoursesView.vue'
import CourseDetailView from '@/views/portal/CourseDetailView.vue'
import PortalNewsView from '@/views/portal/PortalNewsView.vue'
import PortalNoticesView from '@/views/portal/PortalNoticesView.vue'
import PortalTeachersView from '@/views/portal/PortalTeachersView.vue'
import ProfileView from '@/views/portal/ProfileView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForbiddenView from '@/views/auth/ForbiddenView.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminPageConfigView from '@/views/admin/AdminPageConfigView.vue'
import AdminCoursesView from '@/views/admin/AdminCoursesView.vue'
import AdminCollegesView from '@/views/admin/AdminCollegesView.vue'
import AdminBannersView from '@/views/admin/AdminBannersView.vue'
import AdminNoticesView from '@/views/admin/AdminNoticesView.vue'
import AdminNewsView from '@/views/admin/AdminNewsView.vue'
import AdminTeachersView from '@/views/admin/AdminTeachersView.vue'
import AdminFriendLinksView from '@/views/admin/AdminFriendLinksView.vue'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'
import AdminSettingsView from '@/views/admin/AdminSettingsView.vue'
import { authState } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: PortalLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'courses', name: 'courses', component: CoursesView },
        { path: 'courses/:id', name: 'course-detail', component: CourseDetailView },
        { path: 'notices', name: 'portal-notices', component: PortalNoticesView },
        { path: 'news', name: 'portal-news', component: PortalNewsView },
        { path: 'teachers', name: 'portal-teachers', component: PortalTeachersView },
        { path: 'profile', name: 'profile', component: ProfileView }
      ]
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/403', name: 'forbidden', component: ForbiddenView },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboardView },
        { path: 'page-config', name: 'admin-page-config', component: AdminPageConfigView },
        { path: 'courses', name: 'admin-courses', component: AdminCoursesView },
        { path: 'colleges', name: 'admin-colleges', component: AdminCollegesView },
        { path: 'banners', name: 'admin-banners', component: AdminBannersView },
        { path: 'notices', name: 'admin-notices', component: AdminNoticesView },
        { path: 'news', name: 'admin-news', component: AdminNewsView },
        { path: 'teachers', name: 'admin-teachers', component: AdminTeachersView },
        { path: 'friend-links', name: 'admin-friend-links', component: AdminFriendLinksView },
        { path: 'users', name: 'admin-users', component: AdminUsersView },
        { path: 'settings', name: 'admin-settings', component: AdminSettingsView }
      ]
    },
    { path: '/cms/:pathMatch(.*)*', redirect: '/admin/dashboard' }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (!to.matched.some((record) => record.meta.requiresAdmin)) {
    return true
  }

  if (!authState.isLoggedIn()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!authState.isAdmin()) {
    return { name: 'forbidden' }
  }

  return true
})

export default router
