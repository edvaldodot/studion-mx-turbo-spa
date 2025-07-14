<script>
import Action from '../Action'
import Icon from '../Icon'

export default {
  name: 'Breadcrumbs',
  components: {
    Action,
    Icon,
  },
  props: {
    breadcrumbsList: {
      type: Array,
      default: () => [],
    },
    size: {
      type: String,
      default: () => null,
    },
    dark: {
      type: Boolean,
      default: () => false,
    },
    clickable: {
      type: Boolean,
      default: () => false,
    },
    highlightCurrent: {
      type: Boolean,
      default: () => false,
    },
    showLastArrow: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    classes() {
      return {
        '--small': this.size === 'small',
        '--medium': this.size === 'medium',
        '--large': this.size === 'large',
        '--dark': this.dark,
      }
    },
  },
  methods: {
    handleClick(value) {
      this.$emit('click', value)
    },
  },
}
</script>

<template>
  <div :class="['breadcrumbs', classes]">
    <template v-for="(item, index) in breadcrumbsList">
      <Icon
        v-if="index !== breadcrumbsList.length-1 || showLastArrow"
        :key="`icon-${item.key}`"
        class="breadcrumbs__icon text-color"
        pack="material"
        name="home"
        @click="handleClick(item.value || item.key)"
      />
      <span
        v-if="index === breadcrumbsList.length - 1 || !clickable"
        :key="item.key"
        :class="[
          'breadcrumbs__item text-color',
          { '--highlight': index === breadcrumbsList.length - 1 && highlightCurrent },
        ]"
      >
        {{ item.text }}
      </span>
      <Action
        v-else-if="index !== breadcrumbsList.length - 1"
        :key="`btn-${item.key}`"
        type="button"
        :class="[
          'breadcrumbs__item text-color',
          { '--highlight': index === breadcrumbsList.length - 1 && highlightCurrent },
        ]"
        :text="item.text"
        :dark="dark"
        @click="handleClick(item.value || item.key)"
      />
      <Icon
        v-if="index !== breadcrumbsList.length - 1 || showLastArrow"
        :key="`sep-${item.key}`"
        wrapper
        size="small"
        name="keyboard_arrow_right"
        class="breadcrumbs__separator text-color"
      />
    </template>
  </div>
</template>

<style lang="scss">
@import './Breadcrumbs.scss';
</style>
