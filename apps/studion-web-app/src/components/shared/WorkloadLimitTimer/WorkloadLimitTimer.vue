<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import AppTimer from '@/components/general/AppTimer'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'ClassTimeTimer',

  components: {
    AppTimer,
    Icon,
  },

  data() {
    return {
      menuEx: false,
    }
  },

  computed: {
    ...mapState({
      classroom: (state) => state.Classroom.data,
      menuExpanded: (state) => state.menuExpanded,
    }),

    workload() {
      return this.classroom && this.classroom.userWorkloadValue
    },
  },

  watch: {
    workload: {
      immediate: true,
      handler() {
        this.setupWorkloadLimit()
      },
    },

    menuExpanded: {
      immediate: true,
      handler(val) {
        if (!val) return (this.menuEx = val)

        // Create a delay bc menu expand/reduce animatinon
        setTimeout(() => {
          this.menuEx = this.menuExpanded
        }, 250)
      },
    },
  },

  created() {
    window.addEventListener('focus', this.setupWorkloadLimit)
  },

  beforeDestroy() {
    window.removeEventListener('focus', this.setupWorkloadLimit)
  },

  methods: {
    ...mapActions(['setWorkdloadLimitStatus']),

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

    closeTimer() {
      this.setWorkdloadLimitStatus({ status: 'allow_consumption', deadlinePause: null })
    },
  },
})
</script>

<template>
  <div
    v-if="
      equalsProfile('student') &&
      workload &&
      ['exceeded_limit_continuously', 'exceeded_day_limit'].includes(workload.status)
    "
    class="class-time-timer"
    :class="{ 'class-time-timer--minimal': !menuEx }"
  >
    <Icon
      :title="$t('classroom.lessons:workload.limit')"
      name="stopwatch"
      size="large"
      wrapper
    />
    <template v-if="menuEx">
      <h3 class="mt-1 mb-1">{{ $t('classroom.lessons:workload.limit') }}</h3>
      <p class="text-color">
        {{
          workload.status === 'exceeded_day_limit'
            ? $t('classroom.lessons:workload.limit.modal.exceeded_day_limit.description')
            : $t('classroom.lessons:workload.limit.description')
        }}
      </p>
    </template>
    <AppTimer
      v-show="workload.status === 'exceeded_limit_continuously' && menuEx"
      ref="timer"
      keep-timer
      @end="closeTimer"
    />
  </div>
</template>

<style lang="scss">
@import 'WorkloadLimitTimer.scss';
</style>
