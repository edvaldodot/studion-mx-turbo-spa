<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Action from '@/components/general/Action'
import Pagination from '@/components/general/Pagination'

import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from './options'
import { tabLinks } from '../../utils/tablinks'
import DatatableDoubtsCategories from './components/DatatableDoubtsCategories'

export default defineComponent({
  name: 'DoubtCategories',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    Action,
    DatatableDoubtsCategories,
  },

  mixins: [paginateMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  computed: {
    ...mapState(['Classroom']),

    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },

    categoryList() {
      return this.Classroom.categoryListKb
    },

    fiterOption() {
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
    this.$emit('change-header', {
      tabLinks: [...tabLinks()],
    })
    const payload = {
      sessionUuid: this.$route.params.session_uuid,
    }

    this.pgtrInitializePagination('attemptCategoryListResource', payload)
    this.pgtrRouteParams.active = true
    this.setupFilterCategory()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptCategoryListResource',
      'attemptCreateCategoryKB',
      'attemptCategoryFilterResource',
    ]),

    createCategory() {
      this.$router.push({
        name: 'classroom.categories.create',
        params: {
          isCategory: true,
        },
      })
    },

    setupFilterCategory() {
      const payload = {
        sessionUuid: this.$route.params.session_uuid,
        params: {
          limit: 1000,
        },
      }
      this.attemptCategoryFilterResource(payload).then((categories) => {
        this.fiterOption[0].items = categories.data.map(({ id, name }) => ({
          active: false,
          text: name,
          id,
          property: 'id',
        }))

        this.pgtrFilterTagOptions = [...this.fiterOption]
      })
    },
    updateHeight() {
      this.$refs.item.updateHeight()
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-doubts-categorie')">
    <div class="p-4">
      <FilterList>
        <template slot="filterTab">
          <div class="tabs-filter">
            <slot />
          </div>
        </template>
        <Action
          v-if="canWrite('classroom:forum')"
          slot="button"
          :text="$t('classroom.knowledgeBase.help:add.categories')"
          type="button"
          primary
          large
          fixed-width
          @click="createCategory()"
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

    <div class="center">
      <DatatableDoubtsCategories
        ref="item"
        :items="pgtrCurrentData"
        @refresh="pgtrRefresh"
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

    <RouterView
      @refresh="pgtrRefresh"
      @refreshCategory="setupFilterCategory"
      @updateHeight="updateHeight"
    />
  </div>
</template>
