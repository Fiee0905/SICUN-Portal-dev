<template>
  <main class="auth-page">
    <section class="auth-panel">
      <RouterLink class="brand auth-brand" to="/">
        <span class="brand-mark">S</span>
        <span>CourseHub</span>
      </RouterLink>
      <div class="auth-copy">
        <p>Create account</p>
        <h1>注册校外学习账号</h1>
      </div>
      <el-form :model="form" label-position="top" size="large" @submit.prevent="handleRegister">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="用于登录的账号" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.displayName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="所在单位">
          <el-input v-model="form.organization" placeholder="学校、机构或合作单位" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.mobile" placeholder="可选" :prefix-icon="Iphone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="可选" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入密码" :prefix-icon="Lock" />
        </el-form-item>
        <el-button type="primary" size="large" class="auth-submit" :loading="loading" native-type="submit">
          注册
        </el-button>
      </el-form>
      <p class="auth-link">已有账号？<RouterLink to="/login">去登录</RouterLink></p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Iphone, Lock, User } from '@element-plus/icons-vue'
import { authApi } from '@/api/client'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  displayName: '',
  organization: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (!form.username.trim() || !form.displayName.trim() || form.password.length < 6) {
    ElMessage.warning('请填写用户名、姓名，并设置至少 6 位密码')
    return
  }

  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    await authApi.register({
      username: form.username.trim(),
      displayName: form.displayName.trim(),
      organization: form.organization.trim() || undefined,
      mobile: form.mobile.trim() || undefined,
      email: form.email.trim() || undefined,
      password: form.password
    })
    ElMessage.success('注册成功，账号已作为校外用户提交，请登录后继续使用')
    router.push('/login')
  } catch {
    ElMessage.error('注册失败，用户名、手机号或邮箱可能已存在')
  } finally {
    loading.value = false
  }
}
</script>
