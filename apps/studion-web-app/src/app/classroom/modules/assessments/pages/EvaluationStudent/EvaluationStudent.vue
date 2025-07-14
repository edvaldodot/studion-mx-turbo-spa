<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import { required, requiredIf, maxLength } from 'vuelidate/lib/validators'

import sumAllFileSizes from '@/support/customValidators/sumAllFileSizes'
import minValueIf from '@/support/customValidators/minValueIf'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import CommentForm from '@/components/general/CommentForm'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import Radio from '@/components/general/Radio'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'
import FillBlankField from '@/components/general/FillBlankField'
import AnswerTooltip from '@/components/shared/AnswerTooltip'

import EvaluationFileQuestion from '@/app/classroom/components/EvaluationFileQuestion'
import FilesForm from '@/app/solutions/components/FilesForm'
import FilesGrid from '@/app/classroom/components/FilesGrid'
import EvaluationGeneralFeedback from '@/app/classroom/components/EvaluationGeneralFeedback'
import QuestionFeedback from '@/app/classroom/components/QuestionFeedback'
import AnnulledFeedback from '@/app/classroom/components/AnnulledFeedback'
import ModalConfirm from '@/components/general/ModalConfirm'

import LateralExamination from '@/app/classroom/components/LateralExamination'

import examinationSendFileMixin from '@/app/solutions/mixins/examinationSendFileMixin'
import { fillGap } from './utils'
import { getAttemptTriesLabel } from '../../utils/labels'

