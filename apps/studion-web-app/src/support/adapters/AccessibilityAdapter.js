import config from '@/config'
import './Styles.scss'

function create({ isUserLoggedIn, isAccessibilityFeatureEnabled, userData }) {
  if (userData.isStudent && userData.isDesktop && isUserLoggedIn && isAccessibilityFeatureEnabled) {
    createScript()
  }
}

function createScript() {
  if (!document.getElementById('userway-script')) {
    const accountKey = config.USER_WAY_KEY || process.env.VUE_APP_USERWAY_KEY
    if (typeof accountKey === 'string' && accountKey.trim() !== '') {
      const scriptTag = document.createElement('script')
      scriptTag.type = 'text/javascript'
      scriptTag.async = true
      scriptTag.src = 'https://cdn.userway.org/widget.js'
      scriptTag.setAttribute('data-account', accountKey)
      scriptTag.id = 'userway-script'
      document.body.appendChild(scriptTag)
    }
  }
}

export default { create }
