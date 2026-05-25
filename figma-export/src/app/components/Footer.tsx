import { Mail, Phone, MapPin, Globe, ShieldCheck, Landmark } from 'lucide-react';

const universityLinks = [
  { name: '教务处', url: '#' },
  { name: '研究生院', url: '#' },
  { name: '学生工作部', url: '#' },
  { name: '信息化建设处', url: '#' },
  { name: '图书馆', url: '#' },
  { name: '成龙校区', url: '#' },
  { name: '狮子山校区', url: '#' },
  { name: '师大校报', url: '#' }
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand/About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <h2 className="text-white text-xl font-black tracking-tighter uppercase">SICNU <span className="text-primary">LMS</span></h2>
            </div>
            <p className="text-sm leading-relaxed font-medium">
              四川师范大学一体化课程管理平台，致力于通过数字化手段，打破物理教学边界，构建高质量、公平且高效的学术生态圈。
            </p>
            <div className="flex gap-4">
              <div className="bg-gray-800 p-2 text-primary border border-gray-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">
                Academic Integrity<br />Verified Platform
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-10">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-8 border-l-2 border-primary pl-4">教学资源</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><a href="#" className="hover:text-primary transition duration-300">本专科教学</a></li>
              <li><a href="#" className="hover:text-primary transition duration-300">研究生教育</a></li>
              <li><a href="#" className="hover:text-primary transition duration-300">继续教育学院</a></li>
              <li><a href="#" className="hover:text-primary transition duration-300">留学生在线课程</a></li>
              <li><a href="#" className="hover:text-primary transition duration-300">慕课资源中心</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-8 border-l-2 border-primary pl-4">联系我们</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>四川省成都市龙泉驿区成龙大道二段1819号</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>教务热线: 028-12345678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>lms-support@sicnu.edu.cn</span>
              </li>
            </ul>
          </div>

          {/* Campus Map Placeholder / Logo */}
          <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 border border-gray-800 rounded-sm">
            <Landmark className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-center">
              Sichuan Normal University<br />Campus Information Center
            </p>
          </div>
        </div>
      </div>

      {/* University Links Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-widest">
            {universityLinks.map((link) => (
              <a key={link.name} href={link.url} className="hover:text-primary transition">
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
             <div className="w-px h-6 bg-gray-800 hidden md:block" />
             <p className="text-[10px] font-bold text-gray-600 tracking-tighter">
               PROUDLY POWERED BY SICNU INFORMATION CENTER © 2026
             </p>
          </div>
        </div>
      </div>

      {/* Final Legal Bar */}
      <div className="bg-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <p>© 2026 四川师范大学. 版权所有.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>蜀ICP备12345678号-1</span>
            <span>川公网安备 11010502012345号</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
