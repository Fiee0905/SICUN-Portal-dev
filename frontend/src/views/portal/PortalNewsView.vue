<template>
  <section class="portal-list-hero news-hero">
    <div class="portal-wrap">
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <span>/</span>
        <strong>新闻资讯</strong>
      </nav>
      <h1>新闻资讯</h1>
      <p>查看教学动态、课程建设成果与校园活动资讯。</p>
    </div>
  </section>

  <section class="portal-wrap portal-news-page">
    <div v-loading="loading" class="portal-news-list">
      <article v-for="item in items" :key="item.id" class="portal-news-card">
        <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.title" />
        <div class="portal-news-body">
          <span>{{ item.categoryName || '新闻资讯' }}</span>
          <h2>{{ item.title }}</h2>
          <p>{{ item.summary }}</p>
          <small>{{ formatDate(item.publishedAt) }} / {{ item.viewCount }} 阅读</small>
        </div>
      </article>
    </div>

    <el-empty v-if="!loading && items.length === 0" :description="error || '暂无新闻资讯'" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { normalizePortalContent, portalApi, type PortalContent } from '@/api/client'

const items = ref<PortalContent[]>([])
const loading = ref(false)
const error = ref('')

const formatDate = (value?: string) => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 10)
}

const loadNews = async () => {
  loading.value = true
  error.value = ''
  try {
    const result = await portalApi.getCategoryArticles('news', { page: 1, size: 100 })
    items.value = result.map((item) => normalizePortalContent(item as Record<string, unknown>))
  } catch (loadError) {
    if (import.meta.env.DEV) console.error('[portal news]', loadError)
    items.value = []
    error.value = '新闻资讯加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadNews)
</script>

<style scoped>
.portal-list-hero {
  background: linear-gradient(135deg, #8f1024, #1f2937);
  color: #fff;
  padding: 72px 0 56px;
}

.news-hero {
  background: linear-gradient(135deg, #8f1024, #334155);
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

.portal-news-page {
  padding: 42px 0 72px;
}

.portal-news-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  min-height: 160px;
}

.portal-news-card {
  display: grid;
  grid-template-columns: 180px 1fr;
  overflow: hidden;
  min-height: 170px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.portal-news-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #f3f4f6;
}

.portal-news-body {
  padding: 20px;
}

.portal-news-body span,
.portal-news-body small {
  color: #64748b;
  font-size: 13px;
}

.portal-news-body h2 {
  margin: 8px 0 10px;
  color: #111827;
  font-size: 22px;
  letter-spacing: 0;
}

.portal-news-body p {
  margin: 0 0 14px;
  color: #4b5563;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .portal-news-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .portal-list-hero h1 {
    font-size: 32px;
  }

  .portal-news-card {
    grid-template-columns: 1fr;
  }

  .portal-news-card img {
    aspect-ratio: 16 / 9;
  }
}
</style>
