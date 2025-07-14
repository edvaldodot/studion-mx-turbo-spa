<template>
  <span v-if="isDefaultPack">
    <span
      v-if="wrapper"
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
      class="icon"
      :class="[getName(), classes]"
      xmlns="http://www.w3.org/2000/svg"
      @click="triggerClickEvent"
    >
      <use :href="getLink()" />
    </svg>
  </span>

  <i
    v-else
    :class="[`material-symbols-${styleIcon}`, getSizeClass()]"
  >
    {{ name }}
  </i>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: null
  },
  wrapper: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: null
  },
  pack: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'material'].includes(value)
  },
  styleIcon: {
    type: String,
    default: 'outlined',
    validator: (value: string) => ['outlined', 'rounded', 'sharp'].includes(value)
  }
})

const emit = defineEmits(['click'])

const classes = ref('')

const isDefaultPack = computed(() => props.pack === 'default')

function triggerClickEvent() {
  emit('click')
}

function getName() {
  return 'icon-' + props.name
}

function getLink() {
  return `#icon-${props.name}`
}

function getSizeClass() {
  return props.size === 'large'
    ? 'is-large'
    : props.size === 'medium'
    ? 'is-medium'
    : props.size === 'small'
    ? 'is-small'
    : ''
}
</script>

<style lang="scss">
@use 'Icon.scss';
</style>
