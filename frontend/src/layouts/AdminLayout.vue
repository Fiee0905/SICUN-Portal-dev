<template>
  <div class="admin-shell">
    <aside class="admin-sidebar" :class="{ 'is-collapsed': collapsed }">
      <div class="admin-brand">
        <span class="admin-brand-mark">EDU</span>
        <strong v-if="!collapsed">教学门户管理</strong>
      </div>

      <nav class="admin-menu" aria-label="管理后台导航">
        <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path" class="admin-menu-item">
          <el-icon><component :is="item.icon" /></el-icon>
          <span v-if="!collapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button class="admin-collapse" type="button" @click="collapsed = !collapsed">
        <el-icon><component :is="collapsed ? Expand : Fold" /></el-icon>
      </button>
    </aside>

    <section class="admin-stage">
      <header class="admin-header">
        <el-input class="admin-search" placeholder="搜索教学资源、课程或用户..." :prefix-icon="Search" />
        <div class="admin-header-actions">
          <el-button circle :icon="QuestionFilled" />
          <el-button circle :icon="Bell" />
          <div class="admin-user-chip">
            <span>{{ userInitial }}</span>
            <div>
              <strong>{{ displayName }}</strong>
              <small>Admin Portal</small>
            </div>
          </div>
        </div>
      </header>

      <main class="admin-main">
        <RouterView />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  Bell,
  DataBoard,
  Document,
  Expand,
  Fold,
  Link,
  Monitor,
  Notification,
  Picture,
  Promotion,
  QuestionFilled,
  Reading,
  Search,
  Setting,
  UserFilled
} from '@element-plus/icons-vue'
import { authState } from '@/utils/auth'

const collapsed = shallowRef(false)
const displayName = computed(() => authState.displayName())
const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())

const menuItems = [
  { path: '/admin/dashboard', label: '仪表盘', icon: DataBoard },
  { path: '/admin/page-config', label: '页面配置', icon: Monitor },
  { path: '/admin/courses', label: '课程管理', icon: Reading },
  { path: '/admin/colleges', label: '开课单位', icon: Promotion },
  { path: '/admin/banners', label: '轮播管理', icon: Picture },
  { path: '/admin/notices', label: '公告管理', icon: Notification },
  { path: '/admin/news', label: '新闻资讯', icon: Document },
  { path: '/admin/teachers', label: '名师风采', icon: Promotion },
  { path: '/admin/friend-links', label: '友情链接', icon: Link },
  { path: '/admin/users', label: '用户管理', icon: UserFilled },
  { path: '/admin/settings', label: '站点配置', icon: Setting },
  { path: '/', label: '返回前台', icon: Document }
]
</script>
