<script>
import { mapActions } from 'vuex'

export default {
  name: 'OauthCallback',
  methods: {
    ...mapActions([
      'attemptSetToken',
      'attemptUserAccountRetrieval'
    ])
  },
  created () {
    if (this.$route.query.token !== undefined && this.$route.query.refresh_token !== undefined) {
      this.attemptSetToken(this.$route.query).then(() => {
        this.attemptUserAccountRetrieval()
          .then(() => {
            if (window.opener) {
              window.opener.location = '/dashboard'
              window.parent.close()
            } else {
              this.$router.push({ name: 'dashboard' })
            }
          })
      })
    }
  }
}
</script>

<template>
  <div></div>
</template>
