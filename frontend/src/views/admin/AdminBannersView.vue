<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">CAROUSEL</span>
        <h1>轮播管理</h1>
        <p>维护首页轮播位，启用后前台首页通过 /portal/home 自动读取。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增轮播</el-button>
    </div>

    <el-card class="admin-panel" shadow="never">
      <div class="admin-toolbar">
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索标题、位置或链接"
          :prefix-icon="Search"
        />
        <el-button :icon="Refresh" @click="fetchBanners">刷新</el-button>
      </div>

      <div v-loading="loading" class="admin-banner-grid">
        <el-card v-for="banner in filteredBanners" :key="banner.id || banner.title" class="admin-banner-card" shadow="never">
          <img :src="banner.imageUrl || fallbackImage" :alt="banner.title" />
          <div>
            <div class="admin-card-meta">
              <el-tag :type="banner.enabled ? 'success' : 'info'" effect="dark">{{ banner.enabled ? '展示中' : '已停用' }}</el-tag>
              <span>{{ banner.position || 'HOME_TOP' }} / {{ banner.sortOrder || 0 }}</span>
            </div>
            <h3>{{ banner.title }}</h3>
            <p>{{ banner.linkUrl || '未配置跳转链接' }}</p>
            <div class="admin-card-actions">
              <el-button :icon="EditPen" @click="openEdit(banner)">编辑</el-button>
              <el-button :type="banner.enabled ? 'warning' : 'success'" plain @click="toggleBanner(banner)">
                {{ banner.enabled ? '停用' : '启用' }}
              </el-button>
              <el-button :icon="Delete" type="danger" plain @click="deleteBanner(banner)">删除</el-button>
            </div>
          </div>
        </el-card>

        <button class="admin-add-card" type="button" @click="openCreate">
          <el-icon><Plus /></el-icon>
          <span>添加新轮播图</span>
        </button>
      </div>

      <el-empty v-if="!loading && filteredBanners.length === 0" description="暂无匹配轮播" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑轮播' : '新增轮播'" width="680px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入轮播标题" />
        </el-form-item>
        <el-form-item label="图片地址" prop="imageUrl">
          <div class="admin-upload-row">
            <el-input v-model="form.imageUrl" placeholder="/banners/portal-home1.jpg or https://..." />
            <el-upload
              accept="image/*"
              :show-file-list="false"
              :http-request="uploadBannerImage"
              :before-upload="beforeBannerUpload"
            >
              <el-button :icon="Upload" :loading="uploading">上传</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="跳转地址" prop="linkUrl">
          <el-input v-model="form.linkUrl" placeholder="/courses 或 https://..." />
        </el-form-item>
        <div class="admin-form-grid">
          <el-form-item label="位置" prop="position">
            <el-select v-model="form.position">
              <el-option label="首页顶部" value="HOME_TOP" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" :step="1" controls-position="right" />
          </el-form-item>
        </div>
        <el-form-item label="启用" prop="enabled">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, EditPen, Plus, Refresh, Search, Upload } from '@element-plus/icons-vue'
import { cmsApi, normalizeBanner, type PortalBanner } from '@/api/client'

const fallbackImage = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200'

const emptyForm = (): PortalBanner => ({
  title: '',
  imageUrl: '',
  linkUrl: '/courses',
  position: 'HOME_TOP',
  sortOrder: 0,
  enabled: true
})

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const keyword = ref('')
const formRef = ref<FormInstance>()
const banners = ref<PortalBanner[]>([])
const form = reactive<PortalBanner>(emptyForm())

const rules: FormRules = {
  title: [{ required: true, message: '请输入轮播标题', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请输入图片地址', trigger: 'blur' }],
  position: [{ required: true, message: '请输入展示位置', trigger: 'blur' }]
}

const filteredBanners = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  if (!term) return banners.value
  return banners.value.filter((banner) =>
    [banner.title, banner.position || '', banner.linkUrl || ''].some((value) => value.toLowerCase().includes(term))
  )
})

const resetForm = (value: PortalBanner = emptyForm()) => {
  Object.keys(form).forEach((key) => {
    delete (form as Record<string, unknown>)[key]
  })
  Object.assign(form, value)
}

const normalizeImageUrlForSave = (value?: string) => {
  const raw = String(value || '').trim().replace(/^['"]|['"]$/g, '')
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw

  const normalized = raw.replace(/\\/g, '/')
  const publicIndex = normalized.toLowerCase().lastIndexOf('/frontend/public/')
  if (publicIndex >= 0) {
    return normalized.slice(publicIndex + '/frontend/public'.length)
  }
  if (normalized.toLowerCase().startsWith('public/')) {
    return `/${normalized.slice('public/'.length)}`
  }
  return `/${normalized.replace(/^\/+/, '')}`
}

const fetchBanners = async () => {
  loading.value = true
  try {
    const records = await cmsApi.getBanners()
    banners.value = records.map((item) => normalizeBanner(item))
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: PortalBanner) => {
  editingId.value = row.id || null
  resetForm({ ...row })
  dialogVisible.value = true
}

const submitForm = async () => {
  await formRef.value?.validate()
  saving.value = true
  try {
    const payload = {
      ...form,
      imageUrl: normalizeImageUrlForSave(form.imageUrl),
      position: 'HOME_TOP',
      sortOrder: Number(form.sortOrder || 0),
      enabled: Boolean(form.enabled)
    }
    if (editingId.value) {
      await cmsApi.updateBanner(editingId.value, payload)
    } else {
      await cmsApi.createBanner(payload)
    }
    ElMessage.success('轮播已保存')
    dialogVisible.value = false
    await fetchBanners()
  } finally {
    saving.value = false
  }
}

const beforeBannerUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 <= 5
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片不能超过 5MB')
    return false
  }
  return true
}

const uploadBannerImage = async (options: { file: File; onSuccess?: (response: unknown) => void; onError?: (error: Error) => void }) => {
  uploading.value = true
  try {
    const result = await cmsApi.uploadBannerImage(options.file)
    form.imageUrl = result.url
    ElMessage.success('图片已上传')
    options.onSuccess?.(result)
  } catch (error) {
    options.onError?.(error as Error)
    ElMessage.error('图片上传失败')
  } finally {
    uploading.value = false
  }
}

const toggleBanner = async (row: PortalBanner) => {
  if (!row.id) return
  await cmsApi.updateBanner(row.id, { ...row, position: 'HOME_TOP', enabled: !row.enabled })
  ElMessage.success(row.enabled ? '轮播已停用' : '轮播已启用')
  await fetchBanners()
}

const deleteBanner = async (row: PortalBanner) => {
  if (!row.id) return
  await ElMessageBox.confirm(`确认删除轮播“${row.title}”？`, '删除轮播', { type: 'warning' })
  await cmsApi.deleteBanner(row.id)
  ElMessage.success('轮播已删除')
  await fetchBanners()
}

onMounted(fetchBanners)
</script>
