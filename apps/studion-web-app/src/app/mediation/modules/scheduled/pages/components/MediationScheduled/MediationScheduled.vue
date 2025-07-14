<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import DatatableScheduled from '../DatatableScheduled'

import {
  defaultFilterListOrderOptions,
  defaultFilterListTagOptions,
  defaultFilterListOrderOptions2,
} from './options'

export default defineComponent({
  name: 'MediationScheduled',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    DatatableScheduled,
  },

  mixins: [paginateMixin],

  props: {
    type: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      filterActive: false,
    }
  },

  computed: {
    filterListOrderOptions() {
      if (this.filterActive) {
        return defaultFilterListOrderOptions2()
      }

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
    'pgtrParams.filter': {
      immediate: true,
      handler(newValue) {
        if (newValue && newValue.dateShooting.length <= 1) {
          return (this.filterActive = newValue.dateShooting.includes('noDate'))
        }
        if (newValue && newValue.dateShooting.length >= 2) {
          return (this.filterActive = false)
        }
      },
    },
  },

  created() {
    this.pgtrFilterTagOptions = [...defaultFilterListTagOptions()]
    this.pgtrRouteParams.active = true
    const formData = {
      transmission_type: this.type,
    }
    this.pgtrInitializePagination('scheduledListResource', formData)
  },

  methods: {
    ...mapActions(['setFetching', 'setForumsData', 'accessibility']),
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-scheduled')">
    <div class="p-3">
      <FilterList>
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

    <div class="p-4">
      <DatatableScheduled
        :data-schedule="pgtrCurrentData"
        :type="type"
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
  </div>
</template>
