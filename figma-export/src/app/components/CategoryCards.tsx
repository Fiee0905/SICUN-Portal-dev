import { Code, Book, Palette, Globe, FlaskConical, Calculator, Users, Cpu, GraduationCap, Building2 } from 'lucide-react';

const colleges = [
  { id: 1, name: '计算机科学学院', icon: Cpu, count: 128 },
  { id: 2, name: '数学科学学院', icon: Calculator, count: 96 },
  { id: 3, name: '文学院', icon: Book, count: 85 },
  { id: 4, name: '外国语学院', icon: Globe, count: 72 },
  { id: 5, name: '物理与电子工程学院', icon: FlaskConical, count: 54 },
  { id: 6, name: '美术学院', icon: Palette, count: 48 },
  { id: 7, name: '教育科学学院', icon: GraduationCap, count: 63 },
  { id: 8, name: '商学院', icon: Building2, count: 91 }
];

export function CategoryCards() {
  return (
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">开课单位</h2>
            <p className="text-gray-500 font-medium tracking-wide">汇聚师大 20 余个学院的优质教育资源</p>
          </div>
          <button className="text-sm font-bold text-primary hover:underline cursor-pointer">查看所有学院</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {colleges.map((college) => {
            const IconComponent = college.icon;
            return (
              <div
                key={college.id}
                className="bg-white p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-b-2 border-transparent hover:border-primary shadow-sm"
              >
                <div className="bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 mx-auto">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{college.name}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{college.count} 门在线课程</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
