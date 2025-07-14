<script>
import BlankField from '../BlankField'

export default {
  components: {
    BlankField,
  },
  props: {
    text: {
      type: String,
      required: true,
    },
    value: {
      type: Array,
      default: () => [],
    },
    rightItems: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    rightItemsText: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      statementItems: [],
      internValue: [],
    }
  },
  watch: {
    value(newValue) {
      this.internValue = newValue
    },
  },
  created() {
    let items = this.text.split(/\[\d+\]/g)
    let reg = /\[\d+\]/g
    let matchs = [...this.text.matchAll(reg)]
    this.internValue = matchs.map((i) => '')
    if (this.value) this.internValue = this.value
    this.statementItems = items
  },

  methods: {
    getRightItemText(index) {
      if (this.rightItemsText) return this.rightItemsText[index]
      return ''
    },
  },
}
</script>

<template>
  <div class="blank__wrapper">
    <span
      v-for="(item, index) in statementItems"
      :key="index"
    >
      <span
        v-if="item !== ''"
        :key="index"
        class="blank__text"
        v-html="item"
      ></span>
      <blank-field
        v-if="index !== statementItems.length - 1"
        v-model="internValue[index]"
        :correct-text="getRightItemText(index)"
        :placeholder="placeholder"
        :correct="rightItems[index] ? rightItems[index] : false"
        :disabled="disabled"
        @input="$emit('input', internValue)"
      />
    </span>
  </div>
</template>

<style lang="scss">
@import 'FillBlankField.scss';
</style>
