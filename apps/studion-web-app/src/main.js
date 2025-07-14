import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import fetchConfig from '@/fetchConfig'
import Vuelidate from 'vuelidate'
import vClickOutside from 'v-click-outside'
import VueShave from 'vue-shave'
import VDragged from 'v-dragged'
import VueMq from 'vue-mq'
import VueObserveVisibility from 'vue-observe-visibility'
import VueTouch from 'vue-touch'
import VueGtm from '@gtm-support/vue2-gtm'
import VueForceNextTick from '@/support/plugins/forceNextTick'
import Hotjar from 'vue-hotjar'
import VueInputAutowidth from 'vue-input-autowidth'
import VueGtag from 'vue-gtag'

const initializeVue = async () => {
  const App = () => import(/* webpackChunkName: "main" */ './Main.vue')
  const { default: config } = await import(/* webpackChunkName: "main" */ '@/config')
  const { default: KeycloakAuth } = await import(/* webpackChunkName: "main" */ '@/support/plugins/keycloakAuth')
  const { default: i18n } = await import(/* webpackChunkName: "main" */ '@/support/i18n')
  const { default: store } = await import(/* webpackChunkName: "main" */ './store')
  const { default: router } = await import(/* webpackChunkName: "main" */ './router')
  const { default: httpPlugin } = await import(/* webpackChunkName: "main" */ '@/support/http')
  const { mixin } = await import(/* webpackChunkName: "main" */ './mixins/index')
  const { analyticsMixin } = await import(/* webpackChunkName: "main" */ './mixins/analyticsMixin')
  const dynamicHeaderHelper = await import(/* webpackChunkName: "main" */ '@/support/utils/dynamicHeaderHelper')

  const {
    THEME_NAME,
    DEFAULT_ACCESSIBILITY,
    APP_TITLE,
    APP_DESCRIPTION,
    HOTJAR_ID,
    GTM_TOKEN,
    GA4_TOKEN,
  } = config
  let theme = THEME_NAME
  let themeColorFallback = '#123352'

  document.body.setAttribute('data-theme', theme)

  let themeLoadPromise = import(`./assets/styles/scss/main.scss`)

  import(`./assets/styles/themes/themes.scss`)

  if (theme !== 'default') {
    themeLoadPromise = import(`./assets/styles/themes/${theme}/global.scss`)
  }

  themeLoadPromise.then(() => {
    const sassPrimaryThemeColor = getComputedStyle(document.body).getPropertyValue('--primary-color')
    dynamicHeaderHelper.setAll({
      THEME_NAME,
      THEME_COLOR: sassPrimaryThemeColor || themeColorFallback,
      APP_DESCRIPTION,
      APP_TITLE,
    })
  })

  Vue.config.productionTip = false
  Vue.config.devtools = true
  Vue.config.performance = true

  Vue.use(KeycloakAuth)
  Vue.use(VueTouch)
  Vue.use(httpPlugin, {store, router})
  Vue.use(Vuelidate)
  Vue.use(vClickOutside)
  Vue.use(VueShave)
  Vue.use(VDragged)
  Vue.use(VueObserveVisibility)
  Vue.use(VueForceNextTick)
  Vue.use(VueMq, {
    breakpoints: {
      mobile: 1024,
      tablet: 1025,
      desktop: Infinity
    }
  })
  Vue.use(VueInputAutowidth)

  if (HOTJAR_ID) {
    Vue.use(Hotjar, {
      id: HOTJAR_ID,
      isProduction: process.env.NODE_ENV === 'production',
      snippetVersion: 6
    })
  }

  Vue.mixin(mixin)
  Vue.mixin(analyticsMixin)

  store.state.accessibility = DEFAULT_ACCESSIBILITY
  store.state.fullscreen = false

  sync(store, router)

  if (GTM_TOKEN && Array.isArray(GTM_TOKEN) && GTM_TOKEN.length) {
    try {
      Vue.use(VueGtm, {
        id: GTM_TOKEN,
        defer: true,
        enabled: true,
        debug: false,
        loadScript: true,
        vueRouter: router
      })
    } catch (e) {}
  }

  const analyticsIgnoreRoutes = [
    'auth.signin',
    'auth.autologin',
    'auth.oauth',
    'auth.oauth.callback',
    'auth.activate',
    'auth.activate.code',
    'auth.signup',
    'auth.recovery',
    'auth.recovery.confirm',
    'auth.username.recovery',
    'auth.username.recovery.confirm',
    'auth.reset',
    'auth.reset.confirm'
  ]

  if (GA4_TOKEN && Array.isArray(GA4_TOKEN) && GA4_TOKEN.length) {
    let ga4List = []
    ga4List = GA4_TOKEN.map(tag => ({ id: tag, params: { send_page_view: false, debug_mode: false } }))
    const primaryTag = ga4List[0]
    ga4List.shift()

    Vue.use(VueGtag, {
      pageTrackerExcludedRoutes: analyticsIgnoreRoutes,
      config: primaryTag,
      includes: ga4List.length ? ga4List : []
    }, router)
  }

  window.app = new Vue({
    el: '#app',
    store,
    router,
    i18n,
    template: '<App/>',
    render: h => h(App)
  })
}

fetchConfig().then(() => {
  initializeVue()
})