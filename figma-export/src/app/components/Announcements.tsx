import { Bell, Calendar, ChevronRight, FileText, Megaphone } from 'lucide-react';

const announcements = [
  {
    id: 1,
    title: '关于开展2026年度“四川师范大学精品在线开放课程”申报工作的通知',
    date: '2026-04-01',
    type: 'academic',
    isNew: true,
    department: '教务处'
  },
  {
    id: 2,
    title: '四川师范大学一体化课程管理平台系统升级及数据维护公告',
    date: '2026-03-30',
    type: 'system',
    isNew: true,
    department: '信息化建设与管理处'
  },
  {
    id: 3,
    title: '关于公布2026年春季学期第一阶段“课堂教学质量奖”评审结果的通知',
    date: '2026-03-28',
    type: 'academic',
    isNew: false,
    department: '教学评估中心'
  },
  {
    id: 4,
    title: '【名师讲座】第128期“狮山讲堂”：数字化转型的教育逻辑与路径',
    date: '2026-03-25',
    type: 'lecture',
    isNew: false,
    department: '教师发展中心'
  },
  {
    id: 5,
    title: '关于2026届本科毕业生图像采集工作的补充通知',
    date: '2026-03-22',
    type: 'academic',
    isNew: false,
    department: '教务处'
  }
];

const typeStyles: Record<string, { bg: string, text: string, label: string }> = {
  academic: { bg: 'bg-red-50', text: 'text-primary', label: '教务' },
  system: { bg: 'bg-slate-100', text: 'text-slate-600', label: '系统' },
  lecture: { bg: 'bg-amber-50', text: 'text-amber-700', label: '讲座' },
};

export function Announcements() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Side: Title and Highlights */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-primary text-sm font-bold mb-6">
                <Megaphone className="w-4 h-4" />
                <span>IMPORTANT NOTICES</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">教务公告与<br />学术资讯</h2>
              <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                及时获取最新的教务安排、系统通知及学术讲座动态，助力教学与科研工作高效开展。
              </p>
              <button className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-4 font-bold hover:bg-primary transition-all duration-300 shadow-xl cursor-pointer">
                进入公告中心
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition duration-300" />
              </button>
            </div>
          </div>

          {/* Right Side: List of Announcements */}
          <div className="lg:col-span-2">
            <div className="space-y-1">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-start gap-6 p-6 hover:bg-gray-50 transition-colors duration-300 border-b border-gray-100 cursor-pointer"
                >
                  <div className="flex-shrink-0 text-center w-16">
                    <span className="block text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {item.date.split('-')[2]}
                    </span>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                      {item.date.split('-')[1]}月
                    </span>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter rounded ${typeStyles[item.type]?.bg || 'bg-gray-100'} ${typeStyles[item.type]?.text || 'text-gray-600'}`}>
                        {typeStyles[item.type]?.label || '通知'}
                      </span>
                      {item.isNew && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <span className="text-xs text-gray-400 font-medium">{item.department}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 bg-gray-50 flex items-center justify-between border-l-4 border-primary">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded shadow-sm">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">开启公告推送</h4>
                  <p className="text-xs text-gray-500">第一时间获取重要教务变动及停课通知</p>
                </div>
              </div>
              <button className="text-xs font-bold text-primary hover:underline cursor-pointer">立即开启</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
