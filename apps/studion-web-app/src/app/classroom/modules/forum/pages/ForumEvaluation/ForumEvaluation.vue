<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from './options'

import Pagination from '@/components/general/Pagination'

import EvaluationHeader from './components/EvaluationHeader.vue'
import DatatableEvaluationsForum from './components/DatatableEvaluationsForum.vue'

export default defineComponent({
  name: 'ForumEvaluation',

  components: {
    EvaluationHeader,
    DatatableEvaluationsForum,
    Pagination,
  },
  mixins: [paginateMixin],

  computed: {
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },
  },

  watch: {
    pgtrIsFetching: {
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    const params = {
      discussion_id: this.$route.params.id,
    }

    this.pgtrInitializePagination('attemptDiscussionEvaluationList', null, params)

    this.pgtrFilterTagOptions = [...defaultFilterListTagOptions()]
  },

  methods: {
    ...mapActions(['setFetching']),
  },
})
</script>

<template>
  <div class="center">
    <EvaluationHeader
      :order-options="filterListOrderOptions"
      :tag-options="pgtrFilterTagOptions"
      @change:order="pgtrUpdateOrder"
      @search="pgtrSetSearch('name', $event)"
    />

    <DatatableEvaluationsForum
      :evaluations="pgtrCurrentData"
      :is-searching="pgtrIsSearching"
    />

    <Pagination
      v-if="pgtrCurrentData.length"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @change-items-per-page="pgtrParams.limit = $event"
    />
  </div>
</template>
