import { mapState } from 'vuex'
import { v4 as uuidv4 } from 'uuid'

import cloneDeep from 'lodash/cloneDeep'
import isMatchWith from 'lodash/isMatchWith'
import config from '@/config'

const {
  THEME_NAME,
  GAMIFICATION_ENABLE,
  HIDDEN_TOOLS,
  BLOCK_META_OPT_IN,
  CARDS_BANNERS,
  HIDDEN_MENU_ITEMS,
  HIDDEN_FEATURES,
  LARGE_FILES_MAX_SIZE,
  SMALL_FILES_MAX_SIZE,
  PORTAL_CONFIGS,
  SIGE_CONFIGS,
  SEND_PORTAL_REDIRECT_TRAIL_ID,
  REMOVE_DATA_TESTID,
  HIDE_CERTIFICATE_DOWNLOAD,
} = config

export const mixin = {
  computed: {
    ...mapState(['Account', 'Settings']),
    $theme() {
      return THEME_NAME
    },
    $hiddenTools() {
      return HIDDEN_TOOLS
    },
    $media() {
      return {
        mobile: this.$mq === 'mobile',
        tablet: this.$mq === 'tablet',
        desktop: this.$mq === 'desktop',
      }
    },

    $userUuid() {
      const user = this.Account && this.Account.user
      return user && user.uuid
    },

    isUserInClassroom() {
      const currentLocation = this.$route.path
      const regexClassroom = /\/classroom\/[0-9a-fA-F]{8}/
      return regexClassroom.test(currentLocation)
    },
  },
  methods: {
    canRead(context) {
      if (this.Account.user == null) {
        return false
      }
      if (this.Account.user.currentProfile !== 'agent') {
        return true
      }
      let denied = this.Account.user.permissionsDenied.filter((item) => {
        return item.context === context && item.actionType === 'read'
      })
      return denied.length === 0
    },
    isUserAllowedInContext(context, actionTypes) {
      if (this.Account.user == null) {
        return false
      }
      if (this.Account.user.currentProfile !== 'agent') {
        return true
      }
      let denied = this.Account.user.permissionsDenied.filter((item) => {
        return item.context === context && item.actionType === actionTypes
      })
      return denied.length === 0
    },
    deepClone(source) {
      return cloneDeep(source)
    },
    isDeeplyEqual(obj, src) {
      return isMatchWith(obj, src, (objValue, srcValue) => {
        if (typeof objValue === 'object' && typeof srcValue === 'object') {
          if (Array.isArray(objValue) && objValue.length !== srcValue.length) {
            return false
          }
          return this.isDeeplyEqual(objValue, srcValue)
        }
        if (!objValue.hasOwnProperty('toString') || !srcValue.hasOwnProperty('toString')) {
          return objValue !== srcValue
        }
        return objValue.toString() === srcValue.toString()
      })
    },
    canWrite(context) {
      if (this.Account.user == null) {
        return false
      }
      if (this.Account.user.currentProfile !== 'agent') {
        return true
      }
      let denied = this.Account.user.permissionsDenied.filter((item) => {
        return item.context === context && (item.actionType === 'write' || item.blockedRead === true);
      })
      return denied.length === 0
    },
    equalsProfile(profile) {
      return this.Account.user && this.Account.user.currentProfile === profile
    },
    notEqualsProfile(profile) {
      return this.Account.user && this.Account.user.currentProfile !== profile
    },
    isStudent() {
      return this.equalsProfile('student')
    },
    hasAccountInfo() {
      return this.Account && this.Account.user && Object.keys(this.Account.user).length !== 0
    },
    isGamificationEnable() {
      return GAMIFICATION_ENABLE
    },
    isCardsBannersLayout() {
      return CARDS_BANNERS
    },
    blockMetaOptIn() {
      return BLOCK_META_OPT_IN
    },
    parseMinutesToHoursMinutes(minutes) {
      const hours = Math.floor(minutes / 60)
      const minutesLeft = minutes % 60
      return `${hours}:${minutesLeft}`
    },
    getDurationText(duration) {
      const type = duration.slice(-1)
      const value = Number(duration.slice(0, -1))
      if (type === 'm' || type === 'h' || type === 'i') {
        return this.formatVisualTime({ type, value })
      }
      return this.$tc(`global:solution.duration.type.${type}`, value, { num: value })
    },
    isDateBeforeToday(dateString) {
      const inputDate = new Date(dateString)
      const today = new Date()

      today.setHours(0, 0, 0, 0)
      inputDate.setHours(0, 0, 0, 0)

      return inputDate < today
    },
    addTimeToDate(input, baseDate = new Date()) {
      const regex = /^(\d+)([hwd])$/i
      const match = input.match(regex)

      if (match) {
          const amount = parseInt(match[1], 10)
          const unit = match[2].toLowerCase()

          const newDate = new Date(baseDate)

          switch (unit) {
              case "h":
                  newDate.setHours(newDate.getHours() + amount)
                  break
              case "d":
                  newDate.setDate(newDate.getDate() + amount)
                  break
              case "w":
                  newDate.setDate(newDate.getDate() + amount * 7)
                  break
              default:
                  return null
          }

          return newDate.toISOString()
      } else {
          return null
      }
  },
    daysSinceDate (date) {
      const givenDate = new Date(date)
      const today = new Date()

      const diff = today - givenDate

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      return days
    },
    formatVisualTime(payload) {
      const timeParsed = this.parseMinutesToHoursMinutes(
        payload.type === 'h' ? Number(payload.value) * 60 : payload.value
      )
      let time = ''

      if (Number(timeParsed.split(':')[0]) !== 0) {
        time = `${timeParsed.split(':')[0]}h `
      }

      if (Number(timeParsed.split(':')[1]) !== 0) {
        time += ` ${timeParsed.split(':')[1]}min `
      }

      return time
    },
    formatDate(date, format = 'short') {
      return date ? this.$d(new Date(date), format) : ''
    },
    convertToLocalTime(date, dateType) {
      const dateUTC = new Date(date)
      const zoneTimeMinutes = dateUTC.getTimezoneOffset()
      const millisecondOffset = zoneTimeMinutes * 60 * 1000
      const dateLocal = new Date(dateUTC.getTime() - millisecondOffset)
      const regexHours = /(\d{2}):(\d{2}):(\d{2})/
      const regexDate = /(\d{4})-(\d{2})-(\d{2})/
      const stringConverterHour = dateLocal.toString()
      const stringConverterDate = dateLocal.toISOString()

      if (dateType == 'hour') {
        const hourResult = regexHours.exec(stringConverterHour)
        return `${hourResult[1]}h${hourResult[2]}`
      } else {
        const dateResult = regexDate.exec(stringConverterDate)
        return `${dateResult[3]}/${dateResult[2]}/${dateResult[1]}`
      }
    },
    isHiddenMenu(menuItem) {
      return (
        typeof HIDDEN_MENU_ITEMS !== 'undefined' &&
        HIDDEN_MENU_ITEMS.split(',').indexOf(menuItem) !== -1
      )
    },
    $isHiddenFeature(feature) {
      return typeof HIDDEN_FEATURES !== 'undefined' && HIDDEN_FEATURES.indexOf(feature) !== -1
    },
    $isEnabledFeature(feature) {
      return (
        this.Settings &&
        this.Settings.enabledFeatures &&
        this.Settings.enabledFeatures.indexOf(feature) !== -1
      )
    },
    $filesMaxSize(option) {
      if (option === 'large') {
        return LARGE_FILES_MAX_SIZE
          ? parseInt(LARGE_FILES_MAX_SIZE) * 1024 * 1024
          : 500 * 1024 * 1024
      }

      return SMALL_FILES_MAX_SIZE ? parseInt(SMALL_FILES_MAX_SIZE) * 1024 * 1024 : 100 * 1024 * 1024
    },
    $hasBoolBgVariable(variable) {
      let lightFlag = getComputedStyle(document.body).getPropertyValue(variable)
      return lightFlag && lightFlag === '1'
    },
    $portalRedirect(config, params = {}) {
      let redirectURL = `${PORTAL_CONFIGS[config]}`
      const needsTrailId = SEND_PORTAL_REDIRECT_TRAIL_ID && params && params.trailId

      if (needsTrailId) redirectURL += `/redirect/${params.trailId}`

      PORTAL_CONFIGS && PORTAL_CONFIGS[config]
        ? (window.location.href = redirectURL)
        : (window.location.href = '404')
    },
    $SigeRedirect(config) {
      let SigeDigest = localStorage.getItem('SigeDigest')

      let redirectURL = `${SIGE_CONFIGS[config]}${SigeDigest}`

      SIGE_CONFIGS && SIGE_CONFIGS[config]
        ? (window.location.href = redirectURL)
        : (window.location.href = '404')
    },
    $testId(id) {
      return !!REMOVE_DATA_TESTID && REMOVE_DATA_TESTID ? '' : id
    },
    $hideCertificateDownload() {
      return Boolean(HIDE_CERTIFICATE_DOWNLOAD)
    },
    saveToLocalStorage(key, value) {
      localStorage.setItem(key, JSON.stringify(value))
    },
    getFromLocalStorage(key) {
      const storedValue = localStorage.getItem(key)
      return storedValue ? JSON.parse(storedValue) : null
    },

    textLimit(texto, limite) {
      if (texto.length > limite) {
        return texto.substring(0, limite) + '...'
      }
      return texto
    },

    loadItemsPerPagePreferences(queryParams) {
      const itemsPerPagePreferences = this.getFromLocalStorage('itemsPerPagePreferences') || {}
      if (itemsPerPagePreferences[this.$route.name]) {
        queryParams.limit = itemsPerPagePreferences[this.$route.name]
      }
    },

    $mediationAiEnabled() {
      return this.$isEnabledFeature('pm_ai') && this.$isEnabledFeature('ai_provider')
    },

    $upperCase(str) {
      if (!str) return ''
      return str.toUpperCase()
    },

    $isUserImpersonated() {
      return this.Account.user.isImpersonate
    },

    $impersonateFeedbackError() {
      if (this.$isEnabledFeature('impersonate_read_only') && this.$isUserImpersonated()) {
        this.setFeedback({
          message: this.$t('impersonate_not_allowed_method'),
          type: 'error',
          impersonated: true,
        })
      }
    },
    $clearHTMLTags(str) {
      return str.replace(/<[^>]*>/g, '')
    },
    $uuid() {
      return uuidv4()
    },
  },
}
