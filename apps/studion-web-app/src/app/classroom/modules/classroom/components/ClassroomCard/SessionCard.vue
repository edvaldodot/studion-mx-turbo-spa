<script>
import { getSessionStatus } from '@/support/utils/sessionStatusDefiner'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import CardContentHide from '@/components/general/CardContentHide'
import Icon from '@/components/general/Icon'
import CategoriesChips from '@/components/general/CategoriesChips'
import SessionCardContent from './components/SessionCardContent'
import ProgressMenu from '@/components/general/ProgressMenu'
import CertificateActions from '@/components/general/CertificateActions'

import { progressMixin } from '@/mixins/progressMixin'

const Rating = () => import('@/components/general/Rating')

export default {
  name: 'SessionCard',
  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    CardContentHide,
    Icon,
    Rating,
    SessionCardContent,
    CategoriesChips,
    ProgressMenu,
    CertificateActions,
  },

  mixins: [progressMixin],

  props: {
    certificateHash: String,
    certificateType: [String, Number],
    certificateIssuedAt: {
      type: String,
      default: '',
    },
    courseType: String,
    duration: String,
    description: String,
    endDate: String,
    enrollmentStatus: String,
    extendedDate: String,
    image: String,
    sessionName: String,
    sessionStatus: String,
    sessionStatusType: String,
    sessionType: String,
    startDate: String,
    technicalRequirements: String,
    type: String,
    title: String,
    workload: String,
    allowAccess: {
      type: Boolean,
      default: true,
    },
    courseId: Number,
    ratingAnalysis: {
      type: Object,
      default: null,
    },
    userRating: {
      type: Object,
      default: null,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    availableTools: {
      type: Array,
      default: () => [],
    },
    downloaded: {
      type: [Boolean, String],
      default: false,
    },
    blockedMessage: {
      type: String,
      default: '',
    },
    progress: {
      type: Object,
      default: null,
    },
    currentEnrollment: {
      type: Object,
      default: null
    },
    reenrollmentAllowed: {
      type: Boolean,
      default: false,
    },
    reenrollmentEnabled: {
      type: Boolean,
      default: false,
    },
    enrollmentsList: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      certificateOptions: [
        {
          text: this.$t('solutions.create:form.certificate.option.1'),
          value: 2,
        },
        {
          text: this.$t('solutions.create:form.certificate.option.2'),
          value: 1,
        },
        {
          text: this.$t('solutions.create:form.certificate.option.3'),
          value: 0,
        },
      ],
    }
  },

  computed: {
    imageWidth() {
      return !this.$media.mobile ? 339 : '100%'
    },
    imageHeight() {
      return !this.$media.mobile ? 237 : 230
    },
    actionsWidth() {
      return !this.$media.mobile ? 50 : 'auto'
    },
    actionsHeight() {
      return this.$media.mobile ? 50 : 'auto'
    },
    effectiveEndTime() {
      return this.extendedDate ? this.extendedDate : this.endDate
    },
    currentSessionStatus() {
      return getSessionStatus(this.type, this.startDate, this.effectiveEndTime)
    },
    isCardDisabled() {
      return !this.allowAccess
    },
    courseTypeText() {
      switch (this.courseType) {
        case 'presential':
          return this.$t('solutions.type:presential')
        case 'distance':
          return this.$t('solutions.type:distance')
        case 'online_with_tutoring':
          return this.$t('solutions.type:online_with_tutoring')
        case 'online_self_instructional':
          return this.$t('solutions.type:online_self_instructional')
        case 'hybrid':
          return this.$t('solutions.type:hybrid')
        default:
          return this.$t('solutions.type:without')
      }
    },
    sessionStatusText() {
      let text = this.$tc('global:session') + ' '
      text = text.charAt(0).toUpperCase() + text.slice(1)
      switch (this.currentSessionStatus) {
        case 'waiting':
          text += this.$t('global:solution.status.waiting').toLowerCase()
          break
        case 'inprogress':
          text += this.$t('global:solution.status.em_andamento').toLowerCase()
          break
        case 'closed':
          text = this.$t('global:solution.availability.closed').toLowerCase()
          break
        default:
          text += this.$t(`global:solution.status.${this.currentSessionStatus}`).toLowerCase()
          break
      }
      return text
    },
    availabilityText() {
      if (this.currentSessionStatus === 'waiting' && this.effectiveEndTime === undefined) {
        return this.$t('global:solution.availability.from', {
          startDate: this.formatDate(this.startDate),
        })
      }

      if (
        this.currentSessionStatus === 'waiting' &&
        this.effectiveEndTime !== undefined &&
        this.effectiveEndTime !== null
      ) {
        return this.$t('global:solution.availability.between', {
          startDate: this.formatDate(this.startDate),
          endDate: this.formatDate(this.effectiveEndTime),
        })
      }

      if (
        this.currentSessionStatus === 'inprogress' &&
        this.effectiveEndTime !== undefined &&
        this.effectiveEndTime !== null
      ) {
        return this.$t('global:solution.availability.until', {
          endDate: this.formatDate(this.effectiveEndTime),
        })
      }

      if (this.currentSessionStatus === 'closed') {
        return this.$t('global:solution.availability.between', {
          startDate: this.formatDate(this.startDate),
          endDate: this.formatDate(this.effectiveEndTime),
        })
      }

      return false
    },
    isDownloaded() {
      return this.downloaded ? this.$t('global:download.second') : this.$t('global:download')
    },

    certificationTypeText() {
      const certification = this.certificateOptions.find(option => option.value === this.certificateType)
      return certification && certification.text
    },

    showReenrollmentAction() {
      return this.reenrollmentAllowed && this.reenrollmentEnabled
    }
  },
  methods: {
    downloadCertificate() {
      this.$emit('downloadCertificate', this.certificateHash)
    },

    downloadPreviousCertificate (hash) {
      this.$emit('downloadCertificate', hash)
    },

    toggleContentView() {
      this.$refs.contentHide.openContent()
    },

    reenrollUser() {
      this.$emit('reenroll')
    },
  },
}
</script>

