<template>
  <section class="portal-list-hero teacher-hero">
    <div class="portal-wrap">
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <span>/</span>
        <strong>名师风采</strong>
      </nav>
      <h1>名师风采</h1>
      <p>展示后台启用的教师风采内容，按排序值依次呈现。</p>
    </div>
  </section>

  <section class="portal-wrap portal-teacher-page">
    <div v-loading="loading" class="portal-teacher-list">
      <article v-for="teacher in teachers" :key="teacher.id || teacher.name" class="portal-teacher-card">
        <img :src="teacher.avatarUrl || '/assets/logo.png'" :alt="teacher.name" />
        <div>
          <span>{{ teacher.college || '四川师范大学' }}</span>
          <h2>{{ teacher.name }}</h2>
          <strong>{{ teacher.title }}</strong>
          <p>{{ teacher.achievement }}</p>
          <small v-if="teacher.research">研究方向：{{ teacher.research }}</small>
          <em>{{ teacher.courseCount || 0 }} 门课程成果</em>
        </div>
      </article>
    </div>

    <el-empty v-if="!loading && teachers.length === 0" :description="error || '暂无名师风采'" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { portalApi, type PortalTeacher } from '@/api/client'

const teachers = ref<PortalTeacher[]>([])
const loading = ref(false)
const error = ref('')

const loadTeachers = async () => {
  loading.value = true
  error.value = ''
  try {
    teachers.value = await portalApi.getTeachers()
  } catch (loadError) {
    if (import.meta.env.DEV) console.error('[portal teachers]', loadError)
    teachers.value = []
    error.value = '名师风采加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadTeachers)
</script>

<style scoped>
.portal-list-hero {
  background: linear-gradient(135deg, #8f1024, #1f2937);
  color: #fff;
  padding: 72px 0 56px;
}

.teacher-hero {
  background: linear-gradient(135deg, #7f1d1d, #374151);
}

.portal-list-hero nav {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  text-transform: uppercase;
  opacity: 0.82;
}

.portal-list-hero a {
  color: inherit;
}

.portal-list-hero h1 {
  margin: 18px 0 10px;
  font-size: 42px;
  letter-spacing: 0;
}

.portal-list-hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
}

.portal-teacher-page {
  padding: 42px 0 72px;
}

.portal-teacher-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  min-height: 160px;
}

.portal-teacher-card {
  display: grid;
  grid-template-columns: 180px 1fr;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.portal-teacher-card img {
  width: 100%;
  height: 100%;
  min-height: 240px;
  object-fit: cover;
  background: #f3f4f6;
}

.portal-teacher-card div {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 22px;
}

.portal-teacher-card span,
.portal-teacher-card small {
  color: #64748b;
  font-size: 13px;
}

.portal-teacher-card h2 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  letter-spacing: 0;
}

.portal-teacher-card strong {
  color: var(--portal-primary);
}

.portal-teacher-card p {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
}

.portal-teacher-card em {
  justify-self: start;
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-style: normal;
  font-size: 13px;
}

@media (max-width: 960px) {
  .portal-teacher-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .portal-list-hero h1 {
    font-size: 32px;
  }

  .portal-teacher-card {
    grid-template-columns: 1fr;
  }

  .portal-teacher-card img {
    aspect-ratio: 4 / 3;
    min-height: 0;
  }
}
</style>
