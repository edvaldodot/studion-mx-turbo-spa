export const cookieMixin = {
  methods: {
    /**
     * Set cookie in application
     * @param {String} cname - Cookie name
     * @param {String} cvalue - Cookie value
     * @param {Number} exdays - Expire time (in days)
     */
    setCookie(cname, cvalue, exdays) {
      const d = new Date()
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
      const expires = 'expires=' + d.toUTCString()
      document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
    },

    /**
     * Get cookie from application
     * @param {String} cname - Cookie name
     * @returns {String}
     */
    getCookie(cname) {
      const name = cname + '='
      const ca = document.cookie.split(';')
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
          c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length)
        }
      }
      return ''
    },
  },
}
