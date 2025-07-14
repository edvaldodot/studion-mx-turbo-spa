<script>
import { mapState, mapActions } from 'vuex'
import { required, requiredIf, maxLength } from 'vuelidate/lib/validators'

import sumAllFileSizes from '@/support/customValidators/sumAllFileSizes'
import minValueIf from '@/support/customValidators/minValueIf'
import examinationSendFileMixin from '@/app/solutions/mixins/examinationSendFileMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import CommentForm from '@/components/general/CommentForm'
import ContentHeader from '@/components/general/ContentHeader'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FilesForm from '@/app/solutions/components/FilesForm'
import FilesGrid from '@/app/classroom/components/FilesGrid'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import ProgressList from '@/components/general/ProgressList'
import Radio from '@/components/general/Radio'
import Tabs from '@/components/general/Tabs'
import HeaderClassroom from '@/app/classroom/components/HeaderClassroom'

export default {
  name: 'EvaluationAll',
  components: {
    Action,
    ActionBar,
    CommentForm,
    ContentHeader,
    Dropdown,
    DropdownLink,
    FilesForm,
    FilesGrid,
    Icon,
    InputField,
    ProgressList,
    Radio,
    Tabs,
    HeaderClassroom
  },
  mixins: [examinationSendFileMixin],
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    sessionUuid () {
      return this.$route.params.session_uuid
    }
  },
  data () {
    return {
      questionCorrectionsHeight: null,
      currentMultipleChoices: null,
      formData: {
        answer: {
          id: null,
          result: null,
          grade: null,
          comment: null,
          allowFile: false,
          question_id: null,
          files: []
        }
      },
      tabLinks: [
        {
          text: 'classroom.assessments.tab.link.1',
          location: {
            name: 'classroom.assessments.evaluation'
          }
        }
      ],
      radioOptions: [
        {
          label: 'Incorreta',
          value: 'incorrect'
        },
        {
          label: 'Correta',
          value: 'correct'
        },
        {
          label: 'Parcialmente correta',
          value: 'partial'
        }
      ],
      questionSummary: {
        topic: {},
        questions: []
      },
      currentQuestion: null,
      currentIndex: 0,
      menuActive: false,
      questions: {
        actualPage: 1
      },
      isGrading: false,
      lastHistory: null
    }
  },
  validations () {
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
      formData: {
        answer: {
          result: {
            required
          },
          grade: {
            valueBiggerZero: minValueIf(0.01, function () {
              return this.formData.answer.result === 'partial'
            }),
            required: requiredIf(function () {
              return this.formData.answer.result === 'partial'
            })
          },
          comment: {
            maxLength: maxLength(2000)
          },
          files: {
            required: requiredIf(function (nestedModel) {
              return this.questions.data[0].question.type === 'send_file' && nestedModel.allowFile
            }),
            maxFilesLength: maxLength(DEFAULT_LIMIT_FILES_LENGTH),
            maxSizeAllowed: sumAllFileSizes(DEFAULT_SIZE_LIMIT_IN_BYTES)
          }
        }
      }
    }

    return validationObject
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptListClassroomQuestionSummary',
      'attemptListClassroomEvaluationByQuestion',
      'attemptGradeExaminationAnswerById',
      'attemptDeleteGradeExaminationAnswer',
      'attemptUploadExaminationFiles'
    ]),
    getHeightCorrection () {
      if (
        this.$refs.evaluationFeedbackObj !== undefined &&
        typeof (this.$refs.evaluationFeedbackObj) === 'object'
      ) {
        this.questionCorrectionsHeight = this.$refs.evaluationFeedbackObj[0].offsetHeight
      }
    },
    editCorrection () {
      this.isGrading = true
    },
    back () {
      this.$router.push({
        name: 'classroom.assessments.evaluation',
        params: {
          session_uuid: this.sessionUuid
        }
      })
    },
    goPrevSlide () {
      this.questions.actualPage -= (this.questions.previousPage == null ? 0 : 1)
      if (this.questions.previousPage != null) {
        this.loadQuestion()
      }
    },
    goPrevSlideTouch () {
      if (this.$media.mobile) {
        this.goPrevSlide()
      }
    },
    goNextSlide () {
      this.questions.actualPage += (this.questions.nextPage == null ? 0 : 1)
      if (this.questions.nextPage != null) {
        this.loadQuestion()
      }
    },
    goNextSlideTouch () {
      if (this.$media.mobile) {
        this.goNextSlide()
      }
    },
    checkPrevSlide () {
      return !(this.questions.previousPage > 0)
    },
    checkNextSlide () {
      return !(this.questions.nextPage > 0)
    },
    openQuestionSummaryMenu () {
      this.menuActive = true
    },
    closeQuestionSummaryMenu () {
      this.menuActive = false
    },
    previewQuestion (questionId) {
      this.currentIndex -= 1
      this.openQuestion(questionId, this.currentIndex)
    },
    nextQuestion (questionId) {
      this.currentIndex += 1
      this.openQuestion(questionId, this.currentIndex)
    },
    openQuestion (questionId, questionIndex) {
      this.currentQuestion = questionId
      this.currentIndex = questionIndex
      this.loadQuestion(true)
    },
    loadQuestion (firstPending = false) {
      let questionReqObj = {
        questionId: this.currentQuestion,
        sessionUuid: this.sessionUuid,
        pageNumber: this.questions.actualPage,
        firstPending
      }

      this.menuActive = false
      this.setFetching(true)
      this.attemptListClassroomEvaluationByQuestion(questionReqObj)
        .then(({ data }) => {
          this.questions = data
          if (this.questions.data.length > 0) {
            this.reloadData()
            if (this.questions.data[0].question.type === 'multiple_choices') {
              this.currentMultipleChoices = this.questions.data[0].question.choices.map((question) => {
                return {
                  label: question.description,
                  value: question.choice_id,
                  correct: question.right,
                  disabled: question.disabled
                }
              })
            }
          }
        })
        .catch(() => {
          this.setFetching(false)
        }).finally(() => {
          this.setFetching(false)
        })
    },
    reloadData (isAdding) {
      let answer = this.questions.data[0]
      this.isGrading = answer.result === null
      this.formData.answer.id = answer.id
      this.formData.answer.result = answer.result
      this.formData.answer.grade = answer.grade
      this.formData.answer.comment = answer.comment
      this.formData.answer.questionId = answer.question.question_id

      this.setupFormDataSendFile(answer)

      if (isAdding && (this.lastHistory === null || this.lastHistory.afterRevision.grade === null)) {
        this.questionSummary.questions[this.currentIndex].corrected += 1
      } else if (isAdding === false) {
        this.questionSummary.questions[this.currentIndex].corrected -= 1
      }
      if (answer.history.length > 0) {
        this.lastHistory = answer.history.slice(-1).pop()
      } else {
        this.lastHistory = null
      }
    },

    /**
     * Manipulate fields to send on examination correction request
     * @param {Object} question
     * @returns {Object[]}
     */
    async manipulateQuestionData (answer) {
      if (this.questions.data[0].question.type !== 'send_file' || !answer.allowFile) return answer

      const { fileWithId, filesToUpload } = this.$splitFilesArray(answer.files)
      if (!filesToUpload.length) return answer

      const { data } = await this.attemptUploadExaminationFiles({
        files: filesToUpload,
        type: 'correction'
      })

      answer.files = [fileWithId, data].flat()
      return answer
    },

    /**
     * If send file type set allowFile flag and files
     * @param {Object} answer
     */
    setupFormDataSendFile (answer) {
      if (answer.question.type === 'send_file') {
        const correctionFiles = this.$filterFilesByType(answer, 'correction')
        const hasFiles = Boolean(correctionFiles && correctionFiles.length)

        this.formData.answer.files = correctionFiles
        this.formData.answer.allowFile = hasFiles
      }
    },

    async gradeAnswer () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        const payload = await this.manipulateQuestionData(this.formData.answer)
        this.attemptGradeExaminationAnswerById({
          sessionUuid: this.sessionUuid,
          data: payload
        })
          .then(({ data }) => {
            this.questions.data[0].result = data.result
            this.questions.data[0].grade = data.grade
            this.questions.data[0].comment = data.comment
            this.questions.data[0].history = data.history
            this.reloadData(true)
            this.setFetching(false)
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    removeCorrection () {
      this.setFetching(true)
      this.attemptDeleteGradeExaminationAnswer({
        sessionUuid: this.sessionUuid,
        id: this.formData.answer.id
      })
        .then(({ data }) => {
          this.questions.data[0].result = data.result
          this.questions.data[0].grade = data.grade
          this.questions.data[0].comment = data.comment
          this.questions.data[0].history = data.history
          this.reloadData(false)
          this.setFetching(false)
        })
        .catch(() => {
          this.setFetching(false)
        }).finally(() => {
          this.setFetching(false)
        })
    }
  },
  mounted () {
    this.$emit('change-theme-footer', {
      dark: true,
      isEvaluationQuestionFeedbackMobile: true
    })
  },
  created () {
    this.$emit('change-header', {
      customClasses: {
        'evaluation-all': true,
        'evaluation': true
      },
      tabLinks: this.tabLinks
    })

    const assessmentParams = {
      sessionUuid: this.sessionUuid,
      topicId: this.$route.params.id
    }

    this.setFetching(true)
    this.attemptListClassroomQuestionSummary(assessmentParams)
      .then(({ data }) => {
        if (data) {
          this.questionSummary.topic = data.topic
          this.questionSummary.questions = data.questions.map((question, index) => {
            return {
              questionId: question.question_id,
              label: this.$tc(
                'classroom.assessments.evaluation:question.number',
                null,
                { num: index + 1 }
              ),
              corrected: question.grade,
              total: question.total
            }
          })
          this.setFetching(false)
          if (this.questionSummary.questions.length) {
            this.currentQuestion = this.questionSummary.questions[0].questionId
            this.loadQuestion(true)
          }
        }
      }).finally(() => {
        this.setFetching(false)
      })
  },
  updated () {
    this.getHeightCorrection()
  },
  beforeRouteLeave (to, from, next) {
    this.$emit('change-header', {})
    next()
  }
}
</script>

