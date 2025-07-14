<template>
  <div>
    <Modal
      :active="!fetching"
      is-page
    >
      <div class="modal-form modal-add-user modal-change-password">
        <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
        <h2 class="modal-title text-color">
          {{ true ? users.current.name : $t('community.index:modal.title.add') }}
        </h2>
        <form
          ref="form"
          @submit.prevent="submit()"
        >
          <InputField
            v-model="formData.account.password"
            :label="$t('global:form.password')"
            :validation="$v.formData.account.password"
            type="password"
            autocomplete="new-password"
          />

          <div class="password__hint">
            <PasswordForceHint
              v-model="isPasswordValid"
              :password="formData.account.password"
              :user="users.current"
              :validated="$v.formData.account.password.$dirty"
            />
            <div class="hint__text mb-5 text-color">
              {{ $t('community.index:modal.password.hint') }}
            </div>
          </div>

          <InputField
            v-model="formData.account.confirmPassword"
            :label="$t('global:form.confirm.password')"
            :validation="$v.formData.account.confirmPassword"
            type="password"
            autocomplete="new-password"
            hint-tooltip
          />

          <div class="form-submit text-center">
            <Action
              v-if="canWrite('users')"
              :text="$t('global:form.save')"
              type="button"
              secondary
              large
              submit
              fixed-width
            />
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'
import InputField from '@/components/general/InputField'
import PasswordForceHint from '@/components/general/PasswordForceHint'
import MIN_PASSWORD_SIZE, {
  DEFAULT_MIN_PASSWORD_SIZE,
  DEFAULT_MAX_PASSWORD_SIZE,
} from '@/support/utils/passwordSize'

export default {
  name: 'ModalChangePassword',

  components: {
    Action,
    Modal,
    InputField,
    PasswordForceHint,
  },

  mixins: [formScrollValidationMixin],

  data() {
    return {
      formData: {
        account: {
          password: '',
          confirmPassword: '',
        },
      },
      isPasswordValid: false,
    }
  },

  validations() {
    return {
      formData: {
        account: {
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
          confirmPassword: {
            required,
            minLength: minLength(
              this.$isEnabledFeature('password_requirements')
                ? MIN_PASSWORD_SIZE
                : DEFAULT_MIN_PASSWORD_SIZE
            ),
            maxLength: maxLength(DEFAULT_MAX_PASSWORD_SIZE),
            differentPassword: withParams({ type: 'differentPassword' }, (value) => {
              return !(value !== null && value !== this.formData.account.password)
            }),
          },
        },
      },
    }
  },

  computed: {
    ...mapState(['fetching', 'users']),
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptPasswordUpdate']),
    async submit () {
      this.$v.formData.account.$touch()
      this.$nextTick(() => this.scrollToInputError(this.$refs.form))

      if (!this.$v.formData.account.$invalid) {
        let params = {
          ...this.users.current,
          ...this.formData.account,
          profiles: this.users.current.profiles.map((profile) => profile.id),
          language: [],
        }
        params.uuid = this.$route.params.id

        try {
          this.setFetching(true)
          await this.attemptPasswordUpdate(params)

          this.$v.formData.account.$reset()
          this.setFeedback({ message: this.$t('community.index:feedback.updated') })
          this.closeModal()
        } catch ({ response }) {
          const messageError = response.data.message
          let messageName = 'community.index:feedback.updated.error'

          if (messageError === 'update_user_error' || messageError === 'validation_error' || messageError === 'unable_to_update_password') {
            messageName = 'community.index:feedback.updated.error.password.blacklist'
          }

          if (messageError === 'account_not_activate') {
            messageName = 'community.index:feedback.updated.error.password.account.not.activate'
          }

          this.setFeedback({ message: this.$t(messageName) })
        } finally {
          this.setFetching(false)
        }
      }
    },

    closeModal() {
      this.$router.push({
        name: this.$route.meta.modalCloseLink.name,
        params: { id: this.$route.params.id },
      })
    },
  },
}
</script>

<style lang="scss">
.modal-change-password {
  .hint__text {
    font-size: 1.6em;
    color: var(--text-color);
  }
}
</style>
