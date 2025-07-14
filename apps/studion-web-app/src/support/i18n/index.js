import Vue from 'vue'
import VueI18n from 'vue-i18n'
import ptbr from './pt-br'
import config from '@/config'
import { MAIN_SET_LANGUAGE } from '../../store/types'

Vue.use(VueI18n)

const { DEFAULT_LANGUAGE, DEFAULT_CURRENCY, DEFAULT_CURRENCY_SEPARATOR, THEME_NAME } = config
const fallbackLocale = 'pt-br'
const loadedLanguages = []
let messages = {
  'pt-br': ptbr
}

const numberFormats = {
  [DEFAULT_CURRENCY_SEPARATOR]: {
    currency: {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      currencyDisplay: 'symbol'
    }
  }
}

const dateTimeConfig = {
  shortTime: {
    hour: 'numeric',
    minute: 'numeric'
  },
  shortDayMonth: {
    day: 'numeric',
    month: 'numeric'
  },
  shortDayMonthTime: {
    day: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  },
  short: {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  },
  long: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  },
  longSeconds: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }
}

const dateTimeFormats = {
  'pt-br': dateTimeConfig,
  'en': dateTimeConfig
}

function setI18nLanguage (i18n, lang) {
  i18n.locale = lang
  document.documentElement.lang = lang
}

const checkThemeMsgs = lang => {
  return new Promise((resolve) => {
    if (THEME_NAME === 'default') {
      resolve({})
      return
    }
    import(`./themesMessages/${THEME_NAME}/${lang}`)
      .then(themeMsgs => {
        resolve(themeMsgs)
      })
      .catch(e => {
        resolve({})
      })
  })
}

export function loadLanguageAsync (i18n, lang) {
  if ((i18n.locale === lang && !loadedLanguages.includes(lang)) || i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      return checkThemeMsgs(lang).then(themeMsgs => {
        return import(`./${lang}`).then(msgs => {
          let newMsgs = msgs.default
          newMsgs = { ...newMsgs, ...themeMsgs.default }
          i18n.setLocaleMessage(lang, newMsgs)
          loadedLanguages.push(lang)
          setI18nLanguage(i18n, lang)
        })
      })
    }
    return Promise.resolve(setI18nLanguage(i18n, lang))
  }
  return Promise.resolve(lang)
}

function buildVuexI18nPlugin (i18n) {
  return store => {
    store.subscribe(mutation => {
      if (mutation.type === MAIN_SET_LANGUAGE) {
        loadLanguageAsync(i18n, mutation.payload)
      }
    })
  }
}

const i18n = new VueI18n({
  locale: fallbackLocale,
  fallbackLocale: fallbackLocale,
  messages,
  numberFormats,
  dateTimeFormats,
  missing: (locale, key, vm) => {
    if (vm) {
      console.warn(`Missing translation: ${key} \nLocale: ${locale} \nComponent: ${vm.$options.name}`)
      return
    }

    console.warn(`Missing translation: ${key} \nLocale: ${locale}`)
  }
})

loadLanguageAsync(i18n, DEFAULT_LANGUAGE)

export const vuexI18nPlugin = buildVuexI18nPlugin(i18n)

export default i18n
