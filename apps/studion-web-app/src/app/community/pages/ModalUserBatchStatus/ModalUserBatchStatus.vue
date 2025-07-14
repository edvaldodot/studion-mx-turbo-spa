<script>
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'
const ProgressBar = () => import('@/components/general/ProgressBar')

export default {
  name: 'ModalUserBatchStatus',
  components: {
    Action,
    Modal,
    ProgressBar,
  },
  data () {
    return {
      timer: null,
      batch: {
        id: null,
        fileName: null,
        status: null,
        batchProgress: 0,
        batchTotal: 0,
        batchTotalErrors: 0,
        batchTotalSuccess: 0,
        type: null
      },
      isLoading: true
    }
  },
  computed: {
    isProcessing () {
      return (this.batch.status === 'pending' || this.batch.status === 'processing')
        ? 'pending'
        : 'completed'
    },
    title () {
      return this.batch.type === 'updater' ? this.$t(`community.users.edit.batch.status.${this.isProcessing}:title`) : this.$t(`community.users.batch.status.${this.isProcessing}:title`)
    },
    description () {
      if (this.isProcessing === 'pending') {
        return this.$t(`community.users.batch.status.pending:description`)
      } else {
        return this.batch.type === 'updater' ? this.$t(`community.users.edit.batch.status.completed:description`) : this.$t(`community.users.batch.status.completed:description`)
      }
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptGetProgressRegister',
      'attemptDownloadUserBatchReport'
    ]),
    backToButton () {
      this.$router.push({name: 'community.users.batch.list'})
    },
    downloadBatchSummary () {
      this.setFetching(true)
      this.attemptDownloadUserBatchReport(this.batch).finally(() => {
        this.setFetching(false)
      })
    },
    setLoading (isLoading) {
      this.isLoading = isLoading
      this.setFetching(isLoading)
    },
    getProgress (skipLoading = false) {
      this.setLoading(!skipLoading)
      if (this.$route.params.id) {
        this.attemptGetProgressRegister(this.$route.params.id).then(({ data }) => {
          if (data.status === 'completed') clearInterval(this.timer)
          this.batch = data
        }).finally(() => {
          this.setLoading(false)
        })
      } else {
        this.setLoading(false)
        this.$router.push(this.$route.meta.modalCloseLink)
      }
    }
  },
  created () {
    this.getProgress()
    this.timer = setInterval(() => {
      this.getProgress(true)
    }, 5000)
  },
  destroyed () {
    clearTimeout(this.timer)
  }
}
</script>
<template>
  <modal :active="true" :cancel="false" is-page>
    <div v-if="!isLoading">
      <Action
        :text="$t('community:back.to.list.batch')"
        icon="keyboard_backspace"
        icon-size="medium"
        class="btn-back text-color"
        type="button"
        @click="backToButton"
      />
      <h2 class="modal-title text-color modal-batch-enroll-title">{{ title }}</h2>
      <span class="modal-batch-enroll-subtitle text-color">{{ $t(`community.users.batch.status.${isProcessing}:subtitle`) }}</span>
      <div class="modal-description text-color">
        <p v-html="description" class="text-color"></p>
        <Action
          v-if="isProcessing === 'completed'"
          :text="$t('community.sessions:modal.batch.processing.completition.download_sheet')"
          type="button"
          flat
          @click="downloadBatchSummary()"
       />
      </div>
      <div class="modal-batchprogress" v-if="isProcessing === 'pending'">
        <p class="text-color" v-html="$t(batch.batchTotal <= 1 ? 'community.users:modal.batch.processing.single.detail' : 'community.users:modal.batch.processing.detail', {nme: batch.fileName, num1: batch.batchProgress, num2: batch.batchTotal})"></p>
        <progress-bar
          :actual="batch.batchProgress"
          :total="batch.batchTotal"
        >
        </progress-bar>
        <p class="text-color" v-html="$t(batch.batchTotal <= 1 ? 'community.users:modal.batch.processing.detail.single.progress' : 'community.users:modal.batch.processing.detail.progress', {num1: batch.batchProgress, num2: batch.batchTotal})"></p>
      </div>
    </div>
  </modal>
</template>

<style lang="scss"></style>
