<script>
import { defineComponent } from 'vue'
import VueDraggable from 'vuedraggable'

export default defineComponent({
  name: 'TheDraggable',

  components: {
    VueDraggable,
  },

  inheritAttrs: false,

  props: {
    enumerated: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div class="draggable">
    <table
      v-if="enumerated"
      width="100%"
      class="datatable"
    >
      <thead v-if="$slots.headers">
        <tr>
          <slot name="headers"></slot>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(_, index) in $attrs.list"
          :key="'row-' + index"
          height="80px"
        >
          <td :width="$media.mobile ? 30 : 50">
            <slot name="index" v-bind="{ index: index + 1 }">
              <span class="td-text td-index">
                {{ index + 1 }}
              </span>
            </slot>
          </td>
          <td
            v-if="index === 0"
            :rowspan="$attrs.list.length"
            :colspan="$slots.headers && $slots.headers.length"
          >
            <VueDraggable
              v-bind="$attrs"
              v-on="$listeners"
            >
              <slot></slot>
            </VueDraggable>
          </td>
        </tr>
      </tbody>
    </table>

    <VueDraggable
      v-else
      v-bind="$attrs"
      v-on="$listeners"
    >
      <slot></slot>
    </VueDraggable>
  </div>
</template>

<style lang="scss">
@import '~../Datatable/Datatable.scss';
@import 'Draggable.scss';
</style>
