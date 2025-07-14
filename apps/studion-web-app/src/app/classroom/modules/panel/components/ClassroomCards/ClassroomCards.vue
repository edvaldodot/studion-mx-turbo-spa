<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import AppTimer from '@/components/general/AppTimer'
import InfoActionCard from './components/InfoActionCard'
import { certificateMixin } from '@/mixins/certificateMixin'

export default defineComponent({
  name: 'ClassroomCards',

  components: {
    AppTimer,
    InfoActionCard,
  },

  mixins: [certificateMixin],

  computed: {
    ...mapState({
      Classroom: (state) => state.Classroom.data,
    }),

    hasCertificate() {
      return !!(this.Classroom.enrollment && this.Classroom.enrollment.certificateHash)
    },

    isFinalStatus() {
      return this.Classroom.enrollment && this.Classroom.enrollment.statusTypeAlias === 'final'
    },

    isApproved() {
      return (
        this.Classroom.enrollment &&
        (this.Classroom.enrollment.statusAlias === 'aprovado' ||
          this.Classroom.enrollment.statusAlias === 'realizado')
      )
    },

    isDisapproved() {
      return this.Classroom.enrollment && this.Classroom.enrollment.statusAlias === 'reprovado'
    },

    classroomFinished() {
      return (
        this.Classroom.availability.final &&
        new Date(this.Classroom.availability.final) < new Date()
      )
    },

    antecipatedAccess() {
      return (
        this.Classroom.availability.initial &&
        new Date(this.Classroom.availability.initial) > new Date()
      )
    },

    hasAvailableForums() {
      return this.Classroom.enrollment && this.Classroom.enrollment.hasAvailableForums
    },

    workloadLimit() {
      if (!this.$isEnabledFeature('workload_limit')) return false
      return (
        this.workload &&
        ['exceeded_limit_continuously', 'exceeded_day_limit'].includes(this.workload.status)
      )
    },

    workload() {
      return this.Classroom.userWorkloadValue
    },
  },

  created() {
    this.setupWorkloadLimit()
    window.addEventListener('focus', this.setupWorkloadLimit)
  },

  beforeDestroy() {
    window.removeEventListener('focus', this.setupWorkloadLimit)
  },

  methods: {
    ...mapActions(['attemptMyselfDownloadCertificate', 'setWorkdloadLimitStatus']),
    downloadCertificate() {
      this.$downloadCertificate(
        this.attemptMyselfDownloadCertificate,
        this.Classroom.enrollment.certificateHash
      )
    },

    closeTimer() {
      this.setWorkdloadLimitStatus({ status: 'allow_consumption', deadlinePause: null })
    },

    /**
     * @description Setup timer for workload limit if FF is enabled
     * @returns void
     */
    setupWorkloadLimit() {
      if (
        this.$isEnabledFeature('workload_limit') &&
        this.workload &&
        this.workload.deadlinePause
      ) {
        const pauseInSeconds =
          (new Date(this.workload.deadlinePause || 0).getTime() - new Date().getTime()) / 1000

        this.$nextTick(() => {
          if (pauseInSeconds <= 0) return this.closeTimer()
          this.$refs.timer.setTime(pauseInSeconds)
          this.$refs.timer.startTimer()
        })
      }
    },

    getCertificateDate() {
      const date = new Date(this.Classroom.enrollment.certificateIssuedAt)
      return {
        issueYear: date.getUTCFullYear(),
        issueMonth: date.getUTCMonth() + 1,
      }
    },
  },
})
</script>

<template>
  <div class="classroom-cards">
    <h3 class="section-title">{{ $t('classroom.panel.dashboard:lessons.description.upper') }}</h3>
    <div class="classroom-cards__cards">
      <InfoActionCard
        v-if="
          (!isFinalStatus && !classroomFinished && !antecipatedAccess && !workloadLimit) ||
          equalsProfile('admin')
        "
        primary
        icon="import_contacts"
        :title="$t('classrom.panel.class.cards:available.lessons')"
        :description="$t('classrom.panel.class.cards:available.lessons.description')"
        :button-text="$t('classrom.panel.class.cards:available.lessons.access')"
        @clickBtn="$router.push({ name: 'classroom.lessons.course' })"
      />
      <InfoActionCard
        v-if="!isFinalStatus && !classroomFinished && antecipatedAccess && equalsProfile('student')"
        disabled
        icon="import_contacts"
        :title="$t('classrom.panel.class.cards:antecipated.access')"
        :description="$t('classrom.panel.class.cards:antecipated.access.2')"
      />
      <InfoActionCard
        v-if="!isApproved && isFinalStatus && equalsProfile('student')"
        disabled
        icon="import_contacts"
        :title="$t('classrom.panel.class.cards:unavailable.class')"
        :description="
          $t(`classrom.panel.class.cards:unavailable.class.${isDisapproved ? '3' : '2'}`)
        "
      />
      <InfoActionCard
        v-if="isApproved && !hasCertificate"
        secondary
        icon="school-hat"
        :title="$t('classrom.panel.class.cards:approved.no.cert')"
        :description="$t('classrom.panel.class.cards:approved.no.cert.2')"
      />
      <InfoActionCard
        v-if="
          isApproved && hasCertificate && equalsProfile('student') && !$hideCertificateDownload()
        "
        secondary
        icon="school-hat"
        class="certificate-card"
        :title="$tc('global:certificate', 1)"
        :description="$t('classrom.panel.class.cards:ready.for.download')"
        :button-text="$t('global:download')"
        button-icon="certificate"
        :certificate-title="Classroom.course.name"
        :certificate-date="getCertificateDate()"
        @clickBtn="downloadCertificate()"
      />
      <InfoActionCard
        v-if="hasAvailableForums"
        icon="forum"
        :title="$t('classrom.panel.class.cards:new.forum.available')"
        :button-text="$t('global:access')"
        @clickBtn="$router.push({ name: 'classroom.forum' })"
      />
      <InfoActionCard
        v-if="isFinalStatus && classroomFinished && !hasCertificate"
        disabled
        icon="import_contacts"
        :title="$t('global:solution.availability.closed')"
        :description="
          $t('classrom.panel.class.cards:available.until', {
            dateInitial: formatDate(Classroom.availability.initial),
            dateFinal: formatDate(Classroom.availability.final),
          })
        "
      />
      <InfoActionCard
        v-if="equalsProfile('student') && Classroom.note && Classroom.note.id && !$isUserImpersonated()"
        icon="notes"
        :title="$t('notes.classroom:card.title')"
        :button-text="$t('global:access')"
        @clickBtn="$router.push({ name: 'classroom.notes' })"
      />
      <InfoActionCard
        v-if="workloadLimit && equalsProfile('student') && !isApproved"
        disabled
        icon="stopwatch"
        :title="$t('classroom.lessons:workload.limit')"
        :description="$t(`classroom.lessons:workload.limit.modal.${workload.status}.title`)"
      >
        <template #actions>
          <p class="actions-message">
            {{
              workload.status === 'exceeded_day_limit'
                ? $t('classroom.lessons:workload.limit.modal.exceeded_day_limit.description')
                : $t('classroom.lessons:workload.limit.description')
            }}
            <AppTimer
              v-show="workload.status === 'exceeded_limit_continuously'"
              ref="timer"
              @end="closeTimer"
            />
          </p>
        </template>
      </InfoActionCard>
    </div>
  </div>
</template>

<style lang="scss">
@import './ClassroomCards.scss';
</style>