export default defineComponent({
  name: 'EvaluationStudent',

  components: {
    Action,
    Checkbox,
    CommentForm,
    Dropdown,
    DropdownLink,
    EvaluationFileQuestion,
    EvaluationGeneralFeedback,
    FilesForm,
    FilesGrid,
    Icon,
    InputField,
    Modal,
    Radio,
    SelectField,
    TextareaField,
    FillBlankField,
    AnswerTooltip,
    QuestionFeedback,
    AnnulledFeedback,
    LateralExamination,
    ModalConfirm,
  },

  mixins: [examinationSendFileMixin],

  beforeRouteLeave(_, __, next) {
    this.$emit('change-header', {})
    next()
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.name === 'classroom.assessments.evaluation') {
        vm.fromRoute = from
      }
    })
  },

  props: {
    viewMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      idAfterLoad: null,
      statusGrade: null,
      allStudentsEvaluation: [],
      allEvaluationWaitingGrades: [],
      passNextEvaluation: null,
      studentExamination: {},
      fixLateralBlock: false,
      editFeedbackAnswer: false,
      fromRoute: null,
      confirmWithoutSaveModal: false,
      confirmWithoutSaveModalTo: '',
      openCorrections: [],
      hasLibras: false,
      showLibras: false,
      modalWarningLostChanges: false,
      navigation: {
        previous: null,
        current: null,
        next: null,
        total: 0,
      },
      tabLinks: [
        {
          text: 'classroom.assessments.tab.link.1',
          location: {
            name: 'classroom.assessments.evaluation',
          },
        },
      ],
      radioOptions: [
        {
          text: this.$t('classroom.assessments.evaluation:select.wrong'),
          value: 'incorrect',
        },
        {
          text: this.$t('classroom.assessments.evaluation:select.correct'),
          value: 'correct',
        },
        {
          text: this.$t('classroom.assessments.evaluation:select.partial'),
          value: 'partial',
        },
        {
          text: this.$t('classroom.assessments.evaluation:select.comment'),
          value: 'neutral',
        },
      ],
    }
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility', 'menuExpanded']),

    sessionUuid() {
      return this.$route.params.session_uuid
    },

    userMakeExaminationId() {
      return !this.passNextEvaluation ? this.$route.params.id : this.allEvaluationWaitingGrades[0]
    },

    existChangesNotSaved() {
      return (
        this.studentExamination.answers.filter(
          (question) =>
            question.feedbackVisible === false &&
            (question.choice !== null || (question.comment !== null && question.comment.length > 0))
        ).length > 0
      )
    },

    generalFeedback() {
      if (!this.studentExamination || !this.studentExamination.examinationComment) return null
      return this.studentExamination.examinationComment
    },

    /**
     * @desc Returns answered questions ids based on last revision by agent
     * @returns {Array<Number>}
     */
    answeredQuestionIds() {
      if (this.studentExamination && this.studentExamination.answers) {
        return this.studentExamination.answers
          .filter((answer) => {
            return answer.choice || answer.answer || (answer.files && answer.files.length)
          })
          .map((i) => i.question.id)
      }
      return []
    },

    preProjectHistory() {
      return this.$route.meta.preProjectHistory
    },
  },

  validations() {
    // Fallback values for validation
    let DEFAULT_LIMIT_FILES_LENGTH = 2
    let DEFAULT_SIZE_LIMIT_IN_BYTES = 100 * 1024 * 1024

    if (this.QUOTA_LIMIT_FILES_LENGTH) {
      DEFAULT_LIMIT_FILES_LENGTH = this.QUOTA_LIMIT_FILES_LENGTH
    }

    if (this.QUOTA_SIZE_LIMIT_IN_BYTES) {
      DEFAULT_SIZE_LIMIT_IN_BYTES = this.QUOTA_SIZE_LIMIT_IN_BYTES
    }

    const validationObject = {
      studentExamination: {
        examination: {
          questions: {
            $each: {
              choice: {
                required,
              },
              grade: {
                valueBiggerZero: minValueIf(0.01, function (answer) {
                  return answer.choice === 'partial'
                }),
                required: requiredIf(function (answer) {
                  return ['neutral', 'partial'].includes(answer.choice)
                }),
              },
              comment: {
                maxLength: maxLength(2000),
                required: requiredIf(function (answer) {
                  return answer.choice === 'neutral'
                }),
              },
              files: {
                required: requiredIf(function (nestedModel) {
                  return nestedModel.type === 'send_file' && nestedModel.allowFile
                }),
                maxFilesLength: maxLength(DEFAULT_LIMIT_FILES_LENGTH),
                maxSizeAllowed: sumAllFileSizes(DEFAULT_SIZE_LIMIT_IN_BYTES),
              },
            },
          },
        },
      },
    }

    return validationObject
  },

  mounted() {
    this.$emit('change-theme-footer', { dark: false })
    this.$emit('read:evaluation', this.userMakeExaminationId)
    window.addEventListener('scroll', this.updateScrollEffects)
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.updateScrollEffects)
  },

  created() {
    this.$emit('change-header', { customClasses: { evaluation: true } })
    this.load()
  },

  updated() {
    if (this.idAfterLoad != null && this.idAfterLoad !== this.userMakeExaminationId) {
      this.load()
      this.$v.$reset()
    }
    this.getWidth()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptUserMakeExaminationAgentRetrieval',
      'attemptUserMakeExaminationStudentRetrieval',
      'attemptGradeBatchQuestions',
      'attemptDeleteGradeExaminationAnswer',
      'attemptGradeExaminationAnswer',
      'attemptListClassroomEvaluationByEnrollment',
      'attemptUploadExaminationFiles',
      'attemptReadClassroomNotifications',
      'attemptGetMakeExaminationNavigation',
      'attemptGetHistoryEvaluation',
    ]),
    scrollToElem(elem) {
      let top = elem ? elem.offsetTop : 0
      setTimeout(() => {
        window.scroll({
          top: top,
          behavior: 'smooth',
        })
      }, 100)
    },
    lastHistory(question) {
      if (!['send_file', 'discursive'].includes(question.type) && !question.manualCorrection) return

      if (question.answers && question.answers.history && question.answers.history.length > 0) {
        return question.answers.history.slice(-1)[0]
      }
    },
    sendCorrections() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        let data = this.studentExamination.answers.filter((answer) => {
          if (
            !(
              answer.history.length > 0 &&
              answer.action === null &&
              (this.lastHistory(answer).type !== 'delete_revision' || answer.choice === null)
            )
          ) {
            return answer
          }
        })
        this.attemptGradeBatchQuestions({ sessionUuid: this.sessionUuid, data: data })
          .then(() => {
            this.load()
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },

    /**
     * Create a clone of question and manipulate fields to send on examination correction request.
     * @param {Object} question
     * @returns {Object[]}
     */
    async manipulateQuestionData(question) {
      if (question.type !== 'send_file' || !question.allowFile) return question

      const questionClone = this.deepClone(question)

      const { fileWithId, filesToUpload } = this.$splitFilesArray(questionClone.files)
      if (!filesToUpload.length) return question

      const { data } = await this.attemptUploadExaminationFiles({
        files: filesToUpload,
        type: 'correction',
      })

      questionClone.files = [fileWithId, data].flat()

      return questionClone
    },

    createAnswerData(questionData) {
      const answerData = {
        id: questionData.answers.id,
        grade: questionData.grade,
        result: questionData.choice,
        questionId: questionData.id,
      }

      if (questionData.comment) {
        answerData.comment = questionData.comment
      }

      if (questionData.type === 'send_file') {
        Object.assign(answerData, {
          files: questionData.files,
          allowFile: questionData.allowFile,
        })
      }

      return answerData
    },

    async gradeAnswer(question, index) {
      this.$v.studentExamination.examination.questions.$each[index].$touch()
      if (this.$v.studentExamination.examination.questions.$each[index].$invalid) return

      this.setFetching(true)
      const modifiedQuestionData = await this.manipulateQuestionData(question)
      const answerData = this.createAnswerData(modifiedQuestionData)
      this.attemptGradeExaminationAnswer({
        sessionUuid: this.sessionUuid,
        data: answerData,
        makeExaminationId: this.$route.params.id,
      })
        .then(({ data }) => {
          question.action = 'create_revision'
          question.answers.result = data.result
          question.answers.history = data.history
          question.answers.comment = data.comment
          question.answers.grade = data.grade
          question.feedbackVisible = true
          if (data.question.type === 'send_file') {
            question.answers.files = data.files || []
          }
          if (!this.isAllQuestionsAnswered()) {
            this.load()
            if (!this.isAllQuestionsInEdition()) {
              this.scrollToElem(null)
            }
          }

          this.openCorrections = this.openCorrections.filter((id) => id !== question.id)
        })
        .finally(() => {
          this.$set(this.studentExamination.examination.questions, index, question)
          this.setFetching(false)
        })
    },

    /**
     * Get smallest id.
     * @param {Object} list of objects containing `id` property.
     * @returns {number}
     */
    getSmallestId(list) {
      const [first] = Array.from(list).sort((a, b) => a.id - b.id)
      return first.id
    },

    removeCorrection(question, index) {
      this.setFetching(true)
      this.$set(question, 'action', 'delete_revision')
      this.$set(question, 'result', null)

      let id = Array.isArray(question.answers)
        ? this.getSmallestId(question.answers)
        : question.answers.id

      this.attemptDeleteGradeExaminationAnswer({ sessionUuid: this.sessionUuid, id })
        .then(({ data }) => {
          this.updateFinalGrade(question)

          question.answers.history = data.history
          question.answers.choice = null
          question.answers.result = null
          question.answers.comment = null
          question.answers.grade = data.grade
          question.result = null
          question.comment = null
          question.feedbackVisible = false

          if (data.question.type === 'send_file') {
            question.files = []
          }

          this.$set(question, 'choice', null)
          this.$set(this.studentExamination.examination.questions, index, question)
          this.$v.studentExamination.examination.questions.$each[index].$reset()
        })
        .finally(() => {
          this.setFetching(false)
          this.navigation.total++
        })
    },
    isAllQuestionsAnswered() {
      return (
        this.studentExamination.examination.questions.filter(
          (question) => question.answers && question.answers.result === null
        ).length > 0
      )
    },
    isAllQuestionsInEdition() {
      return (
        this.studentExamination.examination.questions.filter(
          (data) => !data.answers.feedbackVisible
        ).length > 0
      )
    },

    updateFinalGrade(question) {
      const examination = this.studentExamination.examination

      if (examination.questions.length === 1) {
        this.studentExamination.grade = 0
        return
      }

      this.studentExamination.grade -= question.grade || question.answers.grade
    },

    editCorrection(question) {
      this.updateFinalGrade(question)
      this.editFeedbackAnswer = true
      this.$set(question, 'feedbackVisible', false)
      this.$set(question, 'action', 'edit_revision')
    },

    back() {
      if (this.existChangesNotSaved && !this.modalWarningLostChanges) {
        this.modalWarningLostChanges = true
        return
      }

      if (this.$route.meta.isFromProject) {
        if (this.$route.params.management) {
          this.$router.push({ name: this.$route.params.management })
          return
        }
        this.$router.push({ name: 'classroom.pre.project.tccproject' })
        return
      }

      if (this.fromRoute) {
        this.$router.push({
          name: this.fromRoute.name,
          params: this.fromRoute.params,
        })
        return
      }

      this.$router.push({
        name: 'classroom.assessments.evaluation',
        params: {
          session_uuid: this.sessionUuid,
        },
      })
      this.modalWarningLostChanges = false
    },

    setupExaminationSendFileQuestions() {
      this.studentExamination.examination.questions =
        this.studentExamination.examination.questions.map((question) => {
          if (!['discursive', 'send_file'].includes(question.type)) return question

          const tempQuestion = this.deepClone(question)

          tempQuestion.templateFiles = [
            ...this.$filterFilesByType(tempQuestion, 'template'),
            ...this.$filterFilesByType(tempQuestion, 'question'),
          ]
          tempQuestion.files = this.$filterFilesByType(tempQuestion, 'correction')

          this.studentExamination.answers.forEach((answer) => {
            if (answer.question.id !== question.id) return

            Object.assign(tempQuestion, {
              grade: answer.grade,
              choice: answer.result,
              result: answer.result,
              comment: answer.comment,
              files: this.$filterFilesByType(answer, 'correction'),
            })
          })

          if (tempQuestion.type === 'discursive') return tempQuestion

          const hasFiles = Boolean(tempQuestion.files && tempQuestion.files.length)
          tempQuestion.files = hasFiles ? tempQuestion.files : []
          tempQuestion.allowFile = hasFiles

          return tempQuestion
        })
    },

    load() {
      this.setFetching(true)
      this.editFeedbackAnswer = false

      const makeExaminationParams = {
        sessionUuid: this.sessionUuid,
        userMakeExaminationId: !this.preProjectHistory
          ? this.userMakeExaminationId
          : this.$route.params.history,
      }
      let promisesList = []

      if (this.notEqualsProfile('student') && !this.preProjectHistory) {
        promisesList = [
          this.attemptUserMakeExaminationAgentRetrieval(makeExaminationParams),
          this.attemptListClassroomEvaluationByEnrollment({
            sessionUuid: this.sessionUuid,
            searchParams: {},
          }),
        ]
      } else if (this.preProjectHistory && this.notEqualsProfile('student')) {
        promisesList = [this.attemptGetHistoryEvaluation(makeExaminationParams)]
      } else {
        promisesList = [this.attemptUserMakeExaminationStudentRetrieval(makeExaminationParams)]
      }
      Promise.all(promisesList)
        .then(([{ data }, dataEnrollment]) => {
          if (this.$isEnabledFeature('classroom_notification')) {
            this.attemptReadClassroomNotifications({
              examinationId: data.examination.id,
              enrollmentExaminationId: data.id,
            })
          }

          this.studentExamination = data

          if (data.status === 'started' && this.equalsProfile('student')) {
            this.$router.push({
              name: 'classroom.lessons.course.type',
              params: {
                type_id: data.examination.topic.id,
                type: 'examination',
                session_uuid: this.$route.params.session_uuid,
                isCorrection: false,
              },
            })
          }

          this.setupExaminationSendFileQuestions()

          this.studentExamination.examination.questions.forEach((question) => {
            let questionAnswer = {
              selectedChoice: {},
              answers: null,
            }
            let choicesSelected = []
            const correctSuffix = this.notEqualsProfile('student')
              ? `<span class='correct-flag text-color'>${this.$t(
                  'classroom.assessments.evaluation:alternative.correct'
                )}</span>`
              : ''
            question.choices.forEach((choice) => {
              let label = choice.description
              if (this.notEqualsProfile('student') && choice.right) {
                label = `${choice.description} ${correctSuffix}`
              }
              choice.label = label
              choice.defaultLabel = choice.description
              choice.value = choice.id

              delete choice.description
            })

            if (data.answers && question.type === 'true_or_false') {
              question.userAnswers = []
              question.items.forEach((questionItem) => {
                this.studentExamination.answers.forEach((answer) => {
                  if (
                    answer.choice &&
                    answer.choice.item &&
                    answer.choice.item.id === questionItem.id
                  ) {
                    question.userAnswers.push({
                      choice: null,
                      right: false,
                    })
                  }
                })
                questionItem.options = question.choices
                  .filter((choice) => {
                    if (questionItem.id === choice.item.id) return choice
                  })
                  .map((option) => {
                    return {
                      label: `${this.$t(`global:${option.defaultLabel}`)} ${
                        option.right ? correctSuffix : ''
                      }`,
                      value: option.value,
                    }
                  })
              })

              data.answers.forEach((dataAnswer) => {
                if (dataAnswer.choice && dataAnswer.question.type === 'true_or_false') {
                  const idx = dataAnswer.question.choices.findIndex(
                    (choice) => choice.id === dataAnswer.choice.id
                  )
                  if (idx > -1)
                    question.userAnswers[Math.floor(idx / 2)] = {
                      choice: dataAnswer.choice.id,
                      right: dataAnswer.choice.right,
                    }
                }
              })

              let rightQuestions = question.userAnswers.filter((answer) => answer.right).length

              if (rightQuestions === question.items.length) {
                question.feedbackType = 'correct'
              } else if (rightQuestions > 0) {
                question.feedbackType = 'partial-multi'
              } else {
                question.feedbackType = 'wrong'
              }
            }
            if (data.answers && question.type === 'multiple_choices_multi_answers') {
              let userRightAnswers = []
              let correctAlternatives = []
              let markedCount = 0

              data.answers.map((answer) => {
                if (answer && answer.question && answer.question.id === question.id) {
                  if (answer.choice && answer.choice.right)
                    correctAlternatives.push(answer.choice.right)

                  if (answer.choice && answer.marked) {
                    markedCount++
                    if (answer.choice && answer.choice.right)
                      userRightAnswers.push(answer.choice.id)
                    return answer.choice.id.toString()
                  }
                }
              })

              const wrongMarked = markedCount !== userRightAnswers.length
              if (
                correctAlternatives.length &&
                userRightAnswers.length === correctAlternatives.length &&
                !wrongMarked
              ) {
                question.feedbackType = 'correct'
              } else if (userRightAnswers.length > 0 && !wrongMarked) {
                question.feedbackType = 'partial-multi'
              } else {
                question.feedbackType = 'wrong'
              }
            }

            if (question.type === 'multiple_choices_multi_answers') {
              questionAnswer = this.studentExamination.answers.filter((answer) => {
                if (answer.question.id === question.id) {
                  if (answer.choice && answer.marked)
                    choicesSelected.push(answer.choice.id.toString())
                  return true
                }
              })

              Object.assign(question, { selectedChoice: { id: choicesSelected } })
            }

            if (question.type === 'fill_gap') {
              Object.assign(question, fillGap(question, data))
            }

            if (['discursive', 'send_file'].includes(question.type)) {
              this.studentExamination.answers.forEach((answer) => {
                if (answer.question.id === question.id) {
                  questionAnswer = answer
                }
              })
            } else if (question.type !== 'multiple_choices_multi_answers') {
              this.studentExamination.answers.forEach((answer) => {
                if (answer.question.id === question.id) {
                  if (answer.choice) choicesSelected = answer.choice.id
                  questionAnswer = answer
                }
              })

              Object.assign(question, { selectedChoice: { id: choicesSelected } })
            }

            if (data.answers && question.type === 'multiple_choices') {
              const ans = data.answers.filter((answer) => answer.question.id === question.id)[0]
              if (!question.manualCorrection && ans && ans.choice) {
                questionAnswer.result = ans.choice.right ? 'correct' : 'wrong'
              }
            }

            if (question.type === 'association') {
              question.selectedChoice = []

              question.itemOptions = question.choices.map((choice, index) => {
                return {
                  text: index + 1,
                  value: choice.value,
                }
              })

              if (data.answers) {
                question.selectedChoiceDescription = []
                let rightAnswers = 0
                const itemsIndex = question.items.map((item) => item.id)
                this.studentExamination.answers.forEach((answer) => {
                  if (answer.question.type !== 'association') return

                  if (question.id === answer.question.id && answer.choice) {
                    question.selectedChoice[itemsIndex.indexOf(parseInt(answer.answer))] =
                      answer.choice.id
                    itemsIndex.forEach((id) => {
                      const idx = question.choices.findIndex((choice) => choice.item.id === id)
                      question.selectedChoiceDescription.push(
                        idx + 1 + '. ' + question.choices[idx].label
                      )
                    })
                    if (parseInt(answer.answer) === answer.choice.item.id) rightAnswers++
                  }

                  if (
                    answer.question &&
                    answer.question.choices &&
                    rightAnswers === answer.question.choices.length
                  ) {
                    question.feedbackType = 'correct'
                  } else if (rightAnswers > 0) {
                    question.feedbackType = 'partial-multi'
                  } else {
                    question.feedbackType = 'wrong'
                  }

                  if (rightAnswers === 0) question.feedbackType = 'wrong'

                  if (!question.manualCorrection) {
                    questionAnswer.result = question.feedbackType
                  }
                })
              }
            }
            if (question.manualCorrection && question.correction && questionAnswer) {
              questionAnswer.history = question.correction
              const lastCorrection = question.correction[question.correction.length - 1]
              questionAnswer.result = lastCorrection ? lastCorrection.afterRevision.result : null
              questionAnswer.grade = lastCorrection ? lastCorrection.afterRevision.grade : null
              question.feedbackType = questionAnswer.result
              this.$set(
                question,
                'comment',
                lastCorrection ? lastCorrection.afterRevision.comment : null
              )
            }
            Object.assign(question, { answers: questionAnswer })
          })

          if (dataEnrollment && dataEnrollment.data.data) {
            this.allStudentsEvaluation = dataEnrollment.data.data
            let evaluationId = this.studentExamination.id
            this.allEvaluationWaitingGrades = this.allStudentsEvaluation
              .filter((evaluation) => {
                let listAll = dataEnrollment.data.data.map((data) => data.lastTryId)
                return (
                  evaluation.lastTryId &&
                  listAll.slice(listAll.indexOf(evaluationId) + 1).includes(evaluation.lastTryId) &&
                  evaluation.attempts &&
                  !evaluation.lastTryGrade
                )
              })
              .map((data) => data.lastTryId)
          }
          this.idAfterLoad = this.userMakeExaminationId
        })
        .finally(() => {
          this.setFetching(false)
          this.$emit('loaded')

          this.hasLibras = document.querySelector('.libras-blot')
          if (this.notEqualsProfile('student')) this.getNavigation(makeExaminationParams)
        })
      this.passNextEvaluation = false
    },
    nextEvaluation() {
      this.passNextEvaluation = true
      this.$router.push({
        name: 'classroom.assessments.evaluation.student',
        params: { id: this.allEvaluationWaitingGrades[0], session_uuid: this.sessionUuid },
      })
      this.load()
      this.$v.$reset()
    },
    setNavigation(data) {
      this.navigation = data.data
    },
    getNavigation(params) {
      const hasNavigationParams =
        this.$route.query.examination_id || this.$route.query.enrollment_id
      const isSameEvaluation = Number(this.$route.params.id) === this.navigation.current

      if (isSameEvaluation) {
        this.navigation.total--
      }

      if (hasNavigationParams && !isSameEvaluation) {
        this.setFetching(true)
        this.attemptGetMakeExaminationNavigation({
          ...params,
          query: { ...this.$route.query },
        })
          .then((data) => {
            if (data) this.setNavigation(data)
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },

    navigate(to, skip = false) {
      if (this.openCorrections.length && !skip) {
        this.confirmWithoutSaveModal = true
        this.confirmWithoutSaveModalTo = to
        return
      }

      this.openCorrections = []

      this.$router.push({
        name: 'classroom.assessments.evaluation.student',
        params: {
          id: this.navigation[to],
          management: this.$route.params.management,
        },
        query: this.$route.query,
      })

      this.confirmWithoutSaveModal = false
    },

    canGradeQuestion(question) {
      let lastHistoryType =
        this.lastHistory(question) !== undefined ? this.lastHistory(question).type : null
      const isNotStudent = this.notEqualsProfile('student')
      const requiresFeedback =
        ['discursive', 'send_file'].includes(question.type) || question.manualCorrection
      const actionRequired =
        question.action === 'edit_revision' ||
        lastHistoryType === 'delete_revision' ||
        !lastHistoryType ||
        question.answers.history.length === 0
      let verifyCondition = requiresFeedback && actionRequired && isNotStudent && !question.annulled
      this.$set(question, 'feedbackVisible', !verifyCondition)

      return verifyCondition
    },
    /**
     * @desc Return if a question is manual correction (by default or by flag)
     * @param {Object} question
     * @returns {Boolean}
     */
    isManualCorrection(question) {
      return ['discursive', 'send_file'].includes(question.type) || question.manualCorrection
    },
    canShowFeedback(question) {
      if (question.annulled || !question.answers) return false

      const isAllowedAction = !['delete_revision', 'edit_revision'].includes(question.action)
      const isGraded = question.grade !== 0 || question.result === 'incorrect'

      return this.isManualCorrection(question) && isAllowedAction && isGraded
    },
    canMakeCorrection() {
      let discursiveAnswers = this.studentExamination.answers.filter((answer) => {
        return ['discursive', 'send_file'].includes(answer.question.type)
      })

      if (discursiveAnswers.length > 0 && this.studentExamination.isGraded === false) {
        return true
      }

      return false
    },
    openModalWarningLostChanges() {
      this.modalWarningLostChanges = true
    },
    closeModalWarningLostChanges() {
      this.modalWarningLostChanges = false
    },
    getWidth() {
      if (
        this.$refs.evaluationStatus !== undefined &&
        typeof this.$refs.evaluationStatus === 'object'
      ) {
        this.statusGrade = this.$refs.evaluationStatus.offsetWidth
      }
    },

    getQuestionFeedbackLastOwner(question) {
      const answers = question.answers
      const feedbackHistory = answers.history

      if (answers && feedbackHistory && feedbackHistory.length) {
        return feedbackHistory[feedbackHistory.length - 1]
      }

      return null
    },

    getQuestionFeedbackPoints(question) {
      const grade = question.answers.grade
      if (grade) {
        const gradeFixed = grade.toFixed(2)
        return this.$t(
          `classroom.assessments.evaluation:question.point${gradeFixed >= 2 ? 's' : ''}`,
          { num: gradeFixed.replace('.', ',') || '0' }
        )
      }
      return null
    },

    getTime() {
      const timeInSeconds = Math.round(
        (new Date(this.studentExamination.endTime).getTime() -
          new Date(this.studentExamination.startTime).getTime()) /
          1000
      )

      const hours = Math.floor(timeInSeconds / 3600)
        .toString()
        .padStart(2, '0')
      const minutes = Math.floor((timeInSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0')
      const seconds = (timeInSeconds % 60).toString().padStart(2, '0')

      return `${hours}:${minutes}:${seconds}`
    },

    getQuestionFeedbackUserBlockCondition(question) {
      return (
        ((question.answers && this.$filterFilesByType(question.answers, 'correction').length) ||
          (question.comment && !['', 'null', 'undefined'].includes(question.comment))) &&
        question.answers.history.length
      )
    },

    getQuestionFeedbackOwnerName(question) {
      const owner = this.getQuestionFeedbackLastOwner(question)
      if (owner) return owner.auditInsert.user.name
      return null
    },

    getQuestionFeedbackOwnerImage(question) {
      const owner = this.getQuestionFeedbackLastOwner(question)
      if (owner) return owner.auditInsert.user.image
      return null
    },

    getQuestionFeedbackOwnerAuditDate(question) {
      const owner = this.getQuestionFeedbackLastOwner(question)

      if (owner) {
        const hourObject = {
          date: this.formatDate(owner.auditInsert.dh),
          hour: this.formatDate(owner.auditInsert.dh, 'shortTime'),
        }

        return this.$t('global:date.hours', hourObject)
      }

      return null
    },

    isAnnulled(question) {
      return Boolean(question.annulled)
    },

    updateScrollEffects() {
      this.fixLateralBlock = window.scrollY > (this.isFullscreen ? 120 : 320)
    },

    getAttemptTriesLabel,

    initQuestionCorrection(question) {
      const openCorrection = this.openCorrections.filter((id) => id === question.id)

      if (!openCorrection.length) {
        this.openCorrections.push(question.id)
      }
    },

    openPreProject() {
      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          session_uuid: this.sessionUuid,
          type: 'examination',
          type_id: this.studentExamination.examination.aggregateExamination.topic.id,
        },
      })
    },
  },
})
</script>

