<script>
import { mapActions, mapState } from 'vuex'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import userEmail from '@/support/customValidators/userEmail'
import usernameValidator from '@/support/customValidators/usernameValidator'
import { withParams } from 'vuelidate/lib/validators/common'
import config from '@/config'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import Logo from '@/components/general/Logo'
import Tabs from '@/components/general/Tabs'
import InlineSvg from 'vue-inline-svg'

import EntranceScreensWrapper from '../components/EntranceScreensWrapper/EntranceScreensWrapper.vue'

import MIN_PASSWORD_SIZE, {
  DEFAULT_MIN_PASSWORD_SIZE,
  DEFAULT_MAX_PASSWORD_SIZE,
} from '@/support/utils/passwordSize'

const { APP_KEY, APP_SECRET, OAUTH_REDIRECT_URI, FACEBADGE_URL } = config
export default {
  name: 'Signup',
  components: {
    Action,
    Checkbox,
    InputField,
    Logo,
    Tabs,
    InlineSvg,
    EntranceScreensWrapper,
  },
  data() {
    return {
      texts: null,
      oauthWindow: {},
      name: null,
      username: null,
      email: null,
      password: null,
      isPasswordValid: false,
      termsConditions: false,
      appUserNotExists: false,
      userExistsErrorValue: '',
      usernameExistsErrorValue: '',
      accountInfo: {
        email: '',
        name: '',
        username: '',
      },
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
      providers: [],
      allowRegister: false,
    }
  },
  validations() {
    return {
      name: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(255),
      },
      username: {
        required,
        usernameValidator,
        usernameExistsValidator: withParams(
          { type: 'usernameExistsValidator' },
          (value, parentVm) => {
            return !(
              parentVm.usernameExists.length > 0 &&
              value.length > 0 &&
              parentVm.usernameExists === value
            )
          }
        ),
      },
      email: {
        required,
        userEmail,
        userExistsValidator: withParams({ type: 'userExistsValidator' }, (value, parentVm) => {
          return !(
            parentVm.userExists.length > 0 &&
            value.length > 0 &&
            parentVm.userExists === value
          )
        }),
      },
      password: {
        required,
        minLength: minLength(
          this.$isEnabledFeature('password_requirements')
            ? MIN_PASSWORD_SIZE
            : DEFAULT_MIN_PASSWORD_SIZE
        ),
        maxLength: maxLength(DEFAULT_MAX_PASSWORD_SIZE),
        validPassword: withParams({ type: 'validPassword' }, (value) => {
          return !this.$isEnabledFeature('password_requirements') || this.isPasswordValid
        }),
      },
      termsConditions: {
        required,
      },
    }
  },
  computed: {
    ...mapState(['accessibility']),
    userExists() {
      return this.userExistsErrorValue
    },
    usernameExists() {
      return this.usernameExistsErrorValue
    },
    userData() {
      return {
        name: this.name,
        username: this.username,
        email: this.email,
      }
    },
  },
  created() {
    window.addEventListener('message', this.oauthCallback, false)
    this.setFetching(true)
    this.attemptPostInstanceSettingsRetrieval()
      .then((response) => {
        this.allowRegister = response.data.allow_register
        if (!this.allowRegister) {
          this.$router.push({ name: 'auth.signin' })
        }
        this.providers = response.data.providers.filter((obj) => obj.enabled)
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
      'attemptCreateUser',
      'setFetching',
      'setFeedback',
      'attemptSetToken',
      'attemptUserAccountRetrieval',
      'attemptPostInstanceSettingsRetrieval',
    ]),
    back() {
      this.$router.push({ name: 'auth.signin' })
    },
    submit() {
      this.$v.$touch()
      if (!this.$v.$invalid && this.termsConditions) {
        const { name, username, email, password } = this
        this.userExistsErrorValue = ''
        this.usernameExistsErrorValue = ''
        this.setFetching(true)
        this.attemptCreateUser({ name, email, username, password })
          .then(() => {
            this.$router.push({ name: 'auth.activate', params: { email: this.email } })
          })
          .catch(({ response }) => {
            if (response.data.message === 'application_user_not_exists') {
              this.appUserNotExists = true
              this.accountInfo = response.data.hint.account
            } else if (response.data.message === 'account_already_exists') {
              this.userExistsErrorValue = email
            } else if (response.data.message === 'username_already_exists') {
              this.usernameExistsErrorValue = username
            } else if (
              response.data.hint.errors &&
              response.data.hint.errors.password === 'invalid_password'
            ) {
              this.setFeedback(this.$t('auth.register.exists.app.user.username'))
            }
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    checkLink() {
      const pdfName = 'termsconditions-' + this.$i18n.locale + '.pdf'
      window.open('/pdf/' + pdfName)
    },
    nextPage() {
      let url = this.$route.params.lastUrl
      if (url) {
        this.$router.push({ path: url })
      } else {
        this.$router.push({ name: 'dashboard' })
      }
    },
    openOAuthPopup(connection) {
      if (FACEBADGE_URL !== undefined && OAUTH_REDIRECT_URI !== undefined) {
        let oauthURL = `${FACEBADGE_URL}/authorize?response_type=code&connection=${connection}&client_id=${APP_KEY}&client_secret=${APP_SECRET}&redirect_uri=${OAUTH_REDIRECT_URI}`
        this.oauthWindow = window.open(
          oauthURL,
          'oauth-window',
          'resizable,scrollbars,status,width=420,height=520'
        )
      }
    },
    oauthCallback(e) {
      let data = e.data
      if (data.hasOwnProperty('command') && data.command === 'oauthCallback') {
        this.setFetching(true)
        this.attemptSetToken(data.token).then(() => {
          this.oauthWindow.close()
          this.attemptUserAccountRetrieval()
            .then(() => {
              this.nextPage()
            })
            .finally(() => {
              this.setFetching(false)
            })
        })
      }
    },
  },
}
</script>

<template>
  <EntranceScreensWrapper>
    <div
      v-if="allowRegister"
      class="border-round-lg mt-12 scroll w-11 border-1 border-black-200 surface-0 p-5"
    >
      <div class="flex justify-content-center">
        <Logo
          logo
          :theme="$theme"
        />
      </div>
      <div class="text-black-900 lato-regular text-2xl text-center my-2">
        {{ $t('auth.signup:register') }}
      </div>
      <div v-if="!appUserNotExists">
        <form
          :data-testid="$testId('auth--signup-form')"
          class="flex flex-column gap-2 m-auto"
          @submit.prevent="submit"
        >
          <InputField
            v-model="name"
            :data-testid="$testId('input-field--name')"
            :label="$t('global:form.fullname')"
            :validation="$v.name"
            autocomplete="name"
            type="text"
            dark
          />
          <InputField
            v-model="username"
            :data-testid="$testId('input-field--username')"
            :label="$t('global:form.username')"
            :validation="$v.username"
            :hint="$t('auth.signup:username.hint')"
            autocomplete="username"
            autocapitalize="none"
            type="text"
            hint-tooltip
            dark
          />
          <InputField
            v-model="email"
            :data-testid="$testId('input-field--email')"
            :label="$t('global:form.email')"
            :validation="$v.email"
            autocomplete="email"
            type="text"
            dark
          />
          <InputField
            v-model="password"
            :data-testid="$testId('input-field--password')"
            :label="$t('global:form.password')"
            :validation="$v.password"
            autocomplete="new-password"
            type="password"
            :hide-error-details="!$v.password.$error"
            dark
          />

          <div class="password__hint">
            <PasswordForceHint
              v-model="isPasswordValid"
              :password="password"
              :user="userData"
              class="mb-5"
            />
          </div>

          <Checkbox
            v-model="termsConditions"
            :data-testid="$testId('checkbox--terms-conditions')"
            :items="[
              {
                value: true,
                label: $t('auth.signup:form.termsconditions'),
                testid: 'terms-conditions',
              },
            ]"
            dark
            @label-link="checkLink"
          />
          <div class="form-submit">
            <div class="flex justify-content-center my-3">
              <Action
                :data-testid="$testId('action-button--submit')"
                :text="$t('auth.signup:form.submit')"
                :disabled="!termsConditions || $v.$invalid"
                :dark="accessibility"
                type="button"
                fixed-width
                secondary
                submit
                large
              />
            </div>
            <template v-if="providers.length">
              <div class="flex gap-1 align-items-center my-5 text-sm lato-regular text-black-900">
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

            <div class="text-center text-primary text-base font-bold">
              {{ $t('auth.signup:haveaccount') }}
              <a
                class="underline cursor-pointer"
                @click="back"
              >
                {{ $t('auth.signup:enterhere') }}
              </a>
            </div>
          </div>
        </form>
      </div>

      <div
        v-if="appUserNotExists"
        class="form"
      >
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
          flat
          dark
          @click="back()"
        />

        <div class="validate">
          <template>
            <h1 class="validate-title">{{ $t('auth.register.exists.app.user:title') }}</h1>
            <div class="validate-description">
              <p
                v-html="
                  $t('auth.register.exists.app.user.description', { email: this.accountInfo.email })
                "
              ></p>
              <p
                v-html="$t('auth.register.exists.app.user.name', { name: this.accountInfo.name })"
              ></p>
              <p
                v-html="
                  $t('auth.register.exists.app.user.username', {
                    username: this.accountInfo.username,
                  })
                "
              ></p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </EntranceScreensWrapper>
</template>

<style lang="scss">
#app,
.main {
  height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
}
</style>
