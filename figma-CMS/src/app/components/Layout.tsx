import React, { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Search, Bell, User, GraduationCap, Settings, HelpCircle } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-16 border-b border-gray-100 bg-white sticky top-0 z-10 px-6 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B22234] transition-colors" size={16} />
          <input
            type="text"
            placeholder="搜索教学资源、课程或用户..."
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#B22234]/20 focus:ring-1 focus:ring-[#B22234]/10 rounded-xl pl-10 pr-4 py-2 outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <button className="p-2 text-gray-400 hover:text-[#B22234] hover:bg-[#B22234]/5 rounded-xl transition-all relative">
          <HelpCircle size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-[#B22234] hover:bg-[#B22234]/5 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#B22234] rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-100 mx-1"></div>
        <div className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors">
          <div className="w-9 h-9 bg-gradient-to-br from-[#B22234] to-[#8B1A28] rounded-xl flex items-center justify-center text-white font-bold ring-4 ring-white shadow-sm shadow-[#B22234]/20">
            <span className="text-sm">教</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-black text-gray-800 leading-tight">教务管理员</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-tight">Admin Portal</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] text-gray-900 font-sans selection:bg-[#B22234]/10 selection:text-[#B22234]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
