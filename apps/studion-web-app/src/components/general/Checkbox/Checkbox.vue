<script>
import CheckboxItem from '../CheckboxItem'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'Checkbox',
  components: {
    CheckboxItem,
    ValidationMessage,
  },
  props: {
    description: {
      type: String,
      default: null,
    },
    switchType: {
      type: Boolean,
      default: false,
    },
    value: null,
    validation: {
      type: Object,
      default: () => ({}),
    },
    items: {
      type: Array,
      default: () => [],
    },
    itemsWarning: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    grayBg: {
      type: Boolean,
      default: false,
    },
    forceArray: {
      type: Boolean,
      default: false,
    },
    hint: {
      type: String,
      default: null,
    },
    classDescription: {
      type: String,
      default: null,
    },
    classWarn: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      mutableValue: [],
      mutableItems: [],
      emitInside: false,
    }
  },
  computed: {
    isArray() {
      return this.items.length > 1 || this.forceArray
    },
    isRequired() {
      return this.validation.$params && typeof this.validation.$params.required === 'object'
    },
    hasUnique() {
      const index = this.items.findIndex((item) => item.unique)
      return index >= 0
    },
    hasUniqueChecked() {
      let item = this.items.find((item) => item.unique)
      return item != null && this.mutableValue.indexOf(item.value.toString()) > -1
    },
  },
  watch: {
    value() {
      this.$emit('value', this.value)
      this.updateItems()
      !this.emitInside && this.setValue()
      this.emitInside = false
    },
    disabled() {
      this.updateItems()
    },
    items: {
      immediate: true,
      deep: true,
      handler() {
        this.updateItems()
      },
    },
  },
  created() {
    this.setValue()
    this.updateItems()
  },
  methods: {
    updateValue(item) {
      if (item.unique && item.checked) {
        this.mutableValue = []
        this.disableItemsNotUnique(true)
      } else if (item.unique && !item.checked) {
        this.disableItemsNotUnique(false)
      }

      this.$emit('change', item)

      typeof this.validation.$touch === 'function' && this.validation.$touch()
      item.checked ? this.addValue(item.value) : this.removeValue(item.value)
      this.emitInside = true

      this.$emit('input', this.isArray ? this.mutableValue : this.mutableValue.length === 1)
    },
    addValue(value) {
      let editableArray = [...this.mutableValue]
      editableArray.push(value.toString())
      this.mutableValue = [...editableArray]
    },
    removeValue(value) {
      let editableArray = [...this.mutableValue]
      var index = editableArray.indexOf(value.toString())
      editableArray.splice(index, 1)
      this.mutableValue = [...editableArray]
    },
    setValue() {
      if (this.isArray) {
        const falseValue = this.value === undefined || this.value === null
        this.mutableValue = falseValue
          ? []
          : Array.isArray(this.value)
          ? [...this.value]
          : [this.value]
      } else if (this.value) {
        this.addValue(this.value)
      } else if (this.value === false) {
        this.mutableValue = []
      }

      this.checkUniqueChecked()
    },
    checkValue(value) {
      return this.isArray
        ? value !== undefined && this.mutableValue.indexOf(value.toString()) >= 0
        : value === this.value
    },
    disableItemsNotUnique(status) {
      this.mutableItems = this.mutableItems.map((obj) => {
        if (!obj.unique) {
          obj.disabled = status
        }
        return obj
      })
    },
    checkUniqueChecked() {
      if (this.hasUnique) {
        this.hasUniqueChecked ? this.disableItemsNotUnique(true) : this.disableItemsNotUnique(false)
      }
    },
    updateItems() {
      this.mutableItems = this.deepClone(this.items)
      this.mutableItems = this.mutableItems.map((obj) => {
        obj.disabled = obj.disabled
          ? obj.disabled
          : this.disabled
          ? this.disabled
          : this.hasUniqueChecked
          ? !obj.unique
          : false
        obj.unique = obj.unique ? obj.unique : false
        return obj
      })
    },
    labelLink(item) {
      this.$emit('label-link', item)
    },
    getCheckboxItemTestId(item, index) {
      return 'checkbox-item--' + (item.testid ? item.testid : index + 1)
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('checkbox')"
    class="checkbox-form-item form-item checkbox__list"
    :class="{ 'has-error': validation.$error, 'theme-dark': dark, grayBg }"
    @click.stop
  >
    <p
      v-if="description"
      :class="['form-item-description text-color', classDescription]"
    >
      {{ description }}
      <span v-if="!isRequired && !disabled">{{ $t('global:form.optional') }}</span>
    </p>

    <div
      v-for="(item, index) in mutableItems"
      :key="'check' + index"
      class="checkbox__item"
    >
      <CheckboxItem
        class="my-2"
        :data-testid="$testId(getCheckboxItemTestId(item, index))"
        :switch-type="switchType"
        :label="item.label"
        :description="item.description"
        :label-warning="itemsWarning[index] || null"
        :align-right="item.alignRight"
        :disabled="item.disabled"
        :readonly="item.readonly"
        :unique="item.unique"
        :checked="checkValue(item.value)"
        :value="item.value"
        :class-warn="classWarn"
        @change="updateValue"
        @label-link="labelLink(item)"
      />
      <slot
        :item="{ index, item, value: checkValue(item.value) }"
        name="additional-fields"
      />
    </div>

    <div
      v-if="hint || validation.$error"
      class="form-input-details"
    >
      <span
        v-if="hint && !validation.$error"
        class="form-input-hint"
      >
        {{ hint }}
      </span>
      <ValidationMessage :validation="validation" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'Checkbox.scss';
</style>
