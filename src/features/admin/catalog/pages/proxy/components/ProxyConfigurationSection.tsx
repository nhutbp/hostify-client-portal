import { Info, ServerCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProxyCard, ProxyField, proxyInputClass } from './ProxyFormUi'
import type { ProxyFormDraft } from './proxyFormTypes'

const displayCategories: Record<ProxyFormDraft['proxyType'], string> = {
  RESIDENTIAL: 'Proxy dân cư',
  DATACENTER: 'Proxy datacenter',
  MOBILE: 'Proxy di động',
}

export function ProxyConfigurationSection({
  form,
  update,
}: {
  form: ProxyFormDraft
  update: (patch: Partial<ProxyFormDraft>) => void
}) {
  const { t } = useTranslation('catalog')
  const toggleProtocol = (protocol: 'HTTP' | 'HTTPS' | 'SOCKS5') =>
    update({
      protocols: form.protocols.includes(protocol)
        ? form.protocols.filter((value) => value !== protocol)
        : [...form.protocols, protocol],
    })
  return (
    <ProxyCard icon={ServerCog} title={t('proxy.new.configuration')}>
      <div className="grid gap-5 md:grid-cols-3">
        <ProxyField name="proxyType" label={t('proxy.new.proxyType')} required>
          <select
            id="proxyType"
            name="proxyType"
            className={proxyInputClass}
            value={form.proxyType}
            onChange={(event) => {
              const proxyType = event.target
                .value as ProxyFormDraft['proxyType']
              update({
                proxyType,
                displayCategory: displayCategories[proxyType],
              })
            }}
          >
            <option value="RESIDENTIAL">{t('proxy.types.RESIDENTIAL')}</option>
            <option value="DATACENTER">{t('proxy.types.DATACENTER')}</option>
            <option value="MOBILE">{t('proxy.types.MOBILE')}</option>
          </select>
        </ProxyField>
        <ProxyField
          name="displayCategory"
          label={t('proxy.new.displayCategory')}
          required
        >
          <select
            id="displayCategory"
            name="displayCategory"
            className={proxyInputClass}
            value={form.displayCategory}
            onChange={(event) =>
              update({ displayCategory: event.target.value })
            }
          >
            {(
              Object.keys(displayCategories) as ProxyFormDraft['proxyType'][]
            ).map((type) => (
              <option key={type} value={displayCategories[type]}>
                {t(`proxy.types.${type}`)}
              </option>
            ))}
          </select>
        </ProxyField>
        <ProxyField name="country" label={t('proxy.new.country')} required>
          <select
            id="country"
            name="country"
            className={proxyInputClass}
            value={form.country}
            onChange={(event) =>
              update({
                country: event.target.value as ProxyFormDraft['country'],
              })
            }
          >
            {(['US', 'VN', 'SG', 'JP', 'DE'] as const).map((country) => (
              <option key={country} value={country}>
                {t(`proxy.countries.${country}`)}
              </option>
            ))}
          </select>
        </ProxyField>
        <ProxyField name="ipMode" label={t('proxy.new.ipMode')} required>
          <select
            id="ipMode"
            name="ipMode"
            className={proxyInputClass}
            value={form.ipMode}
            onChange={(event) =>
              update({
                ipMode: event.target.value as ProxyFormDraft['ipMode'],
              })
            }
          >
            <option value="STATIC">{t('proxy.modes.STATIC')}</option>
            <option value="ROTATING">{t('proxy.modes.ROTATING')}</option>
          </select>
        </ProxyField>
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('proxy.new.protocols')} <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['HTTP', 'HTTPS', 'SOCKS5'] as const).map((protocol) => (
              <label
                key={protocol}
                className="flex items-center gap-2 rounded-md border border-[#d5e1f2] px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.protocols.includes(protocol)}
                  onChange={() => toggleProtocol(protocol)}
                />
                {protocol}
              </label>
            ))}
          </div>
        </div>
        <ProxyField
          name="ipDelivery"
          label={t('proxy.new.ipDelivery')}
          required
        >
          <select
            id="ipDelivery"
            name="ipDelivery"
            className={proxyInputClass}
            value={form.ipDelivery}
            onChange={(event) =>
              update({
                ipDelivery: event.target.value as ProxyFormDraft['ipDelivery'],
              })
            }
          >
            <option value="INSTANT">{t('proxy.delivery.INSTANT')}</option>
            <option value="MANUAL">{t('proxy.delivery.MANUAL')}</option>
          </select>
        </ProxyField>
        <ProxyField name="bandwidthGb" label={t('proxy.new.bandwidthGb')}>
          <div className="flex">
            <input
              id="bandwidthGb"
              name="bandwidthGb"
              type="number"
              min={-1}
              className={`${proxyInputClass} rounded-r-none`}
              value={form.bandwidthGb}
              onChange={(event) => update({ bandwidthGb: event.target.value })}
            />
            <span className="flex items-center rounded-r-md border border-l-0 border-[#d5e1f2] bg-slate-50 px-3 text-sm">
              GB
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {t('proxy.new.unlimitedHint')}
          </p>
        </ProxyField>
        <ProxyField
          name="concurrentConnections"
          label={t('proxy.new.concurrentConnections')}
        >
          <input
            id="concurrentConnections"
            name="concurrentConnections"
            type="number"
            min={1}
            className={proxyInputClass}
            value={form.concurrentConnections}
            onChange={(event) =>
              update({ concurrentConnections: event.target.value })
            }
          />
        </ProxyField>
      </div>
      <div className="mt-5 flex gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>{t('proxy.new.configurationNote')}</span>
      </div>
    </ProxyCard>
  )
}