<template>
  <Card
    class="classroom-card session-info"
    :horizontal="!$media.mobile"
    :disabled="isCardDisabled"
    v-bind="$attrs"
    rounded
    dark
  >
    <CardImage
      :src="image"
      :width="imageWidth"
      :height="imageHeight"
      :enable-slot-click="!!certificateHash && !$hideCertificateDownload()"
      use-img
    >
      <span
        v-if="equalsProfile('student')"
        :class="`enrollment-status ${enrollmentStatus}`"
      >
        {{ $t(`global:solution.status.${enrollmentStatus}`) }}
      </span>

      <div
        v-if="certificateHash && !$hideCertificateDownload()"
        class="course-certificate"
      >
        <div class="course-certificate__text">
          <div class="course-certificate__title">
            <strong>{{ $t('global:solution.certificate.title') }}</strong>
          </div>

          <p>{{ $t('global:solution.certificate.description') }}</p>
        </div>

        <CertificateActions
          :is-downloaded="downloaded"
          :certificate-title="sessionName"
          :certificate-issued-at="certificateIssuedAt"
          broken-download-text
          dark
          @download="downloadCertificate"
        />
      </div>
    </CardImage>

    <CardBody>
      <div class="session-card__info">
        <span class="classroom-card__type">{{ courseTypeText }}</span>
        <Rating
          :id="courseId"
          dark
          show-quantity
          resource-type="session"
          :rating-analysis="ratingAnalysis"
          :user-rating="userRating"
        />
      </div>

      <h3 class="classroom-card__title">{{ title }}</h3>

      <template v-if="progress">
        <div class="spacer" />
        <ProgressMenu
          :content="$mx_formatToProgressMenuContent(progress)"
          :extra-content="$mx_formatToProgressMenuExtraContent(progress)"
          min-space
          no-bg
        />
      </template>

      <CategoriesChips
        :categories="categories"
        color="success"
      />
      <p
        class="classroom-card__blocked"
        v-html="blockedMessage"
      ></p>
      <div class="spacer" />
      <div class="classroom-card__session_name-wrapper">
        <h3 class="classroom-card__session_name">{{ sessionName }}</h3>
        <hr class="classroom-card__vertical_bar">
        <p class="classroom-card__status">{{ sessionStatusText }}</p>
      </div>

      <div class="classroom-card__footer">
        <Action
          type="button"
          :text="$t('global:view.details')"
          class="btn-show-details"
          flat
          dark
          @click.stop="toggleContentView"
        />

        <Action
          v-if="showReenrollmentAction"
          :text="$t('classroom.list:session.reenroll')"
          type="button"
          class="btn-show-details reenroll"
          flat
          dark
          @click.stop="reenrollUser"
        />
      </div>
    </CardBody>

    <CardActions
      centered
      no-padding
      :width="actionsWidth"
      :height="actionsHeight"
    >
      <Icon
        v-if="allowAccess"
        name="keyboard_arrow_right"
        class="classroom-card__icon"
      />
      <template v-else>
        <Icon
          v-if="currentSessionStatus === 'waiting'"
          name="calendar-range"
          class="classroom-card__icon"
        />
        <Icon
          v-else
          name="lock-outline"
          class="classroom-card__icon"
        />
      </template>
    </CardActions>

    <template #hidden>
      <CardContentHide ref="contentHide">
        <SessionCardContent
          :certification="certificationTypeText"
          :description="description"
          :duration="duration"
          :technical-requirements="technicalRequirements"
          :available-tools="availableTools"
          :workload="workload"
          :end-date="endDate"
          :start-date="startDate"
          :reenrollment-enabled="reenrollmentEnabled"
          :enrollments-list="enrollmentsList"
          :current-enrollment="currentEnrollment"
          @downloadPreviousCertificate="downloadPreviousCertificate"
        />
      </CardContentHide>
    </template>
  </Card>
</template>

<style lang="scss">
@import 'SessionCard.scss';
</style>
