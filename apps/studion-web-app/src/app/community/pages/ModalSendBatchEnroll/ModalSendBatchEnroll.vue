<script>
import {required} from 'vuelidate/lib/validators'
import filesizeValidator from '@/support/customValidators/filesizeValidator'
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'
import {mapState, mapActions} from 'vuex'

import ModalSendSheet from '@/app/community/pages/ModalSendSheet'

export default {
  name: 'ModalSendBatchEnroll',
  components: {
    ModalSendSheet
  },
  data () {
    return {
      formBatchData: {
        file: null
      }
    }
  },
  props: {
    isBatchEditing: {
      default: false
    }
  },
  validations: {
    formBatchData: {
      file: {
        required,
        filesize: filesizeValidator(5242880),
        mimeType: mimeTypeValidator(['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/excel', 'application/vnd.ms-excel', 'application/msexcel', 'xlsx', 'xls'])
      }
    }
  },
  computed: {
    ...mapState(['Sessions'])
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptUploadEnrollmentSheet',
      'attemptDownloadBatchEnrollmentTemplate'
    ]),
    backToSessionModal () {
      this.$router.push({name: 'community.sessions.enrollments', params: {id: this.$route.params.id}})
    },
    downloadBatchEnrollmentTemplate () {
      this.setFetching(true)
      this.attemptDownloadBatchEnrollmentTemplate().then(() => {
        this.setFetching(false)
      }).finally(() => {
        this.setFetching(false)
      })
    },
    openModalBatchProgress (item) {
      this.$router.push({name: 'community.sessions.batch.status', params: {id: this.$route.params.id, batch: item}})
    },
    addNewMedia () {
      this.$v.formBatchData.$touch()
      if (!this.$v.formBatchData.$invalid) {
        this.setFetching(true)
        this.attemptUploadEnrollmentSheet({sessionId: this.Sessions.current.id, file: this.formBatchData.file[0]})
          .then(({data}) => {
            let uploadSheetData = {
              id: data.id,
              status: 'processing',
              enrollFileName: data.meta.file_name,
              enrollBatchAmountSent: data.meta.amount,
              enrollBatchActualProgress: 0,
              state: {
                success: 0,
                error: 0
              }
            }
            this.openModalBatchProgress(uploadSheetData)
            this.formBatchData = {}
            this.$v.formBatchData.$reset()
          }).finally(() => {
            this.setFetching(false)
          })
      }
    }
  },
  created () {
    if (!this.$route.params.id) {
      this.$router.go(-1)
    }
  }
}
</script>
<template>
  <modal-send-sheet
    :confirmBtnText="$t('community.sessions.add:modal.student.save')"
    :description="$t('community.sessions:modal.batch.description')"
    :formBatchData="formBatchData"
    :sampleBtnText="$t('community.sessions:modal.download.sample')"
    :showBatch="true"
    :isBatchEditing="isBatchEditing"
    :subTitle="Sessions.current.name"
    :title="$t('community.sessions:modal.batch.title')"
    :validation="$v"
    topics="enroll"
    @backButton="backToSessionModal"
    @downloadTemplate="downloadBatchEnrollmentTemplate"
    @uploadSheet="addNewMedia"
  />
</template>
