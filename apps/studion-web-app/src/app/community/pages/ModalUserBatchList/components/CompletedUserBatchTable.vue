<script>
import { mapState, mapActions } from 'vuex'
import ModalUserBatchMixin from '../shared/ModalUserBatchMixin'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Pagination from '@/components/general/Pagination'
import UserBatchTable from './UserBatchTable.vue'

export default {
  name: 'CompletedUserBatchTable',
  components: {
    UserBatchTable,
    Pagination,
  },
  mixins: [paginateMixin, ModalUserBatchMixin],
  computed: {
    ...mapState({
      completedUserBatch: (state) => state.users.completedUserBatch,
    }),
  },
  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },
  created() {
    this.pgtrInitializePagination('completedUserBatchResources')
  },
  methods: {
    ...mapActions(['setFetching']),
  },
}
</script>

<template>
  <div>
    <h2 v-if="completedUserBatch.length" class="modal-sub-title">
      {{ $t('community.users:sent.batches') }}
    </h2>

    <UserBatchTable :list="completedUserBatch" />

    <Pagination
      :dark="true"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @go-to-page="pgtrParams.page = $event"
      @change-items-per-page="pgtrParams.limit = $event"
    />
  </div>
</template>
