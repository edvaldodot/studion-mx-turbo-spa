<script>
import { defineComponent } from 'vue'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import CompetencyQuestionWrapper from './components/CompetencyQuestionWrapper'
import TextareaField from '@/components/general/TextareaField'

export default defineComponent({
  name: 'CompetencyForm',

  components: {
    Action,
    Checkbox,
    InputField,
    CompetencyQuestionWrapper,
    TextareaField,
  },

  mixins: [formScrollValidationMixin],

  props: {
    topic: {
      type: Object,
      default: () => ({
        id: null,
      }),
    },
    isTopicTemplate: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      canEdit: false,
      formData: {
        course_id: this.$route.params.id,
        type: 'competency',
        topic_id: null,
        name: null,
        description: null,
        active: 1,
        competency: {
          questions: [
            {
              new: true,
              type: null,
              question: null,
              items: [{ title: null, type: null }],
              choices: [
                { title: null, type: null },
                { title: null, type: null },
              ],
              hash: new Date().getTime(),
            },
          ],
        },
        mandatory: false,
      },
    }
  },

  validations() {
    const validationObject = {
      formData: {
        course_id: {
          required: requiredIf(function () {
            return !this.isTopicTemplate
          }),
        },
        name: { required },
        active: 1,
        competency: {
          questions: {
            $each: {
              type: { required },
              question: {
                required: requiredIf(function (nestedModel) {
                  return nestedModel.type === 'discursive'
                }),
              },
              items: {
                $each: {
                  title: {
                    required: requiredIf(function (nestedModel) {
                      return nestedModel.type === 'matrix'
                    }),
                  },
                },
              },
              choices: {
                $each: {
                  title: {
                    required: requiredIf(function (nestedModel) {
                      return nestedModel.type === 'matrix'
                    }),
                  },
                },
              },
            },
          },
        },
      },
    }

    return validationObject
  },

  created() {
    if (this.topic.id) {
      if (this.isTopicTemplate) {
        this.setupTopicTemplate()
        return
      }
      this.getCompetencyInfo()
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptTopicCompetencyCreation',
      'attemptGetTopicCompetency',
      'attemptTopicUpdate',
    ]),

    getCompetencyInfo() {
      this.setFetching(true)
      this.attemptGetTopicCompetency(this.topic.id)
        .then(({ data }) => {
          this.canEdit = !this.topic.competency_answers
          let count = 0
          this.formData.name = data.title
          this.formData.topic_id = this.topic.id
          this.formData.id = this.topic.id
          this.formData.description = data.description
          this.formData.mandatory = this.topic.mandatory
          this.formData.competency.id = data.id
          this.formData.competency.questions = data.competenciesQuestions.map((item) => {
            count += 1
            return {
              id: item.id,
              type: item.type,
              question: item.question,
              items: item.competenciesQuestionsItems.map((items) => {
                return { id: items.id, title: items.title, type: item.type }
              }),
              choices: item.competenciesQuestionsChoices.map((items) => {
                return { id: items.id, title: items.title, type: item.type }
              }),
              hash: new Date().getTime() + count,
            }
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    setupTopicTemplate() {
      let count = 0
      this.canEdit = true
      this.formData.name = this.topic.meta.name
      this.formData.topic_id = this.topic.id
      this.formData.id = this.topic.id
      this.formData.description = this.topic.meta.description
      this.formData.mandatory = this.topic.meta.mandatory
      this.formData.competency.id = this.topic.id
      this.formData.competency.questions = this.topic.meta.competency.questions.map((item) => {
        count += 1
        const question = {
          type: item.type,
          hash: new Date().getTime() + count,
        }

        if (item.type === 'discursive') {
          question.question = item.question
        }

        if (item.type === 'matrix') {
          question.items = item.items.map((items) => {
            return { id: items.id, title: items.title, type: item.type }
          })
          question.choices = item.choices.map((items) => {
            return { id: items.id, title: items.title, type: item.type }
          })
        }

        return question
      })
    },

    /**
     * Add question card
     */
    addQuestion() {
      this.formData.competency.questions.push({
        new: true,
        type: null,
        question: null,
        items: [{ title: null, type: null }],
        choices: [
          { title: null, type: null },
          { title: null, type: null },
        ],
        hash: new Date().getTime(),
      })
    },

    /**
     * Delete question by index
     * @param {Number} index
     */
    deleteQuestion(index) {
      this.formData.competency.questions.splice(index, 1)
    },

    /**
     * Check if form is valid and submit
     */
    handleSubmit() {
      this.$v.formData.$touch()

      if (this.$v.formData.$invalid) {
        this.$nextTick(() => this.scrollToInputError())
      } else this.submit()
    },

    /**
     * Update types on event change type to nestedModel of validator
     * @param {String} type 'discursive'|'matrix'
     * @param {Number} index
     */
    changeType(type, index) {
      const formQuestions = this.formData.competency.questions[index]

      formQuestions.items.forEach((item) => (item.type = type))
      formQuestions.choices.forEach((choice) => (choice.type = type))
    },

    /**
     * Check if is edit or create and submit
     */
    submit() {
      const formData = this.formData

      formData.competency.questions = formData.competency.questions.map((question) => {
        delete question.hash
        if (question.type === 'matrix') {
          delete question.question
        }
        if (question.type === 'discursive') {
          delete question.choices
          delete question.items
        }
        return question
      })

      if (formData.competency.questions.length === 0) {
        this.setFeedback({ message: this.$t('solutions.competency.form:should.have.questions') })
        return
      }

      const submitAction = this.formData.topic_id
        ? this.attemptTopicUpdate({ formData: formData, isTopicTemplate: this.isTopicTemplate })
        : this.attemptTopicCompetencyCreation({
            formData: formData,
            isTopicTemplate: this.isTopicTemplate,
          })

      submitAction.then(({ data }) => {
        this.$emit('update', { topic: data, operation: this.topic.id ? 'update' : 'create' })
        this.$router.push({ name: this.$route.meta.modalCloseLink.name })
      })
    },
  },
})
</script>

<template>
  <div class="flex flex-column gap-4 competency-form centered-form">
    <InputField
      v-model.trim="formData.name"
      dark
      :label="$t('global:form.title')"
      :validation="$v.formData.name"
      :counter="100"
      :disabled="!canWrite('courses')"
    />

    <TextareaField
      v-model="formData.description"
      auto-grow
      dark
      :label="$t('global:form.description')"
      :disabled="!canWrite('courses')"
    />

    <CompetencyQuestionWrapper
      v-for="(question, index) in formData.competency.questions"
      :key="question.hash"
      v-model="formData.competency.questions[index]"
      :can-edit="(!formData.topic_id && !formData.competency_answers) || question.new || canEdit"
      :validation="$v.formData.competency.questions.$each[index]"
      :index="index"
      :can-delete="canEdit"
      @question:type="changeType"
      @question:delete="deleteQuestion"
    />

    <Action
      v-if="canEdit || !formData.topic_id"
      :text="$t('global:form.question.add')"
      class="text-primary"
      type="button"
      flat
      dark
      @click="addQuestion"
    />

    <Checkbox
      v-model="formData.mandatory"
      :items="[
        {
          value: true,
          label: $t('solutions.create.classes:modal.mandatory'),
        },
      ]"
      :disabled="!canWrite('courses')"
      class="mt-5"
      switch-type
      dark
    />

    <div
      v-if="canWrite('courses')"
      class="form-submit text-center"
    >
      <Action
        :text="
          $t(
            topic.id > 0
              ? 'solutions.create.classes:modal.submit.edit'
              : 'solutions.create.classes:modal.submit.add'
          )
        "
        type="button"
        secondary
        large
        fixed-width
        @click="handleSubmit"
      />
    </div>
  </div>
</template>
