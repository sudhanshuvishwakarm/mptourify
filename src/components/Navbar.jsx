'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, User, MapPin, ChevronDown } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('states');

  const navLinks = [
    { label: t('Navigation.home'), href: '/', icon: null },
    { label: t('Navigation.explore'), href: '/destination', icon: MapPin, hasSubmenu: true },
    { label: t('Navigation.experiences'), href: '/experiences', icon: null },
    { label: t('Navigation.planTrip'), href: '/plan-trip', icon: null },
    { label: t('Navigation.blogs'), href: '/blogs', icon: null },
  ];

  const statesData = {
    en: {
      north: ['Chandigarh', 'Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Ladakh', 'Punjab'],
      northeast: ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim'],
      east: ['Andaman and Nicobar Islands', 'Bihar', 'Jharkhand', 'Odisha', 'West Bengal'],
      central: ['Chhattisgarh', 'Madhya Pradesh'],
      west: ['Dadra and Nagar Haveli and Daman and Diu', 'Goa', 'Gujarat', 'Maharashtra'],
      south: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Lakshadweep', 'Puducherry', 'Tamil Nadu', 'Telangana']
    },
    hi: {
      north: ['चंडीगढ़', 'दिल्ली', 'हरियाणा', 'हिमाचल प्रदेश', 'जम्मू और कश्मीर', 'लद्दाख', 'पंजाब'],
      northeast: ['अरुणाचल प्रदेश', 'असम', 'मणिपुर', 'मेघालय', 'मिजोरम', 'नागालैंड', 'सिक्किम'],
      east: ['अंडमान और निकोबार द्वीप', 'बिहार', 'झारखंड', 'ओडिशा', 'पश्चिम बंगाल'],
      central: ['छत्तीसगढ़', 'मध्य प्रदेश'],
      west: ['दादरा और नगर हवेली और दमन और दीव', 'गोवा', 'गुजरात', 'महाराष्ट्र'],
      south: ['आंध्र प्रदेश', 'कर्नाटक', 'केरल', 'लक्षद्वीप', 'पुडुचेरी', 'तमिलनाडु', 'तेलंगाना']
    }
  };

  const locale = t('Dropdown.statesAndUTs') === 'States and UTs' ? 'en' : 'hi';

  const regions = [
    {
      slug: 'north',
      name: t('RegionNames.north'),
      states: statesData[locale].north
    },
    {
      slug: 'northeast',
      name: t('RegionNames.northeast'),
      states: statesData[locale].northeast
    },
    {
      slug: 'east',
      name: t('RegionNames.east'),
      states: statesData[locale].east
    },
    {
      slug: 'central',
      name: t('RegionNames.central'),
      states: statesData[locale].central
    },
    {
      slug: 'west',
      name: t('RegionNames.west'),
      states: statesData[locale].west
    },
    {
      slug: 'south',
      name: t('RegionNames.south'),
      states: statesData[locale].south
    }
  ];

  const handleNavigation = (href) => {
    router.push(href);
    setIsMenuOpen(false);
    setIsDestinationOpen(false);
  };

  const handleRegionClick = (slug) => {
    router.push(`/destination/${slug}`);
    setIsDestinationOpen(false);
    setIsMenuOpen(false);
  };

  const toggleDestination = () => {
    setIsDestinationOpen(!isDestinationOpen);
  };

  return (
    <nav 
      className="w-full shadow-md sticky top-0 z-50"
      style={{ backgroundColor: '#FFF5F4' }}
    >
      <div className="mx-auto px-4 md:px-8 lg:px-16">
        {/* Desktop Navbar */}
        <div className="hidden lg:flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: '#015E6C' }}
            onClick={() => handleNavigation('/')}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
              style={{ backgroundColor: '#015E6C' }}
            >
              MP
            </div>
            <span>Tourify</span>
          </div>

          {/* Desktop Menu */}
          <div className="flex items-center gap-8">
            {navLinks.map((link, idx) => (
              <div key={idx}>
                <button
                  onClick={() => {
                    if (link.hasSubmenu) {
                      toggleDestination();
                    } else {
                      handleNavigation(link.href);
                    }
                  }}
                  className="font-medium transition-all duration-300 py-2 px-1 flex items-center gap-2 hover:opacity-70"
                  style={{ color: '#015E6C' }}
                >
                  {/* {link.icon && <link.icon size={18} />} */}
                  {link.label}
                  {link.hasSubmenu && (
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-300 ${isDestinationOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Right Icons */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button 
              className="px-5 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:opacity-90"
              style={{ backgroundColor: '#015E6C' }}
              onClick={() => handleNavigation('/book')}
            >
              {t('Navigation.bookGramstay')}
            </button>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="lg:hidden flex items-center justify-between h-16">
          {/* Mobile Logo */}
          <div 
            className="flex items-center gap-2 text-xl font-bold cursor-pointer"
            style={{ color: '#015E6C' }}
            onClick={() => handleNavigation('/')}
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: '#015E6C' }}
            >
              MP
            </div>
            <span>Tourify</span>
          </div>

          <div className="flex items-center gap-3">
            
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg transition-all duration-300"
              style={{ color: '#015E6C' }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isDestinationOpen && (
          <div 
            className="fixed h-full left-0 top-20 w-full bg-white shadow-2xl border-t border-gray-100 overflow-hidden animate-in slide-in-from-top-4 duration-300"
            style={{ 
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <style>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-20px);
                  max-height: 0;
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                  max-height: 800px;
                }
              }
            `}</style>

            <div className="mx-auto px-4 md:px-8 lg:px-16">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 pt-6 gap-8">
                <button
                  onClick={() => setActiveTab('states')}
                  className="pb-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap"
                  style={{
                    color: activeTab === 'states' ? '#015E6C' : '#999',
                    borderBottomColor: activeTab === 'states' ? '#015E6C' : 'transparent'
                  }}
                >
                  {t('Dropdown.statesAndUTs')}
                </button>
                <button
                  onClick={() => setActiveTab('destinations')}
                  className="pb-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap"
                  style={{
                    color: activeTab === 'destinations' ? '#015E6C' : '#999',
                    borderBottomColor: activeTab === 'destinations' ? '#015E6C' : 'transparent'
                  }}
                >
                  {t('Dropdown.destinations')}
                </button>
                <button
                  onClick={() => setActiveTab('parks')}
                  className="pb-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap"
                  style={{
                    color: activeTab === 'parks' ? '#015E6C' : '#999',
                    borderBottomColor: activeTab === 'parks' ? '#015E6C' : 'transparent'
                  }}
                >
                  {t('Dropdown.nationalParks')}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsDestinationOpen(false)}
                  className="ml-auto pb-4 hover:opacity-70 transition-opacity"
                  style={{ color: '#015E6C' }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="py-8 pb-12 max-h-96 overflow-y-auto">
                {activeTab === 'states' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {regions.map((region) => (
                      <div key={region.slug}>
                        <h3 
                          className="font-bold text-base mb-4 cursor-pointer hover:opacity-70 transition-opacity"
                          style={{ color: '#015E6C' }}
                          onClick={() => handleRegionClick(region.slug)}
                        >
                          {region.name}
                        </h3>
                        <ul className="space-y-2">
                          {region.states.map((state) => (
                            <li key={state}>
                              <button
                                onClick={() => handleRegionClick(region.slug)}
                                className="text-sm text-gray-700 hover:font-semibold transition-all duration-200"
                              >
                                {state}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'destinations' && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">{t('Dropdown.popularDestinationsSoon')}</p>
                  </div>
                )}

                {activeTab === 'parks' && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">{t('Dropdown.nationalParksSoon')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            className="lg:hidden pb-4 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-300"
          >
            {navLinks.map((link, idx) => (
              <div key={idx}>
                <button
                  onClick={() => {
                    if (link.hasSubmenu) {
                      setIsDestinationOpen(!isDestinationOpen);
                    } else {
                      handleNavigation(link.href);
                    }
                  }}
                  className="w-full text-left px-4 py-3 font-medium flex items-center justify-between transition-all duration-300"
                  style={{ color: '#015E6C' }}
                >
                  <span className="flex items-center gap-2">
                    {link.icon && <link.icon size={18} />}
                    {link.label}
                  </span>
                  {link.hasSubmenu && (
                    <span className={`transition-transform duration-300 ${isDestinationOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={18} />
                    </span>
                  )}
                </button>

                {link.hasSubmenu && isDestinationOpen && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {regions.map((region) => (
                      <div key={region.slug} className="px-4">
                        <button
                          onClick={() => handleRegionClick(region.slug)}
                          className="w-full text-left py-3 font-bold text-sm"
                          style={{ color: '#015E6C' }}
                        >
                          {region.name}
                        </button>
                        <div className="pl-4 pb-3">
                          {region.states.slice(0, 3).map((state) => (
                            <button
                              key={state}
                              onClick={() => handleRegionClick(region.slug)}
                              className="block text-left text-xs text-gray-600 py-1 hover:font-semibold"
                            >
                              {state}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Bottom Actions */}
            <div className="border-t mt-2 pt-2">
              <button 
                className="w-full text-left px-4 py-3 flex items-center gap-2 font-medium transition-all duration-300"
                style={{ color: '#015E6C' }}
              >
                <User size={18} /> {t('Navigation.signin')}
              </button>
              <button 
                className="w-full m-2 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-300"
                style={{ backgroundColor: '#015E6C' }}
                onClick={() => handleNavigation('/book')}
              >
                {t('Navigation.bookGramstay')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}