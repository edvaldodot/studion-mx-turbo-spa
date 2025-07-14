<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TheAccordion',

  props: {
    card: {
      type: Boolean,
      default: false,
    },
    multiples: {
      type: Boolean,
      default: false,
    },
    modal: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    if (!this.multiples) {
      this.$on('open', function (item) {
        for (var index = 0, length = this.$slots.default.length; index < length; index++) {
          var childComponent = this.$slots.default[index].componentInstance
          if (childComponent && item._uid !== childComponent._uid && childComponent.isOpen) {
            childComponent.close()
          }
        }
      })
    }
  },
})
</script>

<template>
  <div
    :data-testid="$testId('accordion-item')"
    :class="{ 'accordion-card': card, 'accordion-modal': modal, 'theme-dark': dark }"
    class="accordion"
  >
    <div
      v-if="$slots.header"
      class="accordion-header"
    >
      <slot name="header"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import 'Accordion.scss';
</style>
