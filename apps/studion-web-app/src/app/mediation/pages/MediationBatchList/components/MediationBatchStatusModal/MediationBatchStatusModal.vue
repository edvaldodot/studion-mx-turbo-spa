<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import ModalSolid from '@/components/general/ModalSolid'
import MediationModalMessage from '../../../../components/MediationModalMessage'

export default defineComponent({
  name: 'MediationBatchStatusModal',

  components: {
    Action,
    ModalSolid,
    MediationModalMessage,
  },

  props: {
    status: {
      type: String,
      default: null,
    },
  },
})
</script>

<template>
  <ModalSolid
    :data-testid="$testId('mediation-batch-status-modal')"
    class="mediation-batch-status-modal"
    active
    back
    is-page
    @close="$emit('close')"
  >
    <template #content>
      <MediationModalMessage
        :title="$t(`mediation.batch:status.${status}.title`)"
        :body-title="$t(`mediation.batch:status.${status}.body.title`)"
        :body-text="$t(`mediation.batch:status.${status}.body.text`)"
      >
        <template #actions>
          <div class="text-center">
            <Action
              v-if="status === 'err'"
              :text="$t('global:download.sheet')"
              type="button"
              secondary
              large
              @click="$emit('download')"
            />
          </div>
        </template>
      </MediationModalMessage>
    </template>
  </ModalSolid>
</template>
