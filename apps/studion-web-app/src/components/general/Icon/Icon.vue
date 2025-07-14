<script>
export default {
  name: 'TheIcon',

  props: {
    name: {
      type: String,
      default: null,
    },
    wrapper: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: null,
    },
    pack: {
      type: String,
      default: () => 'default',
      validator(value) {
        return ['default', 'material'].includes(value)
      },
    },
    styleIcon: {
      type: String,
      default: () => 'outlined',
      validator(value) {
        return ['outlined', 'rounded', 'sharp'].includes(value)
      },
    },
  },

  data() {
    return {
      classes: '',
    }
  },
  computed: {
    isDefaultPack() {
      return this.pack === 'default'
    },
  },
  methods: {
    triggerClickEvent() {
      this.$emit('click')
    },
    getName: function () {
      return 'icon-' + this.name
    },
    getLink: function () {
      return `#icon-${this.name}`
    },
    getSizeClass: function () {
      return this.size === 'large'
        ? 'is-large'
        : this.size === 'medium'
        ? 'is-medium'
        : this.size === 'small'
        ? 'is-small'
        : ''
    },
  },
}
</script>

<template>
  <span v-if="isDefaultPack">
    <span
      v-if="wrapper"
      :data-testid="$testId('icon')"
      class="icon-wrapper"
      :class="[getSizeClass()]"
      @click="triggerClickEvent"
    >
      <svg
        class="icon"
        :class="[getName(), classes]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <use :xlink:href="getLink()" />
      </svg>
    </span>

    <svg
      v-else
      :data-testid="$testId('icon')"
      class="icon"
      :class="[getName(), classes]"
      xmlns="http://www.w3.org/2000/svg"
      @click="triggerClickEvent"
    >
      <use :xlink:href="getLink()" />
    </svg>
  </span>
  <i
    v-else
    :class="[`material-symbols-${styleIcon}`, getSizeClass()]"
  >
    {{ name }}
  </i>
</template>

<style lang="scss">
@import 'Icon.scss';
</style>
