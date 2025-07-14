<script setup lang="ts">
import { computed } from "vue";
import Action from "../Action";
import Icon from "../Icon";
import type { PropType } from 'vue'

interface BreadcrumbItem {
  key: string | number
  text: string
  path: string
  value?: unknown
}

const props = defineProps({
  breadcrumbsList: {
    type: Array as PropType<BreadcrumbItem[]>,
    default: () => [],
  },
  size: {
    type: String,
    default: null,
  },
  dark: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  highlightCurrent: {
    type: Boolean,
    default: false,
  },
  showLastArrow: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'click', value: string | number | unknown): void
}>()

const classes = computed(() => ({
  "--small": props.size === "small",
  "--medium": props.size === "medium",
  "--large": props.size === "large",
  "--dark": props.dark,
}));

function handleClick(value: unknown) {
  emit("click", value);
}
</script>

<template>
  <div :class="['breadcrumbs', classes]">
    <template v-for="(item, index) in breadcrumbsList" :key="item.key">
      <Icon
        v-if="index === 0"
        :key="`icon-${item.key}`"
        class="breadcrumbs__icon text-color"
        pack="material"
        name="home"
        @click="handleClick(item.value || item.key)"
      />

      <span
        v-if="index === breadcrumbsList.length - 1 || !clickable"
        :class="[
          'breadcrumbs__item text-color',
          {
            '--highlight':
              index === breadcrumbsList.length - 1 && highlightCurrent,
          },
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
          {
            '--highlight':
              index === breadcrumbsList.length - 1 && highlightCurrent,
          },
        ]"
        :text="item.text"
        :dark="dark"
        @click="handleClick(item.path || item.key)"
      />

      <Icon
        v-if="index !== breadcrumbsList.length - 1 || showLastArrow"
        :key="`sep-${item.key}`"
        wrapper
        size="small"
        pack="material"
        name="keyboard_arrow_right"
        class="breadcrumbs__separator text-color"
      />
    </template>
  </div>
</template>

<style lang="scss">
@use "./Breadcrumbs.scss";
</style>
