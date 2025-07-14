<script>
import { mapState } from 'vuex'
import { getSessionStatus } from '@/support/utils/sessionStatusDefiner'
import { format } from 'date-fns'

import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import Ribbon from '@/components/general/Ribbon'

export default {
  name: 'solutionslink',
  components: {
    Action,
    Icon,
    Ribbon
  },
  props: {
    id: {
      type: Number,
      default: null
    },
    isTrail: {
      type: Boolean,
      default: false
    },
    image: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: '#'
    },
    type: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    durationTime: {
      type: String,
      default: null
    },
    workload: {
      type: Object,
      default: null
    },
    startDate: {
      type: String,
      default: null
    },
    endDate: {
      type: String,
      default: null
    },
    extendedDate: {
      type: String,
      default: null
    },
    allowAccessAfterEnd: {
      type: Boolean,
      default: null
    },
    accessNotAllowedStudentFinalStatus: {
      type: Boolean,
      default: null
    },
    progress: {
      type: Number,
      default: 0
    },
    sessionLength: {
      type: Number,
      default: 0
    },
    sessionType: {
      type: String,
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    },
    certificateHash: {
      type: String,
      default: null
    },
    userStatus: {
      type: String,
      default: null
    },
    userStatusType: {
      type: String,
      default: null
    },
    completedSolutionsCount: {
      type: Number,
      default: null
    },
    solutionsCount: {
      type: Number,
      default: null
    },
    daysLeft: {
      type: Number,
      default: null
    },
    prerequisite: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      waiting: false,
      closed: false,
      in_progress: false,
      buttonHover: false,
      format: format
    }
  },
  computed: {
    ...mapState(['Account']),
    duration () {
      let charPattern = /\D/g
      let numberPattern = /\d+/g
      return {
        type: this.durationTime.match(charPattern)[0],
        value: this.durationTime.match(numberPattern)[0]
      }
    },
    effectiveEndTime () {
      return this.extendedDate ? this.extendedDate : this.endDate
    },
    sessionStatus () {
      return this.defineSessionStatus()
    },
    enrollmentStatus () {
      let sessionStatus = this.defineSessionStatus()

      if (sessionStatus === 'waiting') {
        return `global:solution.status.waiting`
      }

      if (sessionStatus === 'closed') {
        return `classroom.list:modal.access.solution.closed`
      }

      return `global:solution.status.${sessionStatus}`
    },
    studentIsApproved () {
      return this.userStatus === 'aprovado'
    },
    studentIsExpired () {
      return this.userStatus === 'expirado'
    },
    studentFinalStatus () {
      return this.userStatus === 'aprovado' || this.userStatus === 'reprovado' || this.userStatus === 'expirado' || this.userStatus === 'desistente'
    },
    studentNotInitiated () {
      return this.userStatus === 'nao_iniciou'
    },
    sessionInProgress () {
      return this.defineSessionStatus() === 'inprogress'
    },
    sessionWaiting () {
      return this.defineSessionStatus() === 'waiting'
    },
    sessionClosed () {
      return this.defineSessionStatus() === 'closed'
    },
    ribbonStatus () {
      if (this.sessionInProgress && this.studentNotInitiated) {
        return `global:solution.status.ready`
      }

      if (this.studentNotInitiated) {
        return `global:solution.status.not.started`
      }

      return `global:solution.status.${this.userStatus}`
    },
    ruleIsClosed () {
      let rulePart = false
      if (this.sessionWaiting) {
        rulePart = false
      }
      if (this.sessionInProgress) {
        if (this.studentFinalStatus && this.accessNotAllowedStudentFinalStatus) {
          rulePart = true
        }
      }
      if (this.sessionClosed) {
        if (!this.allowAccessAfterEnd) {
          rulePart = true
        } else if (this.allowAccessAfterEnd && !this.studentIsApproved) {
          rulePart = true
        } else if (this.studentFinalStatus && this.accessNotAllowedStudentFinalStatus) {
          rulePart = true
        } else if (this.studentIsExpired || !this.studentFinalStatus) {
          rulePart = true
        }
      }
      return this.equalsProfile('student') && rulePart
    },
    rulePostAccess () {
      let rulePart = false
      if (this.sessionClosed &&
        this.studentIsApproved &&
        this.allowAccessAfterEnd &&
        !this.accessNotAllowedStudentFinalStatus
      ) {
        rulePart = true
      }
      return this.equalsProfile('student') && rulePart
    },
    ruleIsWaiting () {
      return this.equalsProfile('student') && this.sessionWaiting
    },
    prerequisiteString () {
      return this.prerequisite.join(' e ')
    }
  },
  methods: {
    defineSessionStatus () {
      return getSessionStatus(this.sessionType, this.startDate, this.effectiveEndTime)
    },
    goToUrl () {
      if (this.isTrail) {
        this.$router.push({ name: 'classroom.trail.solutions.list', params: { id: this.id } })
        return
      }
      if (this.notEqualsProfile('student')) {
        if (this.multiple) {
          this.$emit('open')
          return
        }
        this.$router.push(this.url)
        return
      }
      if (this.sessionWaiting) {
        return
      }
      if (this.sessionInProgress && this.accessNotAllowedStudentFinalStatus && this.studentFinalStatus) {
        return
      }
      if (this.sessionClosed && !this.allowAccessAfterEnd) {
        return
      }
      if (this.sessionClosed && this.allowAccessAfterEnd && !this.studentIsApproved) {
        return
      }
      if (this.sessionClosed && this.accessNotAllowedStudentFinalStatus && this.studentFinalStatus) {
        return
      }
      if (this.multiple) {
        this.$emit('open')
        return
      }
      this.$router.push(this.url)
    },
    downloadCertificate () {
      this.$emit('downloadCertificate')
    },
    calculateTitleFontSize () {
      let fontBase = 2
      let minFontSize = 1.6
      let maxHeight = 50
      this.$refs.title.style.fontSize = fontBase + 'em'
      while (this.$refs.title.scrollHeight > maxHeight) {
        if (fontBase <= minFontSize) return
        fontBase = (fontBase - 0.1).toFixed(1)
        this.$refs.title.style.fontSize = fontBase + 'em'
      }
    },
    mouseEnter () {
      this.buttonHover = !this.buttonHover
    },
    mouseLeave () {
      this.buttonHover = !this.buttonHover
    }
  },
  mounted () {
    !this.$media.mobile && this.calculateTitleFontSize()
  }
}
</script>

