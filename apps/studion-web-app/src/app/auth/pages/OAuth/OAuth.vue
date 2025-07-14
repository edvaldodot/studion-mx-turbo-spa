<script>
import config from '@/config'

const { APP_KEY, APP_SECRET, OAUTH_REDIRECT_URI, FACEBADGE_URL } = config

export default {
  name: 'Oauth',
  created () {
    if (!window.opener && window.parent.name !== 'oauth-window') {
      this.$router.push({ name: 'auth.signin' })
    } else {
      let oauthURL = `${FACEBADGE_URL}/authorize?response_type=code&connection=${this.$route.params.connection}&client_id=${APP_KEY}&client_secret=${APP_SECRET}&redirect_uri=${OAUTH_REDIRECT_URI}`
      window.location = oauthURL
    }
  }
}
</script>

<template>
  <div></div>
</template>
