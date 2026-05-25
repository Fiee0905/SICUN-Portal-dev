import React, { useState } from "react";
import { 
  ClipboardList, 
  Search, 
  Download, 
  Filter, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Clock,
  User,
  ExternalLink,
  ShieldAlert,
  Server,
  Database,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const mockLogs = [
  { id: 1, type: "info", module: "用户管理", content: "管理员 admin@example.com 修改了用户 '张三' 的权限", ip: "192.168.1.1", date: "2024-03-25 10:45:22" },
  { id: 2, type: "success", module: "页面配置", content: "首页 '/' 成功发布上线", ip: "192.168.1.5", date: "2024-03-25 10:30:15" },
  { id: 3, type: "warning", module: "安全日志", content: "检测到来自 103.52.23.1 的异地登录尝试", ip: "103.52.23.1", date: "2024-03-25 09:12:44" },
  { id: 4, type: "error", module: "系统核心", content: "数据库自动备份任务失败，请检查存储空间", ip: "localhost", date: "2024-03-25 08:00:00" },
  { id: 5, type: "info", module: "内容管理", content: "编辑 李四 创建了新文章 '2024趋势展望'", ip: "192.168.1.12", date: "2024-03-24 17:55:10" },
  { id: 6, type: "info", module: "用户管理", content: "新用户 '王五' 注册成功", ip: "112.42.12.56", date: "2024-03-24 16:20:30" },
  { id: 7, type: "success", module: "系统更新", content: "系统版本已更新至 v2.5.0", ip: "localhost", date: "2024-03-24 10:00:00" },
  { id: 8, type: "error", module: "API网关", content: "三方支付接口返回 502 网关错误", ip: "47.92.12.24", date: "2024-03-24 09:15:22" },
];

const LogTypeBadge = ({ type }: { type: string }) => {
  const configs: any = {
    info: { icon: Info, color: "text-blue-600 bg-blue-50 border-blue-100", label: "信息" },
    success: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100", label: "成功" },
    warning: { icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-100", label: "告警" },
    error: { icon: ShieldAlert, color: "text-rose-600 bg-rose-50 border-rose-100", label: "错误" },
  };
  const { icon: Icon, color, label } = configs[type] || configs.info;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${color}`}>
      <Icon size={12} />
      {label}
    </div>
  );
};

export const LogManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.content.includes(search) || log.module.includes(search);
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && log.type === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">日志管理</h1>
          <p className="mt-1 text-gray-500 font-medium">系统运行轨迹记录，用于审计、排错及安全分析。</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("日志已导出至 CSV")}
            className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Download size={18} />
            导出日志
          </button>
          <button className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2.5 rounded-xl font-bold hover:bg-rose-100 transition-all flex items-center gap-2">
            <Trash2 size={18} />
            清空日志
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-2xl text-white space-y-2 shadow-xl shadow-blue-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Server className="opacity-80" size={24} />
            <span className="font-bold text-lg">系统状态</span>
          </div>
          <p className="text-3xl font-bold tracking-tight">正常</p>
          <p className="text-blue-100 text-sm font-medium">连续运行: 125天 14小时</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center gap-3 text-emerald-600 mb-2 font-bold">
            <Database size={24} />
            <span>存储使用</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">42.8 GB</p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[45%]" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center gap-3 text-indigo-600 mb-2 font-bold">
            <Globe size={24} />
            <span>网络出口</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">1.2 Gbps</p>
          <p className="text-gray-400 text-sm font-medium">当前活跃连接: 4,892</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200">
            {['all', 'info', 'success', 'warning', 'error'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === 'all' ? '全部' : tab === 'info' ? '信息' : tab === 'success' ? '成功' : tab === 'warning' ? '告警' : '错误'}
              </button>
            ))}
          </div>
          <div className="relative group max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索日志内容或模块..."
              className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-lg pl-10 pr-4 py-2 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">级别</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">业务模块</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">日志详情</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">操作 IP</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">记录时间</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredLogs.map((log) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={log.id} 
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <LogTypeBadge type={log.type} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-700">{log.module}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-600 line-clamp-1 group-hover:line-clamp-none transition-all">{log.content}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-mono text-gray-500">
                        <Globe size={12} className="text-gray-300" />
                        {log.ip}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock size={12} />
                        {log.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
