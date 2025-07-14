<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { required, minLength } from 'vuelidate/lib/validators'
import nicknameValidator from '@/support/customValidators/nicknameValidator'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import ModalDialog from '@/components/general/ModalDialog'

export default defineComponent({
  name: 'ModalNicknameForm',

  components: {
    Action,
    InputField,
    ModalDialog,
  },

  props: {
    suggestion: {
      type: String,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      nickname: null,
      nicknameAlreadyExists: false,
    }
  },

  validations: {
    nickname: {
      required,
      nicknameValidator,
      minLength: minLength(2),
      usernameExistsValidator: function usernameExistsValidator(value) {
        return !(value && this.nicknameAlreadyExists)
      },
    },
  },

  computed: {
    forceSubmit() {
      return this.$route.query.forceSubmit
    }
  },

  watch: {
    nickname() {
      this.nicknameAlreadyExists = false
    },
  },

  created() {
    this.nickname = this.suggestion

    if (this.forceSubmit) return this.submit()

    if (this.nickname) return

    const userAccount = this.Account && this.Account.user
    const nickname = userAccount && userAccount.data && userAccount.data.nickname
    this.nickname = nickname || ''
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'saveUserNickname',
      'attemptChatroomNicknameUpdate',
    ]),

    closeModal() {
      if (this.$route.params.management) {
        this.$router.push({ name: this.$route.params.management })
        return
      }

      this.$router.push({ name: 'classroom.chat' })
    },

    submit() {
      this.$v.nickname.$touch()
      if (this.$v.nickname.$invalid) return
      this.setFetching(true)
      this.attemptChatroomNicknameUpdate(this.nickname)
        .then(({ data }) => {
          this.saveUserNickname(data.username)

          const chatId = this.$route.query.chat
          if (chatId) return this.$emit('access', chatId)
          return this.$router.back()
        })
        .catch(({ response }) => {
          const message = response && response.data && response.data.message
          if (message === 'username_already_exists') {
            this.nicknameAlreadyExists = true

            this.setFeedback({
              message: this.$t('community.index:feedback.updated.error.user.exists'),
              type: 'error',
            })
          }
        })
        .finally(() => this.setFetching(false))
    },
  },
})
</script>

<template>
  <ModalDialog
    v-if="!forceSubmit"
    class="modal-nickname-form"
    :data-testid="$testId('modal-nickname-form')"
    active
    is-page
    @close="closeModal"
  >
    <template #title>
      {{ $t('classroom.chat:modal.nickname.form:title') }}
    </template>

    <template #description>
      <p class="text-color">
        {{ $t('classroom.chat:modal.nickname.form:description') }}
      </p>

      <p class="bold">
        {{ $t('classroom.chat:modal.nickname.form:hint') }}
      </p>
    </template>

    <template #footer>
      <form @submit.prevent="submit">
        <InputField
          v-model="nickname"
          :label="$t('classroom.chat:modal.nickname.form:nickname')"
          :counter="100"
          :validation="$v.nickname"
        />

        <Action
          :text="$t('global:save')"
          type="button"
          secondary
          large
          submit
          fixed-width
        />
      </form>
    </template>
  </ModalDialog>
</template>

<style lang="scss">
@import './ModalNicknameForm.scss';
</style>
