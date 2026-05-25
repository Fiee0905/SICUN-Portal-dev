<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">COLLEGES</span>
        <h1>开课单位</h1>
        <p>维护门户学院筛选和后台课程表单使用的开课单位。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增单位</el-button>
    </div>

    <el-card class="admin-panel" shadow="never">
      <el-table v-loading="loading" class="admin-table" :data="colleges" row-key="id">
        <el-table-column prop="name" label="单位名称" min-width="180" />
        <el-table-column prop="code" label="编码" width="140" />
        <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
        <el-table-column prop="courseCount" label="课程数" width="100" />
        <el-table-column prop="sortOrder" label="排序" width="90" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-switch :model-value="row.enabled" @change="toggleCollege(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="right" fixed="right">
          <template #default="{ row }">
            <div class="admin-row-actions">
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="removeCollege(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑开课单位' : '新增开课单位'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="单位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学院或开课单位名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="可选，例如 computer-science" />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
        <div class="admin-form-grid">
          <el-form-item label="课程数" prop="courseCount">
            <el-input-number v-model="form.courseCount" :min="0" :step="1" controls-position="right" />
          </el-form-item>
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
        <el-button type="primary" :loading="saving" @click="saveCollege">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { cmsApi, normalizeCollege, type PortalCollege } from '@/api/client'

const emptyForm = (): PortalCollege => ({
  siteCode: 'main',
  code: '',
  name: '',
  description: '',
  courseCount: 0,
  sortOrder: 10,
  enabled: true
})

const colleges = ref<PortalCollege[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<PortalCollege>(emptyForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'change' }]
}

const resetForm = (value: PortalCollege = emptyForm()) => {
  Object.keys(form).forEach((key) => delete (form as Record<string, unknown>)[key])
  Object.assign(form, emptyForm(), value, {
    siteCode: value.siteCode || 'main',
    courseCount: Number(value.courseCount ?? value.count ?? 0),
    sortOrder: Number(value.sortOrder ?? 0),
    enabled: value.enabled !== false
  })
}

const loadColleges = async () => {
  loading.value = true
  try {
    colleges.value = (await cmsApi.getColleges())
      .map((item) => normalizeCollege(item))
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
  } catch (error) {
    if (import.meta.env.DEV) console.error('[admin colleges]', error)
    colleges.value = []
    ElMessage.error('开课单位加载失败')
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: PortalCollege) => {
  editingId.value = row.id || null
  resetForm(row)
  dialogVisible.value = true
}

const payloadFromForm = (): PortalCollege => ({
  siteCode: form.siteCode || 'main',
  code: form.code?.trim() || undefined,
  name: form.name.trim(),
  description: form.description || '',
  courseCount: Number(form.courseCount || 0),
  sortOrder: Number(form.sortOrder || 0),
  enabled: Boolean(form.enabled)
})

const saveCollege = async () => {
  await formRef.value?.validate()
  saving.value = true
  try {
    const payload = payloadFromForm()
    if (editingId.value) {
      await cmsApi.updateCollege(editingId.value, payload)
    } else {
      await cmsApi.createCollege(payload)
    }
    ElMessage.success('开课单位已保存')
    dialogVisible.value = false
    await loadColleges()
  } finally {
    saving.value = false
  }
}

const toggleCollege = async (row: PortalCollege) => {
  if (!row.id) return
  await cmsApi.updateCollege(row.id, { ...row, enabled: !row.enabled })
  ElMessage.success('状态已更新')
  await loadColleges()
}

const removeCollege = async (row: PortalCollege) => {
  if (!row.id) return
  await ElMessageBox.confirm(`确定删除“${row.name}”？`, '删除开课单位', { type: 'warning' })
  await cmsApi.deleteCollege(row.id)
  ElMessage.success('开课单位已删除')
  await loadColleges()
}

onMounted(loadColleges)
</script>
