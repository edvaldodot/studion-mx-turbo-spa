export const isMacOS = (): boolean =>
  typeof navigator !== 'undefined' &&
  /Macintosh/.test(navigator.userAgent) &&
  /AppleWebKit/.test(navigator.userAgent)

export const isIOS = (): boolean =>
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !('MSStream' in window)

export const isChromeIOS = (): boolean =>
  isIOS() && /CriOS\/[\d]+/.test(navigator.userAgent)

export const isSafariIOS = (): boolean =>
  isIOS() && navigator.userAgent.indexOf('Safari') !== -1

export interface BrowserInfo {
  browser: string
  version: string
}

export const getBrowserVersion = (): BrowserInfo | 'unknown' => {
  const userAgent = window.navigator.userAgent

  const getVersion = (regex: RegExp): string | false => {
    const match = regex.exec(userAgent)
    return match ? match[1] : false
  }

  const browsers: Record<string, RegExp> = {
    Edge: /(?:Edge|Edg)\/(\d+(\.\d+)?)/,
    Firefox: /Firefox\/(\d+(\.\d+)?)/,
    Opera: /(?:OPR|Opera)\/(\d+(\.\d+)?)/,
    Chrome: /(?:Chrome|CriOS)\/(\d+(\.\d+)?)/,
    Safari: /Version\/(\d+(\.\d+)?)/,
  }

  for (const [name, regex] of Object.entries(browsers)) {
    const version = getVersion(regex)
    if (version) {
      return { browser: name, version }
    }
  }

  return 'unknown'
}

export interface OSInfo {
  os: string
  version: string
}

export const getOSVersion = (): OSInfo | 'unknown' => {
  const userAgent = window.navigator.userAgent

  const getVersion = (regex: RegExp): string | false => {
    const match = regex.exec(userAgent)
    if (!match) return false
    if (match[1]) return match[1]
    return 'unknown'
  }

  const operatingSystems: Record<string, RegExp> = {
    Windows: /Windows NT (\d+\.\d+)/,
    macOS: /Mac OS X (\d+[._\d]+)/,
    Android: /Android (\d+(\.\d+)?)/,
    Linux: /Linux/,
    iOS: /(?:iPhone|iPad|iPod).*OS\s(\d+[_.]\d+(?:[_.]\d+)*)/,
    ChromeOS: /CriOS\/[\d]+/,
  }

  for (const [name, regex] of Object.entries(operatingSystems)) {
    const version = getVersion(regex)
    if (version) {
      return {
        os: name,
        version: version.replaceAll('_', '.'),
      }
    }
  }

  return 'unknown'
}

export const getDeviceType = (): 'Mobile' | 'Tablet' | 'Desktop' => {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth

  const isMobile = width < 768
  const isTablet = width >= 768
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0

  if (isTouchDevice) {
    if (isMobile) return 'Mobile'
    if (isTablet) return 'Tablet'
  }

  return 'Desktop'
}
