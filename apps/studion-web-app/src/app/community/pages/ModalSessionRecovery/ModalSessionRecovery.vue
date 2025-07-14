<script>
/** WIP - Initial structure */
import { defineComponent } from 'vue'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions } from 'vuex'
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import FilterListOrder from '@/components/general/FilterListOrder'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import Pagination from '@/components/general/Pagination'
import Icon from '@/components/general/Icon'
import EmptyMessage from '@/components/general/EmptyMessage'
import DataTableTd from '@/components/general/DataTableTd'

import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from './options'

export default defineComponent({
  name: 'ModalSessionRecovery',

  components: {
    Action,
    Checkbox,
    Datatable,
    FilterList,
    FilterListSearch,
    FilterListTag,
    FilterListOrder,
    Modal,
    ModalHeader,
    Pagination,
    Icon,
    EmptyMessage,
    DataTableTd,
  },

  mixins: [paginateMixin],

  props: {
    sessionId: {
      type: [Number, String],
      default: null,
    },
    topicName: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      payload: [],
      selectedCounter: 0,
      formData: {
        enrollments: [],
      },
      isInitialPageLoad: true,
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
      handler(value) {
        this.setFetching(value)
      },
    },
    pgtrCurrentData: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const counter = newValue.filter((item) => item.recoveryExaminationId !== null).length
          this.selectedCounter = counter
        }
      },
    },
    'pgtrParams.page': {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          if (this.isInitialPageLoad) {
            this.isInitialPageLoad = false
          } else {
            this.save()
          }
        }
      },
    },
  },

  created() {
    this.pgtrFilterTagOptions = [...defaultFilterListTagOptions()]
    this.pgtrInitializePagination('attemptExaminationUserListRecovery', null, {
      sessionId: this.sessionId,
    })
  },

  methods: {
    ...mapActions(['setFetching', 'attemptPostStudentRecovery', 'setFeedback']),

    save() {
      this.setFetching(true)
      this.attemptPostStudentRecovery({ id: this.sessionId, data: this.formData })
        .then(() => {
          this.setFeedback({ message: this.$t('community.sessions.recovery:success') })

          this.pgtrRefresh()
        })
        .catch((error) => {
          this.setFeedback({ message: error })
        })
        .finally(() => {
          this.formData.enrollments = []
          this.setFetching(false)
        })
    },

    /**
     * @param {Boolean} add - Add or remove
     * @param {Object} data - Student data
     */
    selectUser(add, data) {
      const index = this.formData.enrollments.findIndex((item) => item.id === data.id)

      if (add) {
        if (index !== -1 && this.formData.enrollments[index].bind === false) {
          this.formData.enrollments[index].bind = true
          this.selectedCounter++
        } else if (index === -1) {
          this.formData.enrollments.push({
            id: data.id,
            recoveryExaminationId: data.recoveryExaminationId,
            bind: true,
          })

          this.selectedCounter++
        }
      } else {
        if (data.recoveryExaminationId !== null) {
          if (index !== -1) {
            this.formData.enrollments[index].bind = false
          } else {
            this.formData.enrollments.push({
              id: data.id,
              recoveryExaminationId: data.recoveryExaminationId,
              bind: false,
            })
          }
          this.selectedCounter--
        } else {
          this.formData.enrollments.splice(index, 1)
          this.selectedCounter--
        }
      }
    },

    setupPage() {
      this.pgtrInitializePagination('attemptExaminationUserListRecovery', null, {
        sessionId: this.sessionId,
      })
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-session-recovery')"
    class="modal-session-recovery"
    active
    is-page
  >
    <ModalHeader
      :sub-title="topicName"
      :title="$t('community.sessions.recovery:title')"
      :description="$t('community.sessions.recovery:description')"
    />

    <FilterList>
      <FilterListOrder
        slot="order"
        :options="filterListOrderOptions"
        :label="$t('global:filter.order.label')"
        :initial-value="pgtrParams.order"
        on-server
        dark
        @update-orders="pgtrUpdateOrder"
      />

      <FilterListTag
        slot="tag"
        :tag-all-filters-active="pgtrTagAllFilters"
        :options="pgtrFilterTagOptions"
        :initial-value="pgtrParams.filter"
        dark
      />

      <FilterListSearch
        slot="search"
        ref="filterlistsearch"
        :initial-value="pgtrParams.query['name']"
        hide-error-details
        dark
        @search="pgtrSetSearch('name', $event)"
      />
    </FilterList>

    <Datatable
      v-if="pgtrCurrentData.length > 0"
      :items="pgtrCurrentData"
      dark
    >
      <template slot="thead">
        <tr v-if="!$media.mobile">
          <th class="th col-4">
            {{ $t('global:user') }}
          </th>
          <th class="th col-2">
            {{ $t('global:form.username') }}
          </th>
          <th class="th col-3">
            {{ $t('global:form.email') }}
          </th>
          <th class="th col-2">
            {{ $t('global:status') }}
          </th>
          <th class="th col-1">
            {{ $t('library:datatable.header.3') }}
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr
          :class="{
            'tr-body': !$media.mobile,
            'tr-mobile': $media.mobile,
          }"
        >
          <DataTableTd label="global:user">
            <div class="datatable-image">
              <img
                v-if="props.item.image"
                :src="props.item.image"
                class="w-2rem border-circle"
              />
              <Icon
                v-else
                class="text-3xl icon-fill-1"
                name="account_circle"
                pack="material"
              />
            </div>
            <span>{{ props.item.name }}</span>
          </DataTableTd>

          <DataTableTd label="global:form.username">
            <div class="td-text-username">
              <span>
                {{ props.item.username }}
              </span>
            </div>
          </DataTableTd>

          <DataTableTd label="global:form.email">
            <span>
              {{ props.item.email }}
            </span>
          </DataTableTd>

          <DataTableTd label="global:status">
            <span>
              {{ $t(`global:solution.status.${props.item.statusAlias}`) }}
            </span>
          </DataTableTd>

          <DataTableTd class="td-actions">
            <span>
              <Checkbox
                :value="!!props.item.recoveryExaminationId"
                :items="[{ value: true }]"
                switch-type
                dark
                @input="selectUser($event, props.item)"
              />
            </span>
          </DataTableTd>
        </tr>
      </template>
    </Datatable>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>

    <div
      v-if="pgtrCurrentData.length > 0"
      class="datatable-item-selected theme-dark"
    >
      <p class="text-color">{{ $t('community.sessions.recovery:selected') }}</p>
      <span class="datatable-item-selected-length">{{ selectedCounter }}</span>
    </div>

    <Pagination
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      dark
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @change-items-per-page="pgtrParams.limit = $event"
    />

    <div
      v-if="pgtrCurrentData.length > 0"
      class="text-center"
    >
      <Action
        :text="$t('global:save')"
        type="button"
        primary
        large
        fixed-width
        dark
        @click="save()"
      />
    </div>
  </Modal>
</template>

<style lang="scss">
.modal-session-recovery {
  .datatable-wrapper {
    padding-bottom: 4px;
    .tr-mobile {
      display: grid;
      grid-template-columns: 15% 50% auto;

      @media (max-width: 1023px) {
        .td {
          width: 100%;
          min-height: 70px;
          height: auto;
        }
      }

      .td {
        padding: 10px;

        .td-text-header {
          margin-bottom: 5px;
          font-weight: bold;
        }
        .td-username {
          margin-top: 10px;
        }
        .td-text-username {
          margin-top: 7px;
        }
      }

      .td-actions {
        display: flex;
        width: 100%;
        margin-left: 0;
        padding-left: 0;
        grid-column: span 1;
        grid-row: span 3;
        order: -1;
        min-height: auto;
      }
    }
  }
}
</style>
