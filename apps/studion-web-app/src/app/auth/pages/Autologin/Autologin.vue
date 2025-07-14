<script>
import { mapActions } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'
import config from '@/config'

import { DEFAULT_HEADERS } from '@/support/utils/headersHelper'

const { DEFAULT_LANGUAGE } = config

export default {
  name: 'Autologin',

  created() {
    let anyChange = false
    DEFAULT_HEADERS.forEach((item, key, arr) => {
      if (this.$route.query[item]) {
        anyChange = !sessionStorage.getItem(item)
        sessionStorage.setItem(item, this.$route.query[item])
      }
      if (Object.is(arr.length - 1, key) && anyChange) {
        location.reload(true)
      }
    })

    const queryParams = this.$route.query

    if (queryParams.digest) {
      localStorage.setItem('SigeDigest', queryParams.digest)
    }

    if (this.checkParam(queryParams.token) && this.checkParam(queryParams.refresh_token)) {
      this.attemptSetToken(queryParams).then(() => {
        this.attemptUserAccountRetrieval().then(() => {
          if (this.checkParam(queryParams.language)) {
            this.setLanguage(queryParams.language)
          } else {
            this.setLanguage(DEFAULT_LANGUAGE)
          }
          if (this.checkParam(queryParams.redirect_route)) {
            let params = Object.assign({}, queryParams)
            let blackListKeys = ['token', 'refresh_token', 'redirect_route', 'language']
            blackListKeys.forEach((key) => delete params[key])
            this.$router.push({
              name: queryParams.redirect_route,
              params,
            })
          } else {
            this.$router.push({ name: 'dashboard' })
          }
        })
      })
    }
  },

  methods: {
    ...mapActions(['attemptSetToken', 'attemptUserAccountRetrieval', 'setLanguage']),
    checkParam(value) {
      return !isEmpty(value) || !isNil(value)
    },
  },
}
</script>

<template>
  <div></div>
</template>
