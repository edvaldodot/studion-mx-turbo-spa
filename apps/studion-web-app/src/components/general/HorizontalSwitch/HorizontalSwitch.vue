<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'HorizontalSwitch',
  props: {
    options: {
      type: Array,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    rootClass: {
      type: String,
      default: '',
    },
    optionsClass: {
      type: String,
      default: '',
    },
    optionClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      selected: '',
      transitionClass: '',
    }
  },
  computed: {
    currentIndex() {
      return this.options.findIndex((val) => this.value === val.value)
    },
    optionWidth() {
      return 100 / this.options.length
    },
    selectedLeft() {
      return `calc(${this.optionWidth * this.currentIndex}% + 3px)`
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.selected = this.options.find((val) => val.value === newVal).text
      },
    },
  },
  methods: {
    selectOption(index) {
      const currentItem = this.options[index]
      this.selected = currentItem.text
      this.transitionClass = 'slide-transition'
      this.$emit('input', currentItem.value)

      setTimeout(() => {
        this.transitionClass = ''
      }, 300)
    },
  },
})
</script>
<template>
  <div
    class="horizontal-switch"
    :style="{ width: options.length * 100 + 'px' }"
    :class="rootClass"
  >
    <div
      class="options"
      :style="{ width: options.length * 100 + 'px' }"
      :class="optionsClass"
    >
      <div
        v-for="(option, index) in options"
        :key="option.value"
        class="option"
        :class="[
          {
            active: selected === option.value,
            left: index < currentIndex,
            right: index > currentIndex,
          },
          optionClass,
        ]"
        :style="{ width: optionWidth + '%', left: index * optionWidth + '%' }"
        @click="selectOption(index)"
      >
        {{ option.text }}
      </div>
      <div
        class="highlight"
        :style="{ width: `calc(${optionWidth}% - 6px)`, left: selectedLeft }"
      >
        <span class="highlight-text">{{ selected }}</span>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import 'HorizontalSwitch.scss';
</style>
