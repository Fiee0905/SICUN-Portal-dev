<template>
  <section class="course-hero">
    <div class="portal-wrap">
      <div>
        <nav>
          <RouterLink to="/">HOME</RouterLink>
          <span>/</span>
          <strong>COURSE CENTER</strong>
        </nav>
        <h1>课程资源中心</h1>
        <p>四川师范大学一体化教学资源库</p>
      </div>
      <el-input
        v-model="keyword"
        class="course-search"
        clearable
        size="large"
        placeholder="搜索课程名称、教师或关键词..."
        :prefix-icon="Search"
        @keyup.enter="loadCourses"
        @clear="loadCourses"
      />
      <div v-if="presetKeywords.length" class="preset-keywords">
        <button v-for="item in presetKeywords" :key="item" type="button" :class="{ active: keyword === item }" @click="applyPresetKeyword(item)">
          {{ item }}
        </button>
      </div>
    </div>
  </section>

  <section class="portal-wrap course-page">
    <aside class="course-sidebar">
      <h2>
        <el-icon><Filter /></el-icon>
        分类筛选
      </h2>

      <div class="filter-group">
        <h3>所属学院</h3>
        <button v-for="college in collegeOptions" :key="college" type="button" :class="{ active: activeCollege === college }" @click="activeCollege = college">
          {{ college }}
        </button>
      </div>

      <div class="filter-group">
        <h3>课程类型</h3>
        <div class="chip-row">
          <button v-for="category in categoryOptions" :key="category" type="button" :class="{ active: activeCategory === category }" @click="activeCategory = category">
            {{ category }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <h3>课程级别</h3>
        <button v-for="level in levelOptions" :key="level" type="button" :class="{ active: activeLevel === level }" @click="activeLevel = level">
          <i />
          {{ level }}
        </button>
      </div>

      <div class="apply-panel">
        <el-icon><Collection /></el-icon>
        <h3>精品开放课程申报</h3>
        <p>课程建设申报入口</p>
        <el-button>立即申报</el-button>
      </div>
    </aside>

    <main>
      <div class="result-bar">
        <p>共找到 <strong>{{ filteredCourses.length }}</strong> 门匹配课程</p>
        <label>
          <span>排序</span>
          <el-select v-model="sortBy" size="small">
            <el-option label="最新发布" value="latest" />
            <el-option label="选课人数" value="learners" />
            <el-option label="综合评分" value="rating" />
          </el-select>
        </label>
      </div>
      <div v-loading="loading" class="course-grid course-grid-two">
        <CourseCard v-for="course in sortedCourses" :key="course.id" :course="course" />
      </div>
      <el-empty v-if="!loading && filteredCourses.length === 0" :description="courseError || '未找到匹配课程'">
        <el-button type="primary" @click="resetFilters">重置筛选</el-button>
      </el-empty>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Collection, Filter, Search } from '@element-plus/icons-vue'
import CourseCard from '@/components/CourseCard.vue'
import { normalizeCollege, normalizeCourse, portalApi, type Course } from '@/api/client'

const allCollegesLabel = '全部学院'
const allCategoriesLabel = '全部'
const allLevelsLabel = '全部级别'

const keyword = ref('')
const activeCollege = ref(allCollegesLabel)
const activeCategory = ref(allCategoriesLabel)
const activeLevel = ref(allLevelsLabel)
const sortBy = ref('latest')
const courses = ref<Course[]>([])
const categories = ref<string[]>([])
const colleges = ref<{ name: string }[]>([])
const levels = ref<string[]>([])
const presetKeywords = ref<string[]>([])
const courseError = ref('')
const loading = ref(false)

const collegeOptions = computed(() => [allCollegesLabel, ...colleges.value.map((college) => college.name)])
const categoryOptions = computed(() => [allCategoriesLabel, ...categories.value])
const levelOptions = computed(() => [allLevelsLabel, ...levels.value])

const filteredCourses = computed(() => {
  return courses.value.filter((course) => {
    const matchesLevel = activeLevel.value === allLevelsLabel || course.level === activeLevel.value
    return matchesLevel
  })
})

const sortedCourses = computed(() => {
  const result = [...filteredCourses.value]
  if (sortBy.value === 'learners') return result.sort((a, b) => b.learners - a.learners)
  if (sortBy.value === 'rating') return result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  return result
})

const resetFilters = async () => {
  keyword.value = ''
  activeCollege.value = allCollegesLabel
  activeCategory.value = allCategoriesLabel
  activeLevel.value = allLevelsLabel
  sortBy.value = 'latest'
  await loadCourses()
}

const applyPresetKeyword = (item: string) => {
  keyword.value = item
  loadCourses()
}

const normalizeDictionary = (items: unknown[]) => {
  return items
    .map((item) => {
      if (typeof item === 'string') return item
      const value = item as Record<string, unknown>
      return String(value.name || value.title || value.label || value.value || '')
    })
    .filter(Boolean)
}

const loadCourses = async () => {
  loading.value = true
  courseError.value = ''
  try {
    const selectedCollege = activeCollege.value === allCollegesLabel ? undefined : activeCollege.value
    const selectedCategory = activeCategory.value === allCategoriesLabel ? undefined : activeCategory.value
    const result = await portalApi.getCourses({
      page: 1,
      size: 100,
      keyword: keyword.value.trim() || undefined,
      category: selectedCategory,
      department: selectedCollege,
      college: selectedCollege
    })
    courses.value = result.map((course) => normalizeCourse(course))
  } catch (error) {
    if (import.meta.env.DEV) console.error('[portal courses]', error)
    courseError.value = '课程接口加载失败'
    courses.value = []
  } finally {
    loading.value = false
  }
}

const loadFilters = async () => {
  const [apiCategories, apiLevels, apiKeywords, apiColleges] = await Promise.all([
    portalApi.getCourseCategories().catch((error) => {
      if (import.meta.env.DEV) console.error('[portal course categories]', error)
      return [] as unknown[]
    }),
    portalApi.getCourseLevels().catch((error) => {
      if (import.meta.env.DEV) console.error('[portal course levels]', error)
      return [] as unknown[]
    }),
    portalApi.getSearchKeywords().catch((error) => {
      if (import.meta.env.DEV) console.error('[portal search keywords]', error)
      return [] as string[]
    }),
    portalApi.getColleges().catch((error) => {
      if (import.meta.env.DEV) console.error('[portal colleges]', error)
      return []
    })
  ])

  categories.value = normalizeDictionary(apiCategories)
  levels.value = normalizeDictionary(apiLevels)
  colleges.value = apiColleges.map((item) => normalizeCollege(item)).filter((item) => item.enabled !== false && item.name)
  presetKeywords.value = apiKeywords
}

watch([activeCollege, activeCategory], () => {
  loadCourses()
})

onMounted(async () => {
  await Promise.all([loadFilters(), loadCourses()])
})
</script>
