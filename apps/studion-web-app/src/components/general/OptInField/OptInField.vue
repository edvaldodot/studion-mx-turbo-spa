<script>
import Icon from '../Icon'
import Checkbox from '../Checkbox'

export default {
  name: 'checkboxItem',
  components: {
    Icon,
    Checkbox,
  },
  props: {
    switchType: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: null,
    },
    alignRight: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: null,
    },
    labelWarning: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    value: null,
    index: {
      type: Number,
      default: null,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    unique: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object,
      default: null,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      isFocused: false,
      isChecked: this.checked,
    }
  },
  watch: {
    checked(value) {
      this.isChecked = value
    },
    value(value) {
      this.isChecked = value
    },
  },
  mounted() {
    this.isChecked = this.value || this.checked
  },
  methods: {
    updateValue() {
      this.isChecked = !this.isChecked
      this.$emit('input', this.isChecked)
    },
    updateFocus() {
      this.isFocused = true
    },
    updateBlur() {
      this.isFocused = false
    },
    checkLinkInside(event) {
      event.target.nodeName === 'A' && this.$emit('label-link')
    },
  },
}
</script>

<template>
  <div
    class="opt-in"
    :class="{ 'opt-in--dark': dark }"
  >
    <p
      class="opt-in__header"
      v-html="config.head"
    ></p>
    <checkbox
      v-model="isChecked"
      :items="[{ value: true, label: config.title }]"
      :dark="dark"
      :validation="validation"
      :disabled="disabled"
      :readonly="readonly"
      @change="updateValue"
    />
  </div>
</template>

<style>
.opt-in {
  margin-bottom: 20px;
  cursor: pointer;
  user-select: none;
}

.opt-in__header {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.6em;
  margin-bottom: 10px;
}

.opt-in__header a {
  color: rgba(0, 0, 0, 0.5);
  font-weight: bold;
}

.opt-in.opt-in--dark .opt-in__header,
.opt-in.opt-in--dark .opt-in__header a {
  color: var(--text-color);
}

.opt-in .form-item.theme-dark .form-checkbox-item .form-checkbox-label a {
  color: rgba(0, 0, 0, 0.5);
}

.opt-in.opt-in--dark .form-item.theme-dark .form-checkbox-item .form-checkbox-label a {
  color: var(--text-color);
}
</style>
