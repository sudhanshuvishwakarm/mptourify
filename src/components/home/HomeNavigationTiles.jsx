'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function HomeNavigationTiles() {
  const router = useRouter();

  const colors = {
    primary: '#117307',
    background: '#f5fbf2'
  };

  const tiles = [
    { 
      title: 'Mera Pradesh Mera Jila', 
      icon: '🗺️', 
      href: '/districts', 
      desc: 'Explore All Districts',
    },
    { 
      title: 'Hamari Panchayatein', 
      icon: '🏘️', 
      href: '/panchayats', 
      desc: 'Village Information',
    },
    { 
      title: 'Photo Gallery', 
      icon: '📸', 
      href: '/gallery', 
      desc: 'Visual Stories',
    },
    { 
      title: 'News & Updates', 
      icon: '📰', 
      href: '/news', 
      desc: 'Latest Updates',
    }
  ];

  return (
     <div style={{ backgroundColor: colors.background }} className="w-full relative pb-24">
      <div className="relative">
        <Image
          src="/images/hhhh.png"
          alt="Madhya Pradesh Tourism"
          width={1920}
          height={1080}
          className="w-full h-auto"
          style={{
            objectFit: "contain",
            objectPosition: "center",
          }}
          quality={100}
          priority
        />
      </div>

      <div className="relative -top-5">
        <div className="bg-[#117307] pb-32 lg:pb-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
            

            <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-white font-bold mb-6" >
            MP Tourify Navigation
          </h2>
          <p className="text-lg max-w-2xl text-white mx-auto" >
            Discover the heart of India - Madhya Pradesh
          </p>
        </div>
              
            </div>
          </div>
        </div>

        {/* Light Background Section */}
        <div style={{ backgroundColor: colors.background }} className="pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -top-32 lg:-top-40">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
                {tiles.map((tile, idx) => (
            <div
              key={idx}
              onClick={() => router.push(tile.href)}
              className="group p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden relative"
              style={{ backgroundColor: 'white' }}
            >
              {/* Background Accent */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-300"
                style={{ backgroundColor: colors.primary, transform: 'translate(30%, -30%)' }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                  {tile.icon}
                </div>
                
                <h3 className="text-xl font-black mb-2" style={{ color: '#333333' }}>
                  {tile.title}
                </h3>
                
                <p className="text-sm mb-4 font-medium" style={{ color: colors.primary }}>
                  {tile.desc}
                </p>

                <div className="flex items-center gap-2 font-bold opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300" style={{ color: colors.primary }}>
                  <span>Explore</span>
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Bottom Border */}
              <div 
                className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: colors.primary }}
              />
            </div>
          ))}
              </div>
              {/* Call to Action */}
              <div className="text-center">
                <button 
                  className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                >
                  Explore More Destinations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center z-10">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="md:py-20 p-4 rounded-t-lg shadow-lg"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-3 md:mb-0">
                <h3 className="text-lg font-semibold">Ready to explore Madhya Pradesh?</h3>
                <p className="text-sm">Plan your trip and discover incredible destinations</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="px-6 py-2 rounded-full font-medium text-sm transition-all"
                  style={{ backgroundColor: 'white', color: colors.primary }}
                >
                  Plan Your Trip
                </button>
                <button 
                  className="border border-white px-6 py-2 rounded-full font-medium text-sm hover:bg-white transition-all"
                  style={{ color: 'white', hoverColor: colors.primary }}
                >
                  Get Travel Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    // <section className="w-full py-16 md:py-24 px-4 md:px-8" style={{ backgroundColor: colors.bgColor }}>
    //   <div className="max-w-6xl mx-auto">
    //     {/* Header */}
       

    //     {/* Tiles Grid */}
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       
    //     </div>
    //   </div>
    // </section>