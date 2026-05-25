<template>
  <section class="portal-list-hero">
    <div class="portal-wrap">
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <span>/</span>
        <strong>教务公告与学术资讯</strong>
      </nav>
      <h1>教务公告与学术资讯</h1>
      <p>集中查看教学安排、系统通知与学术动态。</p>
    </div>
  </section>

  <section class="portal-wrap portal-list-page">
    <el-tabs v-model="activeTab" class="portal-content-tabs" @tab-change="loadActiveTab">
      <el-tab-pane label="教务公告" name="notice" />
      <el-tab-pane label="学术资讯" name="topic" />
    </el-tabs>

    <div v-loading="loading" class="portal-article-list">
      <article v-for="item in items" :key="item.id" class="portal-article-row">
        <time>
          <strong>{{ formatDay(item.publishedAt) }}</strong>
          <small>{{ formatMonth(item.publishedAt) }}</small>
        </time>
        <div>
          <span>{{ item.categoryName || currentCategoryLabel }}</span>
          <h2>{{ item.title }}</h2>
          <p>{{ item.summary || item.sourceName }}</p>
          <small>{{ formatDate(item.publishedAt) }} / {{ item.viewCount }} 阅读</small>
        </div>
      </article>
    </div>

    <el-empty v-if="!loading && items.length === 0" :description="error || '暂无内容'" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { normalizePortalContent, portalApi, type PortalContent } from '@/api/client'

const activeTab = ref<'notice' | 'topic'>('notice')
const items = ref<PortalContent[]>([])
const loading = ref(false)
const error = ref('')

const currentCategoryLabel = computed(() => (activeTab.value === 'notice' ? '教务公告' : '学术资讯'))

const formatDate = (value?: string) => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 10)
}

const formatDay = (value?: string) => {
  const date = formatDate(value)
  return date === '-' ? '--' : date.slice(8, 10)
}

const formatMonth = (value?: string) => {
  const date = formatDate(value)
  return date === '-' ? '--' : `${date.slice(5, 7)}月`
}

const loadActiveTab = async () => {
  loading.value = true
  error.value = ''
  try {
    const result = await portalApi.getCategoryArticles(activeTab.value, { page: 1, size: 100 })
    items.value = result.map((item) => normalizePortalContent(item as Record<string, unknown>))
  } catch (loadError) {
    if (import.meta.env.DEV) console.error('[portal notices]', loadError)
    items.value = []
    error.value = '内容加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadActiveTab)
</script>

<style scoped>
.portal-list-hero {
  background: linear-gradient(135deg, #8f1024, #1f2937);
  color: #fff;
  padding: 72px 0 56px;
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

.portal-list-page {
  padding: 36px 0 72px;
}

.portal-content-tabs {
  margin-bottom: 18px;
}

.portal-article-list {
  display: grid;
  gap: 16px;
  min-height: 160px;
}

.portal-article-row {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 22px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.portal-article-row time {
  display: grid;
  place-items: center;
  align-self: start;
  min-height: 86px;
  border-radius: 8px;
  background: #f8fafc;
  color: var(--portal-primary);
}

.portal-article-row time strong {
  font-size: 30px;
  line-height: 1;
}

.portal-article-row time small,
.portal-article-row span,
.portal-article-row small {
  color: #64748b;
}

.portal-article-row span {
  font-size: 13px;
}

.portal-article-row h2 {
  margin: 8px 0 10px;
  color: #111827;
  font-size: 22px;
  letter-spacing: 0;
}

.portal-article-row p {
  margin: 0 0 12px;
  color: #4b5563;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .portal-list-hero h1 {
    font-size: 32px;
  }

  .portal-article-row {
    grid-template-columns: 1fr;
  }

  .portal-article-row time {
    width: 92px;
  }
}
</style>
