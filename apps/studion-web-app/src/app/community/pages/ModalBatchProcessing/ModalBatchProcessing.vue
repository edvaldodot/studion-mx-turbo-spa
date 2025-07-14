<script>
import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'
import ProgressBar from '@/components/general/ProgressBar'

export default {
  name: 'ModalBatchProcessing',
  components: {
    Action,
    Modal,
    ProgressBar
  },
  props: {
    activeBatchProgress: {
      required: true
    }
  },
  computed: {
    isModalActive () {
      return this.activeBatchProgress &&
        (this.activeBatchProgress.status === 'processing' ||
        this.activeBatchProgress.status === 'pending')
    }
  },
  methods: {
    backToButton () {
      this.$emit('backToSession')
    },
    openStopBatchModalConfirm () {
      this.$emit('stopModalConfirm', this.activeBatchProgress)
    }
  }
}
</script>
<template>
  <modal :active="isModalActive" :cancel="false" is-page>
    <action :text="$t('global:back')" @click="backToButton" class="btn-back text-color" icon="keyboard_backspace" icon-size="medium" type="button"></action>
    <h2 class="modal-title text-color modal-batch-enroll-title">{{ $t('community.sessions:modal.batch.processing.title') }}</h2>
    <span class="modal-batch-enroll-subtitle">{{ $t('community.sessions:modal.batch.processing.subtitle') }}</span>
    <div class="modal-description text-color">
      <p v-html="$t('community.sessions:modal.batch.processing.description')"></p>
    </div>
    <div class="modal-batchprogress">
      <p v-html="$t(activeBatchProgress.enrollBatchAmountSent <= 1 ? 'community.sessions:modal.batch.processing.single.detail' : 'community.sessions:modal.batch.processing.detail', {nme: activeBatchProgress.FileName, num1: activeBatchProgress.enrollBatchActualProgress, num2: activeBatchProgress.enrollBatchAmountSent})"></p>
      <progress-bar
        :actual="activeBatchProgress.enrollBatchActualProgress"
        :total="activeBatchProgress.enrollBatchAmountSent"
      >
      </progress-bar>
      <p v-html="$t(activeBatchProgress.enrollBatchAmountSent <= 1 ? 'community.sessions:modal.batch.processing.detail.single.progress' : 'community.sessions:modal.batch.processing.detail.progress', {num1: activeBatchProgress.enrollBatchActualProgress, num2: activeBatchProgress.enrollBatchAmountSent})"></p>
    </div>
    <div class="modal-spaced">
      <action :text="$t('community.sessions:modal.batch.processing.cancel.batch')" @click="openStopBatchModalConfirm(activeBatchProgress)" flatten icon-size="medium" type="button"></action>
    </div>
  </modal>
</template>
