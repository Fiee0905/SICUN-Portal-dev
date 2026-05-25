<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">ANNOUNCEMENT</span>
        <h1>公告管理</h1>
        <p>维护通知公告内容，发布后由门户接口同步展示。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">新建公告</el-button>
    </div>

    <el-card class="admin-panel" shadow="never">
      <div class="admin-toolbar">
        <el-input v-model="filters.keyword" placeholder="搜索标题、作者" :prefix-icon="Search" clearable @keyup.enter="loadNotices" @clear="loadNotices" />
        <el-select v-model="filters.status" placeholder="全部状态" clearable @change="loadNotices">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button @click="loadNotices">查询</el-button>
      </div>

      <el-table v-loading="loading" class="admin-table" :data="notices" row-key="id">
        <el-table-column label="公告标题" min-width="260">
          <template #default="{ row }">
            <div class="admin-title-cell">
              <strong>{{ row.title }}</strong>
              <span>{{ row.summary || '未填写摘要' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="sourceName" label="来源" width="150" />
        <el-table-column label="属性" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.pinned" type="danger" effect="plain">置顶</el-tag>
            <el-tag v-if="row.featured" type="warning" effect="plain">推荐</el-tag>
            <span v-if="!row.pinned && !row.featured" class="admin-muted">普通</span>
          </template>
        </el-table-column>
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
              <el-button v-if="row.status === 'PUBLISHED'" size="small" plain @click="offlineNotice(row)">下线</el-button>
              <el-button v-else size="small" type="success" plain @click="publishNotice(row)">发布</el-button>
              <el-button size="small" type="danger" plain @click="removeNotice(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑公告' : '新建公告'" width="760px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="2" maxlength="240" show-word-limit />
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
        <el-button type="primary" :loading="saving" @click="saveNotice">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { cmsApi, type AdminArticle } from '@/api/client'

const NOTICE_CATEGORY_CODE = 'notice'

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
  author: '',
  sourceName: '',
  status: 'DRAFT',
  pinned: false,
  featured: false,
  allowComment: false,
  categoryCode: NOTICE_CATEGORY_CODE
})

const notices = ref<AdminArticle[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<AdminArticle>(emptyForm())
const filters = reactive({ keyword: '', status: '' })

const rules: FormRules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入公告摘要', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告正文', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  sourceName: [{ required: true, message: '请输入来源', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const statusMeta = (status = 'DRAFT') => statusOptions.find((item) => item.value === status) || statusOptions[0]
const formatDate = (value?: string) => value ? value.replace('T', ' ').slice(0, 16) : '-'
const buildSlug = (title: string) => `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || NOTICE_CATEGORY_CODE}-${Date.now()}`

const normalizeNotice = (item: AdminArticle): AdminArticle => ({
  ...item,
  categoryCode: NOTICE_CATEGORY_CODE,
  status: item.status || 'DRAFT',
  pinned: Boolean(item.pinned),
  featured: Boolean(item.featured),
  allowComment: Boolean(item.allowComment)
})

const loadNotices = async () => {
  loading.value = true
  try {
    const result = await cmsApi.getNotices({ page: 1, size: 100, keyword: filters.keyword || undefined, status: filters.status || undefined, categoryCode: NOTICE_CATEGORY_CODE })
    notices.value = result.map(normalizeNotice)
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('公告列表加载失败')
  } finally {
    loading.value = false
  }
}

const resetForm = (value: AdminArticle = emptyForm()) => {
  Object.keys(form).forEach((key) => delete (form as Record<string, unknown>)[key])
  Object.assign(form, emptyForm(), normalizeNotice(value), { slug: value.slug || buildSlug(value.title || NOTICE_CATEGORY_CODE) })
}

const openCreate = () => { editingId.value = null; resetForm(emptyForm()); dialogVisible.value = true }
const openEdit = (row: AdminArticle) => { editingId.value = row.id || null; resetForm(row); dialogVisible.value = true }

const payloadFromForm = (): AdminArticle => ({
  ...form,
  title: form.title.trim(),
  slug: form.slug || buildSlug(form.title),
  summary: form.summary?.trim(),
  content: form.content?.trim(),
  author: form.author?.trim(),
  sourceName: form.sourceName?.trim(),
  categoryCode: NOTICE_CATEGORY_CODE,
  pinned: Boolean(form.pinned),
  featured: Boolean(form.featured),
  allowComment: false
})

const saveNotice = async () => {
  saving.value = true
  try {
    await formRef.value?.validate()
    const payload = payloadFromForm()
    if (editingId.value) await cmsApi.updateArticle(editingId.value, payload)
    else await cmsApi.createArticle(payload)
    ElMessage.success('公告已保存')
    dialogVisible.value = false
    await loadNotices()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const publishNotice = async (row: AdminArticle) => {
  if (!row.id) return
  try {
    if (row.status === 'PENDING_REVIEW') await cmsApi.approveArticle(row.id)
    else if (!['APPROVED', 'OFFLINE'].includes(row.status || '')) await cmsApi.updateArticle(row.id, { ...row, status: 'APPROVED', categoryCode: NOTICE_CATEGORY_CODE })
    await cmsApi.publishArticle(row.id)
    ElMessage.success('公告已发布')
    await loadNotices()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('发布失败')
  }
}

const offlineNotice = async (row: AdminArticle) => {
  if (!row.id) return
  try {
    await cmsApi.offlineArticle(row.id)
    ElMessage.success('公告已下线')
    await loadNotices()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('下线失败')
  }
}

const removeNotice = async (row: AdminArticle) => {
  if (!row.id) return
  await ElMessageBox.confirm(`确定删除“${row.title}”？`, '删除公告', { type: 'warning' })
  try {
    await cmsApi.deleteArticle(row.id)
    ElMessage.success('公告已删除')
    await loadNotices()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('删除失败')
  }
}

onMounted(loadNotices)
</script>