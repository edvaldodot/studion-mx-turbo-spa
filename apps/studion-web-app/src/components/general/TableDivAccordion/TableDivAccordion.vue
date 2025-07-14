<script>
import { defineComponent } from 'vue'
import Icon from '../Icon'

export default defineComponent({
  name: 'TableDivAccordion',

  components: {
    Icon,
  },

  data() {
    return {
      open: false,
    }
  },
})
</script>

<template>
  <div
    :data-testid="$testId('table-div-accordion')"
    class="table-div__accordion"
    :class="{ open }"
  >
    <div class="accordion__header">
      <slot name="header"></slot>

      <div
        class="accordion__icon"
        :class="{ open, 'is-mobile': $media.mobile }"
      >
        <div
          class="click__area"
          @click="open = !open"
        >
          <Icon name="keyboard_arrow_down" />
        </div>
      </div>
    </div>

    <div
      v-show="open"
      class="accordion__body"
    >
      <slot name="body"></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import './TableDivAccordion.scss';
</style>
