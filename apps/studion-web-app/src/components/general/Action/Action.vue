<script>
import { defineComponent } from 'vue'
import Icon from '../Icon'

export default defineComponent({
  name: 'ActionButton',

  components: {
    Icon,
  },

  props: {
    type: {
      type: String,
      default: null,
    },
    url: {
      type: [String, Object],
      default: '#',
    },
    text: {
      type: String,
      default: null,
    },
    external: {
      type: Boolean,
      default: false,
    },
    target: {
      type: String,
      default: null,
    },
    download: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: null,
    },
    iconRight: {
      type: Boolean,
      default: false,
    },
    iconSize: {
      type: String,
      default: null,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
    medium: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    submit: {
      type: Boolean,
      default: false,
    },
    accent: {
      type: Boolean,
      default: false,
    },
    primary: {
      type: Boolean,
      default: false,
    },
    primaryDark: {
      type: Boolean,
      default: false,
    },
    secondary: {
      type: Boolean,
      default: false,
    },
    fixedWidth: {
      type: Boolean,
      default: false,
    },
    notifyNumber: {
      type: Number,
      default: null,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },
    fab: {
      type: Boolean,
      default: false,
    },
    flatten: {
      type: Boolean,
      default: false,
    },
    typePosition: {
      type: String,
      default: null,
    },
    hideLabel: {
      type: Boolean,
      default: false,
    },
    asTab: {
      type: Boolean,
    },
  },

  computed: {
    shouldOpenInNewTab() {
      const isAnExternalLink =
        typeof this.url !== 'object' && !this.url.includes(window.location.origin)
      return isAnExternalLink
    },
  },

  methods: {
    triggerClickEvent(event) {
      if (this.disabled) return
      this.type !== 'button' && this.url === '#' && event.preventDefault()
      this.$el.blur()
      this.$emit('click', event)
    },
    checkTypeButton() {
      return this.submit ? 'submit' : 'button'
    },
    getTypeClass() {
      return this.primary
        ? 'btn-primary'
        : this.primaryDark
        ? 'btn-primary-dark'
        : this.secondary
        ? 'btn-secondary'
        : !this.text && this.icon
        ? 'btn-icon'
        : ''
    },
    getSizeClass() {
      let size = this.$media.mobile ? 'btn-mobile' : ''

      if (this.large) size += 'is-large'
      else if (this.medium) size += 'is-medium'
      else if (this.small) size += 'is-small'

      return size
    },
    formatURL(url) {
      const prefix = ['http://', 'https://']
      if (url.substr(0, prefix[1].length) === prefix[1]) return url
      if (url.substr(0, prefix[0].length) !== prefix[0]) url = 'http://' + url
      return url
    },
    getUrl() {
      return typeof this.url === 'object'
        ? this.$router.resolve(this.url).href
        : this.formatURL(this.url)
    },
  },
})
</script>

<template>
  <button
    v-if="type == 'button'"
    ref="elem"
    :data-testid="$testId('action-button')"
    :type="checkTypeButton()"
    class="btn"
    :class="[
      {
        'btn-flat': flat,
        'is-accent': accent,
        'is-fab': fab,
        'is-disabled': disabled,
        'is-submit': submit,
        'has-fixed-width': fixedWidth,
        'theme-dark': dark,
        'theme-light': light,
        'is-absolute': typePosition === 'is-absolute',
        'flat-clear': flatten,
        'as-tab': asTab,
        ['type-' + checkTypeButton()]: checkTypeButton(),
      },
      getTypeClass(),
      getSizeClass(),
    ]"
    :disabled="disabled"
    @click="triggerClickEvent"
  >
    <slot name="inner-prepend"></slot>
    <Icon
      v-if="icon && !iconRight"
      :name="icon"
      :size="iconSize"
      wrapper
    />

    <span
      v-if="text && !hideLabel"
      class="text"
    >
      {{ text }}
    </span>

    <Icon
      v-if="icon && iconRight"
      :name="icon"
      :size="iconSize"
      wrapper
    />
    <slot name="inner-append"></slot>

    <span
      v-if="notifyNumber"
      :class="{ 'is-larger': notifyNumber > 99 }"
      class="number"
    >
      {{ notifyNumber }}
    </span>
  </button>

  <a
    v-else-if="type == 'link'"
    ref="elem"
    :data-testid="$testId('action-button')"
    class="btn"
    :class="[
      {
        'btn-flat': flat,
        'is-accent': accent,
        'is-fab': fab,
        'is-disabled': disabled,
        'has-fixed-width': fixedWidth,
        'theme-dark': dark,
        'flat-clear': flatten,
      },
      getTypeClass(),
      getSizeClass(),
    ]"
    :href="getUrl()"
    :target="shouldOpenInNewTab ? '_blank' : target"
    :download="download"
    :disabled="disabled"
    @click="triggerClickEvent"
  >
    <Icon
      v-if="icon && !iconRight"
      :name="icon"
      :size="iconSize"
      wrapper
    />

    <span
      v-if="text"
      class="text"
    >
      {{ text }}
    </span>

    <Icon
      v-if="icon && iconRight"
      :name="icon"
      :size="iconSize"
      wrapper
    />

    <span
      v-if="notifyNumber"
      class="number"
      :class="{ 'is-larger': notifyNumber > 99 }"
    >
      {{ notifyNumber }}
    </span>
  </a>

  <RouterLink
    v-else
    :data-testid="$testId('action-button')"
    class="btn"
    :class="[
      {
        'btn-flat': flat,
        'is-accent': accent,
        'is-fab': fab,
        'is-disabled': disabled,
        'has-fixed-width': fixedWidth,
        'theme-dark': dark,
        'as-tab': asTab,
      },
      getTypeClass(),
      getSizeClass(),
    ]"
    :to="getUrl()"
    :disabled="disabled"
  >
    <span @click="triggerClickEvent">
      <template v-if="!fab">
        <Icon
          v-if="icon && !iconRight"
          :name="icon"
          :size="iconSize"
          wrapper
        />

        <span
          v-if="text"
          class="text"
        >
          {{ text }}
        </span>

        <Icon
          v-if="icon && iconRight"
          :name="icon"
          :size="iconSize"
          wrapper
        />

        <span
          v-if="notifyNumber"
          class="number"
          :class="{ 'is-larger': notifyNumber > 99 }"
        >
          {{ notifyNumber }}
        </span>
      </template>

      <template v-else>
        <Icon
          name="add"
          title="Fab"
          wrapper
        />
      </template>
    </span>
  </RouterLink>
</template>

<style lang="scss">
@import 'Action.scss';
</style>
