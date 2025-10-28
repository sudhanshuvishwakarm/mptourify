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

  const languages = [
    { code: 'en', name: 'EN', flag: '🇺🇸' },
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
      className="relative border-2 border-solid border-[#015e6c] rounded-lg"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-opacity-10 transition-all duration-200"
        style={{ color: '#015E6C' }}
      >
        <span className="text-sm font-semibold">{currentLanguage.name}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg z-50 overflow-hidden border"
          style={{ borderColor: '#015E6C' }}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-opacity-5 transition-colors duration-150 text-sm font-medium"
              style={{
                backgroundColor:
                  selectedLang === language.code ? '#FFF5F4' : 'white',
                color: selectedLang === language.code ? '#015E6C' : '#333',
              }}
            >
              <span className="text-base">{language.flag}</span>
              <span>{language.name}</span>
              {selectedLang === language.code && (
                <span className="ml-auto text-xs" style={{ color: '#015E6C' }}>
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
