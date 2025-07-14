<script>
import config from '@/config'
import { mapState, mapActions, mapGetters } from 'vuex'
import Player from '@vimeo/player'
import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'

import Action from '@/components/general/Action'
import AudioPlayer from '@/components/general/AudioPlayer'
import Button from '@/components/general/Button'
import EmptyMessage from '@/components/general/EmptyMessage'
import EvaluationForm from '@/app/classroom/modules/assessments/pages/EvaluationForm'
import Icon from '@/components/general/Icon'
import ResearchForm from '@/app/classroom/modules/assessments/pages/ResearchForm'
import CompetencyForm from '@/app/classroom/modules/assessments/pages/CompetencyForm'
import TooltipSlot from '@/components/general/TooltipSlot'
import FabButton from '@/components/general/FabButton'
import FabMenu from '@/components/general/FabMenu'
import EvaluationGeneralFeedback from '@/app/classroom/components/EvaluationGeneralFeedback'
import ProgressLine from '@/components/general/ProgressLine'
import WorkloadLimitTimer from '@/components/shared/WorkloadLimitTimer'
import WebViewerPdf from '@/components/general/WebViewerPDF'

import ChatbotAdapter from '@/support/adapters/ChatbotAdapter'

import { fabButtonsList, fabMenuList } from '../../util/data'
import { $util_addPreventEventList, $util_removePreventEventList } from '@/support/utils/prevent'

const Modal = () => import('@/components/general/Modal')
const PdfViewer = () => import('@/components/general/PdfViewer')

const LTIView = () => import('./modules/class/components/LTIView.vue')

const ModalResearchWarning = () => import('./components/ModalResearchWarning')
const ModalNextSolution = () => import('./components/ModalNextSolution')
const ModalEndTrail = () => import('./components/ModalEndTrail')
const ModalInformation = () => import('@/components/general/ModalInformation')
const ModalWorkloadLimit = () => import('./components/ModalWorkloadLimit')

import gptButtonMixin from '@/components/shared/FloatGptButton/gptButtonMixin'

const {
  OPEN_CLASSROOM_LESSONS_ON_FULLSCREEN,
  ENABLE_RESEARCH_WARNING,
  SHOW_THUMB_ON_LAST_TOPIC_WHEN_END_VIDEO,
  USER_WAY_KEY_SCORM,
  PDF_AWAIT_USER_CONFIRM,
  PORTAL_CONFIGS,
} = config

