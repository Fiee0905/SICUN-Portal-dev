<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">NEWS</span>
        <h1>新闻资讯</h1>
        <p>维护门户新闻资讯内容，发布后由门户接口同步展示。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增新闻</el-button>
    </div>

    <el-card class="admin-panel" shadow="never">
      <div class="admin-toolbar">
        <el-input v-model="filters.keyword" clearable placeholder="搜索标题、摘要、作者" :prefix-icon="Search" @keyup.enter="loadNews" @clear="loadNews" />
        <el-select v-model="filters.status" clearable placeholder="全部状态" @change="loadNews">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button @click="loadNews">查询</el-button>
      </div>

      <el-table v-loading="loading" class="admin-table" :data="news" row-key="id">
        <el-table-column label="新闻标题" min-width="260">
          <template #default="{ row }">
            <div class="admin-title-cell">
              <strong>{{ row.title }}</strong>
              <span>{{ row.summary || '未填写摘要' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="sourceName" label="来源" width="150" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMeta(row.status).type">{{ statusMeta(row.status).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">{{ formatDate(row.publishedAt || row.updatedAt || row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right" align="right">
          <template #default="{ row }">
            <div class="admin-row-actions">
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
              <el-button v-if="row.status === 'PUBLISHED'" size="small" plain @click="offlineNews(row)">下线</el-button>
              <el-button v-else size="small" type="success" plain @click="publishNews(row)">发布</el-button>
              <el-button size="small" type="danger" plain @click="removeNews(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑新闻' : '新增新闻'" width="760px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="2" maxlength="240" show-word-limit />
        </el-form-item>
        <el-form-item label="封面地址" prop="coverUrl">
          <div class="admin-upload-row">
            <el-input v-model="form.coverUrl" placeholder="/api/uploads/news/... or https://..." />
            <el-upload accept="image/*" :show-file-list="false" :http-request="uploadCover" :before-upload="beforeCoverUpload">
              <el-button :icon="Upload" :loading="uploading">上传</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="8" />
        </el-form-item>
        <div class="admin-form-grid">
          <el-form-item label="作者" prop="author">
            <el-input v-model="form.author" />
          </el-form-item>
          <el-form-item label="来源" prop="sourceName">
            <el-input v-model="form.sourceName" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status">
              <el-option v-for="item in editableStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="admin-form-switches">
          <el-checkbox v-model="form.pinned">置顶</el-checkbox>
          <el-checkbox v-model="form.featured">推荐</el-checkbox>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveNews">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Upload } from '@element-plus/icons-vue'
import { cmsApi, type AdminArticle } from '@/api/client'

const NEWS_CATEGORY_CODE = 'news'

const statusOptions = [
  { label: '草稿', value: 'DRAFT', type: 'info' },
  { label: '待审核', value: 'PENDING_REVIEW', type: 'warning' },
  { label: '已通过', value: 'APPROVED', type: 'primary' },
  { label: '已发布', value: 'PUBLISHED', type: 'success' },
  { label: '已下线', value: 'OFFLINE', type: 'info' },
  { label: '已驳回', value: 'REJECTED', type: 'danger' }
] as const

const editableStatusOptions = statusOptions.filter((item) => ['DRAFT', 'APPROVED', 'PUBLISHED', 'OFFLINE'].includes(item.value))

const emptyForm = (): AdminArticle => ({
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverUrl: '',
  author: '',
  sourceName: '',
  status: 'DRAFT',
  pinned: false,
  featured: false,
  allowComment: false,
  categoryCode: NEWS_CATEGORY_CODE
})

const news = ref<AdminArticle[]>([])
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<AdminArticle>(emptyForm())
const filters = reactive({ keyword: '', status: '' })

const rules: FormRules = {
  title: [{ required: true, message: '请输入新闻标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入新闻摘要', trigger: 'blur' }],
  content: [{ required: true, message: '请输入新闻正文', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  sourceName: [{ required: true, message: '请输入来源', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const statusMeta = (status = 'DRAFT') => statusOptions.find((item) => item.value === status) || statusOptions[0]
const formatDate = (value?: string) => value ? value.replace('T', ' ').slice(0, 16) : '-'
const buildSlug = (title: string) => `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || NEWS_CATEGORY_CODE}-${Date.now()}`

const normalizeNews = (item: AdminArticle): AdminArticle => ({
  ...item,
  categoryCode: NEWS_CATEGORY_CODE,
  status: item.status || 'DRAFT',
  pinned: Boolean(item.pinned),
  featured: Boolean(item.featured),
  allowComment: Boolean(item.allowComment)
})

const loadNews = async () => {
  loading.value = true
  try {
    const result = await cmsApi.getArticles({ page: 1, size: 100, keyword: filters.keyword || undefined, status: filters.status || undefined, categoryCode: NEWS_CATEGORY_CODE })
    news.value = result.map(normalizeNews)
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('新闻列表加载失败')
  } finally {
    loading.value = false
  }
}

const resetForm = (value: AdminArticle = emptyForm()) => {
  Object.keys(form).forEach((key) => delete (form as Record<string, unknown>)[key])
  Object.assign(form, emptyForm(), normalizeNews(value), { slug: value.slug || buildSlug(value.title || NEWS_CATEGORY_CODE) })
}

const openCreate = () => { editingId.value = null; resetForm(emptyForm()); dialogVisible.value = true }
const openEdit = (row: AdminArticle) => { editingId.value = row.id || null; resetForm(row); dialogVisible.value = true }

const payloadFromForm = (): AdminArticle => ({
  ...form,
  title: form.title.trim(),
  slug: form.slug || buildSlug(form.title),
  summary: form.summary?.trim(),
  content: form.content?.trim(),
  coverUrl: form.coverUrl?.trim(),
  author: form.author?.trim(),
  sourceName: form.sourceName?.trim(),
  categoryCode: NEWS_CATEGORY_CODE,
  pinned: Boolean(form.pinned),
  featured: Boolean(form.featured),
  allowComment: false
})

const saveNews = async () => {
  saving.value = true
  try {
    await formRef.value?.validate()
    const payload = payloadFromForm()
    if (editingId.value) await cmsApi.updateArticle(editingId.value, payload)
    else await cmsApi.createArticle(payload)
    ElMessage.success('新闻已保存')
    dialogVisible.value = false
    await loadNews()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const publishNews = async (row: AdminArticle) => {
  if (!row.id) return
  if (!['APPROVED', 'OFFLINE'].includes(row.status || '')) await cmsApi.updateArticle(row.id, { ...row, status: 'APPROVED', categoryCode: NEWS_CATEGORY_CODE })
  await cmsApi.publishArticle(row.id)
  ElMessage.success('新闻已发布')
  await loadNews()
}

const offlineNews = async (row: AdminArticle) => { if (row.id) { await cmsApi.offlineArticle(row.id); ElMessage.success('新闻已下线'); await loadNews() } }
const removeNews = async (row: AdminArticle) => { if (row.id) { await ElMessageBox.confirm(`确定删除“${row.title}”？`, '删除新闻', { type: 'warning' }); await cmsApi.deleteArticle(row.id); ElMessage.success('新闻已删除'); await loadNews() } }

const beforeCoverUpload = (file: File) => {
  if (!file.type.startsWith('image/')) { ElMessage.error('只能上传图片文件'); return false }
  if (file.size / 1024 / 1024 > 5) { ElMessage.error('图片不能超过 5MB'); return false }
  return true
}

const uploadCover = async (options: { file: File; onSuccess?: (response: unknown) => void; onError?: (error: Error) => void }) => {
  uploading.value = true
  try {
    const result = await cmsApi.uploadImage(options.file, 'news')
    form.coverUrl = result.url
    ElMessage.success('封面已上传')
    options.onSuccess?.(result)
  } catch (error) {
    options.onError?.(error as Error)
    ElMessage.error('封面上传失败')
  } finally {
    uploading.value = false
  }
}

onMounted(loadNews)
</script>