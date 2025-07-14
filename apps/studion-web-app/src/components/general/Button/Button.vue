<script>
import Icon from '../Icon'
export default {
  name: 'Button',
  components: {
    Icon,
  },
  props: {
    variant: {
      type: String,
      default: () => 'default',
      validator(value) {
        return ['default', 'outline', 'text', 'icon'].includes(value)
      },
    },
    severity: {
      default: () => 'primary',
      validator(value) {
        return ['primary', 'secondary'].includes(value)
      },
    },
    customClass: {
      type: String,
      default: () => '',
    },
    innerPrependIcon: {
      type: String,
      default: () => null,
    },
    innerAppendIcon: {
      type: String,
      default: () => null,
    },
    icon: {
      type: String,
      default: () => null,
    },
    iconPack: {
      type: String,
      default: () => 'material',
    },
  },
  computed: {
    isVariantIcon() {
      return this.variant === 'icon'
    },
  },
}
</script>
<template>
  <button
    :data-testid="$testId('button')"
    v-bind="$attrs"
    :class="['button', `button--${variant}`, `button--${severity}`, customClass]"
    v-on="$listeners"
  >
    <slot name="inner-prepend">
      <Icon
        v-if="innerPrependIcon && !isVariantIcon"
        :name="innerPrependIcon"
        :pack="iconPack"
      />
    </slot>

    <Icon
      v-if="isVariantIcon"
      :name="icon"
      :pack="iconPack"
    />
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
@import 'Button.scss';
</style>
