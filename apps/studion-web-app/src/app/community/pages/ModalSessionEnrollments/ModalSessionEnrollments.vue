<script>
import { mapActions, mapState } from 'vuex'
import i18n from '@/support/i18n'

import Action from '@/components/general/Action'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import Icon from '@/components/general/Icon'
import Modal from '@/components/general/Modal'
import Pagination from '@/components/general/Pagination'
import ProgressBar from '@/components/general/ProgressBar'
import Tooltip from '@/components/general/Tooltip'
import TextReduce from '@/components/general/TextReduce'
import { certificateMixin } from '@/mixins/certificateMixin'

import SessionTabsModal from '../../components/SessionTabsModal'
const ModalChangeStatus = () => import('@/app/community/pages/ModalChangeStatus')
const ModalUnenrollStudent = () => import('@/app/community/pages/ModalUnenrollStudent')

export default {
  name: 'ModalSessionEnrollments',
  components: {
    Action,
    ActionSubmenu,
    Datatable,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    Icon,
    Modal,
    ModalChangeStatus,
    ModalUnenrollStudent,
    Pagination,
    ProgressBar,
    SessionTabsModal,
    Tooltip,
    TextReduce,
  },
  mixins: [certificateMixin],
  props: {
    changeStatusOpen: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      showSubmenu: false,
      intervalBatch: null,
      enrollBatchList: [],
      currentStudent: {},
      openChangeStatus: false,
      openRemoveStudent: false,
      formData: {
        session: {
          name: '',
          students: [],
        },
      },
      paging: {
        actualPage: 1,
      },
      confirmStopBatch: null,
      isFiltering: false,
      isSearching: '',
      tagAllFilters: null,
      queryParams: {
        page: 1,
        filter: {},
      },
      filterTagOptions: [
        {
          title: i18n.t('community.sessions.filters:status'),
          name: 'status',
          items: [
            {
              text: i18n.t('community.sessions.add:modal.student.status.notstarted'),
              id: 'nao_iniciou',
              property: 'status',
              value: 'nao_iniciou',
            },
            {
              text: i18n.t('community.sessions.add:modal.student.status.inprogress'),
              id: 'em_andamento',
              property: 'status',
              value: 'em_andamento',
            },
            {
              text: i18n.t('community.sessions.add:modal.student.status.approved'),
              id: 'aprovado',
              property: 'status',
              value: 'aprovado',
            },
            {
              text: i18n.t('community.sessions.add:modal.student.status.disapproved'),
              id: 'reprovado',
              property: 'status',
              value: 'reprovado',
            },
            {
              text: i18n.t('community.sessions.add:modal.student.status.expired'),
              id: 'expirado',
              property: 'status',
              value: 'expirado',
            },
            {
              text: i18n.t('community.sessions.add:modal.student.status.quitter'),
              id: 'desistente',
              property: 'status',
              value: 'desistente',
            },
          ],
        },
      ],
    }
  },
  computed: {
    ...mapState(['accessibility', 'Sessions']),
    isSessionOpen() {
      const currentAvailability = this.Sessions.current && this.Sessions.current.availability

      if (!currentAvailability) return
      if (currentAvailability.final == null || currentAvailability.final === '') return true

      let effectiveDate = currentAvailability.extended || currentAvailability.final
      let endDate = new Date(effectiveDate).getTime()
      let now = new Date().getTime()
      return endDate >= now
    },
    isOffering() {
      return !!(
        this.Sessions.current &&
        this.Sessions.current.offering &&
        this.Sessions.current.offering.id
      )
    },
    filterListOrderOptions() {
      return [
        {
          text: i18n.t('community.sessions.orders:created.desc'),
          value: 0,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: i18n.t('community.sessions.orders:created.asc'),
          value: 1,
          property: 'created_at',
          type: 'asc',
        },
        {
          text: i18n.t('community.sessions.orders:name'),
          value: 2,
          property: 'name',
          type: 'asc',
        },
      ]
    },
  },

  watch: {
    'queryParams.page'() {
      this.loadSessionsUsers()
    },
  },

  created() {
    if (this.changeStatusOpen) {
      this.openChangeStatus = true
      this.currentStudent = { id: this.changeStatusOpen }
    }

    if (this.$route.params.id && this.Sessions.current) {
      this.loadItemsPerPagePreferences(this.queryParams)
      this.formData.session.name = this.Sessions.current.name
      this.loadSessionsUsers()
      this.loadBatchList()
    } else {
      this.$router.push({ name: 'community.sessions' })
    }
  },

  destroyed() {
    this.formData.session.students = []
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptListBatchProcess',
      'attemptCancelBatchProcess',
      'attemptSessionUserListRetrieval',
      'attemptMyselfDownloadCertificate',
      'impersonateUser',
    ]),
    changeItemsPerPage(val) {
      this.queryParams.limit = val
      if (this.queryParams.page !== 1) {
        this.queryParams.page = 1
        return
      }
      this.loadSessionsUsers()
    },
    openSubmenu() {
      this.showSubmenu = !this.showSubmenu
    },
    openModalAddSessionEnroll() {
      this.$router.push({
        name: 'community.sessions.enrollments.enroll.user',
        params: { id: this.$route.params.id },
      })
    },
    openModalBatchSessionEnroll() {
      this.$router.push({
        name: 'community.sessions.enrollments.sendbatch',
        params: { id: this.$route.params.id },
      })
    },
    openModalByGroupSessionEnroll() {
      this.$router.push({
        name: 'community.sessions.enrollments.by.group',
        params: { id: this.$route.params.id },
      })
    },
    openFinishedBatches() {
      this.$router.push({ name: 'community.sessions.finished.batches' })
    },
    isFilteringSearch(value) {
      this.isFiltering = value
    },
    updateOrders(item) {
      let order = {}
      order[item.property] = item.type
      this.queryParams.order = order
      this.loadSessionsUsers()
    },
    search(value) {
      this.isSearching = value !== ''
      this.queryParams.query = { name: value }
      this.loadSessionsUsers()
    },
    loadSessionsUsers() {
      this.setFetching(true)
      let dataParams = JSON.parse(JSON.stringify(this.queryParams))
      this.attemptSessionUserListRetrieval({
        searchParams: dataParams,
        sessionId: this.$route.params.id,
      })
        .then(({ data }) => {
          this.paging = data
          this.formData.session.students = data.data.map((student) => {
            student.status =
              student.statusAlias !== 'nao_iniciou'
                ? this.resolveStudentStatus(student.statusAlias)
                : this.resolveStudentStatus('nao_iniciou')
            return student
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    resolveStudentStatus(statusAlias) {
      switch (statusAlias) {
        case 'nao_iniciou':
          return 'community.sessions.add:modal.student.status.notstarted'
        case 'em_andamento':
          return 'community.sessions.add:modal.student.status.inprogress'
        case 'aprovado':
          return 'community.sessions.add:modal.student.status.approved'
        case 'reprovado':
          return 'community.sessions.add:modal.student.status.disapproved'
        case 'expirado':
          return 'community.sessions.add:modal.student.status.expired'
        case 'desistente':
          return 'community.sessions.add:modal.student.status.quitter'
      }
    },
    updateFilters(filters) {
      let params = {}
      filters.map((obj) => {
        if (!Array.isArray(params[obj.property])) {
          params[obj.property] = []
        }
        params[obj.property].push(obj.id)
      })
      this.queryParams.filter = params
      this.queryParams.page = 1
      this.loadSessionsUsers()
    },
    showTagAllFilters(value) {
      this.tagAllFilters = value
    },
    nextPage() {
      if (this.paging.nextPage) {
        this.queryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.queryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.queryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.queryParams.page = this.paging.firstPage
      }
    },
    downloadCertificate(certificateHash) {
      this.$downloadCertificate(this.attemptMyselfDownloadCertificate, certificateHash)
    },
    loadBatchList() {
      this.attemptListBatchProcess({
        sessionId: this.$route.params.id,
        status: 'pending,processing',
        params: { order: ['created_at', 'desc'] },
      }).then(({ data }) => {
        this.enrollBatchList = []
        if (data.length > 0) {
          this.enrollBatchList = data
            .filter((item) => {
              return item.batchTotal > item.batchProgress
            })
            .map((enrollmentBatchItem) => {
              return {
                id: enrollmentBatchItem.id,
                status:
                  enrollmentBatchItem.status === 'pending'
                    ? 'processing'
                    : enrollmentBatchItem.status,
                enrollFileName: enrollmentBatchItem.fileName,
                enrollBatchAmountSent: enrollmentBatchItem.batchTotal,
                enrollBatchActualProgress: enrollmentBatchItem.batchProgress,
                state: {
                  success: enrollmentBatchItem.batchTotalSuccess,
                  error: enrollmentBatchItem.batchTotalErrors,
                },
              }
            })
        }
      })
    },
    openModalBatchProgress(item) {
      this.$router.push({
        name: 'community.sessions.batch.status',
        params: { id: this.$route.params.id, batch: item },
      })
    },
    openStopBatchModalConfirm(item) {
      this.confirmStopBatch = item
    },
    closeStopBatchModalConfirm() {
      this.confirmStopBatch = null
    },
    stopBatch() {
      this.setFetching(true)
      this.attemptCancelBatchProcess({ processId: this.confirmStopBatch.id })
        .then(() => {
          this.confirmStopBatch = null
        })
        .catch(({ response }) => {
          this.setFeedback({
            message: i18n.t(
              'community.sessions:modal.confirm.stopbatch.error.' + response.data.message
            ),
          })
        })
        .finally(() => {
          this.loadBatchList()
          this.setFetching(false)
        })
    },
    updateStudentStatus() {
      this.loadSessionsUsers()
    },
    openModalRemoveStudent(student) {
      this.currentStudent = student
      this.openRemoveStudent = true
    },
    openModalChangeStudentStatus(student) {
      this.currentStudent = student
      this.openChangeStatus = true
    },

    childrenActive() {
      return this.openChangeStatus || this.openRemoveStudent
    },

    closeModal() {
      this.currentStudent = {}
      this.openChangeStatus = false
      this.openRemoveStudent = false
    },

    getCurrentSessionUuid() {
      const currentSession = this.Sessions && this.Sessions.current
      return currentSession && currentSession.uuid
    },

    goToStatusTimeline(student) {
      this.$router.push({
        name: 'community.sessions.status',
        params: {
          name: student.name,
          enrollmentId: student.id,
        },
      })
    },
  },
}
</script>
<template>
  <div>
    <Modal
      :active="!childrenActive()"
      is-page
    >
      <div class="modal-form modal-add-session">
        <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
        <h2
          v-if="canWrite('sessions')"
          class="modal-title text-color"
        >
          {{ $t('community.sessions:modal.edit.title') }}
        </h2>
        <h2
          v-else
          class="modal-title text-color"
        >
          {{ formData.session.name }}
        </h2>
        <div class="modal-description text-color">
          <p class="text-color">{{ $t('community.sessions:modal.description') }}</p>
        </div>

        <SessionTabsModal
          :show-mediation-plan-tab="
            (canRead('mediation_plan') || canWrite('mediation_plan')) && $isEnabledFeature('pm')
          "
          :tab-link-active="1"
        />

        <div class="py-2">
          <FilterList v-if="canWrite('sessions')">
            <ActionSubmenu
              slot="button"
              :show.sync="showSubmenu"
            >
              <Action
                v-if="isSessionOpen"
                slot="button"
                :text="$t('community.sessions.add:btn.add.student')"
                fixed-width
                large
                primary
                type="button"
                @click="openSubmenu()"
              />
              <template slot="actions">
                <div class="py-4">
                  <Action
                    :text="$t('community.sessions.add:btn.add.single')"
                    dark
                    secondary
                    small
                    type="button"
                    @click="openModalAddSessionEnroll()"
                  />
                  <Action
                    :text="$t('community.sessions.add:btn.add.batch')"
                    dark
                    secondary
                    small
                    type="button"
                    @click="openModalBatchSessionEnroll()"
                  />
                  <Action
                    v-if="!isOffering"
                    :text="$t('trails.users:datatable.header.group')"
                    dark
                    secondary
                    small
                    type="button"
                    @click="openModalByGroupSessionEnroll()"
                  />
                </div>
              </template>
            </ActionSubmenu>
            <Action
              slot="search"
              :text="$t('community.sessions:modal.batch.view.finished')"
              flat
              icon-size="medium"
              type="button"
              @click="openFinishedBatches()"
            />
          </FilterList>
        </div>
      </div>

      <Datatable
        v-if="enrollBatchList.length > 0"
        :items="enrollBatchList"
        dark
      >
        <template slot="thead">
          <tr>
            <th
              class="th"
              width="30%"
            >
              {{ $t('global:file') }}
            </th>
            <th
              class="th"
              width="30%"
            >
              {{ $t('global:progress') }}
            </th>
            <th class="th"></th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr class="tr-colspan">
            <td class="td">
              <span class="td-text bolder">{{ props.item.enrollFileName }}</span>
            </td>
            <td class="td td-inline">
              <ProgressBar
                :actual="props.item.enrollBatchActualProgress"
                :total="props.item.enrollBatchAmountSent"
              />
            </td>
            <td class="td td-progress">
              <span
                class="td-text bolder"
                v-html="
                  props.item.enrollBatchAmountSent === props.item.enrollBatchActualProgress
                    ? $t('global:complete')
                    : $t(
                        props.item.enrollBatchAmountSent <= 1
                          ? 'community.sessions:modal.batch.processing.detail.single.progress'
                          : 'community.sessions:modal.batch.processing.detail.progress',
                        {
                          num1: props.item.enrollBatchActualProgress,
                          num2: props.item.enrollBatchAmountSent,
                        }
                      )
                "
              ></span>
            </td>
            <td class="td">
              <Action
                :dark="accessibility"
                :text="$t('global:know.more')"
                flatten
                type="button"
                @click="openModalBatchProgress(props.item)"
              />
            </td>
            <td class="td">
              <Action
                v-if="props.item.enrollBatchAmountSent > props.item.enrollBatchActualProgress"
                icon="close"
                icon-size="medium"
                type="button"
                @click="openStopBatchModalConfirm(props.item)"
              />
            </td>
          </tr>
        </template>
      </Datatable>

      <div class="py-4">
        <FilterList>
          <FilterListSearch
            slot="search"
            dark
            @search="search"
            @tagAllFilters="showTagAllFilters"
          />

          <FilterListTag
            slot="tag"
            :options="filterTagOptions"
            :tag-all-filters-active="tagAllFilters"
            dark
            state="users"
            @update-filtering="isFilteringSearch"
            @update-filters="updateFilters"
          />

          <FilterListOrder
            slot="order"
            :on-server="true"
            :options="filterListOrderOptions"
            dark
            state="users"
            @update-orders="updateOrders"
          />
        </FilterList>
      </div>

      <!-- filter -->
      <EmptyMessage v-if="formData.session.students.length === 0 && !isSearching && isFiltering">
        <h2>{{ $t('community.sessions:filter.users.empty.title') }}</h2>
      </EmptyMessage>

      <!-- search -->
      <EmptyMessage
        v-if="
          ((formData.session.students.length === 0 && !isFiltering) ||
            (formData.session.students.length === 0 && isFiltering)) &&
          isSearching
        "
      >
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </EmptyMessage>

      <EmptyMessage v-if="formData.session.students.length === 0 && !isSearching && !isFiltering">
        <h2>{{ $t('community.sessions:users.empty.title') }}</h2>
        <p v-html="$t('community.sessions:users.empty.message')"></p>
      </EmptyMessage>

      <Datatable
        v-if="formData.session.students.length"
        :items="formData.session.students"
        dark
      >
        <template slot="thead">
          <tr>
            <th
              class="th"
              width="14,2857%"
            >
              {{ $t('community.sessions.users.list:datatable.header.1') }}
            </th>
            <th
              class="th"
              width="14,2857%"
            >
              {{ $t('community.index:datatable.header.branch') }}
            </th>
            <th
              class="th"
              width="14,2857%"
            >
              {{ $t('community.sessions.users.list:datatable.header.2') }}
            </th>
            <th
              class="th text-center"
              width="14,2857%"
            >
              {{ $t('trails.users:datatable.header.group') }}
            </th>
            <th
              class="th text-center"
              width="14,2857%"
            >
              {{ $t('community.sessions.users.list:datatable.header.3') }}
            </th>
            <th
              class="th"
              width="14,2857%"
            ></th>
            <th
              class="th"
              width="14,2857%"
            ></th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr class="tr-colspan">
            <td class="td">
              <div class="flex gap-2 align-items-center">
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
                <div>
                  <TextReduce
                    :lenght-text="30"
                    :text="props.item.name"
                    class-style="td-text bolder"
                  />
                </div>
              </div>
            </td>
            <td class="td">
              <span class="td-text bolder">{{ props.item.branchName || '-' }}</span>
            </td>
            <td class="td">
              <span class="td-text bolder">{{ props.item.username }}</span>
            </td>
            <td class="td text-center">
              <span class="td-text bolder">{{ props.item.groupName || '-' }}</span>
            </td>
            <td class="td text-center">
              <span :class="{ 'td-tag': !$media.mobile, 'td-text': $media.mobile }">{{
                $t(`global:solution.status.${props.item.statusAlias}`)
              }}</span>
            </td>
            <td class="td text-center">
              <Tooltip
                v-if="props.item && props.item.certificateHash"
                :uppercase="false"
                medium-font
                dark
                vertical-align="top"
              >
                <template #activator="{ on }">
                  <span v-on="on">
                    <Action
                      type="button"
                      icon="certificate"
                      @click="downloadCertificate(props.item.certificateHash)"
                    ></Action>
                  </span>
                </template>
                <span>{{ $t('global:download.certificate') }}</span>
              </Tooltip>
            </td>
            <td class="td">
              <Dropdown
                v-if="canWrite('sessions')"
                icon="dots-vertical"
                icon-size="medium"
                right
              >
                <DropdownLink
                  :text="$t('community.sessions.modal:remove.student')"
                  @click="openModalRemoveStudent(props.item)"
                />

                <DropdownLink
                  v-if="
                    canRead('sessions:enrollment_status_change') &&
                    canWrite('sessions:enrollment_status_change')
                  "
                  :text="$t('community.sessions.modal:change.status')"
                  @click="openModalChangeStudentStatus(props.item)"
                />

                <DropdownLink
                  v-if="canRead('sessions:enrollment_status_change')"
                  :text="$t('global:status.history')"
                  @click="goToStatusTimeline(props.item)"
                />

                <DropdownLink
                  v-if="
                    $isEnabledFeature('impersonate_read_only') &&
                    !$isUserImpersonated() &&
                    props.item.uuid != Account.user.uuid
                  "
                  :text="`${$t('community.profiles:modal.permissions.impersonate')} ${$t(
                    'community.sessions.modal:table.col.2'
                  )}`"
                  @click="
                    impersonateUser({ user: props.item, sessionUuid: getCurrentSessionUuid() })
                  "
                />
              </Dropdown>
            </td>
          </tr>
        </template>
      </Datatable>
      <Pagination
        v-if="formData.session.students.length"
        :active-page="paging.actualPage"
        :page-count="paging.lastPage"
        dark
        @first-page="firstPage"
        @last-page="lastPage"
        @next-page="nextPage"
        @previous-page="previousPage"
        @go-to-page="queryParams.page = $event"
        @change-items-per-page="changeItemsPerPage"
      />
    </Modal>

    <ModalUnenrollStudent
      v-if="openRemoveStudent"
      :current-enrollment="currentStudent"
      @updateList="loadSessionsUsers"
      @close="closeModal"
    />

    <ModalChangeStatus
      v-if="openChangeStatus"
      :current-enrollment="currentStudent"
      @close="closeModal"
      @updateStatus="updateStudentStatus"
    />

    <Modal
      :active="!!confirmStopBatch"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          class="btn-close"
          icon="close"
          icon-size="medium"
          type="button"
          @click="closeStopBatchModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{ $t('community.sessions:modal.confirm.stopbatch.title') }}
          </h3>
          <div class="modal-confirm-description">
            <p class="text-color">
              {{ $t('community.sessions:modal.confirm.stopbatch.description') }}
            </p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            :dark="accessibility"
            :text="$t('global:back')"
            flat
            type="button"
            @click="closeStopBatchModalConfirm()"
          />
          <Action
            :dark="accessibility"
            :text="$t('community.sessions:modal.confirm.stopbatch.confirm.btn')"
            class="btn-right"
            flat
            type="button"
            @click="stopBatch()"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>
