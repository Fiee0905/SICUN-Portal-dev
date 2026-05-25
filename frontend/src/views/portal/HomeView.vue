<template>
  <section v-if="isSectionVisible('banner')" class="hero-section">
    <el-carousel v-if="banners.length" height="600px" arrow="always" indicator-position="none" trigger="click">
      <el-carousel-item v-for="banner in banners" :key="banner.title">
        <div class="hero-slide" :style="{ backgroundImage: `url(${banner.image})` }">
          <div class="hero-overlay">
            <div class="portal-wrap hero-copy">
              <span class="hero-label">Sichuan Normal University</span>
              <h1>{{ banner.title }}</h1>
              <p>{{ banner.subtitle }}</p>
              <div class="hero-actions">
                <a :href="banner.linkUrl || '/courses'">
                  <el-button type="primary" size="large">进入课程中心</el-button>
                </a>
                <a href="#teachers">
                  <el-button class="ghost-button" size="large">了解名师风采</el-button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    <el-empty v-else class="portal-empty-on-dark" :description="homeError || 'No homepage banners'" />
  </section>

  <section v-if="isSectionVisible('quickLinks')" class="section-block portal-entry-section">
    <div class="portal-wrap portal-entry-grid">
      <article class="portal-entry-card">
        <div class="section-heading compact-heading">
          <div>
            <span>Quick Access</span>
            <h2>快捷入口</h2>
          </div>
        </div>
        <div class="portal-link-grid">
          <a v-for="item in quickLinks" :key="item.name" :href="item.url">{{ item.name }}</a>
        </div>
      </article>

      <article class="portal-entry-card">
        <div class="section-heading compact-heading">
          <div>
            <span>External Services</span>
            <h2>第三方入口</h2>
          </div>
        </div>
        <div class="portal-link-list">
          <a v-for="item in externalLinks" :key="item.name" :href="item.url">{{ item.name }}</a>
        </div>
      </article>

      <article class="portal-entry-card">
        <div class="section-heading compact-heading">
          <div>
            <span>Site Config</span>
            <h2>{{ siteConfig.siteName }}</h2>
          </div>
        </div>
        <p>{{ siteConfig.description }}</p>
        <small>{{ siteConfig.domain }} / {{ siteConfig.servicePhone }}</small>
      </article>
    </div>
  </section>

  <section v-if="isSectionVisible('colleges')" class="section-block college-section">
    <div class="portal-wrap">
      <div class="section-heading">
        <div>
          <span>Teaching Units</span>
          <h2>开课单位</h2>
          <p>汇聚师大各学院的优质教学资源</p>
        </div>
        <RouterLink class="link-more" to="/courses">查看所有学院 →</RouterLink>
      </div>
      <div class="college-grid">
        <button v-for="college in colleges" :key="college.id" class="college-card" type="button">
          <span class="college-icon">
            <el-icon><School /></el-icon>
          </span>
          <strong>{{ college.name }}</strong>
          <small>{{ college.count }} 门在线课程</small>
        </button>
      </div>
    </div>
  </section>

  <section v-if="isSectionVisible('courses')" class="section-block">
    <div class="portal-wrap">
      <div class="section-heading accent-heading">
        <div>
          <span>Recommended</span>
          <h2>精选课程</h2>
          <p>基于教学评估中心推荐与热门选课数据</p>
        </div>
        <RouterLink class="link-more" to="/courses">进入课程中心 →</RouterLink>
      </div>
      <div class="course-grid">
        <CourseCard v-for="course in featuredCourses" :key="course.id" :course="course" />
      </div>
      <el-empty v-if="featuredCourses.length === 0" :description="homeError || 'No recommended courses'" />
    </div>
  </section>

  <section v-if="isSectionVisible('newCourses')" class="section-block muted-section">
    <div class="portal-wrap">
      <div class="section-heading">
        <div>
          <span>New Courses</span>
          <h2>新课速递</h2>
          <p>最新发布的课程资源</p>
        </div>
        <RouterLink class="link-more" to="/courses">查看全部 →</RouterLink>
      </div>
      <div class="mini-course-grid">
        <article v-for="course in newCourses" :key="course.id" class="mini-course">
          <img :src="course.cover" :alt="course.title" />
          <div>
            <span>{{ course.category }}</span>
            <h3>{{ course.title }}</h3>
            <p>主讲教师：{{ course.teacher }}</p>
            <small>{{ course.college }}</small>
          </div>
        </article>
      </div>
      <el-empty v-if="newCourses.length === 0" :description="homeError || '暂无新课速递'" />
    </div>
  </section>

  <section v-if="isSectionVisible('teachers')" id="teachers" class="section-block">
    <div class="portal-wrap">
      <div class="section-heading accent-heading">
        <div>
          <span>Faculty</span>
          <h2>名师风采</h2>
          <p>汇聚学术名师，传承师大精神，引领学术创新</p>
        </div>
        <RouterLink class="link-more" to="/teachers">查看更多教师 →</RouterLink>
      </div>
      <div class="teacher-grid">
        <article v-for="teacher in teachers" :key="teacher.id" class="teacher-card">
          <img :src="teacher.avatar" :alt="teacher.name" />
          <div>
            <small>{{ teacher.college }}</small>
            <h3>{{ teacher.name }}</h3>
            <strong>{{ teacher.title }}</strong>
            <p>{{ teacher.achievement }}</p>
            <p>研究：{{ teacher.research }}</p>
            <span>{{ teacher.courses }} 门课程成果</span>
          </div>
        </article>
      </div>
      <el-empty v-if="teachers.length === 0" :description="homeError || '暂无名师风采'" />
    </div>
  </section>

  <section v-if="isSectionVisible('notices')" id="notices" class="section-block muted-section">
    <div class="portal-wrap notice-section">
      <aside class="notice-intro">
        <span>Important Notices</span>
        <h2>教务公告与<br />学术资讯</h2>
        <p>及时获取最新教务安排、系统通知及学术讲座动态，助力教学与科研工作高效开展。</p>
        <RouterLink to="/notices">
          <el-button type="primary">进入公告中心</el-button>
        </RouterLink>
      </aside>
      <div class="notice-list">
        <article v-for="item in announcements" :key="item.id">
          <time>
            <strong>{{ formatDay(item.publishedAt) }}</strong>
            <small>{{ formatMonth(item.publishedAt) }}月</small>
          </time>
          <div>
            <span>{{ item.categoryName || '公告' }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.sourceName || item.summary }}</p>
          </div>
        </article>
      </div>
      <el-empty v-if="announcements.length === 0" :description="homeError || '暂无通知公告'" />
    </div>
  </section>

  <section v-if="isSectionVisible('news')" class="section-block">
    <div class="portal-wrap">
      <div class="section-heading">
        <div>
          <span>News</span>
          <h2>新闻资讯</h2>
          <p>教学动态与学术活动</p>
        </div>
        <RouterLink class="link-more" to="/news">查看更多 →</RouterLink>
      </div>
      <div class="news-grid">
        <article v-for="item in news" :key="item.id">
          <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.title" />
          <div>
            <span>{{ item.categoryName || '新闻' }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <small>{{ formatDate(item.publishedAt) }} / {{ item.viewCount }} 阅读</small>
          </div>
        </article>
      </div>
      <el-empty v-if="news.length === 0" :description="homeError || '暂无新闻资讯'" />
    </div>
  </section>

  <section v-if="isSectionVisible('friendLinks')" class="section-block portal-friend-section">
    <div class="portal-wrap">
      <div class="section-heading">
        <div>
          <span>Friendly Links</span>
          <h2>友情链接</h2>
          <p>对接校内公共服务与教学资源站点</p>
        </div>
      </div>
      <div class="portal-friend-links">
        <a
          v-for="item in friendLinks"
          :key="`${item.name}-${item.url}`"
          class="portal-friend-link"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{{ item.name }}</span>
          <small v-if="item.description">{{ item.description }}</small>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { School } from '@element-plus/icons-vue'
import CourseCard from '@/components/CourseCard.vue'
import {
  applyPortalTheme,
  normalizeCourse,
  normalizePortalContent,
  portalApi,
  type Course,
  type PortalContent,
  type PortalHome,
  type PortalTeacher
} from '@/api/client'

type LinkItem = { name: string; url: string; description?: string; sortOrder?: number }
type BannerItem = { title: string; subtitle: string; image: string; linkUrl?: string }
type TeacherItem = { id?: number; name: string; title: string; college: string; achievement: string; research: string; courses: number; avatar: string }
type SiteConfig = { siteName: string; description: string; domain: string; servicePhone: string }
type PageConfig = { layoutJson?: unknown }
type CollegeItem = { id?: number | string; name: string; count?: number }

const defaultSiteConfig: SiteConfig = {
  siteName: '',
  description: '',
  domain: '',
  servicePhone: ''
}

const banners = ref<BannerItem[]>([])
const colleges = ref<CollegeItem[]>([])
const courses = ref<Course[]>([])
const newCourses = ref<Course[]>([])
const teachers = ref<TeacherItem[]>([])
const announcements = ref<PortalContent[]>([])
const news = ref<PortalContent[]>([])
const quickLinks = ref<LinkItem[]>([])
const externalLinks = ref<LinkItem[]>([])
const friendLinks = ref<LinkItem[]>([])
const siteConfig = ref<SiteConfig>(defaultSiteConfig)
const pageConfig = ref<PageConfig>({})
const homeError = ref('')

const featuredCourses = computed(() => courses.value.filter((course) => course.featured).slice(0, 6))
const visibleSections = computed(() => {
  const rawLayout = pageConfig.value.layoutJson
  const layout = typeof rawLayout === 'string' ? parseLayout(rawLayout) : rawLayout
  const sections = (layout as { sections?: unknown } | undefined)?.sections
  if (!Array.isArray(sections) || !sections.length) return new Map<string, boolean>()

  return new Map(
    sections
      .map((section) => {
        if (typeof section === 'string') return [section, true] as const
        const value = section as { code?: string; key?: string; enabled?: boolean; visible?: boolean }
        const code = value.code || value.key
        if (!code) return null
        return [code, value.enabled !== false && value.visible !== false] as const
      })
      .filter((section): section is readonly [string, boolean] => Boolean(section))
  )
})

const isSectionVisible = (code: string) => {
  if (!visibleSections.value.size) return true
  return visibleSections.value.get(code) === true
}

const toLinks = (items: unknown[] | undefined) => {
  if (!items?.length) return []
  return items.map((item) => {
    const value = item as Record<string, string>
    return {
      name: value.name || value.title || value.label || '',
      url: value.url || value.link || value.path || ''
    }
  }).filter((item) => item.name && item.url)
}

const mapSiteConfig = (config: Record<string, unknown> | undefined): SiteConfig => {
  const value = config || {}
  return {
    siteName: String(value['site.name'] || value.siteName || defaultSiteConfig.siteName),
    description: String(value['site.description'] || value.description || defaultSiteConfig.description),
    domain: String(value['site.domain'] || value.domain || defaultSiteConfig.domain),
    servicePhone: String(value['site.contactPhone'] || value.servicePhone || defaultSiteConfig.servicePhone)
  }
}

const normalizeBanners = (items: unknown[] | undefined) => {
  if (!items?.length) return []
  return items.map((item) => {
    const value = item as Record<string, string>
    return {
      title: value.title || value.name || '',
      subtitle: value.subtitle || value.summary || value.description || '',
      image: value.image || value.imageUrl || value.coverUrl || value.cover || '',
      linkUrl: value.linkUrl || value.link || value.url || ''
    }
  }).filter((item) => item.image)
}

const normalizeContents = (items: unknown[] | undefined): PortalContent[] => {
  if (!items?.length) return []
  return items.map((item) => normalizePortalContent(item as Record<string, unknown>))
}

const normalizeTeachers = (items: unknown[] | undefined): TeacherItem[] => {
  if (!items?.length) return []
  return items.map((item) => {
    const value = item as PortalTeacher & Record<string, unknown>
    return {
      id: Number(value.id || 0),
      name: String(value.name || ''),
      title: String(value.title || ''),
      college: String(value.college || ''),
      achievement: String(value.achievement || ''),
      research: String(value.research || ''),
      courses: Number(value.courseCount || value.courses || 0),
      avatar: String(value.avatarUrl || value.avatar || '/assets/logo.png')
    }
  })
}

const normalizeColleges = (items: unknown[] | undefined): CollegeItem[] => {
  if (!items?.length) return []
  return items
    .map((item, index) => {
      if (typeof item === 'string') return { id: item, name: item, count: 0 }
      const value = item as Record<string, unknown>
      const name = String(value.name || value.title || value.college || value.department || '')
      return {
        id: (value.id as number | string | undefined) || name || index,
        name,
        count: Number(value.count || value.courseCount || 0)
      }
    })
    .filter((item) => item.name)
}

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
  return date === '-' ? '--' : date.slice(5, 7)
}

