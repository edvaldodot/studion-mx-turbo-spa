<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'

export default defineComponent({
  name: 'ModalDelete',

  components: {
    Action,
  },
})
</script>

<template>
  <div class="modal-confirm">
    <Action
      type="button"
      icon="close"
      icon-size="medium"
      class="btn-close"
      @click="$emit('close')"
    />
    <div class="modal-confirm-content">
      <h3 class="modal-confirm-title">{{ $t('library:modal.confirm.title') }}</h3>
    </div>
    <div class="modal-confirm-footer">
      <Action
        :text="$t('global:confirm')"
        type="button"
        flat
        @click="$emit('delete')"
      />
      <Action
        :text="$t('global:cancel')"
        type="button"
        class="btn-cancel"
        flat
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
