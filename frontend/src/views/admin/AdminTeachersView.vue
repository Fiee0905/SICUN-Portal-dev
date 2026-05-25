<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">FACULTY</span>
        <h1>名师风采</h1>
        <p>维护首页名师风采内容，启用后由 /portal/home 自动展示。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增教师</el-button>
    </div>

    <el-card class="admin-panel" shadow="never">
      <el-table v-loading="loading" class="admin-table" :data="teachers" row-key="id">
        <el-table-column label="教师" min-width="220">
          <template #default="{ row }">
            <div class="admin-title-cell">
              <strong>{{ row.name }}</strong>
              <span>{{ row.title || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="college" label="学院" min-width="150" />
        <el-table-column prop="research" label="研究方向" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="90" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-switch :model-value="row.enabled" @change="toggleTeacher(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right" align="right">
          <template #default="{ row }">
            <div class="admin-row-actions">
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="removeTeacher(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑教师' : '新增教师'" width="720px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <div class="admin-form-grid">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="职称" prop="title">
            <el-input v-model="form.title" placeholder="教授 / 教学名师" />
          </el-form-item>
          <el-form-item label="学院" prop="college">
            <el-select v-model="form.college" filterable placeholder="请选择学院">
              <el-option
                v-for="college in collegeOptions"
                :key="college"
                :label="college"
                :value="college"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="课程数" prop="courseCount">
            <el-input-number v-model="form.courseCount" :min="0" :step="1" controls-position="right" />
          </el-form-item>
        </div>
        <el-form-item label="头像地址" prop="avatarUrl">
          <div class="admin-upload-row">
            <el-input v-model="form.avatarUrl" placeholder="/api/uploads/teachers/... or https://..." />
            <el-upload accept="image/*" :show-file-list="false" :http-request="uploadAvatar" :before-upload="beforeAvatarUpload">
              <el-button :icon="Upload" :loading="uploading">上传</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="成果" prop="achievement">
          <el-input v-model="form.achievement" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="研究方向" prop="research">
          <el-input v-model="form.research" type="textarea" :rows="2" />
        </el-form-item>
        <div class="admin-form-grid">
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="启用" prop="enabled">
            <el-switch v-model="form.enabled" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveTeacher">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import { cmsApi, portalApi, type PortalTeacher } from '@/api/client'

const emptyForm = (): PortalTeacher => ({
  siteCode: 'main',
  name: '',
  title: '',
  college: '',
  achievement: '',
  research: '',
  courseCount: 0,
  avatarUrl: '',
  sortOrder: 10,
  enabled: true
})

const teachers = ref<PortalTeacher[]>([])
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<PortalTeacher>(emptyForm())
const collegeOptions = ref<string[]>([])

const rules: FormRules = {
  name: [{ required: true, message: '请输入教师姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
  college: [{ required: true, message: '请选择学院', trigger: 'change' }]
}

const resetForm = (value: PortalTeacher = emptyForm()) => {
  Object.keys(form).forEach((key) => delete (form as Record<string, unknown>)[key])
  Object.assign(form, emptyForm(), value, {
    siteCode: value.siteCode || 'main',
    courseCount: Number(value.courseCount || 0),
    sortOrder: Number(value.sortOrder || 0),
    enabled: value.enabled !== false
  })
}

const loadTeachers = async () => {
  loading.value = true
  try {
    teachers.value = (await cmsApi.getTeachers()).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
  } finally {
    loading.value = false
  }
}

const loadCollegeOptions = async () => {
  try {
    const home = await portalApi.getHome()
    const items = Array.isArray(home.colleges) ? home.colleges : []
    collegeOptions.value = items
      .map((item) => {
        if (typeof item === 'string') return item
        const value = item as Record<string, unknown>
        return String(value.name || value.title || value.college || value.department || '')
      })
      .filter(Boolean)
  } catch (error) {
    if (import.meta.env.DEV) console.error('[admin teacher colleges]', error)
    collegeOptions.value = []
  }
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: PortalTeacher) => {
  editingId.value = row.id || null
  resetForm(row)
  dialogVisible.value = true
}

const payloadFromForm = (): PortalTeacher => ({
  siteCode: form.siteCode || 'main',
  name: form.name.trim(),
  title: form.title || '',
  college: form.college || '',
  achievement: form.achievement || '',
  research: form.research || '',
  courseCount: Number(form.courseCount || 0),
  avatarUrl: form.avatarUrl || '',
  sortOrder: Number(form.sortOrder || 0),
  enabled: Boolean(form.enabled)
})

const saveTeacher = async () => {
  saving.value = true
  try {
    await formRef.value?.validate()
    const payload = payloadFromForm()
    if (editingId.value) {
      await cmsApi.updateTeacher(editingId.value, payload)
    } else {
      await cmsApi.createTeacher(payload)
    }
    ElMessage.success('教师已保存')
    dialogVisible.value = false
    await loadTeachers()
  } finally {
    saving.value = false
  }
}

const toggleTeacher = async (row: PortalTeacher) => {
  if (!row.id) return
  await cmsApi.updateTeacher(row.id, { ...row, enabled: !row.enabled })
  await loadTeachers()
}

const removeTeacher = async (row: PortalTeacher) => {
  if (!row.id) return
  await ElMessageBox.confirm(`确定删除“${row.name}”？`, '删除教师', { type: 'warning' })
  await cmsApi.deleteTeacher(row.id)
  ElMessage.success('教师已删除')
  await loadTeachers()
}

const beforeAvatarUpload = (file: File) => {
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

const uploadAvatar = async (options: { file: File; onSuccess?: (response: unknown) => void; onError?: (error: Error) => void }) => {
  uploading.value = true
  try {
    const result = await cmsApi.uploadImage(options.file, 'teachers')
    form.avatarUrl = result.url
    ElMessage.success('头像已上传')
    options.onSuccess?.(result)
  } catch (error) {
    options.onError?.(error as Error)
    ElMessage.error('头像上传失败')
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  loadTeachers()
  loadCollegeOptions()
})
</script>
