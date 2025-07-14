<script>
import cloneDeep from 'lodash/cloneDeep'
import Autocomplete from '@/components/general/Autocomplete'

export default {
  name: 'AsyncAutocomplete',

  components: {
    Autocomplete
  },

  props: {
    /**
     * A callback promise function to retrieves items for autocomplete.
     */
    asyncRequest: {
      type: Function,
      required: true
    },

    disabled: {
      type: Boolean,
      default: false
    },

    icon: {
      type: String,
      default: 'arrow_drop_down'
    },

    label: {
      type: String,
      required: true
    },

    optionProperty: {
      type: String,
      required: true
    },

    validation: {
      type: Object,
      required: true
    },

    value: {
      type: Object,
      default: () => {}
    },

    valueKey: {
      type: String,
      required: true
    },

    optionalParams: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      autocomplete: {
        items: [],
        loading: false
      }
    }
  },

  methods: {

    /**
     * Due to the API return inconsistency of the data field,
     * this check is necessary to get the items from the response.
     * @param {(object|array)} nestedResponse
     */
    getItemsFromResponse ({ data: nestedResponse }) {
      const responseItems = nestedResponse && nestedResponse.length ? nestedResponse : nestedResponse.data
      this.autocomplete.items = responseItems
    },

    /**
     * This function defines loading state of autocomplete
     * and set item option base o callback prop.
     * @param {string} queryName
     */
    getAutocompleteItems (queryName) {
      if (!queryName || !queryName.length) {
        this.autocomplete.items = []
        return
      }

      this.autocomplete.loading = true

      this.asyncRequest({ query: queryName, params: this.optionalParams })
        .then(this.getItemsFromResponse)
        .finally(() => {
          this.autocomplete.loading = false
        })
    },

    /**
     * Returns a object with attribute "selected".
     * @param {object} item
     * @returns {object}
     */
    setSelected (item) {
      return cloneDeep({
        ...item,
        selected: true
      })
    },

    /**
     * If it has a valid value, defines the items for the component to identify and select as the initial value.
     */
    setInitialItemSelected () {
      const actualValue = this.value && this.value[this.valueKey]
      if (!actualValue) return

      if (Array.isArray(actualValue)) {
        this.autocomplete.items = actualValue.map(item => {
          if (typeof item !== 'object') return item
          return this.setSelected(item)
        })
      }

      const hasKeys = typeof actualValue === 'object' && Object.keys(actualValue)
      if (hasKeys && hasKeys.length) {
        this.autocomplete.items.push(this.setSelected(actualValue))
      }
    }
  },

  created () {
    this.setInitialItemSelected()
  }
}
</script>

<template>
  <autocomplete
    async
    v-model="value[valueKey]"
    :validation="validation[valueKey]"
    :label="label"
    :items="autocomplete.items"
    :loading="autocomplete.loading"
    :option-property="optionProperty"
    :appendIcon="icon"
    @search="getAutocompleteItems"
    :disabled="disabled"
    dark
  />
</template>
