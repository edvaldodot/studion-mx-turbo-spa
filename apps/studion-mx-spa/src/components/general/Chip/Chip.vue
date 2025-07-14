<script setup lang="ts">
import { computed } from "vue";
import Icon from "@/components/general/Icon";

interface ChipProps {
  severity?: "primary" | "secondary";
  icon?: string;
}

// props
const props = defineProps<ChipProps>();

const severity = props.severity ?? "primary";

// computed
const classes = computed(() => ["chip", `chip--${severity}`]);
</script>
<template>
  <div :class="classes" v-bind="$attrs">
    <Icon v-if="props.icon" pack="material" name="android" />
    <slot />
  </div>
</template>
<style lang="scss">
@use "Chip.scss";
</style>
