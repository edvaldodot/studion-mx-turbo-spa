<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";

import imageSVG from "@/assets/images/svg/emptyStates/empty_state_1.svg?inline";

interface EmptyMessageProps {
  emptyState?: number;
  noBg?: boolean;
  showIcon?: boolean;
  title?: string;
  text?: string;
}

// props
const props = defineProps<EmptyMessageProps>();

// data
const iconSource = ref<string>("");
const emptyState = props.emptyState ?? 1;
const noBg = props.noBg ?? false;
const showIcon = props.showIcon ?? false;
const title = props.title ?? "";
const text = props.text ?? "";

// computed
const classes = computed(() => ({
  "--no-bg": noBg,
}));

// methods
const loadImage = async () => {
  const image = await import(
    `@/assets/images/svg/emptyStates/empty_state_${emptyState}.svg?inline`
  );
  iconSource.value = image.default || image;
};

// hooks
onMounted(async () => {
  loadImage();
});
</script>

<template>
  <div :class="['empty-msg', classes]">
    <div class="empty-msg__content">
      <div v-show="showIcon" class="empty-msg__icon">
        <img width="100px" height="auto" :src="iconSource" alt="empty" />
      </div>
      <div class="empty-msg__message">
        <slot>
          <div class="empty-msg__title">
            <slot name="title">{{ title }}</slot>
          </div>
          <div class="empty-msg__text">
            <slot name="text">{{ text }}</slot>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "EmptyMessage.scss";
</style>