export default {
  name: 'Lessons',

  components: {
    Action,
    AudioPlayer,
    Button,
    EmptyMessage,
    EvaluationForm,
    EvaluationGeneralFeedback,
    Icon,
    ResearchForm,
    Modal,
    ModalResearchWarning,
    PdfViewer,
    TooltipSlot,
    FabButton,
    FabMenu,
    ProgressLine,
    LTIView,
    CompetencyForm,
    ModalNextSolution,
    ModalEndTrail,
    ModalInformation,
    ModalWorkloadLimit,
    WorkloadLimitTimer,
    WebViewerPdf,
  },

  mixins: [gptButtonMixin],

  beforeRouteLeave(to, _, next) {
    let isStudent = this.equalsProfile('student')
    let iframeScorm = document.getElementsByClassName('iframe-scorm')

    if (
      ['classroom.lessons.course', 'classroom.lessons.course.type'].includes(to.name) &&
      !to.params.redirected
    ) {
      this.initialSetup()
    }

    if (isStudent && this.Classroom.onTutorial) {
      next()
    }

    if (isStudent && this.isScorm && iframeScorm.length > 0) {
      this.$watch(
        () => this.scormClosed,
        (newVal) => {
          if (newVal) {
            this.$emit('change-header', {})
            next()
          }
        }
      )

      this.exitScorm()
      this.setFetching(false)
      next()
    } else {
      this.$emit('change-header', {})
      next()
    }
  },

  props: {
    isCorrection: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isCheckingTopicConsume: false,
      isNavBarFixed: false,
      evaluationBlockMessage: false,
      modalAdvanceProgressBlock: false,
      modalFailedProgressBlock: false,
      modalProgressBlock: false,
      showNextSolutionModal: false,
      showEndTrailModal: false,
      nextSolution: null,
      resolveGetMenuPromise: null,
      menuActive: false,
      currentIndex: 0,
      screenWidth: 0,
      screenHeight: 0,
      menuWidth: 0,
      headerHeight: 0,
      classesBarHeight: 0,
      videoHeight: 0,
      podcastStartTime: 0,
      isPodcastPlaying: false,
      isOnboarding: false,
      topics: [],
      objHeaderIsRetractedUsed: false,
      completeTopicInterval: null,
      nextPageInterval: null,
      consumeTopicTimeout: null,
      evaluations: {
        examination_id: 0,
        loading: true,
        questions: [],
        feedback: false,
        maxAttempt: 1,
        initialTime: null,
        try: null,
        submitted: false,
        grade: 0,
        maxGrade: 0,
        attempt: 1,
        feedbackInclude: false,
        examination: {},
        answers: {},
        key: 0,
      },
      research: {
        research_id: 0,
        title: null,
        showSaveButton: true,
        loading: false,
        isAnswered: false,
        questions: [],
        key: 0,
      },
      competency: {
        competency_id: 0,
        title: null,
        description: null,
        showSaveButton: true,
        loading: true,
        isAnswered: false,
        questions: [],
        key: 0,
      },
      iframeURL: null,
      iframeHeight: 0,
      isIframeReady: false,
      isAlternativeReader: false,
      videoPlayer: null,
      flowMenu: {
        total: null,
        current: null,
        prev: null,
        next: null,
      },
      scormClosed: false,
      modalConfirmExitPPTX: null,
      nextTopicAfterPPTX: null,
      prerequisiteData: null,
      prerequisiteError: false,
      currentPdfPage: 1,
      videoLastPositionConsumed: 0,
      videoTimeWatched: 0,
      videoIsSeekable: true,
      isFrameDataDownloadable: false,
      activityInterval: null,
      activityToken: null,
      resource: null,
      completedTopicList: [],
      researchWarningTopic: null,
      topicResource: null,
      modalWorkloadLimit: false,
      blockWorkload: false,
      setupRunning: false,
      defaultDisableActionsList: ['copy', 'paste', 'cut', 'contextmenu'],
      advanceProgressBlock: false,
      scormCompleted: false,
      isFromActivity: false,
      isFromProject: false,
      schedulePeriod: null,
      hasPrerequisite: null,
      nextTopicTimeLine: null,
      pdfConsume: [],
      pdfCountPages: null,
    }
  },

  computed: {
    ...mapState([
      'Classroom',
      'Account',
      'accessibility',
      'fetching',
      'menuOpen',
      'zendeskChatbot',
    ]),
    ...mapGetters([
      'isIntegrationAppMode',
      'hideFabMenu',
      'isFullscreen',
      'isFetching',
      'getChatbotWindow',
    ]),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
    contentType() {
      return this.$route.params.type
    },
    contentTypeID() {
      return this.$route.params.type_id
    },
    contentTitle() {
      return this.itemActive ? this.itemActive.name : ''
    },
    changeTopic() {
      // eslint-disable-next-line
      this.$route.params.type
      // eslint-disable-next-line
      this.$route.params.type_id
      return Date.now()
    },
    itemActive() {
      return this.topics.find((item) => item.id === parseInt(this.contentTypeID))
    },
    incompleteTopicsIDs() {
      return this.topics.reduce((incompleteTopics, item) => {
        if (item.completed === false) incompleteTopics.push(item.id)
        return incompleteTopics
      }, [])
    },
    canCheckTopicsAreComplete() {
      if (this.$isEnabledFeature('impersonate_read_only') && this.$isUserImpersonated()) {
        return false
      }

      return (
        this.equalsProfile('student') &&
        this.itemActive &&
        !this.itemActive.completed &&
        (this.isScorm || this.isVideo)
      )
    },
    hasTopics() {
      return this.topics.length
    },
    currentTopicAssetType() {
      const [currentAsset] = this.topics[this.currentIndex].assets
      return currentAsset && currentAsset.type
    },
    isScorm() {
      return this.hasTopics && this.currentTopicAssetType.type === 'scorm'
    },
    isLTI() {
      return this.hasTopics && this.currentTopicAssetType.type === 'lti'
    },
    isPPTX() {
      return this.hasTopics && this.currentTopicAssetType.type === 'pptx'
    },
    isVideo() {
      return (
        this.hasTopics && ['video', 'vimeo_external_link'].includes(this.currentTopicAssetType.type)
      )
    },
    isPDF() {
      return (
        this.hasTopics &&
        this.currentTopicAssetType.type === 'upload' &&
        this.currentTopicAssetType.name === 'PDF'
      )
    },
    isExternalLink() {
      return this.hasTopics && this.currentTopicAssetType.type === 'external_link'
    },
    isPodcast() {
      return (
        this.hasTopics &&
        this.currentTopicAssetType.type === 'audio' &&
        this.currentTopicAssetType.name === 'Audio'
      )
    },
    isExamination() {
      return this.contentType === 'examination'
    },
    showVideo() {
      return this.isVideo && !isEmpty(this.iframeURL) && !isNil(this.iframeURL)
    },
    isLastTopic() {
      return this.currentIndex + 1 === this.topics.length
    },
    hasNextTopic() {
      return !this.isLastTopic || this.canGoNextScormModule
    },
    canGoNextScormModule() {
      return (
        this.isScorm &&
        this.flowMenu.current !== null &&
        this.flowMenu.current < this.flowMenu.total
      )
    },
    currentModuleCompleted() {
      if (!this.isScorm || !this.flowMenu.current || !this.itemActive || !this.itemActive.submenu)
        return true
      const currentModule = this.itemActive.submenu.find(
        (mod) => mod.index === this.flowMenu.current
      )
      return currentModule.completed
    },
    canGoPrevScormModule() {
      return this.isScorm && this.flowMenu.current !== null && this.flowMenu.current > 1
    },
    isPreviousDisabled() {
      if (this.canGoPrevScormModule || this.blockWorkload) return false

      return this.isScorm && !this.isIframeReady && !this.prerequisiteError
    },
    isLastPDFPage() {
      return this.itemActive.assets[0].meta.pages === this.currentPdfPage
    },
    isNextDisabled() {
      if (!this.equalsProfile('student')) return false

      if (!this.isLastTopic && this.blockWorkload) return false

      if (!this.itemActive) return true

      if (this.isPDF && this.isLastPDFPage) return false

      if (this.isScorm && !this.isIframeReady && !this.prerequisiteError) return true

      if (this.canGoNextScormModule || this.blockWorkload) return false

      if (
        this.isLastTopic &&
        ((!this.isPPTX && !this.itemActive.completed) || this.prerequisiteError)
      ) {
        return true
      }

      if (
        this.advanceProgressBlock &&
        !this.scormCompleted &&
        this.$isEnabledFeature('block_advancement_button')
      )
        return true

      return false
    },
    nextTopicActionProps() {
      if (!this.isLastTopic || this.canGoNextScormModule) {
        return {
          text: this.$t('global:next'),
          icon: 'keyboard_backspace',
          hideLabel: this.$media.mobile,
        }
      }

      return {
        text: this.$t('global:conclude'),
        icon: null,
        hideLabel: false,
      }
    },
    scheduleData() {
      if (!this.itemActive) return null

      const topicPeriods = this.itemActive.topicPeriods

      if (!topicPeriods || !topicPeriods.schedulePeriod) return null

      return topicPeriods.schedulePeriod
    },
    generalFeedback() {
      if (!this.evaluations || !this.evaluations.examinationComment) return null
      return this.evaluations.examinationComment
    },
    getFirstTopicProgress() {
      const topic = this.completedTopicList.find((item) => item.id === this.itemActive.id)
      return topic && topic.scorm_progress ? topic.scorm_progress : null
    },

    pathUser() {
      if (!this.Classroom.data || !this.Classroom.data.pathApplicationUser) return null

      const {
        pathApplicationUser: { path = null, certificateHash = '', certificateIssuedAt = '' },
      } = this.Classroom.data

      return { ...path, certificateHash, certificateIssuedAt }
    },

    allManualModalsIsClosed() {
      return (
        !this.modalAdvanceProgressBlock &&
        !this.modalFailedProgressBlock &&
        !this.modalProgressBlock &&
        !this.modalConfirmExitPPTX
      )
    },

    currentReader() {
      return this.isAlternativeReader ? WebViewerPdf : PdfViewer
    },

    isZendeskEnabled() {
      return this.$isEnabledFeature('chatbot')
    },
  },

  watch: {
    'zendeskChatbot.isOpen': function (newValue) {
      if (newValue) {
        ChatbotAdapter.openChat()
      } else {
        ChatbotAdapter.closeChat()
      }
    },
    changeTopic() {
      this.currentPdfPage = 1
      this.podcastStartTime = 0
      this.isPodcastPlaying = false
      this.pdfConsume = []
      if (this.itemActive) {
        this.checkType()
      }
      this.closeMenuTopics()
    },
    prerequisiteError() {
      this.updateHeader()
    },
    isVideo() {
      this.updateHeader()
      this.stopIdleTimer(this.isVideo || this.isScorm)
    },

    'Classroom.facialRecognition.active': function (newValue) {
      if (!newValue) this.initialSetup()
    },

    isScorm() {
      this.stopIdleTimer(this.isVideo || this.isScorm)
    },

    '$media.mobile'() {
      this.closeFullscreen()
      this.resizeMenu(true)
    },

    'pdfConsume.length': {
      immediate: true,
      handler(val) {
        if (PDF_AWAIT_USER_CONFIRM || !Number.isInteger(this.pdfCountPages)) return
        if (val === this.pdfCountPages) this.consumePdf(true)
      },
    },
  },

  mounted() {
    this.hideFooter()
    this.initialSetup()
    window.addEventListener('scroll', this.handleScroll)
  },

  created() {
    this.updateHeader()

    this.$emit('update-header-bottom-visibility', true)
    this.$emit('update-header-thickness', false)

    if (OPEN_CLASSROOM_LESSONS_ON_FULLSCREEN && !this.$media.mobile) {
      this.setFullscreen()
      this.resizeMenu(false)
    }
  },

  updated() {
    this.isFromActivity = this.$route.meta.isFromActivity || false
    this.isFromProject = this.$route.meta.isFromProject || false

    if (
      !this.objHeaderIsRetractedUsed &&
      document.querySelector('.header-classroom') &&
      document.querySelector('.classes-bar')
    ) {
      this.updateVideoDimension()
    }

    if (this.isZendeskEnabled) {
      ChatbotAdapter.updateButtonDisplay(this.menuOpen)
      this.updateChatbotPosition(true)
      ChatbotAdapter.updateButtonPosition()
    }
  },

  destroyed() {
    this.$emit('update-header-bottom-visibility', false)
    this.$emit('update-header-thickness', true)

    this.showFooter()
    if (this.completeTopicInterval) {
      clearInterval(this.completeTopicInterval)
    }

    if (this.nextPageInterval) {
      clearInterval(this.nextPageInterval)
    }

    window.removeEventListener('scroll', this.handleScroll)
  },

  beforeDestroy() {
    clearInterval(this.activityInterval)
    if (OPEN_CLASSROOM_LESSONS_ON_FULLSCREEN && !this.$media.mobile) {
      this.closeFullscreen()
      this.resizeMenu(true)
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptOpenTopic',
      'attemptDownloadTopicAsset',
      'attemptCourseTopicsRetrieval',
      'attemptConsumeTopic',
      'attemptGetTopicPrerequisites',
      'attemptCheckTopicsCompleted',
      'attemptReadClassroomNotifications',
      'attemptReadCompetencyClassroomNotifications',
      'attemptCheckActivity',
      'fetchStudentProgress',
      'setFullscreen',
      'resizeMenu',
      'closeFullscreen',
      'fetchTrailSolutions',
      'toggleChatbotWindow',
      'stopIdleTimer',
      'toggleZendeskChatbotWindow',
      'hideFooter',
      'showFooter',
      'updateChatbotPosition',
    ]),

    initialSetup() {
      if (this.setupRunning) return
      this.setupRunning = true
      this.$emit('change-theme-footer', { dark: false })

      this.setFetching(true)

      this.attemptCourseTopicsRetrieval({
        sessionUuid: this.sessionUuid,
        enableExamination: this.$route.meta.isFromActivity,
      })
        .then(({ data }) => {
          this.topics = data
            .filter((item) => item.assets[0] && item.assets[0].active === true)
            .map((item, index) => {
              item.index = index
              item.currentActive = false
              item.completed = item.assets[0].completed
              item.submenu = null

              if (item.id === parseInt(this.contentTypeID)) {
                this.scormCompleted = item.completed
              }

              return item
            })

          this.setFetching(false)

          if (this.contentType) {
            this.checkType()
          } else {
            const topicsInPeriod = this.topics.filter(
              (item) =>
                !item.topicPeriods || (item.topicPeriods && item.topicPeriods.schedulePeriod.open)
            )
            const topic = topicsInPeriod.length ? topicsInPeriod[0] : this.topics[0]
            this.openTopic(topic)
          }
          this.checkPrerequisitesAreCompleted()
          this.startTopicsAreCompletePolling()
        })
        .catch(({ response }) => {
          if (response.data.message === 'session_did_not_start') {
            this.isOnboarding = true
          }
          this.setFetching(false)
        })
        .finally(() => {
          this.stopIdleTimer(this.isVideo || this.isScorm)
          this.setupRunning = false
        })

      window.removeEventListener('message', this.getMessageIframe, false)
      window.addEventListener('message', this.getMessageIframe, false)

      this.screenWidth = window.innerWidth
      this.screenHeight = window.innerHeight
      this.menuWidth = document.querySelector('.menu')
        ? document.querySelector('.menu').clientWidth
        : 0

      this.fabButtons = fabButtonsList()
      this.fabMenuButtons = fabMenuList()

      if (this.getChatbotEnv) {
        this.fabButtons.unshift({
          id: 'chatbot',
          icon: 'chatbot-white',
        })

        this.fabMenuButtons.unshift({
          id: 'chatbot',
          icon: 'chatbot-lamp',
        })
      }

      if (this.isZendeskEnabled) {
        this.fabButtons.unshift({
          id: 'zendesk',
          icon: 'chat-bubble',
        })

        this.fabMenuButtons.unshift({
          id: 'zendesk',
          icon: 'chat-bubble',
        })
      }
    },

    handleWithDisableActions() {
      const lessonsNode = document.querySelector('#lessons')
      $util_removePreventEventList(lessonsNode, this.defaultDisableActionsList)

      if (!this.equalsProfile('student')) return

      if (this.topicResource && this.isExamination) {
        const {
          disableCopy = false,
          disableCut = false,
          disablePaste = false,
        } = this.topicResource.examination

        const disableActionList = []

        if (disableCopy || disableCut || disablePaste) disableActionList.push('contextmenu')
        if (disableCopy) disableActionList.push('copy')
        if (disableCut) disableActionList.push('cut')
        if (disablePaste) disableActionList.push('paste')

        $util_addPreventEventList(lessonsNode, disableActionList)
      }
    },
    getAudioURL(audioData) {
      this.podcastStartTime = +audioData.time
      this.isPodcastPlaying = audioData.isPlaying
      this.checkType()
    },

    openMenuTopics() {
      this.menuActive = true
      if (this.isScorm) {
        this.$refs.iframe.contentWindow.postMessage({ type: 'removeUnloadEvent' }, '*')
        this.getMenu()
      }
    },
    closeMenuTopics() {
      this.menuActive = false
    },
    getTypeClass(type) {
      return 'is-type-' + type
    },
    getClassByLevel(level) {
      return 'level-' + level
    },
    exitPPTX() {
      this.modalConfirmExitPPTX = false
      this.openTopic(this.nextTopicAfterPPTX)
    },
    concludePPTX() {
      this.consumePPTXTopic()
      this.exitPPTX()
    },
    verifyPPTXNextTopic(topic) {
      if (
        this.isPPTX &&
        !this.itemActive.completed &&
        !topic.currentActive &&
        !this.prerequisiteError &&
        !this.evaluationBlockMessage &&
        this.topicInPeriod(this.itemActive)
      ) {
        this.nextTopicAfterPPTX = topic
        this.modalConfirmExitPPTX = true
      } else {
        this.openTopic(topic)
      }
    },
    topicHasUncompletedPrerequisite(topic) {
      if (this.equalsProfile('student')) {
        return topic.prerequisite && !topic.prerequisite.isCompleted
      }
      return false
    },
    openTopic(item) {
      if (this.topicHasUncompletedPrerequisite(item)) {
        this.setFeedback({
          message: this.$t('classroom.lessons:prerequisite.toast.error.lessons', {
            lesson: item.prerequisite.name,
          }),
        })
        return
      }
      this.evaluationBlockMessage = false

      this.nextTopicAfterPPTX = null
      if (item && !item.currentActive) {
        if (this.itemActive) {
          this.itemActive.currentActive = false
          this.itemActive.submenu = null
          this.resetFlowMenu()
        }
        this.navigateRouter(item)
        this.scormClosed = false
      }
    },
    navigateRouter(item) {
      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          session_uuid: this.sessionUuid,
          type: item.type,
          type_id: item.id,
        },
      })
    },
    /**
     * send a request to mark user activity
     * @param {Object} activityData
     */
    checkActivity(sessionUuid, topicId, token) {
      const activityData = { sessionUuid, topicId }
      if (token) activityData.token = token
      this.attemptCheckActivity(activityData).then(({ data }) => {
        this.activityToken = data.token
      })
    },
    /**
     * check if activityInterval is not set, then set it
     * and define a interval to check user activity each 10 minutes
     * @param {Number} topicId
     */
    manageActivityInterval(topicId) {
      if (this.$isEnabledFeature('impersonate_read_only') && this.$isUserImpersonated()) return
      if (this.notEqualsProfile('student') || !this.$isEnabledFeature('classroom_activities'))
        return

      clearInterval(this.activityInterval)
      const intervalTime = 1000 * 60 * 10
      this.checkActivity(this.sessionUuid, topicId, this.activityToken)
      this.activityInterval = setInterval(() => {
        this.checkActivity(this.sessionUuid, topicId, this.activityToken)
      }, intervalTime)
    },

    checkNextTopicPrerequisite(openTopicPayload) {
      const topicIndex = this.topics.findIndex((topic) => topic.id === openTopicPayload.topicId)
      if (topicIndex !== -1 && this.topics[topicIndex + 1]) {
        const nextTopic = this.topics[topicIndex + 1]
        this.hasPrerequisite = nextTopic.prerequisite
        if (!this.hasPrerequisite && nextTopic) {
          this.nextTopicTimeLine = nextTopic
        }
      }
    },

    checkType() {
      this.prerequisiteError = false

      this.topics.forEach((a) => {
        a.currentActive = false
      })

      this.itemActive.currentActive = true
      this.currentIndex = this.itemActive.index
      let assets = this.itemActive.assets
      this.iframeURL = null

      const openTopicPayload = {
        topicId: this.contentTypeID,
        assetId: assets[0].id,
        sessionUuid: this.sessionUuid,
      }

      if (this.$route.query.accessType) {
        openTopicPayload.accessType = this.$route.query.accessType
      }

      this.checkNextTopicPrerequisite(openTopicPayload)

      this.setFetching(true)
      this.evaluationBlockMessage = false
      this.attemptOpenTopic(openTopicPayload)
        .then(({ data }) => {
          this.topicResource = data.resource
          this.schedulePeriod = data.schedulePeriod
          this.manageActivityInterval(this.contentTypeID)
          this.checkMandatoryResearchPending()
          this.advanceProgressBlock = data.is_block_advancement_button
          this.blockWorkload = false

          if (this.itemActive.type === 'examination') {
            this.openExamination(data.resource)
          } else if (this.itemActive.type === 'research') {
            this.openResearch(data.resource)
          } else if (this.itemActive.type === 'competency') {
            this.competency.loading = true
            this.openCompetency(data.resource)
          } else if (this.itemActive.type === 'class') {
            this.openFrame(data)
          }
        })
        .then(() => {
          this.handleWithDisableActions()
        })
        .catch((response) => {
          const messageError = response.data.message
          if (messageError === 'not_allowed_access_topic_out_of_schedule') return
          if (messageError === 'access_not_allowed_to_expired_class') return

          if (
            messageError === 'exceeded_limit_continuously' ||
            messageError === 'exceeded_day_limit'
          ) {
            this.modalWorkloadLimit = true
            this.blockWorkload = true
            return
          }

          if (messageError === 'topic_restricted_by_examination_result') {
            this.evaluationBlockMessage = response.data.hint.examination_name
            return
          }

          if (messageError === 'biometric_capture_required') return

          if (messageError === 'enrollment_not_consumed_pre_requisite')
            this.showTopicPrerequisites()
          else {
            this.setFeedback({
              message: this.$t('classroom.access:feedback.error.admin'),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
          this.updateHeader()
          this.stopIdleTimer(this.isVideo || this.isScorm)
        })
    },
    showTopicPrerequisites() {
      this.prerequisiteData = this.itemActive.prerequisite.name
      this.prerequisiteError = true
      this.setFeedback({
        message: this.$t('classroom.access:feedback.error.prerequisite'),
        type: 'error',
      })
    },
    openFrame(data) {
      this.iframeURL = null
      let assets = this.itemActive.assets
      if (assets.length > 0) {
        if (this.isVideo) {
          this.iframeURL = data.resource.embedLink
          this.iframeHeight = data.resource.height
          this.videoTimeWatched = data.resource.maxSeekPosition
          this.videoIsSeekable = data.resource.isSeekable
        } else {
          this.iframeURL = data.resource
          this.isFrameDataDownloadable = !!data.is_downloadable
          this.isAlternativeReader = data.alternative_reader
        }

        this.resource = data.resource
        this.setFetching(false)
      }
    },
    setupA11y() {
      if (
        this.$isEnabledFeature('accessibility') &&
        USER_WAY_KEY_SCORM &&
        USER_WAY_KEY_SCORM !== '' &&
        this.$refs.iframe
      ) {
        this.$refs.iframe.contentWindow.postMessage({ type: 'a11y', key: USER_WAY_KEY_SCORM }, '*')
      }
    },
    loadVideoPlayer() {
      if (this.Account.user.currentProfile === 'student') {
        this.videoLastPositionConsumed = 0
        this.videoPlayer = new Player(this.$refs.iframe_video)

        this.videoPlayer.on('loaded', () => {
          !this.itemActive.completed &&
            this.videoPlayer.setCurrentTime(Math.floor(this.videoTimeWatched))
        })

        this.videoPlayer.off('timeupdate')
        this.videoPlayer.on('timeupdate', this.updateVideoTime)

        this.videoPlayer.off('seeked')
        this.videoPlayer.on('seeked', this.verifyVideoSeekedLock)

        this.videoPlayer.off('ended')
        this.videoPlayer.on('ended', this.endVideoTime)
      }
    },
    verifyVideoSeekedLock(data) {
      const canSeekForward = this.videoIsSeekable || this.videoTimeWatched > data.seconds
      if (canSeekForward) return

      this.videoPlayer.setCurrentTime(Math.floor(this.videoTimeWatched))
    },

    endVideoTime() {
      if (!SHOW_THUMB_ON_LAST_TOPIC_WHEN_END_VIDEO || !this.isLastTopic) return

      const isTrailClassroom = this.Classroom.data.path
      if (!isTrailClassroom) return

      if (this.itemActive.mandatory) {
        this.goToClassroomEnd(false)
      }
    },

    updateVideoTime(data) {
      let consumptionAllowed = false
      const videoConsumeInterval = 5
      const currentVideoPosition = Math.round(data.seconds)
      const isEnded = data.percent === 1

      const executionTimeDiff = data.seconds - this.videoTimeWatched
      const isSeekingForward = executionTimeDiff > 1
      const canUpdateTimeWatched = !isSeekingForward && data.seconds > this.videoTimeWatched

      const canConsumeEvenSeeking = this.videoIsSeekable || !isSeekingForward
      const canConsume =
        currentVideoPosition > this.videoLastPositionConsumed &&
        currentVideoPosition - this.videoLastPositionConsumed >= videoConsumeInterval &&
        canConsumeEvenSeeking

      if (canUpdateTimeWatched) {
        this.videoTimeWatched = data.seconds
      }

      if (
        canConsume ||
        (isEnded && canConsumeEvenSeeking) ||
        this.videoLastPositionConsumed === 0
      ) {
        consumptionAllowed = true
      }

      if (consumptionAllowed) {
        let formData = {
          topicId: this.contentTypeID,
          sessionUuid: this.sessionUuid,
          consumedValue: currentVideoPosition,
        }
        this.videoLastPositionConsumed = data.seconds
        this.attemptConsumeTopic(formData)
      }
    },
    openExamination(evaluations) {
      if (this.$isEnabledFeature('classroom_notification') && this.equalsProfile('student')) {
        this.attemptReadClassroomNotifications({
          examinationId: evaluations.examination.id,
          enrollmentExaminationId: evaluations.id,
          topicId: this.$route.params.type_id,
        })
      }

      let data = {
        title: this.itemActive.name,
        description: this.itemActive.description,
        loading: true,
        feedback: false,
        maxAttempt: 1,
        submitted: false,
        grade: 0,
        attempt: 0,
        status: null,
        key: new Date().getTime(),
      }

      data.questions = evaluations.examination.questions.map((item) => {
        item.statement = item.statement.replace(/(?:\r\n|\r|\n)/g, '<br />')
        if (item.type !== 'association') {
          let choices = item.choices.map((itemChoice) => {
            return {
              label: itemChoice.description.replace(/(?:\r\n|\r|\n)/g, '<br />'),
              value: itemChoice.id,
              correct: itemChoice.right,
              item: itemChoice.item,
            }
          })
          item.choices = choices
        }

        let answer = null
        if (evaluations.answers) {
          answer = evaluations.answers.filter((answer) => {
            return answer.question.id === item.id
          })
          answer = answer ? answer[0] : null
        }

        let feedbackType = null
        if (answer && answer.choice) {
          feedbackType = answer.choice.right ? 'correct' : 'wrong'
        }

        return Object.assign(
          {
            answer: answer && answer.choice ? answer.choice.choice_id : null,
            feedbackType: feedbackType,
          },
          item
        )
      })
      data.maxAttempt = evaluations.examination.tries
      data.initialTime = evaluations.examination.initialTime
      data.examination_id = evaluations.examination.id
      data.attempt = parseInt(evaluations.attempt)
      data.grade = evaluations.grade != null ? parseFloat(evaluations.grade).toFixed(2) : null
      data.maxGrade = evaluations.examination.maxGrade
      data.submitted = !!evaluations.startTime && evaluations.status !== 'started'
      data.feedbackInclude = evaluations.examination.feedbackInclude

      data.examination = evaluations.examination
      data.examination.aggregateExaminationsGraded = evaluations.aggregateExaminationsGraded

      data.answers = evaluations.answers
      data.time = {
        attemptDeadline: evaluations.attemptDeadline,
        serverTime: evaluations.serverTime,
        endTime: evaluations.endTime,
        startTime: evaluations.startTime,
        timeLimit: evaluations.examination.examDeadline,
      }
      data.loading = false
      data.enrollmentId = evaluations.id
      data.status = evaluations.status
      data.examinationComment = evaluations.examinationComment
      data.restrictProgress = evaluations.examination.restrictProgress
      data.aggregateExaminations = evaluations.aggregateExaminations
      data.aggregateExaminationsGraded = evaluations.aggregateExaminationsGraded

      if (this.equalsProfile('student') && data.restrictProgress) {
        if (data.status === 'awaiting_correction') {
          this.modalProgressBlock = true
        }
        if (data.status === 'passed') {
          this.modalAdvanceProgressBlock = true
        }
        if (data.status === 'failed' || data.status === 'retake') {
          this.modalFailedProgressBlock = true
        }
      }

      for (let prop in data) {
        this.$set(this.evaluations, prop, data[prop])
      }
    },
    openResearch(research) {
      let data = {
        loading: true,
        questions: [],
        isAnswered: false,
        showSaveButton: false,
        research_id: 0,
        key: new Date().getTime(),
      }
      if (research !== null) {
        data.questions = research.questions.map((item) => {
          item.choices = item.choices.map((itemChoice) => {
            return {
              label: itemChoice.description,
              value: itemChoice.choice_id,
            }
          })
          return item
        })
        data.title = research.title
        data.research_id = research.id
        data.showSaveButton = this.Account.user.currentProfile === 'student'
      } else {
        data.isAnswered = true
      }
      data.loading = false
      for (let prop in data) {
        this.$set(this.research, prop, data[prop])
      }
    },
    openCompetency(competency) {
      if (this.$isEnabledFeature('classroom_notification') && this.equalsProfile('student')) {
        this.attemptReadCompetencyClassroomNotifications({
          topicId: this.$route.params.type_id,
        })
      }
      const isAnswered =
        competency.enrollmentCompetencyAnswers &&
        typeof competency.enrollmentCompetencyAnswers[0] === 'object'

      this.competency.competency_id = competency.id
      this.competency.title = competency.title
      this.competency.description = competency.description
      this.competency.showSaveButton = this.Account.user.currentProfile === 'student'
      this.competency.isAnswered = isAnswered
      this.competency.feedback = competency.competencyComment
      this.competency.answers = isAnswered ? competency.enrollmentCompetencyAnswers : []
      this.competency.questions = competency.competenciesQuestions.map((question) => {
        return {
          type: question.type,
          question_id: question.id,
          question: question.question,
          topics: question.competenciesQuestionsItems,
          answerOptions: question.competenciesQuestionsChoices,
        }
      })
      this.competency.key = new Date().getTime()
      this.competency.loading = false
    },
    openTopicFromScorm(topic) {
      this.$refs.iframe.contentWindow.postMessage({ type: 'removeUnloadEvent' }, '*')

      if (
        this.notEqualsProfile('student') ||
        !this.sessionUuid ||
        !this.incompleteTopicsIDs.length
      ) {
        this.openTopic(topic)
        this.setFetching(false)
        return
      }

      this.setFetching(true)
      clearInterval(this.completeTopicInterval)

      this.checkTopicsService()
        .then(() => {
          if (this.topicHasUncompletedPrerequisite(topic)) {
            this.setFeedback({
              message: this.$t('classroom.lessons:prerequisite.toast.error.lessons', {
                lesson: topic.prerequisite.name,
              }),
            })
            return
          }

          this.isIframeReady = false

          if (this.prerequisiteError) {
            this.openTopic(topic)
            return
          }

          this.exitScorm(true)

          let unwatchScormClosed = this.$watch(
            () => this.scormClosed,
            (newVal) => {
              if (newVal) {
                this.openTopic(topic)
                unwatchScormClosed()
              }
            }
          )
        })
        .finally(() => {
          this.setFetching(false)
          this.startTopicsAreCompletePolling()
        })
    },

    pushToDashboard() {
      return this.$router.push({
        name: 'classroom.panel.dashboard',
        params: { session_uuid: this.sessionUuid },
      })
    },

    pushToNextSolution() {
      if (this.nextSolution) {
        this.$router.push({
          name: 'classroom.lessons.course',
          params: {
            session_uuid: this.nextSolution.session_uuid,
            trail_id: this.$route.params.trail_id,
            redirected: true,
          },
        })
      } else {
        this.showNextSolutionModal = false
        this.showEndTrailModal = true
      }
    },

    async goToClassroomEnd(forceUpdateSessionInfo = true) {
      this.setFetching(true)
      await this.fetchStudentProgress(this.sessionUuid)
      this.setFetching(false)

      const studentProgress = this.Classroom.studentProgress
      if (studentProgress.requiredContent > studentProgress.requiredContentCompleted) {
        const currentPath = this.$route.path
        const certificateType = this.Classroom.data.course.certificateTypeSlug
        this.setFeedback({
          title: this.$t('classroom.end.class:pending.actions.feedback.title'),
          message: this.$t(
            'classroom.end.class:pending.actions.feedback.desc' +
              (certificateType === 'conclusion' ? '' : '.no.certificate')
          ),
          type: 'info',
          duration: 5000,
          detail: () => this.$emit('openProgressModal'),
          postAction: () =>
            this.$router.push({
              name: 'classroom.panel',
              params: { session_uuid: this.sessionUuid },
            }),
          abortToastRule: () => this.$route.path !== currentPath,
        })
        return
      }

      if (!PORTAL_CONFIGS) this.$emit('update-session-info', forceUpdateSessionInfo)
      const isTrailClassroom = this.Classroom.data.path && this.Classroom.data.path.id

      if (isTrailClassroom) {
        const nextSolution = this.Classroom.data.nextTrailSolution

        if (nextSolution) {
          this.nextSolution = nextSolution
          this.showNextSolutionModal = true
        } else {
          this.showEndTrailModal = true
        }
      } else {
        this.$emit('show:conclusion')
      }
    },
    getPdfConsuptionData() {
      return {
        topicId: this.contentTypeID,
        sessionUuid: this.sessionUuid,
        numPages: this.pdfCountPages,
        pages: JSON.stringify(this.pdfConsume),
      }
    },
    async consumePdf(avoidLoading = false) {
      if (!this.equalsProfile('student')) return

      const formData = this.getPdfConsuptionData()

      if (!avoidLoading) this.setFetching(true)
      await this.attemptConsumeTopic(formData)
      await this.checkTopicsAreComplete()
      if (!avoidLoading) this.setFetching(false)
    },
    async goNextTopic() {
      this.modalProgressBlock = false
      this.modalAdvanceProgressBlock = false
      this.modalFailedProgressBlock = false

      if (PDF_AWAIT_USER_CONFIRM && this.isPDF) await this.consumePdf()

      if (this.blockWorkload) {
        this.goTopic(this.currentIndex + 1)
        return
      }

      if (this.isScorm) {
        this.$refs.iframe.contentWindow.postMessage({ type: 'removeUnloadEvent' }, '*')
      }

      if (this.canGoNextScormModule) {
        this.goToSco(this.flowMenu.next)
        return
      }

      if (this.isPPTX && !this.prerequisiteError && !this.evaluationBlockMessage) {
        this.consumePPTXTopic()
      }

      if (this.isLastTopic) {
        return this.goToClassroomEnd()
      }
      this.goTopic(this.currentIndex + 1)
    },
    goPrevTopic() {
      if (this.blockWorkload) {
        this.goTopic(this.currentIndex - 1)
        return
      }

      if (this.canGoPrevScormModule) {
        this.goToSco(this.flowMenu.prev)
        return
      }

      if (this.isPPTX) {
        this.verifyPPTXNextTopic(this.topics[this.currentIndex - 1])
        return
      }
      this.goTopic(this.currentIndex - 1)
    },
    goTopic(newIndex) {
      if (this.isScorm && !this.blockWorkload) {
        this.openTopicFromScorm(this.topics[newIndex])
      } else {
        this.openTopic(this.topics[newIndex])
      }
    },
    closeMenuHandler() {
      if (this.isScorm && !this.blockWorkload) {
        this.$refs.iframe.contentWindow.postMessage({ type: 'addUnloadEvent' }, '*')
      }
      this.closeMenuTopics()
    },
    async goToSco(index) {
      const promiseMethod = () =>
        new Promise((resolve, reject) => {
          this.getMenu()
          this.resolveGetMenuPromise = resolve
        })
      this.closeMenuTopics()

      if (this.isScorm) {
        this.$refs.iframe.contentWindow.postMessage({ type: 'removeUnloadEvent' }, '*')
      }

      await promiseMethod()

      const toGo = this.itemActive && this.itemActive.submenu.find((item) => item.index === index)
      const toGoIsDisabled = toGo ? toGo.disabled : false

      if ((index > this.flowMenu.current && !this.currentModuleCompleted) || toGoIsDisabled) {
        this.setFeedback({ message: this.$t('classroom.lessons:scorm.next.hint') })
        return
      }

      this.setFetching(true)
      this.$refs.iframe.contentWindow.postMessage({ type: 'link', index: index }, '*')
      this.getMenu()
    },
    getMenu() {
      this.$refs.iframe.contentWindow.postMessage({ type: 'menu' }, '*')
    },
    getMessageIframe(evt) {
      let data = evt.data

      if (data && data.type === 'redirectToPanel') {
        this.pushToDashboard()
      }

      if (data.hasOwnProperty('command') && data.command === 'getMenu') {
        if (this.itemActive) {
          this.itemActive.submenu = data.menu

          if (this.canCheckTopicsAreComplete && !this.completedTopicList.length)
            this.checkTopicsAreComplete()
        }
        if (this.resolveGetMenuPromise) {
          this.resolveGetMenuPromise()
          this.resolveGetMenuPromise = null
        }
        if (data.menu.filter((item) => item.active === true).length) {
          this.flowMenuData(data.menu.find((item) => item.active === true).index, data.menu.length)
        }
      }
      if (data.hasOwnProperty('command') && data.command === 'scormClosed') {
        this.setFetching(false)
        this.scormClosed = true
      }
      if (data.hasOwnProperty('command') && data.command === 'documentReady') {
        this.setFetching(false)
        this.isIframeReady = data.state === 'complete'
        this.setupA11y()
      }
    },
    resetFlowMenu() {
      this.flowMenu.total = null
      this.flowMenu.current = null
      this.flowMenu.prev = null
      this.flowMenu.next = null
    },
    flowMenuData(current, total) {
      this.flowMenu.total = total
      this.flowMenu.current = current
      this.flowMenu.prev = current === 1 ? 1 : current - 1
      this.flowMenu.next = current <= total ? current + 1 : 1
    },
    updateVideoDimension(obj) {
      if (obj === undefined || obj === {}) {
        this.headerHeight = document.querySelector('.header-classroom').clientHeight
      } else {
        this.objHeaderIsRetractedUsed = true
        this.headerHeight = document.querySelector('.header-classroom').clientHeight
        this.headerHeight = obj.headerIsRetracted ? 110 : this.headerHeight + 80
      }
      this.classesBarHeight = document.querySelector('.classes-bar').clientHeight
      this.videoHeight = this.screenHeight + this.headerHeight * -1 - this.classesBarHeight
    },
    consumePPTXTopic() {
      if (this.notEqualsProfile('student') || !this.topicInPeriod(this.itemActive)) return

      let formData = {
        topicId: this.contentTypeID,
        sessionUuid: this.sessionUuid,
      }
      this.attemptConsumeTopic(formData).then(({ data }) => {
        this.checkTopicsAreComplete()
      })
    },
    storeConsume(e) {
      const alreadySeen = this.pdfConsume.find((consume) => consume.page === e.page)
      if (alreadySeen) return

      this.pdfConsume.push(e)
    },
    consumeAudioTopic(currentTime) {
      if (this.notEqualsProfile('student') || this.itemActive.completed) return

      let formData = {
        topicId: this.contentTypeID,
        sessionUuid: this.sessionUuid,
        consumedValue: currentTime,
      }

      this.debounceConsumeTopic(() => {
        this.attemptConsumeTopic(formData).then(({ data }) => {
          this.checkTopicsAreComplete()
        })
      })
    },
    consumeLTI() {
      if (this.notEqualsProfile('student') || this.itemActive.completed) return

      let formData = {
        topicId: this.contentTypeID,
        sessionUuid: this.sessionUuid,
      }

      this.attemptConsumeTopic(formData).then(this.checkTopicsAreComplete)
    },
    consumeExternalLink() {
      window.open(this.itemActive.assets[0].name, '_blank')

      if (this.notEqualsProfile('student') || this.itemActive.completed) return

      let formData = {
        topicId: this.contentTypeID,
        sessionUuid: this.sessionUuid,
      }
      this.attemptConsumeTopic(formData).then(({ data }) => {
        this.checkTopicsAreComplete()
      })
    },
    debounceConsumeTopic(fn) {
      if (this.consumeTopicTimeout) clearTimeout(this.consumeTopicTimeout)
      this.consumeTopicTimeout = setTimeout(() => {
        fn()
      }, 300)
    },

    async checkTopicsService() {
      if (this.isCheckingTopicConsume) return
      this.isCheckingTopicConsume = true

      return this.attemptCheckTopicsCompleted({
        sessionUuid: this.sessionUuid,
        topics: this.incompleteTopicsIDs,
      })
        .then(({ data }) => {
          let hasCompletedItems = false
          this.completedTopicList = data

          data.forEach((item) => {
            this.topics.forEach((topic) => {
              if (topic.id === item.id) {
                topic.completed = item.completed
                if (topic.id === parseInt(this.contentTypeID)) {
                  this.scormCompleted = topic.completed
                }
              }
            })

            if (item.completed) {
              hasCompletedItems = true
            }
          })

          this.checkPrerequisitesAreCompleted()
          hasCompletedItems && this.fetchStudentProgress(this.sessionUuid)
          this.checkMandatoryResearchPending()
        })
        .finally(() => {
          this.isCheckingTopicConsume = false
        })
    },

    /**
     * Show research alert only when rest mandatory research's to complete.
     */
    checkMandatoryResearchPending() {
      if (
        !ENABLE_RESEARCH_WARNING ||
        (this.itemActive.type === 'research' &&
          this.itemActive.mandatory &&
          !this.itemActive.completed)
      ) {
        return
      }

      const mandatoryTopics = this.topics.filter((topic) => topic.mandatory)
      const uncompletedTopics = mandatoryTopics.filter((topic) => !topic.completed)
      const isAllMandatoryResearch =
        uncompletedTopics.length && uncompletedTopics.every((topic) => topic.type === 'research')

      if (!isAllMandatoryResearch) return

      this.researchWarningTopic = uncompletedTopics[0]
    },

    openResearchWarning() {
      this.openTopic({ ...this.researchWarningTopic })
      this.resetResearchWarning()
    },

    resetResearchWarning() {
      this.researchWarningTopic = null
    },

    topicInPeriod(topic) {
      if (!topic) return false

      if (topic.topicPeriods === null) {
        return true
      }

      return (
        topic &&
        topic.topicPeriods &&
        topic.topicPeriods.schedulePeriod &&
        topic.topicPeriods.schedulePeriod.open
      )
    },

    topicIsExpired(topic) {
      const schedulePeriod = topic && topic.topicPeriods && topic.topicPeriods.schedulePeriod
      const endDate = schedulePeriod && schedulePeriod.end
      const dateNow = endDate && schedulePeriod.now

      const timestamp = dateNow && new Date(endDate) - new Date(dateNow)

      return timestamp < 0
    },

    checkTopicsAreComplete() {
      if (this.equalsProfile('student') && this.sessionUuid && this.incompleteTopicsIDs.length) {
        return this.checkTopicsService()
      }
    },
    checkAfterSubmitEvaluationForm(submitted) {
      if (submitted) {
        this.setFeedback({
          message: this.$t('classroom.lessons:modal.accomplished.evaluation.feedback'),
        })
      }

      this.evaluations.examinationComment = null
      this.checkTopicsAreComplete()
    },
    checkEvaluationStatus(status) {
      if (this.evaluations.restrictProgress) {
        switch (status) {
          case 'retake':
          case 'failed':
            this.modalFailedProgressBlock = true
            return
          case 'awaiting_correction':
            this.modalProgressBlock = true
            return
          case 'passed':
            this.modalAdvanceProgressBlock = true
            return
        }
      }

      if (status === 'started') {
        this.evaluations.status = status
      }
    },
    startTopicsAreCompletePolling() {
      clearInterval(this.completeTopicInterval)
      this.completeTopicInterval = setInterval(() => {
        if (this.canCheckTopicsAreComplete) this.checkTopicsAreComplete()
      }, 20000)
    },
    checkPrerequisitesAreCompleted() {
      this.topics.forEach((topic, idx) => {
        if (topic.prerequisite) {
          const prerequisite = this.topics.find((t) => t.id === topic.prerequisite.id)
          topic.prerequisite.isCompleted = prerequisite.completed
        }
      })
    },
    exitScorm(silentMode = false) {
      this.$refs.iframe.contentWindow.postMessage({ type: 'removeUnloadEvent' }, '*')

      if (!silentMode) {
        this.setFetching(true)
      }

      if (this.isScorm && document.getElementsByClassName('iframe-scorm').length > 0) {
        document
          .getElementsByClassName('iframe-scorm')[0]
          .contentWindow.postMessage({ type: 'leavingSco' }, '*')
      }
      this.isIframeReady = false
    },
    updateHeader() {
      this.$emit('change-header', {
        customClasses: {
          'classes lessons': true,
          'bg-prerequisite-error': this.prerequisiteError === true,
          'bg-black': this.isVideo && !this.evaluationBlockMessage,
        },
      })
    },
    getStartDate() {
      return this.$t('classroom.lessons:onboarding.lesson.message', {
        name: this.Classroom.data.name,
        date: this.formatDate(this.Classroom.data.availability.initial, 'long'),
      })
    },

    async downloadFrameAsset() {
      const asset = this.itemActive.assets[0]
      const description = asset.description

      if (this.isAlternativeReader) {
        this.$refs.pdfViewer.downloadPDF(description)

        return
      }

      await this.attemptDownloadTopicAsset({ assetId: asset.id, filename: description })
    },

    goBackToEvaluationList() {
      this.$router.push({ name: 'classroom.assessments.evaluation' })
    },

    goBackToProjectList() {
      if (this.equalsProfile('student')) {
        return this.$router.push({ name: 'classroom.pre.project.student.project' })
      }

      this.$router.push({ name: 'classroom.pre.project.tccproject' })
    },

    formattedContentTitle(title) {
      return title.toUpperCase()
    },

    handleScroll() {
      const classesNavBarRect = this.$refs.classesNavBar.getBoundingClientRect()
      const classesWrapperRect = this.$refs.classesWrapper.getBoundingClientRect()

      if (!classesNavBarRect || !classesWrapperRect) return

      const isFixed = classesNavBarRect.top < 1 && classesWrapperRect.top < -40

      if (isFixed !== this.isNavBarFixed) {
        this.isNavBarFixed = isFixed
      }
    },

    navigateHandler() {
      if (this.$route.meta.isFromProject) {
        return this.goBackToProjectList()
      }
      if (this.isFromActivity) {
        return this.goBackToEvaluationList()
      }
      return this.openMenuTopics()
    },
  },
}
</script>

<template>
  <div
    id="lessons"
    class="inner-content"
    :data-testid="$testId('lessons')"
    :class="{ 'integration-app-mode': isIntegrationAppMode }"
  >
    <div
      v-if="topics.length === 0"
      class="p-4"
    >
      <empty-message>
        <template v-if="!isOnboarding">
          <h2>{{ $t('classroom.lessons:empty.title') }}</h2>
          <p class="text-color">{{ $t('classroom.lessons:empty.message') }}</p>
          <action
            type="button"
            :text="$t('global:go.to') + $t('global:menu.classroom')"
            flat
            @click="$router.push({ name: 'classroom.sessions' })"
          />
        </template>
        <template v-else>
          <h2>{{ $t('classroom.lessons:onboarding.lesson.title') }}</h2>
          <p class="text-color" v-html="
              $t('classroom.lessons:onboarding.lesson.message', {
                name: Classroom.data.name,
                date: formatDate(Classroom.data.availability.initial, 'long'),
              })
            "></p>
        </template>
      </empty-message>
    </div>
    <div
      v-if="topics.length"
      ref="classesWrapper"
      class="classes-wrapper padding-footer"
    >
      <div
        v-if="
          !isIntegrationAppMode &&
          !$media.mobile &&
          (!isExamination || topicInPeriod(itemActive) || !isCorrection)
        "
        class="classes-bar has-controls"
      >
        <h2
          :class="isFromActivity ? 'classes-bar-title-ff' : 'classes-bar-title'"
          :title="contentTitle"
        >
          {{ isFromActivity ? '' : contentTitle }}
        </h2>
        <Button
          class="classes-bar-menu-btn"
          :inner-prepend-icon="isFromActivity ? 'arrow_back' : ''"
          variant="text"
          @click.stop="navigateHandler"
        >
          {{
            isFromActivity
              ? isFromProject
                ? $t('global:return.to.project.list')
                : $t('global:return.to.evaluation.list')
              : $t('classroom.lessons.course:menu.expand.lessons.list')
          }}
        </Button>
        <Action
          v-if="!$media.mobile && !isIntegrationAppMode"
          class="btn-fullscreen"
          type="button"
          :icon="isFullscreen ? 'fullscreen_exit' : 'zoom_out_map'"
          @click="$root.$emit('toggle-fullscreen')"
        />
      </div>

      <div
        v-if="!isFromActivity"
        ref="classesNavBar"
        class="classes-nav-bar"
        :class="{ fixed: isNavBarFixed }"
      >
        <div class="classes-bar-controls">
          <Action
            v-if="currentIndex !== 0 || canGoPrevScormModule"
            flat
            type="button"
            icon="keyboard_backspace"
            class="btn-prev"
            :text="$t('global:prev')"
            :disabled="isPreviousDisabled"
            :dark="true"
            :hide-label="$media.mobile"
            @click="goPrevTopic"
          />
          <div
            class="classes-counter-container"
            :class="{ 'first-item': currentIndex === 0 }"
          >
            <span
              class="classes-counter"
              v-html="
                $t('classroom.lessons.course:current.topic', {
                  num1: currentIndex + 1,
                  num2: topics.length,
                })
              "
            >
            </span>
          </div>
          <Action
            icon-right
            flat
            type="button"
            class="btn-next"
            v-bind="nextTopicActionProps"
            :disabled="isNextDisabled"
            :dark="true"
            @click="goNextTopic"
          />
        </div>
      </div>

      <div :class="{ 'wrapper__classes-menu': menuActive }">
        <div
          v-click-outside="$media.desktop ? closeMenuHandler : () => {}"
          :class="{ 'is-open': menuActive }"
          class="classes-menu"
        >
          <Action
            type="button"
            icon="close"
            class="btn-close"
            @click.stop="closeMenuHandler"
          />

          <h3 class="classes-menu-title">
            {{ $t('classroom.lessons.course:menu.title') }}
          </h3>

          <div class="classes-menu-list">
            <template v-for="topic in topics">
              <div
                v-if="
                  (!isIntegrationAppMode && topic.assets[0].active) ||
                  (isIntegrationAppMode &&
                    topic.id === itemActive.id &&
                    itemActive.submenu &&
                    itemActive.submenu.length > 1)
                "
                :key="topic.id"
                class="classes-menu-item"
                :class="[getTypeClass(topic.type)]"
              >
                <a
                  href="#"
                  class="classes-menu-link"
                  :class="{
                    'is-active': topic.currentActive,
                    'is-completed': topic.completed,
                    'has-prerequisite':
                      topicHasUncompletedPrerequisite(topic) || !topicInPeriod(topic),
                  }"
                  @click.prevent="verifyPPTXNextTopic(topic)"
                >
                  <span class="flex align-items-center justify-content-between text">
                    {{ topic.name }}

                    <TooltipSlot
                      v-if="
                        !topicInPeriod(topic) ||
                        topic.mandatory ||
                        topicHasUncompletedPrerequisite(topic)
                      "
                      :width="295"
                      class="relative"
                      horizontal-align="right"
                      vertical-align="top"
                      arrow
                      dark
                      shadow
                    >
                      <template #activator>
                        <Icon
                          class="mt-1 text-base text-color icon-fill-1"
                          size="small"
                          name="info"
                          pack="material"
                        />
                      </template>

                      <template #content>
                        <div class="tooltip__topic--content">
                          <p
                            v-if="!topicInPeriod(topic)"
                            class="schedule-period"
                          >
                            <template v-if="topicIsExpired(topic)">
                              {{
                                $t('classroom.lessons.course:schedule-period:expired', {
                                  date: formatDate(topic.topicPeriods.schedulePeriod.end, 'long'),
                                })
                              }}
                            </template>

                            <template v-else>
                              {{
                                $t('classroom.lessons.course:schedule-period:start', {
                                  date: formatDate(topic.topicPeriods.schedulePeriod.start, 'long'),
                                })
                              }}
                            </template>
                          </p>

                          <p v-if="topic.mandatory">
                            {{ $t('global:mandatory.consumption') }}
                          </p>

                          <span
                            v-if="topicHasUncompletedPrerequisite(topic)"
                            class="classes-menu-link__prerequisite"
                          >
                            {{
                              $t('classroom.lessons.course:menu.item.prerequisite', {
                                lesson: topic.prerequisite.name,
                              })
                            }}
                          </span>
                        </div>
                      </template>
                    </TooltipSlot>
                  </span>

                  <Icon
                    name="check-circle"
                    wrapper
                  />
                </a>

                <div
                  v-if="topic.submenu"
                  class="classes-submenu-list"
                >
                  <div
                    v-for="submenuItem in topic.submenu"
                    :key="submenuItem.index"
                    class="classes-submenu-item"
                  >
                    <a
                      href="#"
                      class="classes-submenu-link"
                      :class="[
                        {
                          'is-active': submenuItem.active,
                          'is-completed': submenuItem.completed,
                        },
                        getClassByLevel(submenuItem.level),
                      ]"
                      @click.prevent="goToSco(submenuItem.index)"
                    >
                      <span class="text">
                        {{ submenuItem.text }}
                      </span>
                      <Icon
                        name="check-circle"
                        wrapper
                      />

                      <div
                        v-if="getFirstTopicProgress"
                        class="progress-line-submenu"
                      >
                        <ProgressLine :value="getFirstTopicProgress" />
                        <div class="percentage-submenu">{{ getFirstTopicProgress + '%' }}</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <FabButton
        v-if="$media.mobile && !hideFabMenu"
        :buttons-list="fabButtons"
        :disable-buttons="{ previous: isPreviousDisabled, next: isNextDisabled }"
        :label-buttons="{
          previous: 'global:prev',
          next: hasNextTopic ? 'global:next' : 'global:conclude',
          'menu-topics': 'global:fab.menu.topics',
          chatbot: 'chatbot.label',
          zendesk: 'zendesk.label',
        }"
        :icon-buttons="{
          next: hasNextTopic ? 'keyboard_backspace' : 'check',
        }"
        :class-buttons="{ next: hasNextTopic ? 'rotate' : 'normal' }"
        :has-button-prev="isPreviousDisabled || currentIndex !== 0 || canGoPrevScormModule"
        :has-button-next="true"
        enable-i18n
        @button:next="goNextTopic"
        @button:previous="goPrevTopic"
        @button:menu-topics="openMenuTopics"
        @button:chatbot="toggleChatbotWindow([true, !getChatbotWindow.isOpen])"
        @button:zendesk="toggleZendeskChatbotWindow(true)"
      />

      <div
        v-if="evaluationBlockMessage && topicInPeriod(itemActive)"
        class="evatuation-block__message-wrapper"
      >
        <h3 class="evaluation-title text-center">
          {{ $t('classroom.assessments:block.progress.title') }}
        </h3>
        <p class="text-center">
          {{
            $t('classroom.assessments:block.progress.description', {
              name: evaluationBlockMessage,
            })
          }}
        </p>
      </div>

      <div
        v-else-if="prerequisiteError === false && (topicInPeriod(itemActive) || isCorrection)"
        class="classes-content"
        :class="{ 'text-center': isVideo, 'video-bg-black': isVideo && !blockWorkload }"
      >
        <EvaluationForm
          v-if="isExamination && !evaluations.loading"
          :id="parseInt(contentTypeID)"
          :key="evaluations.key"
          :submitted.sync="evaluations.submitted"
          :attempt.sync="evaluations.attempt"
          :examination="evaluations.examination"
          :answers="evaluations.answers"
          :feedback="evaluations.feedback"
          :max-attempt="evaluations.maxAttempt"
          :evaluation-title="evaluations.title"
          :grade.sync="evaluations.grade"
          :max-grade="evaluations.maxGrade"
          :feedback-include="evaluations.feedbackInclude"
          :evaluation-description="evaluations.description"
          :status="evaluations.status"
          :time="evaluations.time"
          :enrollment-id="evaluations.enrollmentId"
          :schedule-data="scheduleData"
          :schedule-period="schedulePeriod"
          :has-prerequisite="hasPrerequisite"
          :next-topic="nextTopicTimeLine"
          @update:submitted="checkAfterSubmitEvaluationForm"
          @update:status="checkEvaluationStatus"
          @refresh="initialSetup"
        >
          <template #above-button>
            <EvaluationGeneralFeedback
              v-if="equalsProfile('student') && evaluations.submitted"
              :feedback="generalFeedback"
            />
          </template>
        </EvaluationForm>

        <div
          v-if="contentType === 'research' && !research.loading"
          class="center-small"
        >
          <research-form
            :id="parseInt(contentTypeID)"
            :key="research.key"
            :research-id="research.id"
            :title="itemActive.name"
            :description="itemActive.description"
            :questions.sync="research.questions"
            :is-answered.sync="research.isAnswered"
            :show-save-button.sync="research.showSaveButton"
            show-feedback
            @completed="checkTopicsAreComplete"
          >
          </research-form>
        </div>

        <div
          v-if="contentType === 'competency' && !competency.loading"
          class="center-small"
        >
          <competency-form
            :id="competency.competency_id"
            :key="competency.key"
            :title="competency.title"
            :answers="competency.answers"
            :description="competency.description"
            :questions.sync="competency.questions"
            :is-answered.sync="competency.isAnswered"
            :show-save-button.sync="competency.showSaveButton"
            :feedback="competency.feedback"
            show-feedback
            @completed="checkTopicsService"
          >
          </competency-form>
        </div>

        <LTIView
          v-if="isLTI && resource && resource.data"
          :key="resource.url"
          :resource="resource"
          :title="itemActive.name"
          :description="itemActive.description"
          :is-iframe="!resource['new_tab']"
          @consume="consumeLTI"
        />

        <iframe
          v-if="(isScorm || isPPTX) && !blockWorkload"
          :key="iframeURL"
          ref="iframe"
          :class="{ 'is-pptx': isPPTX }"
          :src="iframeURL"
          allowfullscreen
          class="iframe-view iframe-scorm"
          frameborder="0"
          mozallowfullscreen
          webkitallowfullscreen
          allow="autoplay"
          @load="getMenu()"
        ></iframe>

        <template v-if="showVideo && !blockWorkload">
          <iframe
            ref="iframe_video"
            mozallowfullscreen
            webkitallowfullscreen
            allowfullscreen
            frameborder="0"
            class="iframe-video"
            width="100%"
            :src="iframeURL"
            :height="videoHeight || iframeHeight"
            @load="loadVideoPlayer"
          ></iframe>
        </template>

        <div
          v-if="isPDF && isFrameDataDownloadable && !blockWorkload"
          class="download-asset__wrapper"
        >
          <div class="download-asset__content">
            <div>
              <icon
                name="pdf"
                wrapper
              ></icon>
              <span>{{ itemActive.assets[0].description }}</span>
            </div>
            <div
              class="download-asset__link"
              @click="downloadFrameAsset"
            >
              <icon
                name="download"
                wrapper
              ></icon>
            </div>
          </div>
        </div>

        <component
          :is="currentReader"
          v-if="isPDF && !blockWorkload && iframeURL"
          :key="iframeURL"
          ref="pdfViewer"
          v-model="currentPdfPage"
          :src="iframeURL"
          @pages="pdfCountPages = $event"
          @consumed="storeConsume"
        />
        <WorkloadLimitTimer v-if="$media.mobile" />

        <div
          v-if="isPodcast && iframeURL && itemActive && !blockWorkload"
          class="podcast center-small"
        >
          <h3 class="lesson__title">{{ itemActive.name }}</h3>
          <p class="lesson__description">{{ itemActive.description }}</p>
          <audio-player
            playerid="lessonsPlayer"
            :url="iframeURL"
            :start-time="podcastStartTime"
            :already-playing="isPodcastPlaying"
            @audio-progress="consumeAudioTopic"
            @audio-ended="consumeAudioTopic"
            @audio-expired="getAudioURL"
          />
        </div>
        <div
          v-if="isExternalLink && itemActive && !blockWorkload"
          class="center-small"
        >
          <h3 class="lesson__title">{{ itemActive.name }}</h3>
          <p class="lesson__description">{{ itemActive.description }}</p>
          <action
            type="button"
            flat
            :text="$t('classroom.lessons:external.content')"
            class="external-link"
            :dark="accessibility"
            @click="consumeExternalLink()"
          />
        </div>
      </div>

      <EmptyMessage v-if="blockWorkload">
        <h2>{{ $t('classroom.lessons:workload.limit') }}</h2>
      </EmptyMessage>

      <empty-message v-if="prerequisiteError === true">
        <h2>{{ $t('classroom.lessons:prerequisite.error') }}</h2>
        <p
          v-if="prerequisiteData"
          v-html="$t('classroom.lessons:prerequisite.error.lesson', { lesson: prerequisiteData })"
        ></p>
      </empty-message>

      <template v-if="!topicInPeriod(itemActive) && !isCorrection">
        <empty-message v-if="topicIsExpired(itemActive)">
          <h2>{{ $t('classroom.lessons:expired.lesson.title') }}</h2>
          <p v-if="itemActive && itemActive.topicPeriods && itemActive.topicPeriods.schedulePeriod">
            {{
              $t('classroom.lessons:expired.lesson.message', {
                initialDate: formatDate(itemActive.topicPeriods.schedulePeriod.start, 'long'),
                finalDate: formatDate(itemActive.topicPeriods.schedulePeriod.end, 'long'),
              })
            }}
          </p>
        </empty-message>
        <empty-message v-else>
          <h2>{{ $t('classroom.lessons:onboarding.lesson.title') }}</h2>
          <p
            v-if="itemActive && itemActive.topicPeriods && itemActive.topicPeriods.schedulePeriod"
            v-html="
              $t('classroom.lessons:onboarding.lesson.message', {
                name: itemActive.name,
                date: formatDate(itemActive.topicPeriods.schedulePeriod.start, 'long'),
              })
            "
          ></p>
        </empty-message>
      </template>

      <modal
        :active="modalConfirmExitPPTX"
        :cancel="false"
      >
        <div class="modal-confirm">
          <div class="modal-confirm-content">
            <h3
              class="modal-confirm-title"
              v-html="$t('classroom.lessons:modal.confirm.exit.pptx.title')"
            ></h3>
            <p
              class="modal-confirm-description"
              v-html="$t('classroom.lessons:modal.confirm.exit.pptx.message')"
            ></p>
          </div>
          <div class="modal-confirm-footer">
            <div>
              <action
                type="button"
                class="btn-cancel btn-right"
                flat
                :text="$t('global:yes')"
                :dark="accessibility"
                @click="concludePPTX()"
              />
              <action
                type="button"
                flat
                class="btn- btn-left"
                :text="$t('global:no')"
                :dark="accessibility"
                @click="exitPPTX()"
              />
            </div>
          </div>
        </div>
      </modal>

      <ModalResearchWarning
        :active="
          !fetching &&
          researchWarningTopic !== null &&
          allManualModalsIsClosed &&
          !Classroom.onTutorial
        "
        @access="openResearchWarning"
        @close="resetResearchWarning"
      />

      <ModalNextSolution
        v-if="showNextSolutionModal"
        :actual-solution="Classroom.data"
        :next-solution="nextSolution"
        @to-next="pushToNextSolution"
        @close="showNextSolutionModal = false"
      />

      <ModalEndTrail
        v-if="showEndTrailModal && pathUser"
        :path="pathUser"
        @close="pushToDashboard"
      />

      <ModalInformation
        :active="modalProgressBlock"
        closable
        width="580px"
        @close="modalProgressBlock = false"
      >
        <template #title>
          {{ $t('classroom.lessons:modal.block.progress.title', { name: evaluations.title }) }}
        </template>

        <template #description>
          <p class="text-center">{{ $t('classroom.lessons:modal.block.progress.description') }}</p>
        </template>
      </ModalInformation>

      <ModalWorkloadLimit
        :active="modalWorkloadLimit"
        @close="modalWorkloadLimit = false"
      />

      <ModalInformation
        :active="modalAdvanceProgressBlock"
        closable
        small-padding
        width="580px"
        @close="modalAdvanceProgressBlock = false"
      >
        <template #title>
          {{ $t('classroom.lessons:modal.advance.block.progress.title') }}
        </template>

        <template #description>
          <p class="text-center mb-2">
            {{ $t('classroom.lessons:modal.advance.block.progress.description.1') }}
          </p>
          <p class="text-center">
            {{ $t('classroom.lessons:modal.advance.block.progress.description.2') }}
          </p>
        </template>

        <template #actions>
          <Action
            type="button"
            :text="$t('classroom.lessons:modal.advance.block.progress.correction')"
            large
            flat
            @click="modalAdvanceProgressBlock = false"
          />

          <Action
            :text="$t('global:continue')"
            type="button"
            large
            flat
            @click="goNextTopic"
          />
        </template>
      </ModalInformation>

      <ModalInformation
        :active="modalFailedProgressBlock"
        closable
        small-padding
        width="580px"
        @close="modalFailedProgressBlock = false"
      >
        <template #title>
          {{ $t('classroom.lessons:modal.failed.block.progress.title') }}
        </template>

        <template #description>
          <p class="text-center mb-2">
            {{ $t('classroom.lessons:modal.failed.block.progress.description.1') }}
          </p>
          <p class="text-center">
            {{ $t('classroom.lessons:modal.failed.block.progress.description.2') }}
          </p>
        </template>

        <template #actions>
          <span></span>
          <Action
            type="button"
            :text="$t('classroom.lessons:modal.advance.block.progress.correction')"
            large
            flat
            @click="modalFailedProgressBlock = false"
          />
        </template>
      </ModalInformation>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/lessons/styles.scss';
</style>
