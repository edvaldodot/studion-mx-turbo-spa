<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { defineComponent } from 'vue'
import config from '@/config'
import HeaderClassroom from '@/app/classroom/components/HeaderClassroom'
import ModalInformation from '@/components/general/ModalInformation'
import ModalUserProgress from '@/app/classroom/components/ModalUserProgress'

import ModalTutorial from '../../tutorial/components/ModalTutorial'
import FacialRecognitionModal from '../components/FacialRecognitionModal'
import FacialRecognitionWarning from '../components/FacialRecognitionWarning'
import FloatingNotes from '../components/FloatingNotes/FloatingNotes.vue'

const { PORTAL_CONFIGS } = config

const ModalCardAnnouncement = () =>
  import('@/app/classroom/modules/panel/components/ModalCardAnnouncement')
const ModalConclusionFeedback = () =>
  import('@/app/classroom/modules/lessons/pages/Lessons/components/ModalConclusionFeedback')

export default defineComponent({
  name: 'ClassroomView',

  components: {
    HeaderClassroom,
    FacialRecognitionModal,
    ModalCardAnnouncement,
    ModalConclusionFeedback,
    ModalInformation,
    ModalUserProgress,
    ModalTutorial,
    FacialRecognitionWarning,
    FloatingNotes,
  },

  beforeRouteUpdate(to, from, next) {
    this.fromRouteName = from.name
    const trail_id = this.Classroom.data.path && this.Classroom.data.path.id
    if (from.params.session_uuid !== to.params.session_uuid) {
      this.isClassroomLoaded = false
    }
    if (to.name.includes('classroom')) {
      to.params.trail_id = trail_id || from.params.trail_id
      to.params.offering_id = from.params.offering_id
    }
    next()
  },

  data() {
    return {
      fromRouteName: '',
      nextScheduleBlockTime: null,
      isClassroomLoaded: false,
      tabLinks: [],
      customClasses: null,
      headerIsThick: true,
      hideHeader: null,
      hideBottomHeader: null,
      sessionData: {},
      recursiveCheck: null,
      showConclusionFeedback: false,
      progressModal: false,
      modalAccessOutOfPeriod: false,
      alreadyFinishedClass: false,
      tutorialActive: false,
    }
  },

  computed: {
    ...mapState(['Classroom']),
    ...mapGetters(['isFullscreen', 'isFetching', 'isClassroomFinalStatus', 'isIntegrationAppMode']),

    getEmbed() {
      return this.equalsProfile('student') ? 'rating_analysis,user_rating' : 'rating_analysis'
    },

    mainContainerClasses() {
      return {
        ...this.customClasses,
        'is-mobile-fullscreen': this.$media.mobile && this.isFullscreen,
        'has-biometrics': this.Classroom.facialRecognition.activeTool,
      }
    },

    sessionUuid() {
      return this.$route.params.session_uuid
    },

    classroomParams() {
      return {
        sessionUuid: this.sessionUuid,
        params: {
          embed: this.getEmbed,
        },
      }
    },
  },

  watch: {
    $route(to, from) {
      this.refreshEnrollmentStatus()

      if (from.name.includes('classroom') && to.name.includes('classroom.assessments')) {
        this.getClassroomNotifications()
      }

      this.progressModal = false
    },
  },

  created() {
    this.attemptClassroomData()
  },

  beforeDestroy() {
    this.closeFullscreen()
    this.resizeMenu(true)
    this.attemptClearClassroomNotifications()
    clearTimeout(this.recursiveCheck)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptClassroomResourcesRetrieval',
      'attemptGetClassroomNotifications',
      'attemptClearClassroomNotifications',
      'attemptGetClassroomToolsHasItems',
      'fetchStudentProgress',
      'closeFullscreen',
      'resizeMenu',
      'closeModalReadMoreAnnouncement',
    ]),

    getClassroomNotifications() {
      if (!this.isClassroomLoaded) return
      if (!this.$isEnabledFeature('classroom_notification')) return
      if (!this.$route.params.session_uuid) return

      const payload = {
        classroomId: this.Classroom.data.id,
      }

      if (this.equalsProfile('student')) {
        payload.enrollmentId = this.Classroom.data.enrollment.id
      }

      this.attemptGetClassroomNotifications(payload).then(() => {
        this.updateMenu()
      })
    },

    footer(obj) {
      this.$emit('change-theme-footer', obj)
    },

    changeHeader({ tabLinks, customClasses, hideHeader }) {
      this.tabLinks = tabLinks || []
      this.customClasses = customClasses
      this.hideHeader = hideHeader || false
    },

    handleAttemptClassroomCatch(response) {
      if (!response) return

      const message = response.data.message
      this.setFetching(false)

      if (message === 'session_out_of_access_period') {
        this.modalAccessOutOfPeriod = true
        return
      }

      if (message === 'current_user_not_in_team_session') {
        this.$router.push({ name: 'classroom.index' })
        this.setFeedback({
          message: this.$t('classroom.access:feedback.current_user_not_in_team_session'),
        })
        return
      }

      if (message === 'session_is_blocked' || message === 'session_is_not_granted_access') {
        this.$router.push({ name: 'classroom.blocked', params: { session_uuid: this.sessionUuid } })
        return
      }

      if (message !== 'meta_status_not_completed' && message !== 'rule_access_not_passed') {
        this.$router.push({ name: 'classroom.index' })
        this.setFeedback({ message: this.$t('classroom.access:feedback.error'), type: 'error' })
        return
      }
    },

    closeModalAccessNotAllowed() {
      this.$store.dispatch('setClassroomFinalAccessStatus', false)
      this.$router.push({ name: 'classroom.index' })
    },

    updateMenu() {
      this.$emit('updateMenu', this.sessionData)
    },

    readEvaluation() {
      this.updateMenu()
    },

    attemptClassroomData(preventRefreshProgress = false) {
      this.setFetching(true)
      this.attemptClassroomResourcesRetrieval(this.classroomParams)
        .then(async ({ data }) => {
          this.isClassroomLoaded = true

          if (this.equalsProfile('student')) {
            if (
              data.enrollment.certificateHash &&
              !this.fromRouteName.includes('classroom') &&
              this.$route.name.includes('dashboard')
            ) {
              this.openConclusionFeedback()
              this.alreadyFinishedClass = true
            }

            const { data: toolsItems } = await this.attemptGetClassroomToolsHasItems(
              this.sessionUuid
            )

            for (const tool of data.toolsTypes) {
              switch (tool.alias) {
                case 'forum':
                  tool.hasItem = toolsItems.has_forum
                  break
                case 'chat':
                  tool.hasItem = toolsItems.has_chat
                  break
                case 'poll':
                  tool.hasItem = toolsItems.has_poll
                  break
                case 'conference':
                  tool.hasItem = toolsItems.has_conference
                  break
                case 'attendance':
                  tool.hasItem = toolsItems.has_attendance
                  break
                case 'messages':
                  tool.hasItem = toolsItems.has_messages
                  break
                case 'preProjectExamination':
                  tool.hasItem = toolsItems.has_pre_project_examination
                  break
                case 'sessionLibrary':
                  tool.hasItem = toolsItems.has_library
                  break
                default:
                  tool.hasItem = true
              }
            }

            if (!toolsItems.has_examination && !toolsItems.has_competency) {
              data.toolsTypes.push({
                alias: 'assessments',
                disabled: true,
              })
            }
          }

          this.sessionData = { tools: data.toolsTypes }
          if (data.path) this.sessionData.trailId = data.path.id

          this.updateMenu()

          if (this.equalsProfile('student')) {
            if (data.uuid && !preventRefreshProgress) {
              this.setFetching(true)
              this.fetchStudentProgress(data.uuid).finally(() => {
                this.setFetching(false)
              })
            }
            if (this.$isEnabledFeature('session_block') && data.nextScheduleBlockTime) {
              this.checkClassroomBlock(data.nextScheduleBlockTime)
            }
          }
        })
        .catch(({ response }) => {
          this.handleAttemptClassroomCatch(response)
        })
        .finally(() => {
          this.getClassroomNotifications()
          this.setFetching(false)
        })
    },

    refreshEnrollmentStatus(forceUpdateInfo = false) {
      if (
        forceUpdateInfo ||
        this.$route.name === 'classroom.panel.dashboard' ||
        this.$route.name === 'classroom.lessons.course' ||
        this.$route.name === 'classroom.forum.discussion'
      ) {
        this.attemptClassroomData(forceUpdateInfo)
      }
    },
    updateHeaderBottomVisibility(hidden = false) {
      this.hideBottomHeader = hidden
    },
    updateHeaderThickness(thick = true) {
      this.headerIsThick = thick
    },
    formatNumber(num) {
      return num.toString().padStart(2, '0')
    },
    checkClassroomBlock(nextScheduleBlockTime) {
      if (!this.sessionUuid) return

      if (!this.nextScheduleBlockTime) {
        this.nextScheduleBlockTime = nextScheduleBlockTime.slice(0, 5)
      }

      const actualDate = new Date()

      const actualHour = `${this.formatNumber(actualDate.getHours())}:${this.formatNumber(
        actualDate.getMinutes()
      )}`

      if (actualHour === this.nextScheduleBlockTime) {
        this.$router.push({ name: 'classroom.blocked', params: { session_uuid: this.sessionUuid } })
        return
      }

      this.recursiveCheck = setTimeout(() => {
        this.checkClassroomBlock(this.nextScheduleBlockTime)
      }, 2000)
    },

    redirectToDashboard() {
      this.$router.push({
        name: 'classroom.panel.dashboard',
      })
    },

    openConclusionFeedback() {
      if (this.isStudent()) {
        if (PORTAL_CONFIGS) {
          this.setFetching(true)
          this.attemptClassroomResourcesRetrieval(this.classroomParams)
            .then(({ data }) => {
              if (data.enrollment.certificateHash) {
                this.showConclusionFeedback = true
              } else {
                this.redirectToDashboard()
              }
            })
            .finally(() => this.setFetching(false))

          return
        }

        this.showConclusionFeedback = true
        return
      }

      this.redirectToDashboard()
    },

    handleCloseConclusionModal() {
      this.redirectToDashboard()

      if (this.isStudent()) {
        this.showConclusionFeedback = false
      }
    },

    /**
     * Method to determine the dynamic key for the RouterView component.
     *
     * @method
     * @returns {string} The value of the `key` for the RouterView component.
     *
     * This method evaluates the current route's name and returns either 'examination'
     * or 'lessons' as the key, depending on the current route.
     * Forcing components to re-render when key value changes.
     */
    getRouterViewKey() {
      return this.$route.name === 'classroom.assessments.evaluation.access'
        ? 'examination'
        : 'lessons'
    },
  },
})
</script>

