<template>
  <RouterLink class="course-card" :to="`/courses/${course.id}`">
    <div class="cover-wrap">
      <img :src="course.cover" :alt="course.title" />
      <span class="level-tag">{{ course.type || course.level }}</span>
      <span v-if="course.college" class="college-tag">
        <el-icon><School /></el-icon>
        {{ course.college }}
      </span>
    </div>

    <div class="course-body">
      <div class="course-kicker">
        <span>{{ course.category }}</span>
        <strong>
          <el-icon><StarFilled /></el-icon>
          {{ (course.rating || 4.8).toFixed(1) }}
        </strong>
      </div>

      <h3>{{ course.title }}</h3>
      <div class="teacher-line">
        <span class="teacher-avatar">
          <el-icon><Avatar /></el-icon>
        </span>
        {{ course.teacher }}
      </div>
      <p>{{ course.summary }}</p>

      <div class="course-stats">
        <span>
          <el-icon><User /></el-icon>
          {{ course.learners.toLocaleString() }}
        </span>
        <span>
          <el-icon><Clock /></el-icon>
          {{ course.duration || `${course.lessons} 课时` }}
        </span>
      </div>

      <div v-if="course.enrolled" class="course-progress">
        <div>
          <span>当前学习进度</span>
          <strong>{{ course.progress || 0 }}%</strong>
        </div>
        <el-progress :percentage="course.progress || 0" :show-text="false" />
      </div>

      <el-button class="course-action" :type="course.enrolled ? 'primary' : 'default'" @click.prevent>
        {{ course.enrolled ? '继续学习' : '查看课程' }}
      </el-button>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { Avatar, Clock, School, StarFilled, User } from '@element-plus/icons-vue'
import type { Course } from '@/api/client'

defineProps<{
  course: Course
}>()
</script>
