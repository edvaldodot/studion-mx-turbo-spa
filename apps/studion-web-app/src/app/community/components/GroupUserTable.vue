<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import EmptyMessage from '@/components/general/EmptyMessage'
import Pagination from '@/components/general/Pagination'

export default {
  components: {
    Datatable,
    EmptyMessage,
    Icon,
    FilterList,
    FilterListSearch,
    Pagination,
  },

  mixins: [paginateMixin],

  props: {
    groupId: {
      type: Number,
      required: true,
    },
  },

  computed: {
    ...mapState(['accessibility']),
    getFilter() {
      return {
        ...this.filterActiveItems,
        groupId: this.groupId,
      }
    },
    customParams() {
      return {
        filter: this.getFilter,
      }
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(value) {
        this.setFetching(value)
      },
    },
  },

  mounted() {
    this.pgtrInitializePagination('getUsersGroupResource', null, this.customParams)
  },

  destroyed() {
    this.pgtrClearQueryHistory()
  },

  methods: {
    ...mapActions(['setFetching']),

    showTagAllFilters(value) {
      this.tagAllFilters = value
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('group-user-table')"
    class="group-user-table"
  >
    <div class="py-4">
      <FilterList>
        <FilterListSearch
          slot="search"
          hide-error-details
          dark
          @search="pgtrSetSearch('name', $event)"
          @tagAllFilters="showTagAllFilters"
        />
      </FilterList>
    </div>
    <Datatable
      v-if="pgtrCurrentData.length"
      :items="pgtrCurrentData"
      dark
    >
      <template
        v-if="!$media.mobile"
        slot="thead"
      >
        <tr>
          <th class="th">{{ $t('community.groups:members.table.header.name') }}</th>
          <th
            class="th text-center"
            width="150"
          >
            {{ $t('community.groups:members.table.header.create_at') }}
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr
          v-if="$media.mobile"
          class="tr-colspan tr-colspan-small"
        >
          <td
            class="td group-user-table__user"
            colspan="4"
          >
            <span class="td-text bolder clamp-line">{{ props.item._embedded.user_data.name }}</span>
          </td>
        </tr>
        <tr :class="{ 'tr-small': $media.mobile }">
          <td
            v-if="!$media.mobile"
            class="td flex pt-4 gap-2 align-items-center"
          >
            <div class="datatable-image">
              <img
                v-if="props.item._embedded.user_data.image"
                :src="props.item._embedded.user_data.image"
                class="w-2rem border-circle"
              />
              <Icon
                v-else
                class="text-3xl icon-fill-1"
                name="account_circle"
                pack="material"
              />
            </div>
            <span class="td-text bolder clamp-line">{{ props.item._embedded.user_data.name }}</span>
          </td>
          <td
            class="td"
            :class="{ 'text-center': !$media.mobile }"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header td-text-header-inline"
              >{{ $t('community.groups:members.table.header.create_at') }}</span
            >
            <span class="td-text">{{ formatDate(props.item.created_at) }}</span>
          </td>
        </tr>
      </template>
    </Datatable>

    <EmptyMessage v-else>
      <template v-if="!Object.values(pgtrParams.query).length">
        <h2>{{ $t('community.groups:members.empty.title') }}</h2>
        <p class="text-color">{{ $t('community.groups:members.empty.message') }}</p>
      </template>
      <template v-else>
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </template>
    </EmptyMessage>

    <pagination
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      dark
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @go-to-page="pgtrParams.page = $event"
      @change-items-per-page="pgtrParams.limit = $event"
    />
  </div>
</template>
