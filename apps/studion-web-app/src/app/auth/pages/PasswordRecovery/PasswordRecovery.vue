<script>
import { mapActions, mapState } from 'vuex'
import { required, email } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Logo from '@/components/general/Logo'

import EntranceScreensWrapper from '../components/EntranceScreensWrapper/EntranceScreensWrapper.vue'

export default {
  name: 'PasswordRecovery',
  components: {
    Action,
    InputField,
    Logo,
    EntranceScreensWrapper,
  },
  data() {
    return {
      email: null,
      error: false,
    }
  },
  validations: {
    email: {
      required,
      email,
    },
  },
  computed: {
    ...mapState(['accessibility']),
  },
  created() {
    if (typeof this.$route.params.error !== 'undefined' && this.$route.params.error === true) {
      this.error = true
    }
  },
  methods: {
    ...mapActions(['attemptPasswordRecovery', 'setFeedback', 'setFetching']),
    submit() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.attemptPasswordRecovery(this.email)
          .then(() => {
            this.$router.push({ name: 'auth.recovery.confirm', params: { email: this.email } })
          })
          .catch(() => {
            this.setFeedback({ message: this.$t('auth.recovery:feedback.error'), type: 'error' })
            this.reset()
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    back() {
      this.$router.push({ name: 'auth.signin' })
    },
    reset() {
      this.email = null
      this.$v.$reset()
    },
  },
}
</script>

<template>
  <EntranceScreensWrapper>
    <div
      class="flex flex-column gap-3 border-round-lg w-11 border-1 border-black-200 surface-0 p-5"
    >
      <div class="flex justify-content-center">
        <Logo
          :theme="$theme"
          logo
        />
      </div>
      <div
        v-if="!error"
        class="text-black-900 text-center"
      >
        <div class="text-2xl lato-regular font-normal my-5">{{ $t('auth.recovery:title') }}</div>
        <div class="text-black-600 line-height-3 lato-regular text-base">
          {{ $t('auth.recovery:description') }}
        </div>
      </div>
      <div
        v-else
        class="text-black-900 text-center"
      >
        <h1 class="text-2xl lato-regular font-normal my-5">
          {{ $t('auth.recovery:token.invalid.title') }}
        </h1>
        <div class="text-black-600 line-height-3 lato-regular text-base">
          <div v-html="$t('auth.recovery:token.invalid.description')"></div>
        </div>
      </div>

      <form
        :data-testid="$testId('auth--password-recovery-form')"
        class="flex flex-column my-4 gap-3"
        @submit.prevent="submit"
      >
        <InputField
          v-model="email"
          :data-testid="$testId('input-field--email')"
          :label="$t('auth.recovery:form.email')"
          :validation="$v.email"
          type="text"
          dark
        />

        <div class="w-full flex justify-content-center">
          <Action
            :data-testid="$testId('action-button--submit')"
            :text="$t('auth.recovery:form.submit')"
            :dark="accessibility"
            type="button"
            fixed-width
            secondary
            submit
            large
          />
        </div>
      </form>

      <div class="text-center text-primary text-base font-bold">
        <a
          class="cursor-pointer"
          @click="back"
        >
          {{ $t('auth.recovery:back') }}
        </a>
      </div>
    </div>
  </EntranceScreensWrapper>
</template>

<style lang="scss">
@import '~@/app/auth/styles.scss';
body,
#app,
.main {
  height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
}
</style>
