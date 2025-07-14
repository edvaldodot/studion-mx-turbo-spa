<script>
import Action from '../Action'
import Icon from '../Icon'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'FileField',

  components: {
    Action,
    Icon,
    ValidationMessage,
  },

  props: {
    applyMargin: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: null,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: '*',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    chooseDesign: {
      type: Number,
      default: 1,
    },
    value: null,
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    hint: {
      type: String,
      default: null,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    canRemove: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isFocused: false,
      mutableValue: null,
    }
  },

  computed: {
    showRemove() {
      return this.canRemove && this.mutableValue
    },

    classes() {
      return {
        '--error': this.validation.$error,
        'has-value': this.hasValue,
        'has-focus': this.isFocused,
        '--disabled': this.disabled,
        'theme-dark': this.dark,
      }
    },

    hasValue() {
      return this.value != null && this.value.toString().length > 0
    },
  },

  watch: {
    value() {
      if (this.value === null) {
        this.mutableValue = null
      }
    },
  },

  mounted() {
    if (this.value !== null) {
      let fileName = this.value
      if (typeof this.value === 'object') {
        fileName = this.value[0].name
      }
      this.mutableValue = fileName
    }

    this.$forceNextTick(() => {
      if (!this.$refs.label || !this.applyMargin) return
      const labelSize = this.$refs.label.offsetWidth + 20
      this.$refs.wrapper.style.marginLeft = labelSize + 'px'
      if (this.$refs.details) {
        this.$refs.details.style.marginLeft = labelSize + 'px'
      }
    })
  },

  methods: {
    updateValue(fileList) {
      if (fileList[0]) {
        typeof this.validation.$touch === 'function' && this.validation.$touch()
        this.mutableValue = fileList[0].name
        this.$emit('input', fileList)
      }
    },
    updateFocus() {
      this.isFocused = true
    },
    updateBlur() {
      this.isFocused = false
    },
    openFile() {
      this.$refs.label.click()
    },
    clear() {
      this.$refs.input.value = null
    },
    removeFiles() {
      this.$emit('input', null)
    },
  },
}
</script>

<template>
  <div
    class="file-field"
    :class="[classes, 'is-valid']"
  >
    <label
      v-if="label"
      ref="label"
      class="file-field__label"
      :for="'input' + _uid"
    >
      {{ label }}
    </label>
    <div
      v-if="chooseDesign === 1"
      ref="wrapper"
      class="file-field__wrapper"
    >
      <input
        :id="'input' + _uid"
        ref="input"
        class="file-field__input"
        spellcheck="false"
        type="file"
        :multiple="multiple"
        :disabled="disabled"
        :readonly="readonly"
        :accept="accept"
        @change="updateValue($event.target.files)"
        @focus="updateFocus()"
        @blur="updateBlur()"
      />
      <input
        class="file-field__input-value border-primary"
        type="text"
        readonly
        :value="mutableValue"
        :title="mutableValue"
        tabindex="-1"
        @click="openFile"
      />
      <div
        v-if="showRemove"
        class="form-input-append"
      >
        <action
          small
          type="button"
          icon="close"
          icon-size="medium"
          @click="removeFiles"
        />
      </div>
    </div>
    <div
      v-if="chooseDesign === 2"
      ref="wrapper"
      class="form-input-wrapper file-2"
    >
      <input
        :id="'input' + _uid"
        ref="input"
        class="form-input-file-2"
        spellcheck="false"
        type="file"
        :multiple="multiple"
        :disabled="disabled"
        :readonly="readonly"
        :accept="accept"
        @change="updateValue($event.target.files)"
        @focus="updateFocus()"
        @blur="updateBlur()"
      />
      <div
        class="form-input-prepend"
        style="z-index: 1; color: #5c2e91"
      >
        <icon name="file-pdf"></icon>
      </div>
      <input
        class="form-input border-primary"
        type="text"
        readonly
        :value="mutableValue"
        tabindex="-1"
        @click="openFile"
      />
      <div class="form-input-append">
        <icon name="download"></icon>
      </div>
    </div>
    <div
      v-if="hint || Object.keys(validation).length"
      ref="details"
      class="form-input-details"
    >
      <span
        v-if="hint && !validation.$error"
        class="form-input-hint"
        >{{ hint }}</span
      >
      <validation-message :validation="validation"></validation-message>
    </div>
  </div>
</template>

<style lang="scss">
@import 'FileField.scss';
</style>
