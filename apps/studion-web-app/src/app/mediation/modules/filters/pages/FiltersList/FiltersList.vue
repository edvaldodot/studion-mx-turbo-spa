<script>
import MediationContentHeader from '../../../../components/MediationContentHeader'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import Pagination from '@/components/general/Pagination'
import Tooltip from '@/components/general/Tooltip'

import { defaultFilterListOrderOptions } from '../../../../shared'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions, mapState } from 'vuex'

const FiltersListModal = () => import('./components/FiltersListModal')

export default {
  name: 'FiltersList',

  components: {
    Action,
    Datatable,
    Dropdown,
    DropdownLink,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    Pagination,
    Tooltip,
    MediationContentHeader,
    FiltersListModal,
  },

  mixins: [paginateMixin],

  data() {
    return {
      modal: {
        context: null,
        data: null,
      },
    }
  },

  computed: {
    ...mapState({
      Filters: (state) => state.Filters.filters,
    }),

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
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('filterListResource')
  },

  methods: {
    ...mapActions(['setFetching', 'attemptRemoveFilter', 'attemptToggleFilterStatus']),

    /**
     * Returns a i18n formatted string for table status content
     * @param {boolean} status - Falsy value returns inactive
     */
    getStatus(status) {
      return status ? this.$t('global:active') : this.$t('global:inactive')
    },

    /**
     * Toggle filter's status between active and inactive
     * @param {number} id - Filter's id (i_filters)
     */
    toggleStatus(id) {
      this.setFetching(true)

      this.attemptToggleFilterStatus(id).finally(() => {
        this.setFetching(false)
        this.pgtrRefresh()
      })
    },

    /**
     * Change modal data, text and status by context
     * @param {string} context - Available contexts: [remove|error]/null to close modal
     * @param {Object} item - Filter data
     */
    toggleModal(context, item = null) {
      this.modal = {
        context: context,
        data: item,
      }
    },

    /**
     * Remove filter (cannot remove sql filters)
     * @param {number} id - Filter id (i_filters)
     */
    removeFilter(id) {
      this.setFetching(true)

      this.attemptRemoveFilter(id)
        .catch(() => {
          this.toggleModal('error')
        })
        .finally(() => {
          this.setFetching(false)
          this.pgtrRefresh()
        })
    },

    /**
     * Open filter modal's with more details
     * @param {Object} filter - Filter item
     */
    viewFilter(filter) {
      this.$router.push({
        name: 'filter.view',
        params: {
          id: filter['i_filters'],
        },
      })
    },
  },
}
</script>

<template>
  <div class="main-content  filters">
    <MediationContentHeader
      :title="$t('mediation:header.title.1')"
      :description="$t('mediation:header.description.1')"
    />

    <RouterView @refreshList="pgtrRefresh" />

    <div class="p-3">
      <FilterList>
        <Action
          v-if="notEqualsProfile('student') && canWrite('mediation_plan')"
          slot="button"
          :url="{ name: 'filter.add' }"
          :text="$t('mediation.filter:btn.add')"
          primary
          large
          fixed-width
        />

        <FilterListSearch
          slot="search"
          :initial-value="pgtrParams.query['name']"
          hide-error-details
          @search="pgtrSetSearch('name', $event)"
        />

        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :initial-value="pgtrParams.order"
          :label="$t('global:filter.order.label')"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>
    <div class="center m-4">
      <Datatable :items="Filters">
        <template
          v-if="!$media.mobile"
          slot="thead"
        >
          <tr>
            <th class="th">{{ $t('global:form.name') }}</th>
            <th
              class="th"
              width="180"
            >
              {{ $t('global:form.type') }}
            </th>
            <th
              class="th"
              width="120"
            >
              {{ $t('global:status') }}
            </th>
            <th class="th"></th>
            <th class="th"></th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="{ item }"
        >
          <tr>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
                >{{ $t('global:form.name') }}</span
              >
              <span class="td-text">{{ item.name }}</span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
                >{{ $t('global:form.type') }}</span
              >
              <span class="td-text">{{
                $t(`mediation.filter:form.filter_type:${item.alias}`)
              }}</span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
                >{{ $t('global:status') }}</span
              >
              <span class="td-text">{{ getStatus(item.active) }}</span>
            </td>
            <td class="td td-button td-small text-right">
              <Action
                :text="$t('global:view.more')"
                type="button"
                flat
                @click="viewFilter(item)"
              />
            </td>
            <td>
              <Dropdown
                slot="actions"
                right
                icon="dots-vertical"
              >
                <DropdownLink
                  v-if="!item.status && item.alias !== 'sql'"
                  :text="$t('global:remove')"
                  @click="toggleModal('delete', item)"
                />
                <Tooltip
                  v-else
                  :uppercase="false"
                  :width="174"
                  :bold-font="false"
                >
                  <template #activator="{ on }">
                    <DropdownLink
                      :text="$t('global:remove')"
                      :disabled="true"
                      @mouseenter.native="on.mouseenter"
                      @mouseleave.native="on.mouseleave"
                    />
                  </template>
                  <span>{{ $t('mediation.filter:tip.remove.sql') }}</span>
                </Tooltip>
              </Dropdown>
            </td>
          </tr>
        </template>
      </Datatable>

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>

    <filters-list-modal
      v-model="modal"
      @delete="removeFilter"
    />
  </div>
</template>

<style lang="scss">
@import './FiltersList.scss';
</style>
