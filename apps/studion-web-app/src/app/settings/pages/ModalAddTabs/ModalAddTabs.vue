<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Datatable from '@/components/general/Datatable'
import Checkbox from '@/components/general/Checkbox'
import Pagination from '@/components/general/Pagination'
import EmptyMessage from '@/components/general/EmptyMessage'

export default {
  mixins: [paginateMixin],
  components: {
    Modal,
    Action,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Datatable,
    Checkbox,
    Pagination,
    EmptyMessage
  },
  data () {
    return {
      formData: {
        items: []
      },
      hasChanged: false
    }
  },

  mounted () {
    this.pgtrParams.limit = 6
    this.pgtrInitializePagination('getCategoriesTabListResource', null, {
      filter: { category_not_in: this.getAddedItemsIds, active: 1 }
    })
  },

  destroyed () {
    this.pgtrClearQueryHistory()
    this.setFetching(false)
  },

  computed: {
    ...mapState({
      featuredCategories: state => state.Dashboard.featuredCategories,
      Categories: state => state.Categories
    }),

    getAddedItemsIds () {
      return this.featuredCategories.reduce((carr, item) => {
        carr.push(item.category.id)
        return carr
      }, [])
    },
    mappedItemsList () {
      return this.Categories.categoriesTabList.map(item => {
        this.$set(item, 'import', (this.formData.items.some(fs => fs.id === item.id)))
        return item
      })
    },
    filterListOrderOptions () {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc'
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc'
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc'
        }
      ]
    }
  },
  watch: {
    'pgtrIsFetching': {
      immediate: true,
      handler (loading) {
        this.setFetching(loading)
      }
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'saveFeaturedCategories',
      'fetchFeaturedCategories'
    ]),

    selectItem (value, item) {
      if (value) {
        this.formData.items.push({
          id: item.id,
          name: item.name
        })
      } else {
        this.formData.items = this.formData.items.filter(
          s => s.id !== item.id
        )
      }
    },
    async selectItems () {
      this.setFetching(true)
      await this.saveFeaturedCategories(this.formData.items)
      await this.fetchFeaturedCategories()
      this.setFetching(false)
      this.$router.push({ name: 'settings.dashboard', params: { toTabs: true } })
    }
  }
}
</script>

<template>
  <modal class="add-solution-modal" :active="true" is-page>
    <div class="modal-form">
      <h2 class="modal-title text-color">{{ $t('settings.dashboard:tabs.modal.title') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('settings.dashboard:tabs.modal.description') }}</p>
      </div>
    </div>

    <div class="py-4">
      <filter-list>
        <filter-list-search
          dark
          slot="search"
          :hide-error-details="true"
          @search="pgtrSetSearch('name', $event)"
        />
        <filter-list-order
          dark
          slot="order"
          :on-server="true"
          :options="filterListOrderOptions"
          @update-orders="pgtrUpdateOrder"
        />
      </filter-list>
    </div>

    <empty-message dark v-if="mappedItemsList.length === 0 && !pgtrIsFiltering && !pgtrIsSearching">
      <h2>{{ $t('settings.dashboard:tabs.modal.empty.title') }}</h2>
      <p class="text-color">{{ $t('settings.dashboard:tabs.modal.empty.message') }}</p>
    </empty-message>

    <empty-message v-if="mappedItemsList.length === 0 && pgtrIsFiltering && !pgtrIsSearching">
      <h2>{{ $t('solutions.list:filter.empty.title') }}</h2>
    </empty-message>

    <!-- Search -->
    <empty-message v-if="mappedItemsList.length === 0 && !pgtrIsFiltering && pgtrIsSearching">
      <h2>{{ $t('global:search.empty.title') }}</h2>
      <p class="text-color">{{ $t('global:search.empty.message') }}</p>
    </empty-message>

    <datatable v-if="mappedItemsList.length" :items="mappedItemsList" class="theme-dark">
      <template slot="thead">
        <tr>
          <th class="th">{{ $t('settings.dashboard:tabs.modal.table.header.category') }}</th>
          <th
            width="8%"
            class="th text-center"
          >{{ $t('settings.dashboard:tabs.modal.table.header.select') }}
          </th>
        </tr>
      </template>
      <template slot="tbody" slot-scope="{ item }">
        <tr>
          <td class="td">
            <span class="td-text bolder">{{ item.name }}</span>
          </td>
          <td class="td text-center">
            <checkbox
              dark
              switch-type
              :value="item.import"
              :items="[{ value: true }]"
              @input="selectItem($event, item)"
            />
          </td>
        </tr>
      </template>
    </datatable>

    <div v-if="mappedItemsList.length" class="datatable-item-selected flex gap-1 my-2 theme-dark">
      <div class="text-color text-base">{{ $t('settings.dashboard:tabs.modal.table.footer.selectedCategories') }}</div>
      <span class="datatable-item-selected-length text-base">{{ formData.items.length }}</span>
    </div>

    <pagination
      v-if="mappedItemsList.length"
      dark
      class="mb-8"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @go-to-page="pgtrParams.page = $event"
      @change-items-per-page="pgtrParams.limit = $event"
    />
    <div class="text-center">
      <action
        v-if="mappedItemsList.length"
        large
        primary
        class="mb-10"
        type="button"
        :disabled="formData.items.length === 0"
        :text="$t('global:save')"
        @click="selectItems"
      />
    </div>
  </modal>
</template>
