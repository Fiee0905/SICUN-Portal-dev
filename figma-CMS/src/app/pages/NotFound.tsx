import React from "react";
import { Link } from "react-router";
import { Home, AlertTriangle } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] space-y-6">
      <div className="p-6 rounded-3xl bg-amber-50 text-amber-500 ring-8 ring-amber-50/50">
        <AlertTriangle size={64} strokeWidth={1.5} />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">页面未找到</h1>
        <p className="text-gray-500 font-medium">抱歉，您访问的页面不存在或已被移除。</p>
      </div>
      <Link 
        to="/" 
        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 group"
      >
        <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
        返回控制台
      </Link>
    </div>
  );
};
