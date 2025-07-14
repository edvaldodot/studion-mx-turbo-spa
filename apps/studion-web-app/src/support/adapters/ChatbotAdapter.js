import config from '@/config'
import { repositionElement } from '@/support/utils/repositionOverlappingElements'

var launcherElement

const displayExceptions = [
  {
    routeName: 'classroom.lessons.course.type',
    medias: ['mobile'],
  },
]

function initializeObserver() {
  launcherElement = document.querySelector('#launcher')

  let elementCurrentRect = launcherElement.getBoundingClientRect()

  // eslint-disable-next-line no-global-assign
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver

  const chatbotLauncherObserver = new MutationObserver(function (mutations) {
    let mutationRect = mutations[0].target.getBoundingClientRect()

    window.app.$store.state.chatbot.showWindow.isOpen = false

    if (!launcherElement.classList.contains('non-overlapping-element')) {
      launcherElement.classList.add('non-overlapping-element', 'zendesk-widget')
      launcherElement.style.margin = '0'
      launcherElement.style.transition = 'position 0s'
    }

    if (
      mutationRect.top != elementCurrentRect.top ||
      mutationRect.right != elementCurrentRect.right ||
      mutationRect.bottom != elementCurrentRect.bottom ||
      mutationRect.left != elementCurrentRect.left
    ) {
      elementCurrentRect = mutationRect

      updateButtonPosition(true)
    } else {
      updateButtonPosition()
    }
  })

  chatbotLauncherObserver.observe(launcherElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  })
}

function isLauncherValid() {
  return (
    launcherElement && launcherElement.nodeType && launcherElement.nodeType === Node.ELEMENT_NODE
  )
}

function isException() {
  return displayExceptions.some((exception) => {
    const matchRoute = exception.routeName && exception.routeName === window.app.$route.name
    const matchMedias = exception.medias && exception.medias.includes(window.app.$mq)

    return matchRoute && matchMedias
  })
}

function updateButtonPosition(updateStore = false) {
  if (!isLauncherValid()) return

  let { right, bottom } = launcherElement.style
  let hasUpdates = false
  let chatbotPosition = repositionElement(launcherElement)

  if (right && right != chatbotPosition.right) {
    launcherElement.style.right = chatbotPosition.right
    hasUpdates = true
  }

  if (bottom && bottom != chatbotPosition.bottom) {
    launcherElement.style.bottom = chatbotPosition.bottom
    hasUpdates = true
  }

  if (hasUpdates || updateStore) window.app.$store.state.chatbot.updatePosition = true
}

function updateButtonDisplay(isHidden, force) {
  if (!isLauncherValid()) return

  if (!force && (isHidden || isException())) {
    hide()
  } else {
    setTimeout(() => {
      show()
      updateButtonPosition()
    }, 450)
  }
}

const { THEME_NAME, ZENDESK_KEY_STUDENT, ZENDESK_KEY_ADMIN } = config
const CHATBOT_SETTINGS = {
  webWidget: {
    launcher: {
      chatLabel: {
        '*': 'Support',
        'pt-BR': 'Suporte',
        es: 'Soporte',
      },
    },
    chat: {
      departments: {
        enabled: [],
      },
    },
  },
  offset: {
    horizontal: '20px',
    vertical: '15px',
    mobile: {
      horizontal: '20px',
      vertical: '15px',
    },
  },
}

