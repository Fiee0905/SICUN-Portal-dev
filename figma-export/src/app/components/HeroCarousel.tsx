import { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const carouselImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1675095904077-600d903942da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwdW5pdmVyc2l0eSUyMGNhbXB1cyUyMGxpYnJhcnklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzUxODkwODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '四川师范大学一体化课程平台',
    subtitle: '博大精深、为人师表，构建高水平数字化教育体系'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1758270704262-ecc82b23dc37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2FkZW1pYyUyMGxlY3R1cmUlMjBoYWxsJTIwcHJvZmVzc29yfGVufDF8fHx8MTc3NTE4OTA5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: '学术创新与名师引领',
    subtitle: '汇聚校内顶尖学术资源，打造精品示范课程'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1766297248027-864589dbd336?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc2NpZW5jZSUyMHJlc2VhcmNoJTIwbGFifGVufDF8fHx8MTc3NTE4OTA5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: '科研反哺教学',
    subtitle: '将前沿科研成果转化为优质教学内容'
  }
];

function CustomPrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-8 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-primary text-white rounded-full p-3 shadow-lg transition duration-300 backdrop-blur-sm"
    >
      <ChevronLeft className="w-8 h-8" />
    </button>
  );
}

function CustomNextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-8 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-primary text-white rounded-full p-3 shadow-lg transition duration-300 backdrop-blur-sm"
    >
      <ChevronRight className="w-8 h-8" />
    </button>
  );
}

export function HeroCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    customPaging: () => (
      <div className="w-4 h-1 bg-white/40 hover:bg-white transition-all duration-300 rounded-full" />
    ),
    dotsClass: "slick-dots !bottom-8"
  };

  return (
    <div className="relative overflow-hidden group">
      <Slider {...settings}>
        {carouselImages.map((item) => (
          <div key={item.id} className="relative outline-none">
            <div className="relative h-[480px] md:h-[600px]">
              <ImageWithFallback
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition duration-[10000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl">
                    <span className="inline-block px-4 py-1.5 bg-primary text-white text-sm font-medium mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
                      Sichuan Normal University
                    </span>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-in fade-in slide-in-from-left-8 duration-1000">
                      {item.title}
                    </h2>
                    <p className="text-xl text-gray-100 mb-10 leading-relaxed animate-in fade-in slide-in-from-left-12 duration-1200 max-w-xl">
                      {item.subtitle}
                    </p>
                    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1500">
                      <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 font-medium transition duration-300 shadow-xl cursor-pointer">
                        进入课程中心
                      </button>
                      <button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md px-10 py-4 font-medium transition duration-300 cursor-pointer">
                        了解名师风采
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
