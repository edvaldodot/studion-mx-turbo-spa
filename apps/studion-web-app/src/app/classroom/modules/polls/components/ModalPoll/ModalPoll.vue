<script>
import { mapActions, mapState } from 'vuex'
import { defineComponent } from 'vue'
import { required } from 'vuelidate/lib/validators'
import { format, isBefore, parseISO } from 'date-fns'

import Modal from '@/components/general/Modal'
import Datepicker from '@/components/general/Datepicker'
import TextareaField from '@/components/general/TextareaField'
import Radio from '@/components/general/Radio'
import Action from '@/components/general/Action'
import SessionsBind from '@/app/management/pages/ManagementSessions/components/SessionsBind'

export default defineComponent({
  name: 'ModalPoll',

  components: {
    Modal,
    TextareaField,
    Datepicker,
    Radio,
    Action,
    SessionsBind,
  },

  props: {
    poll: {
      type: Object,
      default: () => null,
    },
    isManagement: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formData: {
        id: null,
        poll_id: null,
        description: null,
        image: '',
        use_image: false,
        multiples_choices: false,
        allow_comments: false,
        scheduled: true,
        start_time: null,
        end_time: null,
        choices: [{ description: null }, { description: null }],
      },
      sessionsIds: [],
      sessionModalIsOpen: false,
    }
  },

  validations: {
    formData: {
      description: {
        required,
      },
      start_time: {
        required,
      },
      end_time: {
        required,
      },
      multiples_choices: {
        required,
      },
      choices: {
        required,
        $each: {
          description: {
            required,
          },
        },
      },
    },
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),

    modalTitle() {
      return !this.Classroom.data
        ? this.$t('classroom.poll:modal.title')
        : this.Classroom.data.course.title
    },

    today() {
      return format(new Date(), 'yyyy-MM-dd HH:mm')
    },

    minDate() {
      return this.formData.id && isBefore(parseISO(this.formData.start_time), parseISO(this.today))
        ? this.formData.start_time
        : this.today
    },

    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:poll')
    },
  },

  created() {
    if (this.poll && this.poll.id) {
      this.formData.id = this.poll.id
      this.formData.description = this.poll.description
      this.formData.start_time = this.poll.start_time
      this.formData.end_time = this.poll.end_time
      this.formData.multiples_choices = this.poll.multiples_choices
      this.formData.choices = this.poll.choices
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptPollQuestionCreation',
      'attemptPollQuestionCreationMultipleSessions',
      'attemptPollQuestionUpdate',
    ]),

    submit() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.modalAddPoll = false
        this.formData.id ? this.submitUpdate() : this.submitCreation()
      }
    },

    submitCreation() {
      if (!this.isManagement) {
        this.formData.poll_id = this.Classroom.data.poll.id
      }

      const start_time = format(parseISO(this.formData.start_time), 'yyyy-MM-dd HH:mm:ss')
      const end_time = format(parseISO(this.formData.end_time), 'yyyy-MM-dd HH:mm:ss')

      this.setFetching(true)

      const payload = { ...this.formData, start_time, end_time }
      if (this.isManagement) payload.sessionsIds = this.sessionsIds

      const request = this.isManagement
        ? this.attemptPollQuestionCreationMultipleSessions
        : this.attemptPollQuestionCreation

      request(payload)
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.poll:feedback.created.success') })
          this.closeModal()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.poll:feedback.created.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submitUpdate() {
      this.setFetching(true)

      const start_time = format(parseISO(this.formData.start_time), 'yyyy-MM-dd HH:mm:ss')
      const end_time = format(parseISO(this.formData.end_time), 'yyyy-MM-dd HH:mm:ss')

      this.attemptPollQuestionUpdate({
        questionId: this.formData.id,
        data: { ...this.formData, start_time, end_time },
      })
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.poll:feedback.updated.success') })
          this.closeModal()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.poll:feedback.updated.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    addAnswer() {
      this.formData.choices.push({
        description: null,
      })
    },
    removeAnswer(index) {
      this.formData.choices.splice(index, 1)
    },
    closeModal() {
      if (this.isManagement) {
        this.$emit('close')
        return
      }

      if (this.$route.params.management) {
        this.$router.push({ name: this.$route.params.management })
        return
      }

      this.$router.push({ name: 'classroom.poll.active' })
    },
  },
})
</script>

