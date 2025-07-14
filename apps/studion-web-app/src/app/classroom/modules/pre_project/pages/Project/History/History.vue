<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from './options'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import DatatableHistory from './components/DatatableHistory'

export default defineComponent({
  name: 'HistoryPreProject',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    DatatableHistory,
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
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.pgtrFilterTagOptions = [...defaultFilterListTagOptions()]
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('getPreProjectGroupsResources', null, {
      sessionUuid: this.$route.params.session_uuid,
    })
  },

  methods: {
    ...mapActions(['setFetching']),

    showDetails(item) {
      this.$router.push({
        name: 'classroom.pre.project.details.history',
        params: {
          history: item.preProjectGroupId,
          item,
        },
      })
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-evaluation')">
    <div class="p-4">
      <FilterList>
        <template slot="filterTab">
          <div class="tabs-filter">
            <slot></slot>
          </div>
        </template>

        <FilterListSearch
          slot="search"
          :initial-value="pgtrParams.query['name']"
          hide-error-details
          @search="pgtrSetSearch('name', $event)"
        />

        <FilterListOrder
          slot="order"
          :initial-value="pgtrParams.order"
          :options="filterListOrderOptions"
          on-server
          @update-orders="pgtrUpdateOrder"
        />

        <FilterListTag
          slot="tag"
          :initial-value="pgtrParams.filter"
          :options="pgtrFilterTagOptions"
          :tag-all-filters-active="pgtrTagAllFilters"
        />
      </FilterList>
    </div>

    <div class="center">
      <DatatableHistory
        :data="pgtrCurrentData"
        @details="showDetails"
      />

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>

    <RouterView />
  </div>
</template>
