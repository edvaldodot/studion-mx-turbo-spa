const CDN_SOURCE = 'https://cdn.announcekit.app/widget-v2.js'

/**
 * @description Checks if AnnounceKit is initialized on the window object.
 * @returns {boolean}
 */
const alreadyLoaded = () => {
  return typeof window.announcekit !== 'undefined'
}

/**
 * @description Prepares the configuration object for AnnounceKit with user and widget data.
 * @param {Object} user
 * @param {Object} widget
 * @returns {Object}
 * @throws Will throw an error if the widget id or name is missing.
 */
const mountData = (user, widget) => {
  if (!widget.id || !widget.name) {
    throw new Error('Invalid widget name or id')
  }

  return {
    widget: `https://announcekit.co/widgets/v2/${widget.id}`,
    name: widget.name,
    user: {
      id: user.uuid,
      email: user.data.email,
      username: user.data.username,
    },
    data: {
      client: window.location.hostname,
      role: user.currentProfile,
    },
  }
}

/**
 * @description Dynamically injects the AnnounceKit script and initializes the widget with provided data.
 * @param {Object} data
 */
const addScript = (data, unreadFallback) => {
  const script = document.createElement('script')
  script.src = CDN_SOURCE
  script.async = true
  document.body.appendChild(script)

  script.onload = () => {
    window.announcekit = window.announcekit || {
      queue: [],
      on: function (n, x) {
        window.announcekit.queue.push([n, x])
      },
      push: function (x) {
        window.announcekit.queue.push(x)
      },
    }

    window.announcekit.on('widget-unread', ({ unread }) => {
      unreadFallback(unread)
    })

    window.announcekit.push(data)
  }
}

/**
 * @description Handles the visibility of the AnnounceKit booster bar based on the user's role.
 * @param {string} currentProfile
 */
export const announceKitBoosterBarHandler = (currentProfile) => {
  if (!alreadyLoaded()) return

  const boosterBar = window.announcekit.boosters && window.announcekit.boosters.bar
  if (!boosterBar) return

  if (currentProfile === 'student') {
    boosterBar.hide()
  } else {
    boosterBar.show()
  }
}

/**
 * @description Updates the role in the AnnounceKit widget configuration.
 * @param {string} currentProfile
 */
export const announceKitUpdateRole = (currentProfile) => {
  if (!alreadyLoaded()) return

  const widgetConf = window.announcekit.widgets[0].conf
  widgetConf.user.role = currentProfile
  widgetConf.data.role = currentProfile
}

/**
 * @description Loads and initializes the AnnounceKit widget based on the user role and configuration.
 * @param {Object} user
 * @param {Object} widget
 * @param {Function} unreadFallback - Callback to handle unread message action.
 */
export const loadAnnounceKit = (user, widget, unreadFallback) => {
  if (user.currentProfile === 'student') return

  try {
    const hasScript = document.querySelector(`script[src="${CDN_SOURCE}"]`)

    const data = mountData(user, widget)

    if (hasScript) {
      return window.announcekit.push(data)
    }

    addScript(data, unreadFallback)
  } catch (e) {
    // Show error when variables are misconfigured, making it easier to identify the problem
    console.error(e)
  }
}
