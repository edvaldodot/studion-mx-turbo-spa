<script>
import { mapState, mapActions } from 'vuex'

import Action from '@/components/general/Action'
import LinksBar from '@/components/general/LinksBar'
import Logo from '@/components/general/Logo'
import Tabs from '@/components/general/Tabs'

export default {
  name: 'SignupActivateEmail',
  components: {
    Action,
    LinksBar,
    Logo,
    Tabs,
  },
  data() {
    return {
      defaultEmail: null,
      tablinks: [
        {
          text: 'auth:tab.login',
          location: { name: 'auth.signin' },
        },
        {
          text: 'auth:tab.register',
          location: { name: 'auth.signup' },
        },
      ],
    }
  },
  computed: {
    ...mapState(['accessibility']),
    email() {
      return this.defaultEmail || this.$route.params.email
    },
    username() {
      return this.$route.params.username || null
    },
  },
  methods: {
    ...mapActions([
      'attemptActivationAccountLinkByEmail',
      'attemptActivationAccountLinkByUsername',
      'setFetching',
    ]),
    back() {
      this.$router.push({ name: 'auth.signin' })
    },
    sendEmail() {
      this.email ? this.sendByEmail() : this.sendByUsername()
    },
    sendByEmail() {
      let email = this.email
      this.setFetching(true)
      this.attemptActivationAccountLinkByEmail(email)
        .then((response) => {
          this.defaultEmail = response.data.email
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    sendByUsername() {
      let username = this.username
      this.setFetching(true)
      this.attemptActivationAccountLinkByUsername(username)
        .then((response) => {
          this.defaultEmail = response.data.email
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <div class="main-content auth">
    <LinksBar dark />
    <div class="old-center clearfix">
      <div
        class="company"
        v-if="$media.mobile"
      >
        <Logo
          class="company-logo"
          :theme="$theme"
          dark
        />
        <p class="company-headline">{{ $t('global:studion.headline') }}</p>
      </div>
      <div class="form">
        <Tabs
          :links="tablinks"
          dark
        />

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
        <div class="validate">
          <template v-if="email">
            <h1 class="validate-title">{{ $t('auth.validate:title') }}</h1>
            <div class="validate-description">
              <p v-html="$t('auth.validate:description.1', { email: this.email })"></p>
              <p class="text-color">{{ $t('auth.validate:description.2') }}</p>
              <p class="text-color">{{ $t('auth.validate:description.3') }}</p>
            </div>
          </template>
          <template v-if="username && !email">
            <h1 class="validate-title">{{ $t('auth.validate:not.activated.title') }}</h1>
            <div class="validate-description">
              <p class="text-color">{{ $t('auth.validate:not.activated.description.1') }}</p>
              <p class="text-color">{{ $t('auth.validate:not.activated.description.2') }}</p>
            </div>
          </template>
        </div>
        <div class="form-submit">
          <Action
            :data-testid="$testId('action-button--submit')"
            :text="$t('auth.validate:form.submit')"
            :dark="accessibility"
            type="button"
            @click="sendEmail()"
            fixed-width
            secondary
            large
          />
        </div>
      </div>
      <div
        class="company"
        v-if="!$media.mobile"
      >
        <Logo
          class="company-logo"
          :theme="$theme"
          dark
        />
        <p class="company-headline">{{ $t('global:studion.headline') }}</p>
      </div>
      <div
        class="support"
        v-if="$media.mobile"
      >
        <p class="support-text"></p>
        <div class="support-images"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/app/auth/styles.scss';
</style>
