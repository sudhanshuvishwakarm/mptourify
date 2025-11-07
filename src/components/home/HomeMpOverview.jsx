'use client';

import { Calendar, Landmark, Palette, Leaf } from 'lucide-react';

export default function HomeMpOverview() {
  const colors = {
    saffron: '#F3902C',
    green: '#339966',
    skyBlue: '#33CCFF',
    white: '#FFFFFF',
    bgColor: '#FFF7EB',
    darkGray: '#333333',
    lightGray: '#F5F5F5'
  };

  const overviewCards = [
    {
      icon: Calendar,
      title: 'State Formation',
      color: colors.saffron,
      highlight: '1 November, 1956',
      description: 'Madhya Pradesh was formed after Indian independence, created from the Central Provinces and Berar, becoming a beacon of cultural continuity and progress.'
    },
    {
      icon: Landmark,
      title: 'Historical Significance',
      color: colors.green,
      items: [
        '🏛️ Sanchi Stupa - UNESCO World Heritage',
        '⛩️ Khajuraho Temples - Architectural Marvel',
        '🎨 Bhimbetka Caves - 30,000-year History',
        '🏰 Mandu Fort - Medieval Kingdom'
      ]
    },
    {
      icon: Palette,
      title: 'Art & Handicraft',
      color: colors.skyBlue,
      description: 'Renowned for traditional craftsmanship including Chanderi Silk Weaving, Banjara Embroidery, Stone Carvings, Pottery, and Tribal Art forms that reflect centuries of cultural heritage.'
    }
  ];

  const naturalBeautyItems = [
    { icon: '🌊', title: 'Rivers', desc: 'Narmada, Tapti, Betwa, Godavari' },
    { icon: '🌲', title: 'Forests', desc: 'Dense tiger reserves and wildlife sanctuaries' },
    { icon: '💧', title: 'Waterfalls', desc: 'Dhuandhar, Chitrakoot, Bee Falls' },
    { icon: '⛰️', title: 'Mountains', desc: 'Vindhya & Satpura Ranges' }
  ];

  const stats = [
    { number: '308,245', label: 'Area (km²)', icon: '📍' },
    { number: '72.6M', label: 'Population', icon: '👥' },
    { number: '4', label: 'UNESCO Sites', icon: '🏆' },
    { number: '6', label: 'Tiger Reserves', icon: '🐯' }
  ];

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-8" style={{ backgroundColor: colors.bgColor }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-bold px-4 py-2 rounded-full inline-block mb-4" style={{
            backgroundColor: `${colors.green}20`,
            color: colors.green
          }}>
            Madhya Pradesh Overview
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: colors.darkGray }}>
            The <span style={{ color: colors.saffron }}>Heart</span> of India
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.darkGray, opacity: 0.8 }}>
            Discover the unique blend of history, culture, and natural beauty that defines Madhya Pradesh
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {overviewCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                style={{ backgroundColor: colors.white }}
              >
                <div className="mb-6">
                  <IconComponent size={40} style={{ color: card.color }} />
                </div>
                <h3 className="text-2xl font-black mb-4" style={{ color: colors.darkGray }}>
                  {card.title}
                </h3>
                {card.highlight && (
                  <p className="mb-4" style={{ color: colors.darkGray, opacity: 0.8 }}>
                    <span className="font-bold" style={{ color: card.color }}>{card.highlight}</span>
                  </p>
                )}
                {card.description && (
                  <p style={{ color: colors.darkGray }}>
                    {card.description}
                  </p>
                )}
                {card.items && (
                  <ul className="space-y-2" style={{ color: colors.darkGray }}>
                    {card.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Natural Beauty Section */}
        <div className="p-12 rounded-2xl" style={{ backgroundColor: colors.white }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Leaf size={32} style={{ color: colors.green }} />
                <h3 className="text-3xl font-black" style={{ color: colors.darkGray }}>
                  Natural Beauty
                </h3>
              </div>
              <p className="text-lg leading-relaxed mb-6" style={{ color: colors.darkGray }}>
                Madhya Pradesh is blessed with diverse landscapes, from the Vindhya and Satpura mountain ranges to the lush forests and pristine waterfalls.
              </p>
              <div className="space-y-3">
                {naturalBeautyItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-bold" style={{ color: colors.darkGray }}>{item.title}</p>
                      <p className="text-sm" style={{ color: colors.darkGray, opacity: 0.7 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-xl text-center transform transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: idx % 2 === 0 ? `${colors.saffron}15` : `${colors.green}15` }}
                >
                  <p className="text-3xl mb-2">{stat.icon}</p>
                  <p className="text-2xl font-black mb-2" style={{ color: colors.darkGray }}>
                    {stat.number}
                  </p>
                  <p className="text-xs font-bold" style={{ color: colors.green }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}