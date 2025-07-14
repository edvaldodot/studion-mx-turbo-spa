<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import DatatableMessages from '../components/DatatableMessages'
import Action from '@/components/general/Action'

import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from '../options'

export default defineComponent({
  name: 'TabMessages',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    DatatableMessages,
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
    this.pgtrInitializePagination('Management/messages/messagesListResource')
  },

  methods: {
    ...mapActions(['setFetching']),

    handleRedirectCorrect(evaluation) {
      this.$refs.modalAttempts.openEvaluation(evaluation.lastTryId, evaluation.sessionUuid)
    },

    handleViewAttempts(evaluation) {
      this.$refs.modalAttempts.openModal(evaluation)
    },
    addMessage() {
      this.$router.push({ name: 'management.messages.add' })
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
          :initial-value="pgtrParams.filter"
          :options="pgtrFilterTagOptions"
          :tag-all-filters-active="pgtrTagAllFilters"
        />
      </FilterList>
    </div>

    <div class="tab-messages__actions px-4">
      <Action
        :text="$t('classroom.messages:btn.add')"
        type="button"
        primary
        large
        fixed-width
        @click="addMessage"
      />
    </div>

    <div class="p-4">
      <DatatableMessages :messages="pgtrCurrentData" />

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
.tab-messages__actions {
  margin-bottom: 3em;
}
</style>
