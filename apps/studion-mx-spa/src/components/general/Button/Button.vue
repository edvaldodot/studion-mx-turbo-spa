<script lang="ts" setup>
import { computed, useAttrs } from "vue";
import Icon from "@/components/general/Icon";

interface ButtonProps {
  variant?: "default" | "outline" | "text" | "icon";
  severity?: "primary" | "secondary";
  customClass?: string;
  innerPrependIcon?: string | null;
  innerAppendIcon?: string | null;
  icon?: string | null;
  iconPack?: string;
}

// props
const props = defineProps<ButtonProps>();

const attrs = useAttrs();
const emit = defineEmits();

const variant = props.variant ?? "default";
const severity = props.severity ?? "primary";
const customClass = props.customClass ?? "";
const iconPack = props.iconPack ?? "material";

// computed
const isVariantIcon = computed(() => variant === "icon");
const classes = computed(() => [
  "button",
  `button--${variant}`,
  `button--${severity}`,
  customClass,
]);
const icon = computed(() => props.icon ?? null);
const innerPrependIcon = computed(() => props.innerPrependIcon ?? null);
const innerAppendIcon = computed(() => props.innerAppendIcon ?? null);
</script>

<template>
  <button v-bind="attrs" :class="classes">
    <slot name="inner-prepend">
      <Icon
        v-if="innerPrependIcon && !isVariantIcon"
        :name="innerPrependIcon"
        :pack="iconPack"
      />
    </slot>

    <Icon v-if="isVariantIcon" :name="icon" :pack="iconPack" />
    <slot v-else />

    <slot name="inner-append">
      <Icon
        v-if="innerAppendIcon && !isVariantIcon"
        :name="innerAppendIcon"
        :pack="iconPack"
      />
    </slot>
  </button>
</template>

<style lang="scss">
@use "Button.scss";
</style>
