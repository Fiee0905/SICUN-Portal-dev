import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Settings, 
  Eye, 
  Trash2, 
  Copy,
  Layout,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const pages = [
  { id: 1, name: "首页", path: "/", status: "published", updatedAt: "2024-03-20", layout: "Landing" },
  { id: 2, name: "关于我们", path: "/about", status: "published", updatedAt: "2024-03-18", layout: "Content" },
  { id: 3, name: "服务中心", path: "/services", status: "draft", updatedAt: "2024-03-15", layout: "Grid" },
  { id: 4, name: "联系我们", path: "/contact", status: "published", updatedAt: "2024-03-10", layout: "Form" },
  { id: 5, name: "活动专题页", path: "/promo", status: "archived", updatedAt: "2024-02-28", layout: "Landing" },
];

export const PageConfig = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("desktop");

  const filteredPages = pages.filter(p => {
    if (activeTab === "all") return true;
    return p.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">页面配置</h1>
          <p className="mt-1 text-gray-500 font-medium">管理您的网站页面结构、布局和 SEO 设置。</p>
        </div>
        <button 
          onClick={() => toast.success("正在创建新页面...")}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          创建新页面
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Settings size={18} className="text-blue-500" />
              全局配置
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">默认布局</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option>响应式标准布局</option>
                  <option>全屏无边框</option>
                  <option>侧边栏导航</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">主色调</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'].map(color => (
                    <button 
                      key={color} 
                      className={`w-6 h-6 rounded-full border-2 border-white ring-1 ring-gray-200 hover:scale-110 transition-transform`} 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">SEO 基础后缀</label>
                <input type="text" placeholder="| Figma Make CMS" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 text-white space-y-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Globe size={120} />
            </div>
            <h3 className="font-bold text-lg">实时预览</h3>
            <p className="text-indigo-100 text-sm">所有更改都将实时同步到预览地址，您可以扫描二维码在移动端查看。</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode("desktop")}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'desktop' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <Monitor size={18} />
              </button>
              <button 
                onClick={() => setViewMode("tablet")}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'tablet' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <Tablet size={18} />
              </button>
              <button 
                onClick={() => setViewMode("mobile")}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'mobile' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <Smartphone size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4 bg-gray-100/50 p-1 rounded-xl w-fit">
            {['all', 'published', 'draft', 'archived'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === 'all' ? '全部页面' : tab === 'published' ? '已发布' : tab === 'draft' ? '草稿' : '已归档'}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">页面名称</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">路径</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">布局</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">更新时间</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {filteredPages.map((page) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={page.id} 
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Layout size={16} />
                          </div>
                          <span className="font-semibold text-gray-900">{page.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">{page.path}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">
                          {page.layout}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {page.status === 'published' ? (
                            <>
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span className="text-sm font-medium text-emerald-600">已上线</span>
                            </>
                          ) : page.status === 'draft' ? (
                            <>
                              <Clock size={14} className="text-amber-500" />
                              <span className="text-sm font-medium text-amber-600">草稿</span>
                            </>
                          ) : (
                            <span className="text-sm font-medium text-gray-400">已归档</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{page.updatedAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-white hover:text-blue-600 rounded-lg transition-colors text-gray-400" title="预览">
                            <Eye size={16} />
                          </button>
                          <button className="p-1.5 hover:bg-white hover:text-blue-600 rounded-lg transition-colors text-gray-400" title="编辑">
                            <Settings size={16} />
                          </button>
                          <button className="p-1.5 hover:bg-white hover:text-rose-600 rounded-lg transition-colors text-gray-400" title="删除">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
