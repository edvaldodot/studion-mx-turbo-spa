<script>
import { defineComponent } from 'vue'
import AnchorLinks from '@/components/general/AnchorLinks'
import Action from '@/components/general/Action'
import AppTimer from '@/components/general/AppTimer'
import SidebarBlock from '@/components/general/SidebarBlock'
import ModalInformation from '@/components/general/ModalInformation'

export default defineComponent({
  name: 'LateralExamination',

  components: {
    Action,
    SidebarBlock,
    AnchorLinks,
    AppTimer,
    ModalInformation,
  },

  props: {
    links: {
      type: Array,
      default: () => [],
    },
    checkedIds: {
      type: Array,
      default: () => [],
    },
    anchorPrefix: {
      type: String,
      default: 'qid_',
    },
    timerData: {
      type: Number,
      default: null,
    },
    notStartedExamination: {
      type: Boolean,
      default: false,
    },
    isDraftSaving: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: null,
    },
    endTimeline: {
      type: String,
      default: null,
    },
    hasPrerequisite: {
      type: Object,
      default: () => ({}),
    },
    nextTopic: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      fixLateralBlock: false,
      modalEndTime: false,
      mutableTimerData: this.timerData,
      intervalId: null,
      endTimelineEnding: false,
      hasModalEndTime: false,
      time: null,
    }
  },

  watch: {
    timerData: {
      handler(val) {
        this.$nextTick(() => {
          if (val) {
            this.time = val
            if (this.endTimeline && this.timerData && this.status === 'started') {
              const now = new Date()
              const endDate = new Date(this.endTimeline)
              const difference = (endDate - now) / 1000
              if (val > difference) {
                this.time = difference
                this.hasModalEndTime = true
              }
            }
            this.$refs.timer.setTime(this.time)
            this.$refs.timer.startTimer()
          }
        })
      },
    },
  },

  created() {
    this.checkTimeRemaining()
  },

  mounted() {
    window.addEventListener('scroll', this.updateScrollEffects)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.updateScrollEffects)
    if (this.intervalId) clearInterval(this.intervalId)
  },

  methods: {
    updateScrollEffects() {
      this.fixLateralBlock = window.scrollY > (this.isFullscreen ? 120 : 320)
    },

    endExamination() {
      this.$refs.timer.stopTimer()
      if (!this.hasModalEndTime) {
        this.modalEndTime = true
        this.mutableTimerData = null
        this.$emit('end')
      }
    },
    checkTimeRemaining() {
      if (!this.isStudent() || this.$route.params.isCorrection) return

      if (!this.endTimeline) return
      const now = new Date()
      const endDate = new Date(this.endTimeline)
      const difference = endDate - now

      if (difference <= 0) {
        this.handleEndOfTime()
        return
      }

      if (this.intervalId) clearInterval(this.intervalId)

      let interval
      if (difference >= 2 * 24 * 60 * 60 * 1000) {
        interval = 24 * 60 * 60 * 1000
      } else if (difference >= 24 * 60 * 60 * 1000) {
        interval = 60 * 60 * 1000
      } else if (difference >= 2 * 60 * 60 * 1000) {
        interval = 30 * 60 * 1000
      } else if (difference >= 60 * 60 * 1000) {
        interval = 60 * 1000
      } else {
        interval = 2 * 1000
      }

      this.intervalId = setInterval(this.checkTimeRemaining, interval)
    },

    handleEndOfTime() {
      this.$emit('submitDraft')
      this.endTimelineEnding = true
      clearInterval(this.intervalId)
    },
    backToClass() {
      if (!this.hasPrerequisite && this.nextTopic) {
        const paramsType = this.$route.params.type_id
        if (this.nextTopic.id === paramsType) {
          this.$router.push({
            name: 'classroom.panel',
          })
        } else {
          this.$router.push({
            name: 'classroom.lessons.course.type',
            params: {
              session_uuid: this.$route.params.session_uuid,
              type: this.nextTopic.type,
              type_id: this.nextTopic.id,
            },
          })
        }
      } else {
        this.$router.push({
          name: 'classroom.panel',
        })
      }
    },
  },
})
</script>

<template>
  <div
    ref="component"
    class="examination__lateral"
    :test-id="$testId('lateral-examination')"
  >
    <div
      class="lateral__block"
      :class="{ fixed: fixLateralBlock }"
    >
      <slot name="top"></slot>

      <SidebarBlock v-if="!notStartedExamination">
        <AnchorLinks
          :links="links"
          :checked-ids="checkedIds"
          :prefix="anchorPrefix"
          :count-label="$t('classroom:answered.questions')"
          :checked-label="$tc('global:answered', 1)"
          :unchecked-label="$tc('global:not.answered', 1)"
        />
      </SidebarBlock>

      <SidebarBlock
        v-if="timerData && status === 'started'"
        class="mt-5"
      >
        <AppTimer
          ref="timer"
          :title="$t('classroom.lessons:timer.title')"
          @end="endExamination"
        />

        <div class="text-center">
          <Action
            :text="$t('classroom.assessments.evaluation:question.submit.student')"
            :disabled="isDraftSaving"
            type="button"
            class="mt-2"
            primary
            large
            @click="$emit('send')"
          />
        </div>
      </SidebarBlock>

      <SidebarBlock
        v-if="endTimeline"
        class="mt-5"
      >
        <div class="timeline-lessons">
          <p>{{ $t('classroom.lessons:schedule.timeout.warning') }}</p>
          <span>{{ formatDate(endTimeline, 'long').replace(', ', $t('global:date.at')) }}</span>
        </div>
      </SidebarBlock>

      <ModalInformation
        :active="modalEndTime"
        width="580px"
      >
        <template #title>
          {{ $t('classroom.lessons:timer.modal.title') }}
        </template>

        <template #description>
          <p class="text-center">
            {{ $t('classroom.lessons:timer.modal.description') }}
          </p>
        </template>

        <template #content>
          <div class="text-center">
            <Action
              :text="$t('global:continue')"
              class="mt-4"
              type="button"
              secondary
              large
              @click="modalEndTime = false"
            />
          </div>
        </template>
      </ModalInformation>

      <ModalInformation
        :active="isStudent() && endTimelineEnding"
        width="580px"
      >
        <template #title>
          {{ $t('classroom.lessons:timeline.modal.title') }}
        </template>

        <template #description>
          <p class="text-center">
            {{ $t('classroom.lessons:timeline.modal.description') }}
          </p>
        </template>

        <template #content>
          <div class="text-center">
            <Action
              :text="$t('classroom.lessons:timeline.modal.button')"
              class="mt-4"
              type="button"
              secondary
              large
              @click="backToClass()"
            />
          </div>
        </template>
      </ModalInformation>

      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.timeline-lessons {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  p {
    font-size: 14px;
    color: var(--text-color);
    font-weight: 700;
  }

  span {
    display: flex;
    justify-content: center;
    font-size: 20px;
    color: var(--primary-color);
    margin-top: 10px;
    font-weight: 700;
  }
}
</style>
