<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../Icon'

const props = defineProps({
  type: { type: String, default: null },
  url: { type: [String, Object], default: '#' },
  text: { type: String, default: null },
  external: { type: Boolean, default: false },
  target: { type: String, default: null },
  download: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: null },
  iconRight: { type: Boolean, default: false },
  iconSize: { type: String, default: null },
  flat: { type: Boolean, default: false },
  large: { type: Boolean, default: false },
  medium: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
  submit: { type: Boolean, default: false },
  accent: { type: Boolean, default: false },
  primary: { type: Boolean, default: false },
  primaryDark: { type: Boolean, default: false },
  secondary: { type: Boolean, default: false },
  fixedWidth: { type: Boolean, default: false },
  notifyNumber: { type: Number, default: null },
  dark: { type: Boolean, default: false },
  light: { type: Boolean, default: false },
  fab: { type: Boolean, default: false },
  flatten: { type: Boolean, default: false },
  typePosition: { type: String, default: null },
  hideLabel: { type: Boolean, default: false },
  asTab: { type: Boolean, default: false },
})

const emit = defineEmits(['click', 'mouseover', 'mouseleave'])

const router = useRouter()

const shouldOpenInNewTab = computed(() => {
  return typeof props.url !== 'object' && !props.url.includes(window.location.origin)
})

function triggerClickEvent(event: Event) {
  if (props.disabled) return

  const isAnchor = props.type !== 'button'
  const isDummyUrl = props.url === '#'

  if (isAnchor && isDummyUrl) {
    event.preventDefault()
  }

  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.blur()
  }

  emit('click', event)
}


function checkTypeButton() {
  return props.submit ? 'submit' : 'button'
}

function getTypeClass() {
  if (props.primary) return 'btn-primary'
  if (props.primaryDark) return 'btn-primary-dark'
  if (props.secondary) return 'btn-secondary'
  if (!props.text && props.icon) return 'btn-icon'
  return ''
}

function getSizeClass() {
  let size = ''
  if (props.large) size += ' is-large'
  else if (props.medium) size += ' is-medium'
  else if (props.small) size += ' is-small'
  return size.trim()
}

function formatURL(url: string) {
  const prefix = ['http://', 'https://']
  if (url.startsWith(prefix[1])) return url
  if (!url.startsWith(prefix[0])) return 'http://' + url
  return url
}

function getUrl() {
  return typeof props.url === 'object' ? router.resolve(props.url).href : formatURL(props.url)
}
</script>

<template>
  <button
    v-if="type === 'button'"
    ref="elem"
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
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <slot name="inner-prepend"></slot>
    <Icon v-if="icon && !iconRight" :name="icon" :size="iconSize" wrapper />
    <span v-if="text && !hideLabel" class="text">{{ text }}</span>
    <Icon v-if="icon && iconRight" :name="icon" :size="iconSize" wrapper />
    <slot name="inner-append"></slot>
    <span v-if="notifyNumber" :class="{ 'is-larger': notifyNumber > 99 }" class="number">{{ notifyNumber }}</span>
  </button>

  <a
    v-else-if="type === 'link'"
    ref="elem"
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
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <Icon v-if="icon && !iconRight" :name="icon" :size="iconSize" wrapper />
    <span v-if="text" class="text">{{ text }}</span>
    <Icon v-if="icon && iconRight" :name="icon" :size="iconSize" wrapper />
    <span v-if="notifyNumber" class="number" :class="{ 'is-larger': notifyNumber > 99 }">{{ notifyNumber }}</span>
  </a>

  <RouterLink
    v-else
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
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <span @click="triggerClickEvent">
      <template v-if="!fab">
        <Icon v-if="icon && !iconRight" :name="icon" :size="iconSize" wrapper />
        <span v-if="text" class="text">{{ text }}</span>
        <Icon v-if="icon && iconRight" :name="icon" :size="iconSize" wrapper />
        <span v-if="notifyNumber" class="number" :class="{ 'is-larger': notifyNumber > 99 }">{{ notifyNumber }}</span>
      </template>
      <template v-else>
        <Icon name="add" title="Fab" wrapper />
      </template>
    </span>
  </RouterLink>
</template>

<style lang="scss">
@use 'Action.scss';
</style>
