<script>
import Icon from '../Icon'
import RadioItem from '../RadioItem'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'radio',
  components: {
    Icon,
    RadioItem,
    ValidationMessage
  },
  data () {
    return {
      mutableValue: this.value,
      mutableItems: this.deepClone(this.items),
    }
  },
  props: {
    description: {
      type: String,
      default: null
    },
    value: null,
    validation: {
      type: Object,
      default: () => { return {} }
    },
    items: {
      type: Array,
      default: () => { return [] }
    },
    hint: {
      type: String,
      default: null
    },
    horizontal: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    custom: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: false
    },
    dynamic: {
      type: Boolean,
      default: false
    },

    details: {
      type: Boolean,
      default: true,
    },
    labelAsClass: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    value (value) {
      this.mutableValue = value
    },
    disabled () {
      this.updateItems()
    },
    items () {
      if (this.dynamic) this.mutableItems = this.deepClone(this.items)
    }
  },
  computed: {
    isRequired () {
      return this.validation.$params && typeof this.validation.$params.required === 'object'
    }
  },
  methods: {
    updateValue (value) {
      typeof this.validation.$touch === 'function' && this.validation.$touch()
      this.mutableValue = value
      this.$emit('input', this.mutableValue)
    },
    checkState (value) {
      return value !== undefined ? value === this.mutableValue : false
    },
    updateItems() {
      this.mutableItems = this.dynamic ? this.items : this.mutableItems

      if (this.disabled) {
        this.mutableItems = this.mutableItems.map((obj) => {
          return { ...obj, disabled: true }
        })
      }
    },
  },
  created () {
    this.updateItems()
  }
}
</script>

<template>
  <div class="form-item" :class="{ 'has-error': validation.$error, 'form-item-horizontal': horizontal, 'theme-dark': dark }">
    <p class="form-item-description" v-if="description">{{ description }} <span v-if="!isRequired && !disabled">{{ $t('global:form.optional') }}</span></p>
    <radio-item
      v-for="(item, index) in mutableItems"
      :key="index"
      :label="item.label"
      :disabled="item.disabled"
      :readonly="item.readonly"
      :checked="checkState(item.value)"
      :custom="custom"
      :value="item.value"
      :name="_uid"
      :label-as-class="labelAsClass"
      @change="updateValue"
    >
      <template slot="precontent">
        <slot name="precontent" :item="item"></slot>
      </template>
      <template slot="actions">
        <slot name="actions" :item="item"></slot>
      </template>
    </radio-item>
    <div v-if="details" class="form-input-details">
      <span v-if="hint && !validation.$error" class="form-input-hint">{{ hint }}</span>
      <validation-message :validation="validation" />
    </div>
  </div>
</template>

<style lang="scss">@import "Radio.scss"</style>