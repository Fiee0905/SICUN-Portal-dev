<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="admin-eyebrow">四川师大一体化课程管理</span>
        <h1>教学门户仪表盘</h1>
      </div>
      <el-button type="primary" :icon="Plus">发布新课程</el-button>
    </div>

    <div class="admin-stat-grid">
      <el-card v-for="item in adminStats" :key="item.label" class="admin-stat-card" shadow="never">
        <div class="stat-top">
          <span :class="['stat-dot', `tone-${item.tone}`]"></span>
          <el-tag effect="plain" size="small">{{ item.trend }}</el-tag>
        </div>
        <small>{{ item.label }}</small>
        <strong>{{ item.value }}</strong>
      </el-card>
    </div>

    <div class="admin-two-col">
      <el-card class="admin-panel" shadow="never">
        <template #header>
          <div class="admin-card-title"><el-icon><TrendCharts /></el-icon> 近 7 日访问趋势</div>
        </template>
        <div class="admin-chart">
          <span v-for="bar in bars" :key="bar.label" :style="{ height: `${bar.value}%` }">
            <em>{{ bar.label }}</em>
          </span>
        </div>
      </el-card>

      <el-card class="admin-panel" shadow="never">
        <template #header>
          <div class="admin-card-title"><el-icon><Clock /></el-icon> 最近活动</div>
        </template>
        <div class="admin-activity">
          <div v-for="activity in adminActivities" :key="activity.title">
            <el-tag size="small" type="danger" effect="plain">{{ activity.type }}</el-tag>
            <p>{{ activity.title }}</p>
            <time>{{ activity.time }}</time>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="admin-panel" shadow="never">
      <template #header>
        <div class="admin-card-title"><el-icon><Reading /></el-icon> 待处理课程</div>
      </template>
      <el-table :data="adminCourses" class="admin-table">
        <el-table-column prop="name" label="课程名称" min-width="180" />
        <el-table-column prop="teacher" label="教师" width="110" />
        <el-table-column prop="department" label="学院" min-width="150" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === '已开课' ? 'success' : row.status === '审核中' ? 'warning' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="students" label="选课人数" width="110" />
        <el-table-column label="操作" width="140" align="right">
          <el-button link type="primary">审核</el-button>
          <el-button link>预览</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Clock, Plus, Reading, TrendCharts } from '@element-plus/icons-vue'
import { cmsApi, normalizeAdminCourse } from '@/api/client'

type AdminStat = { label: string; value: string | number; trend?: string; tone?: string }
type AdminActivity = { title: string; time?: string; type?: string }
type DashboardCourse = { name: string; teacher: string; department: string; status: string; students: number }

const adminStats = ref<AdminStat[]>([])
const adminActivities = ref<AdminActivity[]>([])
const adminCourses = ref<DashboardCourse[]>([])
const bars = ref<Array<{ label: string; value: number }>>([])

onMounted(async () => {
  const [dashboard, courses] = await Promise.all([
    cmsApi.getDashboard().catch((error) => {
      if (import.meta.env.DEV) console.error('[admin dashboard]', error)
      return {}
    }),
    cmsApi.getCourses({ page: 1, size: 6 }).catch((error) => {
      if (import.meta.env.DEV) console.error('[admin dashboard courses]', error)
      return []
    })
  ])

  const value = dashboard as {
    stats?: AdminStat[]
    activities?: AdminActivity[]
    visitTrend?: Array<{ label: string; value: number }>
  }
  adminStats.value = value.stats || []
  adminActivities.value = value.activities || []
  bars.value = value.visitTrend || []
  adminCourses.value = courses.map((item) => {
    const course = normalizeAdminCourse(item as Record<string, unknown>)
    return {
      name: course.courseName,
      teacher: course.teacherName || '',
      department: course.department || '',
      status: course.status || '',
      students: 0
    }
  })
})
</script>
