<script>
import { mapActions, mapState } from 'vuex'

import { setupSessionSolutions } from '@/domains/offerings/services/utils.js'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Pagination from '@/components/general/Pagination'
import SessionSelector from '@/app/offerings/components/SessionSelector'

import pageMixin from '../../mixins/pageMixin'
import commonsMixin from '../../mixins/commonsMixin'

export default {
  name: 'OfferingSessionsForm',

  components: {
    Action,
    ActionBar,
    ContentHeader,
    Pagination,
    SessionSelector,
    Modal: () => import('@/components/general/Modal'),
  },

  mixins: [pageMixin, commonsMixin],

  data() {
    return {
      backUrl: { name: 'offerings.list' },
      modalConfirm: false,
      modalLeave: false,
      modalPublishingError: false,
      publishingErrors: [],
      courses: [],
      reopenSession: false,
      showFeedback: true,
    }
  },

  computed: {
    ...mapState(['offerings', 'accessibility']),

    offeringIsReady() {
      return this.offerings.current && this.offerings.current.published
    },

    offeringId() {
      return this.$route.params.id
    },

    isEditing() {
      return this.$route.params.id || false
    },

    enableSessionTypes() {
      const hasConclusionCondition = this.courses.some(
        (course) => course.conclusion_enrollment_condition
      )

      if (hasConclusionCondition) return ['closed']

      return ['individual', 'open', 'closed']
    },

    getMeta() {
      return this.offerings && this.offerings.current && this.offerings.current.meta
    },

    hasNewSessions() {
      const offeringSessions = this.getMeta && this.getMeta.configs
      return offeringSessions && offeringSessions.some((session) => !session.uuid)
    },

    sessionType() {
      return this.getMeta && this.getMeta.sessionType
    },
  },

  created() {
    this.themeDark = !this.$hasBoolBgVariable('--light-generic-background')
    this.setupOfferings()
  },

  mounted() {
    this.$emit('change-theme-footer', { dark: this.themeDark })
    this.$emit('fixed-header', true)
  },

  destroyed() {
    this.$emit('change-theme-footer', { dark: false })
    this.$emit('fixed-header', false)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'setMetaSessionCourses',
      'attemptOfferingRetrieval',
      'attemptOfferingPublishing',
      'attemptSaveOfferingMeta',
      'attemptOfferingCoursesRetrieval',
    ]),

    setupOfferings() {
      const offeringId = this.offeringId

      this.setFetching(true)
      this.attemptOfferingRetrieval({ offeringId })
        .then(() => {
          this.attemptOfferingCoursesRetrieval({ offeringId }).then(({ data }) => {
            this.courses = data.data

            const offeringMeta = this.getMeta
            const allSolutions = offeringMeta.data.courses
            setupSessionSolutions(allSolutions, offeringMeta.configs)
            this.setMetaSessionCourses(offeringMeta.configs)
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * @description Call save meta service
     *
     * @param {Object} settings
     * @param {Boolean} settings.navigateBack
     */
    saveMeta(settings, callback) {
      this.setFetching(true)
      this.attemptSaveOfferingMeta(this.getParams())
        .then(() => {
          if (this.showFeedback) {
            this.setFeedback({ message: this.$t('offerings:feedback.saved') })
          }

          if (settings.navigateBack) this.$router.push(this.backUrl)
        })
        .finally(() => {
          this.reopenSession = false
          this.setFetching(false)
          callback && callback()
        })
    },

    /**
     * @returns {Object}
     */
    getParams() {
      return {
        offeringId: this.offeringId,
        meta: this.setupMeta(),
      }
    },

    /**
     * @description Save meta and publish
     */
    publishOffering() {
      if (!this.canWrite('offerings')) return

      this.setFetching(true)
      this.attemptSaveOfferingMeta(this.getParams()).then(() => {
        this.attemptOfferingPublishing(this.offeringId)
          .then(() => {
            this.$router.push({ name: 'offerings.list' })
          })
          .catch(({ response }) => {
            this.$commons_handlePublishError(response)
          })
          .finally(() => {
            this.setFetching(false)
          })
      })
    },

    /**
     * @returns {Object}
     */
    setupMeta() {
      const sessionMeta = this.getMeta
      const isIndividual = this.sessionType === 'individual'

      sessionMeta.configs.forEach((session) => {
        if (session.enrollmentStartDate) {
          session.enrollmentStartDate = `${session.enrollmentStartDate} 00:00:00`.substring(0, 19)
        }

        if (session.enrollmentEndDate) {
          session.enrollmentEndDate = `${session.enrollmentEndDate} 23:59:59`.substring(0, 19)
        }

        if (!isIndividual) {
          session.courses = session.courses.map((course) => {
            return {
              ...course,
              ...this.getDates(session, course),
            }
          })
        }

        session.courses = (session.courses || []).sort((a, b) => a.position - b.position)
      })

      return sessionMeta
    },

    /**
     * @param {Object} session
     * @param {Object} course
     */
    getDates(session, course) {
      const startDate = course.start_date ? `${course.start_date} 00:00:00` : session.start_date
      const endDate = course.end_date ? `${course.end_date} 23:59:59` : session.end_date

      return {
        start_date: startDate ? startDate.substring(0, 19) : null,
        end_date: endDate ? endDate.substring(0, 19) : null,
      }
    },

    closeModalPublishingError() {
      this.modalPublishingError = false
      this.publishingErrors = []
    },

    openModalConfirm() {
      this.modalConfirm = true
    },

    closeModalConfirm() {
      this.modalConfirm = false
    },

    leave() {
      this.modalConfirm = false
      this.$nextTick(() => {
        this.$router.push(this.backUrl)
      })
    },

    save() {
      this.modalLeave = true
      this.modalConfirm = false
      this.saveMeta({ navigateBack: true })
    },

    saveAndGoToPage(page) {
      let callback = () => {
        page && this.$_goToPage(page)
      }

      this.showFeedback = false

      if (this.canWrite('offerings')) this.saveMeta({ navigateBack: false }, callback)
      else callback()
    },
  },
}
</script>

<template>
  <div class="offerings-create-step-03">
    <ContentHeader
      :title="
        isEditing && offerings.current ? offerings.current.title : $t('offerings:form.header.title')
      "
      light-theme
      fixed
      @back="openModalConfirmBack()"
    >
      <Action
        slot="back"
        :text="$media.mobile ? $t('global:back') : $t('global:back.offerings')"
        type="button"
        class="btn-back text-color"
        icon="keyboard_backspace"
        @click="openModalConfirm()"
      />
      <ActionBar
        slot="actionbar"
        profile
      />
      <template slot="buttons">
        <Action
          :text="$t('global:form.publish')"
          :disabled="!canWrite('offerings')"
          :dark="accessibility"
          type="button"
          flat
          @click="publishOffering"
        />
        <Action
          :text="$t('global:form.save')"
          :disabled="!canWrite('offerings')"
          :dark="accessibility"
          type="button"
          flat
          @click="saveMeta({ navigateBack: false })"
        />
      </template>
    </ContentHeader>

    <div class="section bg-black-50">
      <div class="center">
        <div
          :class="{ 'theme-dark': themeDark }"
          class="offerings-create-header"
        >
          <h2 class="offerings-create-title text-color">
            {{ $t('global:form.step', { num: 3 }) }}
          </h2>
          <p class="offerings-create-description text-color">
            {{ $t('offerings.sessions.edit:header.description') }}
          </p>
        </div>

        <Action
          v-if="!reopenSession && sessionType !== 'individual' && offeringIsReady"
          :text="$t('community.sessions:modal.add.title')"
          :disabled="!canWrite('offerings')"
          type="button"
          fixed-width
          large
          secondary
          @click="reopenSession = true"
        />

        <SessionSelector
          ref="session"
          :enable-types="enableSessionTypes"
          :reopen-session="reopenSession"
        />
      </div>

      <Pagination
        v-if="pageCount"
        class-wrapper="mx-auto my-8"
        :active-first-last="false"
        :active-page="3"
        :custom-next-text="$t('global:form.publish')"
        :disable-custom-next="!canWrite('offerings')"
        :hide-next-button="!canWrite('offerings') && $media.mobile"
        :page-count="pageCount"
        :show-all-pages="Boolean($route.params.id)"
        block-layout
        custom-next
        custom-routing
        disable-scroll
        disable-items-per-page
        disable-manual-page
        float
        @next-page="publishOffering()"
        @previous-page="saveAndGoToPage(2)"
        @go-to-page="saveAndGoToPage($event)"
      />
    </div>

    <Modal
      :active="modalConfirm"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('offerings.create:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('offerings.create:modal.confirm.message') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            v-if="canWrite('offerings')"
            :text="$t('global:save.leave')"
            :dark="accessibility"
            type="button"
            flat
            @click="save()"
          />
          <Action
            :text="$t('global:leave')"
            :dark="accessibility"
            type="button"
            flat
            @click="leave()"
          />
          <Action
            :text="$t('global:cancel')"
            :dark="accessibility"
            type="button"
            flat
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>

    <Modal
      :active="modalPublishingError"
      :cancel="false"
      @close="closeModalPublishingError"
    >
      <div class="modal-confirm">
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('offerings.publishing:modal.confirm.error') }}</h3>
        </div>
        <div class="modal-confirm-description">
          <p class="text-color">{{ $t('offerings.publishing:modal.confirm.error.message') }}</p>
          <ul>
            <li
              v-for="error in publishingErrors"
              :key="error"
            >
              {{ $t(`offerings.publishing:modal.confirm.error.${error}`) }}
            </li>
          </ul>
        </div>
        <div class="modal-confirm-footer">
          <Action
            :text="$t('global:understood')"
            :dark="accessibility"
            type="button"
            flat
            @click="closeModalPublishingError()"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import '~@/app/offerings/styles.scss';
</style>
