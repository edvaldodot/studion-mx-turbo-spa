<script>
import { mapActions, mapState } from 'vuex'
import { required, email } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Logo from '@/components/general/Logo'

import EntranceScreensWrapper from '../components/EntranceScreensWrapper/EntranceScreensWrapper.vue'

export default {
  name: 'UsernameRecovery',
  components: {
    Action,
    InputField,
    Logo,
    EntranceScreensWrapper,
  },
  data() {
    return {
      email: null,
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
  methods: {
    ...mapActions(['attemptUsernameRecovery', 'setFeedback', 'setFetching']),
    submit() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.attemptUsernameRecovery(this.email)
          .then(() => {
            this.$router.push({
              name: 'auth.username.recovery.confirm',
              params: { email: this.email },
            })
          })
          .catch(() => {
            this.setFeedback({
              message: this.$t('auth.username.recovery:feedback.error'),
              type: 'error',
            })
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
      <div class="text-black-900 text-center">
        <div class="text-2xl lato-regular font-normal my-5">
          {{ $t('auth.username.recovery:title') }}
        </div>
        <div class="text-black-600 line-height-3 lato-regular text-base">
          {{ $t('auth.username.recovery:description') }}
        </div>
      </div>
      <form
        :data-testid="$testId('auth--username-recovery-form')"
        class="flex flex-column my-4 gap-3"
        @submit.prevent="submit"
      >
        <InputField
          v-model="email"
          :data-testid="$testId('input-field--email')"
          :label="$t('auth.username.recovery:form.email')"
          :validation="$v.email"
          type="text"
          dark
        />
        <div class="w-full flex justify-content-center">
          <Action
            :data-testid="$testId('action-button--submit')"
            :text="$t('auth.username.recovery:form.submit')"
            :dark="accessibility"
            type="button"
            submit
            secondary
            large
            fixed-width
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
