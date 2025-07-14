<script>
import { required } from 'vuelidate/lib/validators'
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import { format, endOfDay, parseISO } from 'date-fns'
import Action from '../../Action'

const Modal = () => import('../../Modal')
const RadioColors = () => import('@/components/shared/RadioColors')
const InputField = () => import('../../InputField')
const TextEditor = () => import('../../TextEditor')
const Datepicker = () => import('../../Datepicker')
const Checkbox = () => import('../../Checkbox')

export default defineComponent({
  name: 'CalendarEventModal',
  components: {
    Action,
    Modal,
    RadioColors,
    InputField,
    TextEditor,
    Datepicker,
    Checkbox,
  },
  props: {
    params: {
      type: Object,
      default: () => ({}),
    },
    sessionUuid: {
      type: String,
      required: true,
    },
    fullPermission: {
      type: Boolean,
    },
  },
  validations: {
    formData: {
      title: {
        required,
      },
      description: {
        required,
      },
      start_time: {
        required,
      },
      end_time: {
        required,
      },
      color: {
        required,
      },
    },
  },
  data() {
    return {
      formData: {
        title: null,
        description: null,
        start_time: null,
        end_time: null,
        allUsers: false,
        enableGuests: false,
        guests: [],
        color: null,
        is_holiday: false,
      },
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account']),
  },
  created() {
    if (this.params.eventId) {
      this.loadEventUpdate(this.params.eventId)
      return
    }
    this.formData.start_time = this.params.date
      ? format(new Date(this.params.date), 'yyyy-MM-dd HH:mm')
      : null
    this.formData.end_time =
      this.params.allDay && this.params.date
        ? format(new Date(endOfDay(this.params.date)), 'yyyy-MM-dd HH:mm')
        : null
    this.formData.allUsers = this.fullPermission
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptClassroomCalendarEventCreation',
      'attemptClassroomCalendarEventRetrieval',
      'attemptClassroomCalendarEventUpdate',
    ]),
    close() {
      this.$emit('close')
    },
    enableGuests(value) {
      this.formData.enableGuests = !value
    },
    loadEventUpdate(eventId) {
      let params = {
        sessionUuid: this.sessionUuid,
        eventId: eventId,
        isStudent: this.equalsProfile('student'),
      }
      this.setFetching(true)
      this.attemptClassroomCalendarEventRetrieval(params)
        .then((event) => {
          if (event.data) {
            this.formData = {
              id: event.data.id,
              title: event.data.title,
              description: event.data.description,
              start_time: event.data.period.initial,
              end_time: event.data.period.final,
              allUsers: event.data.allUsers,
              enableGuests: !event.data.allUsers,
              guests: [],
              color: event.data.color,
              is_holiday: false,
            }
          }
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.panel.calendar:modal.feedback.load.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    addNewEvent() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.formData.id ? this.updateEvent() : this.createEvent()
      }
    },
    updateEvent() {
      this.formData.start_time = format(parseISO(this.formData.start_time), 'yyyy-MM-dd HH:mm')
      this.formData.end_time = format(parseISO(this.formData.end_time), 'yyyy-MM-dd HH:mm')

      const sessionUuid = this.sessionUuid
      const data = this.formData

      this.attemptClassroomCalendarEventUpdate({ sessionUuid, data })
        .then(() => {
          this.$emit('events-update')
          this.close()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    createEvent() {
      const sessionUuid = this.sessionUuid
      const data = this.formData
      this.attemptClassroomCalendarEventCreation({ sessionUuid, data })
        .then(() => {
          this.$emit('events-update')
          this.close()
          this.setFetching(false)
          this.setFeedback({
            message: this.$t('classroom.panel.calendar:modal.feedback.create.success'),
          })
        })
        .catch(() => {
          this.setFetching(false)
          this.setFeedback({
            message: this.$t('classroom.panel.calendar:modal.feedback.create.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <modal
    :active="true"
    @close="close()"
  >
    <div class="modal-form modal-form-event">
      <span class="modal-subtitle">
        {{
          formData.id
            ? $t('classroom.panel.calendar:modal.edit.subtitle')
            : $t('classroom.panel.calendar:modal.subtitle')
        }}</span
      >
      <h2 class="modal-title is-capitalize">{{ Classroom.data.course.name }}</h2>
      <div class="modal-description">
        <p>
          {{
            Account.user.currentProfile !== 'student'
              ? $t('classroom.panel.calendar:modal.description:admin')
              : $t('classroom.panel.calendar:modal.description:student')
          }}
        </p>
      </div>
      <form @submit.prevent="addNewEvent">
        <InputField
          v-model="formData.title"
          :label="$t('global:form.title')"
          :validation="$v.formData.title"
          dark
          :counter="100"
        />
        <TextEditor
          v-model="formData.description"
          :label="$t('global:form.description')"
          :validation="$v.formData.description"
          :rows="1"
        />
        <div
          class="form-group clearfix theme-dark"
          data-cols="2"
          data-gap="40"
        >
          <Datepicker
            v-model="formData.start_time"
            :label="$t('global:form.start')"
            :validation="$v.formData.start_time"
            dark
            time
          />
          <Datepicker
            v-model="formData.end_time"
            :label="$t('global:form.end')"
            :validation="$v.formData.end_time"
            dark
            time
            :min="formData.start_time"
          />
        </div>
        <Checkbox
          v-if="Account.user.currentProfile !== 'student'"
          v-model="formData.allUsers"
          :items="[{ value: true, label: $t('global:form.all') }]"
          switch-type
          dark
          @input="enableGuests"
        />
        <RadioColors
          :value="formData"
          :validation="$v.formData"
          dark
        />
        <div class="text-center">
          <Action
            type="button"
            :text="formData.id > 0 ? $t('global:save') : $t('global:create')"
            secondary
            large
            fixed-width
            submit
          />
        </div>
      </form>
    </div>
  </modal>
</template>
