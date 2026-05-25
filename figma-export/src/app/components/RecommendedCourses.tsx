import { Clock, Users, Star, GraduationCap, ChevronRight, School } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from 'react-router';

const courses = [
  {
    id: 1,
    title: '算法设计与复杂性分析',
    instructor: '张明 教授',
    college: '计算机科学学院',
    image: 'https://images.unsplash.com/photo-1642952469120-eed4b65104be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHNjaWVuY2UlMjBhbGdvcml0aG0lMjBkYXRhJTIwc3RydWN0dXJlJTIwYm9va3xlbnwxfHx8fDE3NzUxODkxNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    students: 1258,
    duration: '64 学时',
    rating: 4.9,
    progress: 60,
    status: '进行中',
    type: '国家级精品课程',
    isEnrolled: true
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
    type: '校级通识必修',
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
    type: '教师教育核心课',
    isEnrolled: true
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
    type: '专业基础必修',
    isEnrolled: false
  }
];

export function RecommendedCourses() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="border-l-4 border-primary pl-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">精选课程</h2>
            <p className="text-gray-500 mt-2 text-lg">基于教学评估中心推荐与热门选课数据</p>
          </div>
          <Link 
            to="/courses" 
            className="group flex items-center gap-2 text-primary font-bold hover:translate-x-1 transition-all duration-300"
          >
            进入课程中心
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-white flex flex-col h-full border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden">
                <ImageWithFallback
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                    {course.type}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-sm">
                  <School className="w-3 h-3" />
                  {course.college}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm text-gray-600 font-medium">{course.instructor}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-8 border-y border-gray-50 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">选课人数</span>
                    <div className="flex items-center gap-1 text-gray-900 font-bold text-sm">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {course.students}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 border-x border-gray-50 px-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">课程容量</span>
                    <div className="flex items-center gap-1 text-gray-900 font-bold text-sm">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {course.duration}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">综合评分</span>
                    <div className="flex items-center gap-1 text-gray-900 font-bold text-sm">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      {course.rating.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  {course.isEnrolled ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-500 font-medium">当前学习进度</span>
                        <span className="text-primary font-bold">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-1000 ease-out"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-bold transition duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer">
                        <GraduationCap className="w-4 h-4" />
                        继续学习
                      </button>
                    </div>
                  ) : (
                    <button className="w-full bg-white hover:bg-primary hover:text-white text-primary border-2 border-primary py-3 font-bold transition-all duration-300 cursor-pointer">
                      立即申请选课
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
