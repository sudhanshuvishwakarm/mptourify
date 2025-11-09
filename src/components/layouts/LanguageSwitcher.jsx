'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from './TranslationProvider';

export default function LanguageSwitcher() {
  const { currentLanguage, switchLanguage, isTranslating } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'EN', fullName: 'English', flag: '🇮🇳' },
    { code: 'hi', name: 'हिं', fullName: 'हिंदी', flag: '🇮🇳' },
  ];

  const currentLanguageObj = languages.find((lang) => lang.code === currentLanguage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSwitch = (langCode) => {
    if (langCode !== currentLanguage && !isTranslating) {
      switchLanguage(langCode);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className="flex items-center gap-2 px-2 py-2 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
      >
        <span className="text-lg">{currentLanguageObj?.flag}</span>
        <span className="text-sm">
          {isTranslating ? 'Translating...' : (currentLanguageObj?.name || 'English')}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 min-w-[160px]">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSwitch(language.code)}
              disabled={isTranslating || currentLanguage === language.code}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 text-sm font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                currentLanguage === language.code ? 'bg-green-50' : ''
              }`}
            >
              <span className="text-xl">{language.flag}</span>
              <span className="flex-1 text-gray-800">{language.fullName}</span>
              {currentLanguage === language.code && (
                <span className="text-green-600 text-base font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}