function create({
  isUserLoggedIn,
  isChatbotFeatureEnabled,
  userData,
  isProfileChange,
  locale,
  getTokenFn,
}) {
  isChatbotFeatureEnabled = isChatbotFeatureEnabled && ZENDESK_KEY_STUDENT && ZENDESK_KEY_ADMIN
  const { zE } = window

  let zendeskKey = ZENDESK_KEY_ADMIN
  if (userData.isStudent) zendeskKey = ZENDESK_KEY_STUDENT

  const user = { ...userData, organization: THEME_NAME }

  window.addEventListener('scroll', updateButtonPosition)
  window.addEventListener('resize', updateButtonPosition)

  if (zE) {
    if (isChatbotFeatureEnabled && isUserLoggedIn) {
      if (isProfileChange) {
        destroyZendesk(zE)
        createScript(zendeskKey, user, locale)
        return
      }
      show()
      return
    }

    if (!isUserLoggedIn || !isChatbotFeatureEnabled) {
      destroyZendesk(zE)
    }

    return
  }

  if (isChatbotFeatureEnabled && isUserLoggedIn) {
    setSettings(CHATBOT_SETTINGS, getTokenFn, isUserLoggedIn)
    createScript(zendeskKey, user, locale)
  }
}

/**
 * Receive default zendesk settings and a getToken function then set token data into
 * zendesk settings
 *
 * @param {Object} settings
 * @param {Function} getTokenFn
 */
function setSettings(settings, getTokenFn, userToken) {
  settings.webWidget.authenticate = {
    jwtFn: function (callback) {
      getTokenFn(userToken).then(({ data }) => {
        callback(data.token)
      })
    },
  }
  window.zESettings = settings
}

function setLocale(locale) {
  const { zE } = window
  if (zE) zE('webWidget', 'setLocale', locale)
}

function createScript(key, user, locale) {
  const scriptTag = document.createElement('script')

  scriptTag.type = 'text/javascript'
  scriptTag.async = true
  scriptTag.id = 'ze-snippet'
  document.body.appendChild(scriptTag)

  scriptTag.src = 'https://static.zdassets.com/ekr/snippet.js?key=' + key
  scriptTag.onload = () => {
    setTimeout(() => {
      onScriptLoaded(user, locale)
    }, 1000)
  }
}

function onScriptLoaded(user, locale) {
  const { zE } = window

  setTimeout(() => {
    initializeObserver()
  }, 2000)

  setUser(user)
  setLocale(locale)

  let count = 0
  const forceIdentifyInterval = setInterval(() => {
    setUser(user)
    count += 1
    if (count >= 2) clearInterval(forceIdentifyInterval)
  }, 200)

  zE('webWidget:on', 'close', function () {
    window.app.$store.state.zendeskChatbot.isOpen = false
  })
}

function setUser(user) {
  const { zE } = window

  if (!zE) return

  zE('webWidget', 'prefill', {
    name: { value: user.name },
    email: { value: user.email },
    organization: { value: user.organization },
  })
  zE('webWidget', 'identify', {
    name: user.name,
    email: user.email,
    organization: user.organization,
  })
}

function show() {
  const { zE } = window
  if (zE) zE('webWidget', 'show')
}

function hide() {
  const { zE } = window
  zE && zE('webWidget', 'hide')
}

function openChat() {
  const { zE } = window
  zE('webWidget', 'open')

  updateButtonDisplay(window.app.$store.state.menuOpen, true)
}

function closeChat() {
  const { zE } = window
  zE('webWidget', 'close')

  updateButtonDisplay(window.app.$store.state.menuOpen)
}

function destroyZendesk(zE) {
  hide()
  zE('webWidget', 'logout')
  zE('webWidget', 'reset')

  delete window.zE
  delete window.zEACLoaded
  delete window.zEWebpackACJsonp
  delete window.zEmbed

  const zeSnippet = document.getElementById('ze-snippet')
  const iframeScript = document.querySelector('[data-product="web_widget"]')
  const iframeLauncher = document.getElementById('launcher')
  const iframeWebWidget = document.getElementById('webWidget')

  if (zeSnippet) zeSnippet.remove()
  if (iframeScript) iframeScript.remove()
  if (iframeLauncher) iframeLauncher.remove()
  if (iframeWebWidget) iframeWebWidget.remove()

  window.removeEventListener('scroll', updateButtonPosition)
  window.removeEventListener('resize', updateButtonPosition)
}

export default {
  create,
  setLocale,
  hide,
  updateButtonDisplay,
  updateButtonPosition,
  openChat,
  closeChat,
}
