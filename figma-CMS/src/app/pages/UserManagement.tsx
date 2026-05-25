import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Shield, 
  Mail, 
  Calendar, 
  Lock, 
  Unlock,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const mockUsers = [
  { id: 1, name: "张小明", email: "zhang@example.com", role: "管理员", status: "active", lastLogin: "2024-03-25 10:30", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80" },
  { id: 2, name: "李丽娜", email: "li@example.com", role: "编辑", status: "active", lastLogin: "2024-03-24 15:45", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80" },
  { id: 3, name: "王建国", email: "wang@example.com", role: "作者", status: "inactive", lastLogin: "2024-03-20 09:15", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80" },
  { id: 4, name: "赵静", email: "zhao@example.com", role: "编辑", status: "active", lastLogin: "2024-03-25 08:20", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80" },
  { id: 5, name: "陈思源", email: "chen@example.com", role: "管理员", status: "pending", lastLogin: "-", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80" },
];

const RoleBadge = ({ role }: { role: string }) => {
  const colors: any = {
    '管理员': 'text-purple-600 bg-purple-50',
    '编辑': 'text-blue-600 bg-blue-50',
    '作者': 'text-emerald-600 bg-emerald-50',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[role] || 'text-gray-600 bg-gray-50'}`}>
      {role}
    </span>
  );
};

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.includes(search) || user.email.includes(search);
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && user.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">用户管理</h1>
          <p className="mt-1 text-gray-500 font-medium">配置团队成员、权限分配及账号安全设置。</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
            <Shield size={18} />
            角色与权限
          </button>
          <button 
            onClick={() => toast.success("正在添加成员...")}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            <Plus size={20} />
            添加成员
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-gray-100/50 p-1 rounded-xl w-fit">
            {['all', 'active', 'inactive', 'pending'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === 'all' ? '全部' : tab === 'active' ? '正常' : tab === 'inactive' ? '禁用' : '待激活'}
              </button>
            ))}
          </div>
          <div className="relative group max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索姓名或邮箱..."
              className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg pl-10 pr-4 py-2 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gray-50/30">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={user.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-5">
                  <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-50" />
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-b border-gray-50 mb-5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">角色</p>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">状态</p>
                    <div className="flex items-center justify-end gap-1.5">
                      {user.status === 'active' ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : user.status === 'inactive' ? (
                        <XCircle size={14} className="text-rose-500" />
                      ) : (
                        <Clock size={14} className="text-amber-500" />
                      )}
                      <span className={`text-xs font-semibold ${
                        user.status === 'active' ? 'text-emerald-600' :
                        user.status === 'inactive' ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {user.status === 'active' ? '正常' : user.status === 'inactive' ? '已禁用' : '等待激活'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-5">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    最后登录
                  </div>
                  <span className="font-medium text-gray-600">{user.lastLogin}</span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-gray-50 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 border border-gray-100">
                    <Edit2 size={14} />
                    编辑资料
                  </button>
                  <button 
                    onClick={() => toast.info(`${user.status === 'active' ? '禁用' : '激活'}用户: ${user.name}`)}
                    className={`p-2 rounded-xl transition-colors border border-transparent ${
                      user.status === 'active' 
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-200' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200'
                    }`}
                  >
                    {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                  <button className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 border border-gray-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
