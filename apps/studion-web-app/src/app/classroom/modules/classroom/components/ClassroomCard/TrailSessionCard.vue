<script>
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Icon from '@/components/general/Icon'
import ProgressMenu from '@/components/general/ProgressMenu'
import CertificateActions from '@/components/general/CertificateActions'

import { progressMixin } from '@/mixins/progressMixin'
import configControlViewMixin from '@/mixins/configControlView'

const Rating = () => '@/components/general/Rating'

export default {
  components: {
    Card,
    CardBody,
    CardImage,
    CardActions,
    Icon,
    Rating,
    ProgressMenu,
    CertificateActions,
  },

  mixins: [progressMixin, configControlViewMixin],

  props: {
    id: Number,
    name: String,
    image: String,
    prerequisite: String,
    duration: String,
    workload: String,
    enrollmentStatus: String,
    certificateHash: String,
    certificateIssuedAt: {
      type: String,
      default: '',
    },
    ratingAnalysis: { type: Object, default: null },
    userRating: { type: Object, default: null },
    courseId: Number,
    downloaded: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Object,
      default: null
    },
    allowAccess: {
      type: Boolean,
      default: true
    },
    blockedMessage: {
      type: String,
      default: ''
    },
  },
  computed: {
    imageWidth () {
      return !this.$media.mobile ? 339 : '100%'
    },
    imageHeight () {
      return !this.$media.mobile ? 226 : 230
    },
    actionsWidth () {
      return !this.$media.mobile ? 50 : 'auto'
    },
    actionsHeight () {
      return this.$media.mobile ? 50 : 'auto'
    },
    prerequisiteText () {
      return this.prerequisite
        ? this.$t('classroom:trails.solutions.card.prerequisite', { name: this.prerequisite })
        : ''
    },
    isCardDisabled () {
      return !this.allowAccess
    },
    isDownloaded () {
      return this.downloaded ? this.$t('global:download.second') : this.$t('global:download')
    },

    showWorkload() {
      return this.config_showWorkload && this.workload
    },

    showDuration() {
      return this.config_showDuration && this.config_show_session_duration_on_trails && this.duration
    },
  },
  methods: {
    splitDurationTime (date) {
      let charPattern = /\D/g
      let numberPattern = /\d+/g
      return {
        type: date.match(charPattern)[0],
        value: date.match(numberPattern)[0]
      }
    },
    downloadCertificate() {
      this.$emit('downloadCertificate', this.certificateHash)
    },
  }
}
</script>

<template>
  <Card
    dark
    class="classroom-card"
    :horizontal="!$media.mobile"
    :disabled="isCardDisabled"
    v-bind="this.$attrs"
    rounded
  >
    <card-image
      :src="image"
      :width="imageWidth"
      :height="imageHeight"
      :enable-slot-click="!!certificateHash && !$hideCertificateDownload()"
      use-img
    >
      <span
          v-if="this.equalsProfile('student')"
          :class="`enrollment-status ${enrollmentStatus}`"
      >
        {{ $t(`global:solution.status.${enrollmentStatus}`) }}
      </span>

      <div v-if="certificateHash && !$hideCertificateDownload()" class="course-certificate">
        <div class="course-certificate__text">
          <div class="course-certificate__title">
            <icon name="certificate" small/>
            <strong>{{ $t('global:solution.certificate.title') }}</strong>
          </div>
          <p>{{ $t('global:solution.certificate.description') }}</p>
        </div>

        <CertificateActions
          :is-downloaded="downloaded"
          :certificate-title="name"
          :certificate-issued-at="certificateIssuedAt"
          broken-download-text
          dark
          @download="downloadCertificate"
        />
      </div>
    </card-image>

    <card-body class="bg-black-100">
      <rating
        :id="courseId"
        dark
        show-quantity
        resource-type="session"
        :rating-analysis="ratingAnalysis"
        :user-rating="userRating"
      />
      <h3 class="classroom-card__title text-color">{{ name }}</h3>
      <p class="classroom-card__prerequisite text-color" v-html="prerequisiteText"></p>

      <template v-if="progress">
        <div class="spacer" />
        <ProgressMenu
          class-text="text-color"
          :content="$mx_formatToProgressMenuContent(progress)"
          :extra-content="$mx_formatToProgressMenuExtraContent(progress)"
          min-space
          no-bg
        />
      </template>

      <div class="spacer" />
      <p class="classroom-card__blocked text-color" v-html="blockedMessage"></p>

      <div class="classroom-card__footer">
        <div class="course-data" :class="{ 'corda-data--column': $media.mobile }">
          <div class="course-data__info text-color" v-if="showWorkload">
            <strong>{{ $t('global:solution.workload') }}: <icon name="clock" /></strong>
            <span>{{ formatVisualTime(splitDurationTime(workload)) }}</span>
          </div>

          <div class="course-data__info text-color" v-if="showDuration">
            <strong>{{ $t('global:solution.duration') }}: <icon name="calendar-range" /></strong>
            <span>{{ getDurationText(duration) }}</span>
          </div>
        </div>
      </div>
    </card-body>

    <card-actions
      centered
      no-padding
      :width="actionsWidth"
      :height="actionsHeight"
      class="bg-black-100"
    >
      <icon
        v-if="allowAccess"
        name="keyboard_arrow_right"
        class="classroom-card__icon"
      />
      <icon
        v-else
        name="lock-outline"
        class="classroom-card__icon"
      />
      <!-- <icon v-if="currentSessionStatus === 'waiting'" name="calendar-range" class="classroom-card__icon" /> -->
      <!-- <icon v-if="currentSessionStatus === 'closed'" name="lock-outline" class="classroom-card__icon" /> -->
    </card-actions>

  </Card>
</template>