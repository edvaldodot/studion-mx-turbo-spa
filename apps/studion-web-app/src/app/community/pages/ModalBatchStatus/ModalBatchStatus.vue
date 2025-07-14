<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'
import ModalBatchDone from '@/app/community/pages/ModalBatchDone'
const ModalBatchCancelled = () => import('@/app/community/pages/ModalBatchCancelled')
const ModalBatchProcessing = () => import('@/app/community/pages/ModalBatchProcessing')

export default {
  name: 'ModalBatchStatus',
  components: {
    Action,
    Modal,
    ModalBatchDone,
    ModalBatchCancelled,
    ModalBatchProcessing
  },
  data () {
    return {
      batch: {},
      modalStopBatchConfirmActive: false,
      interval: null
    }
  },
  computed: {
    ...mapState(['accessibility', 'Sessions'])
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptListBatchProcess',
      'attemptCancelBatchProcess',
      'attemptDownloadBatchProcessReport'
    ]),
    backToSessionModal () {
      this.$router.push({ name: 'community.sessions.enrollments', params: { id: this.$route.params.id } })
    },
    openFinishedBatches () {
      this.$router.push({ name: 'community.sessions.finished.batches', params: { id: this.$route.params.id } })
    },
    openStopBatchModalConfirm () {
      this.modalStopBatchConfirmActive = true
    },
    closeStopBatchModalConfirm () {
      this.modalStopBatchConfirmActive = false
    },
    confirmStopBatch () {
      this.setFetching(true)
      this.attemptCancelBatchProcess({ processId: this.batch.id }).catch(({ response }) => {
        this.setFeedback({ message: this.$t('community.sessions:modal.confirm.stopbatch.error.' + response.data.message) })
      }).finally(() => {
        this.backToSessionModal()
        this.setFetching(false)
      })
    },
    downloadBatchSummary () {
      this.setFetching(true)
      this.attemptDownloadBatchProcessReport({ processId: this.batch.id, fileName: this.batch.enrollFileName })
        .finally(() => {
          this.setFetching(false)
        })
    },
    loadBatch () {
      this.batch = this.$route.params.batch
      if (this.batch.status === 'pending' || this.batch.status === 'processing') {
        this.interval = setInterval(() => {
          this.attemptListBatchProcess({ sessionId: this.$route.params.id, status: 'pending,processing,completed' })
            .then(({ data }) => {
              let getBatch = data.filter((item) => {
                return item.id === this.batch.id
              })

              if (getBatch.length < 1) return

              this.batch = {
                id: getBatch[0].id,
                enrollBatchActualProgress: getBatch[0].batchProgress,
                enrollBatchAmountSent: getBatch[0].batchTotal,
                enrollFileName: getBatch[0].fileName,
                state: {
                  error: getBatch[0].batchTotalErrors,
                  success: getBatch[0].batchTotalSuccess
                },
                status: getBatch[0].status
              }
            })
        }, 5000)
      }
    }
  },
  created () {
    if (this.$route.params.id && this.$route.params.batch) {
      this.loadBatch()
    } else {
      this.$router.go(-1)
    }
  },
  destroyed () {
    clearInterval(this.interval)
  }
}
</script>
<template>
  <div>
    <modal-batch-processing
      :activeBatchProgress="batch"
      @backToSession="backToSessionModal"
      @stopModalConfirm="openStopBatchModalConfirm"
      v-if="batch.status === 'pending' || batch.status === 'processing'">
    </modal-batch-processing>

    <modal-batch-done
      :show="batch.status === 'completed'"
      :activeBatchProgress="batch"
      @backToList="openFinishedBatches"
      @downloadBatchSummary="downloadBatchSummary"
    >
    </modal-batch-done>

    <modal-batch-cancelled
      :activeBatchProgress="batch"
      @backToList="openFinishedBatches"
      @downloadBatchSummary="downloadBatchSummary"
      v-if="batch.status === 'canceled'">
    </modal-batch-cancelled>

    <modal :active.sync="modalStopBatchConfirmActive" :cancel="false">
      <div class="modal-confirm">
        <action @click="closeStopBatchModalConfirm()" class="btn-close" icon="close" icon-size="medium" type="button"/>
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('community.sessions:modal.confirm.stopbatch.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('community.sessions:modal.confirm.stopbatch.description') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <action :dark="accessibility" :text="$t('global:back')" @click="closeStopBatchModalConfirm()" flat
                  type="button"></action>
          <action :dark="accessibility" :text="$t('community.sessions:modal.confirm.stopbatch.confirm.btn')"
                  @click="confirmStopBatch()" class="btn-right" flat type="button"></action>
        </div>
      </div>
    </modal>
  </div>
</template>
