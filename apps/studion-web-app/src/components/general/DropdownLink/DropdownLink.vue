<script>
import Icon from '../Icon'

export default {
  name: 'DropdownLink',
  components: {
    Icon,
  },
  props: {
    icon: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
    url: {
      type: [String, Object],
      default: '#',
    },
    active: {
      type: Boolean,
      default: false,
    },
    download: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disableUppercase: {
      type: Boolean,
      default: false,
    },
    wrapper: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isHovered: false,
    }
  },

  methods: {
    triggerClickEvent(event) {
      this.url === '#' && event.preventDefault()

      if (this.wrapper) return this.$emit('click')

      if (!this.disabled) {
        this.$parent.toggleMenu(event)
        this.$emit('click')
      }
    },
  },
}
</script>

<template>
  <a
    :data-testid="$testId('dropdown-link')"
    class="dropdown-content-link"
    :class="{ 'is-disabled': disabled, 'is-active': active, uppercase: !disableUppercase }"
    :download="download"
    :title="text"
    :href="url"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="triggerClickEvent"
  >
    <Icon
      v-if="icon"
      :name="icon"
      size="small"
      wrapper
    />
    <span class="text text-base">{{ text }}</span>
    <slot name="description"></slot>
    <slot
      v-if="isHovered"
      name="onhover"
    ></slot>
  </a>
</template>

<style lang="scss">
@import 'DropdownLink.scss';
</style>
