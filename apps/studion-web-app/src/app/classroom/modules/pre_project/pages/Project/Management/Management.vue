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
import ModalConfirm from '@/components/general/ModalConfirm'
import Datatable from '@/components/general/Datatable'

import DatatableManagementGroup from './components/DatatableManagementGroup'

import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from './options'

export default defineComponent({
  name: 'ManagementGroup',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    DatatableManagementGroup,
    Action,
    ModalConfirm,
    Datatable,
  },

  mixins: [paginateMixin],

  data() {
    return {
      removeData: null,
    }
  },

  computed: {
    ...mapState({
      currentPreProjectConfig: ({ Classroom }) => Classroom.data && Classroom.data.preProject,
    }),
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },

    SessionUuid() {
      return this.$route.params.session_uuid
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

    const payload = {
      sessionUuid: this.SessionUuid,
    }

    this.pgtrInitializePagination('attemptPreProjectGroupSession', payload)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptPreProjectGroupSession',
      'attemptRemovePreProjectGroup',
      'accessibility',
      'setFeedback',
    ]),

    openModalAddGroup() {
      this.$router.push({
        name: 'classroom.pre.project.management.modal.create',
      })
    },

    removeHandler(event) {
      this.removeData = event
    },

    editHandler(event) {
      this.$router.push({
        name: 'classroom.pre.project.management.modal.edit',
        params: { id: event.preProjectGroupId },
      })
    },

    getStudentsNameLabel(names) {
      const firstTwoNames = names.slice(0, 2).join(', ')
      const restCount = names.length - 2

      return restCount > 0 ? `${firstTwoNames} +${restCount}` : firstTwoNames
    },

    remove() {
      this.setFetching(true)
      this.attemptRemovePreProjectGroup(this.removeData.preProjectGroupId)
        .then(() => {
          this.removeData = null
          this.setFeedback({
            message: this.$t('pre.project.management.remove.success.feedback'),
          })
          if (this.currentPreProjectConfig && this.currentPreProjectConfig.totalGroups > 0) {
            this.currentPreProjectConfig.totalGroups--
          }
          this.pgtrRefresh()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('pre.project.management.remove.error.feedback'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <div
    class="management-group"
    :data-testid="$testId('management-group')"
  >
    <div class="p-4">
      <FilterList>
        <template slot="filterTab">
          <div class="tabs-filter">
            <slot />
          </div>
        </template>
        <Action
          slot="button"
          :text="$t('pre.project.management.group.action')"
          type="button"
          primary
          large
          fixed-width
          @click="openModalAddGroup()"
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
      <DatatableManagementGroup
        :items-groups="pgtrCurrentData"
        @edit="editHandler"
        @remove="removeHandler"
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

    <ModalConfirm
      :active="!!removeData"
      :title="$t('pre.project.group.delete.title')"
      :confirm-btn-text="$t('pre.project.management.modal.confirm.delete.group')"
      @close="removeData = null"
      @confirm="remove"
    >
      <p class="mb-5">{{ $t('pre.project.group.delete.description') }}</p>

      <Datatable
        v-if="removeData"
        class="management-group-modal mt-5"
        :items="[{}]"
      >
        <template slot="thead">
          <tr>
            <th class="th col-5">
              {{ $t('community.groups:datatable.header.1') }}
            </th>
            <th class="th col-2 text-center">
              {{ $t('global:modality') }}
            </th>
          </tr>
        </template>
        <template slot="tbody">
          <tr class="tr-body">
            <td class="td">
              <span class="td-text">
                {{ getStudentsNameLabel(removeData.studentsNames) }}
              </span>
            </td>
            <td class="td text-center bolder">
              <span class="td-tag">
                {{
                  removeData.isLonely
                    ? $t('pre.project.management.group.datatable.filter.1')
                    : $t('pre.project.management.group.datatable.filter.2')
                }}
              </span>
            </td>
          </tr>
        </template>
      </Datatable>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
.management-group-modal {
  padding: 0;
  .datatable .td-tag {
    background-color: var(--gray);
  }
}
</style>
