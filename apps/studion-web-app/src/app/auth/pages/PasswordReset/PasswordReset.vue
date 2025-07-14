<script>
import { mapActions, mapState } from 'vuex'
import { maxLength, minLength, required } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'
import MIN_PASSWORD_SIZE, {
  DEFAULT_MIN_PASSWORD_SIZE,
  DEFAULT_MAX_PASSWORD_SIZE,
} from '@/support/utils/passwordSize'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import LinksBar from '@/components/general/LinksBar'
import Logo from '@/components/general/Logo'
import Tabs from '@/components/general/Tabs'
import PasswordForceHint from '@/components/general/PasswordForceHint'

export default {
  name: 'PasswordReset',
  components: {
    Action,
    InputField,
    LinksBar,
    Logo,
    Tabs,
    PasswordForceHint,
  },
  data() {
    return {
      user: {},
      password: null,
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
      isPasswordValid: false,
    }
  },
  validations() {
    return {
      password: {
        required,
        minLength: minLength(
          this.$isEnabledFeature('password_requirements')
            ? MIN_PASSWORD_SIZE
            : DEFAULT_MIN_PASSWORD_SIZE
        ),
        maxLength: maxLength(DEFAULT_MAX_PASSWORD_SIZE),
        validPassword: withParams({ type: 'validPassword' }, () => {
          return !this.$isEnabledFeature('password_requirements') || this.isPasswordValid
        }),
      },
    }
  },
  computed: {
    ...mapState(['accessibility']),
  },
  methods: {
    ...mapActions([
      'attemptPasswordReset',
      'attemptVerifyPasswordRecoveryToken',
      'attemptPostInstanceSettingsRetrieval',
      'setFeedback',
      'setFetching',
    ]),
    submit() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        let password = this.password
        let token = this.$route.params.token

        this.setFetching(true)
        this.attemptPasswordReset({ password, token })
          .then(() => {
            this.$router.push({ name: 'auth.reset.confirm', params: { email: this.email } })
          })
          .catch(() => {
            this.setFeedback({ message: this.$t('auth.reset:feedback.error'), type: 'error' })
            this.reset()
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    reset() {
      this.password = null
      this.$v.$reset()
    },
  },
  async created() {
    let token = this.$route.params.token
    this.setFetching(true)

    try {
      await this.attemptPostInstanceSettingsRetrieval()
      const { data } = await this.attemptVerifyPasswordRecoveryToken(token)
      this.user = data.data
    } catch ({ response }) {
      this.$router.push({
        name: 'auth.recovery',
        params: { error: true, message: response.data.message },
      })
    } finally {
      this.setFetching(false)
    }
  },
}
</script>

<template>
  <div class="main-content  auth">
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
      <div
        class="form"
      >
        <Tabs
          :links="tablinks"
          dark
        />

        <div class="description">
          <h2>{{ $t('auth.reset:title') }}</h2>
          <p v-html="$t('auth.reset:description', { email: user.email })"></p>
        </div>

        <form
          :data-testid="$testId('auth--password-reset-form')"
          class="login-form"
          @submit.prevent="submit"
        >
          <InputField
            v-model="password"
            :data-testid="$testId('input-field--password')"
            :label="$t('auth.reset:form.password')"
            :validation="$v.password"
            type="password"
            floating-label
            dark
          />

          <div class="password__hint">
            <PasswordForceHint
              v-model="isPasswordValid"
              :password="password"
              :user="user"
              :validated="$v.password.$dirty"
            />
          </div>

          <div class="form-submit">
            <Action
              :data-testid="$testId('action-button--submit')"
              :text="$t('auth.reset:form.submit')"
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
      <div
        class="company"
        v-if="!$media.mobile"
      >
        <Logo
          :theme="$theme"
          class="company-logo"
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
