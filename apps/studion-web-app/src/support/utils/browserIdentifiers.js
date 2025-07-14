export const isMacOS = () => navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent)
export const isIOS = () => navigator && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
export const isChromeIOS = () => isIOS() && /CriOS\/[\d]+/.test(navigator.userAgent)
export const isSafariIOS = () => isIOS() && navigator.userAgent.indexOf('Safari') != -1

export const getBrowserVersion = () => {
  const userAgent = window.navigator.userAgent

  const getVersion = (regex) => {
    const match = regex.exec(userAgent)
    return match ? match[1] : false
  }

  const browsers = {
    Edge: /(?:Edge|Edg)\/(\d+(\.\d+)?)/,
    Firefox: /Firefox\/(\d+(\.\d+)?)/,
    Opera: /(?:OPR|Opera)\/(\d+(\.\d+)?)/,
    Chrome: /(?:Chrome|CriOS)\/(\d+(\.\d+)?)/,
    Safari: /Version\/(\d+(\.\d+)?)/,
  }

  let browserInfo = 'unknown'

  Object.entries(browsers).some((browser) => {
    if (getVersion(browser[1])) {
      browserInfo = { browser: browser[0], version: getVersion(browser[1]) }
      return true
    }
  })

  return browserInfo
}

export const getOSVersion = () => {
  const userAgent = window.navigator.userAgent

  const getVersion = (regex) => {
    const match = regex.exec(userAgent)
    if (!match) return false
    if (match[1]) return match[1]
    return 'unknown'
  }

  const operatingSystems = {
    Windows: /Windows NT (\d+\.\d+)/,
    macOS: /Mac OS X (\d+[._\d]+)/,
    Android: /Android (\d+(\.\d+)?)/,
    Linux: /Linux/,
    iOS: /(?:iPhone|iPad|iPod).*OS\s(\d+[_.]\d+(?:[_.]\d+)*)/,
    ChromeOS: /CriOS\/[\d]+/,
  }

  let osInfo = 'unknown'

  Object.entries(operatingSystems).some((os) => {
    if (getVersion(os[1])) {
      osInfo = { os: os[0], version: getVersion(os[1]).replaceAll('_', '.') }
      return true
    }
  })

  return osInfo
}

export const getDeviceType = () => {
  const width =
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth

  const isMobile = width < 768
  const isTablet = width >= 768
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0

  if (isTouchDevice) {
    if (isMobile) return 'Mobile'

    if (isTablet) return 'Tablet'
  }

  return 'Desktop'
}
