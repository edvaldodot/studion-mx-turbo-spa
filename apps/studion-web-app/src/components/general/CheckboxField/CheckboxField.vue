<script>
import CheckboxFieldItem from './CheckboxFieldItem'
import Icon from '../Icon'

export default {
  components: {
    CheckboxFieldItem,
    Icon,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    hoverable: {
      type: Boolean,
      default: false,
    },
    iconRight: {
      type: Boolean,
      default: false,
    },
    filterItems: {
      type: String,
      default: '',
    },
    allOption: {
      type: Boolean,
      default: false,
    },
    selectAllText: {
      type: String,
      default: '',
    },
    value: null,
  },
  computed: {
    isSingle() {
      return this.items.length === 1
    },
    filteredOptions() {
      if (!this.filterItems) return this.items
      return this.items.filter((item) => item.label.toLowerCase().includes(this.filterItems))
    },
    allSelected() {
      if (this.isSingle) return false
      return this.items.length === this.value.length
    },
    isFiltering() {
      return this.items.length !== this.filteredOptions.length
    },
    showSelectAll() {
      return this.allOption && !this.isSingle && !this.isFiltering
    },
  },
  created() {
    if (!this.value) {
      if (this.isSingle) this.$emit('input', false)
      else this.$emit('input', [])
    }
  },
  methods: {
    /**
     * verify if item value is checked to show correct icon
     * @param {Any} itemValue
     */
    isValueChecked(itemValue) {
      if (this.isSingle) return !!this.value
      return this.value.includes(itemValue)
    },
    /**
     * update the state of an item, cheking or uncheking it
     * @param {Any} itemValue
     */
    checkValue(itemValue) {
      if (!this.isSingle) {
        if (!this.isValueChecked(itemValue)) this.$emit('input', [...this.value, itemValue])
        else
          this.$emit(
            'input',
            this.value.filter((item) => item !== itemValue)
          )
        return
      }
      this.$emit('input', !this.value)
    },
    /**
     * Select or unselect all items
     */
    allToggle() {
      if (this.allSelected) this.$emit('input', [])
      else
        this.$emit(
          'input',
          this.items.map((item) => item.value)
        )
    },
  },
}
</script>
<template>
  <div>
    <div
      v-if="showSelectAll"
      class="checkboxfield__item"
      :class="{ '--hoverable': hoverable }"
      @click="allToggle"
    >
      <span class="checkboxfield__all">{{
        selectAllText ? selectAllText : $t('global:form.select.all')
      }}</span>
      <icon
        v-if="allSelected"
        name="check_box"
      ></icon>
      <icon
        v-else-if="value.length !== 0"
        name="checkbox-unselect"
      ></icon>
      <icon
        v-else
        name="check_box_outline_blank"
      ></icon>
    </div>
    <div
      v-if="filteredOptions.length === 0"
      class="checkboxfield__item"
    >
      <span>{{ $t('global:checkboxfield.empty.search') }}</span>
    </div>
    <checkbox-field-item
      v-for="item in filteredOptions"
      :key="item.value"
      :label="item.label"
      :class="{ '--hoverable': hoverable, '--hoverable-icon': hoverable }"
      :checked="isValueChecked(item.value)"
      @check="checkValue(item.value)"
    >
    </checkbox-field-item>
  </div>
</template>
<style lang="scss">
@import 'CheckboxField.scss';
</style>
