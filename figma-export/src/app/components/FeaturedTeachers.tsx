import { Award, BookOpen, GraduationCap, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const teachers = [
  {
    id: 1,
    name: '张明',
    title: '二级教授、博士生导师',
    avatar: 'https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwcHJvZmVzc29yJTIwcG9ydHJhaXQlMjBzbWlsaW5nJTIwYWNhZGVtaWN8ZW58MXx8fHwxNzc1MTg5MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    college: '计算机科学学院',
    achievement: '长江学者特聘教授、国家杰出青年基金获得者',
    research: '深度学习、模式识别与智能系统',
    courses: 12
  },
  {
    id: 2,
    name: '李雪',
    title: '教授、省级教学名师',
    avatar: 'https://images.unsplash.com/photo-1758685847967-c598c3b176b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2FkZW1pYyUyMHdvbWFuJTIwcHJvZmVzc29yJTIwY2xhc3Nyb29tJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc1MTg5MTExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    college: '数学科学学院',
    achievement: '国家级教学成果奖二等奖负责人',
    research: '复分析、代数几何与数学教育',
    courses: 8
  },
  {
    id: 3,
    name: '王强',
    title: '研究员、青年拔尖人才',
    avatar: 'https://images.unsplash.com/photo-1631816285139-7818552ed385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2FkZW1pYyUyMHNjaWVudGlzdCUyMG1hbiUyMGxhYiUyMHBvcnRyYWl0JTIwdW5pdmVyc2l0eXxlbnwxfHx8fDE3NzUxODkxMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    college: '物理与电子工程学院',
    achievement: '中组部“万人计划”青年拔尖人才',
    research: '新型半导体器件与集成电路设计',
    courses: 6
  },
  {
    id: 4,
    name: '陈立',
    title: '教授、四川省政府参事',
    avatar: 'https://images.unsplash.com/photo-1632242219583-052add7c4d47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwZmVtYWxlJTIwcmVzZWFyY2hlciUyMHByb2Zlc3NvciUyMGFjYWRlbWljJTIwb2ZmaWNlfGVufDF8fHx8MTc3NTE4OTExN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    college: '教育科学学院',
    achievement: '国务院政府特殊津贴专家、全国优秀教师',
    research: '高等教育心理学、教师教育改革',
    courses: 10
  }
];

export function FeaturedTeachers() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="border-l-4 border-primary pl-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">名师风采</h2>
            <p className="text-gray-500 mt-2 text-lg">汇聚学术名师，传承师大精神，引领学术创新</p>
          </div>
          <button className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition group cursor-pointer">
            查看更多教师
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border border-gray-100"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <ImageWithFallback
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-full h-full object-cover grayscale-20 group-hover:grayscale-0 group-hover:scale-105 transition duration-700"
                />
                <div className="absolute top-4 left-0 bg-primary text-white text-xs px-3 py-1 font-medium shadow-md">
                  {teacher.college}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{teacher.name}</h3>
                  <p className="text-sm text-primary font-medium tracking-wide">{teacher.title}</p>
                </div>

                <div className="space-y-4 mb-6 flex-grow">
                  <div className="flex gap-3">
                    <Award className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {teacher.achievement}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <GraduationCap className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500 leading-relaxed italic">
                      研究：{teacher.research}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm">课程成果</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{teacher.courses} <span className="text-xs font-normal text-gray-400 ml-0.5">门</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
