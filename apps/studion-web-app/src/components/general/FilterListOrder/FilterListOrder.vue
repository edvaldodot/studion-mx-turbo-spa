<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import orderBy from 'lodash/orderBy'

import i18n from '@/support/i18n'
import SelectField from '../SelectField'
import Button from '../Button'

export default defineComponent({
  name: 'FilterListOrder',

  components: {
    SelectField,
    Button,
  },

  props: {
    initialValue: [Object, Array],
    options: {
      type: Array,
      default: () => [],
    },
    state: {
      type: String,
      default: null,
    },
    onServer: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: null,
    },
    largeWidth: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      orderData: null,
      showOrder: false,
    }
  },

  computed: {
    ...mapState(['accessibility']),

    isSearching() {
      return (
        this.$store.state[this.state] &&
        this.$store.state[this.state].search &&
        this.$store.state[this.state].search.length
      )
    },
    items() {
      const state = this.$store.state[this.state]
      return (state && (state.search || state.items)) || []
    },
    buttonLabel() {
      if (this.label) {
        return this.label
      }
      return i18n.t('global:filter.order.label')
    },
  },

  watch: {
    orderData() {
      if (this.orderData !== null) {
        if (this.onServer) {
          const value = Array.isArray(this.orderData)
            ? this.orderData
            : this.options[this.orderData]
          this.$emit('update-orders', value)
        } else {
          let type = this.options[this.orderData].type
          let property = this.options[this.orderData].property
          let arrayOrdered = orderBy(this.items, property, type)
          if (this.isSearching) {
            this.$store.state[this.state].search = arrayOrdered
          } else {
            this.$store.state[this.state].items = arrayOrdered
          }
        }
        return
      }

      this.$emit('update-orders', null)
    },

    isSearching() {
      if (!this.isSearching) {
        this.orderData = null
      }
    },
  },

  created() {
    this.setupInitialValue()
  },

  methods: {
    setupInitialValue() {
      if (!this.initialValue) {
        this.orderData = 'multiple' in this.$attrs ? [] : null
        return
      }

      let selectedValue = null

      if (Array.isArray(this.initialValue)) {
        this.orderData = this.initialValue
        return
      }

      Object.entries(this.initialValue).forEach(([key, value]) => {
        if (typeof selectedValue === 'number' || typeof selectedValue === 'string') return
        selectedValue = this.options.find((option) => {
          return option.property === key && option.type === value
        })
      })

      this.orderData = selectedValue ? selectedValue.value : null
    },
    handlerShowOrder() {
      this.showOrder = !this.showOrder
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('filter-list-order')"
    class="filter-list-order"
  >
    <Button
      v-show="!showOrder"
      inner-prepend-icon="filter_list"
      icon="filter_list"
      @mouseover="handlerShowOrder"
    >
      {{ buttonLabel }}
    </Button>
    <SelectField
      v-show="showOrder"
      v-model="orderData"
      hide-error-details
      :placeholder="buttonLabel"
      :floating-label="false"
      :items="options"
      :dark="dark"
      v-bind="$attrs"
    />
  </div>
</template>

<style lang="scss">
@import 'FilterListOrder.scss';
</style>
