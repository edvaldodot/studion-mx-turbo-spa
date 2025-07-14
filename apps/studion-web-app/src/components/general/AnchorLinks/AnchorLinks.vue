<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AnchorLinks',

  props: {
    links: {
      type: Array,
      default: () => [],
    },
    prefix: {
      type: String,
      default: 'link_',
    },
    checkedIds: {
      type: Array,
      default: () => [],
    },
    countLabel: {
      type: String,
      default: '',
    },
    checkedLabel: {
      type: String,
      default: '',
    },
    uncheckedLabel: {
      type: String,
      default: '',
    },
  },

  computed: {
    count() {
      const checkList = new Set(this.checkedIds)
      return `${checkList.size} ${this.$t('global:of')} ${this.links.length}`
    },
  },

  methods: {
    scrollToElement(id) {
      const element = document.getElementById(this.prefix + id)

      if (element)
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    },
  },
})
</script>

<template>
  <div
    class="anchor-links__container"
    :test-id="$testId('anchor-links')"
  >
    <div
      v-if="countLabel"
      class="anchor-links__label"
    >
      <p class="text-color">
        {{ countLabel }} <span class="label__count"> {{ count }}</span>
      </p>
    </div>

    <div class="anchor-links__list">
      <button
        v-for="(link, index) of links"
        :key="link.id"
        class="anchor-links__item"
        :class="{ active: checkedIds.includes(link.id) }"
        @click="scrollToElement(link.id)"
      >
        {{ index + 1 }}
      </button>
    </div>

    <div
      v-if="uncheckedLabel || checkedLabel"
      class="anchor-links__status"
    >
      <ul>
        <li v-if="uncheckedLabel"><span class="status__color"></span>{{ uncheckedLabel }}</li>
        <li v-if="checkedLabel"><span class="status__color check"></span>{{ checkedLabel }}</li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import 'AnchorLinks.scss';
</style>
