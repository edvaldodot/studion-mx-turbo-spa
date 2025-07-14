<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import SelectField from '@/components/general/SelectField'
import ReasonFields from '@/components/shared/ReasonFields/ReasonFields.vue'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'ModalChangeStatus',

  components: {
    Modal,
    Action,
    SelectField,
    ReasonFields,
    ModalConfirm,
  },

  props: {
    statusTitle: {
      type: String,
      default: '',
    },
    currentEnrollment: {
      type: Object,
      default: () => {},
    },
    enrollmentId: {
      type: Number,
      required: true,
    },
    sessionId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      nextStatus: null,
      confirmStatus: '',
      statusOptions: [],
      allStatusOptions: [],
      searchNextStatus: '',
      title: '',
      description: '',
      reason: null,
    }
  },

  validations: {
    nextStatus: {
      required,
    },
  },

  computed: {
    ...mapState(['fetching', 'accessibility']),
  },

  created() {
    if (this.sessionId) {
      this.loadAllStatus()
    } else {
      this.closeModal()
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptTrailEnrollmentStatusUpdate',
      'attemptEnrollmentStatusListRetrieval',
    ]),
    closeModal() {
      this.confirmStatus = ''
      this.$router.push({
        name: 'trails.users',
        params: { id: this.$route.params.trailId },
      })
    },

    openConfirm() {
      const reasonFieldValidate = this.$refs.reasonField.validate()
      if (!reasonFieldValidate) return

      this.confirmStatus = this.nextStatus
      this.searchNextStatus = this.statusOptions.filter(
        (status) => status.value === this.confirmStatus
      )
      this.searchNextStatus = this.searchNextStatus.length > 0 ? this.searchNextStatus[0].alias : ''
      if (this.searchNextStatus === 'nao_iniciou') {
        this.title = this.$t('trails.users:modal.solution.status.notstarted')
        this.description = 'trails.users:modal.solution.status.confirm.message.1'
      } else if (this.searchNextStatus === 'em_andamento') {
        this.title = this.$t('trails.users:modal.solution.status.inprogress')
        this.description = 'trails.users:modal.solution.status.confirm.message.2'
      } else if (this.searchNextStatus === 'aprovado') {
        this.title = this.$t('trails.users:modal.solution.status.approved')
        this.description = 'trails.users:modal.solution.status.confirm.message.3'
      } else if (this.searchNextStatus === 'reprovado') {
        this.title = this.$t('trails.users:modal.solution.status.disapproved')
        this.description = 'trails.users:modal.solution.status.confirm.message.4'
      } else if (this.searchNextStatus === 'expirado') {
        this.title = this.$t('trails.users:modal.solution.status.expired')
        this.description = 'trails.users:modal.solution.status.confirm.message.5'
      } else if (this.searchNextStatus === 'desistente') {
        this.title = this.$t('trails.users:modal.solution.status.quitter')
        this.description = 'trails.users:modal.solution.status.confirm.message.6'
      } else if (this.searchNextStatus === 'realizado') {
        this.title = this.$t('global:solution.status.realizado')
        this.description = 'community.sessions.modal:change.status.confirm.message.7'
      }
    },

    async submitChangeStatusStudent() {
      const reasonHandlerSuccess = await this.$refs.reasonField.reasonHandler()
      if (!reasonHandlerSuccess) return

      this.setFetching(true)
      this.attemptTrailEnrollmentStatusUpdate({
        enrollmentId: this.enrollmentId,
        statusId: this.confirmStatus,
        reasonStatusId: this.reason,
      })
        .then(() => {
          let newStatus = this.allStatusOptions.filter(({ value }) => value === this.confirmStatus)
          this.$emit('updateStatus', this.resolveStudentStatus(newStatus[0].alias))
          this.closeModal()
          this.setFeedback({
            message: this.$t('community.sessions.modal:change.status.confirm.success'),
          })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('community.sessions.modal:change.status.confirm.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    resolveStudentStatus(statusAlias) {
      switch (statusAlias) {
        case 'nao_iniciou':
          return 'trails.users:modal.solution.status.notstarted'
        case 'em_andamento':
          return 'trails.users:modal.solution.status.inprogress'
        case 'aprovado':
          return 'trails.users:modal.solution.status.approved'
        case 'reprovado':
          return 'trails.users:modal.solution.status.disapproved'
        case 'expirado':
          return 'trails.users:modal.solution.status.expired'
        case 'desistente':
          return 'trails.users:modal.solution.status.quitter'
        case 'realizado':
          return 'global:solution.status.realizado'
      }
    },
    filterStatusOptions() {
      this.statusOptions = this.allStatusOptions
    },
    loadAllStatus() {
      if (this.allStatusOptions.length > 0) {
        this.filterStatusOptions()
      }

      this.setFetching(true)
      this.attemptEnrollmentStatusListRetrieval(this.sessionId)
        .then(({ data }) => {
          this.allStatusOptions = data.map((status) => ({
            value: status.id,
            text: this.$t(this.resolveStudentStatus(status.alias)),
            alias: status.alias,
          }))

          this.filterStatusOptions()
        })
        .catch(() => {
          this.allStatusOptions = []
          this.statusOptions = []
          this.setFeedback({
            message: this.$t('community.sessions.modal:change.status.pull.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>
<template>
  <Modal
    :cancel="false"
    active
    is-page
  >
    <div v-show="!confirmStatus">
      <Action
        :text="$t('global:back')"
        class="btn-back text-color"
        icon="keyboard_backspace"
        icon-size="medium"
        type="button"
        @click="closeModal()"
      />
      <div class="modal-form modal-add-sessiong">
        <span class="modal-subtitle">{{ $t('trails:header.title') }}</span>
        <h2 class="modal-title text-color">
          {{ $t('trails.users:modal.solution.status.title') }}
        </h2>
        <div class="modal-description text-color">
          <p class="text-color">{{ $t('trails.users:modal.solution.status.description') }}</p>
          <form @submit.prevent="openConfirm">
            <SelectField
              v-model="nextStatus"
              :items="statusOptions"
              :label="$t('trails.users:modal.solution.status.label')"
              :validation="$v.nextStatus"
              dark
            />
            <ReasonFields
              ref="reasonField"
              v-model="reason"
            />
            <Action
              :text="$t('global:form.save')"
              type="button"
              class="mt-5"
              fixed-width
              large
              secondary
              submit
            />
          </form>
        </div>
      </div>
    </div>

    <ModalConfirm
      v-if="confirmStatus"
      :active="true"
      :title="
        $t('community.sessions.modal:change.status.confirm.title', { nextStatusStudent: title })
      "
      @close="closeModal"
      @confirm="submitChangeStatusStudent"
    >
      <p v-html="$t(`${description}`)"></p>
    </ModalConfirm>
  </Modal>
</template>