<template>
  <div class="inner-content">
    <template>
      <div class="classes-wrapper">
        <div class="assessments-bar">
          <Action
            type="button"
            icon="keyboard_backspace"
            class="btn-prev"
            flat
            :dark="accessibility"
            @click="back"
          />
          <Action
            type="button"
            icon="menu"
            class="assessments-bar-menu-btn"
            @click.stop="openQuestionSummaryMenu"
          />
          <h2 class="assessments-bar-title">{{ questionSummary.topic.name }}</h2>
          <div class="assessments-bar-controls" v-if="questionSummary.questions.length && !$media.mobile">
            <Action
              type="button"
              icon="keyboard_backspace"
              class="btn-prev"
              :text="$t('global:prev')"
              :dark="accessibility"
              :disabled="currentIndex === 0"
              flat
              @click="previewQuestion(questionSummary.questions[currentIndex - 1].questionId)"
            />
            <div class="controls-counter">
              <span class="controls-counter-info">{{$t(`classroom.assessments.evaluation:question.control.info`)}}</span>
              <span class="controls-counter-current">{{ currentIndex + 1 }}</span>
              <span class="controls-counter-separator">{{$t('global:of')}}</span>
              <span class="controls-counter-total">{{ questionSummary.questions.length }}</span>
            </div>
            <Action
              type="button"
              icon="keyboard_backspace"
              icon-right
              :text="$t('global:next')"
              class="btn-next"
              flat
              @click="nextQuestion(questionSummary.questions[currentIndex + 1].questionId)"
              :disabled="currentIndex + 1 === questionSummary.questions.length"
              :dark="accessibility"
            />
          </div>
        </div>
        <div class="questions-menu" v-click-outside="closeQuestionSummaryMenu" :class="{ 'is-open': menuActive }">
          <Action
            type="button"
            icon="close"
            class="btn-close"
            @click.stop="closeQuestionSummaryMenu()"
          />
          <Action
            flat
            type="button"
            icon="keyboard_backspace"
            class="btn-back text-color"
            :text="$t('classroom.assessments.evaluation:menu.btn.corrections')"
            :dark="accessibility"
            @click="back"
          />
          <h3 class="questions-menu-title">{{ $t('classroom.assessments.evaluation:menu.title') }}</h3>
          <div class="questions-menu-list">
            <div class="questions-menu-item"
              v-for="(question, questionIndex) in this.questionSummary.questions"
              :key="questionIndex"
            >
              <a href="#" class="questions-menu-link bolder" @click.prevent="openQuestion(question.questionId, questionIndex)">
                <span
                  class="text"
                  :style="questionIndex === currentIndex ? 'font-weight: bold; color: #000' : ''"
                >
                  {{ question.label }}
                </span>
                <div class="totals-wrapper">
                  <span class="text">{{ question.corrected }}</span>
                  <span class="text">/{{ question.total }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div>
          <div class="evaluation-question-section-list" :class="{'is-mobile-margin': $media.mobile}">
            <template v-for="(userAnswer, index) in questions.data">
              <template>
                <div class="evaluation-question-section" :key="index">
                  <div class="center-small">
                    <div class="evaluation-question">
                      <div class="evaluation-question-header">
                        <h4 class="evaluation-question-number">
                          {{ $tc('classroom.assessments.evaluation:question.number', userAnswer.question.points, {'num': currentIndex + 1}) }}
                        </h4>
                        <span class="evaluation-question-points">
                          {{ $t(`classroom.assessments.evaluation:question.point${userAnswer.question.points.toFixed(2) >= 2 ? 's' : ''}`, {'num': userAnswer.question.points.toFixed(2).replace('.', ',')}) }}
                        </span>
                      </div>
                      <div class="evaluation-question-description">
                        <p v-html="userAnswer.question.statement"></p>
                        <FilesGrid
                          v-if="userAnswer.question.type === 'send_file'"
                          :files="userAnswer.question.files"
                        />
                      </div>
                      <div class="evaluation-question-user-list-wrapper">
                        <Action
                          type="button"
                          icon="keyboard_arrow_left"
                          class="btn-prev"
                          @click="goPrevSlide()"
                          v-if="!checkPrevSlide()"
                        />
                        <Action
                          type="button"
                          icon="keyboard_arrow_right"
                          class="btn-next"
                          @click="goNextSlide()"
                          v-if="!checkNextSlide()"
                        />
                        <v-touch @swipeleft="goNextSlideTouch()" @swiperight="goPrevSlideTouch()">
                          <div class="evaluation-question-user-list" ref="listUser">
                              <div class="evaluation-question-user-wrapper" :style="`height: calc(70vh + ${questionCorrectionsHeight}px)`" :key="index">
                                <div class="evaluation-question-user" ref="evaluationFeedbackObj">
                                  <div class="evaluation-question-user-profile">
                                    <div class="evaluation-question-user-profile-avatar">
                                      <img
                                        :src="userAnswer.applicationUser.userData.image"
                                        :alt="userAnswer.applicationUser.userData.name"
                                        class="evaluation-question-user-profile-image"
                                        v-if="userAnswer.applicationUser.userData.image"
                                      >
                                      <Icon
                                        name="account_circle"
                                        class="evaluation-question-user-profile-icon"
                                        v-else
                                      />
                                    </div>
                                    <span class="evaluation-question-user-profile-label">{{ $t('classroom.assessments.evaluation:answer.by') }}</span>
                                    <span class="evaluation-question-user-profile-name">{{ userAnswer.applicationUser.userData.name }}</span>
                                  </div>
                                  <div class="evaluation-question-user-count">
                                    <span>{{ questions.actualPage }}</span>
                                    <span> de </span>
                                    <span>{{ questions.total }}</span>
                                  </div>
                                  <div class="evaluation-question-answer">
                                    <p class="text-color">{{ userAnswer.answer }}</p>
                                    <FilesGrid
                                      v-if="userAnswer.question.type === 'send_file' && userAnswer && $filterFilesByType(userAnswer, 'answer').length"
                                      :files="$filterFilesByType(userAnswer, 'answer')"
                                      :label="$t('global:file')"
                                    />
                                  </div>
                                  <template v-if="userAnswer.question.type === 'multiple_choices'">
                                    <div class="evaluation-question">
                                      <div class="evaluation-question-answer">
                                        <Radio
                                          :items="currentMultipleChoices"
                                          v-model="userAnswer.choice.choice_id"
                                          disabled
                                        />
                                      </div>
                                      <div class="evaluation-question-feedback"
                                        :class="{
                                          'is-correct': userAnswer.result === 'correct' || userAnswer.result === 'partial',
                                          'is-wrong': userAnswer.result === 'incorrect',
                                          'question-feedback-mobile': $media.mobile
                                        }"
                                      >
                                        <Icon
                                          :name="userAnswer.choice === 'correct' || userAnswer.choice === 'partial' ? 'check-circle' : 'close-circle'"
                                          wrapper
                                          class="evaluation-question-feedback-icon"
                                        />
                                        <h5 class="evaluation-question-feedback-title text-color">{{ $t(`classroom.assessments.evaluation:alternative.${userAnswer.result === 'correct' ? 'correct' : 'wrong'}`) }}</h5>
                                        <template v-if="userAnswer.feedback">
                                          <p class="text-color" v-html="userAnswer.feedback"></p>
                                        </template>
                                      </div>
                                    </div>
                                  </template>
                                  <template v-if="['send_file', 'discursive'].includes(userAnswer.question.type) && isGrading">
                                    <form @submit.prevent="gradeAnswer()" novalidate>
                                      <div class="evaluation-question-correction-complete">
                                        <div class="evaluation-question-correction" :style="$media.mobile ? 'display: inline-grid;' : 'display: inline-flex;'">
                                          <div class="form-group is-flexible clearfix">
                                            <Radio
                                              :items="radioOptions"
                                              :class="{'radio-mobile': $media.mobile === true}"
                                              v-model="formData.answer.result"
                                              horizontal
                                              :validation="$v.formData.answer.result"
                                            />
                                            <InputField
                                              type="number"
                                              :value="formData.answer.grade"
                                              v-model="formData.answer.grade"
                                              class="partial-grade"
                                              :label="$t('classroom.assessments.evaluation:grade')"
                                              :validation="$v.formData.answer.grade"
                                              :min="0.01"
                                              :max="userAnswer.question.points"
                                              :step="0.1"
                                              v-if="formData.answer.result === 'partial'"
                                            />
                                          </div>
                                        </div>
                                        <div class="evaluation-question-comment">
                                          <CommentForm
                                            v-model="formData.answer.comment"
                                            :validation="$v.formData.answer.comment"
                                            :label="$t('classroom.assessments.evaluation:question.comment.label')"
                                            :counter="2000"
                                          >
                                            <FilesForm
                                              v-if="userAnswer.question.type === 'send_file'"
                                              :value="formData.answer"
                                              :validation="$v.formData.answer"
                                              :disabled="!canWrite('classroom:examination')"
                                              allowFileLabel="solutions.create.classes:modal.question.send_file.correction"
                                            />
                                          </CommentForm>
                                        </div>
                                        <div class="text-center form-submit">
                                          <Action
                                            type="button"
                                            :text="$t('classroom.assessments.evaluation:question.user.submit')"
                                            submit
                                            primary
                                            large
                                            fixed-width
                                          />
                                        </div>
                                      </div>
                                    </form>
                                  </template>
                                  <template v-if="['send_file', 'discursive'].includes(userAnswer.question.type) && !isGrading">
                                    <div
                                      class="evaluation-question-feedback"
                                      :class="{
                                        'is-correct': userAnswer.result === 'correct' || userAnswer.result === 'partial',
                                        'is-wrong': userAnswer.result === 'incorrect',
                                        'question-feedback-mobile': $media.mobile
                                      }"
                                    >
                                      <Icon
                                        :name="userAnswer.result === 'correct' || userAnswer.result === 'partial' ? 'check-circle' : 'close-circle'"
                                        wrapper
                                        class="evaluation-question-feedback-icon"
                                      />
                                      <h5 class="evaluation-question-feedback-title text-color">{{ userAnswer.result === 'correct' ? $t('classroom.assessments.evaluation:answer.correct') : userAnswer.result === 'partial' ? $t('classroom.assessments.evaluation:answer.correct.partial') : $t('classroom.assessments.evaluation:answer.wrong') }}</h5>
                                      <div class="evaluation-question-feedback-option">
                                        <span class="evaluation-question-feedback-points text-color" v-if="!$media.mobile">
                                          {{ $t(`classroom.assessments.evaluation:question.point${userAnswer.grade.toFixed(2) >= 2 ? 's' : ''}`, {'num': userAnswer.grade.toFixed(2).replace('.', ',')}) }}
                                        </span>
                                        <Dropdown icon="dots-vertical" right icon-size="medium" class="">
                                          <DropdownLink
                                            :text="$t('global:edit')"
                                            @click="editCorrection()"
                                          />
                                          <DropdownLink
                                            :text="$t('global:remove')"
                                            @click="removeCorrection()"
                                          />
                                        </Dropdown>
                                      </div>
                                      <span class="evaluation-question-feedback-points text-color" v-if="$media.mobile">
                                        {{ $t(`classroom.assessments.evaluation:question.point${userAnswer.grade.toFixed(2) >= 2 ? 's' : ''}`, {'num': userAnswer.grade.toFixed(1).replace('.', ',')}) }}
                                      </span>
                                      <div class="evaluation-question-feedback-user" v-if="lastHistory && userAnswer.comment !== ''" :class="{'feedback-user-mobile': $media.mobile}">
                                        <div class="evaluation-question-feedback-user-image-wrapper">
                                          <img
                                            :src="lastHistory.auditInsert.user.image"
                                            class="evaluation-question-feedback-user-image"
                                            v-if="lastHistory.auditInsert.user.image"
                                          >
                                          <Icon
                                            name="account_circle"
                                            class="evaluation-question-feedback-user-icon"
                                            v-else
                                          />
                                        </div>
                                        <span class="evaluation-question-feedback-user-date" v-if="lastHistory.auditInsert.dh">
                                          {{ $t('global:date.hours', {'date': formatDate(lastHistory.auditInsert.dh), 'hour': formatDate(lastHistory.auditInsert.dh, 'shortTime')}) }}
                                        </span>
                                        <span class="evaluation-question-feedback-user-name">{{lastHistory.auditInsert.user.name}}</span>
                                      </div>
                                      <p v-if="userAnswer.comment && !['', 'null', 'undefined'].includes(userAnswer.comment)" v-html="userAnswer.comment"></p>
                                      <FilesGrid
                                        v-if="userAnswer.question.type === 'send_file' && userAnswer && $filterFilesByType(userAnswer, 'correction').length"
                                        :files="$filterFilesByType(userAnswer, 'correction')"
                                      />
                                    </div>
                                  </template>
                                </div>
                              </div>
                          </div>
                        </v-touch>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>
      <div class="assessments-bar-bottom" v-if="$media.mobile">
        <Action
          type="button"
          v-if="currentIndex !== 0"
          icon="keyboard_backspace"
          class="btn-prev"
          flat
          @click="previewQuestion(questionSummary.questions[currentIndex - 1].questionId)"
          :dark="accessibility"
        />
        <div class="assessments-bar-controls" v-if="questionSummary.questions.length">
          <div class="controls-counter controls-counter-center">
            <span class="controls-counter-info">{{$t(`classroom.assessments.evaluation:question.control.info`)}}</span>
            <span class="controls-counter-current">{{ currentIndex + 1 }}</span>
            <span class="controls-counter-separator">{{$t('global:of')}}</span>
            <span class="controls-counter-total">{{ questionSummary.questions.length }}</span>
          </div>
          <Action
            type="button"
            icon="keyboard_backspace"
            icon-right
            class="btn-next"
            flat
            @click="nextQuestion(questionSummary.questions[currentIndex + 1].questionId)"
            :dark="accessibility"
            v-if="currentIndex + 1 !== questionSummary.questions.length"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
  @import "~@/app/classroom/modules/assessments/styles.scss";
</style>
