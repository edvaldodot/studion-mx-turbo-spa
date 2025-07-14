<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Logo from '@/components/general/Logo'
import Icon from '@/components/general/Icon'
import InlineSvg from 'vue-inline-svg'

import EntranceScreensWrapper from '../components/EntranceScreensWrapper/EntranceScreensWrapper.vue'

export default {
  name: 'Signin',
  components: {
    Action,
    InputField,
    Logo,
    Icon,
    EntranceScreensWrapper,
    InlineSvg,
  },
  data() {
    return {
      username: null,
      password: null,
      showRegisterLink: true,
      providers: [],
      allowRegister: false,
    }
  },
  validations: {
    username: {
      required,
    },
    password: {
      required,
    },
  },
  computed: {
    ...mapState(['accessibility']),
    signinAttempts() {
      return this.$store.state.Auth.signinAttempts
    },
  },
  created() {
    window.addEventListener('message', this.oauthCallback, false)
    this.setFetching(true)
    this.attemptPostInstanceSettingsRetrieval()
      .then((response) => {
        this.providers = response.data.providers.filter((obj) => obj.enabled)
        this.allowRegister = response.data.allow_register

        if (this.allowRegister) {
          this.showRegisterLink = this.allowRegister
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
  destroyed() {
    window.removeEventListener('message', this.oauthCallback, false)
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptLogin',
      'attemptSetToken',
      'attemptUserAccountRetrieval',
      'attemptPostInstanceSettingsRetrieval',
    ]),
    submit() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        const { username, password } = this
        this.setFetching(true)
        this.attemptLogin({ username, password })
          .then(() => {
            this.getAccount()
          })
          .catch(({ response }) => {
            if (response.data.message === 'account_not_activate') {
              return this.$router.push({
                name: 'auth.activate',
                params: { username: this.username },
              })
            }
            if (response.data.message === 'application_user_not_activated') {
              this.setFeedback({ message: this.$t('auth.signin:feedback.invalid:user.disabled') })
            } else if (response.data.message === 'too_many_requests') {
              const time = response.headers['retry-after']
              this.setFeedback({ message: this.$t('auth.signin:feedback.invalid') })
              this.$router.push({ path: `/auth/blocked/${time}` })
            } else if (
              response.data.message === 'instance_not_found' ||
              response.data.message === 'instance_expired'
            ) {
              this.setFeedback({
                message: this.$t('auth.signin:feedback.invalid:instance.disabled'),
              })
            } else if (response.data.code === 401) {
              this.setFeedback({ message: this.$t('auth.signin:feedback.invalid') })
            }
            this.resetForm()
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    resetForm() {
      this.$v.$reset()
      this.username = null
      this.password = null
    },
    getAccount() {
      this.setFetching(true)
      this.attemptUserAccountRetrieval()
        .then(() => {
          this.nextPage()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    nextPage() {
      const { lastUrl } = this.$route.params

      if (lastUrl) {
        return this.$router.replace({ path: lastUrl })
      }

      this.$router.replace({ name: 'dashboard', params: { login: true } })
    },
    closePopup() {
      this.popup.close()
    },
    openOAuthPopup(connection) {
      this.popup = window.open(
        `/auth/oauth/${connection}`,
        'oauth-window',
        'resizable,scrollbars,status,width=420,height=520'
      )
    },
    oauthCallback(e) {
      let data = e.data
      if (data.hasOwnProperty('command') && data.command === 'oauthCallback') {
        this.setFetching(true)
        this.attemptSetToken(data.token)
          .then(() => {
            this.closePopup()
            this.getAccount()
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
      return true
    },
    toRegister() {
      this.$router.push({ name: 'auth.signup' })
    },
  },
}
</script>

<template>
  <EntranceScreensWrapper>
    <div class="border-round-lg w-12 xl:w-11 border-1 border-black-200 surface-0 p-5">
      <div class="flex justify-content-center">
        <Logo
          logo
          :theme="$theme"
        />
      </div>
      <div class="text-black-900 lato-regular text-2xl text-center my-4">
        Que bom ter você por aqui
      </div>
      <form
        :data-testid="$testId('auth--signin-form')"
        class="flex flex-column gap-3 w-11 xl:w-9 m-auto"
        @submit.prevent="submit"
      >
        <InputField
          v-model="username"
          :data-testid="$testId('input-field--username')"
          :label="$t('global:form.username')"
          :validation="$v.username"
          autocomplete="username"
          autocapitalize="none"
          type="text"
          dark
        />
        <InputField
          v-model="password"
          :data-testid="$testId('input-field--password')"
          :label="$t('global:form.password')"
          :validation="$v.password"
          autocomplete="current-password"
          type="password"
          dark
        />
        <div class="grid align-items-center text-base font-bold text-right">
          <div class="col-12">
            <router-link
              :data-testid="$testId('link--forgot-password')"
              :to="'/auth/recovery'"
              class="text-primary"
            >
              {{ $t('auth.signin:forgot.link') }}
            </router-link>
          </div>
          <div class="col-12">
            <router-link
              :data-testid="$testId('link--forgot-username')"
              :to="'/auth/username/recovery'"
              class="text-primary"
            >
              {{ $t('auth.signin:forgot.username.link') }}
            </router-link>
          </div>
        </div>

        <div>
          <div class="flex justify-content-center my-5">
            <Action
              :data-testid="$testId('action-button--submit')"
              :text="$t('auth.signin:form.submit')"
              :dark="accessibility"
              type="button"
              fixed-width
              secondary
              submit
              large
            />
          </div>
          <template v-if="providers.length">
            <div class="flex gap-1 align-items-center my-5 text-sm text-black-900">
              <div class="flex-1">
                <hr />
              </div>
              <div>{{ $t('auth:login.social') }}</div>
              <div class="flex-1">
                <hr />
              </div>
            </div>
            <div class="flex justify-content-center my-5 other-login">
              <div
                v-for="(provider, index) in providers"
                :key="index"
                @click="openOAuthPopup(provider.alias)"
              >
                <InlineSvg
                  class="cursor-pointer"
                  :src="`/assets/images/svg/social/${provider.alias}.svg`"
                />
              </div>
            </div>
          </template>

          <div
            v-if="showRegisterLink"
            class="text-center text-primary text-base font-bold"
          >
            {{ $t('auth:not.account') }}
            <a
              class="underline cursor-pointer"
              @click="toRegister"
            >
              {{ $t('auth:register') }}
            </a>
          </div>
        </div>
      </form>
    </div>
  </EntranceScreensWrapper>
</template>

<style lang="scss">
@import './Signin.scss';
body,
#app,
.main {
  height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
}
</style>
