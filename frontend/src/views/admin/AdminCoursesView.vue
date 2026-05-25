<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">CONTENT CENTER</span>
        <h1>课程管理</h1>
        <p>维护课程目录展示字段，保存后前台课程中心通过 /portal/courses 同步呈现。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">新建课程</el-button>
    </div>

    <el-card class="admin-panel" shadow="never">
      <div class="admin-toolbar">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="搜索课程编号、名称、教师"
          :prefix-icon="Search"
          @keyup.enter="fetchCourses"
          @clear="fetchCourses"
        />
        <div class="admin-toolbar-actions">
          <el-select v-model="query.status" clearable placeholder="全部状态" @change="fetchCourses">
            <el-option label="已上线" value="ACTIVE" />
            <el-option label="已下架" value="OFFLINE" />
            <el-option label="草稿" value="DRAFT" />
          </el-select>
          <el-button :icon="Refresh" @click="fetchCourses">刷新</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="courses" class="admin-table" row-key="id">
        <el-table-column prop="courseCode" label="编号" width="120" />
        <el-table-column prop="courseName" label="课程名称" min-width="190" show-overflow-tooltip />
        <el-table-column prop="teacherName" label="主讲教师" width="120" />
        <el-table-column prop="department" label="院系" min-width="150" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="featured" label="推荐" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.featured" type="warning" effect="plain">推荐</el-tag>
            <span v-else class="admin-muted">普通</span>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限" width="110">
          <template #default="{ row }">
            <el-tag :type="permissionTag(row.permission)">{{ permissionLabel(row.permission) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : row.status === 'OFFLINE' ? 'info' : 'warning'">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" align="right" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 'ACTIVE'" link type="warning" @click="offlineCourse(row)">下架</el-button>
            <el-button link type="danger" @click="deleteCourse(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑课程' : '新建课程'" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="104px">
        <div class="admin-form-grid">
          <el-form-item label="课程编号" prop="courseCode">
            <el-input v-model="form.courseCode" placeholder="CS101" />
          </el-form-item>
          <el-form-item label="课程名称" prop="courseName">
            <el-input v-model="form.courseName" placeholder="请输入课程名称" />
          </el-form-item>
          <el-form-item label="主讲教师" prop="teacherName">
            <el-input v-model="form.teacherName" placeholder="请输入教师姓名" />
          </el-form-item>
          <el-form-item label="开课院系" prop="department">
            <el-select v-model="form.department" filterable placeholder="请选择开课院系">
              <el-option v-for="college in collegeOptions" :key="college" :label="college" :value="college" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-input v-model="form.category" placeholder="精品课程 / 通识课程" />
          </el-form-item>
          <el-form-item label="学分" prop="credit">
            <el-input-number v-model="form.credit" :min="0" :precision="1" :step="0.5" controls-position="right" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status">
              <el-option label="已上线" value="ACTIVE" />
              <el-option label="已下架" value="OFFLINE" />
              <el-option label="草稿" value="DRAFT" />
            </el-select>
          </el-form-item>
          <el-form-item label="权限" prop="permission">
            <el-select v-model="form.permission">
              <el-option label="公开" value="public" />
              <el-option label="校内" value="internal" />
              <el-option label="管理员" value="private" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="推荐课程" prop="featured">
          <el-switch v-model="form.featured" active-text="推荐" inactive-text="普通" />
        </el-form-item>
        <el-form-item label="封面地址" prop="coverUrl">
          <div class="admin-upload-row">
            <el-input v-model="form.coverUrl" placeholder="/banners/portal-home4.jpg or https://..." />
            <el-upload accept="image/*" :show-file-list="false" :http-request="uploadCourseCover" :before-upload="beforeCoverUpload">
              <el-button :icon="Upload" :loading="uploading">上传</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="跳转地址" prop="launchUrl">
          <el-input v-model="form.launchUrl" placeholder="https://lms.example.edu/course/..." />
        </el-form-item>
        <el-form-item label="课程简介" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入课程简介" />
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
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Upload } from '@element-plus/icons-vue'
import { cmsApi, normalizeAdminCourse, normalizeCollege, type AdminCoursePayload } from '@/api/client'

const emptyForm = (): AdminCoursePayload => ({
  externalCourseId: '',
  courseCode: '',
  courseName: '',
  teacherName: '',
  department: '',
  category: '',
  credit: 0,
  coverUrl: '',
  launchUrl: '',
  status: 'ACTIVE',
  permission: 'public',
  featured: false,
  description: ''
})

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const courses = ref<AdminCoursePayload[]>([])
const query = reactive({ keyword: '', status: '' })
const form = reactive<AdminCoursePayload>(emptyForm())
const collegeOptions = ref<string[]>([])

const rules: FormRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseCode: [{ required: true, message: '请输入课程编号', trigger: 'blur' }],
  department: [{ required: true, message: '请选择开课院系', trigger: 'change' }],
  permission: [{ required: true, message: '请选择课程权限', trigger: 'change' }],
  status: [{ required: true, message: '请选择课程状态', trigger: 'change' }]
}

