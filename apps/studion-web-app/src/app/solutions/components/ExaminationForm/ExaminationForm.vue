<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import {
  QUESTION_FEEDBACK_OPTIONS,
  DISABLE_ACTION_COPY,
  DISABLE_ACTION_CUT,
  DISABLE_ACTION_PASTE,
  MANDATORY_OPTION,
  EXAMINATION_MANDATORY_OPTION,
  RESTRICT_PROGRESS_OPTION,
} from '../../shared'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import FormSection from '@/components/general/FormSection'
import ModalConfirm from '@/components/general/ModalConfirm'
import Radio from '@/components/general/Radio'
import Tips from '@/components/general/Tips'
import Tooltip from '@/components/general/Tooltip'
import Icon from '@/components/general/Icon'
import TextEditor from '@/components/general/TextEditor'
import ExaminationQuestions from '../ExaminationQuestions'
import ExaminationQuestionsTemplate from '../ExaminationQuestionsTemplate'
import SelectField from '@/components/general/SelectField'

import { gradeFormatsFactory, questionConfigsFactory, gradeVisibilityOptionsFactory } from './util'

import examinationSendFileMixin from '@/app/solutions/mixins/examinationSendFileMixin'
import questionsCommonsMixin from '../ExaminationQuestions/questionsCommonsMixin'

