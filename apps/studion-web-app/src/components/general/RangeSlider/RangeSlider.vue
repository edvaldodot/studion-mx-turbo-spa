<script>
export default {
  name: 'rangeSlider',
  data () {
    return {
      isFocused: false,
      ticksNumber: 0,
      digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    }
  },
  props: {
    label: {
      type: String,
      default: null
    },
    ticks: {
      type: Boolean,
      default: false
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    readonly: {
      type: Boolean,
      defaut: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    fixedLabel: {
      type: Boolean,
      default: true
    },
    dark: {
      type: Boolean,
      default: false
    },
    value: null,
    validation: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  watch: {
    max () {
      this.calculateTicks()
    },
    min () {
      this.calculateTicks()
    },
    step () {
      this.calculateTicks()
    },
    label () {
      this.calculateLabelSize()
    }
  },
  methods: {
    updateFocus () {
      this.isFocused = true
    },
    updateBlur () {
      this.isFocused = false
    },
    keyLeft () {
      if (this.value > this.min) {
        let newValue = this.value - this.step
        newValue = newValue < this.min ? this.min : newValue
        this.$emit('input', newValue)
      }
    },
    keyRight () {
      if (this.value < this.max) {
        let newValue = this.value + this.step
        newValue = newValue > this.max ? this.max : newValue
        this.$emit('input', newValue)
      }
    },
    checkDigits ({ key }) {
      if (this.digits.includes(key)) {
        this.$emit('input', Math.round(parseInt(key) / 10 * this.max))
      }
    },
    calculateTicks () {
      this.ticksNumber = Math.ceil((this.max - this.min) / this.step) + 1
    },
    roundValue (value) {
      return 1 * (Math.round(value / this.step) * this.step).toFixed(0)
    },
    onDragged ({ clientX }) {
      const {
        left: offsetLeft,
        width: trackWidth
      } = this.$refs.track.getBoundingClientRect()
      const left = Math.min(Math.max((clientX - offsetLeft) / trackWidth, 0), 1)
      if (clientX >= offsetLeft - 8 && clientX <= offsetLeft + trackWidth + 8) {
        let newValue = parseFloat(this.min) + left * (this.max - this.min)
        this.$emit('input', this.roundValue(newValue))
      }
    },
    calculateLabelSize () {
      this.$refs.slider.style.paddingLeft = `${this.$refs.label.offsetWidth + 20}px`
    }
  },
  mounted () {
    this.calculateTicks()
    this.calculateLabelSize()
  }
}
</script>

<template>
  <div class="form-item" :class="{ 'has-error': validation.$error, 'has-value': value !== null, 'has-focus': isFocused, 'is-disabled': disabled, 'has-fixed-label': fixedLabel, 'theme-dark': dark, 'has-fixed-label': label }">
    <div class="range-slider-wrapper"
      ref="slider"
      :tabindex="disabled ? -1 : 0"
      @keydown.left="keyLeft()"
      @keydown.right="keyRight()"
      @keyup="checkDigits($event)"
      @focus="updateFocus()"
      @blur="updateBlur()">
      <label class="form-label" ref="label">{{label}}</label>
      <div class="range-slider">
        <div class="range-slider-track" ref="track">
          <div class="range-slider-track-fill" :style="{'width': `${value*100/max}%`}"></div>
        </div>
        <div class="range-slider-ticks" v-if="ticks">
          <div class="range-slider-tick" v-for="(tick, index) in ticksNumber" :key="index" :style="{'left': `${index * step}%`}"></div>
        </div>
        <div class="range-slider-thumb-container" :style="{'left': `${value*100/max}%`}" v-dragged="onDragged">
          <div class="range-slider-thumb"></div>
          <div class="range-slider-thumb-label">{{ value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">@import "RangeSlider.scss"</style>
