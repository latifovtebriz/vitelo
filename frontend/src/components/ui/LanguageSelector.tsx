import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import type { Language } from '../../data/translations';
import { logger } from '../../lib/logger';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setOpen(false);
    logger.action('LanguageSelector', 'Changed Interface Language', {
      from: language,
      to: code,
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-white/90 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all"
        title="Change Language"
      >
        <span className="text-sm">{current.flag}</span>
        <span className="uppercase text-[11px] font-extrabold">{current.code}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                language === lang.code
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
