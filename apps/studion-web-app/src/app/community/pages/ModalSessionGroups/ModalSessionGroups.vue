<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import SessionGroupForm from './components/SessionGroupForm'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'
import Modal from '@/components/general/Modal'
import Pagination from '@/components/general/Pagination'
import Tooltip from '@/components/general/Tooltip'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import GroupEnrollmentsCollapseData from './components/GroupEnrollmentsCollapseData'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default defineComponent({
  components: {
    SessionGroupForm,
    Action,
    Datatable,
    Icon,
    Modal,
    ModalConfirm,
    DatatableCollapseRow,
    GroupEnrollmentsCollapseData,
    Pagination,
    Tooltip,
  },
  mixins: [paginateMixin],
  data() {
    return {
      confirmGroupRemoveModal: false,
      dropdownMap: [],
    }
  },
  computed: {
    ...mapState(['Sessions']),
    sessionId() {
      return this.$route.params.id
    },
  },
  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    pgtrCurrentData() {
      let hasError = false
      this.pgtrCurrentData.forEach((item) => {
        if (hasError) return
        item.enrollments.length &&
          item.enrollments.forEach((enrollment) => {
            if (hasError) return
            if (enrollment.status === 'error') hasError = true
          })
      })

      if (hasError) {
        this.setFeedback({
          message: this.$t('community.session.groups:feedback.error'),
          type: 'info',
          detailText: this.$t('community.session.groups:feedback.error.detail'),
          detail: () => {
            this.$router.push({ name: 'community.users' })
          },
        })
      }
    },
  },
  created() {
    this.setup()
  },
  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptRemoveSessionGroup']),
    setup() {
      this.pgtrInitializePagination(
        'groupSessionListResource',
        { sessionId: this.sessionId },
        { embed: 'users_count' }
      )
    },
    openRemoveModal(groupId) {
      this.confirmGroupRemoveModal = groupId
    },
    confirmRemove() {
      this.setFetching(true)
      this.attemptRemoveSessionGroup(this.confirmGroupRemoveModal)
        .then(() => {
          this.confirmGroupRemoveModal = false
          this.pgtrRefresh()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    toggleEnrollmentDatatableCollapse (index) {
      this.$set(this.dropdownMap, index, !this.dropdownMap[index])
    },
  },
})
</script>

<template>
  <div>
    <Modal
      v-show="!confirmGroupRemoveModal"
      class="session-users-modal"
      active
      is-page
    >
      <span class="modal-subtitle">{{ $t('global:menu.community') }}</span>
      <h2 class="modal-title text-color">{{ Sessions.current.name }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('trails.users:modal.description') }}</p>
      </div>
      <div class="center clearfix">
        <div class="modal-form">
          <SessionGroupForm
            :session-id="sessionId"
            :refresh-table="pgtrRefresh"
          />
        </div>

        <template v-if="pgtrCurrentData && pgtrCurrentData.length > 0">
          <Datatable
            dark
            class="datatable-dropdown-bg"
            :items="pgtrCurrentData"
          >
            <template
              v-if="!$media.mobile"
              slot="thead"
            >
              <tr>
                <th class="th pl-3">{{ $t('trails.groups:datatable.header.group') }}</th>
                <th class="th text-center d-flex align-center justify-center">
                  {{ $t('trails.groups:datatable.header.users_count') }}
                  <Tooltip
                    :uppercase="false"
                    :width="280"
                  >
                    <template #activator="{ on }">
                      <span
                        class="d-inline-flex ml-1"
                        v-on="on"
                      >
                        <Icon
                          dark
                          name="alert-circle"
                        />
                      </span>
                    </template>
                    <span>{{ $t('trails.groups:datatable.users.info') }}</span>
                  </Tooltip>
                </th>
                <th class="th"></th>
                <th class="th" width="2%"></th>
              </tr>
            </template>

            <template
              slot="tbody"
              slot-scope="props"
            >
              <tr class="tr-colspan">
                <td
                  v-if="!$media.mobile"
                  class="td"
                >
                  <span
                    v-if="$media.mobile"
                    class="td-text-header"
                  >
                    {{ $t('trails.groups:datatable.header.group') }}
                  </span>
                  <span class="td-text bolder pl-3">{{ props.item.name }}</span>
                </td>
                <td class="td text-center">
                  <span
                    v-if="$media.mobile"
                    class="td-text-header"
                  >
                    {{ $t('trails.groups:datatable.header.users_count') }}
                  </span>
                  <span class="td-text">{{ props.item.qttMembersGroup }}</span>
                </td>
                <td class="td text-right">
                  <Tooltip>
                    <template #activator="{ on }">
                      <Action
                        type="button"
                        icon="delete"
                        @click="openRemoveModal(props.item.sessionGroupId)"
                        @mouseenter.native="on.mouseenter"
                        @mouseleave.native="on.mouseleave"
                      />
                    </template>
                    <span>{{ $t('trails.groups:datatable.btn.remove.tooltip') }}</span>
                  </Tooltip>
                </td>
                <td class="td">
                  <Action
                    v-if="props.item.enrollments.length"
                    type="button"
                    :icon="dropdownMap[props.index] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                    @click="toggleEnrollmentDatatableCollapse(props.index)"
                  />
                </td>
              </tr>
              <DatatableCollapseRow
                :colspan="5"
                :open="dropdownMap[props.index]"
              >
                <GroupEnrollmentsCollapseData :enrollments="props.item.enrollments" />
              </DatatableCollapseRow>
            </template>
          </Datatable>
          <Pagination
            dark
            :active-page="pgtrParams.page"
            :page-count="pgtrLastPage"
            @next-page="pgtrParams.page++"
            @previous-page="pgtrParams.page--"
            @first-page="pgtrParams.page = 1"
            @last-page="pgtrParams.page = pgtrLastPage"
            @go-to-page="pgtrParams.page = $event"
            @change-items-per-page="pgtrParams.limit = $event"
          />
        </template>
      </div>
    </Modal>

    <ModalConfirm
      :active="confirmGroupRemoveModal"
      :title="$t('trails.groups:confirm.title')"
      @close="confirmGroupRemoveModal = false"
      @confirm="confirmRemove()"
    >
      <p class="text-color">{{ $t('session.groups:confirm.message') }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
.session-users-modal {
  .modal-form-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5em;

    .btn.flat-clear {
      margin: 0;
    }
  }
  .datatable-wrapper.datatable-dropdown-bg.theme-dark {
    .tr-dropdown.is-open {
      box-shadow: 0 0 0 0;
      -webkit-box-shadow: 0 0 0 0;
    }
  }
}
@media screen and (max-width: 1023px) {
  .session-users-modal .modal-form-buttons {
    margin-top: 3em;
    flex-direction: column;
  }
}
</style>
