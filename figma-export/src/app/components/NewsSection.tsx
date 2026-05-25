import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const news = [
  {
    id: 1,
    title: '我校在线教育平台获得教育部优秀平台表彰',
    summary: '近日，教育部公布了2026年度优秀在线教育平台名单，我校智慧教育平台凭借优质的课程资源和创新的教学模式成功入选...',
    image: 'https://images.unsplash.com/photo-1745558858213-c1bb66fc8fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwbGlicmFyeSUyMHN0dWRlbnRzfGVufDF8fHx8MTc3NTAyODEwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '2026-03-30',
    category: '学术动态',
    views: 1523
  },
  {
    id: 2,
    title: '国际学术交流周圆满举办，多位知名学者线上授课',
    summary: '为期一周的国际学术交流活动于上周圆满结束，来自哈佛、MIT等世界知名学府的教授通过平台为我校学生带来精彩讲座...',
    image: 'https://images.unsplash.com/photo-1758685848061-3080d0780285?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGNsYXNzJTIwd2hpdGVib2FyZCUyMHRlYWNoaW5nfGVufDF8fHx8MTc3NTAyODEwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '2026-03-28',
    category: '教学活动',
    views: 2341
  },
  {
    id: 3,
    title: '人工智能学院新增10门前沿课程，涵盖最新技术方向',
    summary: '人工智能学院近期在平台上线了一批面向前沿技术的新课程，包括大语言模型、计算机视觉、强化学习等热门领域...',
    image: 'https://images.unsplash.com/photo-1614308459036-779d0dfe51ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFib3JhdG9yeSUyMHJlc2VhcmNofGVufDF8fHx8MTc3NTAxMzA3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '2026-03-25',
    category: '课程建设',
    views: 1876
  }
];

export function NewsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">新闻资讯</h2>
              <p className="text-gray-600">教学动态与学术活动</p>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            查看更多 →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{item.date}</span>
                  </div>
                  <span>{item.views} 阅读</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group/btn">
                    阅读全文
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
