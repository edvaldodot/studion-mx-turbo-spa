<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'

export default defineComponent({
  name: 'ModalAddQuestionTemplateSubject',

  components: {
    Action,
    InputField,
    Modal,
    ModalHeader,
  },

  props: {
    groupData: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      formData: {
        description: null,
        active: true,
      },
    }
  },

  validations: {
    formData: {
      description: { required },
    },
  },

  computed: {
    isEditing() {
      return this.$route.meta.editing
    },
  },

  created() {
    if (this.isEditing) this.setup()
  },

  methods: {
    ...mapActions([
      'attemptCreateQuestionTemplateGroup',
      'attemptGetQuestionTemplateGroup',
      'attemptEditQuestionTemplateGroup',
      'setFeedback',
    ]),

    /**
     * @desc Setup data
     */
    setup() {
      if (this.groupData) return (this.formData = this.deepClone(this.groupData))

      this.attemptGetQuestionTemplateGroup(this.$route.params.id).then(({ data }) => {
        this.formData = data
      })
    },

    /**
     * @param {Boolean} next
     */
    submit(next) {
      this.$v.$touch()
      if (this.$v.$invalid) return

      const submitAction = this.isEditing
        ? this.attemptEditQuestionTemplateGroup
        : this.attemptCreateQuestionTemplateGroup

      submitAction(this.formData)
        .then(({ data }) => {
          this.setFeedback({
            message: this.$t(
              `solutions.questionTemplates.feedback.group.success${this.isEditing ? '.edit' : ''}`
            ),
          })

          if (next) {
            return this.$router.push({
              name: 'solutions.questionTemplates.questions.create',
              params: {
                id: data.id,
                groupName: data.description,
              },
            })
          }

          this.close()
        })
        .catch(({ response }) => {
          if (
            ['question_group_already_exists', 'question_group_description_already_exists'].includes(
              response.data.message
            )
          ) {
            this.setFeedback({
              message: this.$t('solutions.questionTemplates.errors.question_group_already_exists'),
            })
          }
        })
    },

    /**
     * @desc Close modal
     */
    close() {
      this.$emit('refresh')
      this.$router.push(this.$route.meta.modalCloseLink)
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-add-question-template-subject')"
    class="modal-add-question-template-subject"
    active
    is-page
  >
    <ModalHeader
      :sub-title="$t('solutions:tab.link.questionTemplates')"
      :title="$t('solutions.questionTemplates.modal.create:title')"
      :description="$t('solutions.questionTemplates.modal.create:description')"
    />

    <div class="modal-form">
      <form @submit.prevent="submit(false)">
        <InputField
          v-model.trim="formData.description"
          :label="$t('global:form.subject')"
          :validation="$v.formData.description"
          dark
        />
        <div class="modal-add-question-template-subject__action">
          <Action
            :text="$t('global:save')"
            type="button"
            fixed-width
            secondary
            large
            flatten
            submit
          />
        </div>
      </form>

      <div class="modal-add-question-template-subject__action">
        <Action
          class="text-primary"
          :text="$t('solutions.questionModal.modal.create:save.go')"
          type="button"
          fixed-width
          large
          flat
          dark
          @click="submit(true)"
        />
      </div>
    </div>
  </Modal>
</template>

<style lang="scss">
.modal-add-question-template-subject {
  &__action {
    text-align: center;
    margin-top: 3em;
  }
}
</style>
