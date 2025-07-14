<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import DatatablePoll from '../components/DatatablePoll'
import Action from '@/components/general/Action'
import ModalPoll from '@/app/classroom/modules/polls/components/ModalPoll'

import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from '../options'

export default defineComponent({
  name: 'TabPoll',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    DatatablePoll,
    Action,
    ModalPoll,
  },

  mixins: [paginateMixin],

  data() {
    return {
      modalPollIsOpen: false,
    }
  },

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
    this.pgtrInitializePagination('Management/polls/pollsListResource')
  },

  methods: {
    ...mapActions(['setFetching']),

    refresh() {
      this.pgtrRefresh()
    },

    addPoll() {
      this.modalPollIsOpen = true
    },

    closePollModal() {
      this.modalPollIsOpen = false
      this.refresh()
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-polls')">
    <div class="p-3">
      <FilterList>
        <template slot="filterTab">
          <div class="tabs-filter">
            <slot />
          </div>
        </template>
        <Action
          slot="button"
          :text="$t('classroom.poll:btn.add')"
          type="button"
          primary
          large
          fixed-width
          @click="addPoll"
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
      <DatatablePoll
        :polls="pgtrCurrentData"
        @refresh="refresh"
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

    <ModalPoll
      v-if="modalPollIsOpen"
      is-management
      @close="closePollModal"
    />
  </div>
</template>

<style lang="scss">
.tab-polls__actions {
  margin-bottom: 3em;
}
</style>
