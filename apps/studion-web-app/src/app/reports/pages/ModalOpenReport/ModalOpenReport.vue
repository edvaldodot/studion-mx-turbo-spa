<script>
import { mapState } from 'vuex'

export default {
  name: 'ModalOpenReport',
  components: {
    Modal: () => import('@/components/general/Modal')
  },
  computed: {
    ...mapState(['reports', 'fetching'])
  }
}
</script>

<template>
  <modal :active="!fetching">
    <div class="modal-iframe">
      <iframe :src="reports.current.url" frameborder="0" allowfullscreen class="iframe"></iframe>
    </div>
  </modal>
</template>
