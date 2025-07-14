<script>
import Icon from '../Icon'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DraggableItem',

  components: {
    Icon,
  },

  props: {
    index: {
      type: Number,
      required: true,
    },
    noPaddingY: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    order(direction) {
      if (this.disabled) return

      this.$emit('order', {
        direction,
        oldIndex: this.index,
        newIndex: direction === 'up' ? this.index - 1 : this.index + 1,
      })
    },
  },
})
</script>

<template>
  <div
    class="draggable-item grid-nogutter h5-rem py-0"
    :class="{ 'no-padding-y': noPaddingY, '--disabled': disabled, dark }"
  >
    <div class="draggable-item-col action-col text-center">
      <a class="handle">
        <Icon name="dragndrop" />
      </a>
    </div>

    <slot></slot>

    <div class="draggable-item-col action-col order-col">
      <div class="draggable-item-navs">
        <a
          class="btn-order-up"
          @click="order('up')"
        >
          <Icon name="keyboard_arrow_up" />
        </a>

        <a
          class="btn-order-down"
          @click="order('down')"
        >
          <Icon name="keyboard_arrow_down" />
        </a>
      </div>
    </div>

    <div
      v-if="$slots.actions"
      class="draggable-item-col action-col"
    >
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import 'DraggableItem.scss';
</style>
