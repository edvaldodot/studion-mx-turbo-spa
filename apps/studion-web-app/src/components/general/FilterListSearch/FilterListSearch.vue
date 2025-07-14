<script>
import { defineComponent } from 'vue'
import debounce from 'lodash/debounce'

import Action from '../Action'
import InputField from '../InputField'
import Button from '../Button'

export default defineComponent({
  name: 'FilterListSearch',

  components: {
    Action,
    InputField,
    Button,
  },

  props: {
    initialValue: {
      type: String,
      default: null,
    },

    dark: {
      type: Boolean,
      default: false,
    },

    hideErrorDetails: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      open: false,
      search: null,
      allowEmitSearch: true,
      showSearch: false,
    }
  },
  watch: {
    search: debounce(function () {
      if (!this.allowEmitSearch) {
        this.allowEmitSearch = true
        return
      }

      this.$emit('search', this.search)
    }, 500),
  },

  created() {
    this.setupInitialValue()
  },

  methods: {
    openSearchForm() {
      this.open = true
      this.$emit('tagAllFilters', false)
      this.$nextTick(() => {
        this.$refs.inputfield && this.$refs.inputfield.$refs.input.focus()
      })
    },

    closeSearchForm() {
      if (this.search && this.search.length) {
        return
      }
      this.open = false
      this.$emit('tagAllFilters', true)
    },

    searchValue() {},

    clearSearch() {
      this.search = null
      this.closeSearchForm()
    },

    setupInitialValue() {
      if (!this.initialValue) return
      this.allowEmitSearch = false
      this.search = this.initialValue
      this.open = true
    },

    handlerShowSearch() {
      this.showSearch = !this.showSearch
    },
  },
})
</script>

<template>
  <div class="filter-list-search">
    <Button
      v-show="!showSearch"
      inner-prepend-icon="search"
      icon="search"
      @mouseover="handlerShowSearch"
    >
      {{ $t('global:search') }}
    </Button>
    <form
      v-show="showSearch"
      ref="formSearch"
      :class="{ opened: open }"
      class="filter-search__form p-0 m-0"
      @submit.prevent="searchValue()"
    >
      <InputField
        ref="inputfield"
        v-model="search"
        :dark="dark"
        :hide-error-details="hideErrorDetails"
        :placeholder="$t('global:search')"
        prepend-icon="search"
        @blur="closeSearchForm"
        @focus="openSearchForm()"
        @prependAction="openSearchForm()"
        @wrapperClick="openSearchForm"
        @mouseleave="handlerShowSearch"
      >
        <Action
          slot="button"
          class="filter-search__clear"
          icon="close"
          type="button"
          @click="clearSearch()"
        />
      </InputField>
    </form>
  </div>
</template>

<style lang="scss">
@import 'FilterListSearch.scss';
</style>
