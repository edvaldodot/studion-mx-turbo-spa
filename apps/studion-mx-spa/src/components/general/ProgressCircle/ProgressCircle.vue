<script setup lang="ts">
import { computed } from "vue";
import Icon from "../Icon";

const props = defineProps({
  consumption: {
    type: Object,
    default: () => ({ progress: 0, status: "" }),
  },
  backgroundColor: {
    type: String,
    default: "var(--black-400)",
  },
  progressColor: {
    type: String,
    default: "var(--primary-900)",
  },
});

const radius = 10;
const circumference = 2 * Math.PI * radius;

const strokeOffset = computed(() => {
  const percent = props.consumption?.progress ?? 0;
  return circumference - (percent / 100) * circumference;
});
</script>

<template>
  <div class="progress-circle">
    <svg width="26" height="26" viewBox="0 0 26 26">
      <circle
        cx="13"
        cy="13"
        r="10"
        :stroke="backgroundColor"
        stroke-width="3"
        fill="none"
      />
      <circle
        cx="13"
        cy="13"
        r="10"
        :stroke="progressColor"
        stroke-width="3"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeOffset"
        stroke-linecap="round"
        transform="rotate(-90 13 13)"
      />
    </svg>
    <Icon
      v-if="
        props.consumption?.progress === 100 ||
        props.consumption?.status === 'completed'
      "
      class="icon-check"
      name="check-circle"
    />
  </div>
</template>

<style lang="scss">
.progress-circle {
  position: relative;
  width: 26px;
  height: 26px;
}

.icon-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--primary-900);

  .icon-check-circle {
    padding: 4px;
  }
}
</style>
