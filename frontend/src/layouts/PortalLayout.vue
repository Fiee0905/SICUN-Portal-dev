<template>
  <el-container class="portal-shell">
    <header class="portal-header">
      <div class="portal-topbar">
        <div class="portal-wrap portal-topbar-inner">
          <div class="topbar-left">
            <span>
              <el-icon><Connection /></el-icon>
              四川师范大学官网
            </span>
            <span v-if="siteConfig.servicePhone">
              <el-icon><Phone /></el-icon>
              {{ siteConfig.servicePhone }}
            </span>
          </div>
          <div class="topbar-links">
            <a v-for="item in externalLinks" :key="item.name" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
          </div>
        </div>
      </div>

      <div class="portal-navbar">
        <div class="portal-wrap nav-inner">
          <RouterLink class="brand" to="/">
            <span class="brand-mark">S</span>
            <span class="brand-copy">
              <strong>{{ siteConfig.shortName || '四川师范大学' }} <em>{{ siteConfig.platformName || '课程平台' }}</em></strong>
              <small>INTEGRATED COURSE PLATFORM</small>
            </span>
          </RouterLink>

          <nav class="portal-nav" aria-label="门户导航">
            <RouterLink to="/">首页</RouterLink>
            <RouterLink to="/courses">课程中心</RouterLink>
            <RouterLink to="/profile">个人中心</RouterLink>
            <RouterLink to="/teachers">名师风采</RouterLink>
            <RouterLink to="/notices">教务公告</RouterLink>
            <RouterLink to="/admin/dashboard">管理后台</RouterLink>
          </nav>

          <div class="portal-actions">
            <el-input class="nav-search" placeholder="搜索课程、教师、资源..." :prefix-icon="Search" />
            <RouterLink class="login-link" to="/login">登录</RouterLink>
            <RouterLink class="register-link" to="/register">注册</RouterLink>
          </div>
        </div>
      </div>
    </header>

    <el-main class="portal-main">
      <RouterView />
    </el-main>

    <footer class="portal-footer">
      <div class="portal-wrap footer-grid">
        <div class="footer-brand">
          <RouterLink class="brand footer-logo" to="/">
            <span class="brand-mark">S</span>
            <span class="brand-copy">
              <strong>SICNU <em>LMS</em></strong>
            </span>
          </RouterLink>
          <p>{{ siteConfig.description }}</p>
          <div class="integrity-badge">
            <span>
              <el-icon><Lock /></el-icon>
            </span>
            <strong>ACADEMIC INTEGRITY<br />VERIFIED PLATFORM</strong>
          </div>
        </div>

        <div class="footer-links">
          <h3>教学资源</h3>
          <RouterLink to="/courses">课程中心</RouterLink>
          <RouterLink to="/news">新闻资讯</RouterLink>
          <RouterLink to="/notices">教务公告</RouterLink>
          <RouterLink to="/teachers">名师风采</RouterLink>
        </div>

        <div class="footer-contact">
          <h3>联系我们</h3>
          <span v-if="siteConfig.address">
            <el-icon><Location /></el-icon>
            {{ siteConfig.address }}
          </span>
          <span v-if="siteConfig.servicePhone">
            <el-icon><Phone /></el-icon>
            {{ siteConfig.servicePhone }}
          </span>
          <span v-if="siteConfig.email">
            <el-icon><Message /></el-icon>
            {{ siteConfig.email }}
          </span>
        </div>
      </div>

      <div class="portal-wrap footer-linkbar">
        <div>
          <a v-for="item in friendLinks" :key="item.name" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
        </div>
        <p>{{ siteConfig.copyright }}</p>
      </div>

      <div class="footer-bottom">
        <div class="portal-wrap">
          <span>{{ siteConfig.copyright }}</span>
          <span>{{ siteConfig.icp }}</span>
        </div>
      </div>
    </footer>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Connection, Location, Lock, Message, Phone, Search } from '@element-plus/icons-vue'
import { applyPortalTheme, portalApi } from '@/api/client'

type LinkItem = { name: string; url: string }
type SiteConfig = {
  shortName: string
  platformName: string
  description: string
  address: string
  servicePhone: string
  email: string
  copyright: string
  icp: string
}

const siteConfig = ref<SiteConfig>({
  shortName: '',
  platformName: '',
  description: '',
  address: '',
  servicePhone: '',
  email: '',
  copyright: '',
  icp: ''
})

const externalLinks = ref<LinkItem[]>([])
const friendLinks = ref<LinkItem[]>([])

const toLinks = (items: unknown[]) => {
  if (!items.length) return []
  return items
    .map((item) => {
      const value = item as Record<string, string>
      return {
        name: value.name || value.title || value.label || '',
        url: value.url || value.link || value.path || ''
      }
    })
    .filter((item) => item.name && item.url)
}

const mapSiteConfig = (config: Record<string, unknown>): Partial<SiteConfig> => ({
  shortName: String(config['site.name'] || ''),
  platformName: String(config['site.platformName'] || ''),
  description: String(config['site.description'] || ''),
  address: String(config['site.address'] || ''),
  servicePhone: String(config['site.contactPhone'] || ''),
  email: String(config['site.contactEmail'] || ''),
  copyright: String(config['site.copyright'] || ''),
  icp: String(config['site.icp'] || '')
})

onMounted(async () => {
  const [apiSiteConfig, apiExternalLinks, apiFriendLinks] = await Promise.all([
    portalApi.getSiteConfig().catch((error) => {
      if (import.meta.env.DEV) console.error('[portal site config]', error)
      return {}
    }),
    portalApi.getExternalLinks().catch((error) => {
      if (import.meta.env.DEV) console.error('[portal external links]', error)
      return [] as unknown[]
    }),
    portalApi.getFriendLinks().catch((error) => {
      if (import.meta.env.DEV) console.error('[portal friend links]', error)
      return [] as unknown[]
    })
  ])

  siteConfig.value = { ...siteConfig.value, ...mapSiteConfig(apiSiteConfig) }
  applyPortalTheme(apiSiteConfig)
  externalLinks.value = toLinks(apiExternalLinks)
  friendLinks.value = toLinks(apiFriendLinks)
})
</script>
