<script>
import ModalUserBatchMixin from '../shared/ModalUserBatchMixin'
import Action from '@/components/general/Action'

export default {
  name: 'KnowMoreButtonUserBatch',
  mixins: [ModalUserBatchMixin],
  components: {
    Action
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
  <Action
    :text="$t('global:know.more')"
    @click="$lmx_showProgress(item)"
    type="button"
    flat
  />
</template>
