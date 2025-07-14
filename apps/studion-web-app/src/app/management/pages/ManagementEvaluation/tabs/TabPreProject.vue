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

import DatatablePreProject from '@/app/classroom/modules/assessments/pages/PreProject/components/DatatablePreProject'

export default defineComponent({
  name: 'TabPreProject',

  components: {
    DatatablePreProject,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
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
    this.pgtrInitializePagination('Management/evaluations/preProjectListResource')
  },

  methods: {
    ...mapActions(['setFetching']),

    openEvaluation(item, sessionUuid) {
      this.$router.push({
        name: 'classroom.lessons.course.project.admin.access',
        params: {
          id: item.lastTryId,
          session_uuid: sessionUuid,
          management: this.$route.name,
        },
      })
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-preproject')">
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
          :initial-value="pgtrParams.filter"
          :options="pgtrFilterTagOptions"
          :tag-all-filters-active="pgtrTagAllFilters"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <DatatablePreProject
        :items="pgtrCurrentData"
        @view:attempt="openEvaluation"
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
  </div>
</template>