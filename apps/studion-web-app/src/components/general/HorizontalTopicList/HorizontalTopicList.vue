<template>
  <div
    class="topic-list"
    :class="computedClasses"
    :style="computedStyles"
  >
    <div
      v-for="(item, index) in topicItems"
      :key="index"
      class="topic-list__item"
      :class="getTopicItemClass(index)"
    >
      <div class="topic-list__item-icon" />
      <div
        class="topic-list__item-content text-color"
        v-html="item.text"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    topicItems: {
      type: Array,
      required: true,
      validator: function (value) {
        return value.length >= 1
      },
    },
    width: {
      type: String,
      default: '100%',
    },
    light: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: true,
    },
    linkTopicsOnMobile: {
      type: Boolean,
      default: false,
    },
    thinConnector: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    computedClasses() {
      return {
        '--light': this.light,
        '--dark': this.dark,
        '--linked': this.linkTopicsOnMobile,
        '--thin': this.thinConnector,
      }
    },
    computedStyles() {
      return {
        width: this.$media.mobile ? '100%' : this.width,
      }
    },
  },
  methods: {
    getTopicItemClass(index) {
      return {
        '--first': index === 0,
        '--last': index === this.topicItems.length - 1,
      }
    },
  },
}
</script>

<style lang="scss">
@import 'HorizontalTopicList.scss';
</style>
