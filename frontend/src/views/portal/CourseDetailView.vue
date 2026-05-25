<template>
  <section class="course-detail-hero">
    <div class="portal-wrap course-detail-head">
      <div>
        <nav>
          <RouterLink to="/">首页</RouterLink>
          <span>/</span>
          <RouterLink to="/courses">课程中心</RouterLink>
        </nav>
        <h1>{{ course?.title || '课程详情' }}</h1>
        <p>{{ course?.summary || '查看课程介绍、主讲教师、开课单位与学习入口。' }}</p>
      </div>
      <el-button type="primary" size="large" :loading="launching" :disabled="!course" @click="launchCourse">
        进入课程
      </el-button>
    </div>
  </section>

  <section class="portal-wrap course-detail-page" v-loading="loading">
    <el-empty v-if="!loading && !course" description="未找到课程" />

    <template v-if="course">
      <article class="course-detail-main">
        <img :src="course.cover" :alt="course.title" />
        <div class="course-detail-content">
          <span>{{ course.category }}</span>
          <h2>课程简介</h2>
          <p>{{ course.summary || '暂无课程简介。' }}</p>

          <h2>教学目标</h2>
          <p>{{ course.objectives || '掌握课程核心知识点，完成对应学习任务并形成可持续学习能力。' }}</p>

          <h2>课程大纲</h2>
          <p>{{ course.syllabus || '课程大纲由教学团队维护，进入课程后可查看完整章节与学习资源。' }}</p>
        </div>
      </article>

      <aside class="course-detail-aside">
        <el-card shadow="never">
          <template #header>课程信息</template>
          <dl>
            <div>
              <dt>主讲教师</dt>
              <dd>{{ course.teacher || '待维护' }}</dd>
            </div>
            <div>
              <dt>开课单位</dt>
              <dd>{{ course.college || '四川师范大学' }}</dd>
            </div>
            <div>
              <dt>课程类型</dt>
              <dd>{{ course.type || course.level }}</dd>
            </div>
            <div>
              <dt>学时</dt>
              <dd>{{ course.duration || `${course.lessons} 课时` }}</dd>
            </div>
            <div>
              <dt>访问权限</dt>
              <dd>{{ permissionText }}</dd>
            </div>
          </dl>
          <el-button type="primary" class="course-detail-launch" :loading="launching" @click="launchCourse">
            进入课程
          </el-button>
        </el-card>
      </aside>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { normalizeCourse, portalApi, type Course } from '@/api/client'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const launching = ref(false)
const course = ref<Course | null>(null)

const permissionText = computed(() => {
  if (!course.value?.permission) return '公开课程'
  const map: Record<string, string> = {
    public: '公开课程',
    internal: '校内用户可见',
    private: '管理员可见'
  }
  return map[course.value.permission] || course.value.permission
})

const loadCourse = async () => {
  loading.value = true
  try {
    course.value = normalizeCourse(await portalApi.getCourse(String(route.params.id)))
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
    course.value = null
    ElMessage.error('课程详情加载失败')
  } finally {
    loading.value = false
  }
}

const launchCourse = async () => {
  if (!course.value) return
  launching.value = true
  try {
    const result = await portalApi.launchCourse(course.value.id)
    const targetUrl = result.launchUrl || course.value.launchUrl
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
    } else {
      ElMessage.success('已进入课程')
    }
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error(error)
    const status = (error as { response?: { status?: number } }).response?.status
    if (status === 401) {
      ElMessage.warning('请先登录后进入课程')
      router.push({ name: 'login', query: { redirect: route.fullPath } })
      return
    }
    if (status === 403) {
      ElMessage.error('当前账号暂无该课程访问权限')
      return
    }
    ElMessage.error('进入课程失败，请稍后重试')
  } finally {
    launching.value = false
  }
}

onMounted(loadCourse)
</script>
