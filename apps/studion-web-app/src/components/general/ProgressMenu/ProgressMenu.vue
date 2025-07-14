<script>
import Action from '../Action'
import { progressMixin } from '@/mixins/progressMixin'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProgressMenu',

  components: {
    Action,
  },

  mixins: [progressMixin],
  props: {
    status: {
      type: String,
      default: '',
    },
    content: {
      type: Object,
      default: () => ({
        progress: 0,
        total: 0,
      }),
    },
    extraContent: {
      type: Object,
      default: () => ({
        progress: 0,
        total: 0,
      }),
    },
    buttonAction: {
      type: Boolean,
      default: false,
    },
    card: {
      type: Boolean,
      default: false,
    },
    noBg: {
      type: Boolean,
      default: false,
    },
    minSpace: {
      type: Boolean,
      default: false,
    },
    classText: {
      type: String,
      default: '',
    },
  },
  computed: {
    progressStyle() {
      const calcContent =
        (100 * (this.content.progress + this.extraContent.progress)) /
        (this.content.total + this.extraContent.total)
      return { width: `${parseInt(calcContent)}%` }
    },
    totalContents() {
      return {
        progress: this.content.progress + this.extraContent.progress,
        total: this.content.total + this.extraContent.total,
      }
    },
  },
})
</script>

<template>
  <div
    v-if="status || content.total || extraContent.total"
    class="progress__menu"
    :class="{ card, 'no-bg': noBg, 'min-space': minSpace }"
  >
    <div
      v-if="status"
      class="status__info item"
    >
      <div :class="['label__progress', classText]">
        {{ $t('progress.status') }}
      </div>
      <div class="info__progress , classText]">
        {{ $t(`global:solution.status.${status}`) }}
      </div>
    </div>
    <div
      v-if="content.total"
      class="content__info item"
    >
      <div :class="['label__progress', classText]">
        {{ $t('progress.content') }}
      </div>
      <div class="info__progress , classText]">
        {{ $mx_formatProgressInfo(content.progress, content.total) }}
      </div>
    </div>
    <div
      v-if="extraContent.total"
      class="extra-content__info item"
    >
      <div :class="['label__progress', classText]">
        {{ $t('progress.extra') }}
      </div>
      <div :class="['info__progress', classText]">
        {{ $mx_formatProgressInfo(extraContent.progress, extraContent.total) }}
      </div>
    </div>
    <div class="progress__info item">
      <div :class="['label__progress', classText]">
        {{ $t('progress.total') }}
      </div>
      <div class="bar__progress">
        <div class="line__background">
          <div
            class="line__determinate"
            :style="progressStyle"
          ></div>
        </div>
        <div :class="['info__progress', classText]">
          {{ $mx_formatProgressInfo(totalContents.progress, totalContents.total) }}
        </div>
      </div>
    </div>
    <div
      v-if="buttonAction"
      class="button__area"
    >
      <action
        :text="$t('global:view.more')"
        type="button"
        icon="keyboard_arrow_right"
        class="action__icon"
        icon-right
        dark
        @click="$emit('action')"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import 'ProgressMenu.scss';
</style>
