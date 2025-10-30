'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Landmark, Leaf, Palette, Calendar, Globe } from 'lucide-react';

export default function HomeHero() {
  const h = useTranslations('HomePage');
  const t = useTranslations('Navigation');
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

  const handleExplore = () => {
    router.push('/mera-pradesh');
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: colors.bgColor }}>

      <section className="w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(45deg, ${colors.saffron} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${colors.saffron}15 0%, ${colors.green}15 100%)`
        }} />

        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 md:px-8 py-16">
          <div className="max-w-6xl mx-auto text-center">
            {/* Top Badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-6 py-3 rounded-full border-2" style={{ 
              borderColor: colors.saffron,
              backgroundColor: `${colors.saffron}15`
            }}>
              <span style={{ color: colors.saffron }}>🏛️</span>
              <span className="text-sm font-bold" style={{ color: colors.saffron }}>
                Dedicated to MP Tourism Department
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span style={{ color: colors.saffron }}>MP</span>
              <span style={{ color: colors.green }}> TOURIFY</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-8 leading-relaxed max-w-4xl mx-auto" style={{ color: colors.darkGray }}>
              Discover Every <span className="font-bold" style={{ color: colors.saffron }}>Gram</span> of Madhya Pradesh
            </p>

            {/* Description */}
            <p className="text-base md:text-lg mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: colors.darkGray, opacity: 0.85 }}>
              Experience the digital transformation of Madhya Pradesh tourism. Explore every district, village, and heritage site through an immersive journey of culture, history, and natural beauty.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={handleExplore}
                className="px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
                style={{ backgroundColor: colors.saffron }}
              >
                Explore Our State
                <ArrowRight size={24} />
              </button>
              <button
                className="px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
                style={{ 
                  color: colors.saffron,
                  borderWidth: '2px',
                  borderColor: colors.saffron,
                  backgroundColor: 'transparent'
                }}
              >
                Learn More
                <Globe size={24} />
              </button>
            </div>

            {/* Hero Stats */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { number: '52', label: 'Districts' },
                { number: '23K+', label: 'Panchayats' },
                { number: '100+', label: 'Heritage Sites' },
                { number: '∞', label: 'Stories' }
              ].map((stat, idx) => (
                <div key={idx} className="p-4 rounded-lg backdrop-blur-sm" style={{ backgroundColor: `${colors.white}80` }}>
                  <p className="text-2xl md:text-3xl font-black mb-2" style={{ color: colors.saffron }}>
                    {stat.number}
                  </p>
                  <p className="text-xs md:text-sm font-bold" style={{ color: colors.green }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div> */}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-bold" style={{ color: colors.saffron }}>Scroll to explore</p>
              <svg className="w-6 h-6" style={{ color: colors.saffron }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}