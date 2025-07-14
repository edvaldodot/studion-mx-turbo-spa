<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import smoothscroll from 'smoothscroll-polyfill'
import { getTime, getLongTime } from '@/support/utils/timerUtils'
import { isBefore, parseISO } from 'date-fns'

import { mapQuestion } from '../../utils/setupExaminationQuestions'
import { setupFormData } from '../../utils/setupExaminationFormData'
import EvaluationValidator from './EvaluationValidator.js'

import Action from '@/components/general/Action'
import ModalInformation from '@/components/general/ModalInformation'

import LateralExamination from '@/app/classroom/components/LateralExamination'

import StartExaminationButton from './components/StartExaminationButton.vue'
import EvaluationQuestions from './components/EvaluationQuestions.vue'
import DraftStatusChip from './components/DraftStatusChip.vue'

import examinationSendFileMixin from '@/app/solutions/mixins/examinationSendFileMixin'
import { draftMixin } from './mixins/draftMixin'
import { getAttemptTriesLabel } from '../../utils/labels'

const Modal = () => import('@/components/general/Modal')
const EvaluationPreProjectGroup = () => import('./components/EvaluationPreProjectGroup')

import PreProjectChooseInitModal from './components/PreProjectChooseInitModal.vue'

export default {
  name: 'EvaluationForm',

  components: {
    Action,
    EvaluationQuestions,
    Modal,
    ModalInformation,
    DraftStatusChip,
    LateralExamination,
    EvaluationPreProjectGroup,
    StartExaminationButton,
    PreProjectChooseInitModal,
  },

  mixins: [draftMixin, examinationSendFileMixin],

  props: {
    id: {
      type: Number,
      default: null,
    },
    examination: {
      type: Object,
      default: null,
    },
    answers: {
      type: Array,
      default() {
        return []
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    tutor: {
      type: Boolean,
      default: false,
    },
    maxAttempt: {
      type: Number,
      default: 1,
    },
    evaluationTitle: {
      type: String,
      default: null,
    },
    evaluationDescription: {
      type: String,
      default: null,
    },
    attempt: {
      type: Number,
      default: 0,
    },
    grade: {
      type: [Number, String],
      default: null,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
    feedbackInclude: {
      type: Boolean,
      default: null,
    },
    scheduleData: {
      type: Object,
      default: () => ({}),
    },
    status: {
      type: String,
      default: null,
    },
    evaluationBlockProgress: {
      type: Boolean,
      default: false,
    },
    time: {
      type: Object,
      default: null,
    },
    enrollmentId: {
      type: Number,
      default: null,
    },
    schedulePeriod: {
      type: Object,
      default: () => ({}),
    },
    hasPrerequisite: {
      type: Object,
      default: () => ({}),
    },
    nextTopic: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      statusGrade: null,
      questions: [],
      modalMessageHybrid: false,
      examinationStatus: null,
      modalReviewEvaluation: false,
      modalEndTime: false,
      completedQuestions: [],
      timerData: null,
      spentTime: null,
      mutableEnrollmentId: this.enrollmentId,
      groupPreProject: [],
      chooseInitEvaluationModal: false,
      isSending: false,
      isTimelineEnding: false,
      showLibras: false,
      hasLibras: false,
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    ...mapGetters(['isFullscreen']),

    ...mapState({
      $minPreProjectMembers: ({ Classroom }) => {
        const preProjectConfig = Classroom.data && Classroom.data.preProject
        if (!preProjectConfig) return
        return preProjectConfig.meta.min
      },
    }),

    isPreProject() {
      return this.$minPreProjectMembers && this.examination.isPreProject
    },

    sessionUuid() {
      return this.$route.params.session_uuid
    },

    answeredQuestionIds() {
      if (!this.submitted) return this.completedQuestions
      if (this.answers.length) return this.answers.map((i) => i.question.id)
      return this.questions.filter((i) => i.answered).map((i) => i.id)
    },

    notStartedExamination() {
      return this.examinationStatus === 'not_started'
    },

    hasAttempts() {
      return (
        this.maxAttempt === 0 ||
        this.attempt < this.maxAttempt ||
        (this.attempt === this.maxAttempt && !this.submitted)
      )
    },
    isHybrid() {
      return this.Classroom.data.course.type.alias === 'hybrid'
    },

    showAccomplished() {
      const scheduleFinish = this.examination.gradeVisibility === 'session_schedule_finish'
      return scheduleFinish && this.scheduleData
    },

    /*
      Controls when show grade and feedback.
      @returns {boolean}
    */
    showGrade() {
      if (!this.submitted) return false

      const grade = parseFloat(this.grade)
      const hasGrade = grade >= 0
      return hasGrade
    },

    isInPeriod() {
      return (this.scheduleData && this.scheduleData.open) || this.scheduleData === null
    },
    submitAgainDisabled() {
      return !this.hasAttempts || this.grade === null || isNaN(this.grade) || !this.isInPeriod
    },
    blockNewAttemptsOnPassed() {
      const blockNewAttempts = this.examination && this.examination.blockNewAttempts
      const hasPassedStatus = this.examinationStatus === 'passed'
      return Boolean(blockNewAttempts) && hasPassedStatus
    },
    gradeFormatIsHidden() {
      return (
        this.equalsProfile('student') &&
        this.examination &&
        this.examination.gradeFormat == 'hidden'
      )
    },

    getStatusLabel() {
      let label = 'classroom.assessments.evaluation:awaiting.correction'

      if (this.isHybrid || this.showAccomplished) {
        label = 'classroom.assessments.evaluation:accomplished'
      }

      return this.$t(label)
    },

    formatTimeScheduled() {
      return this.formatDate(this.schedulePeriod.end, 'long').replace(', ', ' às ')
    },
  },
  mounted() {
    this.getWidth()

    if (['started', 'expired'].includes(this.examinationStatus)) {
      this.getExaminationDrafts()
    }

    if (this.$route.params.retry) {
      this.enableFields()
    }

    this.$nextTick(() => {
      if (this.examinationStatus === 'started') {
        if (this.time.attemptDeadline) this.setTime(this.time)
      }

      this.setupLibras()
    })
  },
  created() {
    this.examinationStatus = this.status
    this.loadData({ ...this.time, examination: this.examination, answers: this.answers })
    smoothscroll.polyfill()

    if (this.isPreProject) {
      this.refreshGroupData()
    }

    window.addEventListener('focus', this.checkTime)
  },

  updated() {
    this.getWidth()
  },

  beforeDestroy() {
    window.removeEventListener('focus', this.checkTime)
  },

  validations: EvaluationValidator,

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptMakeExamination',
      'attemptUploadExaminationFiles',
      'attemptExaminationDrafts',
      'attemptStartExamination',
      'attemptGetDeadline',
      'attemptRetrievePreProjectGroup',
      'attemptAggregateExaminationAnswers',
    ]),

    checkTime() {
      if (!this.time.timeLimit || this.examinationStatus !== 'started' || !this.mutableEnrollmentId)
        return

      this.attemptGetDeadline({
        make_examination_id: this.mutableEnrollmentId,
        session_uuid: this.$route.params.session_uuid,
      }).then(({ data }) => {
        if (data.attemptDeadline) {
          if (isBefore(parseISO(data.attemptDeadline), parseISO(data.serverTime))) {
            return this.send()
          }

          this.setTime({
            attemptDeadline: data.attemptDeadline,
            serverTime: data.serverTime,
          })
        }
      })
    },

    async getExaminationDrafts() {
      try {
        this.setFetching(true)

        const { data } = await this.attemptExaminationDrafts({
          topicId: this.examination.topic.id,
          examinationId: this.examination.id,
          enrollmentId: this.Classroom.data.enrollment.id,
          attempt: this.attempt || 1,
        })

        this.injectDraftsQuestions(data)
        if (this.examinationStatus === 'expired') {
          this.$refs.sideBar.modalEndTime = true
          this.send()
        }
      } catch (_) {
        this.$impersonateFeedbackError()
      } finally {
        this.setFetching(false)
      }
    },

    async startExaminationAction() {
      await this.startExamination().then(() => {
        if (this.examination.aggregateExaminationsGraded) {
          this.chooseInitEvaluationModal = true
        }
      })
    },

    async startExamination() {
      try {
        this.setFetching(true)

        const { data } = await this.attemptStartExamination({
          topicId: this.examination.topic.id,
          enrollmentId: this.Classroom.data.enrollment.id,
        })

        this.$emit('update:attempt', data.attempt)
        this.$emit('update:status', data.status)
        this.examinationStatus = data.status
        this.mutableEnrollmentId = data.id

        this.loadData(data)

        if (data.attemptDeadline) {
          this.$nextTick(() => {
            this.setTime({
              attemptDeadline: data.attemptDeadline,
              serverTime: data.serverTime,
            })
          })
        }
      } catch (err) {
        this.$impersonateFeedbackError()
        this.setFeedback({ message: this.$t('global:error') })
        throw err
      } finally {
        this.setFetching(false)
      }
    },

    setTime(data) {
      const timeInSeconds = this.getTimeInSeconds(data.attemptDeadline, data.serverTime)
      this.timerData = timeInSeconds
    },

    getGeneralGrade() {
      let currentGrade = this.grade
      return currentGrade > 0 ? currentGrade.replace('.', ',') : '0'
    },

    setupLibras() {
      this.hasLibras = document.querySelector('.libras-blot')
    },

    injectDraftsQuestions(data) {
      this.questions.forEach((question) => {
        const { type } = question

        if (data.answers && data.answers.length) {
          const answered = data.answers.filter((answer) => {
            return (
              answer.question_id === question.id ||
              (question.aggregateQuestion && question.aggregateQuestion.id === answer.question_id)
            )
          })

          if (answered && answered.length) {
            const [draftAnswer] = answered

            if (type === 'association') {
              question.itemsAnswer = draftAnswer.association.map(({ choice_id }) => choice_id)

              this.handleWithCompletedQuestions(question, question.itemsAnswer)
            } else if (
              ['multiple_choices', 'multiple_choices_multi_answers', 'true_or_false'].includes(type)
            ) {
              if (type == 'multiple_choices_multi_answers') {
                question.answer.choice.choice_id = draftAnswer.choice_id.map((id) => {
                  return `${id}`
                })
              } else {
                question.answer.choice.choice_id = draftAnswer.choice_id
              }

              if (
                (question.type === 'multiple_choices_multi_answers' &&
                  question.answer.choice.choice_id.length) ||
                (question.type === 'true_or_false' &&
                  question.answer.choice.choice_id.length === question.choices.length / 2) ||
                question.type === 'multiple_choices'
              ) {
                this.completedQuestions.push(question.id)
              }

              if (question.type === 'true_or_false') {
                for (let i = draftAnswer.choice_id.length; i < question.choices.length / 2; i++) {
                  question.answer.choice.choice_id.push(null)
                }
              }
            } else if (type === 'fill_gap') {
              const listOfIds = new Set(draftAnswer.answer.map(({ item_id }) => item_id))

              const answerFormated = []

              for (const itemId of listOfIds) {
                answerFormated.push(
                  draftAnswer.answer
                    .filter((item) => item.item_id === itemId)
                    .map(({ answer }) => answer)
                )
              }

              question.answer = answerFormated

              this.completedQuestions.push(question.id)
            } else if (type === 'send_file') {
              question.answer.answer = draftAnswer.send_file.answer
              question.files = draftAnswer.send_file.files

              if (question.files.length) {
                this.completedQuestions.push(question.id)
              }
            } else {
              question.answer.answer = draftAnswer.answer

              if (question.answer.answer.length) {
                this.completedQuestions.push(question.id)
              }
            }
          }
        }
      })
    },

    getTimeInSeconds(a, b) {
      return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 1000)
    },

    loadData(data) {
      if (data.examination.examDeadline) {
        this.spentTime = this.getTimeInSeconds(data.endTime, data.startTime)
      }

      this.questions = data.examination.questions.map(mapQuestion(data, this.examinationStatus))
    },

    _splitFilesArray(files) {
      return {
        fileWithId: files.filter((file) => !!file.id),
        filesToUpload: files.filter((file) => !file.id),
      }
    },
    /**
     * Upload each file of `send_file` question and save response to send on examination answer request.
     * @param {Object[]} questions
     */
    async sendFileQuestionManipulation(questions) {
      return Promise.all(
        questions.map(async (question) => {
          if (question.type !== 'send_file') return question

          const { fileWithId, filesToUpload } = this._splitFilesArray(question.files)
          let files = fileWithId

          if (filesToUpload.length) {
            const { data } = await this.attemptUploadExaminationFiles({
              files: filesToUpload,
              type: 'answer',
            })

            files = [fileWithId, data].flat()
          }

          question.files = files

          return question
        })
      )
    },

    /**
     * Create a clone of questions and manipulate fields to send on examination answer request.
     * @returns {Promise<Object[]>}
     */
    getQuestionsData() {
      return this.sendFileQuestionManipulation(this.deepClone(this.questions))
    },

    openReviewEvaluation() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.modalReviewEvaluation = true
      } else {
        const questionsComponent = this.$refs.evaluationQuestions
        for (let i = 0; i < this.questions.length; i++) {
          if (this.$v.questions.$each[i].$error) {
            this.scrollToElem(questionsComponent.$refs.question[i])
            return
          }
        }
      }
    },

    async send() {
      if (this.isSending) return
      this.isSending = true

      if (this.examination.topic.id !== parseInt(this.$route.params.type_id)) return

      this.setFetching(true)
      let formData = {}
      formData.topic_id = this.id
      formData.examination_id = this.examination.id
      formData.lastTryId = this.lastTryId
      formData.answers = []

      this.timerData = null

      const questions = await this.getQuestionsData()

      questions.forEach((question) => {
        formData = setupFormData[question.type](formData, question)
      })
      this.attemptMakeExamination({ sessionUuid: this.sessionUuid, data: formData })
        .then(({ data }) => {
          this.modalReviewEvaluation = false
          this.examinationStatus = data.status
          this.completedQuestions = []

          this.$emit('update:grade', parseFloat(data.grade).toFixed(2))
          this.$emit('update:attempt', data.attempt)
          this.loadData(data)
          this.$emit('update:questions', this.questions)
          this.scrollToElem(null)
          this.setFetching(false)
          this.$emit('update:submitted', true)
          this.$emit('update:status', data.status)
          if (this.isHybrid) this.openModal()
        })
        .catch(({ response }) => {
          this.scrollToElem(null)
          this.setFetching(false)
          this.$emit('update:submitted', false)

          if (!response || !response.data) return
          const errorMessage = response.data.message

          if (errorMessage === 'question_already_has_an_answer') {
            this.setFeedback({
              message: this.$t('classroom.assessments:error.question_already_has_an_answer'),
              type: 'error',
            })

            this.modalReviewEvaluation = false
            return this.$emit('refresh')
          }

          if (errorMessage === 'group_does_not_meet_conditions') {
            this.refreshGroupData()
            this.setFeedback({
              message: this.$t('pre.project.panel.group:error:group_does_not_meet_conditions', {
                num: this.$minPreProjectMembers,
              }),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.isSending = false
          this.setFetching(false)
        })
    },
    async enableFields() {
      if (this.submitAgainDisabled || this.blockNewAttemptsOnPassed) return

      if (!this.$router.history.current.name !== 'classroom.lessons.course.type') {
        this.$router.push({
          name: this.$isEnabledFeature('examination_tool_feature')
            ? 'classroom.lessons.course.evaluation.access'
            : 'classroom.lessons.course.type',
          params: {
            session_uuid: this.sessionUuid,
            type: 'examination',
            type_id: this.id,
          },
        })
        this.$emit('update:grade', null)
      }

      try {
        await this.startExaminationAction()

        this.clearFields()
        this.mx_clearDraftStatus()
        this.$emit('update:submitted', false)
        this.$emit('update:grade', 0)
        this.getExaminationDrafts()
      } catch ({ response }) {
        if (response.data.message === 'pending_evaluation_correction') {
          this.setFeedback({
            message: this.$t('classroom.assessments.evaluation:awaiting.correction.blocked'),
          })
        }
      }
    },

    refreshGroupData() {
      this.setFetching(true)
      this.attemptRetrievePreProjectGroup(this.$route.params['session_uuid'])
        .then((response) => {
          this.groupPreProject = response.data.group || []
        })
        .finally(() => this.setFetching(false))
    },
    clearFields() {
      this.scrollToElem(null)
      this.$v.$reset()
      this.questions.forEach((question) => {
        question.choices.map((choice) => {
          choice.disabled = false
        })
        if (question.type === 'multiple_choices_multi_answers')
          question.answer.choice.choice_id = null
        if (question.type === 'association') {
          question.itemsAnswer = []
          question.items.forEach(() => question.itemsAnswer.push(null))
        }
        if (question.type !== 'fill_gap')
          question.answer = { choice: { choice_id: null }, answer: null }
        if (question.type === 'true_or_false') {
          question.answer = { choice: { choice_id: [] } }
          question.items.forEach(() => {
            question.answer.choice.choice_id.push(null)
          })
        }

        if (question.type === 'fill_gap') {
          question.answer = []
        }
      })
    },
    scrollToElem(elem) {
      let top = elem ? elem.getBoundingClientRect().top : 0
      setTimeout(() => {
        window.scroll({
          top: top + window.scrollY,
          behavior: 'smooth',
        })
      }, 100)
    },
    getWidth() {
      if (
        this.$refs.evaluationStatus !== undefined &&
        typeof this.$refs.evaluationStatus === 'object'
      ) {
        this.statusGrade = this.$refs.evaluationStatus.offsetWidth
      }
    },
    openModal() {
      this.modalMessageHybrid = true
    },
    closeModal() {
      this.modalMessageHybrid = false
    },

    handleTouch({ question, validation, forcePush = false }) {
      this.mx_handleDraft(
        question,
        this.examination,
        this.Classroom.data.enrollment,
        this.attempt || 1
      )

      this.handleWithCompletedQuestions(question, validation, forcePush)
    },

    handleWithCompletedQuestions(question, validation, forcePush = false) {
      if (forcePush) {
        this.completedQuestions.push(question.id)
      }

      if (validation && question.type === 'association') {
        const answers = validation.filter((i) => i)

        if (answers.length === validation.length) {
          this.completedQuestions.push(question.id)
          return
        }
      }

      if (validation && question.type === 'true_or_false') {
        if (
          question.answer.choice.choice_id.filter((choice) => !!choice).length ===
          question.choices.length / 2
        ) {
          return this.completedQuestions.push(question.id)
        }

        return
      }

      if (
        validation &&
        !Array.isArray(validation) &&
        !validation.$anyError &&
        !validation.$invalid
      ) {
        this.completedQuestions.push(question.id)
        return
      }

      this.completedQuestions = this.completedQuestions.filter((i) => i !== question.id)
    },

    forceDraftSubmit() {
      this.mx_forceDraftSubmit(this.examination, this.Classroom.data.enrollment, this.attempt || 1)
    },

    getLongTime,
    getTime,
    getAttemptTriesLabel,

    async chooseInitEvaluation(type) {
      this.chooseInitEvaluationModal = false

      if (type === 'empty') return
      else {
        this.getAggregateExamination()
      }
    },

    forceAllQuestionsDraftSubmit() {
      this.questions.forEach((question) => {
        this.handleTouch({ question, validation: null, forcePush: true })
      })

      this.forceDraftSubmit()
    },

    async getAggregateExamination() {
      this.setFetching(true)

      this.attemptAggregateExaminationAnswers({
        examinationId: this.examination.id,
        enrollmentId: this.Classroom.data.enrollment.id,
      })
        .then(({ data }) => {
          this.injectDraftsQuestions(data)
        })
        .then(() => {
          this.forceAllQuestionsDraftSubmit()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    openPreProject() {
      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          session_uuid: this.sessionUuid,
          type: 'examination',
          type_id: this.examination.aggregateExamination.topic.id,
        },
      })
    },
  },
}
</script>

<template>
  <div class="examination__container">
    <div
      class="evaluation-student examination__form"
      :class="{
        'theme-dark': accessibility,
        'evaluation-student-mobile': $media.mobile,
        'libras-on': showLibras,
      }"
    >
      <Action
        v-if="hasLibras"
        class="evaluation-libras-floating"
        type="button"
        icon="libras"
        icon-size="large"
        @click="showLibras = !showLibras"
      />

      <div class="evaluation-header">
        <div class="evaluation-header-text">
          <div class="evaluation__status">
            <h2 class="evaluation-subtitle">
              {{
                $t(
                  isPreProject ? 'global:menu.preproject' : 'classroom.assessments.evaluation:title'
                )
              }}
            </h2>

            <DraftStatusChip
              v-show="mx_showDraftStatus"
              :show-status-text="mx_showDraftStatusText"
              :saving="mx_draftSaving"
              :success="mx_draftSuccess"
              :last-save="mx_lastSave"
            />
          </div>

          <h3 class="evaluation-title">
            {{ evaluationTitle }}
          </h3>

          <span class="evaluation-tries">
            {{ getAttemptTriesLabel(attempt, maxAttempt) }}
          </span>

          <span
            v-if="maxAttempt > 0 && attempt === maxAttempt && submitted && isStudent()"
            class="evaluation-tries-exceeded-attempts"
          >
            {{ $t('classroom.assessments.evaluation:attempts.warning') }}
          </span>
          <span
            v-if="spentTime && examinationStatus !== 'started'"
            class="evaluation-tries-time"
            v-html="`| ${$t('classroom.lessons:timer.spent.time', { time: getTime(spentTime) })}`"
          ></span>

          <p
            v-if="schedulePeriod"
            class="evaluation-tries-p"
          >
            {{ `${$t('classroom.lessons:timeline.timer.time')}: ` }}
            <span class="highlight">{{ formatTimeScheduled }}</span>
          </p>
        </div>

        <div>
          <div
            v-if="submitted"
            ref="evaluationStatus"
            class="evaluation-status"
            :class="{
              'status-text': !(parseFloat(grade) >= 0),
              'evaluation-status-mobile': $media.mobile,
            }"
          >
            <div
              v-if="gradeFormatIsHidden"
              class="evaluation-status-label gap"
            >
              <span>
                {{ $t(`classroom.assessments.evaluation:status.resolved`) }}
              </span>
            </div>

            <template v-else-if="showGrade">
              <span class="evaluation-status-value">{{ getGeneralGrade() }}</span>
              <span
                v-if="examinationStatus"
                class="evaluation-status-label"
              >
                {{ $t(`classroom.assessments.evaluation:status.${examinationStatus}`) }}
              </span>
            </template>
            <template v-else>
              <span class="evaluation-status-label">{{ getStatusLabel }}</span>
            </template>
          </div>
        </div>
      </div>

      <EvaluationPreProjectGroup
        v-if="isPreProject && isStudent()"
        :items="groupPreProject"
        @update:view="refreshGroupData"
      >
        <template #nav>
          <Action
            v-if="examination.aggregateExaminationsGraded"
            :text="$t('pre.project.show.old.evaluation')"
            class="btn-collapse"
            type="button"
            icon-size="small"
            flat
            @click="openPreProject"
          />
        </template>
      </EvaluationPreProjectGroup>

      <div
        v-if="equalsProfile('student')"
        class="text-center form-submit-again"
      >
        <Action
          v-if="submitted"
          type="button"
          :text="
            maxAttempt > 1 || maxAttempt === 0
              ? $t('classroom.assessments.evaluation:question.submit.again.student')
              : $t('classroom.assessments.evaluation:question.submit.student')
          "
          :disabled="submitAgainDisabled || blockNewAttemptsOnPassed"
          :dark="accessibility"
          primary
          large
          @click="enableFields()"
        />

        <span
          v-if="!hasAttempts && maxAttempt > 1"
          class="btn-disabled-error"
        >
          {{ $t('classroom.assessments.evaluation:question.submit.again.error') }}
        </span>

        <span
          v-if="scheduleData && !scheduleData.open"
          class="btn-disabled-error"
        >
          {{
            $t('classroom.assessments.evaluation:date.limite.message', {
              date: formatDate(new Date(scheduleData.end)),
            })
          }}
        </span>
      </div>

      <div
        v-if="evaluationDescription"
        class="evaluation-description"
      >
        <p v-html="evaluationDescription"></p>
      </div>

      <form
        class="evaluation-form"
        @submit.prevent="openReviewEvaluation"
      >
        <div class="text-center">
          <StartExaminationButton
            v-if="notStartedExamination && !submitted && isInPeriod && equalsProfile('student')"
            :disabled="isPreProject && !(groupPreProject && groupPreProject.length)"
            :tooltip="
              $t('pre.project.panel.group:examination:start:tooltip', {
                menu: $t('community.groups:datatable.header.1').toUpperCase(),
              })
            "
            @click="startExaminationAction"
          />

          <p
            v-if="time.timeLimit > 0 && notStartedExamination"
            class="evaluation-tries-p"
          >
            {{ `${$t('classroom.lessons:timer.time')}: ` }}
            <span class="highlight">{{ getLongTime(time.timeLimit) }}</span>
          </p>

          <p
            v-if="time.timeLimit > 0 && notStartedExamination"
            class="evaluation-tries-p-warning"
            v-html="$t('classroom.lessons:timer.warning')"
          ></p>
        </div>

        <EvaluationQuestions
          v-if="!notStartedExamination || submitted || notEqualsProfile('student')"
          ref="evaluationQuestions"
          :questions="questions"
          :submitted="submitted || notEqualsProfile('student')"
          :grade-format-is-hidden="gradeFormatIsHidden"
          :show-feedback="showGrade"
          :feedback-include="feedbackInclude"
          :validations="$v"
          :accessibility="accessibility"
          :is-hybrid="isHybrid"
          :is-in-period="isInPeriod"
          @touch-question="handleTouch"
        />

        <slot name="above-button"></slot>

        <div
          v-if="equalsProfile('student') && !notStartedExamination && !submitted"
          class="form-submit"
        >
          <div class="draft__button">
            <Action
              type="button"
              :text="$t('global:save.draft')"
              :disabled="mx_draftSaving || !mx_enableSubmitDraftButton"
              flat
              @click="forceDraftSubmit"
            />

            <DraftStatusChip
              v-show="mx_showDraftStatus"
              :show-status-text="mx_showDraftStatusText"
              :saving="mx_draftSaving"
              :success="mx_draftSuccess"
              :last-save="mx_lastSave"
            />
          </div>

          <Action
            v-if="hasAttempts && !submitted"
            :text="$t('classroom.assessments.evaluation:question.submit.student')"
            :disabled="mx_draftSaving"
            :dark="accessibility"
            type="button"
            submit
            primary
            large
          />
          <action
            v-if="submitted"
            type="button"
            :text="
              maxAttempt > 1
                ? $t('classroom.assessments.evaluation:question.submit.again.student')
                : $t('classroom.assessments.evaluation:question.submit.student')
            "
            primary
            large
            :disabled="submitAgainDisabled || blockNewAttemptsOnPassed"
            :dark="accessibility"
            @click="enableFields()"
          />
          <span
            v-if="!hasAttempts && maxAttempt > 1"
            class="btn-disabled-error"
            >{{ $t('classroom.assessments.evaluation:question.submit.again.error') }}</span
          >
          <span
            v-if="scheduleData && !scheduleData.open"
            class="btn-disabled-error"
            >{{
              $t('classroom.assessments.evaluation:date.limite.message', {
                date: formatDate(new Date(scheduleData.end)),
              })
            }}</span
          >
        </div>
      </form>
    </div>

    <LateralExamination
      v-if="!notStartedExamination"
      ref="sideBar"
      :not-started-examination="notStartedExamination"
      :timer-data="timerData"
      :is-draft-saving="mx_draftSaving"
      :links="questions"
      :status="examinationStatus"
      :checked-ids="answeredQuestionIds"
      :end-timeline="schedulePeriod ? schedulePeriod.end : null"
      :has-prerequisite="hasPrerequisite"
      :next-topic="nextTopic"
      @end="send"
      @send="openReviewEvaluation"
      @submitDraft="forceDraftSubmit"
    />

    <modal
      :active="modalMessageHybrid"
      :cancel="false"
    >
      <div class="modal-content">
        <h2 class="modal-title text-color is-capitalize">
          {{ $t('classroom.lessons:modal.accomplished.evaluation.title') }}
        </h2>
        <div class="modal-description text-color">
          <p class="description-accomplished">
            {{ $t('classroom.lessons:modal.accomplished.evaluation.description') }}
          </p>
        </div>
      </div>
      <div class="form-submit text-center">
        <action
          large
          secondary
          fixed-width
          type="button"
          :text="$t('global:back')"
          @click="closeModal()"
        />
      </div>
    </modal>

    <PreProjectChooseInitModal
      v-if="chooseInitEvaluationModal"
      @close="chooseInitEvaluationModal = false"
      @choose="chooseInitEvaluation"
    />

    <ModalInformation
      v-if="modalReviewEvaluation"
      class="modal-review-evaluation"
    >
      <template #pre-content>
        <p class="text-color">{{ $t('classroom.lessons:modal.review.evaluation:pre.title') }}</p>
      </template>

      <template #title>
        {{ evaluationTitle }}
      </template>

      <template
        v-if="evaluationDescription"
        #description
      >
        <div class="evaluation-description">
          <p v-html="evaluationDescription"></p>
        </div>
      </template>

      <template #content>
        <EvaluationQuestions
          :questions="questions"
          :grade-format-is-hidden="gradeFormatIsHidden"
          :validations="$v"
          :accessibility="accessibility"
          review
        />
      </template>

      <template #actions>
        <Action
          type="button"
          :text="$t('classroom.lessons:modal.review.evaluation:change.answer')"
          large
          flat
          @click="modalReviewEvaluation = false"
        />

        <Action
          :text="$t('global:finish')"
          type="button"
          secondary
          large
          @click="send"
        />
      </template>
    </ModalInformation>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/assessments/styles.scss';
</style>
