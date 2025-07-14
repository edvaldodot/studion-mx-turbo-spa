<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import SelectField from '@/components/general/SelectField'
import ExaminationQuestions from '../../components/ExaminationQuestions'
import questionsCommonsMixin from '../../components/ExaminationQuestions/questionsCommonsMixin'

export default defineComponent({
  name: 'ModalAddQuestionTemplate',

  components: {
    Action,
    Modal,
    ModalHeader,
    SelectField,
    ExaminationQuestions,
  },

  mixins: [questionsCommonsMixin],

  data() {
    return {
      formData: {
        questions: [],
      },
      ignorePointsForQuestion: true,
    }
  },

  computed: {
    isEditing() {
      return this.$route.meta.editing
    },
  },

  created() {
    this.resetQuestion()
    this.setup()
  },

  methods: {
    ...mapActions([
      'attemptCreateQuestionTemplateGroupQuestion',
      'attemptEditQuestionTemplateGroupQuestion',
      'attemptGetQuestionTemplateGroupQuestion',
      'setFeedback',
    ]),

    formatData(data) {
      const formattedData = {
        active: data.active,
        choices: data.choicesMeta,
        level_difficulty: data.levelDifficulty,
        rightFeedback: data.rightFeedback,
        wrongFeedback: data.wrongFeedback,
        manualCorrection: data.manualCorrection,
        type: data.type,
        statement: data.statement,
        id: data.id,
        items: data.itemsMeta,
        isTemplate: true,
      }

      this.questionCommonMixin_formatQuestion(formattedData)
      this.formData.questions = [formattedData]
    },

    /**
     * @desc Setup data
     */
    setup() {
      if (!this.isEditing) return

      const questionParams = {
        groupId: this.$route.params.id,
        questionId: this.$route.params.questionId,
      }

      this.attemptGetQuestionTemplateGroupQuestion(questionParams).then(({ data }) => {
        this.formatData(data)
      })
    },

    /**
     * @param {Boolean} next
     */
    submit(next) {
      this.$v.$touch()
      if (this.$v.formData.questions.$invalid) return

      this.questionCommonMixin_setupQuestionItems()

      const submitAction = this.isEditing
        ? this.attemptEditQuestionTemplateGroupQuestion
        : this.attemptCreateQuestionTemplateGroupQuestion

      const question = this.formData.questions[0]

      const actionParams = {
        groupId: this.$route.params.id,
        data: { ...question },
      }

      if (question.choices) {
        actionParams.data.choices = question.choices.map((c) => {
          delete c.questionId
          return c
        })
      }

      if (question.items) {
        actionParams.data.items = question.items.map((i) => {
          delete i.questionId
          return i
        })
      }

      submitAction(actionParams).then(() => {
        this.setFeedback({
          message: this.$t(
            `solutions.questionTemplates.feedback.question.success${this.isEditing ? '.edit' : ''}`
          ),
        })
        if (next) return this.resetQuestion()
        this.close()
      })
    },

    resetQuestion() {
      const defaultChoices = {
        description: '',
        text: null,
        right: false,
        type: 'multiple_choices',
      }

      this.$set(this.formData, 'questions', [
        {
          statement: null,
          description: null,
          type: 'multiple_choices',
          choices: [this.deepClone(defaultChoices), this.deepClone(defaultChoices)],
          files: [],
          allowFile: false,
          answer: null,
          rightFeedback: '',
          wrongFeedback: '',
          question_id: 0,
          items: [],
          isTemplate: false,
          annulled: false,
          rightChoiceEdited: false,
        },
      ])

      const modalEl = document.querySelector('.modal-add-question-template')
      if (modalEl) modalEl.scrollTop = 0

      this.$v.$reset()
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
    :data-testid="$testId('modal-add-question-template')"
    class="modal-add-question-template"
    only-close-one-modal
    active
    is-page
    @close="close"
  >
    <ModalHeader
      :sub-title="$t('solutions:tab.link.questionTemplates')"
      :title="$t('solutions.questionTemplates.question.modal.create:title')"
      :description="$t('solutions.questionTemplates.question.modal.create:description')"
      class="mt-10"
    />

    <div class="modal-form">
      <form @submit.prevent="submit(false)">
        <ExaminationQuestions
          v-model="formData.questions"
          :validation="$v.formData.questions"
          :allowed-types="['multiple_choices', 'multiple_choices_multi_answers', 'true_or_false']"
          :disable-change-type="isEditing"
          has-feedback
          unique
          is-question-template
        >
          <template #additional-fields>
            <SelectField
              v-model="formData.questions[0].level_difficulty"
              :items="[
                {
                  text: $t('global:difficulty.easy'),
                  value: 1,
                },
                {
                  text: $t('global:difficulty.medium'),
                  value: 3,
                },
                {
                  text: $t('global:difficulty.hard'),
                  value: 5,
                },
              ]"
              :label="$t('global:difficulty')"
              :validation="$v.formData.questions.$each[0].level_difficulty"
              :allow-clear="false"
              dark
            />
          </template>
        </ExaminationQuestions>

        <div class="form-submit text-center">
          <Action
            :text="$t('global:save')"
            type="button"
            fixed-width
            secondary
            large
            @click="submit(false)"
          />
        </div>
      </form>

      <Action
        v-if="!isEditing"
        :text="$t('solutions.questionModal.modal.create:save.go.2')"
        class="mb-5 center"
        type="button"
        fixed-width
        large
        flat
        dark
        @click="submit(true)"
      />
    </div>
  </Modal>
</template>

<style lang="scss">
.modal-add-question-template {
  .modal-form-box-inner {
    background: none;
  }
  .form-checkbox-switch-item {
    display: none;
  }
  .form-submit {
    display: flex;
    flex-direction: column;
  }
  .helper__cloud {
    font-size: 14px;
    .form-item {
      margin-top: 1em;
    }
    .form-radio-item {
      margin-top: 6px;
    }
    .form-input-details {
      display: none;
    }
    .form-radio-label {
      font-size: 1em;
      line-height: 1.5em;
    }
    .form-checkbox-item {
      font-size: 0.75em;
      line-height: 1em;
    }
  }
}
</style>