<template>
  <div class="inner-content">
    <div
      v-if="!viewMode"
      :class="{ fixed: fixLateralBlock && !$media.mobile, 'menu-expanded': menuExpanded }"
      class="assessments-bar assessments-bar-top"
    >
      <Action
        :dark="accessibility"
        :text="
          $route.meta.isFromProject
            ? $route.params.management
              ? $t('management:back.to.management')
              : $t('global:return.to.project.list')
            : $t('global:return.to.evaluation.list')
        "
        type="button"
        icon="keyboard_backspace"
        class="btn-prev"
        flat
        @click="back"
      />

      <Action
        v-if="hasLibras"
        class="evaluation-libras-floating"
        type="button"
        icon="libras"
        icon-size="large"
        @click="showLibras = !showLibras"
      />

      <div class="assessments-bar-controls">
        <Action
          v-if="navigation.previous"
          :text="$t('global:prev')"
          :dark="accessibility"
          :disabled="false"
          type="button"
          icon="keyboard_backspace"
          class="btn-prev"
          flat
          @click="navigate('previous')"
        />
        <p v-if="!$media.mobile">
          <strong>{{ navigation.total || 0 }}</strong>
          {{ $t('classroom.assessments.evaluation:status.awaiting_correction') }}
        </p>
        <Action
          v-if="navigation.next"
          :text="$t('global:next.evaluation')"
          :dark="accessibility"
          :disabled="false"
          type="button"
          icon="keyboard_backspace"
          class="btn-next"
          icon-right
          flat
          @click="navigate('next')"
        />
      </div>
    </div>

    <div
      class="main-content-inner is-mobile-margin examination__container"
      :class="{ 'libras-on': showLibras }"
    >
      <template v-if="studentExamination.examination">
        <div class="examination__form">
          <div
            :class="{ '--view-mode': viewMode }"
            class="evaluation-student"
          >
            <div class="evaluation-header">
              <div class="evaluation-header-text">
                <h2
                  v-if="studentExamination.answers.length"
                  class="evaluation-subtitle"
                >
                  {{
                    $t('classroom.assessments.evaluation:by', {
                      name: studentExamination.answers[0].applicationUser.userData.name,
                    })
                  }}
                </h2>

                <h3 class="evaluation-title">
                  {{ studentExamination.examination.topic.name }}
                </h3>

                <span class="evaluation-tries">
                  {{
                    getAttemptTriesLabel(
                      studentExamination.attempt,
                      studentExamination.examination.tries
                    )
                  }}
                </span>

                <span
                  v-if="studentExamination.examination.examDeadline > 0"
                  class="evaluation-tries-time"
                >
                  {{ ' | ' + $t('classroom.lessons:timer.spent.time.2') + ' ' }}
                  <span class="highlight">{{ getTime() }}</span>
                </span>

                <span
                  v-if="
                    studentExamination.attempt === studentExamination.examination.tries &&
                    equalsProfile('student')
                  "
                  class="evaluation-tries-exceeded-attempts"
                >
                  {{ $t('classroom.assessments.evaluation:attempts.warning') }}
                </span>
              </div>

              <div>
                <div
                  ref="evaluationStatus"
                  class="evaluation-status"
                  :class="{
                    'status-text': !(
                      parseFloat(studentExamination.grade) >= 0 && !isAllQuestionsAnswered()
                    ),
                    'evaluation-status-mobile': $media.mobile,
                  }"
                >
                  <template
                    v-if="parseFloat(studentExamination.grade) >= 0 && !isAllQuestionsAnswered()"
                  >
                    <span class="evaluation-status-label">
                      {{ $t('classroom.assessments.evaluation:grade') }}
                    </span>

                    <span class="evaluation-status-value">
                      {{
                        studentExamination.grade > 0
                          ? studentExamination.grade.toString().replace('.', ',')
                          : '0'
                      }}
                    </span>
                  </template>

                  <template v-else>
                    <span class="evaluation-status-label">
                      {{
                        $t(`classroom.assessments.evaluation:status.${studentExamination.status}`)
                      }}
                    </span>
                  </template>
                </div>
              </div>
            </div>

            <div
              v-if="studentExamination.examination.topic.description"
              class="evaluation-description"
              :class="{ 'evaluation-description-mobile': $media.mobile }"
            >
              <p v-html="studentExamination.examination.topic.description"></p>
            </div>

            <div
              v-if="studentExamination.aggregateExaminationsGraded"
              class="evaluation-open-pre-project"
            >
              <Action
                :text="$t('pre.project.show.old.evaluation')"
                class="btn-collapse"
                type="button"
                icon-size="small"
                flat
                @click="openPreProject"
              />
            </div>

            <form @submit.prevent="sendCorrections">
              <div
                v-for="(question, index) in studentExamination.examination.questions"
                :id="`qid_${question.id}`"
                :key="index"
                class="evaluation-question"
              >
                <div class="evaluation-question-header">
                  <h4 class="evaluation-question-number">
                    {{
                      $tc('classroom.assessments.evaluation:question.number', question.points, {
                        num: index + 1,
                      })
                    }}
                  </h4>
                  <span class="evaluation-question-points">{{
                    $t(
                      `classroom.assessments.evaluation:question.point${
                        question.points >= 2 ? 's' : ''
                      }`,
                      { num: question.points }
                    )
                  }}</span>
                </div>
                <div class="evaluation-question-description">
                  <p v-html="question.statement"></p>
                  <FilesGrid
                    v-if="question.type === 'send_file'"
                    :value="question"
                  />
                </div>

                <div class="evaluation-question-answer">
                  <template v-if="question.type === 'discursive'">
                    <TextareaField
                      :key="index"
                      v-model="question.answers.answer"
                      :label="$t('classroom.assessments.evaluation:answer')"
                      hide-error-details
                      auto-grow
                      disabled
                    />

                    <div
                      v-if="studentExamination.examination.feedbackInclude && question.feedback"
                      class="evaluation-question-feedback"
                    >
                      <p class="text-color">{{ question.feedback }}</p>
                    </div>
                  </template>

                  <EvaluationFileQuestion
                    v-if="question.type === 'send_file'"
                    :value="question"
                    :disabled="true"
                    dynamicProperty="answers"
                    correctionMode
                  >
                    <template v-slot:modelFiles>
                      <FilesGrid
                        :files="
                          question.answers && question.answers.question
                            ? question.answers.question.files
                            : question.templateFiles
                        "
                      />
                    </template>
                    <template
                      v-if="question.answers && question.answers.files"
                      v-slot:answerFiles
                    >
                      <FilesGrid
                        :files="$filterFilesByType(question.answers, 'answer')"
                        :label="$t('global:file')"
                      />
                    </template>
                  </EvaluationFileQuestion>

                  <template v-if="question.type === 'multiple_choices'">
                    <radio
                      :items="question.choices"
                      :value="question.selectedChoice ? question.selectedChoice.id : null"
                      disabled
                    ></radio>
                  </template>

                  <template v-if="question.type === 'multiple_choices_multi_answers'">
                    <checkbox
                      :items="question.choices"
                      :value="question.selectedChoice ? question.selectedChoice.id : null"
                      disabled
                    />
                  </template>

                  <template v-if="question.type === 'association'">
                    <div class="evaluation-question-flex">
                      <div class="evaluation-question-choices">
                        <p
                          v-for="(choice, cIndex) in question.choices"
                          :key="cIndex"
                          class="mt-2 mb-4"
                        >
                          <b>{{ cIndex + 1 }}</b> {{ choice.defaultLabel }}
                        </p>
                      </div>

                      <div class="evaluation-question-items">
                        <p
                          v-for="(item, iIndex) in question.items"
                          :key="iIndex"
                          class="mb-2"
                        >
                          <SelectField
                            :items="question.itemOptions"
                            :show-optional="false"
                            :value="
                              question.selectedChoice && question.selectedChoice.length
                                ? question.selectedChoice[iIndex]
                                : []
                            "
                            disabled
                          />

                          {{ item.description }}

                          <AnswerTooltip
                            v-if="notEqualsProfile('student')"
                            :answer="
                              question.selectedChoiceDescription &&
                              question.selectedChoiceDescription.length
                                ? question.selectedChoiceDescription[iIndex]
                                : ''
                            "
                          />
                        </p>
                      </div>
                    </div>
                  </template>

                  <template v-if="question.type === 'true_or_false'">
                    <div
                      v-for="(item, iIndex) in question.items"
                      :key="item.id"
                    >
                      <p v-html="item.description"></p>
                      <radio
                        :items="item.options"
                        horizontal
                        disabled
                        :value="
                          question.userAnswers &&
                          question.userAnswers.length &&
                          question.userAnswers[iIndex]
                            ? question.userAnswers[iIndex].choice
                            : null
                        "
                        class="mb-5"
                      ></radio>
                    </div>
                  </template>
                  <template v-if="question.type === 'fill_gap'">
                    <div
                      v-for="(item, iIndex) in question.items"
                      :key="item.id"
                    >
                      <fill-blank-field
                        :placeholder="$t('global:form.answer')"
                        disabled
                        :text="question.items[iIndex].description"
                        :rightItems="question.rightItems ? question.rightItems[iIndex] : []"
                        :rightItemsText="question.rightText ? question.rightText[iIndex] : []"
                        :value="
                          question.answer && question.answer.length ? question.answer[iIndex] : []
                        "
                      />
                    </div>
                  </template>
                </div>

                <template v-if="!question.manualCorrection && !question.annulled">
                  <QuestionFeedback
                    v-if="
                      question.answers &&
                      question.answers &&
                      [
                        'multiple_choices_multi_answers',
                        'multiple_choices',
                        'true_or_false',
                        'association',
                        'fill_gap',
                      ].includes(question.type)
                    "
                    :question="question"
                    :student-examination="studentExamination"
                  />
                </template>

                <template v-if="canShowFeedback(question)">
                  <QuestionFeedback
                    v-if="
                      question.answers &&
                      question.answers.result &&
                      question.feedbackVisible === true
                    "
                    :question="question"
                  >
                    <div class="evaluation-question-feedback-option">
                      <span
                        v-if="!$media.mobile"
                        class="evaluation-question-feedback-points text-color"
                      >
                        {{ getQuestionFeedbackPoints(question) }}
                      </span>

                      <Dropdown
                        v-if="notEqualsProfile('student')"
                        icon="dots-vertical"
                        icon-size="medium"
                        right
                      >
                        <DropdownLink
                          :text="$t('global:edit')"
                          @click="editCorrection(question)"
                        />

                        <DropdownLink
                          :text="$t('global:remove')"
                          @click="removeCorrection(question, index)"
                        />
                      </Dropdown>
                    </div>

                    <span
                      v-if="$media.mobile"
                      class="evaluation-question-feedback-points text-color"
                    >
                      {{ getQuestionFeedbackPoints(question) }}
                    </span>

                    <div
                      v-if="getQuestionFeedbackUserBlockCondition(question)"
                      class="evaluation-question-feedback-user"
                      :class="{ 'feedback-user-mobile': $media.mobile }"
                    >
                      <div class="evaluation-question-feedback-user-image-wrapper">
                        <img
                          v-if="getQuestionFeedbackOwnerImage(question)"
                          :src="getQuestionFeedbackOwnerImage(question)"
                          :alt="getQuestionFeedbackOwnerName(question)"
                          class="evaluation-question-feedback-user-image"
                        />

                        <Icon
                          v-else
                          class="evaluation-question-feedback-user-icon"
                          name="account_circle"
                        />
                      </div>

                      <span class="evaluation-question-feedback-user-date">
                        {{ getQuestionFeedbackOwnerAuditDate(question) }}
                      </span>

                      <span class="evaluation-question-feedback-user-name">
                        {{ getQuestionFeedbackOwnerName(question) }}
                      </span>
                    </div>

                    <p
                      v-if="!!question.comment && question.comment !== 'null'"
                      v-html="question.comment"
                    ></p>

                    <FilesGrid
                      v-if="
                        question.type === 'send_file' &&
                        question.answers &&
                        $filterFilesByType(question.answers, 'correction').length
                      "
                      :files="$filterFilesByType(question.answers, 'correction')"
                    />
                  </QuestionFeedback>
                </template>

                <template v-if="canGradeQuestion(question) && !preProjectHistory">
                  <form
                    @submit.prevent="gradeAnswer(question, index)"
                    novalidate
                    class="evaluation-question-form"
                  >
                    <div
                      class="evaluation-question-correction"
                      :style="$media.mobile ? 'display: inline-grid;' : 'display: inline-flex;'"
                    >
                      <div class="form-group grade-type">
                        <SelectField
                          v-model="question.choice"
                          class="select-choice"
                          :label="$t('global:form.correction')"
                          :allowClear="false"
                          :items="radioOptions"
                          :validation="
                            $v.studentExamination.examination.questions.$each[index].choice
                          "
                          :disabled="isAnnulled(question)"
                          @input="() => initQuestionCorrection(question)"
                        />

                        <input-field
                          class="partial-grade"
                          type="number"
                          v-model="question.grade"
                          :value="question.grade"
                          :validation="
                            $v.studentExamination.examination.questions.$each[index].grade
                          "
                          :label="
                            $t(
                              'classroom.assessments.evaluation:enrollment.modal.datatable.header.3'
                            )
                          "
                          :min="0.01"
                          :max="Number(question.points)"
                          :step="0.1"
                          :disabled="isAnnulled(question)"
                          v-if="['partial', 'neutral'].includes(question.choice)"
                          @input="() => initQuestionCorrection(question)"
                        >
                        </input-field>
                      </div>
                    </div>
                    <div class="evaluation-question-comment">
                      <comment-form
                        v-model="question.comment"
                        :validation="
                          $v.studentExamination.examination.questions.$each[index].comment
                        "
                        :label="$t('classroom.assessments.evaluation:question.comment.label')"
                        :counter="2000"
                        :disabled="isAnnulled(question)"
                        @input="() => initQuestionCorrection(question)"
                      >
                        <FilesForm
                          v-if="question.type === 'send_file'"
                          :value="question"
                          :validation="$v.studentExamination.examination.questions.$each[index]"
                          :disabled="!canWrite('classroom:examination') || isAnnulled(question)"
                          allowFileLabel="solutions.create.classes:modal.question.send_file.correction"
                        />
                      </comment-form>
                    </div>
                    <div class="evaluation-edit-feedback">
                      <action
                        :disabled="isAnnulled(question)"
                        type="button"
                        secondary
                        submit
                        :text="$t('classroom.assessments.evaluation:question.user.submit')"
                      >
                      </action>
                    </div>
                  </form>
                </template>

                <AnnulledFeedback v-if="isAnnulled(question)" />
              </div>
            </form>

            <EvaluationGeneralFeedback
              v-if="!viewMode"
              :examination-id="userMakeExaminationId"
              :feedback="generalFeedback"
              @reload-feedback="load"
            />
          </div>
          <router-view></router-view>
        </div>
      </template>

      <LateralExamination
        v-if="
          studentExamination.examination && studentExamination.examination.questions && !viewMode
        "
        :class="{ mt: fixLateralBlock && !$media.mobile }"
        :links="studentExamination.examination.questions"
        :checked-ids="answeredQuestionIds"
      />
    </div>

    <ModalConfirm
      :title="$t('classroom.evaluations:exit.confirm.modal.title')"
      :active="confirmWithoutSaveModal"
      :confirm-btn-text="$t('classroom.evaluations:exit.confirm.modal.confirm')"
      @close="confirmWithoutSaveModal = false"
      @confirm="navigate(confirmWithoutSaveModalTo, true)"
    >
      <p class="text-color">{{ $t('classroom.evaluations:exit.confirm.modal.description') }}</p>
    </ModalConfirm>

    <modal
      :active="modalWarningLostChanges"
      :cancel="false"
    >
      <div class="modal-confirm">
        <action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeModalWarningLostChanges()"
        ></action>
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{ $t('classroom.assessments.evaluation:modal.lost.title') }}
          </h3>
          <div class="modal-confirm-description">
            <p class="text-color">
              {{ $t('classroom.assessments.evaluation:modal.lost.description') }}
            </p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <action
            type="button"
            :text="$t('global:cancel')"
            flat
            @click="closeModalWarningLostChanges()"
          ></action>
          <action
            type="button"
            :text="$t('global:continue')"
            flat
            class="btn-cancel"
            @click="back()"
          ></action>
        </div>
      </div>
    </modal>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/assessments/styles.scss';
@import './EvaluationStudent.scss';
</style>
