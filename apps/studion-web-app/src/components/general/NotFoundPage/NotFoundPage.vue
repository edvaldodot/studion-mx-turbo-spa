<script>
import { mapState } from 'vuex'
import Action from '../Action'
import Logo from '../Logo'

export default {
  name: 'notFoundPage',
  components: {
    Action,
    Logo,
  },
  computed: {
    ...mapState(['Account']),
  },
  methods: {
    goBack() {
      this.Account.user
        ? this.$router.push({ name: 'dashboard' })
        : this.$router.push({ name: 'auth.signin' })
    },
    getLabel() {
      return this.Account.user ? this.$t('404:btn:logged') : this.$t('404:btn')
    },
  },
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <logo
        v-if="$theme === 'default' && !this.Account.user"
        dark
      ></logo>
      <p class="text-color">{{ $t('404:message') }}</p>
      <action
        type="button"
        :text="getLabel()"
        secondary
        large
        @click="goBack()"
      ></action>
    </div>
    <div class="not-found-image">
      <img src="/assets/images/themes/default/bkg/404-error.png" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'NotFoundPage.scss';
</style>
