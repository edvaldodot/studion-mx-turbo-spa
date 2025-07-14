<script>
import { defineComponent } from 'vue'
import Action from '@/components/general/Action'
import ModalDialog from '@/components/general/ModalDialog'

export default defineComponent({
  name: 'ModalOfferingSolutionsWarning',

  components: {
    Action,
    ModalDialog,
  },

  props: {
    active: {
      type: Boolean,
      required: true,
    },
  },
})
</script>

<template>
  <ModalDialog
    class="modal-offering-solutions-warning"
    :data-testid="$testId('modal-offering-solutions-warning')"
    :active="active"
    @close="$emit('close')"
  >
    <template #title>
      {{ $t('offerings.solutions.edit:modal.warning.title') }}
    </template>

    <template #description>
      <p class="text-color">{{ $t('offerings.solutions.edit:modal.warning.description') }}</p>
    </template>

    <template #footer>
      <Action
        :text="$t('global:cancel')"
        type="button"
        flat
        @click="$emit('close')"
      />
      <Action
        :text="$t('global:proceed')"
        type="button"
        flat
        @click="$emit('save')"
      />
    </template>
  </ModalDialog>
</template>

<style lang="scss">
.modal-offering-solutions-warning {
  .modal-confirm-footer {
    display: flex;
    justify-content: space-between;
  }
}
</style>
