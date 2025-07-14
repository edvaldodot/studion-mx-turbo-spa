<script>
import { mapActions } from 'vuex'

import Autocomplete from '@/components/general/Autocomplete'

export default {
  name: 'autocompleteBranches',
  components: {
    Autocomplete
  },
  data () {
    return {
      mutableBranchesSelected: [],
      autocompleteItems: [],
      autocompleteLoading: false
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
    all: {
      type: Boolean,
      default: false
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
      'attemptBranchesListByNameRetrieval'
    ]),
    getBranchesList (value) {
      let newval = value.split(' ').join(',')
      if (value.length) {
        this.mutableBranchesSelected = null
        this.autocompleteLoading = true
        this.attemptBranchesListByNameRetrieval({
          branchName: newval,
          all: this.all
        }).then(({ data }) => {
          this.autocompleteLoading = false
          this.autocompleteItems = data.map(({id, namegroup}) => ({id, name: namegroup}))
        }).catch(() => {
          this.autocompleteLoading = false
          this.autocompleteItems = []
        })
      }
      return true
    }
  },
  watch: {
    mutableBranchesSelected () {
      if (this.mutableBranchesSelected) {
        this.$emit('input', this.mutableBranchesSelected)
      }
    },
    value: {
      deep: true,
      immediate: true,
      handler (newVal) {
        this.mutableBranchesSelected = newVal
      }
    }
  }
}
</script>

<template>
  <autocomplete
    async
    :disabled="disabled"
    :floating-label="floatingLabel"
    :label="label"
    :items="autocompleteItems"
    :loading="autocompleteLoading"
    option-property="name"
    appendIcon="search"
    v-model="mutableBranchesSelected"
    :validation="validation"
    @search="getBranchesList($event)"
    :max-value='-1'
    :dark="dark">

  </autocomplete>
</template>
