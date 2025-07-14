<script>
/**
 * TODO: Create a state for management if tips are displayed
 * A state to enable/disable hints will be implemented in the future
 * Use this component when this action is needed
 *
 * See left bottom of this XD
 * @more https://xd.adobe.com/view/db52e939-cc5d-49dd-a50e-5a82a247ebcc-8e01/screen/6d52c138-2008-4af7-9c23-b64d55c85d32/?x_product=xd-jiraserver%2F1.0
 */
import { defineComponent } from 'vue'
import TooltipSlot from '../TooltipSlot'

export default defineComponent({
  name: 'AppTips',

  components: {
    TooltipSlot,
  },

  props: {
    shadow: {
      type: Boolean,
      deafult: false,
    },
    dark: {
      type: Boolean,
      deafult: true,
    },
    smallFont: {
      type: Boolean,
      deafult: false,
    },
    arrow: {
      type: Boolean,
      deafult: false,
    },
    marginTop: {
      type: String,
      default: '0px',
    },
  },
})
</script>

<template>
  <div class="tips">
    <TooltipSlot
      :width="330"
      :uppercase="false"
      :shadow="shadow"
      :arrow="arrow"
      :dark="dark"
      :margin-top="marginTop"
    >
      <template #activator="{ on }">
        <div
          class="tips-activator"
          v-on="on"
        >
          <div class="tips-activator__internal"></div>
        </div>
      </template>

      <template #content>
        <div
          class="tips-content"
          :class="{ 'small-font': smallFont }"
        >
          <slot name="tip" />
        </div>
      </template>
    </TooltipSlot>
  </div>
</template>

<style lang="scss">
@import './Tips.scss';
</style>
