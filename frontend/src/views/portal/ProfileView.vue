<template>
  <section class="profile-banner" aria-label="个人中心">
    <div class="profile-banner-pattern" />
  </section>

  <section class="portal-wrap profile-page">
    <aside class="profile-sidebar">
      <div class="profile-card">
        <div class="profile-avatar-wrap">
          <img :src="profile.avatar" :alt="profile.name" />
          <button type="button" aria-label="编辑头像">
            <el-icon><Setting /></el-icon>
          </button>
        </div>

        <h1>{{ profile.name }}</h1>
        <p class="profile-role">{{ profile.role }} · {{ profile.studentId }}</p>

        <dl class="profile-info">
          <div>
            <dt><el-icon><Location /></el-icon></dt>
            <dd>{{ profile.college }}</dd>
          </div>
          <div>
            <dt><el-icon><School /></el-icon></dt>
            <dd>{{ profile.major }}</dd>
          </div>
          <div>
            <dt><el-icon><Message /></el-icon></dt>
            <dd>{{ profile.email }}</dd>
          </div>
          <div>
            <dt><el-icon><Iphone /></el-icon></dt>
            <dd>{{ profile.phone }}</dd>
          </div>
        </dl>

        <div class="profile-achievements">
          <h2>学术勋章</h2>
          <div>
            <el-tooltip
              v-for="item in achievements"
              :key="item.id"
              :content="`${item.title} · ${item.date}`"
              placement="top"
            >
              <button type="button" :aria-label="item.title">
                <el-icon><component :is="item.icon" /></el-icon>
              </button>
            </el-tooltip>
          </div>
        </div>

        <div class="profile-permissions">
          <h2>用户权限</h2>
          <p>{{ currentRole }}</p>
          <div>
            <el-tag v-for="permission in currentPermissions" :key="permission" size="small" effect="plain">
              {{ permission }}
            </el-tag>
          </div>
        </div>

        <el-button class="profile-logout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </aside>

    <main class="profile-content">
      <div class="profile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <el-icon><component :is="tab.icon" /></el-icon>
          {{ tab.label }}
          <i v-if="tab.id === 'notifications'" />
        </button>
      </div>

      <section v-if="activeTab === 'courses'" class="profile-course-grid">
        <article v-for="course in myCourses" :key="course.id" class="profile-course-card">
          <img :src="course.image" :alt="course.title" />
          <div>
            <h3>{{ course.title }}</h3>
            <p>{{ course.instructor }}</p>
            <div class="profile-course-progress">
              <span>PROGRESS</span>
              <strong>{{ course.progress }}%</strong>
            </div>
            <el-progress :percentage="course.progress" :show-text="false" />
            <footer>
              <span>
                <el-icon><Clock /></el-icon>
                累计：{{ course.totalTime }}
              </span>
              <RouterLink to="/courses">继续学习</RouterLink>
            </footer>
          </div>
        </article>
      </section>

      <section v-else-if="activeTab === 'history'" class="profile-panel">
        <h2>最近学习动态</h2>
        <div class="profile-timeline">
          <article v-for="item in studyHistory" :key="item.time">
            <time>{{ item.time }}</time>
            <p>{{ item.activity }}</p>
          </article>
        </div>
      </section>

      <section v-else class="profile-notifications">
        <article v-for="item in notifications" :key="item.title">
          <div>
            <h3>
              <i v-if="item.isNew" />
              {{ item.title }}
            </h3>
            <time>{{ item.date }}</time>
          </div>
          <p>{{ item.content }}</p>
        </article>
      </section>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bell, Clock, Iphone, Location, Message, Reading, School, Setting, SwitchButton } from '@element-plus/icons-vue'
import { userApi } from '@/api/client'

type ProfileTabId = 'courses' | 'history' | 'notifications'

const activeTab = ref<ProfileTabId>('courses')
const profile = ref({
  name: '',
  role: '',
  studentId: '',
  college: '',
  major: '',
  email: '',
  phone: '',
  avatar: '/assets/logo.png'
})
const roles = ref<string[]>([])
const permissions = ref<string[]>([])
const achievements = ref<Array<{ id: number | string; title: string; date: string; icon: unknown }>>([])
const myCourses = ref<Array<{ id: number | string; image: string; title: string; instructor: string; progress: number; totalTime: string }>>([])
const studyHistory = ref<Array<{ time: string; activity: string }>>([])
const notifications = ref<Array<{ title: string; date: string; content: string; isNew?: boolean }>>([])

const currentRole = computed(() => roles.value.join(' / '))
const currentPermissions = computed(() => permissions.value.slice(0, 4))

const tabs = [
  { id: 'courses', label: '我的在读课程', icon: Reading },
  { id: 'history', label: '学习足迹', icon: Clock },
  { id: 'notifications', label: '系统通知', icon: Bell }
] as const

onMounted(async () => {
  try {
    const me = await userApi.getMe()

    profile.value = {
      name: me.displayName || me.name || '',
      role: me.role || me.roles?.[0] || '',
      studentId: me.studentId || me.username || '',
      college: me.college || me.department || '',
      major: me.major || '',
      email: me.email || '',
      phone: me.mobile || me.phone || '',
      avatar: me.avatar || '/assets/logo.png'
    }
    roles.value = me.roles?.length ? me.roles : profile.value.role ? [profile.value.role] : []
    permissions.value = me.permissions || []
  } catch (error) {
    if (import.meta.env.DEV) console.error('[profile]', error)
    roles.value = []
    permissions.value = []
  }
})
</script>
