<template>
  <main class="auth-page">
    <section class="auth-panel">
      <RouterLink class="brand auth-brand" to="/">
        <span class="brand-mark">S</span>
        <span>CourseHub</span>
      </RouterLink>
      <div class="auth-copy">
        <p>Welcome back</p>
        <h1>登录学习门户</h1>
      </div>
      <el-form :model="form" label-position="top" size="large" @submit.prevent="handleLogin">
        <el-form-item label="账号">
          <el-input v-model="form.account" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" :prefix-icon="Lock" />
        </el-form-item>
        <el-button type="primary" size="large" class="auth-submit" :loading="loading" native-type="submit">
          登录
        </el-button>
      </el-form>
      <p class="auth-link">还没有账号？<RouterLink to="/register">立即注册</RouterLink></p>
      <p class="auth-hint">管理员登录后进入后台；校外用户登录后进入个人中心。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { authApi } from '@/api/client'
import { authState } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const form = reactive({
  account: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.account.trim() || !form.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  loading.value = true
  try {
    const data = await authApi.login({ username: form.account.trim(), password: form.password })
    authState.saveSession(data)
    ElMessage.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const target = redirect || (authState.isAdmin() ? '/admin/dashboard' : '/profile')
    router.push(target)
  } catch {
    authState.clearSession()
    ElMessage.error('账号或密码错误')
  } finally {
    loading.value = false
  }
}
</script>
