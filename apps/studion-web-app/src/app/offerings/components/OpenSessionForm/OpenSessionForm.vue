<script>
import { mapActions, mapState } from 'vuex'
import { format } from 'date-fns'
import { required, requiredIf, minValue, maxValue, minLength } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import AutocompleteCategories from '@/components/shared/AutocompleteCategories'
import Datepicker from '@/components/general/Datepicker'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import Radio from '@/components/general/Radio'
import SendMessagesToAdmins from '../SendMessagesToAdmins/SendMessagesToAdmins'
import SessionConfigsList from '@/app/offerings/components/SessionConfigsList'
import SessionTeam from '@/app/offerings/components/SessionTeam'
import PeriodSelector from '../PeriodSelector'

import {
  hasPrimaryMember,
  responsibleDifferentProfile,
} from '@/support/customValidators/responsibleValidator'
import { PERIOD_VALIDATIONS, PERIOD_DATA } from '../../shared'

export default {
  name: 'OpenSessionForm',
  components: {
    Action,
    AutocompleteCategories,
    Datepicker,
    Dropdown,
    DropdownLink,
    FormSection,
    InputField,
    ModalSchedule: () => import('@/app/offerings/components/ModalSchedule'),
    Radio,
    SendMessagesToAdmins,
    SessionConfigsList,
    SessionTeam,
    PeriodSelector,
  },

  mixins: [formScrollValidationMixin],

  props: {
    reopenSession: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      modalScheduleActive: false,
      selectedScheduleSession: null,
      formData: {
        name: '',
        local: null,
        vacancy_type: '',
        vacancy: null,
        automatically_session_creation: false,
        start_date: null,
        team: [],
        categories: [],
        allowAllProfilesSendKb: true,
        ...PERIOD_DATA,
      },
      vacancyTypes: [
        {
          value: 'unlimited',
          label: this.$t('global:form.unlimited'),
        },
        {
          value: 'limited',
          label: this.$t('global:form.limited'),
        },
      ],
    }
  },

  computed: {
    ...mapState(['offerings', 'accessibility']),

    hasCoursePresential() {
      return (
        this.offerings &&
        this.offerings.current &&
        this.offerings.current.meta.courses.filter((item) => item.type.id === 1).length > 0
      )
    },

    today() {
      return format(new Date(), 'yyyy-MM-dd')
    },

    offeringIsReady() {
      return this.offerings.current.published
    },
  },

  watch: {
    'formData.vacancy_type': {
      handler(value) {
        if (value === 'unlimited') this.formData.vacancy = null
      },
    },
  },

  validations: {
    formData: {
      name: {
        required,
        minLength: minLength(3),
      },
      local: {
        required: requiredIf(function () {
          return this.hasCoursePresential
        }),
      },
      vacancy_type: {
        required,
      },
      vacancy: {
        required: requiredIf(function () {
          return this.formData.vacancy_type === 'limited'
        }),
        minValue: minValue(1),
        maxValue: maxValue(10000),
      },
      start_date: {
        required,
      },
      team: {
        required,
        hasPrimaryMember,
        responsibleDifferentProfile,
      },
      ...PERIOD_VALIDATIONS,
    },
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptSaveOfferingMeta',
      'attemptOfferingPublishing',
      'setOfferingsData',
    ]),

    isLimited() {
      return this.formData.vacancy_type === 'limited'
    },

    submit() {
      this.$v.$touch()
      if (this.$v.formData.team.$invalid) {
        this.$refs.sessionTeam.$v.$touch()
      }
      this.$nextTick(() => this.scrollToInputError())
      if (!this.$v.$invalid) {
        this.formData.start_date = `${this.formData.start_date} 00:00:00`

        const data = this.deepClone(this.formData)
        data.team.forEach((member) => {
          if (member.position) return
          member.position = null
        })

        this.$emit('submit', data)
        this.$nextTick(() => this.reset())
      }
    },

    reset() {
      this.$v.$reset()
      this.formData.name = null
      this.formData.vacancy_type = null
      this.formData.vacancy = null
      this.formData.local = null
      this.formData.team = []
      this.formData.automatically_session_creation = false
      this.formData.start_date = null
    },

    selectOther() {
      this.$emit('reset-session')
    },

    OpenModalSchedule(index) {
      this.selectedScheduleSession = this.offerings.current.meta.configs[index]
      this.selectedScheduleSession.index = index
      this.modalScheduleActive = true
    },

    CloseModalSchedule() {
      this.modalScheduleActive = false
    },
  },
}
</script>

<template>
  <div class="session-form-container">
    <div
      v-if="(!offeringIsReady && canWrite('offerings')) || reopenSession"
      class="session-card"
    >
      <div class="session-card-options">
        <Dropdown
          icon="dots-vertical"
          right
        >
          <DropdownLink
            :text="$t('offerings.sessions.edit:session.change')"
            :disabled="reopenSession"
            @click="selectOther"
          />
        </Dropdown>
      </div>
      <h3 class="session-card-title">
        {{ $t('offerings.sessions.edit:session.open.form.title') }}
      </h3>
      <form
        class="session-form"
        @submit.prevent="submit"
      >
        <InputField
          v-model="formData.name"
          type="text"
          :label="$t('global:form.classname')"
          :validation="$v.formData.name"
          :counter="100"
          :dark="accessibility"
        />
        <AutocompleteCategories
          v-model="formData.categories"
          :floating-label="true"
          :label="$tc('global:category', 2)"
        />
        <p class="text-color">{{ $t('offerings.sessions.edit:form.section.open.date.title') }}</p>
        <div
          class="form-group clearfix"
          data-cols="2"
        >
          <Datepicker
            v-model="formData.start_date"
            :label="$t('global:form.scheduling')"
            :validation="$v.formData.start_date"
            :min="today"
            :dark="accessibility"
          />
        </div>
        <FormSection
          v-if="hasCoursePresential"
          :title="$t('offerings.sessions.edit:form.section.local.title')"
        >
          <InputField
            v-model="formData.local"
            :label="$t('global:form.local')"
            :validation="$v.formData.local"
            :dark="accessibility"
          />
        </FormSection>

        <PeriodSelector
          v-model="formData"
          :validation="$v.formData"
        />

        <FormSection :title="$t('offerings.sessions.edit:form.section.vacancy.title')">
          <div
            class="flex flex-column form-group is-flexible clearfix"
            data-cols="2"
          >
            <Radio
              v-model="formData.vacancy_type"
              :items="vacancyTypes"
              :validation="$v.formData.vacancy_type"
              :dark="accessibility"
              horizontal
            />
            <InputField
              v-model="formData.vacancy"
              type="number"
              :disabled="!isLimited()"
              :label="$t('global:form.number.vacancies')"
              :min="0"
              :validation="$v.formData.vacancy"
              :dark="accessibility"
            />
          </div>
        </FormSection>

        <SessionTeam
          ref="sessionTeam"
          :team="formData.team"
          :team-validation="$v.formData.team"
        />

        <SendMessagesToAdmins v-model="formData" />

        <div class="text-center mt-2">
          <Action
            type="button"
            :text="$t('offerings.sessions.edit:form.submit')"
            :dark="accessibility"
            secondary
            submit
          />
        </div>
      </form>
    </div>

    <SessionConfigsList
      session-type="open"
      @openModal="OpenModalSchedule"
      @remove="$emit('remove', $event)"
    />

    <ModalSchedule
      :active="modalScheduleActive"
      :session-type-name="$t('offerings.sessions.edit:session.open.name')"
      :selected-session="selectedScheduleSession"
      @close="CloseModalSchedule"
    />
  </div>
</template>
