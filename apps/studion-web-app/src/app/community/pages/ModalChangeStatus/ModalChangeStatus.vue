<script>
import { mapState, mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Datepicker from '@/components/general/Datepicker'
import Modal from '@/components/general/Modal'
import SelectField from '@/components/general/SelectField'
import ReasonFields from '@/components/shared/ReasonFields/ReasonFields.vue'

export default {
  name: 'ModalChangeStatus',

  components: {
    Action,
    Datepicker,
    Modal,
    SelectField,
    ReasonFields,
  },

  props: {
    statusTitle: {
      type: String,
      default: '',
    },
    currentEnrollment: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      nextStatus: null,
      statusUpdatedAt: null,
      confirmStatus: '',
      statusOptions: [],
      allStatusOptions: [],
      searchNextStatus: '',
      title: '',
      description: '',
      todaysDate: new Date(),
      errorMessages: {
        date_session_invalid: 'community.sessions.modal:change.status.date_session_invalid.error',
        date_status_invalid: 'community.sessions.modal:change.status.date_status_invalid.error',
        status_is_same: 'community.sessions.modal:change.status.status_is_same.error',
        status_updated_at_more_than_now:
          'community.sessions.modal:change.status.status_updated_at_more_than_now.error',
      },
      reason: null,
    }
  },

  validations: {
    nextStatus: {
      required,
    },
  },

  computed: {
    ...mapState(['fetching', 'accessibility', 'Sessions']),

    initialSessionAvailability() {
      const current = this.Sessions && this.Sessions.current
      const availability = current && current.availability
      return availability ? availability.initial : null
    },
  },

  created() {
    if (this.currentEnrollment) {
      this.loadAllStatus()
    } else {
      this.closeModal()
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptEnrollmentStatusUpdate',
      'attemptEnrollmentStatusListRetrieval',
    ]),

    closeModal() {
      this.confirmStatus = ''
      this.$emit('close')
    },

    openConfirm() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      const reasonFieldValidate = this.$refs.reasonField.validate()
      if (!reasonFieldValidate) return

      this.confirmStatus = this.nextStatus
      this.searchNextStatus = this.statusOptions.filter(
        (status) => status.value === this.confirmStatus
      )
      this.searchNextStatus = this.searchNextStatus.length > 0 ? this.searchNextStatus[0].alias : ''
      if (this.searchNextStatus === 'nao_iniciou') {
        this.title = this.$t('community.sessions.add:modal.student.status.notstarted')
        this.description = 'community.sessions.modal:change.status.confirm.message.1'
      } else if (this.searchNextStatus === 'em_andamento') {
        this.title = this.$t('community.sessions.add:modal.student.status.inprogress')
        this.description = 'community.sessions.modal:change.status.confirm.message.2'
      } else if (this.searchNextStatus === 'aprovado') {
        this.title = this.$t('community.sessions.add:modal.student.status.approved')
        this.description = 'community.sessions.modal:change.status.confirm.message.3'
      } else if (this.searchNextStatus === 'reprovado') {
        this.title = this.$t('community.sessions.add:modal.student.status.disapproved')
        this.description = 'community.sessions.modal:change.status.confirm.message.4'
      } else if (this.searchNextStatus === 'expirado') {
        this.title = this.$t('community.sessions.add:modal.student.status.expired')
        this.description = 'community.sessions.modal:change.status.confirm.message.5'
      } else if (this.searchNextStatus === 'desistente') {
        this.title = this.$t('community.sessions.add:modal.student.status.quitter')
        this.description = 'community.sessions.modal:change.status.confirm.message.6'
      } else if (this.searchNextStatus === 'realizado') {
        this.title = this.$t('global:solution.status.realizado')
        this.description = 'community.sessions.modal:change.status.confirm.message.7'
      }
    },

    getPayload() {
      return {
        status_id: this.confirmStatus,
        reason_status_id: this.reason,
      }
    },

    async submitChangeStatusStudent() {
      const reasonHandlerSuccess = await this.$refs.reasonField.reasonHandler()
      if (!reasonHandlerSuccess) return

      this.setFetching(true)

      const payload = this.getPayload()

      if (this.statusUpdatedAt) {
        payload['status_updated_at'] = this.statusUpdatedAt
      }

      this.attemptEnrollmentStatusUpdate({ enrollmentId: this.currentEnrollment.id, payload })
        .then(() => {
          let newStatus = this.allStatusOptions.filter(({ value }) => value === this.confirmStatus)
          this.$emit('updateStatus', this.resolveStudentStatus(newStatus[0].alias))
          this.closeModal()
          this.setFeedback({
            message: this.$t('community.sessions.modal:change.status.confirm.success'),
          })
        })
        .catch(this.errorHandler)
        .finally(() => {
          this.setFetching(false)
        })
    },

    errorHandler({ response }) {
      this.$impersonateFeedbackError()
      const responseMessage = response && response.data && response.data.message
      const selectedErrorMessage = responseMessage && this.errorMessages[responseMessage]

      let fallbackError = 'community.sessions.modal:change.status.confirm.error'

      if (selectedErrorMessage) {
        fallbackError = selectedErrorMessage
      }

      this.setFeedback({ message: this.$t(fallbackError) })
      this.confirmStatus = ''
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
        case 'realizado':
          return 'global:solution.status.realizado'
      }
    },

    filterStatusOptions() {
      this.nextStatus = this.currentEnrollment.statusId
      this.statusOptions = this.allStatusOptions
    },

    loadAllStatus() {
      if (this.allStatusOptions.length === 0) {
        this.setFetching(true)
        this.attemptEnrollmentStatusListRetrieval(this.$route.params.id)
          .then(({ data }) => {
            this.allStatusOptions = data.map((status) => ({
              value: status.id,
              text: this.$t(this.resolveStudentStatus(status.alias)),
              alias: status.alias,
            }))
            let updateStatusNotStarted = this.allStatusOptions.filter(
              (status) => status.alias === 'nao_iniciou'
            )
            if (updateStatusNotStarted.length > 0) {
              updateStatusNotStarted[0].text = this.$t(this.resolveStudentStatus('nao_iniciou'))
            }
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
      } else {
        this.filterStatusOptions()
      }
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
        @click="closeModal"
      />

      <div class="modal-form modal-add-session">
        <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>

        <h2 class="modal-title text-color">
          {{ $t('community.sessions.modal:subtitle.change.status') }}
        </h2>

        <div class="modal-description text-color">
          <p class="text-color">{{ $t('community.sessions.modal:description') }}</p>

          <form @submit.prevent="openConfirm">
            <SelectField
              v-model="nextStatus"
              :validation="$v.nextStatus"
              :items="statusOptions"
              :label="$t('community.sessions.modal:status.class.label')"
              dark
            />

            <ReasonFields
              ref="reasonField"
              v-model="reason"
            />

            <Datepicker
              v-model="statusUpdatedAt"
              :min="currentEnrollment.statusUpdatedAt || initialSessionAvailability"
              :max="todaysDate"
              :label="$t('community.sessions.modal:status.updated.label')"
              :dark="true"
              time
            />

            <Action
              class="mt-5"
              :text="$t('global:form.save')"
              type="button"
              fixed-width
              large
              secondary
              submit
            />
          </form>
        </div>
      </div>
    </div>

    <template v-if="confirmStatus">
      <div class="modal-confirm">
        <div class="modal-confirm-content">
          <h3
            class="modal-confirm-title"
            v-html="
              $t('community.sessions.modal:change.status.confirm.title', {
                nextStatusStudent: title,
              })
            "
          ></h3>

          <div class="modal-confirm-description">
            <p v-html="$t(`${description}`)"></p>
          </div>
        </div>

        <div class="modal-confirm-footer">
          <Action
            :dark="accessibility"
            :text="$t('global:cancel')"
            class="btn-left"
            type="button"
            flat
            @click="closeModal"
          />

          <Action
            :dark="accessibility"
            :text="$t('global:continue')"
            class="btn-right"
            type="button"
            flat
            @click="submitChangeStatusStudent"
          />
        </div>
      </div>
    </template>
  </Modal>
</template>
