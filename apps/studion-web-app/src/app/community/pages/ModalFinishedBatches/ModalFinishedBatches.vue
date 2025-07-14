<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Modal from '@/components/general/Modal'
import ProgressBar from '@/components/general/ProgressBar'
import Pagination from '@/components/general/Pagination'

export default {
  name: 'ModalFinishedBatches',
  components: {
    Action,
    Datatable,
    EmptyMessage,
    Modal,
    ProgressBar,
    Pagination,
  },
  data () {
    return {
      batchList: [],
      intervalBatch: null,
      paging: {
        actualPage: 1,
      },
      queryParams: {
        page: 1,
        order: ['created_at', 'desc'],
      },
    }
  },
  computed: {
    ...mapState(['accessibility', 'Sessions']),
    isSessionOpened () {
      if (this.Sessions.current.availability.final == null || this.Sessions.current.availability.final === '') {
        return true
      }
      let effectiveDate = this.Sessions.current.availability.extended || this.Sessions.current.availability.final
      let endDate = new Date(effectiveDate).getTime()
      let now = new Date().getTime()
      return endDate >= now
    },
  },
  watch: {
    'queryParams.page'() {
      this.loadSessionInfo()
    },
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptListBatchProcess',
      'setSessionsData'
    ]),
    goBack () {
      this.$router.push({name: 'community.sessions.enrollments', params: {id: this.$route.params.id}})
    },
    showProgress (item) {
      this.$router.push({name: 'community.sessions.batch.status', params: {id: this.$route.params.id, batch: item}})
    },
    openBatchEnroll () {
      this.$router.push({name: 'community.sessions.enrollments.sendbatch', params: {id: this.$route.params.id}})
    },
    listBatchProgress () {
      const self = this
      this.intervalBatch = setInterval(function () {
        self.loadSessionInfo()
      }, 5000)
    },
    changeItemsPerPage(val) {
      this.queryParams.limit = val
      if (this.queryParams.page !== 1) {
        this.queryParams.page = 1
        return
      }
      this.loadSessionInfo()
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
    loadSessionInfo() {
      return this.attemptListBatchProcess({
        sessionId: this.$route.params.id,
        status: 'canceled,completed',
        params: this.queryParams,
      }).then(({ data }) => {
        this.paging = data
        if (data.data.length > 0) {
          this.batchList = data.data.map((enrollmentBatchItem) => {
            return {
              id: enrollmentBatchItem.id,
              status: enrollmentBatchItem.status,
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
  },
  async created() {
    if (this.$route.params.id) {
      let currentIndex = this.Sessions.items.findIndex(item => {
        return item.id === parseInt(this.$route.params.id)
      })
      this.setSessionsData({path: 'current', value: this.Sessions.items[currentIndex]})
      this.setSessionsData({path: 'currentIndex', value: currentIndex})
      if (!this.Sessions.current) {
        this.$router.push({name: 'community.sessions'})
      }
      this.setFetching(true)
      await this.loadSessionInfo()
      this.setFetching(false)
      this.listBatchProgress()
    } else {
      this.$router.push({name: 'community.sessions'})
    }
  },
  destroyed () {
    clearInterval(this.intervalBatch)
  }
}
</script>
<template>
  <modal :active="true" :cancel="false" is-page>
    <action :text="$t('global:back')" @click="goBack()" class="btn-back text-color" icon="keyboard_backspace" icon-size="medium"
            type="button"></action>

    <div class="modal modal-form modal-batch">
      <span class="modal-subtitle">{{ Sessions.current.name }}</span>
      <h2 class="modal-title text-color">{{ $t('community.sessions:modal.batch.finished.title') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('community.sessions:modal.batch.finished.description') }}</p>
      </div>
    </div>

    <empty-message v-if="batchList.length === 0 && !isSessionOpened">
      <h2>{{ $t('community.sessions.closed:modal.batch.finished.empty.title') }}</h2>
      <p v-html="$t('community.sessions.closed:modal.batch.finished.empty.description')"></p>
    </empty-message>

    <empty-message v-if="batchList.length === 0 && isSessionOpened">
      <h2 class="text-color">{{ $t('community.sessions:modal.batch.finished.empty.title') }}</h2>
      <p class="text-color" v-html="$t('community.sessions:modal.batch.finished.empty.description')"></p>
      <action :text="$t('community.sessions:modal.batch.finished.empty.new.enrollment')"
              @click="openBatchEnroll" flat type="button"></action>
    </empty-message>

    <datatable :items="batchList" dark v-if="batchList.length > 0">
      <template slot="thead">
        <tr class="text-color">
          <th class="th" width="30%">{{ $t('global:file') }}</th>
          <th class="th" width="30%">{{ $t('global:progress') }}</th>
          <th class="th"></th>
        </tr>
      </template>
      <template slot="tbody" slot-scope="props">
        <tr class="tr tr-header mobile" v-if="$media.mobile">
          <td class="td">
            <span class="td-text bolder">{{ props.item.enrollFileName }}</span>
          </td>
        </tr>
        <tr class="tr-colspan">
          <td class="td" v-if="!$media.mobile">
            <span class="td-text bolder">{{ props.item.enrollFileName }}</span>
          </td>
          <td class="td td-inline">
            <progress-bar
              :actual="props.item.enrollBatchActualProgress"
              :progressStyle="props.item.status === 'completed' ? 'default' : 'error'"
              :total="props.item.enrollBatchAmountSent">
            </progress-bar>
          </td>
          <td class="td td-progress">
            <span
              class="td-text bolder"
              v-html="props.item.status === 'completed' ? $t('global:complete') : $t('global:interrupted')">
            </span>
          </td>
          <td class="td">
            <action :text="$t('global:know.more')" @click="showProgress(props.item)" flat
                    type="button"></action>
          </td>
        </tr>
      </template>
    </datatable>

    <Pagination
      dark
      :active-page="paging.actualPage"
      :page-count="paging.lastPage"
      @first-page="firstPage"
      @last-page="lastPage"
      @next-page="nextPage"
      @previous-page="previousPage"
      @go-to-page="queryParams.page = $event"
      @change-items-per-page="changeItemsPerPage"
    />
  </modal>
</template>
