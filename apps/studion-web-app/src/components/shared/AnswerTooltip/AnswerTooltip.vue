<template>
  <tooltip arrow dark :uppercase="false">
    <template v-slot:activator="{ on }">
      <span
        @mouseenter="on.mouseenter"
        @mouseleave="on.mouseleave"
        class="tooltip__activator"
      >
      <icon name="info"/>
      </span>
    </template>
    <div v-html="tooltipContent">
    </div>
  </tooltip>
</template>
<script>
import Tooltip from '@/components/general/Tooltip'
import Icon from '@/components/general/Icon'

export default {
  components: {
    Tooltip,
    Icon
  },
  props: {
    answer: {
      type: String,
      default: ''
    }
  },
  computed: {
    tooltipContent () {
      return `<p class='answer answer__title'>${this.$t('classroom.assessments.evaluation:answer.correct')}</p><p class='answer answer__text'>${this.answer}</p>`
    }
  }
}
</script>
<style lang="scss">
  @import "AnswerTooltip.scss";
</style>
