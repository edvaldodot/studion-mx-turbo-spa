<script>
import { defineComponent } from 'vue'

import Action from '../Action'
import Modal from '../Modal'

export default defineComponent({
  name: 'FilterToggle',

  components: {
    Action,
    Modal,
  },

  props: {
    open: {
      type: Boolean,
      default: false,
    },

    dark: {
      type: Boolean,
      default: false,
    },

    toggle: {
      type: Boolean,
      default: false,
    },

    hasFilter: {
      type: Boolean,
      default: false,
    },

    isModal: {
      type: Boolean,
      default: false,
    },

    numberFiltersSelect: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      openSlot: false,
    }
  },

  computed: {
    activeFilterNumber() {
      return this.numberFiltersSelect ? String(this.numberFiltersSelect) : null
    },
  },

  mounted() {
    this.openSlot = this.open
  },

  methods: {
    toggleSlot() {
      this.openSlot = !this.openSlot
    },

    triggerManualFilter(clear) {
      this.$emit('trigger:manual', clear)
      this.toggleSlot()
    },
  },
})
</script>

<template>
  <div class="filter-toggle">
    <div
      v-if="$media.mobile && toggle"
      class="filter-toggle-button-area"
      :class="{ 'open-filter': openSlot }"
    >
      <Action
        class="filter-toggle-button"
        :class="{
          dark,
          'open-filter': openSlot,
          'has-filters': hasFilter,
          'has-number': activeFilterNumber,
        }"
        :text="activeFilterNumber"
        type="button"
        icon="filter"
        flat
        @click="toggleSlot"
      />
    </div>

    <Modal
      v-if="isModal"
      :active="openSlot"
      class="modal-toggle-filter"
      back
      without-label
      only-close-one-modal
      @close="toggleSlot"
    >
      <div class="modal-nav">
        <p class="title">{{ $t('global:filters') }}</p>

        <Action
          :text="$t('global:clear')"
          class="clear"
          type="button"
          @click="triggerManualFilter(true)"
        />
      </div>

      <div class="modal-toggle-filter-content">
        <slot></slot>
      </div>

      <Action
        :text="`${$t('global:apply')} ${$t('global:form.filter')}`"
        class="apply"
        type="button"
        secondary
        @click="triggerManualFilter(false)"
      />
    </Modal>

    <transition
      v-else-if="toggle"
      :name="$media.mobile && toggle ? 'filter-toggle-fade' : ''"
    >
      <div
        v-show="!$media.mobile || (openSlot && toggle) || !toggle"
        class="filter-toggle-container"
      >
        <slot></slot>
      </div>
    </transition>

    <div
      v-else
      class="filter-toggle-container"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import 'FilterToggle.scss';
</style>
