<script>
import Icon from '../Icon'

export default {
  name: 'progresslist',
  components: {
    Icon
  },
  data () {
    return {
      mutableActiveItems: 0
    }
  },
  props: {
    label: {
      type: Boolean,
      default: true
    },
    labelText: {
      type: String,
      default: function () {
        return this.$t('global:progress')
      }
    },
    numItems: {
      type: Number,
      default: 0
    },
    numActiveItems: {
      type: Number,
      default: 0
    },
    showCompleted: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    const self = this
    this.interval = setInterval(function () {
      if (self.mutableActiveItems < self.numActiveItems) {
        self.mutableActiveItems = self.mutableActiveItems + 1
      } else {
        clearInterval(this.interval)
      }
    }, 40)
  }
}
</script>

<template>
  <div class="progress">
    <span class="progress-label" v-if="label">{{ labelText }}:</span>
    <ul class="progress-list">
      <li
        class="progress-item"
        :class="{ 'is-active': index < mutableActiveItems }"
        v-for="(item, index) in numItems"
        :key="index">
        {{ ((index+1)/numItems*100).toFixed(2) }}%
      </li>
    </ul>
    <icon name="check-all" class="progress-icon" v-if="showCompleted && mutableActiveItems === numItems"/>
  </div>
</template>

<style lang="scss">@import "ProgressList.scss"</style>
