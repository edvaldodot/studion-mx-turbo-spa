import config from '@/config'

const { MINUTES_TILL_LOGOUT } = config

export const LogoutTimerMixin = {
  data() {
    return {
      logoutTimer: null,
      showModalInactivity: false,
      isRunningIdleTimer: false,
    }
  },

  mounted() {
    const inactivity = this.getFromLocalStorage('inactivity')
    if (inactivity) {
      this.$router.push({ name: 'auth.logout' })

      this.saveToLocalStorage('inactivity', false)
    }

    this.startLogoutTimer()

    window.addEventListener('click', () => {
      this.isRunningIdleTimer && this.restartLogoutTimer()
    })
  },

  destroyed() {
    window.removeEventListener('click', this.restartLogoutTimer)
  },

  methods: {
    startLogoutTimer() {
      const logoutTime = MINUTES_TILL_LOGOUT && parseInt(MINUTES_TILL_LOGOUT)

      if (!logoutTime || isNaN(logoutTime) || logoutTime <= 0) {
        return
      }

      const logoutTimeMs = logoutTime * 60 * 1000

      this.isRunningIdleTimer = true

      this.logoutTimer = setTimeout(() => {
        sessionStorage.clear()
        localStorage.clear()
        this.$nextTick(() => {
          this.saveToLocalStorage('inactivity', true)
        })
        this.showModalInactivity = true
      }, logoutTimeMs)
    },

    restartLogoutTimer() {
      clearTimeout(this.logoutTimer)
      this.startLogoutTimer()
    },

    stopLogoutTimer() {
      this.isRunningIdleTimer = false
      clearTimeout(this.logoutTimer)
    },
  },

  beforeRouteEnter(_, __, next) {
    next((vm) => {
      vm.restartLogoutTimer()
    })
  },

  beforeRouteUpdate(_, __, next) {
    this.restartLogoutTimer()
    next()
  },

  beforeRouteLeave(_, __, next) {
    this.stopLogoutTimer()
    next()
  },
}