const resetForm = (value: AdminCoursePayload = emptyForm()) => {
  Object.keys(form).forEach((key) => delete (form as Record<string, unknown>)[key])
  Object.assign(form, emptyForm(), value)
  form.externalCourseId = form.externalCourseId || form.courseCode || ''
  form.featured = Boolean(form.featured)
}

const normalizePublicAssetUrl = (value?: string) => {
  const raw = String(value || '').trim().replace(/^['"]|['"]$/g, '')
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw

  const normalized = raw.replace(/\\/g, '/')
  const publicIndex = normalized.toLowerCase().lastIndexOf('/frontend/public/')
  if (publicIndex >= 0) return normalized.slice(publicIndex + '/frontend/public'.length)
  if (normalized.toLowerCase().startsWith('public/')) return `/${normalized.slice('public/'.length)}`
  return `/${normalized.replace(/^\/+/, '')}`
}

const buildPayload = (): AdminCoursePayload => ({
  externalCourseId: form.externalCourseId || form.courseCode || form.courseName,
  courseCode: form.courseCode,
  courseName: form.courseName,
  teacherName: form.teacherName,
  department: form.department,
  category: form.category,
  credit: Number(form.credit || 0),
  coverUrl: normalizePublicAssetUrl(form.coverUrl),
  launchUrl: String(form.launchUrl || '').trim(),
  status: form.status,
  permission: form.permission,
  featured: Boolean(form.featured),
  description: form.description
})

const fetchCourses = async () => {
  loading.value = true
  try {
    const records = await cmsApi.getCourses({
      page: 1,
      size: 100,
      keyword: query.keyword || undefined,
      status: query.status || undefined
    })
    courses.value = records.map((item) => normalizeAdminCourse(item as Record<string, unknown>))
  } finally {
    loading.value = false
  }
}

const loadCollegeOptions = async () => {
  try {
    collegeOptions.value = (await cmsApi.getColleges())
      .map((item) => normalizeCollege(item))
      .filter((item) => item.enabled !== false && item.name)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map((item) => item.name)
  } catch (error) {
    if (import.meta.env.DEV) console.error('[admin course colleges]', error)
    collegeOptions.value = []
  }
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: AdminCoursePayload) => {
  editingId.value = row.id || null
  resetForm({ ...row })
  dialogVisible.value = true
}

const submitForm = async () => {
  await formRef.value?.validate()
  saving.value = true
  try {
    const payload = buildPayload()
    if (editingId.value) await cmsApi.updateCourse(editingId.value, payload)
    else await cmsApi.createCourse(payload)
    ElMessage.success('课程已保存')
    dialogVisible.value = false
    await fetchCourses()
  } finally {
    saving.value = false
  }
}

const beforeCoverUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('图片不能超过 5MB')
    return false
  }
  return true
}

const uploadCourseCover = async (options: { file: File; onSuccess?: (response: unknown) => void; onError?: (error: Error) => void }) => {
  uploading.value = true
  try {
    const result = await cmsApi.uploadCourseCover(options.file)
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

const offlineCourse = async (row: AdminCoursePayload) => {
  if (!row.id) return
  await cmsApi.updateCourse(row.id, { ...row, status: 'OFFLINE' })
  ElMessage.success('课程已下架')
  await fetchCourses()
}

const deleteCourse = async (row: AdminCoursePayload) => {
  if (!row.id) return
  await ElMessageBox.confirm(`确认删除课程“${row.courseName}”？`, '删除课程', { type: 'warning' })
  await cmsApi.deleteCourse(row.id)
  ElMessage.success('课程已删除')
  await fetchCourses()
}

const statusLabel = (status = '') => ({ ACTIVE: '已上线', OFFLINE: '已下架', DRAFT: '草稿' })[status] || status || '-'
const permissionLabel = (permission = '') => ({ public: '公开', internal: '校内', private: '管理员' })[permission] || permission || '-'
const permissionTag = (permission = '') => (permission === 'private' ? 'danger' : permission === 'internal' ? 'warning' : 'success')

onMounted(() => {
  fetchCourses()
  loadCollegeOptions()
})
</script>
