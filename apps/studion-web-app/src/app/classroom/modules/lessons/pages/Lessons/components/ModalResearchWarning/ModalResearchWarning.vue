<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import ModalDialog from '@/components/general/ModalDialog'

export default defineComponent({
  name: 'ModalResearchWarning',

  components: {
    Action,
    ModalDialog,
  },

  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },

})
</script>

<template>
  <ModalDialog
    class="modal_research"
    :active="active"
    disable-footer
    @close="$emit('close')"
  >
    <template #pre-content>
      <p class="pre-content">{{ $t('solutions.create.classes:type.research') }}</p>
    </template>

    <template #title>
      {{ $t('classroom.lessons:modal.research.warning:title') }}
    </template>

    <template #description>
      <p class="text-color">
        {{ $t('classroom.lessons:modal.research.warning:description') }}
      </p>

      <Action
        :text="$t('classroom.lessons:modal.research.warning:button.access')"
        type="button"
        flat
        @click="$emit('access')"
      />
    </template>
  </ModalDialog>
</template>

<style lang="scss">
@import './ModalResearchWarning.scss';
</style>
