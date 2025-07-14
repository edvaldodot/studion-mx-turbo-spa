<script>
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'RadioIconSelector',
  components: { ValidationMessage },
  props: {
    value: {
      type: String,
      default: null,
    },
    icons: {
      type: Array,
      default: () => [],
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hint: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
  },
  computed: {
    isRequired() {
      return this.validation && this.validation.$params && this.validation.$params.required
    },
  },
  methods: {
    selectIcon(iconValue) {
      if (!this.disabled) {
        if (typeof this.validation.$touch === 'function') {
          this.validation.$touch()
        }
        this.$emit('input', iconValue)
        this.$emit('change', iconValue)
      }
    },
  },
}
</script>

<template>
  <div class="icon-radio-wrapper">
    <p
      v-if="label"
      class="selector-label"
    >
      {{ label }}
      <span
        v-show="isRequired"
        class="label__required"
      >
        *
      </span>
      <span
        v-if="!isRequired && !disabled"
        class="optional-text"
      >
        {{ $t('global:form.optional') }}
      </span>
    </p>

    <div class="icon-radio">
      <label
        v-for="icon in icons"
        :key="icon.value"
        class="icon-option"
        :class="{ selected: value === icon.value, disabled: icon.disabled || disabled }"
        @click="selectIcon(icon.value)"
      >
        <span class="material-symbols-outlined">{{ icon.name }}</span>
      </label>
    </div>

    <div
      v-if="hint || (validation && validation.$error)"
      class="icon-selector-details"
    >
      <span
        v-if="hint && !(validation && validation.$error)"
        class="form-input-hint"
        >{{ hint }}</span
      >
      <validation-message
        v-if="validation"
        :validation="validation"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import 'RadioIconSelector.scss';
</style>
