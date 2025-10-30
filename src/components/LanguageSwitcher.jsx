'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const dropdownRef = useRef(null);

  const switchLanguage = (locale) => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    setSelectedLang(locale);
    setIsOpen(false);
    router.refresh();
  };
  const colors = {
    saffron: '#F3902C',
    green: '#339966',
    skyBlue: '#33CCFF',
    white: '#FFFFFF',
    bgColor: '#FFF7EB',
    darkGray: '#333333'
  };
  const languages = [
    { code: 'en', name: 'EN', flag: '🇮🇳' },
    { code: 'hi', name: 'HI', flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === selectedLang);

  // 🔹 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
  <div
  ref={dropdownRef}
  className="relative"
>
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg"
    style={{ backgroundColor: colors.green }}
  >
    <span className="text-sm">{currentLanguage.name}</span>
    <ChevronDown
      size={16}
      className={`transition-transform duration-200 ${
        isOpen ? 'rotate-180' : 'rotate-0'
      }`}
    />
  </button>

  {isOpen && (
    <div
      className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg z-50 overflow-hidden border"
      style={{ borderColor: colors.green }}
    >
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => switchLanguage(language.code)}
          className="w-full flex items-center gap-2 px-4 py-2 text-left transition-all duration-150 text-sm font-semibold hover:bg-green-50"
          style={{
            color: selectedLang === language.code ? colors.green : '#333',
            backgroundColor:
              selectedLang === language.code ? '#ECFDF5' : 'white',
          }}
        >
          <span className="text-base emoji">{language.flag}</span>
          <span>{language.name}</span>
          {selectedLang === language.code && (
            <span className="ml-auto text-xs" style={{ color: colors.green }}>
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  )}
</div>

  );
}
