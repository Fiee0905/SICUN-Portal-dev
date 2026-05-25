import { Search, Bell, User, Menu, Globe, Phone, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-6">
            <a href="https://www.sicnu.edu.cn" target="_blank" className="hover:text-primary transition flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-primary" />
              四川师范大学官网
            </a>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-primary" />
              教务咨询: 028-12345678
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition">数字化校园</a>
            <a href="#" className="hover:text-primary transition">图书馆</a>
            <a href="#" className="hover:text-primary transition">邮箱系统</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm group-hover:rotate-6 transition-transform duration-500">
                  <span className="text-white font-black text-xl">S</span>
                </div>
                <div>
                  <h1 className="text-lg font-black text-gray-900 tracking-tighter leading-none">四川师大 <span className="text-primary">一体化课程平台</span></h1>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-[0.2em] uppercase">
                    Integrated Course Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden xl:flex items-center space-x-2">
              {[
                { name: '首页', path: '/' },
                { name: '课程中心', path: '/courses' },
                { name: '个人中心', path: '/profile' },
                { name: '名师风采', path: '#' },
                { name: '教务办公', path: '#' },
              ].map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={`px-4 py-2 text-sm font-bold transition-all duration-300 relative group cursor-pointer ${
                    isActive(item.path) ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-primary transition-all duration-300 ${isActive(item.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </Link>
              ))}
            </nav>

            {/* Search and User Actions */}
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex relative group">
                <input
                  type="text"
                  placeholder="搜索课程、教师、资源..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 xl:w-64 pl-4 pr-10 py-2 bg-gray-50 border border-gray-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all duration-300"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>

              <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
                <button className="relative p-2 text-gray-500 hover:text-primary transition-colors cursor-pointer">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
                </button>
                <Link to="/profile" className="flex items-center gap-3 p-1.5 hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <User className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] font-bold text-gray-400 leading-none">STUDENT</p>
                    <p className="text-xs font-bold text-gray-900 mt-1">陈小明</p>
                  </div>
                </Link>
                <button className="xl:hidden p-2 text-gray-500 hover:text-primary transition-colors">
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
