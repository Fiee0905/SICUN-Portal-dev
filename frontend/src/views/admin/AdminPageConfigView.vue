<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">PAGE CONFIG</span>
        <h1>页面配置</h1>
        <p>编辑门户首页模块显示、隐藏和主题色，保存后由前台首页聚合接口生效。</p>
      </div>
      <el-button type="primary" :loading="saving" @click="saveHomeConfig">保存首页配置</el-button>
    </div>

    <div class="admin-config-grid">
      <el-card class="admin-panel" shadow="never">
        <template #header>主题色</template>
        <el-form label-position="top">
          <el-form-item label="主色">
            <el-color-picker v-model="themeForm.primary" />
            <el-input v-model="themeForm.primary" class="config-color-input" />
          </el-form-item>
          <el-form-item label="深主色">
            <el-color-picker v-model="themeForm.primaryDark" />
            <el-input v-model="themeForm.primaryDark" class="config-color-input" />
          </el-form-item>
          <el-form-item label="深色背景">
            <el-color-picker v-model="themeForm.dark" />
            <el-input v-model="themeForm.dark" class="config-color-input" />
          </el-form-item>
          <div class="admin-theme-preview" :style="themePreviewStyle">
            <strong>门户主题预览</strong>
            <span>按钮、导航高亮和首页重点模块将使用当前色值。</span>
          </div>
        </el-form>
      </el-card>

      <el-card class="admin-panel" shadow="never">
        <template #header>首页模块开关</template>
        <div class="module-switch-list">
          <div v-for="section in sections" :key="section.code" class="module-switch-row">
            <div>
              <strong>{{ section.label }}</strong>
              <span>{{ section.code }}</span>
            </div>
            <el-switch v-model="section.enabled" active-text="显示" inactive-text="隐藏" />
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="admin-panel admin-page-table" shadow="never">
      <template #header>
        <div class="admin-card-title">页面列表</div>
      </template>
      <el-table :data="pageConfigs" class="admin-table">
        <el-table-column prop="name" label="页面名称" min-width="140" />
        <el-table-column prop="path" label="路径" width="120" />
        <el-table-column prop="layout" label="布局" width="120" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === '已发布' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="130" />
      </el-table>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { applyPortalTheme, cmsApi, type PortalPageConfig, type PortalSiteConfigEntry } from '@/api/client'

type SectionConfig = {
  code: string
  label: string
  enabled: boolean
}

const defaultSections: SectionConfig[] = [
  { code: 'banner', label: '首页轮播', enabled: true },
  { code: 'quickLinks', label: '快捷入口', enabled: true },
  { code: 'colleges', label: '开课单位', enabled: true },
  { code: 'courses', label: '推荐课程', enabled: true },
  { code: 'newCourses', label: '新课速递', enabled: true },
  { code: 'teachers', label: '名师风采', enabled: true },
  { code: 'notices', label: '通知公告', enabled: true },
  { code: 'news', label: '新闻资讯', enabled: true },
  { code: 'friendLinks', label: '友情链接', enabled: true }
]

const pageConfigs = ref<unknown[]>([])
const sections = ref<SectionConfig[]>(defaultSections.map((section) => ({ ...section })))
const saving = ref(false)
const pageConfig = ref<PortalPageConfig>({
  siteCode: 'main',
  pageCode: 'home',
  pageTitle: '门户首页',
  enabled: true
})
const themeForm = ref({
  primary: '#b91c1c',
  primaryDark: '#991b1b',
  dark: '#111827'
})

const themePreviewStyle = computed(() => ({
  '--preview-primary': themeForm.value.primary,
  '--preview-primary-dark': themeForm.value.primaryDark,
  '--preview-dark': themeForm.value.dark
}))

const parseJson = (value: unknown) => {
  if (!value) return {}
  if (typeof value !== 'string') return value as Record<string, unknown>
  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return {}
  }
}

const applySections = (config: PortalPageConfig | null) => {
  const layout = parseJson(config?.layoutJson)
  const rawSections = Array.isArray(layout.sections) ? layout.sections : []
  const statusMap = new Map<string, boolean>()

  rawSections.forEach((item) => {
    if (typeof item === 'string') {
      statusMap.set(item, true)
      return
    }
    const value = item as { code?: string; key?: string; enabled?: boolean; visible?: boolean }
    const code = value.code || value.key
    if (code) statusMap.set(code, value.enabled !== false && value.visible !== false)
  })

  sections.value = defaultSections.map((section) => ({
    ...section,
    enabled: statusMap.has(section.code) ? Boolean(statusMap.get(section.code)) : section.enabled
  }))
}

const toSiteConfigEntry = (configKey: string, configValue: string, description: string): PortalSiteConfigEntry => ({
  siteCode: 'main',
  configKey,
  configValue,
  valueType: 'STRING',
  description
})

const saveHomeConfig = async () => {
  saving.value = true
  try {
    const layoutJson = JSON.stringify({
      sections: sections.value.map(({ code, enabled }) => ({ code, enabled }))
    })
    await cmsApi.savePageConfig('home', {
      ...pageConfig.value,
      siteCode: 'main',
      pageCode: 'home',
      pageTitle: pageConfig.value.pageTitle || '门户首页',
      layoutJson,
      seoJson: pageConfig.value.seoJson || JSON.stringify({ title: 'Education Portal' }),
      enabled: pageConfig.value.enabled ?? true
    })
    await Promise.all([
      cmsApi.saveSiteConfig(toSiteConfigEntry('theme.primary', themeForm.value.primary, 'Portal primary theme color')),
      cmsApi.saveSiteConfig(toSiteConfigEntry('theme.primaryDark', themeForm.value.primaryDark, 'Portal primary dark theme color')),
      cmsApi.saveSiteConfig(toSiteConfigEntry('theme.dark', themeForm.value.dark, 'Portal dark theme color'))
    ])
    applyPortalTheme({
      'theme.primary': themeForm.value.primary,
      'theme.primaryDark': themeForm.value.primaryDark,
      'theme.dark': themeForm.value.dark
    })
    ElMessage.success('首页配置已保存')
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('保存失败，请检查后台接口或登录状态')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [pages, homeConfig, siteConfig] = await Promise.all([
    cmsApi.getPages().catch((error) => {
      if (import.meta.env.DEV) console.error('[admin pages]', error)
      return [] as unknown[]
    }),
    cmsApi.getPageConfig('home').catch((error) => {
      if (import.meta.env.DEV) console.error('[admin home config]', error)
      return null as PortalPageConfig | null
    }),
    cmsApi.getSiteConfig().catch((error) => {
      if (import.meta.env.DEV) console.error('[admin site config]', error)
      return {} as Record<string, unknown>
    })
  ])

  pageConfigs.value = Array.isArray(pages) ? pages : []
  if (homeConfig) pageConfig.value = { ...pageConfig.value, ...homeConfig }
  applySections(homeConfig)
  themeForm.value = {
    primary: String(siteConfig['theme.primary'] || themeForm.value.primary),
    primaryDark: String(siteConfig['theme.primaryDark'] || themeForm.value.primaryDark),
    dark: String(siteConfig['theme.dark'] || themeForm.value.dark)
  }
})
</script>
