<script>
import { mapState, mapActions } from 'vuex'
import ModalUserBatchMixin from '../shared/ModalUserBatchMixin'
import { paginateMixin } from '@/mixins/paginatorMixin'
import lodash from 'lodash'

import Pagination from '@/components/general/Pagination'
import UserBatchTable from './UserBatchTable.vue'

export default {
  name: 'PendingUserBatchTable',
  mixins: [paginateMixin, ModalUserBatchMixin],
  components: {
    UserBatchTable,
    Pagination
  },
  data () {
    return {
      timer: null,
      created: false,
      timeoutFetch: false
    }
  },
  created () {
    this.timeoutFetch = false
    this.pgtrInitializePagination('pendingUserBatchResources')

    this.timer = setInterval(() => {
      this.timeoutFetch = true
      this.getList(true)
    }, 15000)

    this.created = true
  },
  destroyed () {
    clearTimeout(this.timer)
  },
  computed: {
    ...mapState({
      pendingUserBatch: (state) => state.users.pendingUserBatch
    })
  },
  methods: {
    ...mapActions(['setFetching']),
    getList () {
      this.pgtrRefresh()
    }
  },
  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler (loading) {
        if (!this.timeoutFetch) {
          this.setFetching(loading)
        }
      }
    },
    pendingUserBatch: {
      immediate: true,
      handler (newValue, oldValue) {
        if (newValue.length === 0 && this.created) {
          clearTimeout(this.timer)
          if (!lodash.isEqual(newValue, oldValue)) {
            this.$emit('update-completed')
          }
        }
      }
    }
  }
}
</script>

<template>
  <div v-if="pendingUserBatch.length" class="mb-10">
    <h2 class="modal-sub-title text-color">
      {{ $t('community.users:sent.batches.pending') }}
    </h2>

    <div class="py-4">
      <UserBatchTable :list="pendingUserBatch" />
    </div>

    <Pagination
      :dark="true"
      :activePage="pgtrParams.page"
      :pageCount="pgtrLastPage"
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @go-to-page="pgtrParams.page = $event"
      @change-items-per-page="pgtrParams.limit = $event"
    />
  </div>
</template>
