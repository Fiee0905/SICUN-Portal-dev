import { useState } from 'react';
import { Search, Filter, Clock, Users, Star, GraduationCap, ChevronRight, School, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const allCourses = [
  {
    id: 1,
    title: '算法设计与复杂性分析',
    instructor: '张明 教授',
    college: '计算机科学学院',
    image: 'https://images.unsplash.com/photo-1642952469120-eed4b65104be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHNjaWVuY2UlMjBhbGdvcml0aG0lMjBkYXRhJTIwc3RydWN0dXJlJTIwYm9va3xlbnwxfHx8fDE3NzUxODkxNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    students: 1258,
    duration: '64 学时',
    rating: 4.9,
    status: '进行中',
    type: '国家级精品',
    category: '专业必修',
    description: '本课程深入探讨现代算法设计的核心范式，包括动态规划、贪心策略及NP完全性理论。',
    isEnrolled: true,
    progress: 60
  },
  {
    id: 2,
    title: '中国古代文学史（上）',
    instructor: '王文德 教授',
    college: '文学院',
    image: 'https://images.unsplash.com/photo-1734941133462-25095e2f80e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwY2xhc3NpY2FsJTIwbGl0ZXJhdHVyZSUyMGJvb2tzJTIwbGlicmFyeXxlbnwxfHx8fDE3NzUxODkxNjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    students: 2450,
    duration: '48 学时',
    rating: 5.0,
    status: '未选课',
    type: '省级金课',
    category: '通识必修',
    description: '系统梳理从先秦到隋唐的文学发展脉络，深度解析经典文学作品的文化内涵。',
    isEnrolled: false
  },
  {
    id: 3,
    title: '现代教育技术应用',
    instructor: '陈立 教授',
    college: '教育科学学院',
    image: 'https://images.unsplash.com/photo-1755718669459-a8691dd613de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlZHVjYXRpb24lMjBwc3ljaG9sb2d5JTIwY2xhc3Nyb29tJTIwc3R1ZGVudHxlbnwxfHx8fDE3NzUxODkxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    students: 842,
    duration: '32 学时',
    rating: 4.8,
    status: '进行中',
    type: '校级精品',
    category: '教师教育',
    description: '探索数字化时代背景下的教学模式创新，掌握主流教育软件与平台的使用技巧。',
    isEnrolled: true,
    progress: 35
  },
  {
    id: 4,
    title: '基础物理实验：光学部分',
    instructor: '王强 研究员',
    college: '物理与电子工程学院',
    image: 'https://images.unsplash.com/photo-1559812933-aa3ea57dbf23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHlzaWNzJTIwZXhwZXJpbWVudCUyMGxhYm9yYXRvcnklMjBlcXVpcG1lbnQlMjBsYXNlcnxlbnwxfHx8fDE3NzUxODkxNjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    students: 726,
    duration: '40 学时',
    rating: 4.7,
    status: '未选课',
    type: '专业核心',
    category: '基础必修',
    description: '通过实验操作深入理解光的干涉、衍射及偏振等核心物理现象。',
    isEnrolled: false
  },
  {
    id: 5,
    title: '高等代数',
    instructor: '刘建 教授',
    college: '数学科学学院',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGZvcm11bGElMjBvbiUyMGJsYWNrYm9hcmR8ZW58MXx8fHwxNzc1MTg5MjY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    students: 1890,
    duration: '72 学时',
    rating: 4.9,
    status: '已选课',
    type: '省级精品',
    category: '专业基础',
    description: '学习线性空间、线性变换及二次型等代数理论，培养严谨的数学逻辑思维。',
    isEnrolled: true,
    progress: 15
  },
  {
    id: 6,
    title: '中国现代史专题研究',
    instructor: '赵敏 教授',
    college: '历史文化与旅游学院',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwYm9vayUyMG9sZCUyMGxpYnJhcnl8ZW58MXx8fHwxNzc1MTg5MjY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    students: 560,
    duration: '48 学时',
    rating: 4.8,
    status: '未选课',
    type: '校级精品',
    category: '专业选修',
    description: '深入分析中国现代史上的关键历史事件与人物，探寻历史发展的内在逻辑。',
    isEnrolled: false
  }
];

const colleges = ['全部学院', '计算机科学学院', '文学院', '教育科学学院', '数学科学学院', '物理与电子工程学院'];
const categories = ['全部类型', '专业必修', '专业选修', '通识必修', '教师教育', '公共选修'];
const levels = ['全部级别', '国家级精品', '省级金课', '校级精品', '专业核心'];

export function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('全部学院');
  const [selectedCategory, setSelectedCategory] = useState('全部类型');
  const [selectedLevel, setSelectedLevel] = useState('全部级别');
  const [sortBy, setSortBy] = useState('最新发布');

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.includes(searchTerm) || course.instructor.includes(searchTerm);
    const matchesCollege = selectedCollege === '全部学院' || course.college === selectedCollege;
    const matchesCategory = selectedCategory === '全部类型' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === '全部级别' || course.type === selectedLevel;
    return matchesSearch && matchesCollege && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Sub Header */}
      <div className="bg-white border-b border-gray-100 py-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                <a href="/" className="hover:text-primary transition">HOME</a>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900">COURSE CENTER</span>
              </nav>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">课程资源中心</h1>
              <p className="text-gray-500 mt-2 font-medium">四川师范大学一体化教学资源库</p>
            </div>
            
            <div className="relative group max-w-lg w-full">
              <input
                type="text"
                placeholder="搜索课程名称、教师或关键词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-sm text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex-shrink-0 space-y-8">
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                分类筛选
              </h3>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">所属学院</p>
                  <div className="space-y-2">
                    {colleges.map(college => (
                      <button
                        key={college}
                        onClick={() => setSelectedCollege(college)}
                        className={`block w-full text-left px-4 py-2.5 text-sm font-bold transition-all border-l-2 ${
                          selectedCollege === college 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-transparent text-gray-500 hover:text-primary hover:bg-gray-50'
                        }`}
                      >
                        {college}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">课程类型</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-bold transition-all border ${
                          selectedCategory === cat 
                          ? 'bg-gray-900 text-white border-gray-900' 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">课程级别</p>
                  <div className="space-y-2">
                    {levels.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-bold transition-all ${
                          selectedLevel === level ? 'text-primary' : 'text-gray-500 hover:text-primary'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${selectedLevel === level ? 'bg-primary' : 'bg-gray-200'}`} />
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary text-white space-y-4">
              <Layers className="w-8 h-8 opacity-50" />
              <h4 className="text-xl font-black tracking-tighter">精品开放课程申报</h4>
              <p className="text-xs font-medium text-white/80 leading-relaxed">
                2026年度校级、省级及国家级精品开放课程申报工作已开启。
              </p>
              <button className="w-full py-3 bg-white text-primary text-xs font-bold hover:bg-gray-100 transition shadow-lg cursor-pointer">
                立即申报
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            {/* Sorting and Summary */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <p className="text-sm font-bold text-gray-400">
                共找到 <span className="text-gray-900">{filteredCourses.length}</span> 门匹配课程
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">排序:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-bold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option>最新发布</option>
                  <option>选课人数</option>
                  <option>综合评分</option>
                </select>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <div className="flex items-center gap-2 text-white text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        已通过教学评估
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 shadow-lg uppercase tracking-wider">
                        {course.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{course.category}</span>
                      <div className="flex items-center gap-1 text-gray-900 font-bold text-xs">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        {course.rating.toFixed(1)}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors leading-tight">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 font-bold">{course.instructor}</p>
                      <span className="text-gray-300">|</span>
                      <p className="text-xs text-gray-400 font-medium">{course.college}</p>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-8">
                      {course.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-300" />
                          <span className="text-xs font-bold text-gray-900">{course.students}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-300" />
                          <span className="text-xs font-bold text-gray-900">{course.duration}</span>
                        </div>
                      </div>
                      
                      {course.isEnrolled ? (
                        <button className="bg-gray-900 text-white px-6 py-2.5 text-xs font-bold hover:bg-primary transition shadow-md cursor-pointer">
                          继续学习
                        </button>
                      ) : (
                        <button className="border-2 border-primary text-primary px-6 py-2.5 text-xs font-bold hover:bg-primary hover:text-white transition cursor-pointer">
                          查看详情
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-20 bg-white border border-dashed border-gray-200">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">未找到匹配课程</h3>
                <p className="text-gray-400 mt-2">请尝试调整筛选条件或搜索关键词</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCollege('全部学院');
                    setSelectedCategory('全部类型');
                    setSelectedLevel('全部级别');
                  }}
                  className="mt-6 text-primary font-bold hover:underline cursor-pointer"
                >
                  重置所有筛选
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
