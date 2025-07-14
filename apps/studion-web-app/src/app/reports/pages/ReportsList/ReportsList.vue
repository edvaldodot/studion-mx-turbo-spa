<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Icon from '@/components/general/Icon'
import Pagination from '@/components/general/Pagination'
import CardReports from '@/app/reports/components/CardReports'

export default {
  name: 'ReportsList',
  components: {
    Action,
    ActionBar,
    CardReports,
    ContentHeader,
    FilterList,
    FilterListOrder,
    FilterListTag,
    Icon,
    Pagination,
    EmptyMessage: () => import('@/components/general/EmptyMessage'),
    Modal: () => import('@/components/general/Modal'),
  },
  data() {
    return {
      filterTagOptions: [],
      modalConfirmRemove: false,
      index: null,
      reportsQueryParams: {
        page: 1,
      },
      paging: { actualPage: 1 },
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'reports']),
    hasWriteAccess() {
      return this.notEqualsProfile('student') ? this.canWrite('reports') : false
    },
  },
  watch: {
    'reportsQueryParams.page'() {
      this.loadReports()
    },
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptProfileListRetrieval',
      'attemptReportListRetrieval',
      'attemptAllReportListRetrieval',
      'attemptReportRemoval',
      'attemptReportUpdate',
      'setReportsData',
    ]),
    openModalAddReport() {
      this.$router.push({ name: 'reports.list.create' })
    },
    openReport(item) {
      this.$router.push({ name: 'reports.view', params: { id: item.id } })
    },
    openModalRemoveReport(item, index) {
      this.modalConfirmRemove = true
      this.setReportsData({ path: 'current', value: item })
      this.index = index
    },
    closeModalRemoveReport() {
      this.modalConfirmRemove = false
    },
    editReport(item, index) {
      this.$router.push({ name: 'reports.list.edit', params: { id: item.id } })
    },
    removeReport() {
      this.modalConfirmRemove = false
      this.setFetching(true)
      this.attemptReportRemoval(this.reports.current.id)
        .then(() => {
          this.setFeedback({ message: this.$t('reports:feedback.removed.success') })
          this.loadReports()
        })
        .catch(({ response }) => {
          this.setFeedback({
            message: this.$t(
              `reports:feedback.removed.error:${response.data.message.replace(/_/g, '.')}`
            ),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    activateReport(item, active) {
      item.active = active
      this.setFetching(true)
      this.attemptReportUpdate(item)
        .then(({ data }) => {
          this.setFeedback({ message: this.$t('reports:feedback.updated.success') })
          this.loadReports()
        })
        .catch(({ response }) => {
          this.setFeedback({
            message: this.$t(
              `reports:feedback.updated.error:${response.data.message.replace(/_/g, '.')}`
            ),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    nextPage() {
      if (this.paging.nextPage) {
        this.reportsQueryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.reportsQueryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.reportsQueryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.reportsQueryParams.page = this.paging.firstPage
      }
    },
    changeItemsPerPage(val) {
      this.reportsQueryParams.limit = val
      if (this.reportsQueryParams.page !== 1) {
        this.reportsQueryParams.page = 1
        return
      }
      this.loadReports()
    },
    loadReports() {
      this.setFetching(true)
      this.retrieveReports()
        .then((reportList) => {
          this.setReportsData({
            path: 'items',
            value: reportList.status === 204 ? [] : reportList.data.data,
          })

          this.paging = reportList.data
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    retrieveReports() {
      return this.canWrite('reports')
        ? this.attemptAllReportListRetrieval(this.reportsQueryParams)
        : this.attemptReportListRetrieval(this.reportsQueryParams)
    },
  },
  created() {
    this.setFetching(true)
    this.loadItemsPerPagePreferences(this.reportsQueryParams)
    this.attemptProfileListRetrieval({ limit: 1000 })
      .then((profiles) => {
        this.setReportsData({
          path: 'profiles',
          value: profiles.data.data.filter((obj) => obj.alias !== 'student'),
        })
      })
      .finally(() => {
        this.setFetching(false)
      })
    this.loadReports()
  },
}
</script>

<template>
  <div class="main-content  reports">
    <content-header
      :title="$t('reports:header.title')"
      :description="$t('reports:header.description')"
      class="header-admin"
    >
      <action-bar slot="actionbar" />
    </content-header>
    <div class="p-3">
      <filter-list>
        <action
          v-if="Account.user.currentProfile === 'admin' || hasWriteAccess"
          :text="$t('reports:btn.add')"
          :dark="accessibility"
          @click="openModalAddReport()"
          slot="button"
          type="button"
          primary
          large
          fixed-width
        />
      </filter-list>
    </div>
    <div class="p-4">
      <empty-message v-if="reports.items.length === 0 && Account.user.currentProfile === 'admin'">
        <h2>{{ $t('reports:empty.title:admin') }}</h2>
        <p class="text-color">{{ $t('reports:empty.message:admin') }}</p>
      </empty-message>
      <empty-message v-if="reports.items.length === 0 && Account.user.currentProfile === 'agent'">
        <h2>{{ $t('reports:empty.title:agent') }}</h2>
        <p class="text-color">{{ $t('reports:empty.message:agent') }}</p>
      </empty-message>
      <template v-else>
        <div class="reports-list clearfix">
          <card-reports
            v-for="(item, index) in reports.items"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            :thumbnail="item.imagePath"
            :url="item.url"
            :active="Boolean(item.active)"
            :hasWriteAccess="hasWriteAccess"
            @edit="editReport(item, index)"
            @remove="openModalRemoveReport(item, index)"
            @activate="activateReport(item, true)"
            @deactivate="activateReport(item, false)"
            @open="openReport(item)"
          />
        </div>
        <pagination
          :activePage="this.paging.actualPage"
          :pageCount="this.paging.lastPage"
          @next-page="nextPage"
          @previous-page="previousPage"
          @first-page="firstPage"
          @last-page="lastPage"
          @go-to-page="reportsQueryParams.page = $event"
          @change-items-per-page="changeItemsPerPage"
        />
      </template>
    </div>
    <modal
      :active="modalConfirmRemove"
      :cancel="false"
      @close="closeModalRemoveReport"
    >
      <div class="modal-confirm">
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('library:modal.confirm.title') }}</h3>
        </div>
        <div class="modal-confirm-footer">
          <action
            type="button"
            :text="$t('global:confirm')"
            flat
            @click="removeReport()"
            :dark="accessibility"
          />
          <action
            type="button"
            :text="$t('global:cancel')"
            flat
            class="btn-cancel"
            @click="closeModalRemoveReport()"
            :dark="accessibility"
          />
        </div>
      </div>
    </modal>

    <router-view @saved-report="loadReports" />
  </div>
</template>

<style lang="scss">
@import '~@/app/reports/styles.scss';
</style>