const parseLayout = (layoutJson: string) => {
  try {
    return JSON.parse(layoutJson) as Record<string, unknown>
  } catch {
    return {}
  }
}

onMounted(async () => {
  let home: PortalHome
  try {
    home = await portalApi.getHome()
    homeError.value = ''
  } catch (error) {
    if (import.meta.env.DEV) console.error('[portal home]', error)
    homeError.value = 'Portal home API failed'
    banners.value = []
    courses.value = []
    newCourses.value = []
    teachers.value = []
    announcements.value = []
    news.value = []
    return
  }

  banners.value = normalizeBanners(home.banners)
  quickLinks.value = toLinks(home.quickLinks)
  externalLinks.value = toLinks(home.externalLinks)
  friendLinks.value = toLinks(home.friendLinks)
  siteConfig.value = mapSiteConfig(home.siteConfig as Record<string, unknown> | undefined)
  pageConfig.value = (home.pageConfig as PageConfig | undefined) || {}
  applyPortalTheme((home.siteConfig as Record<string, unknown> | undefined) || {})
  news.value = normalizeContents(home.news)
  announcements.value = normalizeContents(home.notices)
  courses.value = home.courses?.map((course) => normalizeCourse(course)) || []
  newCourses.value = Array.isArray(home.newCourses)
    ? home.newCourses.map((course) => normalizeCourse(course as Record<string, unknown>))
    : []
  teachers.value = normalizeTeachers(home.teachers)
  colleges.value = normalizeColleges(home.colleges)
})
</script>
