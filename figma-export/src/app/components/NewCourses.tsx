import { Clock, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const newCourses = [
  {
    id: 1,
    title: '深度学习与神经网络',
    instructor: '陈立教授',
    image: 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGluZyUyMGNvbXB1dGVyfGVufDF8fHx8MTc3NTAwMzYyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '40课时',
    releaseDate: '2026-03-28',
    category: '人工智能',
    type: '校外公开',
    college: '计算机科学学院'
  },
  {
    id: 2,
    title: '量子计算原理与应用',
    instructor: '赵敏教授',
    image: 'https://images.unsplash.com/photo-1614308459036-779d0dfe51ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFib3JhdG9yeSUyMHJlc2VhcmNofGVufDF8fHx8MTc3NTAxMzA3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '32课时',
    releaseDate: '2026-03-25',
    category: '前沿科技',
    type: '校内公开',
    college: '物理与电子工程学院'
  },
  {
    id: 3,
    title: '区块链技术与应用',
    instructor: '孙杰讲师',
    image: 'https://images.unsplash.com/photo-1510832758362-af875829efcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjcmVhdGl2ZSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzQ5Njk0MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '28课时',
    releaseDate: '2026-03-22',
    category: '计算机科学',
    type: '校内公开',
    college: '计算机科学学院'
  },
  {
    id: 4,
    title: '大数据分析与应用',
    instructor: '周华教授',
    image: 'https://images.unsplash.com/photo-1758691736067-b309ee3ef7b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRyYWluaW5nJTIwbWVldGluZ3xlbnwxfHx8fDE3NzQ5NTAxNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '36课时',
    releaseDate: '2026-03-20',
    category: '数据科学',
    type: '校外公开',
    college: '数学科学学院'
  }
];

export function NewCourses() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">新课速递</h2>
            <p className="text-gray-600">最新开设的学术课程</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            查看全部 →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer border border-gray-200"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md font-medium">
                    新开课程
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="text-xs text-blue-600 mb-2 font-medium">{course.category}</div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">主讲教师: {course.instructor}</p>
                <p className="text-xs text-gray-500 mb-4">{course.college}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.type}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  开课时间: {course.releaseDate}
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition text-sm font-medium">
                  查看课程
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}