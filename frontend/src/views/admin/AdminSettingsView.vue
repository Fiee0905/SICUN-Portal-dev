<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">SITE CONFIG</span>
        <h1>绔欑偣閰嶇疆</h1>
      </div>
      <el-button type="primary" :loading="saving" @click="saveSettings">淇濆瓨璁剧疆</el-button>
    </div>

    <div class="admin-config-grid">
      <el-card class="admin-panel" shadow="never">
        <template #header>鍩虹淇℃伅</template>
        <el-form label-position="top">
          <el-form-item label="绔欑偣鍚嶇О"><el-input v-model="adminSettings.siteName" /></el-form-item>
          <el-form-item label="绔欑偣 Logo"><el-input v-model="adminSettings.logo" /></el-form-item>
          <el-form-item label="绔欑偣鎻忚堪"><el-input v-model="adminSettings.description" type="textarea" :rows="3" /></el-form-item>
          <el-form-item label="璁块棶鍩熷悕"><el-input v-model="adminSettings.domain" /></el-form-item>
          <el-form-item label="鐗堟潈淇℃伅"><el-input v-model="adminSettings.copyright" /></el-form-item>
          <el-form-item label="ICP澶囨"><el-input v-model="adminSettings.icp" /></el-form-item>
          <el-form-item label="鑱旂郴鐢佃瘽"><el-input v-model="adminSettings.contactPhone" /></el-form-item>
          <el-form-item label="鑱旂郴閭"><el-input v-model="adminSettings.contactEmail" /></el-form-item>
          <el-form-item label="鑱旂郴鍦板潃"><el-input v-model="adminSettings.address" /></el-form-item>
          <el-form-item label="缁存姢妯″紡"><el-switch v-model="adminSettings.maintenance" /></el-form-item>
        </el-form>
      </el-card>

      <el-card class="admin-panel" shadow="never">
        <template #header>闂ㄦ埛涓婚</template>
        <el-form label-position="top">
          <el-form-item label="涓昏壊">
            <el-color-picker v-model="adminSettings.primary" />
            <el-input v-model="adminSettings.primary" class="config-color-input" />
          </el-form-item>
          <el-form-item label="深主色">
            <el-color-picker v-model="adminSettings.primaryDark" />
            <el-input v-model="adminSettings.primaryDark" class="config-color-input" />
          </el-form-item>
          <el-form-item label="娣辫壊鑳屾櫙">
            <el-color-picker v-model="adminSettings.dark" />
            <el-input v-model="adminSettings.dark" class="config-color-input" />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="admin-panel" shadow="never">
        <template #header>绯荤粺闆嗘垚</template>
        <div class="admin-setting-row">
          <div>
            <strong>鏍″唴 CAS 鐧诲綍</strong>
            <p>允许通过统一身份认证进入平台。</p>
          </div>
          <el-switch v-model="adminSettings.casEnabled" />
        </div>
        <div class="admin-setting-row">
          <div>
            <strong>璇剧▼骞冲彴鍚屾</strong>
            <p>定时同步课程、教师、选课数据。</p>
          </div>
          <el-switch v-model="adminSettings.syncEnabled" />
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { applyPortalTheme, cmsApi, type PortalSiteConfigEntry } from '@/api/client'

const adminSettings = ref({
  siteName: '',
  domain: '',
  casEnabled: false,
  syncEnabled: false,
  maintenance: false,
  logo: '',
  description: '',
  copyright: '',
  icp: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  primary: '#b91c1c',
  primaryDark: '#991b1b',
  dark: '#111827'
})
const saving = ref(false)

const toConfigEntry = (configKey: string, configValue: string, valueType = 'STRING', description = ''): PortalSiteConfigEntry => ({
  siteCode: 'main',
  configKey,
  configValue,
  valueType,
  description
})

const saveSettings = async () => {
  saving.value = true
  try {
    await Promise.all([
      cmsApi.saveSiteConfig(toConfigEntry('site.name', adminSettings.value.siteName, 'STRING', '站点名称')),
      cmsApi.saveSiteConfig(toConfigEntry('site.logo', adminSettings.value.logo, 'STRING', '站点 Logo')),
      cmsApi.saveSiteConfig(toConfigEntry('site.description', adminSettings.value.description, 'STRING', '站点描述')),
      cmsApi.saveSiteConfig(toConfigEntry('site.domain', adminSettings.value.domain, 'STRING', '访问域名')),
      cmsApi.saveSiteConfig(toConfigEntry('site.copyright', adminSettings.value.copyright, 'STRING', '版权信息')),
      cmsApi.saveSiteConfig(toConfigEntry('site.icp', adminSettings.value.icp, 'STRING', 'ICP备案')),
      cmsApi.saveSiteConfig(toConfigEntry('site.contactPhone', adminSettings.value.contactPhone, 'STRING', '联系电话')),
      cmsApi.saveSiteConfig(toConfigEntry('site.contactEmail', adminSettings.value.contactEmail, 'STRING', '联系邮箱')),
      cmsApi.saveSiteConfig(toConfigEntry('site.address', adminSettings.value.address, 'STRING', '联系地址')),
      cmsApi.saveSiteConfig(toConfigEntry('site.maintenance', String(adminSettings.value.maintenance), 'BOOLEAN', '维护模式')),
      cmsApi.saveSiteConfig(toConfigEntry('auth.cas.enabled', String(adminSettings.value.casEnabled), 'BOOLEAN', 'CAS 登录开关')),
      cmsApi.saveSiteConfig(toConfigEntry('course.sync.enabled', String(adminSettings.value.syncEnabled), 'BOOLEAN', '课程同步开关')),
      cmsApi.saveSiteConfig(toConfigEntry('theme.primary', adminSettings.value.primary, 'STRING', 'Portal primary theme color')),
      cmsApi.saveSiteConfig(toConfigEntry('theme.primaryDark', adminSettings.value.primaryDark, 'STRING', 'Portal primary dark theme color')),
      cmsApi.saveSiteConfig(toConfigEntry('theme.dark', adminSettings.value.dark, 'STRING', 'Portal dark theme color'))
    ])
    applyPortalTheme({
      'theme.primary': adminSettings.value.primary,
      'theme.primaryDark': adminSettings.value.primaryDark,
      'theme.dark': adminSettings.value.dark
    })
    ElMessage.success('站点配置已保存')
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('保存失败，请检查后台接口或登录状态')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const settings = await cmsApi.getSiteConfig().catch((error) => {
    if (import.meta.env.DEV) console.error('[admin settings]', error)
    return {} as Record<string, unknown>
  })
  adminSettings.value = {
    ...adminSettings.value,
    siteName: String(settings.siteName || settings['site.name'] || ''),
    logo: String(settings['site.logo'] || ''),
    description: String(settings['site.description'] || ''),
    domain: String(settings.domain || settings['site.domain'] || ''),
    copyright: String(settings['site.copyright'] || ''),
    icp: String(settings['site.icp'] || ''),
    contactPhone: String(settings['site.contactPhone'] || ''),
    contactEmail: String(settings['site.contactEmail'] || ''),
    address: String(settings['site.address'] || ''),
    maintenance: String(settings['site.maintenance'] || false) === 'true',
    casEnabled: String(settings['auth.cas.enabled'] || false) === 'true',
    syncEnabled: String(settings['course.sync.enabled'] || false) === 'true',
    primary: String(settings['theme.primary'] || adminSettings.value.primary),
    primaryDark: String(settings['theme.primaryDark'] || adminSettings.value.primaryDark),
    dark: String(settings['theme.dark'] || adminSettings.value.dark)
  }
})
</script>