<template>
  <div
    class="main-content"
    :class="mainContainerClasses"
  >
    <HeaderClassroom
      v-if="isClassroomLoaded && !hideHeader"
      :hide-bottom="hideBottomHeader"
      :is-thick="headerIsThick"
      :tab-links="tabLinks"
      @openProgressModal="progressModal = true"
    />
    <RouterView
      v-if="isClassroomLoaded"
      :key="getRouterViewKey()"
      @change-header="changeHeader"
      @change-theme-footer="footer"
      @update-header-thickness="updateHeaderThickness"
      @update-header-bottom-visibility="updateHeaderBottomVisibility"
      @read:evaluation="readEvaluation"
      @update-session-info="refreshEnrollmentStatus"
      @show:conclusion="openConclusionFeedback"
      @openProgressModal="progressModal = true"
      @start-tutorial="tutorialActive = true"
    />

    <ModalInformation
      v-if="Classroom.modalReadMoreAnnouncement"
      width="1100px"
      back
      minimal-padding
      is-page
      closable
      @close="closeModalReadMoreAnnouncement"
    >
      <template #description>
        <ModalCardAnnouncement
          v-if="Classroom.announcementToRead"
          :user="Classroom.announcementToRead.author"
          :title="Classroom.announcementToRead.title"
          :description="Classroom.announcementToRead.content"
          :archive="!Classroom.announcementToRead.fixed"
          :start-date="Classroom.announcementToRead.availability.startTime"
          :end-date="Classroom.announcementToRead.availability.endTime"
        />
      </template>
    </ModalInformation>

    <ModalTutorial
      v-if="tutorialActive"
      @close="tutorialActive = false"
    />

    <template v-if="$isEnabledFeature('biometrics') && equalsProfile('student')">
      <FacialRecognitionModal
        v-if="Classroom.facialRecognition.active"
        :classroom-loaded="isClassroomLoaded"
        @close="!isClassroomLoaded && attemptClassroomData()"
      />
      <FacialRecognitionWarning />
    </template>

    <FloatingNotes />

    <ModalInformation
      :active="!!isClassroomFinalStatus"
      closable
      width="580px"
      @close="closeModalAccessNotAllowed"
    >
      <template #title>
        {{ $t('classroom.lessons:modal.block.access.title') }}
      </template>

      <template #description>
        <p
          class="text-center"
          v-html="
            $t('classroom.lessons:modal.block.access.description', {
              status: isClassroomFinalStatus,
            })
          "
        ></p>
      </template>
    </ModalInformation>

    <ModalInformation
      :active="modalAccessOutOfPeriod"
      closable
      width="580px"
      @close="closeModalAccessNotAllowed"
    >
      <template #title>
        {{ $t('classroom.lessons:out.of.access.period.lesson.title') }}
      </template>

      <template #description>
        <p class="text-center">
          {{ $t('classroom.lessons:out.of.access.period.lesson.message') }}
        </p>
      </template>
    </ModalInformation>

    <ModalConclusionFeedback
      v-if="showConclusionFeedback"
      :current-solution="Classroom.data"
      :already-finished="alreadyFinishedClass"
      @close="handleCloseConclusionModal"
    />

    <ModalUserProgress
      v-if="progressModal"
      @close="progressModal = false"
    />
  </div>
</template>

<style lang="scss">
@import '../styles.scss';
</style>
