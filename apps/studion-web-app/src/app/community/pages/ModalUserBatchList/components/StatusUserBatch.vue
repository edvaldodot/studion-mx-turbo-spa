<script>
import ModalUserBatchMixin from '../shared/ModalUserBatchMixin'

import Icon from '@/components/general/Icon'
import Loading from '@/components/general/Loading'

export default {
  name: 'StatusUserBatch',
  mixins: [ModalUserBatchMixin],
  components: {
    Icon,
    Loading
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  }
}
</script>

<template>
  <span
    :class="[
      'td-tag td-tag-fixed',
      {
        'is-ok': $lmx_isCompleted(item),
        'has-error': $lmx_isCanceledOrError(item),
      },
    ]"
  >
    <span> {{ $lmx_getStatusLabel(item) }}</span>

    <Loading v-if="$lmx_isProcessing(item)" />

    <Icon
      v-else-if="$lmx_isCompleted(item)"
      name="check-all"
      size="medium"
      wrapper
    />

    <Icon
      v-else-if="$lmx_isCanceledOrError(item)"
      name="close"
      size="medium"
      wrapper
    />
  </span>
</template>
