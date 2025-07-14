<script>
import { mapActions, mapState } from 'vuex'
import ModalUserBatchMixin from './shared/ModalUserBatchMixin'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'
import { CompletedUserBatchTable, PendingUserBatchTable } from './components'

export default {
  name: 'ModalUserBatchList',
  mixins: [ModalUserBatchMixin],
  components: {
    PendingUserBatchTable,
    CompletedUserBatchTable,
    Action,
    Modal,
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'users']),
  },
  methods: {
    ...mapActions(['setFetching', 'attemptListBatchRegisterProcess']),
    backToButton() {
      this.$router.push(this.$route.meta.modalCloseLink)
    },
    openBulkRegister() {
      this.$router.push({ name: 'community.users.batch' })
    },
    openBulkEdit() {
      this.$router.push({ name: 'community.users.batch.edit' })
    },
    updateCompleted() {
      this.$refs['completed-user-batch'].pgtrRefresh()
    },
  },
}
</script>

<template>
  <Modal
    :active="true"
    :cancel="false"
    is-page
  >
    <Action
      :text="$t('community:back.to.list')"
      icon="keyboard_backspace"
      icon-size="medium"
      class="btn-back text-color"
      type="button"
      @click="backToButton"
    />

    <span class="modal-subtitle">
      {{ $t('community.users:bulk.register') }}
    </span>

    <h2 class="modal-title text-color">{{ $t('community.users:sent.batches') }}</h2>

    <div class="modal-description text-color">
      <p class="text-color" v-html="$t('community.users:sent.batches.description')"></p>
    </div>

    <div class="add-new-batch controls">
      <Action
        :text="$t('community.users:bulk.register')"
        type="button"
        @click="openBulkRegister"
        fixed-width
        primary
        large
      />

      <Action
        :text="$t('community.users:bulk.edit')"
        type="button"
        @click="openBulkEdit"
        fixed-width
        large
        flat
      />
    </div>

    <PendingUserBatchTable @update-completed="updateCompleted" />
    <CompletedUserBatchTable ref="completed-user-batch" />
  </Modal>
</template>

<style lang="scss">
</style>
