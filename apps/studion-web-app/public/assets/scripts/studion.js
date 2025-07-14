function checkMessage(evt) {
  if (evt.data.type === 'menu') {
    getMenu()
  } else if (evt.data.type === 'link') {
    document.querySelectorAll('.menuitem a')[evt.data.index].click()
    window.onbeforeunload = () => true
    setupLoadEvent()
  } else if (evt.data.type === 'leavingSco') {
    window.onbeforeunload = undefined
    // eslint-disable-next-line
    Control.ExitScormPlayer()
    document.getElementById('ScormContent').contentWindow.location.replace('about:blank')
    parent.postMessage({ command: 'scormClosed' }, '*')
  }

  if (evt.data.type === 'removeUnloadEvent') {
    window.onbeforeunload = undefined
  }

  if (evt.data.type === 'a11y') {
    addA11y(evt.data.key)
  }

  if (evt.data.type === 'addUnloadEvent') {
    window.onbeforeunload = () => true
  }
}

/**
 * @desc Adds accessibility features based on the provided key.
 * @param {string} key - The key for the accessibility feature.
 */
function addA11y(key) {
  setTimeout(() => {
    const scormContentDocument = document.getElementById('ScormContent').contentDocument
    const scriptsImports = Array.from(scormContentDocument.querySelectorAll('script'))
    const hasUserway = scriptsImports.find((script) => script.src.includes('cdn.userway.org'))

    if (hasUserway) return

    if (typeof key === 'string' && key.trim() !== '') {
      const scriptTag = document.createElement('script')
      scriptTag.type = 'text/javascript'
      scriptTag.async = true
      scriptTag.src = 'https://cdn.userway.org/widget.js'
      scriptTag.setAttribute('data-account', key)
      scriptTag.id = 'userway-script'
      document.body.appendChild(scriptTag)
    }

    // Add style
    const style = document.createElement('style')
    style.textContent = 'body .uwy.userway_p1 .userway_buttons_wrapper { top: 30%; right: 0; }'
    document.body.append(style)
  }, 1000)
}

window.addEventListener('message', checkMessage, false)

function getMenu() {
  var menuItem = document.querySelectorAll('.menuitem')
  var index = 0
  var menuArray = []

  for (index = 0; index < menuItem.length; ++index) {
    if (menuItem[index].getAttribute('role') === 'link') {
      let status = menuItem[index].querySelector('span[role="presentation"]').getAttribute('class')
      let active = menuItem[index].querySelector('a.activeMenulink')
      menuArray.push({
        index: index,
        text: menuItem[index].getAttribute('title'),
        level: menuItem[index].getAttribute('aria-level') - 1,
        disabled: menuItem[index].getAttribute('aria-disabled') === 'true',
        completed: status === 'sidebar-completion-completed',
        active: !!active,
      })
    }
  }

  parent.postMessage({ menu: menuArray, command: 'getMenu' }, '*')
}

// eslint-disable-next-line
rscpCustomizationCompleted()

function setupLoadEvent() {
  const scormContent = document.getElementById('ScormContent')
  if (!scormContent) return
  scormContent.removeEventListener('load', loadHandler)
  scormContent.addEventListener('load', loadHandler)
}

setupLoadEvent()

const observer = new MutationObserver(function redirectToPanel() {
  parent.postMessage({ type: 'redirectToPanel' }, '*')
})

function loadHandler() {
  clearInterval(layoutInterval)
  setLayoutConfig()

  getMenu()

  const scormContentDocument = document.getElementById('ScormContent').contentDocument

  const pleaseWaitContainer = scormContentDocument.getElementById('PleaseWait')

  if (pleaseWaitContainer) {
    observer.observe(pleaseWaitContainer, { attributes: true, subtree: true, childList: true })
  }

  parent.postMessage({ state: scormContentDocument.readyState, command: 'documentReady' }, '*')
}

const setLayoutConfig = () => {
  if (window.innerWidth && window.innerWidth > 1023) return

  const scormContent = document.getElementById('ScormContent')

  const scormContentDocument = scormContent.contentDocument
  if (!scormContentDocument) return

  const scormBody = scormContentDocument.querySelector('body')

  if (!scormBody) return

  if (!scormContentDocument.getElementById('iframe--space-scorm')) {
    const space = document.createElement('div')
    space.id = 'iframe--space-scorm'
    space.setAttribute('style', 'height: 74px')
    scormBody.appendChild(space)
  }
}

/**
 * Set `onbeforeunload` to open popup alert when trying to close/refresh page.
 */
window.onbeforeunload = () => true
const layoutInterval = setInterval(setLayoutConfig, 500)