<template>
  <Modal
    :active="true"
    v-show="!sessionModalIsOpen"
    is-page
    @close="closeModal"
  >
    <div class="modal-form modal-poll__form">
      <span
        v-if="!isManagement"
        class="modal-subtitle"
      >
        {{ $t('classroom.poll:modal.subtitle') }}
      </span>

      <h2 class="modal-title text-color is-capitalize">{{ modalTitle }}</h2>

      <div class="modal-description text-color">
        <p class="text-color">{{ $t('classroom.poll:modal.description') }}</p>
      </div>

      <form @submit.prevent="submit">
        <TextareaField
          v-model="formData.description"
          :label="$t('global:form.question')"
          :validation="$v.formData.description"
          auto-grow
          :counter="400"
          dark
        />

        <div
          class="form-group theme-dark clearfix"
          data-gap="40"
          data-cols="2"
        >
          <p class="form-item-description text-color">{{ $t('global:form.section.period') }}</p>

          <Datepicker
            v-model="formData.start_time"
            :label="$t('global:form.start')"
            :validation="$v.formData.start_time"
            time
            dark
            :min="minDate"
          />

          <Datepicker
            v-model="formData.end_time"
            :label="$t('global:form.end')"
            :validation="$v.formData.end_time"
            :min="formData.id ? today : formData.start_time"
            :disabled="formData.start_time == null"
            time
            dark
          />
        </div>

        <p class="form-item-description mt-4 text-color">{{ $t('global:form.alternatives') }}</p>
        <Radio
          v-model="formData.multiples_choices"
          :items="[
            { value: 0, label: $t('global:form.single.choice') },
            { value: 1, label: $t('global:form.multiple.choice') },
          ]"
          :validation="$v.formData.multiples_choices"
          horizontal
        />

        <TextareaField
          v-for="(answer, index) in formData.choices"
          :key="index"
          v-model="formData.choices[index].description"
          :label="$t('global:form.alternative.number', { num: index + 1 })"
          :validation="$v.formData.choices.$each[index].description"
          :counter="250"
          auto-grow
          dark
        >
          <Action
            v-if="formData.choices.length > 2 && hasWriteAccess"
            slot="button"
            type="button"
            icon="close"
            @click="removeAnswer(index)"
          />
        </TextareaField>

        <div>
          <Action
            v-if="formData.choices.length < 20 && hasWriteAccess"
            type="button"
            :text="$t('global:form.alternative.add')"
            flat
            @click="addAnswer()"
          />
        </div>

        <div
          v-if="isManagement"
          class="modal-poll__sessions-bind form-full-w"
        >
          <SessionsBind
            v-model="sessionsIds"
            :name-bind-component="$t('global:form.poll.text')"
            filter-tool="poll"
            @modal-is-open="(e) => (sessionModalIsOpen = e)"
          />
        </div>

        <div
          v-if="hasWriteAccess"
          class="form-submit text-center"
        >
          <Action
            :text="formData.id ? $t('global:save') : $t('global:create')"
            type="button"
            secondary
            large
            submit
            fixed-width
          />
        </div>
      </form>
    </div>
  </Modal>
</template>

<style lang="scss">
.modal-form.modal-poll__form {
  form {
    max-width: 100%;

    > * {
      max-width: 520px;
      margin: auto;

      &.form-full-w {
        max-width: 100%;
      }
    }
  }
}

.modal-poll__sessions-bind {
  width: 100%;
  padding-bottom: 4em;
}
</style>
