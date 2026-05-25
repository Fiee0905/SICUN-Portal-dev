import { useState } from 'react';
import { User, BookOpen, Clock, Heart, Bell, Settings, Trophy, Calendar, GraduationCap, ShieldCheck, Mail, Phone, MapPin, ChevronRight, LogOut } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const myCourses = [
  {
    id: 1,
    title: '算法设计与复杂性分析',
    instructor: '张明 教授',
    image: 'https://images.unsplash.com/photo-1642952469120-eed4b65104be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHNjaWVuY2UlMjBhbGdvcml0aG0lMjBkYXRhJTIwc3RydWN0dXJlJTIwYm9va3xlbnwxfHx8fDE3NzUxODkxNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 60,
    lastStudy: '2026-03-30',
    totalTime: '18小时'
  },
  {
    id: 3,
    title: '现代教育技术应用',
    instructor: '陈立 教授',
    image: 'https://images.unsplash.com/photo-1755718669459-a8691dd613de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlZHVjYXRpb24lMjBwc3ljaG9sb2d5JTIwY2xhc3Nyb29tJTIwc3R1ZGVudHxlbnwxfHx8fDE3NzUxODkxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    progress: 35,
    lastStudy: '2026-03-28',
    totalTime: '12小时'
  }
];

const achievements = [
  { id: 1, title: '学术精进者', date: '2026-02-15', icon: Trophy },
  { id: 2, title: '全勤先锋', date: '2026-03-01', icon: ShieldCheck },
  { id: 3, title: '互动标兵', date: '2026-03-20', icon: GraduationCap }
];

export function Profile() {
  const [activeTab, setActiveTab] = useState('courses');
  const user = {
    name: '陈小明',
    role: '本科生',
    id: '2023110045',
    college: '计算机科学学院',
    major: '计算机科学与技术',
    email: 'chenxm@sicnu.edu.cn',
    phone: '138****8888',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbGUlMjBzdHVkZW50fGVufDF8fHx8MTc3NTAxMzA3MXww&ixlib=rb-4.1.0&q=80&w=400'
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Profile Banner */}
      <div className="h-48 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[length:24px_24px]" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#F8F9FA] to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Sidebar Profile */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white p-8 border border-gray-100 shadow-xl space-y-8">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full mx-auto p-1 bg-white border-4 border-primary shadow-lg overflow-hidden relative group">
                  <ImageWithFallback src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Settings className="text-white w-6 h-6" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mt-6 tracking-tighter">{user.name}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-primary text-[10px] font-bold mt-2 uppercase tracking-widest">
                  {user.role} · {user.id}
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-bold text-gray-900">{user.college}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium">{user.major}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">{user.phone}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">学术勋章</p>
                <div className="flex flex-wrap gap-3">
                  {achievements.map((ach) => {
                    const Icon = ach.icon;
                    return (
                      <div key={ach.id} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary border border-gray-100 hover:bg-primary hover:text-white transition group relative cursor-help">
                        <Icon className="w-5 h-5" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                          {ach.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className="w-full py-4 border-2 border-gray-100 text-gray-400 font-bold text-xs hover:border-primary hover:text-primary transition flex items-center justify-center gap-2 cursor-pointer">
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </aside>

          {/* Right Column: Content Tabs */}
          <main className="flex-grow space-y-8">
            {/* Tabs Navigation */}
            <div className="bg-white border-b border-gray-100 shadow-sm flex">
              {[
                { id: 'courses', label: '我的在读课程', icon: BookOpen },
                { id: 'history', label: '学习足迹', icon: Clock },
                { id: 'notifications', label: '系统通知', icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-5 text-sm font-bold flex items-center gap-2 transition-all border-b-2 relative cursor-pointer ${
                    activeTab === tab.id ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'notifications' && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myCourses.map((course) => (
                    <div key={course.id} className="bg-white p-6 border border-gray-100 hover:shadow-xl transition group">
                      <div className="flex gap-6">
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-50 overflow-hidden">
                          <ImageWithFallback src={course.image} alt={course.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                          <p className="text-xs text-gray-500 mt-1 font-medium">{course.instructor}</p>
                          <div className="mt-6">
                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                              <span>PROGRESS</span>
                              <span className="text-primary">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 overflow-hidden">
                              <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          累计: {course.totalTime}
                        </div>
                        <button className="text-xs font-black text-primary hover:translate-x-1 transition flex items-center gap-1 cursor-pointer">
                          继续学习 <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="bg-white p-8 border border-gray-100">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">最近学习动态</h3>
                  <div className="space-y-8 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {[
                      { time: '2026-03-30 14:25', activity: '学习了课程《算法设计》第三章：动态规划基础', type: 'study' },
                      { time: '2026-03-29 09:10', activity: '完成了《现代教育技术》第二章在线小测验', type: 'quiz' },
                      { time: '2026-03-28 16:40', activity: '参与了《中国古代文学史》课程论坛讨论', type: 'discuss' }
                    ].map((item, idx) => (
                      <div key={idx} className="relative pl-8 group">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-primary group-hover:bg-primary transition-colors z-10" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.time}</p>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{item.activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  {[
                    { title: '平台升级公告', content: '四川师范大学一体化课程管理平台将于4月5日进行数据升级。', date: '2026-03-30', isNew: true },
                    { title: '选课提醒', content: '您申请的《中国古代文学史》已通过教务处审核。', date: '2026-03-28', isNew: false }
                  ].map((notif, idx) => (
                    <div key={idx} className="bg-white p-6 border-l-4 border-primary shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          {notif.isNew && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400">{notif.date}</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{notif.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
