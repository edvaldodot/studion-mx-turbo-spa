<script>
import sharedDataMixin from './sharedDataMixin'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Icon from '@/components/general/Icon'
import CardContentHide from '@/components/general/CardContentHide'
import CategoriesChips from '@/components/general/CategoriesChips'
import CertificateActions from '@/components/general/CertificateActions'
import Tooltip from '@/components/general/Tooltip'
import TrailCardContent from './components/TrailCardContent'

const Rating = () => '@/components/general/Rating'

export default {
  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    Icon,
    Rating,
    CardContentHide,
    CategoriesChips,
    CertificateActions,
    TrailCardContent,
    Tooltip,
  },

  mixins: [sharedDataMixin],

  props: {
    id: {
      type: Number,
      default: null,
    },

    coursesCount: {
      type: Number,
      default: null,
    },

    image: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      default: null,
    },

    duration: {
      type: String,
      default: null,
    },

    enrollmentDate: {
      type: String,
      default: null,
    },

    studentCount: {
      type: Number,
      default: null,
    },

    ratingAnalysis: {
      type: Object,
      default: () => ({}),
    },

    userRating: {
      type: Object,
      default: () => ({}),
    },

    categories: {
      type: Array,
      default: () => [],
    },

    certificateHash: {
      type: String,
      default: null,
    },

    isCertificateAlreadyDownloaded: {
      type: Boolean,
      default: false,
    },

    certificateIssuedAt: {
      type: String,
      default: '',
    },

    statusAlias: {
      type: String,
      default: '',
    },

    allowAccess: {
      type: Boolean,
      default: true,
    },

    canReenroll: {
      type: Boolean,
      default: false,
    },

    canReenrollByDate: {
      type: Boolean,
      default: true,
    },

    startDate: {
      type: String,
      default: null,
    },

    firstAccess: {
      type: String,
      default: null,
    },

    endDate: {
      type: String,
      default: null,
    },

    enrollmentsList: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    typeText() {
      switch (this.type) {
        case 'presential':
          return this.$t('global:trail') + ' ' + this.$t('solutions.type:presential')
        case 'distance':
          return this.$t('global:trail') + ' ' + this.$t('solutions.type:distance')
        case 'online_with_tutoring':
          return this.$t('global:trail') + ' ' + this.$t('solutions.type:online_with_tutoring')
        case 'online_self_instructional':
          return this.$t('global:trail') + ' ' + this.$t('solutions.type:online_self_instructional')
        case 'blended':
          return this.$t('global:trail') + ' ' + this.$t('solutions.type:blended')
        case 'hybrid':
          return this.$t('global:trail') + ' ' + this.$t('solutions.type:hybrid')
        default:
          return this.$t('global:trail') + ' ' + this.$t('solutions.type:without')
      }
    },

    finalStatus() {
      const status = {
        class: 'nao_iniciou',
        text: 'trails.users:modal.solution.status.notstarted',
      }

      if (this.statusAlias === 'completed' || this.statusAlias === 'aprovado') {
        status.class = 'aprovado'
        status.text = 'global:solution.status.aprovado'
        return status
      }

      if (this.statusAlias === 'em_andamento') {
        status.class = ''
        status.text = 'global:solution.status.em_andamento'
        return status
      }

      if (this.statusAlias === 'expirado') {
        status.class = 'expirado'
        status.text = 'global:solution.status.expirado'
        return status
      }

      if (this.statusAlias === 'reprovado') {
        status.class = 'reprovado'
        status.text = 'global:solution.status.reprovado'
        return status
      }

      if (this.statusAlias === 'realizado') {
        status.class = 'aprovado'
        status.text = 'global:solution.status.realizado'
        return status
      }

      if (this.statusAlias === 'desistente') {
        status.class = 'expirado'
        status.text = 'global:solution.status.desistente'
        return status
      }

      return status
    },

    availabilityText() {
      if (!this.endDate) return ''

      const oneDay = 24 * 60 * 60 * 1000
      const todayDate = new Date()
      const endDate = new Date(this.endDate)
      const diff = endDate - todayDate

      if (diff > 0 && endDate.toDateString() === todayDate.toDateString()) {
        return this.$t('global:solution.trail.availability.close.today')
      }

      if (diff > 0) {
        return this.$t('global:solution.trail.availability.until', {
          endDate: this.formatDate(this.endDate),
          daysLeft: Math.ceil(diff / oneDay),
        })
      }

      return this.$t('global:solution.trail.availability.closed')
    },
    ongoingText() {
      return this.$tc(
        'global:solution.trail.solutions.available',
        this.coursesCount > 1 || this.coursesCount === 0 ? 2 : 1,
        { count: this.coursesCount }
      )
    },
    cardImage() {
      return this.image ? this.image : ''
    },
    downloadButtonText() {
      return this.isCertificateAlreadyDownloaded
        ? this.$t('global:download.second')
        : this.$t('global:download')
    },
    getDateInitial() {
      let dateToProcess = null

      dateToProcess = this.startDate || this.firstAccess;
      if (!dateToProcess) {
        return ''
      }

      const isoFormattedDateString = dateToProcess.replace(' ', 'T')
      const dateObject = new Date(isoFormattedDateString)

      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
      return new Intl.DateTimeFormat('pt-BR', options).format(dateObject).replace(',', '')
    },
    getEndDate() {
      let dateToProcess = null

      if (this.endDate !== null && this.endDate !== undefined && this.endDate !== '') {
        dateToProcess = this.endDate
      } else {
        return ''
      }

      const isoFormattedDateString = dateToProcess.replace(' ', 'T')
      const dateObject = new Date(isoFormattedDateString)

      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
      return new Intl.DateTimeFormat('pt-BR', options).format(dateObject).replace(',', '')
    }
  },

  methods: {
    downloadCertificate(hash) {
      this.$emit(
        'onDownloadCertificate',
        hash ? { hash, isHistory: true } : { hash: this.certificateHash }
      )
    },
    reenrollButton() {
      this.$emit('reenroll')
    },
    toggleContentView() {
      this.$refs.contentHide.openContent()
    },
  },
}
</script>

