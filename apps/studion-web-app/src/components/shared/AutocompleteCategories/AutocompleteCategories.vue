<script>
import { mapActions } from 'vuex'

import Autocomplete from '@/components/general/Autocomplete'

export default {
  name: 'autocompleteCategories',
  components: {
    Autocomplete
  },
  data () {
    return {
      categoriesList: [],
      mutableCategoriesSelected: []
    }
  },
  props: {
    label: {
      type: String,
      default: null
    },
    floatingLabel: {
      type: Boolean,
      default: true
    },
    value: null,
    dark: {
      type: Boolean,
      default: false
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    ...mapActions([
      'attemptCategoryListRetrieval'
    ])
  },
  watch: {
    mutableCategoriesSelected () {
      this.$emit('input', this.mutableCategoriesSelected && this.mutableCategoriesSelected.length === 0 ? null : this.mutableCategoriesSelected)
    },
    value: {
      immediate: true,
      handler (newVal) {
        this.mutableCategoriesSelected = newVal
      }
    }
  },
  created () {
    this.attemptCategoryListRetrieval().then((categories) => {
      this.categoriesList = categories.data.data
    })
  }
}
</script>

<template>
  <autocomplete
    :disabled="disabled"
    :floating-label="floatingLabel"
    :label="label"
    v-model="mutableCategoriesSelected"
    :items="categoriesList"
    option-property="name"
    :max-value="-1"
    :dark="dark"
    :validation="validation"
  >
  </autocomplete>
</template>
