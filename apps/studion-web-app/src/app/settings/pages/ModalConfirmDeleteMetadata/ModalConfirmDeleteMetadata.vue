<script>
import { defineComponent } from 'vue'
import ModalConfirm from '@/components/general/ModalConfirm'

export default defineComponent({
  name: 'ModalConfirmDeleteMetadata',

  components: {
    ModalConfirm,
  },
})
</script>

<template>
  <ModalConfirm
    :data-testid="$testId('modal-confirm-delete-metadata')"
    :active="true"
    :title="$t('community.metadata:modal.confirm.title.1')"
    @close="$emit('modal:close')"
    @confirm="$emit('modal:confirm')"
  />
</template>
