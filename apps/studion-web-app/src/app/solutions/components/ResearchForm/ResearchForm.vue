<script>
import { required, requiredIf } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'
import { MANDATORY_OPTION } from '../../shared.js'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import TextareaField from '@/components/general/TextareaField'
import ResearchQuestions from '../ResearchQuestions'

export default {
  name: 'ResearchForm',

  components: {
    Action,
    Checkbox,
    InputField,
    TextareaField,
    ResearchQuestions,
  },

  mixins: [formScrollValidationMixin],

  props: {
    topic: {
      type: Object,
      default: () => ({}),
    },
    isTopicTemplate: {
      type: Boolean,
      default: false,
    },
    courseId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      formData: {
        id: null,
        type: 'research',
        courseId: null,
        researchId: null,
        name: null,
        description: '',
        mandatory: null,
        questions: [],
        deletedResearchQuestions: [],
      },
      initClassDate: null,
    }
  },

  validations: {
    formData: {
      name: {
        required,
      },
      questions: {
        $each: {
          question: {
            required,
          },
          type: {
            required,
          },
          choices: {
            $each: {
              description: {
                required: requiredIf(function (nestedModel) {
                  return ['multiple_choices', 'matrix'].includes(nestedModel.type)
                }),
              },
            },
          },
          items: {
            $each: {
              description: {
                required: requiredIf(function (nestedModel) {
                  return ['multiple_choices', 'matrix'].includes(nestedModel.type)
                }),
              },
            },
          },
        },
      },
    },
  },

  watch: {
    topic: {
      immediate: true,
      handler() {
        if (this.topic.id) {
          this.setupFormData()
        } else {
          this.addEmptyQuestion()
        }
      },
    },
  },

  created() {
    this.setUp()
    this.formData.courseId = this.courseId
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptTopicResearchRetrieval',
      'attemptTopicCreation',
      'attemptTopicUpdate',
    ]),
    setUp() {
      this.MANDATORY_OPTION = MANDATORY_OPTION
    },
    submit() {
      this.$v.$touch()

      const hasMandatoryQuestions = this.formData.questions.some((question) => question.mandatory)
      if (!hasMandatoryQuestions && this.formData.mandatory) {
        return this.setFeedback({
          message: this.$t('solutions.create.classes:modal.warning.mandatory.questions'),
        })
      }

      if (this.$v.formData.$invalid) {
        this.$nextTick(() => this.scrollToInputError())
        return
      }

      const { formData, isTopicTemplate } = this

      const response = this.formData.id
        ? this.attemptTopicUpdate({ formData, isTopicTemplate })
        : this.attemptTopicCreation({ formData, isTopicTemplate })

      response.then(({ data }) => {
        this.$emit('update', {
          topic: data,
          operation: this.topic.id ? 'update' : 'create',
        })
        this.$router.push({ name: this.$route.meta.modalCloseLink.name })
      })
    },
    setupFormData() {
      Object.assign(this.formData, this.topic)

      if (this.isTopicTemplate) {
        const { research } = this.topic.meta

        research.questions.forEach((question, index) => {
          if (!research.questions[index].choices) {
            this.$set(research.questions[index], 'choices', [])
            research.questions[index].choices = []
          }
        })

        this.formData.researchId = research.research_id
        this.formData.questions = research.questions
        return
      }

      this.loadResearch()
    },
    loadResearch() {
      this.setFetching(true)
      this.attemptTopicResearchRetrieval(this.formData.id)
        .then(({ data }) => {
          this.formData.researchId = data.id

          this.formData.questions = data.questions.map((question) => {
            if (question.type !== 'linear_scale') return question

            const { meta, ...questionData } = question
            return { ...questionData, ...meta }
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    addEmptyQuestion() {
      this.formData.questions.push({
        statement: null,
        description: null,
        type: 'discursive',
        choices: [],
        items: [],
        answer: null,
        initial_scale: 1,
        final_scale: 5,
        initial_label: '',
        final_label: '',
        does_not_apply: null,
        mandatory: true,
      })
    },
  },
}
</script>

<template>
  <form
    class="research-form flex flex-column gap-4"
    @submit.prevent="submit"
  >
    <div class="flex flex-column gap-4">
      <InputField
        v-model.trim="formData.name"
        :label="$t('global:form.title')"
        :disabled="!canWrite('courses')"
        :validation="$v.formData.name"
        :counter="100"
        dark
      />
      <TextareaField
        v-model="formData.description"
        :label="$t('global:form.description')"
        :validation="$v.formData.description"
        :disabled="!canWrite('courses')"
        auto-grow
        dark
      />
    </div>

    <ResearchQuestions
      v-model="formData.questions"
      :validation="$v.formData.questions"
      @deletedResearchQuestion="formData.deletedResearchQuestion.push($event)"
    />

    <Checkbox
      v-model="formData.mandatory"
      :validation="$v.formData.mandatory"
      :items="MANDATORY_OPTION"
      :disabled="!canWrite('courses')"
      :items-warning="
        formData.mandatory ? [$t('solutions.create.classes:modal.mandatory.warning')] : ['']
      "
      class="mt-6"
      switch-type
      dark
    />

    <div
      v-if="canWrite('courses')"
      class="form-submit text-center"
    >
      <Action
        secondary
        large
        fixed-width
        submit
        type="button"
        :text="
          $t(
            formData.id > 0
              ? 'solutions.create.classes:modal.submit.edit'
              : 'solutions.create.classes:modal.submit.add'
          )
        "
      />
    </div>
  </form>
</template>
