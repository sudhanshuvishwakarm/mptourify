'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function HomeNavigationTiles() {
  const router = useRouter();

  const colors = {
    saffron: '#F3902C',
    green: '#339966',
    skyBlue: '#33CCFF',
    white: '#FFFFFF',
    bgColor: '#FFF7EB',
    darkGray: '#333333',
    lightGray: '#F5F5F5'
  };

  const tiles = [
    { 
      title: 'Mera Pradesh Mera Jila', 
      icon: '🗺️', 
      href: '/districts', 
      desc: 'Explore All Districts',
      color: colors.saffron
    },
    { 
      title: 'Hamari Panchayatein', 
      icon: '🏘️', 
      href: '/panchayats', 
      desc: 'Village Information',
      color: colors.green
    },
    { 
      title: 'Photo Gallery', 
      icon: '📸', 
      href: '/gallery', 
      desc: 'Visual Stories',
      color: colors.skyBlue
    },
    { 
      title: 'News & Updates', 
      icon: '📰', 
      href: '/news', 
      desc: 'Latest Updates',
      color: colors.saffron
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-8" style={{ backgroundColor: colors.white }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: colors.darkGray }}>
            Quick <span style={{ color: colors.saffron }}>Navigation</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.darkGray, opacity: 0.8 }}>
            Start exploring Madhya Pradesh with just one click
          </p>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiles.map((tile, idx) => (
            <div
              key={idx}
              onClick={() => router.push(tile.href)}
              className="group p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden relative"
              style={{ backgroundColor: colors.lightGray }}
            >
              {/* Background Accent */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-300"
                style={{ backgroundColor: tile.color, transform: 'translate(30%, -30%)' }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                  {tile.icon}
                </div>
                
                <h3 className="text-xl font-black mb-2" style={{ color: colors.darkGray }}>
                  {tile.title}
                </h3>
                
                <p className="text-sm mb-4 font-medium" style={{ color: tile.color }}>
                  {tile.desc}
                </p>

                <div className="flex items-center gap-2 font-bold opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300" style={{ color: tile.color }}>
                  <span>Explore</span>
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Bottom Border */}
              <div 
                className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: tile.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}