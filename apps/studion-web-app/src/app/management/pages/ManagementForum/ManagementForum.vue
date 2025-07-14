<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Action from '@/components/general/Action'
import Pagination from '@/components/general/Pagination'
import DatatableMagementForum from './components/DatatableMagementForum'

import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from './options'

export default defineComponent({
  name: 'ManagementForum',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    DatatableMagementForum,
    Action,
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
    this.pgtrDefaultOrder = {
      property: 'start_time',
      type: 'desc',
    }
    this.pgtrInitializePagination('Management/forums/forumsListResource')
  },

  methods: {
    ...mapActions(['setFetching', 'setForumsData', 'accessibility']),

    openModalAddForum() {
      this.setForumsData({ path: 'current', value: null })
      this.$router.push({
        name: 'management.forum.create',
        params: {
          management: this.$route.name,
        },
      })
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-forum')">
    <div class="p-3">
      <FilterList>
        <template slot="filterTab">
          <div class="tabs-filter">
            <slot />
          </div>
        </template>
        <Action
          v-if="canWrite('classroom:forum')"
          slot="button"
          :text="$t('forum:btn.add')"
          type="button"
          primary
          large
          fixed-width
          @click="openModalAddForum()"
        />

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
      <DatatableMagementForum
        :data-forum="pgtrCurrentData"
        @refresh-data="pgtrRefresh"
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

    <RouterView @refresh="pgtrRefresh" />
  </div>
</template>