export default defineComponent({
  name: 'ExaminationForm',

  components: {
    Action,
    Checkbox,
    InputField,
    FormSection,
    ExaminationQuestions,
    ExaminationQuestionsTemplate,
    ModalConfirm,
    Radio,
    Tips,
    Tooltip,
    Icon,
    TextEditor,
    SelectField,
  },

  mixins: [examinationSendFileMixin, formScrollValidationMixin, questionsCommonsMixin],

  props: {
    topic: {
      type: Object,
      default: () => ({
        id: null,
        name: null,
        description: null,
        mandatory: false,
      }),
    },
    isTopicTemplate: {
      type: Boolean,
      default: false,
    },
    courseId: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      formData: {
        type: 'examination',
        active: false,
        id: null,
        examinationId: null,
        courseId: null,
        name: null,
        slug: '',
        description: '',
        mandatory: false,
        tries: 1,
        minimalGrade: 0,
        restrictProgress: false,
        feedbackInclude: false,
        blockNewAttempts: false,
        randomOrder: false,
        randomOrderChoices: false,
        questions: [],
        total: 0,
        deletedResearchQuestions: [],
        hasMinimalGrade: false,
        examinationTypeEnum: 'default',
        questionTemplateGroupMeta: [],
        gradeFormat: 'score',
        gradeVisibility: 'respond_lesson',
        gradeVisibilityOption: 'after_correction',
        disableCopy: false,
        disableCut: false,
        disablePaste: false,
        showHistoryTries: false,
        isPreProject: false,
        aggregateExaminationId: null,
        isRecovery: false,
      },
      aggregateExamination: false,
      disableAggregateExaminationEdit: false,
      aggregatePreProjectList: [],
      aggregateConfirmModal: false,
      enableTriesQuantity: true,
      questionConfigs: [...questionConfigsFactory()],
      hasTimer: false,
      timerHours: 0,
      timerMinutes: 0,
      gradeFormats: [...gradeFormatsFactory()],
      gradeVisibilityOptions: [...gradeVisibilityOptionsFactory()],
      hasPercent: true,
      initClassDate: null,
      hasSignificantChange: false,
      confirmChangesModal: false,
      disableActionCheckbox: {
        copy: DISABLE_ACTION_COPY,
        paste: DISABLE_ACTION_PASTE,
        cut: DISABLE_ACTION_CUT,
      },
      getIsRecovery: null,
    }
  },
  computed: {
    ...mapState(['Courses']),

    hasPreProjectTool() {
      const current = this.Courses.current

      return (
        current.available_tools &&
        Array.isArray(current.available_tools) &&
        current.available_tools.find((t) => t.alias === 'preProjectExamination')
      )
    },

    showRecoveryOption() {
      if (this.isTopicTemplate) {
        return this.$isEnabledFeature('allow_recovery_examination')
      }
      return (
        this.$isEnabledFeature('allow_recovery_examination') &&
        this.Courses.current.type.alias === 'hybrid'
      )
    },

    disableRecovery() {
      if (!this.getIsRecovery) {
        return false
      }
      return this.formData.id !== this.getIsRecovery.id && this.getIsRecovery.isRecovery
    },

    isGradeShowSchedule() {
      return this.formData.gradeVisibility === this.gradeVisibilityOptions[2].value
    },
    formattedExaminationTotalPoints() {
      return this.examinationTotalPoints.toFixed(2).replace('.00', '').replace('.', ',')
    },
    questionsQuantity() {
      const templateQuestions = this.formData.questionTemplateGroupMeta

      const totalValue = templateQuestions.reduce((total, groupQuestion) => {
        const questionTotal = groupQuestion.levels.reduce((sum, question) => {
          return Number(sum) + Number(question.questions)
        }, 0)

        return Number(total) + Number(questionTotal)
      }, 0)

      return totalValue
    },
    examinationTotalPoints() {
      let totalValue = null

      if (this.isQuestionTemplate) {
        const templateQuestions = this.formData.questionTemplateGroupMeta

        totalValue = templateQuestions.reduce((total, groupQuestion) => {
          const questionTotal = groupQuestion.levels.reduce((sum, question) => {
            return Number(sum) + Number(question.scorePerQuestion) * (question.questions || 0)
          }, 0)

          return Number(total) + questionTotal
        }, 0)
      } else {
        totalValue = this.formData.questions.reduce((count, question) => {
          return Number(count) + Number(question.points)
        }, 0)
      }

      return totalValue
    },
    submitText() {
      return this.$t(
        this.formData.id > 0
          ? 'solutions.create.classes:modal.submit.edit'
          : 'solutions.create.classes:modal.submit.add'
      )
    },

    isQuestionTemplate() {
      return this.formData.examinationTypeEnum === 'question_template_random'
    },

    aggregateExaminationList() {
      return this.aggregatePreProjectList
        .map((examination) => ({
          text: examination.topic.name,
          value: examination.id,
        }))
        .filter((e) => e.value != this.id)
    },
  },

  watch: {
    topic: {
      immediate: true,
      handler() {
        if (this.topic.id) {
          this.setupFormData()
        }
      },
    },
    'formData.hasMinimalGrade': {
      immediate: true,
      handler(newValue) {
        if (newValue) return
        this.formData.blockNewAttempts = false
        this.formData.restrictProgress = false
      },
    },
    'formData.mandatory': {
      immediate: true,
      handler(newValue) {
        if (newValue) return
        this.formData.hasMinimalGrade = false
      },
    },
    'formData.gradeVisibility': {
      immediate: true,
      handler() {
        if (!this.isGradeShowSchedule) return
        this.formData.tries = 1
        this.formData.blockNewAttempts = false
        this.enableTriesQuantity = true
      },
    },

    'formData.examinationTypeEnum': {
      immediate: true,
      handler(newValue, oldValue) {
        if (newValue === 'question_template_random') {
          this.formData.randomOrder = true

          if (oldValue === 'default') {
            this.formData.questions = []
          }

          return
        }

        if (oldValue === 'question_template_random') {
          this.formData.questionTemplateGroupMeta = []
        }
      },
    },
  },

  created() {
    this.formData.courseId = this.courseId
    this.setup()

    if (this.$isEnabledFeature('pre_project_examination')) {
      this.getPreProjects()
    }
    this.getIsRecoveryTeste()
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptTopicExamination',
      'attemptTopicCreation',
      'attemptTopicUpdate',
      'attemptUploadExaminationFiles',
      'attemptPreProjects',
    ]),
    setup() {
      this.QUESTION_FEEDBACK_OPTIONS = QUESTION_FEEDBACK_OPTIONS
      this.EXAMINATION_MANDATORY_OPTION = EXAMINATION_MANDATORY_OPTION
      this.MANDATORY_OPTION = MANDATORY_OPTION
      this.RESTRICT_PROGRESS_OPTION = RESTRICT_PROGRESS_OPTION
    },

    /**
     * Get all files and split into: Files with ID and Files to upload.
     * @param {Object[]}
     */
    splitFilesArray(files) {
      return {
        fileWithId: files.filter((file) => file.hasOwnProperty('id')),
        filesToUpload: files.filter((file) => !file.hasOwnProperty('id')),
      }
    },

    getIsRecoveryTeste() {
      if (this.isTopicTemplate) return (this.isRecovery = null)
      const isRecoveryClass = this.Courses.currentTopics.find((item) => item.isRecovery === true)
      if (isRecoveryClass) {
        return (this.getIsRecovery = {
          id: isRecoveryClass.id,
          isRecovery: isRecoveryClass.isRecovery,
        })
      }
    },

    /**
     * Upload each file of `send_file` question and save response to send on create/update examination request.
     * @param {Object[]} questions
     */
    sendFileQuestionManipulation(questions) {
      return Promise.all(
        questions.map(async (question) => {
          if (question.type !== 'send_file' || !question.allowFile) return question

          const { fileWithId, filesToUpload } = this.splitFilesArray(question.files)
          if (!filesToUpload.length) return question

          const { data } = await this.attemptUploadExaminationFiles({
            files: filesToUpload,
            type: this.isTopicTemplate ? 'template' : 'question',
          })

          question.files = [fileWithId, data].flat()

          return question
        })
      )
    },

    /**
     * Create a clone of formData and manipulate fields to send on create/update examination request.
     * @param {Object} formData
     */
    async manipulateFormData(formData) {
      if (formData.type !== 'examination') return formData
      const data = this.deepClone(formData)

      data.questions = await this.sendFileQuestionManipulation(data.questions)

      return data
    },

    handleSubmit() {
      this.$v.$touch()

      if (this.$v.$invalid) {
        this.$nextTick(() => this.scrollToInputError())
        return
      }

      if (this.hasSignificantChange) {
        this.confirmChangesModal = true
        return
      }

      this.submit()
    },

    async submit() {
      this.questionCommonMixin_setupQuestionItems()

      this.setFetching(true)

      if (this.hasTimer) {
        this.formData.examDeadline = this.timerMinutes * 60 + this.timerHours * 3600
      } else {
        this.formData.examDeadline = 0
      }

      const { formData, isTopicTemplate } = this
      const formObject = await this.manipulateFormData(formData)
      this.setFetching(false)

      if (formObject.gradeVisibility === 'session_schedule_finish') {
        formObject.gradeVisibility =
          formObject.gradeVisibilityOption === 'respond_lesson'
            ? 'session_schedule_finish'
            : 'session_schedule_finish_after_correction'
      }

      const bodyData = { formData: formObject, isTopicTemplate }

      const response = formObject.id
        ? this.attemptTopicUpdate(bodyData)
        : this.attemptTopicCreation(bodyData)

      response.then(({ data }) => {
        this.$emit('update', { topic: data, operation: this.topic.id ? 'update' : 'create' })

        this.$router.push({ name: this.$route.meta.modalCloseLink.name })
      })
    },
    async setupFormData() {
      Object.assign(this.formData, this.topic)

      if (this.isTopicTemplate) {
        const { examination } = this.topic.meta

        if (examination.questions) {
          examination.questions.forEach((question, index) => {
            if (question.type === 'send_file') {
              examination.questions[index].allowFile =
                question.allowFile === '1' || Boolean(question.files && question.files.length)

              const files = question.files || []
              this.$set(examination.questions[index], 'files', files)
              examination.questions[index].files = files
            }

            if (!examination.questions[index].choices) {
              this.$set(examination.questions[index], 'choices', [])
              examination.questions[index].choices = []
            }

            this.$set(
              examination.questions[index],
              'manualCorrection',
              question.manual_correction || false
            )
          })
        }

        this.formData.examinationId = examination.examination_id
        this.formData.tries = examination.tries
        this.enableTriesQuantity = examination.tries > 0
        this.formData.minimalGrade = examination.minimal_grade
        this.formData.feedbackInclude = examination.feedbackInclude
        this.formData.blockNewAttempts = examination.blockNewAttempts
        this.formData.randomOrder = examination.randomOrder
        this.formData.randomOrderChoices = examination.randomOrderChoices
        this.formData.examinationTypeEnum = examination.examinationTypeEnum || 'default'
        this.formData.questionTemplateGroupMeta = examination.questionTemplateGroupMeta || []
        this.formData.hasMinimalGrade = examination.mandatory
        this.formData.questions = this.formatQuestions(examination.questions || [])
        this.formData.disableCopy = examination.disableCopy
        this.formData.disableCut = examination.disableCut
        this.formData.disablePaste = examination.disablePaste
        this.formData.questions.forEach(this.setQuestionAnswer)
        this.formData.gradeFormat = examination.gradeFormat
        this.formData.gradeVisibility = examination.gradeVisibility
        this.formData.restrictProgress = examination.restrictProgress
        this.formData.showHistoryTries = examination.showHistoryTries
        this.formData.isRecovery = examination.isRecovery

        if (this.$isEnabledFeature('slug_identity')) {
          this.formData.slug = examination.slug
        }

        this.formData.isPreProject = examination.isPreProject
        return
      }

      this.loadExamination()
    },

    loadExamination() {
      this.setFetching(true)
      this.attemptTopicExamination(this.topic.id)
        .then(({ data }) => {
          this.adaptExaminationToFormData(data)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    adaptExaminationToFormData(data, isAggregateOverride = false) {
      const examination = data

      examination.question = (examination.questions || []).map((question) => {
        if (question.type === 'send_file') {
          question.allowFile =
            question.allowFile === '1' || Boolean(question.files && question.files.length)

          question.files = question.files || []
        }

        if (question.type !== 'fill_gap') {
          question.items.forEach((item) => {
            item.type = question.type
            return item
          })

          return question
        } else {
          question.items = question.items.map((item) => {
            item.type = 'fill_gap'
            return item
          })

          const items = new Map()

          question.items.forEach((questionItem) => {
            items.set(questionItem.position, [])
          })

          question.choices.forEach((choice) => {
            items
              .get(choice.item.position)
              .push({ description: choice.description, position: choice.position })
          })

          items.forEach((value, key) => {
            let sorted = items.get(key).sort((a, b) => {
              if (a.position > b.position) return 1
              else if (a.position < b.position) return -1
              else return 0
            })

            items.set(
              key,
              sorted.map((desc) => desc.description)
            )
          })

          question.items.forEach((it) => {
            let reg = /\[\d+\]/g
            let matchs = [...it.description.matchAll(reg)]

            matchs.forEach((match, index) => {
              it.description = it.description.replace(
                match[0],
                '[' + items.get(it.position)[index] + ']'
              )
            })
          })

          return question
        }
      })

      if (isAggregateOverride) {
        this.formData.mandatory = examination.mandatory
        this.formData.description = examination.topic.description
      } else {
        this.formData.examinationId = examination.id
      }

      this.formData.tries = examination.tries
      this.enableTriesQuantity = examination.tries > 0
      this.formData.minimalGrade = examination.minimalGrade
      this.formData.feedbackInclude = examination.feedbackInclude
      this.formData.blockNewAttempts = examination.blockNewAttempts
      this.formData.randomOrder = examination.randomOrder
      this.formData.randomOrderChoices = examination.randomOrderChoices
      this.formData.examinationTypeEnum = examination.examinationTypeEnum
      this.formData.questionTemplateGroupMeta = examination.questionTemplateGroupMeta || []
      this.formData.hasMinimalGrade = examination.mandatory
      this.formData.questions = this.formatQuestions(examination.questions, isAggregateOverride)
      this.formData.gradeFormat = examination.gradeFormat
      this.formData.gradeVisibility = examination.gradeVisibility
      this.formData.disableCopy = examination.disableCopy
      this.formData.disableCut = examination.disableCut
      this.formData.disablePaste = examination.disablePaste
      this.formData.restrictProgress = examination.restrictProgress

      this.formData.questions.map((question) => {
        if (question.type === 'association') {
          this.$nextTick(() => {
            this.setQuestionAnswer(question)
          })
          return
        }

        return this.setQuestionAnswer(question)
      })

      this.formData.showHistoryTries = examination.showHistoryTries
      this.formData.isPreProject = examination.isPreProject
      this.formData.isRecovery = examination.isRecovery
      this.hasTimer = !!examination.examDeadline
      this.timerHours = Math.floor(examination.examDeadline / 3600)
      this.timerMinutes = Math.floor((examination.examDeadline % 3600) / 60)
      if (this.$isEnabledFeature('slug_identity')) {
        this.formData.slug = examination.slug
      }
      if (examination.aggregateExamination) {
        this.formData.aggregateExaminationId = examination.aggregateExamination.id
        this.aggregateExamination = true
        this.disableAggregateExaminationEdit = true
      }
      if (
        ['session_schedule_finish_after_correction', 'session_schedule_finish'].includes(
          this.formData.gradeVisibility
        )
      ) {
        this.formData.gradeVisibilityOption =
          this.formData.gradeVisibility === 'session_schedule_finish'
            ? 'respond_lesson'
            : 'after_correction'
        this.formData.gradeVisibility = 'session_schedule_finish'
      }
    },

    formatQuestions(questions, isAggregateOverride = false) {
      if (isAggregateOverride) {
        questions = questions.filter((q) => !q.annulled)
      }

      return questions.map((question) => {
        const temporaryId = this.$uuid()
        if (!question.id) question.id = temporaryId

        question.choices = question.choices.map((c) => {
          const choice = {
            ...c,
            questionId: question.id,
            type: question.type,
          }

          if (isAggregateOverride) {
            choice.aggregateChoiceId = choice.choice_id
            if (choice.item) choice.aggregateItemId = choice.item.id
            if (choice.id) delete choice.id
            if (choice.choice_id) delete choice.choice_id
          }

          return choice
        })

        if (question.items) {
          question.items = question.items.map((i) => {
            const item = {
              questionId: question.id,
              ...i,
            }

            if (isAggregateOverride) {
              item.aggregateItemId = item.id
              delete item.id
            }

            return item
          })
        }

        if (question.files && isAggregateOverride) {
          question.files = question.files.map((f) => ({ ...f, isAggregateFile: true }))
        }

        if (isAggregateOverride) {
          question.aggregateQuestionId = question.id
          delete question.id
        }

        return question
      })
    },

    setQuestionAnswer(question) {
      if (!question.annulled && !this.isTopicTemplate) {
        this.$set(question, 'annulled', false)
      }
      this.$nextTick(() => {
        this.questionCommonMixin_formatQuestion(question)
      })

      if (question.type === 'fill_gap') {
        question.items = question.items.sort((a, b) => {
          if (a.position > b.position) return 1
          else if (a.position < b.position) return -1
          else return 0
        })
      }

      if (question.type === 'association') {
        let questionChoices = question.choices.map((choice) => {
          const index = question.items.findIndex((item) => {
            if (choice.item && choice.item.id) {
              return item.id === choice.item.id || item.aggregateItemId === choice.item.id
            }
            return item.position === choice.itemIndex
          })

          return {
            ...choice,
            itemIndex: index,
            oldItemIndex: index,
          }
        })

        let items = question.items.map((item, index) => {
          return {
            ...item,
            text: this.$t('global:form.answer') + ' ' + (index + 1),
            value: index,
          }
        })

        this.$set(question, 'choices', questionChoices)
        this.$set(question, 'items', items)
      }
    },
    annulQuestion({ id, annulled }) {
      const questionIndex = this.formData.questions.findIndex((question) => question.id === id)
      if (questionIndex !== -1) {
        const question = this.formData.questions[questionIndex]
        question.annulled = annulled
        question.annulledByForm = annulled
      }
    },

    changedHandler() {
      if (this.formData.id) {
        this.hasSignificantChange = true
      }
    },

    handleNumberOfTries() {
      this.formData.tries = this.enableTriesQuantity ? 1 : 0
    },

    timeLimit() {
      if (this.timerHours == 24) this.timerMinutes = 0
    },

    openAggregateConfirmModal(value) {
      if (value) {
        this.aggregateConfirmModal = true
      }
    },

    closeAggregateConfirmModal() {
      this.aggregateConfirmModal = false
      this.aggregateExamination = false
      this.formData.aggregateExaminationId = null
    },

    handleAggregateExaminationSelect() {
      this.aggregateConfirmModal = false

      const selected = this.aggregatePreProjectList.find(
        (i) => i.id == this.formData.aggregateExaminationId
      )
      this.adaptExaminationToFormData(selected, true)
    },

    getPreProjects() {
      this.setFetching(true)
      this.attemptPreProjects(this.courseId)
        .then(({ data }) => {
          this.aggregatePreProjectList = data.filter((a) => !a.isRecovery)
        })
        .catch(() => {
          this.aggregateExamination = false
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    toggleProject(e) {
      if (e) {
        this.formData.questions.forEach((question) => (question.type = 'discursive'))
      }
    },
  },
})
</script>

<template>
  <form
    v-if="$v"
    novalidate
    class="flex flex-column gap-4 examination-form"
    @submit.prevent="handleSubmit"
  >
    <FormSection
      v-if="$isEnabledFeature('pre_project_examination') && hasPreProjectTool"
      :title="$t('global:menu.preproject')"
      :subdescription="$t('solutions.create.classes:modal.examination:preproject:description')"
      dark
    >
      <Checkbox
        v-model="formData.isPreProject"
        :items="[
          {
            label: $t('global:activate') + ' ' + $t('global:menu.preproject'),
            value: true,
          },
        ]"
        :disabled="
          !canWrite('courses') ||
          disableAggregateExaminationEdit ||
          Boolean(formData.aggregateExaminationId)
        "
        dark
        switch-type
        @value="toggleProject"
      />

      <div
        v-if="formData.isPreProject"
        class="aggregate-pre-project-examination"
      >
        <Checkbox
          v-model="aggregateExamination"
          :items="[
            {
              label: $t('pre.project.form.aggregate.examination'),
              value: true,
            },
          ]"
          :disabled="
            !canWrite('courses') ||
            disableAggregateExaminationEdit ||
            Boolean(formData.aggregateExaminationId)
          "
          dark
          @input="formData.aggregateExaminationId = null"
        />

        <SelectField
          v-if="aggregateExamination"
          v-model="formData.aggregateExaminationId"
          :validation="$v.formData.aggregateExaminationId"
          :items="aggregateExaminationList"
          :label="$t('pre.project.form.aggregate.examination.select.label')"
          :disabled="
            !canWrite('courses') ||
            disableAggregateExaminationEdit ||
            Boolean(formData.aggregateExaminationId)
          "
          class="select-examination"
          dark
          @input="openAggregateConfirmModal"
        />
      </div>
    </FormSection>

    <div>
      <InputField
        v-model.trim="formData.name"
        :label="$t('global:form.title')"
        :validation="$v.formData.name"
        :disabled="!canWrite('courses')"
        :counter="100"
        dark
      />

      <InputField
        v-if="$isEnabledFeature('slug_identity')"
        v-model="formData.slug"
        :validation="$v.formData.slug"
        :label="$t('global:slug.identity')"
        :counter="100"
        :disabled="!canWrite('courses')"
        dark
        @input="(val) => (formData.slug = formData.slug.toUpperCase())"
      />

      <div class="flex flex-column gap-4">
        <TextEditor
          v-model="formData.description"
          :label="$t('global:form.section.content')"
          :floating-label="false"
          :counter="8000"
          :validation="$v.formData.description"
          :disabled="!canWrite('courses')"
          :writable="canWrite('courses')"
          :max-rows="20"
          :rows="12"
          libras
        />
      </div>
    </div>

    <div class="flex flex-column gap-4">
      <h3 class="form-section-title mb-0 text-color">
        {{ $tc('global:question', 2) }}
      </h3>

      <Checkbox
        v-model="formData.feedbackInclude"
        :items="QUESTION_FEEDBACK_OPTIONS"
        :disabled="!canWrite('courses')"
        switch-type
        dark
      />

      <Checkbox
        v-model="formData.disableCopy"
        :items="disableActionCheckbox.copy"
        :disabled="!canWrite('courses')"
        switch-type
        dark
      />

      <Checkbox
        v-model="formData.disableCut"
        :items="disableActionCheckbox.cut"
        :disabled="!canWrite('courses')"
        switch-type
        dark
      />

      <Checkbox
        v-model="formData.disablePaste"
        :items="disableActionCheckbox.paste"
        :disabled="!canWrite('courses')"
        switch-type
        dark
      />
    </div>

    <div
      v-if="$isEnabledFeature('questions_template') && !formData.isPreProject"
      class="form-group clearfix theme-dark is-flexible mb-7"
    >
      <div>
        <h3 class="form-section-title mt-3 mb-0 text-color">
          {{ $t('solutions.create.classes:modal.examination.config.questions') }}
        </h3>

        <p class="form-group-description mt-1 text-color">
          {{ $t('solutions.create.classes:modal.examination.config.questions:description') }}
        </p>
      </div>

      <div class="wrapper question-config">
        <Radio
          v-model="formData.examinationTypeEnum"
          :items="questionConfigs"
          :disabled="!canWrite('courses')"
          :details="false"
          horizontal
          dark
        />
      </div>
    </div>

    <div
      v-if="!formData.isPreProject"
      class="flex flex-column"
    >
      <h3 class="form-section-title mb-0 text-color">
        {{ $t('global:random.order') }}
      </h3>

      <p class="form-group-description mt-1 text-color">
        {{ $t('solutions.create.classes:modal.examination.random.order.description') }}
      </p>

      <Checkbox
        v-model="formData.randomOrder"
        :items="[
          {
            label: $t('solutions.create.classes:modal.examination.random.order.questions'),
            value: true,
          },
        ]"
        :disabled="!canWrite('courses') || isQuestionTemplate"
        dark
        switch-type
      />

      <Checkbox
        v-model="formData.randomOrderChoices"
        :items="[
          {
            label: $t('solutions.create.classes:modal.examination.random.order.choices'),
            value: true,
          },
        ]"
        :disabled="!canWrite('courses')"
        dark
        switch-type
      />
    </div>

    <ExaminationQuestionsTemplate
      v-if="isQuestionTemplate"
      v-model="formData.questionTemplateGroupMeta"
      :validation="$v.formData.questionTemplateGroupMeta"
    />

    <ExaminationQuestions
      v-else
      v-model="formData.questions"
      :is-topic-template="isTopicTemplate"
      :validation="$v.formData.questions"
      :has-feedback="formData.feedbackInclude"
      :is-pre-project="formData.isPreProject"
      @deletedExaminationQuestion="formData.deletedResearchQuestion.push($event)"
      @annul-question="annulQuestion"
      @trigger:changed="changedHandler"
    />

    <div class="form-group clearfix theme-dark is-flexible examination-points">
      <p class="evaluation-total text-color">
        {{ $t('solutions.create.classes:modal.examination.total.label') }}
        <strong>
          {{
            $tc(
              'solutions.create.classes:modal.examination.total',
              Math.ceil(examinationTotalPoints),
              {
                num: formattedExaminationTotalPoints,
              }
            )
          }}
        </strong>
      </p>
      <p
        v-if="isQuestionTemplate"
        class="evaluation-total evaluation-total-questions"
      >
        {{ $t('solutions.create.classes:modal.examination.total.questions.label') }}
        <span>
          {{ questionsQuantity }}
        </span>
      </p>
    </div>

    <Checkbox
      v-model="formData.mandatory"
      :validation="$v.formData.mandatory"
      :items="MANDATORY_OPTION"
      :disabled="!canWrite('courses')"
      switch-type
      dark
    />

    <div
      v-if="formData.mandatory"
      class="form-group clearfix theme-dark form-group-minimal-grade is-flexible"
    >
      <div class="group-checkbox-grade flex flex-column">
        <Checkbox
          v-model="formData.hasMinimalGrade"
          :items="EXAMINATION_MANDATORY_OPTION"
          :disabled="!canWrite('courses')"
          switch-type
          dark
        />

        <div class="w-3">
          <InputField
            v-if="!$media.mobile"
            v-model="formData.minimalGrade"
            :has-percent="hasPercent"
            :validation="$v.formData.minimalGrade"
            :label="$t('solutions.create.classes:modal.percent')"
            :disabled="!formData.hasMinimalGrade"
            :max="100"
            :min="0"
            class="grade"
            type="number"
            dark
          />
        </div>
      </div>

      <div
        class="w-12"
        :style="$media.mobile ? 'padding-bottom: 14px' : ''"
      >
        <p class="text-color mb-1 text-sm">
          {{ $t('solutions.create.classes:modal.examination.minimal_grade.description') }}
        </p>
      </div>

      <div
        v-if="$media.mobile"
        class="group-checkbox-grade"
      >
        <InputField
          v-model="formData.minimalGrade"
          :label="$t('solutions.create.classes:modal.percent')"
          :validation="$v.formData.minimalGrade"
          :disabled="!formData.hasMinimalGrade"
          :has-percent="hasPercent"
          :min="0"
          :max="100"
          class="grade"
          type="number"
          dark
        />
      </div>

      <div
        v-if="formData.hasMinimalGrade"
        class="form-group clearfix theme-dark form-group-block-attempt is-flexible"
        :class="{ disabled: isGradeShowSchedule }"
      >
        <Checkbox
          v-model="formData.blockNewAttempts"
          :disabled="!canWrite('courses') || isGradeShowSchedule"
          :items="[
            {
              label: $t('solutions.create.classes:modal.examination.block.attempts'),
              value: true,
            },
          ]"
          dark
          switch-type
        />
        <div class="form-item">
          <Checkbox
            v-model="formData.restrictProgress"
            :items="RESTRICT_PROGRESS_OPTION"
            :disabled="!canWrite('courses')"
            dark
            switch-type
          />
          <p class="form-group-description text-color mt-1 restrict-progress-description">
            {{ $t('solutions.create.classes:modal.examination.restrict.progress.description') }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-column">
      <h3 class="form-section-title text-color mb-0">
        {{ $t('solutions.create.classes:modal.examination.grade.title') }}
      </h3>

      <p class="form-group-description text-color mt-1">
        {{ $t('solutions.create.classes:modal.examination.grade.description') }}
      </p>

      <div class="w-12">
        <Radio
          v-model="formData.gradeFormat"
          :items="gradeFormats"
          vertical
          dark
        />
      </div>
    </div>

    <div class="form-group clearfix theme-dark is-flexible">
      <div class="form-item">
        <p class="form-group-description text-color mt-1">
          {{ $t('solutions.create.classes:modal.examination.grade:show:description') }}
        </p>
      </div>

      <div>
        <Radio
          v-model="formData.gradeVisibility"
          :items="
            gradeVisibilityOptions.filter(
              (item) => item.value !== 'session_schedule_finish_after_correction'
            )
          "
          class="radio-group-items"
          dark
        >
          <template #actions="{ item }">
            <Tooltip
              :uppercase="false"
              :bold-font="false"
              :arrow="!$media.mobile"
              :align="$media.mobile ? '' : 'right'"
              :width="230"
              dark
            >
              <template #activator="{ on }">
                <Icon
                  name="help"
                  size="small"
                  wrapper
                  @mouseenter.native="on.mouseenter"
                  @mouseleave.native="on.mouseleave"
                />
              </template>
              <span v-html="item.hint"></span>
            </Tooltip>
          </template>
        </Radio>
        <Radio
          v-if="formData.gradeVisibility === 'session_schedule_finish'"
          v-model="formData.gradeVisibilityOption"
          :items="
            gradeVisibilityOptions.filter(
              (item) =>
                item.value !== 'session_schedule_finish' &&
                item.value !== 'session_schedule_finish_after_correction'
            )
          "
          class="radio-group-subitems"
          dark
        />
      </div>
    </div>

    <div
      v-if="!formData.isPreProject"
      class="form-group clearfix theme-dark form-group-tries is-flexible"
      :class="{ disabled: isGradeShowSchedule }"
    >
      <h3 class="form-section-title text-color">
        {{ $t('solutions.create.classes:modal.examination.tries') }}
      </h3>

      <Checkbox
        v-model="enableTriesQuantity"
        :items="[
          {
            value: true,
            label: $t('solutions.create.classes:modal.examination.set.tries'),
            description: $t('solutions.create.classes:modal.examination.set.tries.description'),
          },
        ]"
        :disabled="isGradeShowSchedule"
        switch-type
        dark
        @input="handleNumberOfTries"
      />

      <div class="flex flex-column w-12">
        <div
          class="form-item"
          :style="$media.mobile ? 'padding-bottom: 5px' : ''"
        >
          <p class="form-group-description text-color mt-1">
            {{ $t('solutions.create.classes:modal.examination.tries.description') }}
          </p>
        </div>

        <InputField
          v-model="formData.tries"
          :label="$t('solutions.create.classes:modal.examination.tries')"
          :validation="$v.formData.tries"
          :disabled="!canWrite('courses') || isGradeShowSchedule || !enableTriesQuantity"
          :max="10"
          :min="enableTriesQuantity ? 1 : 0"
          class="points"
          type="number"
          dark
        />
      </div>

      <Checkbox
        v-if="formData.tries > 1 || (formData.tries === 0 && !enableTriesQuantity)"
        v-model="formData.showHistoryTries"
        :items="[{ value: true, label: $t('solutions.create.classes:examination.tries.user') }]"
        :disabled="!canWrite('courses')"
        dark
        switch-type
      />
    </div>

    <div
      v-if="!formData.isPreProject"
      class="flex flex-column"
    >
      <div>
        <h3 class="form-section-title text-color">
          {{ $t('solutions.create.classes:modal.examination.timer.title') }}
        </h3>

        <p class="form-group-description text-color">
          {{ $t('solutions.create.classes:modal.examination.timer.description') }}
        </p>
      </div>

      <Checkbox
        v-model="hasTimer"
        :items="[
          {
            label: $t('solutions.create.classes:modal.examination.timer.checkbox'),
            value: true,
          },
        ]"
        class="timer-settings my-3"
        horizontal
        switch-type
        dark
      />

      <div
        v-if="hasTimer"
        class="flex"
      >
        <InputField
          v-model="timerHours"
          :label="$t('global:hours')"
          :validation="$v.timerHours"
          :max="24"
          :min="0"
          type="number"
          class="ml-10"
          dark
          @input="timeLimit"
        />
        <InputField
          v-model="timerMinutes"
          :label="$t('global:minutes')"
          :max="59"
          :min="0"
          :pad="2"
          :validation="$v.timerMinutes"
          type="number"
          class="ml-5"
          dark
          @input="timeLimit"
        />
      </div>
    </div>

    <div
      v-if="showRecoveryOption"
      class="form-group clearfix theme-dark is-flexible"
    >
      <Tips>
        <template #tip>
          <p v-html="$t('solutions.create.classes:modal.examination.recovery.tip')"></p>
        </template>
      </Tips>

      <div class="form-item">
        <h3 class="form-section-title text-color mt-3 mb-0">
          {{ $t('solutions.create.classes:modal.examination.recovery.title') }}
        </h3>

        <p class="form-group-description text-color">
          {{ $t('solutions.create.classes:modal.examination.recovery.description') }}
        </p>
      </div>

      <Tooltip
        v-if="disableRecovery && showRecoveryOption"
        :uppercase="false"
        :bold-font="false"
        :width="250"
        vertical-align="top"
      >
        <template #activator="{ on }">
          <Checkbox
            v-if="showRecoveryOption"
            v-model="formData.isRecovery"
            :items="[
              {
                label: $t('solutions.create.classes:modal.examination.recovery.checkbox'),
                value: true,
              },
            ]"
            class="timer-settings mt-5 mb-5"
            horizontal
            switch-type
            :disabled="disableRecovery"
            dark
            @mouseenter.native="on.mouseenter"
            @mouseleave.native="on.mouseleave"
          />
        </template>

        <span>{{ $t('community.sessions.recovery:tooltip') }}</span>
      </Tooltip>
      <Checkbox
        v-if="showRecoveryOption && !disableRecovery"
        v-model="formData.isRecovery"
        :items="[
          {
            label: $t('solutions.create.classes:modal.examination.recovery.checkbox'),
            value: true,
          },
        ]"
        class="timer-settings mt-5 mb-5"
        horizontal
        switch-type
        dark
      />
    </div>

    <div
      v-if="canWrite('courses')"
      class="form-submit text-center"
    >
      <Action
        :text="submitText"
        type="button"
        fixed-width
        secondary
        large
        submit
      />
    </div>

    <ModalConfirm
      :active="confirmChangesModal"
      :title="$t('global:attention')"
      :confirm-btn-text="$t('global:proceed')"
      @close="confirmChangesModal = false"
      @confirm="submit"
    >
      <p class="text-color">{{ $t('solutions.create.classes:modal.confirm.edit') }}</p>
    </ModalConfirm>

    <ModalConfirm
      :active="aggregateConfirmModal"
      :title="$t('pre.project.form.aggregate.examination.confirm.modal.title')"
      @close="closeAggregateConfirmModal"
      @confirm="handleAggregateExaminationSelect"
    >
      <p>{{ $t('pre.project.form.aggregate.examination.confirm.modal.description') }}</p>
    </ModalConfirm>
  </form>
</template>

<style lang="scss">
@import './ExaminationForm.scss';
</style>
