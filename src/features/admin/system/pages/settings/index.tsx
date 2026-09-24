// Settings page - Main page component with tabs
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/common/Panel'
import { WebsiteInfoTab } from './components/WebsiteInfoTab'
import { ApiManagementTab } from './components/ApiManagementTab'
import { MediaSettingsTab } from '@/features/admin/media/components/MediaSettingsTab'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { cn } from '@/utils/utils'
import { Globe2, Image, KeyRound } from 'lucide-react'

type TabType = 'website' | 'api' | 'media'

interface Tab {
  id: TabType
  labelKey: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  {
    id: 'website',
    labelKey: 'tabs.website',
    icon: <Globe2 className="h-4 w-4" />,
  },
  {
    id: 'api',
    labelKey: 'tabs.api',
    icon: <KeyRound className="h-4 w-4" />,
  },
  {
    id: 'media',
    labelKey: 'tabs.media',
    icon: <Image className="h-4 w-4" />,
  },
]

export default function SettingsPage() {
  const { t } = useTranslation('system')
  const [activeTab, setActiveTab] = useState<TabType>('website')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: t('title') }]} />

      {/* Main content with tabs */}
      <Panel className="space-y-0">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-sm text-gray-500">{t('description')}</p>
        </div>
        <div>
          {/* Tab navigation */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'dark:bg-darkgray bg-white shadow-sm'
                      : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-700',
                  )}
                >
                  {tab.icon}
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'website' && <WebsiteInfoTab />}
          {activeTab === 'api' && <ApiManagementTab />}
          {activeTab === 'media' && <MediaSettingsTab />}
        </div>
      </Panel>
    </div>
  )
}
