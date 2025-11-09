'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const TranslationContext = createContext();

export function useTranslation() {
  return useContext(TranslationContext);
}

export default function TranslationProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (scriptLoaded) return;

    // Get saved language
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLang);

    // Define the callback before loading script
    window.googleTranslateElementInit = function() {
      if (!document.getElementById('google_translate_element')) return;
      
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi',
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setScriptLoaded(true);
      } catch (error) {
        console.error('Translation init error:', error);
      }
    };

    // Load the script only once
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      // Script already loaded, just initialize
      window.googleTranslateElementInit();
    }
  }, [scriptLoaded]);

  const triggerGoogleTranslate = (targetLang) => {
    const checkAndTranslate = (attempts = 0) => {
      if (attempts > 30) {
        console.warn('Translation widget not ready');
        setIsTranslating(false);
        return;
      }

      const selectElement = document.querySelector('select.goog-te-combo');
      
      if (selectElement) {
        selectElement.value = targetLang;
        selectElement.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
          setIsTranslating(false);
          setCurrentLanguage(targetLang);
        }, 1000);
      } else {
        setTimeout(() => checkAndTranslate(attempts + 1), 300);
      }
    };

    checkAndTranslate();
  };

  const switchLanguage = (lang) => {
    if (lang === currentLanguage || isTranslating) return;
    
    setIsTranslating(true);
    localStorage.setItem('preferred-language', lang);

    if (lang === 'en') {
      // Reset to English - clear cookies and reload
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      localStorage.setItem('preferred-language', 'en');
      window.location.reload();
    } else {
      // Translate to target language
      if (!scriptLoaded) {
        // Wait for script to load
        const waitForScript = setInterval(() => {
          if (scriptLoaded) {
            clearInterval(waitForScript);
            triggerGoogleTranslate(lang);
          }
        }, 200);
        
        setTimeout(() => {
          clearInterval(waitForScript);
          setIsTranslating(false);
        }, 10000);
      } else {
        triggerGoogleTranslate(lang);
      }
    }
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, switchLanguage, isTranslating }}>
      <div id="google_translate_element" style={{ display: 'none' }} />
      {children}
    </TranslationContext.Provider>
  );
}
