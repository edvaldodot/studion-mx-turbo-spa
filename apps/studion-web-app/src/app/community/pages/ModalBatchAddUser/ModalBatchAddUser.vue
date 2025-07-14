<script>
import { mapActions } from 'vuex'
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'
import fileExtensionValidator from '@/support/customValidators/fileExtensionValidator'
import { required } from 'vuelidate/lib/validators'

const ModalSendSheet = () => import('@/app/community/pages/ModalSendSheet')

const ALLOWED_FILE_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/excel',
  'application/vnd.ms-excel',
  'application/msexcel',
  'xlsx',
  'csv',
]
const ALLOWED_FILE_EXTENSIONS = ['csv', 'xlsx']

export default {
  name: 'ModalBatchAddUser',
  components: {
    ModalSendSheet,
  },
  props: {
    isBatchEditing: {
      default: false,
    },
  },
  data() {
    return {
      formBatchData: {
        file: null,
      },
    }
  },
  validations: {
    formBatchData: {
      file: {
        required,
        mimeType: mimeTypeValidator(ALLOWED_FILE_TYPES),
        extension: fileExtensionValidator(ALLOWED_FILE_EXTENSIONS),
      },
    },
  },
  computed: {
    description() {
      return this.isBatchEditing
        ? this.$t('community.users.edit.batch:description')
        : this.$t('community.users.batch:description')
    },
    title() {
      return this.isBatchEditing
        ? this.$t('community.users.edit.batch:title')
        : this.$t('community.users.batch:title')
    },
    confirmBtnText() {
      return this.isBatchEditing
        ? this.$t('community.users.edit.batch:submit.button')
        : this.$t('community.users.batch:submit.button')
    },
    sampleBtnText() {
      return this.isBatchEditing
        ? this.$t('community.users.edit.batch:template.button')
        : this.$t('community.users.batch:template.button')
    },
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptSendUserBatch',
      'attemptDownloadBatchRegisterTemplate',
    ]),
    backToUsers() {
      this.$router.push({ name: 'community.users.batch.list', query: this.$route.query })
    },
    sendSpreadsheet() {
      this.$v.formBatchData.file.$touch()
      if (!this.$v.formBatchData.file.$invalid) {
        this.setFetching(true)
        this.attemptSendUserBatch({
          file: this.formBatchData.file[0],
          isBatchEditing: this.isBatchEditing,
        })
          .then(({ data }) => {
            this.$router.push({
              name: 'community.users.batch.status',
              params: { id: data.id },
              query: this.$route.query,
            })
            this.formBatchData = {
              file: null,
            }
            this.$v.formBatchData.$reset()
          })
          .catch(({ response }) => {
            if (response.data.message === 'invalid_mime_type') {
              this.setFeedback({ message: this.$t('community.users:sent.batches.invalid.format') })
            }
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    downloadBatchRegisterTemplate() {
      this.setFetching(true)
      this.attemptDownloadBatchRegisterTemplate(this.isBatchEditing)
        .then(() => {
          this.setFetching(false)
        })
        .catch(() => {
          this.setFetching(false)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>
<template>
  <ModalSendSheet
    :back-btn="$t('community:back.to.list.batch')"
    :description="description"
    :sampleBtnText="sampleBtnText"
    :showBatch="true"
    :subTitle="$t('global:menu.community')"
    :title="title"
    :confirmBtnText="confirmBtnText"
    :formBatchData="formBatchData"
    :validation="$v"
    :isBatchEditing="isBatchEditing"
    topics="user"
    @backButton="backToUsers"
    @downloadTemplate="downloadBatchRegisterTemplate"
    @uploadSheet="sendSpreadsheet"
  >
  </ModalSendSheet>
</template>