<template>
  <Card
    dark
    rounded
    class="classroom-card trail-card"
    :disabled="!allowAccess"
    v-bind="$attrs"
    :horizontal="!$media.mobile"
  >
    <card-image
      :src="cardImage"
      :width="imageWidth"
      :height="imageHeight"
      :enable-slot-click="!!certificateHash && !$hideCertificateDownload()"
      use-img
    >
      <span
        v-if="equalsProfile('student') && statusAlias"
        class="enrollment-status"
        :class="[finalStatus.class]"
      >
        {{ $t(finalStatus.text) }}
      </span>

      <div
        v-if="
          $isEnabledFeature('certificate_paths') && certificateHash && !$hideCertificateDownload()
        "
        class="course-certificate"
      >
        <div class="course-certificate__text">
          <div class="course-certificate__title">
            <icon
              name="certificate"
              small
            />
            <strong>{{ $tc('global:certificate') }}</strong>
          </div>
          <p>{{ $t('trails.list:certificate.download.description') }}</p>
        </div>

        <CertificateActions
          :is-downloaded="isCertificateAlreadyDownloaded"
          :certificate-title="name"
          :certificate-issued-at="certificateIssuedAt"
          broken-download-text
          dark
          @download="downloadCertificate"
        />
      </div>
    </card-image>

    <card-body>
      <span class="classroom-card__type">{{ typeText }}</span>
      <h3 class="classroom-card__title">{{ name }}</h3>
      <div class="classroom-card__dates">
        <p>
          <strong v-if="getDateInitial">{{ $t('classroom.list:label-date-initial') }}:</strong>
          <span
            v-if="getDateInitial"
            class="date-icon"
            ><icon
              name="calendar"
              small
            ></icon
          ></span>
          {{ getDateInitial }}
          <strong v-if="getEndDate">{{ $t('classroom.list:label-date-end') }}:</strong>
          <span
            v-if="getEndDate"
            class="date-icon"
            ><icon
              name="calendar"
              small
            ></icon
          ></span>
          {{ getEndDate }}
        </p>
      </div>
      <rating
        :id="id"
        dark
        show-quantity
        resource-type="trail"
        :rating-analysis="ratingAnalysis"
        :user-rating="userRating"
      />
      <categories-chips :categories="categories" />
      <div class="spacer" />
      <p class="classroom-card__availability">{{ availabilityText }}</p>
      <div
        v-if="equalsProfile('student')"
        class="classroom-card__footer"
      >
        <p
          class="classroom-card__footer-text"
          v-html="ongoingText"
        ></p>
        <div class="classroom-card__footer-buttons">
          <Tooltip
            v-if="canReenroll"
            :uppercase="false"
            :width="250"
            medium-font
            shadow
          >
            <template #activator="{ on }">
              <Action
                class="mr-2"
                type="button"
                :disabled="!canReenrollByDate"
                :text="$t('classroom.list:session.reenroll')"
                flat
                dark
                @click.stop="reenrollButton"
                @mouseenter.native="on.mouseenter"
                @mouseleave.native="on.mouseleave"
              ></Action>
            </template>
            <span v-if="!canReenrollByDate">{{
              $t('classroom.list.trails:cant.reenroll.by.date')
            }}</span>
          </Tooltip>
          <Action
            v-if="enrollmentsList.length > 0"
            type="button"
            :text="$t('global:view.details')"
            flat
            dark
            @click.stop="toggleContentView"
          ></Action>
        </div>
      </div>
    </card-body>

    <card-actions
      centered
      no-padding
      :width="actionsWidth"
      :height="actionsHeight"
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
    </card-actions>
    <template #hidden>
      <CardContentHide
        v-if="enrollmentsList.length > 0"
        :key="enrollmentsList.length"
        ref="contentHide"
      >
        <TrailCardContent
          :enrollments-list="enrollmentsList"
          @downloadPreviousCertificate="downloadCertificate"
        />
      </CardContentHide>
    </template>
  </Card>
</template>
<style lang="scss">
@import 'TrailCard.scss';
</style>
