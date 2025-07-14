<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import Action from '../Action'

export default defineComponent({
  name: 'FilterListType',

  components: {
    Action,
  },

  props: {
    initialValue: {
      type: Boolean,
      default: false,
    },

    icons: {
      type: Array,
      default: () => {
        return ['view-module', 'view-list']
      },
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    dark: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      listingMode: false,
    }
  },

  computed: {
    ...mapState(['accessibility']),
  },

  watch: {
    initialValue() {
      this.setupInitialState()
    },
  },

  created() {
    this.setupInitialState()
  },

  methods: {
    setupInitialState() {
      this.listingMode = this.initialValue
    },

    changeListingType() {
      if (this.disabled === false) {
        this.listingMode = !this.listingMode
        this.$emit('change', this.listingMode)
      }
    },
  },
})
</script>

<template>
  <div class="filter-item filter-type">
    <Action
      v-if="icons[0]"
      type="button"
      :icon="icons[0]"
      class="filter-item-link"
      :class="{ 'is-active text-primary': !listingMode, 'text-black-500': listingMode }"
      @click="changeListingType"
    />

    <Action
      v-if="icons[1]"
      type="button"
      :icon="icons[1]"
      class="filter-item-link"
      :class="{ 'is-active text-primary': listingMode, 'text-black-500': !listingMode }"
      @click="changeListingType"
    />
  </div>
</template>

<style lang="scss">
@import '~../FilterList/FilterList.scss';
</style>