<template>
  <div :class="
    [{
      'is-closed': ruleIsClosed,
      'post-access': rulePostAccess,
      'is-waiting': ruleIsWaiting,
      'trail-solutions-link': isTrail
    },
      `is-${userStatus}`,
    ]" class="solutions-link">
    <div class="solutions-link-image-wrapper">
      <ribbon
        :text="$t(ribbonStatus)"
        :color_agent="userStatus"
        v-if="this.equalsProfile('student') && sessionStatus !== 'waiting'"
      ></ribbon>
      <img :src="image" v-if="image" class="solutions-link-image">
      <div class="solutions-link-image-placeholder" v-else>
        <icon name="local_library" wrapper small></icon>
        <span class="text">{{ $t('global:solution.image.placeholder') }}</span>
      </div>
      <div @click="downloadCertificate()" class="solutions-link-certificate" tabindex="0" @mouseenter="mouseEnter" @mouseleave="mouseLeave" v-if="certificateHash">
        <div class="solutions-link-certificate-content">
          <span class="solutions-link-certificate-title">
            <icon name="certificate" small></icon>
            <span class="title-text">{{ $t('global:solution.certificate.title') }}</span>
          </span>
          <p class="solutions-link-certificate-description">{{ $t('global:solution.certificate.description') }}</p>
          <action type="button" :text="$t('global:download')" flat dark class="solutions-link-certificate-btn" :class="{ 'is-hover': buttonHover }"></action>
        </div>
      </div>
    </div>
    <div @click="goToUrl()" class="solutions-link-content" tabindex="0">
      <span class="solutions-link-type">{{type}}</span>
      <h3 class="solutions-link-title" ref="title">{{title}}</h3>
      <template v-if="!$media.mobile">
        <icon name="keyboard_arrow_right" class="solutions-link-icon" v-if="(!ruleIsClosed && !ruleIsWaiting) || rulePostAccess"></icon>
        <icon class="solutions-link-icon" name="lock-outline" v-if="ruleIsClosed && !rulePostAccess && !ruleIsWaiting"></icon>
        <icon name="calendar-range" class="solutions-link-icon" v-if="ruleIsWaiting"></icon>
      </template>
      <span v-if="!isTrail && !prerequisite" :class="[{'is-closed': sessionStatus === 'closed'}, `is-${userStatus}`]" class="solutions-link-status">
        <span class="text" v-if="equalsProfile('student') && (sessionStatus === 'closed' || sessionStatus === 'waiting')">{{ $t(enrollmentStatus) }}</span>
        <span class="text" v-if="notEqualsProfile('student') && sessionLength === 1">{{ $t(`classroom.list:modal.access.solution.${sessionStatus}`) }}</span>
      </span>
      <template v-if="!isTrail">
        <span v-if="prerequisite && prerequisite.length > 0" class="solutions-link-available" v-html="$t('global:solution.availability.prerequisite', { prerequisite: prerequisiteString })"></span>
        <template v-else-if="!prerequisite && sessionLength === 1">
          <span class="solutions-link-available" v-if="sessionStatus === 'waiting' && effectiveEndTime === null">{{ $t('global:solution.availability.from', { 'startDate': format(startDate, 'dd/MM/yyyy') }) }}</span>
          <span class="solutions-link-available" v-if="sessionStatus === 'waiting' && effectiveEndTime !== null">{{ $t('global:solution.availability.between', { 'startDate': format(startDate, 'dd/MM/yyyy'), 'endDate': format(effectiveEndTime, 'dd/MM/yyyy') }) }}</span>
          <span class="solutions-link-available" v-if="sessionStatus === 'inprogress' && effectiveEndTime !== null">{{ $t('global:solution.availability.until', { 'endDate': format(effectiveEndTime, 'dd/MM/yyyy') }) }}</span>
          <span class="solutions-link-available" v-if="sessionStatus === 'closed'">{{ $t('global:solution.availability.between', { 'startDate': format(startDate, 'dd/MM/yyyy'), 'endDate': format(effectiveEndTime, 'dd/MM/yyyy') }) }}</span>
        </template>
        <template v-else-if="!prerequisite">
          <span class="solutions-link-available">{{ $t('global:solution.availability.sessions', { 'sessionLength': sessionLength }) }}</span>
        </template>
      </template>
      <template v-if="isTrail">
        <span class="solutions-link-available">{{ $t('global:solution.trail.availability.until', { endDate: formatDate(endDate), daysLeft }) }}</span>
      </template>
      <div class="solutions-link-info-list">
        <template v-if="!isTrail">
          <div class="solutions-link-info" v-if="workload && workload.value > 0">
            <span class="solutions-link-info-title">{{ $t('global:solution.workload') }}:</span>
            <icon class="solutions-link-info-icon" name="clock"></icon>
            <span class="solutions-link-info-text">{{ $tc(`global:solution.duration.type.${workload.type}`, workload.value, {'num': workload.value}) }}</span>
          </div>
          <div class="solutions-link-info" v-if="duration">
            <span class="solutions-link-info-title">{{ $t('global:solution.duration') }}:</span>
            <icon class="solutions-link-info-icon" name="calendar-range"></icon>
            <span class="solutions-link-info-text">{{ $tc(`global:solution.duration.type.${duration.type}`, duration.value, {'num': duration.value}) }}</span>
          </div>
        </template>
        <template v-if="isTrail">
          <div class="solutions-link-info">
            <span class="solutions-link-info-title">{{ completedSolutionsCount }}</span>
            <span class="solutions-link-info-text">{{ $t('global:solution.trail.solutions.count', { solutionsCount }) }}</span>
          </div>
        </template>
      </div>
    </div>
    <div class="mobile-lock-offer" v-if="$media.mobile && sessionStatus !== 'inprogress' && sessionStatus !== 'waiting' && (userStatus !== 'aprovado' || !allowAccessAfterEnd) && equalsProfile('student')">
      <icon class="lock" name="lock-outline" wrapper></icon>
    </div>
  </div>
</template>

<style lang="scss">
  @import "~@/assets/styles/themes/default/solutionslink.scss";
</style>
