import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import errorsEn from './locales/errors.en.json'
import errorsVi from './locales/errors.vi.json'
import vi from './locales/vi.json'
// Feature translations
import systemEn from '@/features/admin/system/i18n/en.json'
import systemVi from '@/features/admin/system/i18n/vi.json'
import mediaEn from '@/features/admin/media/i18n/en.json'
import mediaVi from '@/features/admin/media/i18n/vi.json'
import postsEn from '@/features/admin/posts/i18n/en.json'
import postsVi from '@/features/admin/posts/i18n/vi.json'
import appearanceEn from '@/features/admin/appearance/i18n/en.json'
import appearanceVi from '@/features/admin/appearance/i18n/vi.json'
import adminUsersEn from '@/features/admin/users/i18n/en.json'
import adminUsersVi from '@/features/admin/users/i18n/vi.json'
import i18n from 'i18next'

export const LANGUAGES = {
  vi: { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
} as const

export type LanguageCode = keyof typeof LANGUAGES

const STORAGE_KEY = 'language'
const DEFAULT_LANGUAGE: LanguageCode = 'vi'

// Get saved language from localStorage or use default
const getSavedLanguage = (): LanguageCode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in LANGUAGES) {
      return saved as LanguageCode
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_LANGUAGE
}

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: vi,
      apiErrors: errorsVi,
      system: systemVi,
      media: mediaVi,
      posts: postsVi,
      appearance: appearanceVi,
      adminUsers: adminUsersVi,
    },
    en: {
      translation: en,
      apiErrors: errorsEn,
      system: systemEn,
      media: mediaEn,
      posts: postsEn,
      appearance: appearanceEn,
      adminUsers: adminUsersEn,
    },
  },
  lng: getSavedLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
  returnNull: false,
  defaultNS: 'translation',
  ns: ['translation', 'apiErrors', 'auth', 'system', 'media'],
})

// Save language to localStorage when changed
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    // Ignore localStorage errors
  }
})

export default i18n
