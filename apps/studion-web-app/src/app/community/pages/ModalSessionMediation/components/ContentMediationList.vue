
<script>
import { mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import mediationToggler from '../../../../mediation/mixins/mediationToggler'
import { defaultFilterListOrderOptions } from '@/app/mediation/shared'
import i18n from '@/support/i18n'

import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import FilterListSearch from '@/components/general/FilterListSearch'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import Pagination from '@/components/general/Pagination'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'ContentMediationList',

  mixins: [paginateMixin, mediationToggler],

  props: {
    sessionId: {
      type: [String, Number],
      required: true
    }
  },

  components: {
    Action,
    FilterList,
    FilterListOrder,
    FilterListTag,
    FilterListSearch,
    Datatable,
    DatatableCollapseRow,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    Pagination,
    ModalConfirm
  },

  computed: {
    ...mapState(['accessibility', 'Sessions']),
    filterListOrderOptions () {
      return defaultFilterListOrderOptions()
    }
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler (loading) {
        this.setFetching(loading)
      }
    }
  },

  created () {
    this.pgtrFilterTagOptions = [
      {
        name: 'status',
        title: i18n.t('global:status'),
        items: [
          {
            active: false,
            id: 'active',
            property: 'status',
            text: i18n.t('global:active')
          },
          {
            active: false,
            id: 'inactive',
            property: 'status',
            text: i18n.t('global:inactive')
          },
          {
            active: false,
            id: 'publish',
            property: 'status',
            text: i18n.t('global:published')
          },
          {
            active: false,
            id: 'unpublish',
            property: 'status',
            text: i18n.t('global:not_published')
          }
        ]
      }
    ]
    this.pgtrInitializePagination('mediationSessionListResource', { sessionId: this.sessionId })
  }
}
</script>

<template>
  <div>
    <div class="py-4">
      <filter-list>
        <filter-list-search
          :dark="true"
          :hideErrorDetails="true"
          @search="pgtrSetSearch('name', $event)"
          slot="search"
        />
        <filter-list-tag
          :dark="true"
          :options="pgtrFilterTagOptions"
          :tagAllFiltersActive="pgtrTagAllFilters"
          slot="tag"
          state="Sessions"
        />
        <filter-list-order
          :dark="true"
          :onServer="true"
          :options="filterListOrderOptions"
          :label="$t('global:filter.order.label')"
          @update-orders="pgtrUpdateOrder"
          slot="order"
        />
      </filter-list>
    </div>
    <empty-message
      v-if="
        Sessions.mediationList &&
        Sessions.mediationList.length === 0 &&
        !pgtrIsFetching
      "
    >
      <h2 v-if="pgtrIsSearching">{{ $t("global:search.empty.title") }}</h2>
      <h2 v-if="pgtrIsFiltering && !pgtrIsSearching">
        {{ $t("mediation.list:filter.empty.title") }}
      </h2>
      <h2 v-if="!pgtrIsFiltering && !pgtrIsSearching">
        {{ $t("mediation.list:empty.title") }}
      </h2>

      <p v-if="pgtrIsSearching">{{ $t("global:search.empty.message") }}</p>
      <p v-if="!pgtrIsFiltering && !pgtrIsSearching">
        {{ $t("mediation.list:empty.message") }}
      </p>
    </empty-message>

    <div class="center mediation-list" v-else>
      <datatable :items="Sessions.mediationList" :dark="true">
        <template slot="thead" v-if="!$media.mobile">
          <tr>
            <th class="th">{{ $t("mediation.list:datatable.header.1") }}</th>
            <th class="th" width="20%">
              {{ $t("mediation.list:datatable.header.5") }}
            </th>
            <th class="th" width="20%">
              {{ $t("mediation.list:datatable.header.6") }}
            </th>
            <th class="th" width="40"></th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{
                $t("mediation.list:datatable.header.1")
              }}</span>
              <span class="td-text">{{ props.item.name }}</span>
            </td>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{
                $t("mediation.list:datatable.header.5")
              }}</span>
              <span class="td-text">{{
                props.item.active ? $t("global:active") : $t("global:inactive")
              }}</span>
            </td>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{
                $t("mediation.list:datatable.header.6")
              }}</span>
              <span class="td-text">{{
                props.item.published
                  ? $t("global:active")
                  : $t("global:inactive")
              }}</span>
            </td>
            <td class="td td-actions" width="40">
              <dropdown icon="dots-vertical" right>
                <dropdown-link
                  :text="
                    canWrite('mediation_plan')
                      ? $t('global:edit')
                      : $t('global:view.more')
                  "
                  @click="
                    $router.push({
                      name: 'mediation.edit',
                      params: { id: props.item.id },
                    })
                  "
                />

                <template v-if="canWrite('mediation_plan')">
                  <dropdown-link
                    :text="props.item.active ? $t('global:deactivate') : $t('global:activate')"
                    @click="props.item.active ? controlModalConfirm(props.item,'active') : toggler(props.item, 'active')"
                  />
                  <dropdown-link
                    :text="props.item.published ? $t('global:unpublish') : $t('global:publish')"
                    @click="props.item.published ? controlModalConfirm(props.item,'publish') : toggler(props.item, 'publish')"
                  />
                </template>
              </dropdown>
            </td>
          </tr>
        </template>
      </datatable>

      <pagination
        :dark="true"
        :activePage="pgtrParams.page"
        :pageCount="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>
    <modal-confirm
      :active="openConfirmModal"
      :title="selectedAction === 'active' ? $t('mediation.list:modal.confirm.title.deactivate') : $t('mediation.list:modal.confirm.title.unpublish')"
      @close="openConfirmModal = false"
      @confirm="toggler(selectedItem, selectedAction)"
    >
      <p class="text-color">
        {{ selectedAction === 'active' ? $t('mediation.list:modal.confirm.description.deactivate') : $t('mediation.list:modal.confirm.description.unpublish') }}
      </p>
    </modal-confirm>
  </div>
</template>
