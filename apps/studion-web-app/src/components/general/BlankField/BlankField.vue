<template>
  <div class="blank__wrapper">
    <input
      v-autowidth="{ maxWidth: maxWidth, minWidth: minWidth, comfortZone: 0 }"
      :class="{ '--correct': correct }"
      :disabled="disabled"
      :placeholder="disabled ? '' : placeholder"
      :value="value"
      :maxlength="maxChar"
      class="blank__field"
      @input="$emit('input', $event.target.value)"
    />
    <AnswerTooltip
      v-if="notEqualsProfile('student') && correctText"
      :answer="correctText"
    />
  </div>
</template>

<script>
import AnswerTooltip from '@/components/shared/AnswerTooltip'

export default {
  components: {
    AnswerTooltip,
  },
  props: {
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    correct: {
      type: Boolean,
      default: false,
    },
    maxWidth: {
      type: String,
      default: '280px',
    },
    minWidth: {
      type: String,
      default: '70px',
    },
    maxChar: {
      type: Number,
      default: 30,
    },
    correctText: {
      type: String,
      default: '',
    },
  },
  computed: {
    tooltipContent() {
      return `<p class='answer answer__title'>${this.$t(
        'classroom.assessments.evaluation:answer.correct'
      )}</p><p class='answer answer__text'>${this.correctText}</p>`
    },
  },
}
</script>

<style lang="scss">
@import 'BlankField.scss';
</style>
