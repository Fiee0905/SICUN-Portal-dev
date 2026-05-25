<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">FRIEND LINKS</span>
        <h1>鍙嬫儏閾炬帴</h1>
        <p>维护门户首页和页脚展示的友情链接。</p>
      </div>
      <el-button type="primary" @click="openCreate">鏂板閾炬帴</el-button>
    </div>

    <el-card class="admin-panel" shadow="never">
      <el-table v-loading="loading" class="admin-table" :data="links" row-key="id">
        <el-table-column prop="title" label="鍚嶇О" min-width="180" />
        <el-table-column prop="url" label="閾炬帴鍦板潃" min-width="260">
          <template #default="{ row }">
            <a class="admin-link-url" :href="row.url" target="_blank" rel="noopener noreferrer">{{ row.url }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="鎺掑簭" width="90" />
        <el-table-column prop="enabled" label="状态" width="110">
          <template #default="{ row }">
            <el-switch :model-value="row.enabled" @change="toggleLink(row)" />
          </template>
        </el-table-column>
        <el-table-column label="鎿嶄綔" width="170" fixed="right">
          <template #default="{ row }">
            <div class="admin-row-actions">
              <el-button size="small" @click="openEdit(row)">缂栬緫</el-button>
              <el-button size="small" type="danger" plain @click="removeLink(row)">鍒犻櫎</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '缂栬緫鍙嬫儏閾炬帴' : '鏂板鍙嬫儏閾炬帴'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="鍚嶇О" prop="title">
          <el-input v-model="form.title" placeholder="请输入链接名称" />
        </el-form-item>
        <el-form-item label="閾炬帴鍦板潃" prop="url">
          <el-input v-model="form.url" placeholder="https://example.edu" />
        </el-form-item>
        <el-form-item label="鎺掑簭" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="鎻忚堪">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="閫夊～" />
        </el-form-item>
        <el-form-item label="鍚敤">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">鍙栨秷</el-button>
        <el-button type="primary" :loading="saving" @click="saveLink">淇濆瓨</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { cmsApi, type FriendLink } from '@/api/client'

const emptyForm = (): FriendLink => ({
  siteCode: 'main',
  title: '',
  url: '',
  sortOrder: 1,
  enabled: true,
  description: ''
})

const links = ref<FriendLink[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<FriendLink>(emptyForm())

const rules: FormRules = {
  title: [{ required: true, message: '请输入链接名称', trigger: 'blur' }],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效 URL', trigger: 'blur' }
  ],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'change' }]
}

const resetForm = (value: FriendLink = emptyForm()) => {
  Object.keys(form).forEach((key) => {
    delete (form as Record<string, unknown>)[key]
  })
  Object.assign(form, value, {
    siteCode: value.siteCode || 'main',
    title: value.title || value.name || '',
    sortOrder: Number(value.sortOrder ?? 1),
    enabled: value.enabled !== false
  })
}

const loadLinks = async () => {
  loading.value = true
  try {
    const result = await cmsApi.getFriendLinks()
    links.value = result
      .map((item) => ({ ...item, title: item.title || item.name || '', sortOrder: Number(item.sortOrder ?? 0) }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    links.value = []
    ElMessage.error('友情链接加载失败')
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: FriendLink) => {
  editingId.value = row.id || null
  resetForm(row)
  dialogVisible.value = true
}

const saveLink = async () => {
  saving.value = true
  try {
    await formRef.value?.validate()
    const payload: FriendLink = {
      siteCode: form.siteCode || 'main',
      title: form.title.trim(),
      url: form.url.trim(),
      description: form.description || '',
      sortOrder: Number(form.sortOrder),
      enabled: Boolean(form.enabled)
    }
    if (editingId.value) {
      await cmsApi.updateFriendLink(editingId.value, payload)
    } else {
      await cmsApi.createFriendLink(payload)
    }
    ElMessage.success('友情链接已保存')
    dialogVisible.value = false
    await loadLinks()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('保存失败，请检查登录状态和表单内容')
  } finally {
    saving.value = false
  }
}

const toggleLink = async (row: FriendLink) => {
  if (!row.id) return
  try {
    await cmsApi.updateFriendLink(row.id, { ...row, enabled: !row.enabled })
    ElMessage.success('状态已更新')
    await loadLinks()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('状态更新失败')
  }
}

const removeLink = async (row: FriendLink) => {
  if (!row.id) return
  await ElMessageBox.confirm(`确定删除“${row.title || row.name}”？`, '删除友情链接', { type: 'warning' })
  try {
    await cmsApi.deleteFriendLink(row.id)
    ElMessage.success('友情链接已删除')
    await loadLinks()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('删除失败')
  }
}

onMounted(loadLinks)
</script>


