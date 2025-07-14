<script>
import Action from '@/components/general/Action'

export default {
  name: 'FilterToggleView',

  components: {
    Action
  },

  props: {
    initialViewState: {
      type: Boolean,
      required: true
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      toggle: this.initialViewState
    }
  },

  watch: {
    initialViewState: {
      immediate: true,
      handler (value) {
        this.toggle = value
      }
    }
  },

  methods: {
    /**
     *
     * @param {Boolean} state
     */
    setToggle (state) {
      if (this.toggle === state) return
      this.toggle = state
      this.$emit('toggle', state)
    }
  }
}
</script>

<template>
  <div class="filter-toggle-view">
    <action
      :class="{ active: toggle }"
      type="button"
      icon="view-filtered-list"
      @click="setToggle(true)"
      :disabled="disabled"
    />

    <action
      :class="{ active: !toggle, disabled }"
      type="button"
      icon="view-full-list"
      @click="setToggle(false)"
      :disabled="disabled"
    />
  </div>
</template>

<style lang="scss">
@import "FilterToggleView.scss";
</style>
