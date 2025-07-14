<script>
import { mapActions, mapState } from 'vuex'
import { required, minLength, maxLength, requiredIf } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'
import config from '@/config'

import Button from '@/components/general/Button'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import PasswordForceHint from '@/components/general/PasswordForceHint'
import MIN_PASSWORD_SIZE, {
  DEFAULT_MIN_PASSWORD_SIZE,
  DEFAULT_MAX_PASSWORD_SIZE,
} from '@/support/utils/passwordSize'

const { KEYCLOAK_ENABLED } = config

export default {
  name: 'ModalAlterPassword',

  components: {
    Button,
    InputField,
    Modal,
    PasswordForceHint,
  },
  data() {
    return {
      placeholder: null,
      formData: {
        profile: {
          oldPassword: null,
          newPassword: null,
          confirmPassword: null,
        },
      },
      isPasswordValid: false,
    }
  },
  validations() {
    return {
      formData: {
        profile: {
          oldPassword: {
            required: requiredIf(function () {
              return this.needOldPassword
            }),
            minLength: minLength(6),
            maxLength: maxLength(50),
          },
          newPassword: {
            required,
            minLength: minLength(
              this.$isEnabledFeature('password_requirements')
                ? MIN_PASSWORD_SIZE
                : DEFAULT_MIN_PASSWORD_SIZE
            ),
            maxLength: maxLength(DEFAULT_MAX_PASSWORD_SIZE),
            equalPassword: withParams({ type: 'equalPassword' }, (value) => {
              return !(value !== null && value === this.formData.profile.oldPassword)
            }),
            validPassword: withParams({ type: 'validPassword' }, () => {
              return !this.$isEnabledFeature('password_requirements') || this.isPasswordValid
            }),
          },
          confirmPassword: {
            required,
            minLength: minLength(
              this.$isEnabledFeature('password_requirements')
                ? MIN_PASSWORD_SIZE
                : DEFAULT_MIN_PASSWORD_SIZE
            ),
            maxLength: maxLength(DEFAULT_MAX_PASSWORD_SIZE),
            differentPassword: withParams({ type: 'differentPassword' }, (value) => {
              return !(value !== null && value !== this.formData.profile.newPassword)
            }),
          },
        },
      },
    }
  },

  computed: {
    ...mapState(['users', 'fetching', 'Account']),
    isEditing() {
      return this.$route.meta.editing === true
    },
    canChangePassword() {
      return this.isEditing
    },
    needOldPassword() {
      return !KEYCLOAK_ENABLED
    },
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptUpdatePassword']),
    submitUpdatePassword() {
      this.$v.formData.profile.$touch()

      if (!this.$v.formData.profile.$invalid) {
        const { oldPassword, newPassword } = this.formData.profile
        this.setFetching(true)

        this.attemptUpdatePassword({ oldPassword, newPassword })
          .then(() => {
            this.closeModal()
            this.setFeedback({ message: this.$t('profile.register:modal.updated.success') })
          })
          .catch(({ response }) => {
            const messageErro = response.data.message
            let feedbackMessage = ''

          switch (messageErro) {
            case 'update_user_error':
            case 'validation_error':
            case 'unable_to_update_password':
              feedbackMessage = 'update_user_error'
              break
            case 'invalid_current_password':
              feedbackMessage = 'invalid_current_password'
              break
            default:
              feedbackMessage = 'password_not_updated'
          }

            this.setFeedback({
              message: this.$t(`profile.register:modal.password.${feedbackMessage}`),
            })
            this.formData.profile.oldPassword = null
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    closeModal() {
      this.$router.push(this.$route.meta.modalCloseLink)
    },
  },
}
</script>

<template>
  <Modal
    :active="!fetching"
    is-page
  >
    <div class="modal-form modal-alter-password">
      <h2 class="modal-title text-color">{{ $t('profile.register:modal.password.title') }}</h2>
      <form class="flex flex-column gap-2" @submit.prevent="submitUpdatePassword()">
        <InputField
          v-if="needOldPassword"
          v-model="formData.profile.oldPassword"
          :label="$t('profile.register:modal.password.label.1')"
          :validation="$v.formData.profile.oldPassword"
          :placeholder="placeholder"
          :disabled-visibility="!canChangePassword"
          type="password"
          autocomplete="new-password"
          dark
        />
        <InputField
          v-model="formData.profile.newPassword"
          :label="$t('profile.register:modal.password.label.2')"
          :validation="$v.formData.profile.newPassword"
          :placeholder="placeholder"
          :disabled-visibility="!canChangePassword"
          :show-custom-hint="canChangePassword"
          :hide-error-details="!$v.formData.profile.newPassword.$error"
          type="password"
          autocomplete="new-password"
          dark
        />
        <div class="password__hint">
          <PasswordForceHint
            v-model="isPasswordValid"
            :password="formData.profile.newPassword"
            :user="Account.user.data"
            :validated="$v.formData.profile.newPassword.$dirty"
          />
        </div>
        <InputField
          v-model="formData.profile.confirmPassword"
          :label="$t('profile.register:modal.password.label.3')"
          :validation="$v.formData.profile.confirmPassword"
          :placeholder="placeholder"
          :disabled-visibility="!canChangePassword"
          type="password"
          autocomplete="new-password"
          dark
        />
        <div class="form-submit text-center">
          <Button
            :disabled="$v.formData.$invalid"
            type="submit"
            severity="primary"
            large
          >
            {{ $t('global:form.save') }}
          </Button>
        </div>
      </form>
    </div>
  </Modal>
</template>
