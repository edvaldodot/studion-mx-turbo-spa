<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from '../options'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import DatatableDoubts from '../components/DatatableDoubts'

export default defineComponent({
  name: 'TabsDoubtsList',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    DatatableDoubts,
  },

  mixins: [paginateMixin],

  computed: {
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },

    filterListTagOptions() {
      return defaultFilterListTagOptions()
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
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('Management/doubts/doubtsListResource')
    this.setupFilterCategory()
  },

  methods: {
    ...mapActions(['setFetching', 'Management/doubts/attemptCategoryFilter']),

    setupFilterCategory() {
      const payload = {
        params: { limit: 1000 },
      }

      this['Management/doubts/attemptCategoryFilter'](payload).then((categories) => {
        this.filterListTagOptions[1].items = categories.data.map(({ id, name }) => ({
          active: false,
          text: name,
          id,
          property: 'category_id',
        }))

        this.pgtrFilterTagOptions = [...this.filterListTagOptions]
      })
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-messages')">
    <div class="p-3">
      <FilterList>
        <template slot="filterTab">
          <div class="tabs-filter">
            <slot />
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
          class="filter-doubt-mananger"
          :initial-value="pgtrParams.filter"
          :options="pgtrFilterTagOptions"
          :tag-all-filters-active="pgtrTagAllFilters"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <DatatableDoubts :doubts="pgtrCurrentData" />

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
  </div>
</template>
<style lang="scss">
@media (min-width: 1024px) {
  .filter-doubt-mananger {
    .filter-tag-list {
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
