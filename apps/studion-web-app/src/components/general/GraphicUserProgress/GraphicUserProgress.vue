<script>
import { progressMixin } from '@/mixins/progressMixin'

export default {
  name: 'GraphicUserProgress',

  mixins: [progressMixin],

  props: {
    status: {
      type: String,
      default: 'em_andamento',
    },
    total: {
      type: Number,
      default: 0,
    },
    totalOut: {
      type: Number,
      default: 0,
    },
    totalIn: {
      type: Number,
      default: 0,
    },
    consumed: {
      type: Number,
      default: 0,
    },
    consumedOut: {
      type: Number,
      default: 0,
    },
    consumedIn: {
      type: Number,
      default: 0,
    },
    percentageOut: {
      type: Number,
      default: 0,
    },
    percentageIn: {
      type: Number,
      default: 0,
    },
    colorOut: {
      type: String,
      default: 'var(--alert-900)',
    },
    colorIn: {
      type: String,
      default: 'var(--alert-700)',
    },
  },

  data() {
    return {
      listOpen: false,
    }
  },

  computed: {
    percentageStyle() {
      return `
        --percentage-in:${this.percentageIn};
        --percentage-out:${this.percentageOut};
        --color-out: ${this.colorOut};
        --color-in: ${this.colorIn};
      `
    },
    statusFormatted() {
      return this.$t(`global:solution.status.${this.status}`)
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('graphic-user-progress')"
    class="graphic-user-progress__component"
    :style="percentageStyle"
  >
    <div class="graphic-user-progress__header text-color">
      <span class="graphic-user-progress__label">{{ $t('progress.status') }}</span>
      <span class="graphic-user-progress__status">{{ statusFormatted }}</span>
    </div>

    <div class="graphic-user-progress__area">
      <div
        v-if="totalOut"
        class="graphic-user-progress__out-area"
      >
        <div class="graphic-user-progress__shadow-out"></div>
        <div
          class="graphic-user-progress__out"
          :class="{ '--no-round': percentageOut === 0 }"
        ></div>
      </div>

      <div
        v-if="totalIn"
        class="graphic-user-progress__in-area"
      >
        <div class="graphic-user-progress__shadow-in"></div>
        <div
          class="graphic-user-progress__in"
          :class="{ '--no-round': percentageIn === 0 }"
        ></div>
      </div>

      <div class="graphic-user-progress__inner">
        <div class="graphic-user-progress__info text-color">
          <div class="graphic-user-progress__title">
            {{ $t('progress.total') }}
          </div>
          <span class="graphic-user-progress__count">{{
            $mx_formatProgressInfo(consumed, total)
          }}</span>
        </div>
      </div>
    </div>

    <div class="graphic-user-progress__footer">
      <div
        v-if="totalOut"
        class="graphic-user-progress__info text-color"
      >
        <div class="graphic-user-progress__title --dot --out">
          {{ $t('progress.content') }}
        </div>
        <span class="graphic-user-progress__count">{{
          $mx_formatProgressInfo(consumedOut, totalOut)
        }}</span>
      </div>

      <div
        v-if="totalIn"
        class="graphic-user-progress__info"
      >
        <div class="graphic-user-progress__title --dot --in text-color">
          {{ $t('progress.extra.content') }}
        </div>
        <span class="graphic-user-progress__count text-color">{{
          $mx_formatProgressInfo(consumedIn, totalIn)
        }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './GraphicUserProgress.scss';
</style>
