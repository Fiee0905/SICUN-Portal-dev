<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">AUTH & USER</span>
        <h1>用户管理</h1>
        <p>维护本地账号、校内用户和校外用户状态，后台接口由管理员权限保护。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">添加成员</el-button>
    </div>

    <el-card class="admin-panel" shadow="never">
      <div class="admin-toolbar">
        <el-input v-model="filters.keyword" placeholder="搜索姓名、账号、邮箱" :prefix-icon="Search" clearable @keyup.enter="loadUsers" @clear="loadUsers" />
        <el-select v-model="filters.status" placeholder="全部状态" clearable @change="loadUsers">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filters.role" placeholder="全部角色" clearable @change="loadUsers">
          <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button @click="loadUsers">查询</el-button>
      </div>

      <el-table v-loading="loading" :data="users" class="admin-table" row-key="id">
        <el-table-column label="成员" min-width="210">
          <template #default="{ row }">
            <div class="admin-title-cell">
              <strong>{{ row.displayName || row.username }}</strong>
              <span>{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="190" />
        <el-table-column prop="mobile" label="手机" width="140" />
        <el-table-column label="类型" width="110">
          <template #default="{ row }">{{ userTypeMeta(row.userType) }}</template>
        </el-table-column>
        <el-table-column label="角色" width="110">
          <template #default="{ row }">
            <el-tag :type="roleMeta(row.role).type">{{ roleMeta(row.role).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="100" />
        <el-table-column prop="organization" label="组织" min-width="160" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'ACTIVE'"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              @change="toggleUserStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="170">
          <template #default="{ row }">{{ formatDate(row.lastLoginAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right" align="right">
          <template #default="{ row }">
            <div class="admin-row-actions">
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" plain @click="disableUser(row)">禁用</el-button>
              <el-button size="small" type="danger" plain @click="removeUser(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑用户' : '创建用户'" width="720px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="admin-form-grid">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" :disabled="Boolean(editingId)" />
          </el-form-item>
          <el-form-item label="姓名" prop="displayName">
            <el-input v-model="form.displayName" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password :placeholder="editingId ? '留空则不修改' : '请输入初始密码'" />
          </el-form-item>
        </div>
        <div class="admin-form-grid">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" />
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="form.mobile" />
          </el-form-item>
          <el-form-item label="组织" prop="organization">
            <el-input v-model="form.organization" />
          </el-form-item>
        </div>
        <div class="admin-form-grid">
          <el-form-item label="用户类型" prop="userType">
            <el-select v-model="form.userType">
              <el-option label="管理员" value="ADMIN" />
              <el-option label="教师" value="TEACHER" />
              <el-option label="学生" value="STUDENT" />
              <el-option label="校外用户" value="GUEST" />
            </el-select>
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role">
              <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="来源" prop="source">
            <el-select v-model="form.source">
              <el-option label="本地" value="LOCAL" />
              <el-option label="统一认证" value="CAS" />
              <el-option label="同步导入" value="SYNC" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio-button v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { cmsApi, type AdminUser } from '@/api/client'

const statusOptions = [
  { label: '正常', value: 'ACTIVE', type: 'success' },
  { label: '待审核', value: 'PENDING_REVIEW', type: 'warning' },
  { label: '已驳回', value: 'REJECTED', type: 'danger' },
  { label: '禁用', value: 'DISABLED', type: 'info' }
] as const

const roleOptions = [
  { label: '管理员', value: 'admin', type: 'danger' },
  { label: '校内用户', value: 'internal', type: 'primary' },
  { label: '校外用户', value: 'external', type: 'success' }
] as const

const emptyForm = (): AdminUser => ({
  username: '',
  displayName: '',
  email: '',
  mobile: '',
  userType: 'GUEST',
  role: 'external',
  source: 'LOCAL',
  status: 'ACTIVE',
  organization: '',
  password: ''
})

const users = ref<AdminUser[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<AdminUser>(emptyForm())
const filters = reactive({ keyword: '', status: '', role: '' })

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  displayName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: editingId.value ? [] : [{ required: true, message: '请输入初始密码', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入有效邮箱', trigger: 'blur' }],
  mobile: [{ pattern: /^$|^1[3-9]\d{9}$/, message: '请输入有效手机号', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}))

const roleMeta = (role = 'external') => roleOptions.find((item) => item.value === role) || roleOptions[2]

const userTypeMeta = (userType = 'GUEST') => {
  const labels: Record<string, string> = {
    ADMIN: '管理员',
    TEACHER: '教师',
    STUDENT: '学生',
    GUEST: '校外'
  }
  return labels[userType] || userType
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

const normalizeUser = (item: AdminUser): AdminUser => ({
  ...emptyForm(),
  ...item,
  username: item.username || '',
  displayName: item.displayName || item.username || '',
  role: item.role || 'external',
  userType: item.userType || 'GUEST',
  source: item.source || 'LOCAL',
  status: item.status || 'ACTIVE',
  password: ''
})

const loadUsers = async () => {
  loading.value = true
  try {
    const result = await cmsApi.getUsers({
      page: 1,
      size: 100,
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      role: filters.role || undefined
    })
    users.value = result.map(normalizeUser)
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('用户列表加载失败')
  } finally {
    loading.value = false
  }
}

const resetForm = (value: AdminUser = emptyForm()) => {
  Object.assign(form, normalizeUser(value))
}

const openCreate = () => {
  editingId.value = null
  resetForm(emptyForm())
  dialogVisible.value = true
}

const openEdit = (row: AdminUser) => {
  editingId.value = row.id || null
  resetForm(row)
  dialogVisible.value = true
}

const payloadFromForm = () => {
  const payload: AdminUser = {
    username: (form.username || '').trim(),
    displayName: (form.displayName || '').trim(),
    email: form.email?.trim(),
    mobile: form.mobile?.trim(),
    userType: form.userType,
    role: form.role,
    source: form.source,
    status: form.status,
    organization: form.organization?.trim()
  }
  if (!editingId.value && form.password?.trim()) {
    payload.password = form.password.trim()
  }
  return payload
}

const saveUser = async () => {
  saving.value = true
  try {
    await formRef.value?.validate()
    const payload = payloadFromForm()
    if (editingId.value) {
      await cmsApi.updateUser(editingId.value, payload)
    } else {
      await cmsApi.createUser(payload)
    }
    ElMessage.success('用户已保存')
    dialogVisible.value = false
    await loadUsers()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('保存失败，请检查登录状态和表单内容')
  } finally {
    saving.value = false
  }
}

const toggleUserStatus = async (row: AdminUser) => {
  if (!row.id) return
  const nextStatus = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  try {
    await cmsApi.updateUser(row.id, { ...row, status: nextStatus })
    ElMessage.success(nextStatus === 'ACTIVE' ? '用户已启用' : '用户已禁用')
    await loadUsers()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('状态更新失败')
  }
}

const disableUser = async (row: AdminUser) => {
  if (!row.id) return
  try {
    await cmsApi.updateUser(row.id, { ...row, status: 'DISABLED' })
    ElMessage.success('用户已禁用')
    await loadUsers()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('禁用失败')
  }
}

const removeUser = async (row: AdminUser) => {
  if (!row.id) return
  await ElMessageBox.confirm(`确定删除用户“${row.displayName || row.username}”吗？`, '删除用户', { type: 'warning' })
  try {
    await cmsApi.deleteUser(row.id)
    ElMessage.success('用户已删除')
    await loadUsers()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    ElMessage.error('删除失败')
  }
}

onMounted(loadUsers)
</script>
