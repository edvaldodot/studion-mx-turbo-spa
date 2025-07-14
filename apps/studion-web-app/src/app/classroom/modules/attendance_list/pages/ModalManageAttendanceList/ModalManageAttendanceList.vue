<script>
import { mapState, mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import ModalBody from '@/components/general/ModalBody'
import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import TextEditor from '@/components/general/TextEditor'
import SelectField from '@/components/general/SelectField'
import DateHourStartEndField from '@/components/general/DateHourStartEndField'

import AuditAttendanceAccordion from './components/AuditAttendanceAccordion'

import { modalityListFactory } from '../util'

export default {
  name: 'ModalManageAttendanceList',

  components: {
    Modal,
    ModalHeader,
    ModalBody,
    Action,
    InputField,
    TextEditor,
    SelectField,
    AuditAttendanceAccordion,
    DateHourStartEndField,
  },

  data() {
    return {
      attendanceAuditList: [],
      modalityList: [],
      formData: {
        i_attendance_list: null,
        title: '',
        description: '',
        attendance_list_time: null,
        modality: null,
      },
    }
  },

  validations: {
    formData: {
      title: { required },
      description: {},
      attendance_list_time: {
        date: { required },
      },
      modality: { required },
    },
  },

  computed: {
    ...mapState(['Classroom', 'Attendance']),

    isEditing() {
      return !!this.formData.i_attendance_list
    },

    sessionName() {
      return this.Classroom.data.name
    },

    modalSubTitle() {
      return this.isEditing
        ? this.$t('classroom.attendance.list.editing:manage.modal.title')
        : this.$t('classroom.attendance.list:manage.modal.title')
    },

    modalDescription() {
      return this.isEditing
        ? this.$t('classroom.attendance.list.editing:manage.modal.description')
        : this.$t('classroom.attendance.list:manage.modal.description')
    },
  },

  async created() {
    this.modalityList = [...modalityListFactory()]

    let provideData = null
    if (this.$route.params.attendance) {
      provideData = this.$route.params.attendance
    }

    if (provideData) {
      const {
        i_attendance_list,
        title,
        description,
        attendance_list_start_date,
        attendance_list_end_date,
        modality,
      } = provideData

      const attendanceListTime = {
        date: attendance_list_start_date,
        start: this.formatDate(attendance_list_start_date, 'shortTime'),
        end: this.formatDate(attendance_list_end_date, 'shortTime'),
      }

      this.$nextTick(() => {
        this.$set(this, 'formData', {
          ...this.formData,
          i_attendance_list,
          title,
          description,
          attendance_list_time: attendanceListTime,
          modality,
        })
      })

      this.setFetching(true)
      this.attemptAttendanceAuditList({ id: i_attendance_list })
        .then(({ data }) => {
          this.attendanceAuditList = [...data]
        })
        .finally(() => {
          this.setFetching(false)
        })
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptCreateAttendanceList',
      'attemptAttendanceAuditList',
      'attemptGetAttendanceLists',
      'attemptUpdateAttendanceList',
      'attemptTypesRetrieval',
    ]),

    create(payload) {
      return this.attemptCreateAttendanceList(payload)
    },

    update(payload) {
      return this.attemptUpdateAttendanceList(payload)
    },

    makePayload() {
      const payload = { attendance_id: this.Classroom.data.attendance.id, ...this.formData }

      const { attendance_list_time } = payload
      const { date, start, end } = attendance_list_time

      payload.attendance_list_start_date = `${date} ${start}`
      payload.attendance_list_end_date = `${date} ${end}`

      delete payload.attendance_list_time
      return payload
    },

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      const httpMethod = this.isEditing ? this.update : this.create
      this.setFetching(true)

      httpMethod(this.makePayload())
        .then(({ data }) => {
          this.$router.push({
            name: 'classroom.attendance.apply',
            params: { id: data.id, attendance: data },
          })

          this.$emit('refresh-attendance-list')
        })
        .catch(() => {
          const errorMessage = 'classroom.attendance:title.error'
          this.setFeedback({ message: this.$t(errorMessage), type: 'error' })
        })
    },
  },
}
</script>

<template>
  <Modal
    :data-testid="$testId('modal-manage-attendance-list')"
    :active="true"
    is-page
  >
    <ModalHeader
      :sub-title="modalSubTitle"
      :title="sessionName"
      :description="modalDescription"
    />

    <ModalBody>
      <form @submit.prevent="submit()">
        <InputField
          v-model="formData.title"
          :label="$t('global:form.title')"
          :counter="100"
          :validation="$v.formData.title"
          dark
        />

        <TextEditor
          v-model="formData.description"
          :label="$t('global:form.description')"
          :validation="$v.formData.description"
          :counter="500"
        />

        <DateHourStartEndField
          v-model="formData.attendance_list_time"
          :validations="{ date: $v.formData.attendance_list_time.date }"
        />

        <SelectField
          v-model="formData.modality"
          :label="$t('global:form.modality')"
          :items="modalityList"
          :validation="$v.formData.modality"
          :show-optional="false"
          dark
        />

        <div class="form-submit text-center">
          <Action
            :text="$t('global:next')"
            type="button"
            fixed-width
            secondary
            large
            submit
          />
        </div>
      </form>

      <div
        v-if="attendanceAuditList.length"
        class="audit-attendance-accordion"
      >
        <AuditAttendanceAccordion :audit-list="attendanceAuditList" />
      </div>
    </ModalBody>
  </Modal>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/attendance_list/styles.scss';
</style>
