import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TRANSLATIONS } from '../data/translations';
import type { Language, Translations } from '../data/translations';

interface LanguageState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'az',
      t: TRANSLATIONS['az'],
      setLanguage: (language: Language) =>
        set({
          language,
          t: TRANSLATIONS[language] || TRANSLATIONS['az'],
        }),
    }),
    {
      name: 'vitelo-lang-store',
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = TRANSLATIONS[state.language] || TRANSLATIONS['az'];
        }
      },
    }
  )
);
