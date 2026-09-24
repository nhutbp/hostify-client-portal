import { useTranslation } from 'react-i18next'
import { Globe2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LANGUAGES } from '@/config/i18n'
import type { LanguageCode } from '@/config/i18n'

export function LanguageSwitcher({ iconOnly = false }: { iconOnly?: boolean }) {
  const { t, i18n } = useTranslation()
  const resolvedLanguage = (i18n.resolvedLanguage ?? i18n.language).split(
    '-',
  )[0]
  const currentLanguage: LanguageCode =
    resolvedLanguage in LANGUAGES ? (resolvedLanguage as LanguageCode) : 'vi'
  const currentLanguageInfo = LANGUAGES[currentLanguage]

  const toggleLanguage = () => {
    const nextLanguage: LanguageCode = currentLanguage === 'vi' ? 'en' : 'vi'
    void i18n.changeLanguage(nextLanguage).then(() => {
      document.documentElement.lang = nextLanguage
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={toggleLanguage}
      className={
        iconOnly
          ? 'size-[22px] rounded-md p-0 text-[#111] transition-colors hover:text-primary'
          : 'gap-2 px-3'
      }
      aria-label={t('settings.language')}
      title={t('settings.language')}
    >
      {iconOnly ? (
        <Globe2 size={19} />
      ) : (
        <>
          <span>{currentLanguageInfo.flag}</span>
          <span className="hidden sm:inline">
            {currentLanguageInfo.code.toUpperCase()}
          </span>
        </>
      )}
    </Button>
  )
}
