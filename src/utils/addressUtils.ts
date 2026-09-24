// Address utilities for os-admin
import newWardHcmData from '@/data/new_ward_hcm.json'
import oldDistrictsHcmData from '@/data/old_districts_hcm.json'
import oldWardsHcmData from '@/data/old_wards_hcm.json'
import provincesData from '@/data/provinces.json'

// Interface for province data
export interface ProvinceData {
  province_code: string
  name: string
}

// Interface for ward data
export interface WardData {
  ward_code: string
  name: string
  province_code?: string | number
}

// Interface for new ward data (with district info)
export interface NewWardData {
  ward_code: string
  name: string
  district_code?: string
  district_name?: string
  province_code?: string | number
  province_name?: string
}

// Interface for district data
export interface DistrictData {
  district_code: string
  name: string
}

/**
 * Get all provinces from JSON data
 */
export const getProvinces = (): ProvinceData[] => {
  return Object.values(provincesData as Record<string, ProvinceData>)
}

/**
 * Get Ho Chi Minh City province
 */
export const getHCMProvince = (): ProvinceData | null => {
  const provinces = getProvinces()
  return provinces.find((p) => p.name === 'Thành phố Hồ Chí Minh') ?? null
}

/**
 * Get all new wards for HCM (province code 79)
 */
export const getNewWardsHCM = (): NewWardData[] => {
  const hcmWards = (newWardHcmData as Record<string, WardData[]>)['79'] ?? []
  return hcmWards.map((ward) => ({
    ward_code: ward.ward_code,
    name: ward.name,
    district_code: (ward as any).district_code,
    district_name: (ward as any).district_name,
    province_code: 79,
    province_name: 'Thành phố Hồ Chí Minh',
  }))
}

/**
 * Get all wards for HCM (province code 79) - alias for backwards compatibility
 */
export const getWardsHCM = (): WardData[] => {
  const hcmWards = (newWardHcmData as Record<string, WardData[]>)['79'] ?? []
  return hcmWards.map((ward) => ({
    ward_code: ward.ward_code,
    name: ward.name,
    province_code: 79,
  }))
}

/**
 * Get all old districts for HCM (province code 79)
 */
export const getOldDistrictsHCM = (): DistrictData[] => {
  const hcmDistricts = (oldDistrictsHcmData as any)['79'] ?? []
  return hcmDistricts.map((district: any) => ({
    district_code: district.district_code,
    name: district.name,
  }))
}

/**
 * Get old wards by district code
 */
export const getOldWardsByDistrict = (districtCode: string): WardData[] => {
  const districtWards = (oldWardsHcmData as any)[districtCode] ?? []
  return districtWards.map((ward: any) => ({
    ward_code: ward.ward_code,
    name: ward.name,
    province_code: 79,
  }))
}

/**
 * Get all old wards for HCM
 */
export const getAllOldWardsHCM = (): WardData[] => {
  const allWards: WardData[] = []
  Object.keys(oldWardsHcmData).forEach((districtCode) => {
    const wards = getOldWardsByDistrict(districtCode)
    allWards.push(...wards)
  })
  return allWards
}

/**
 * Get wards by province code
 */
export const getWardsByProvince = (provinceCode: number): WardData[] => {
  if (provinceCode === 79) {
    return getWardsHCM()
  }
  // For other provinces, return empty for now (only HCM has ward data)
  return []
}

/**
 * Get province by code
 */
export const getProvinceByCode = (code: number): ProvinceData | null => {
  const provinces = getProvinces()
  return provinces.find((p) => Number(p.province_code) === code) ?? null
}

/**
 * Find province by name (partial match)
 */
export const findProvinceByName = (name: string): ProvinceData | null => {
  if (!name) return null
  const provinces = getProvinces()
  const normalizedName = name.toLowerCase().trim()
  return (
    provinces.find(
      (p) =>
        p.name.toLowerCase() === normalizedName ||
        p.name.toLowerCase().includes(normalizedName),
    ) ?? null
  )
}

/**
 * Find ward by name within a province (partial match)
 */
export const findWardByName = (
  provinceCode: number,
  name: string,
): WardData | null => {
  if (!name || !provinceCode) return null
  const wards = getWardsByProvince(provinceCode)
  const normalizedName = name.toLowerCase().trim()
  return (
    wards.find(
      (w) =>
        w.name.toLowerCase() === normalizedName ||
        w.name.toLowerCase().includes(normalizedName),
    ) ?? null
  )
}

/**
 * Get ward by code
 */
export const getWardByCode = (
  wardCode: number,
  provinceCode: number,
): WardData | null => {
  const wards = getWardsByProvince(provinceCode)
  return wards.find((w) => Number(w.ward_code) === wardCode) ?? null
}

/**
 * Get province name by province code
 */
export const getProvinceNameByCode = (
  code: number | string | undefined,
): string => {
  if (code === undefined) return ''
  const provinces = getProvinces()
  const province = provinces.find(
    (p) => String(p.province_code) === String(code),
  )
  return province?.name ?? ''
}

/**
 * Get ward name by ward code and province code
 */
export const getWardNameByCode = (
  wardCode: number | string | undefined,
  provinceCode: number | string | undefined,
): string => {
  if (wardCode === undefined) return ''
  if (provinceCode === undefined) return ''

  // If wardCode is already a string name (not numeric), just return it
  if (typeof wardCode === 'string' && isNaN(Number(wardCode))) return wardCode

  // Get wards for HCM province
  const wards = getNewWardsHCM()
  const w = wards.find(
    (x) =>
      x.ward_code === String(wardCode) ||
      String(x.ward_code) === String(wardCode) ||
      x.name === wardCode,
  )

  return w?.name ?? String(wardCode)
}

export const excludedWardNames = [
  'Phường Thuận An',
  'Phường Thủ Dầu Một',
  'Phường Vũng Tàu',
  'Phường Bà Rịa',
  'Phường Bình Dương',
  'Phường Vĩnh Tân',
  'Phường Thuận Giao',
  'Phường Đông Hòa',
  'Phường Chánh Hiệp',
  'Phường Chánh Hưng',
  'Phường Chánh Phú Hòa',
  'Phường Dĩ An',
  'Phường Diên Hồng',
  'Phường Hòa Lợi',
  'Phường Lái Thiêu',
  'Phường Long Hương',
  'Phường Long Nguyên',
  'Phường Phú An',
  'Phường Phú Lợi',
  'Phường Phước Thắng',
  'Phường Rạch Dừa',
  'Phường Tam Long',
  'Phường Tam Thắng',
  'Phường Tân Đông Hiệp',
  'Phường Tân Hải',
  'Phường Tân Hiệp',
  'Phường Tân Khánh',
  'Phường Tân Phước',
  'Phường Tân Uyên',
  'Phường Tây Nam',
  'Xã An Nhơn Tây',
  'Xã Bình Mỹ',
  'Xã Củ Chi',
  'Xã Đông Thạnh',
  'Xã Nhuận Đức',
  'Xã Phú Hòa Đông',
  'Xã Tân Thạnh Đông',
]
