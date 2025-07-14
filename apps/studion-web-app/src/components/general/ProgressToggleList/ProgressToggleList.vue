<script>
import Action from '../Action'
import Icon from '../Icon'
import { progressMixin } from '@/mixins/progressMixin'

export default {
  name: 'ProgressList',

  components: {
    Action,
    Icon,
  },

  mixins: [progressMixin],

  props: {
    title: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    consumed: {
      type: Number,
      default: 0,
    },
    items: {
      type: Array,
      default: () => [],
    },
    color: {
      type: String,
      default: 'var(--alert-900)',
    },
    actionButton: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      listOpen: true,
    }
  },

  computed: {
    componentStyle() {
      return `--progress-color:${this.color}`
    },
    progressStyle() {
      return { width: `${this.percentage || 0}%` }
    },
    toggleIcon() {
      return this.listOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_right'
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('progress-toggle-list')"
    :style="componentStyle"
    class="progress-toggle-list__component"
  >
    <div class="progress-toggle-list__header">
      <Action
        :data-testid="$testId('progress-toggle-list--toggle')"
        :icon="toggleIcon"
        class="progress-toggle-list__toggle-button"
        type="button"
        @click="listOpen = !listOpen"
      />
      <div class="progress-toggle-list__title">
        <span>{{ title }}</span>
      </div>
      <div class="progress-toggle-list__background">
        <div
          class="progress-toggle-list__line"
          :style="progressStyle"
        ></div>
      </div>
      <span class="progress-toggle-list__info">{{ $mx_formatProgressInfo(consumed, total) }}</span>
    </div>
    <div
      v-if="listOpen"
      class="progress-toggle-list__body"
    >
      <ul :data-testid="$testId('progress-toggle-list--list')">
        <li
          v-for="item in items"
          :key="item.id"
          class="progress-toggle-list__item"
          :class="{ '--completed': item.completed }"
        >
          <Icon
            class="progress-toggle-list__icon"
            name="check-circle"
            size="small"
          />
          <span class="progress-toggle-list__name">{{ item.name }}</span>
          <Action
            v-if="actionButton"
            :data-testid="$testId('item-list--action')"
            :text="$t('global:access')"
            type="button"
            icon="keyboard_arrow_right"
            class="progress-toggle-list__action"
            icon-right
            dark
            @click="$emit('action', item)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import './ProgressToggleList.scss';
</style>
