<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'TreeSelect',
  components: {
    Treeselect,
    ValidationMessage,
  },
  props: {
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    label: {
      type: String,
      default: () => null,
    },
    hint: {
      type: String,
      default: () => null,
    },
    required: {
      type: Boolean,
      default: () => false,
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    classes() {
      return {
        '--error': this.validation.$error,
        '--disabled': this.disabled,
      }
    },
    elementId() {
      return `tree-elect-${this._uid}`
    },
  },
  methods: {
    // TODO: adicionar hint ao abrir menu
    addHintInMenu() {
      const hintElement = document.createElement('div')
      const hintText = document.createTextNode(this.hint)
      hintElement.appendChild(hintText)

      const menu = document.querySelector(
        `#${this.elementId} .vue-treeselect__menu-container .vue-treeselect__menu`
      )
      menu.appendChild(hintElement)
    },
  },
}
</script>
<template>
  <div
    :data-testid="$testId('tree-select')"
    :class="['tree-select', classes]"
  >
    <label
      :for="elementId"
      class="tree-select__label"
    >
      {{ label }}
      <span
        v-show="required"
        class="label__required"
      >
        *
      </span>
    </label>
    <div class="tree-select__wrapper">
      <Treeselect
        :id="elementId"
        v-bind="$attrs"
        :disabled="disabled"
        :no-results-text="$t('global:form.select.no.options')"
        v-on="$listeners"
      />
    </div>
    <div class="tree-select__details">
      <div
        v-if="!validation.$error"
        class="details__hint"
      >
        {{ hint }}
      </div>
      <ValidationMessage :validation="validation" />
    </div>
  </div>
</template>
<style lang="scss">
@import 'TreeSelect.scss';
</style>
