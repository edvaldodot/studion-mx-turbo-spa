<script>
import { mapState, mapActions } from 'vuex'

import Action from '@/components/general/Action'
import LinksBar from '@/components/general/LinksBar'
import Logo from '@/components/general/Logo'
import Tabs from '@/components/general/Tabs'

export default {
  name: 'SignupActivate',
  components: {
    Action,
    LinksBar,
    Logo,
    Tabs,
  },
  data() {
    return {
      loading: true,
      codeValid: false,
      codeExpired: false,
      codeInvalid: false,
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
    code() {
      return this.$route.params.code || null
    },
  },
  methods: {
    ...mapActions([
      'attemptActivateAccount',
      'attemptActivationAccountLinkByActivationKey',
      'setFetching',
    ]),
    back() {
      this.$router.push({ name: 'auth.signin' })
    },
    submit() {
      this.loading = true
      let token = this.$route.params.code
      this.setFetching(true)
      this.attemptActivationAccountLinkByActivationKey(token)
        .then((response) => {
          this.loading = false
          return this.$router.push({
            name: 'auth.activate',
            params: { email: response.data.email },
          })
        })
        .catch(({ response }) => {
          this.loading = false
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
  created() {
    this.loading = true
    let token = this.$route.params.code
    this.setFetching(true)
    this.attemptActivateAccount(token)
      .then(() => {
        this.loading = false
        this.codeValid = true
      })
      .catch(({ response }) => {
        this.loading = false
        if (response.data.message === 'account_not_found') {
          this.codeInvalid = true
        } else if (response.data.message === 'activation_time_expired') {
          this.codeExpired = true
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
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
          <template v-if="!loading && codeValid">
            <h1 class="validate-title">{{ $t('auth.validate:code.valid.title') }}</h1>
            <div class="validate-description">
              <p v-html="$t('auth.validate:code.valid.description')"></p>
            </div>
          </template>
          <template v-if="!loading && codeExpired">
            <h1 class="validate-title">{{ $t('auth.validate:code.expired.title') }}</h1>
            <div class="validate-description">
              <p class="text-color">{{ $t('auth.validate:code.expired.description') }}</p>
            </div>
          </template>
          <template v-if="!loading && codeInvalid">
            <h1 class="validate-title">{{ $t('auth.validate:code.invalid.title') }}</h1>
            <div class="validate-description">
              <p v-html="$t('auth.validate:code.invalid.description')"></p>
            </div>
          </template>
        </div>
        <div
          class="form-submit other-login"
          v-if="codeExpired"
        >
          <Action
            :data-testid="$testId('action-button--submit')"
            :text="$t('auth.validate:form.submit')"
            :dark="accessibility"
            type="button"
            @click="submit()"
            fixed-width
            secondary
            submit
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
