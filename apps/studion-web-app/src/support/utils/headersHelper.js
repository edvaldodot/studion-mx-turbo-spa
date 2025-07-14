import { getBrowserVersion, getOSVersion, getDeviceType } from '@/support/utils/browserIdentifiers'

export const DEFAULT_HEADERS = [
  'x-suid',
  'x-origin',
  'x-os',
  'x-os-version',
  'x-browser',
  'x-browser-version',
]

export const getHeader = (header) => {
  if (!header) return

  const headerFromSessionStorage = sessionStorage.getItem(header)

  if (headerFromSessionStorage) return headerFromSessionStorage

  if (header === 'x-origin') return getDeviceType()
  if (header === 'x-os') return getOSVersion().os
  if (header === 'x-os-version') return getOSVersion().version
  if (header === 'x-browser') return getBrowserVersion().browser
  if (header === 'x-browser-version') return getBrowserVersion().version

  return 'unknown'
}

export const clearSessionHeaders = () => {
  DEFAULT_HEADERS.forEach((header) => sessionStorage.removeItem(header))
}
