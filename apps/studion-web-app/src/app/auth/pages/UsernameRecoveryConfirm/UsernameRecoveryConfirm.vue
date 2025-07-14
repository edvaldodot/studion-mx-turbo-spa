<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import LinksBar from '@/components/general/LinksBar'
import Logo from '@/components/general/Logo'
import Tabs from '@/components/general/Tabs'

export default {
  name: 'UsernameRecoveryConfirm',
  components: {
    Action,
    LinksBar,
    Logo,
    Tabs
  },
  data () {
    return {
      email: null,
      tablinks: [
        {
          text: 'auth:tab.login',
          location: { name: 'auth.signin' }
        },
        {
          text: 'auth:tab.register',
          location: { name: 'auth.signup' },
          disabled: true
        }
      ]
    }
  },
  computed: {
    ...mapState(['accessibility'])
  },
  methods: {
    ...mapActions([
      'attemptUsernameRecovery',
      'setFeedback',
      'setFetching',
      'attemptPostInstanceSettingsRetrieval'
    ]),
    submit () {
      this.setFetching(true)
      this.attemptUsernameRecovery(this.email)
        .catch(() => {
          this.setFeedback({message: this.$t('auth.username.recovery.confirm:feedback.error'), type: 'error'})
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    back () {
      this.$router.push({ name: 'auth.username.recovery' })
    }
  },
  created () {
    this.email = this.$route.params.email
    this.setFetching(true)
    this.attemptPostInstanceSettingsRetrieval()
      .then((response) => {
        const allowRegister = response.data.allow_register
        if (allowRegister) {
          this.tablinks[1].disabled = false
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
  }
}
</script>

<template>
  <div class="main-content  auth">
    <LinksBar dark />
    <div class="old-center clearfix">
      <div class="company" v-if="$media.mobile">
        <Logo class="company-logo" :theme="$theme" dark />
        <p class="company-headline">{{ $t('global:studion.headline') }}</p>
        <p class="company-text"></p>
      </div>
      <div class="form theme-dark">
        <Tabs :links="tablinks" dark />

        <Action
          v-if="!$media.mobile"
          :data-testid="$testId('action-button--back')"
          :text="$t('global:back')"
          icon="keyboard_backspace"
          type="button"
          class="back"
          @click="back()"
          flat
          dark
        />

        <div class="description">
          <h2>{{ $t('auth.username.recovery.confirm:title') }}</h2>
          <p v-html="$t('auth.username.recovery.confirm:message', {email})"></p>
        </div>
        <form class="login-form" @submit.prevent="submit">
          <div class="form-submit other-login">
            <Action
              :data-testid="$testId('action-button--submit')"
              :text="$t('auth.username.recovery.confirm:form.submit')"
              :dark="accessibility"
              type="button"
              fixed-width
              secondary
              submit
              large
            />
          </div>
        </form>
      </div>
      <div class="company" v-if="!$media.mobile">
        <Logo class="company-logo" :theme="$theme" dark />
        <p class="company-headline">{{ $t('global:studion.headline') }}</p>
        <p class="company-text"></p>
      </div>
      <div class="support" v-if="$media.mobile">
        <p class="support-text"></p>
        <div class="support-images"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@/app/auth/styles.scss";
</style>
