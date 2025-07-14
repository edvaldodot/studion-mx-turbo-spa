// src/support/utils/headersHelper.ts

import {
  getBrowserVersion,
  getOSVersion,
  getDeviceType,
} from '@/support/utils/browserIdentifiers'

export const DEFAULT_HEADERS = [
  'x-suid',
  'x-origin',
  'x-os',
  'x-os-version',
  'x-browser',
  'x-browser-version',
] as const

export type HeaderKey = (typeof DEFAULT_HEADERS)[number]

function safeVersion<T extends { version: string }>(data: T | 'unknown') {
  return typeof data === 'object' ? data.version : 'unknown'
}

function safeProp<K extends string, T extends Record<K, string>>(data: T | 'unknown', key: K): string {
  return typeof data === 'object' ? data[key] : 'unknown'
}

export function getHeader(header: string): string | undefined {
  if (!header) return

  const headerFromSessionStorage = sessionStorage.getItem(header)
  if (headerFromSessionStorage) return headerFromSessionStorage

  if (header === 'x-origin') return getDeviceType()
  if (header === 'x-os') return safeProp(getOSVersion(), 'os')
  if (header === 'x-browser') return safeProp(getBrowserVersion(), 'browser')

  if (header === 'x-os-version') return safeVersion(getOSVersion())
  if (header === 'x-browser-version') return safeVersion(getBrowserVersion())

  return 'unknown'
}

export function clearSessionHeaders(): void {
  DEFAULT_HEADERS.forEach((header) => sessionStorage.removeItem(header))
}
