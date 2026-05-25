import React from "react";
import { 
  Users, 
  BookOpen, 
  MousePointer2, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileEdit,
  GraduationCap,
  History,
  ShieldCheck,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { motion } from "motion/react";
import { toast } from "sonner";

const data = [
  { name: '03-28', views: 4200, users: 2400 },
  { name: '03-29', views: 3800, users: 1398 },
  { name: '03-30', views: 2500, users: 9800 },
  { name: '03-31', views: 3200, users: 3908 },
  { name: '04-01', views: 5100, users: 4800 },
  { name: '04-02', views: 4800, users: 3800 },
  { name: '04-03', views: 6300, users: 4300 },
];

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl bg-[${color}]/10`}>
        <Icon className={`w-6 h-6 text-[${color}]`} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const activities = [
  { desc: "系统发布了《高等数学》课程更新通知", time: "10:24", color: "text-blue-500" },
  { desc: "管理员 admin 修改了用户认证权限", time: "09:15", color: "text-[#B22234]" },
  { desc: "三号教学楼课程直播信号测试完成", time: "08:30", color: "text-emerald-500" },
  { desc: "系统自动同步了选课数据(共5,492条)", time: "昨天", color: "text-gray-400" },
  { desc: "数据库备份任务执行成功", time: "昨天", color: "text-gray-400" }
];

const pendingCourses = [
  { id: 1, name: "高级人工智能导论", author: "王宏志", status: "待审核", time: "2024-04-03" },
  { id: 2, name: "微积分基础理论", author: "李芳", status: "审核中", time: "2024-04-02" },
  { id: 3, name: "大学英语(四)口语课", author: "赵丽华", status: "待审核", time: "2024-04-02" },
  { id: 4, name: "程序设计实践(Java)", author: "陈明", status: "驳回", time: "2024-03-31" }
];

export const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="text-[#B22234]" size={20} />
            <span className="text-xs font-bold text-[#B22234] uppercase tracking-widest">四川师大一体化课程管理</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">教学门户仪表盘</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-[#B22234] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#8B1A28] transition-all shadow-lg shadow-[#B22234]/20 flex items-center gap-2">
            <BookOpen size={18} />
            发布新课程
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="门户总 PV" value="284,392" change="+8.2%" trend="up" icon={Eye} color="#B22234" />
        <StatCard title="在线课程总数" value="1,248" change="+3.5%" trend="up" icon={BookOpen} color="#B22234" />
        <StatCard title="日活跃用户(DAU)" value="42,890" change="-1.2%" trend="down" icon={Users} color="#B22234" />
        <StatCard title="选课转化率" value="12.4%" change="+2.1%" trend="up" icon={MousePointer2} color="#B22234" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-[#B22234]" size={20} />
              流量访问趋势 (最近 7 天)
            </h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B22234" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#B22234" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#B22234' }}
                />
                <Area type="monotone" dataKey="views" stroke="#B22234" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <History className="text-[#B22234]" size={20} />
            最近活动日志
          </h2>
          <div className="flex-1 space-y-6">
            {activities.map((activity, i) => (
              <div key={i} className="flex justify-between items-start gap-4 pb-4 border-b border-gray-50 last:border-0">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B22234] mt-1.5 flex-shrink-0" />
                  <p className="text-sm font-bold text-gray-700 leading-snug">{activity.desc}</p>
                </div>
                <span className="text-[10px] font-black text-gray-400 whitespace-nowrap mt-1">{activity.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-2.5 rounded-xl border border-gray-100 text-xs font-black text-gray-500 hover:bg-gray-50 hover:text-[#B22234] transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
            查看完整日志
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Clock className="text-[#B22234]" size={20} />
            待审核课程列表
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#B22234] cursor-pointer hover:underline">
            批量审核
            <CheckCircle2 size={14} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">课程名称</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">提交教师</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">当前状态</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">提交日期</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pendingCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-bold text-gray-900 group-hover:text-[#B22234] transition-colors">{course.name}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600">{course.author}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      course.status === '待审核' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      course.status === '审核中' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-400">{course.time}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toast.success("进入审核视图")}
                        className="p-2 hover:bg-white hover:text-[#B22234] rounded-lg transition-all text-gray-400 border border-transparent hover:border-gray-100"
                      >
                        <FileEdit size={16} />
                      </button>
                      <button className="p-2 hover:bg-white hover:text-blue-600 rounded-lg transition-all text-gray-400 border border-transparent hover:border-gray-100">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
