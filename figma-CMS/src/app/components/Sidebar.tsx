import React from "react";
import { NavLink } from "react-router";
import { 
  LayoutDashboard, 
  Settings2, 
  FileText, 
  Users, 
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Link as LinkIcon,
  Globe,
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const SidebarItem = ({ to, icon, label, collapsed }: SidebarItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
        isActive 
          ? "bg-[#B22234]/5 text-[#B22234] font-bold" 
          : "text-gray-600 hover:bg-gray-100"
      }`
    }
  >
    <div className="flex-shrink-0">{icon}</div>
    <AnimatePresence mode="wait">
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="whitespace-nowrap text-sm"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </NavLink>
);

export const Sidebar = ({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) => {
  const menuItems = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "仪表盘" },
    { to: "/pages", icon: <Settings2 size={18} />, label: "页面配置" },
    { to: "/content", icon: <FileText size={18} />, label: "内容管理" },
    { to: "/auth", icon: <ShieldCheck size={18} />, label: "认证与用户" },
    { to: "/integration", icon: <LinkIcon size={18} />, label: "系统集成" },
    { to: "/logs", icon: <ClipboardList size={18} />, label: "日志管理" },
    { to: "/config", icon: <Globe size={18} />, label: "站点配置" },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 220 }}
      className="h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 transition-all duration-300 z-20"
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-50 h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-[#B22234] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#B22234]/20">
            <span className="text-white font-bold text-[10px]">EDU</span>
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg text-gray-800 whitespace-nowrap"
            >
              教学门户管理
            </motion.span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.to} 
            to={item.to} 
            icon={item.icon} 
            label={item.label} 
            collapsed={collapsed} 
          />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50 bg-gray-50/30">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-[#B22234] hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100 shadow-sm shadow-transparent hover:shadow-gray-200/50"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </motion.aside>
  );
};
