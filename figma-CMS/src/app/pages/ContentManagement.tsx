import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  BookOpen,
  Bell,
  Image as ImageIcon,
  ChevronDown,
  Edit2,
  Trash2,
  GraduationCap,
  Users,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const mockCourses = [
  { id: "CS101", name: "计算机导论", department: "计算机学院", credits: 3, lecturer: "王教授", status: "active", enrollment: 120, updatedAt: "2024-03-28" },
  { id: "MATH202", name: "高等数学(II)", department: "数学系", credits: 5, lecturer: "李副教授", status: "active", enrollment: 350, updatedAt: "2024-03-25" },
  { id: "ENG301", name: "学术英语写作", department: "外国语学院", credits: 2, lecturer: "Dr. Smith", status: "draft", enrollment: 0, updatedAt: "2024-03-22" },
  { id: "PHY101", name: "普通物理", department: "物理系", credits: 4, lecturer: "张老师", status: "archived", enrollment: 85, updatedAt: "2024-03-15" },
  { id: "DS404", name: "数据结构与算法", department: "计算机学院", credits: 4, lecturer: "赵博", status: "active", enrollment: 115, updatedAt: "2024-03-30" },
];

const mockAnnouncements = [
  { id: 1, title: "关于2024年春季学期选课调整的通知", type: "教务事务", author: "教务处", date: "2024-04-01", status: "top" },
  { id: 2, title: "名师讲堂：人工智能在科研中的应用", type: "学术报告", author: "科研处", date: "2024-03-30", status: "published" },
  { id: 3, title: "2024届优秀毕业生评选方案公示", type: "学生工作", author: "学工部", date: "2024-03-28", status: "published" },
];

const mockCarousels = [
  { id: 1, title: "欢迎报考我校2024级研究生", image: "https://images.unsplash.com/photo-1523050335102-c3250908b309?auto=format&fit=crop&q=80&w=1000", link: "/admission", status: "active" },
  { id: 2, title: "百年校庆：传承卓越，开启未来", image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1000", link: "/anniversary", status: "active" },
];

export const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [search, setSearch] = useState("");

  const renderCourses = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">课程编号 & 名称</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">所属院系</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">学分</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">主讲教师</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">状态</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">选课人数</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {mockCourses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-5">
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 leading-none group-hover:text-[#B22234] transition-colors">{course.name}</p>
                  <p className="text-[10px] font-mono text-gray-400">{course.id}</p>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="text-sm font-semibold text-gray-600">{course.department}</span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-gray-900">{course.credits}</span>
                  <span className="text-[10px] font-bold text-gray-400">学分</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[#B22234]">
                    <GraduationCap size={14} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{course.lecturer}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-1.5">
                  {course.status === 'active' ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase">
                      <CheckCircle2 size={10} /> 已开课
                    </div>
                  ) : course.status === 'draft' ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase">
                      <Clock size={10} /> 待审
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100 text-[10px] font-black uppercase">
                      <AlertCircle size={10} /> 结课
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-1.5 text-sm font-black text-gray-700">
                  <Users size={14} className="text-gray-400" />
                  {course.enrollment}
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-[#B22234] border border-transparent hover:border-gray-100">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-rose-600 border border-transparent hover:border-gray-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="p-6 space-y-4">
      {mockAnnouncements.map((ann) => (
        <div key={ann.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ann.status === 'top' ? 'bg-[#B22234] text-white' : 'bg-gray-50 text-gray-400'}`}>
              <Bell size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 group-hover:text-[#B22234] transition-colors">{ann.title}</h3>
                {ann.status === 'top' && <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-black uppercase">置顶</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                <span className="text-[#B22234]">{ann.type}</span>
                <span>•</span>
                <span>发布人: {ann.author}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {ann.date}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Eye size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#B22234] transition-colors">
              <Edit2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCarousels = () => (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {mockCarousels.map((banner) => (
        <div key={banner.id} className="group relative aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-lg bg-[#B22234] text-white text-[10px] font-black uppercase tracking-widest">Active</span>
                <h3 className="text-lg font-black text-white">{banner.title}</h3>
                <p className="text-white/60 text-xs font-bold">{banner.link}</p>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button className="aspect-video rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#B22234] hover:text-[#B22234] transition-all bg-gray-50/50">
        <Plus size={32} />
        <span className="font-black text-sm uppercase tracking-widest">添加新轮播图</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="text-[#B22234]" size={20} />
            <span className="text-xs font-bold text-[#B22234] uppercase tracking-widest">四川师大一体化课程管理系统</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">内容中心</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
            <ExternalLink size={18} />
            预览门户
          </button>
          <button 
            onClick={() => toast.success("正在创建...")}
            className="bg-[#B22234] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#8B1A28] transition-all shadow-lg shadow-[#B22234]/20 flex items-center gap-2"
          >
            <Plus size={20} />
            {activeTab === 'courses' ? '新建课程' : activeTab === 'announcements' ? '发布公告' : '上传资源'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "courses" 
                  ? "bg-[#B22234] text-white shadow-lg shadow-[#B22234]/20" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BookOpen size={14} />
              课程配置
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "announcements" 
                  ? "bg-[#B22234] text-white shadow-lg shadow-[#B22234]/20" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Bell size={14} />
              通知公告
            </button>
            <button
              onClick={() => setActiveTab("carousel")}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "carousel" 
                  ? "bg-[#B22234] text-white shadow-lg shadow-[#B22234]/20" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ImageIcon size={14} />
              轮播图
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B22234] transition-colors" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索内容..."
                className="w-full bg-white border border-gray-200 focus:border-[#B22234] rounded-xl pl-10 pr-4 py-2 outline-none transition-all text-sm font-medium"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-[#B22234] border border-gray-100 rounded-xl hover:bg-white transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'carousel' && renderCarousels()}
        </div>

        <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">1-10</span> of <span className="text-gray-900">248</span> items
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-black text-gray-400 bg-white uppercase tracking-widest">Prev</button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-[#B22234] text-white text-xs font-black">1</button>
              <button className="w-8 h-8 rounded-lg text-gray-400 text-xs font-bold hover:bg-white border border-transparent hover:border-gray-100">2</button>
              <button className="w-8 h-8 rounded-lg text-gray-400 text-xs font-bold hover:bg-white border border-transparent hover:border-gray-100">3</button>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-black text-gray-700 bg-white uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
