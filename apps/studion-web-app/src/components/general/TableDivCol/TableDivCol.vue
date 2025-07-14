<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TableDivCol',

  props: {
    label: {
      type: String,
      default: '',
    },
    enableLabel: {
      type: Boolean,
      default: false,
    },
    breakLabelLine: {
      type: Boolean,
      default: false,
    },
    fill: {
      type: Boolean,
      default: false,
    },
    bolder: {
      type: Boolean,
      default: false,
    },
    minWidth: {
      type: String,
      default: '',
    },
    maxWidth: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '',
    },
    alignRight: {
      type: Boolean,
      default: false,
    },
    pSize: {
      type: Boolean,
      default: false,
    },
    mobileOptions: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('table-div-col')"
    class="table-div__col"
    :class="{
      bolder,
      fill,
      'align-right': alignRight,
      'p-size': pSize,
      'mobile-options': mobileOptions,
    }"
    :style="{
      width: width,
      'min-width': minWidth,
      'max-width': maxWidth,
    }"
  >
    <span class="col__label"> {{ enableLabel ? label + ':' : '' }}</span>
    <br v-if="$media.mobile && breakLabelLine" />
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import './TableDivCol.scss';
</style>
