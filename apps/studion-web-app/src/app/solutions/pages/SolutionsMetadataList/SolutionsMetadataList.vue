<script>
import { mapState, mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { SESSION_METADATA_OPTIONS } from '@/support/constants'

import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'

import SolutionsHeader from '../../components/SolutionsHeader'
import MetadataList from './components/MetadataList'
import MetadataEmptyMessage from './components/MetadataEmptyMessage'

import sharedDataMixin from '../sharedDataMixin'

export default {
  mixins: [paginateMixin, sharedDataMixin],
  name: 'SolutionsMetadataList',
  components: {
    SolutionsHeader,
    MetadataList,
    Action,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    MetadataEmptyMessage,
    Pagination
  },

  computed: {
    ...mapState(['accessibility'])
  },
  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler (loading) {
        this.setFetching(loading)
      }
    },
    $route (to, from) {
      if (
        from.name === 'solutions.metadata.create' ||
        from.name === 'solutions.metadata.edit'
      ) {
        return this.pgtrRefresh()
      }
    }
  },

  created () {
    this.pgtrFilterTagOptions = [
      {
        title: this.$t('global:metadata.datatable.header.2'),
        name: 'metadata_types',
        items: SESSION_METADATA_OPTIONS.map((option) => ({
          active: false,
          property: 'type',
          text: option.text,
          id: option.value
        }))
      }
    ]
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('courseListMetadataResources')
  },

  methods: {
    ...mapActions(['setFetching']),

    resetNavigation () {
      this.pgtrRefresh()
      this.pgtrParams.page = 1
    }
  }
}
</script>

<template>
  <div>
    <SolutionsHeader
      :title="$t('solutions:tab.link.2')"
      :description="$t('solutions:header.metadata.description')"
    />
    <div class="content m-4">
      <div class="p-3">
        <filter-list>
        <action
          primary
          large
          fixed-width
          v-if="this.notEqualsProfile('student') && this.canWrite('courses')"
          slot="button"
          :text="$t('global:metadata.btn.add')"
          :url="{ name: 'solutions.metadata.create' }"
          :dark="accessibility"
        />

        <FilterListSearch
          slot="search"
          :dark="accessibility"
          :initial-value="pgtrParams.query['name']"
          hide-error-details
          @search="pgtrSetSearch('name', $event)"
        />

        <FilterListTag
          slot="tag"
          :options="pgtrFilterTagOptions"
          :initial-value="pgtrParams.filter"
          state="Courses"
          :tag-all-filters-active="pgtrTagAllFilters"
        />

        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :initial-value="pgtrParams.order"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
        </filter-list>
      </div>

      <div class="center" v-if="pgtrCurrentData.length > 0">
        <metadata-list
          :items="pgtrCurrentData"
          @remove="resetNavigation"
        />

        <pagination
          :activePage="pgtrParams.page"
          :pageCount="pgtrLastPage"
          disable-items-per-page
          disable-manual-page
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
        />
      </div>

      <metadata-empty-message
        v-if="pgtrCurrentData.length === 0"
        :is-filtering="pgtrIsFiltering"
        :is-searching="pgtrIsSearching"
      />

      <router-view />
    </div>
  </div>
</template>
