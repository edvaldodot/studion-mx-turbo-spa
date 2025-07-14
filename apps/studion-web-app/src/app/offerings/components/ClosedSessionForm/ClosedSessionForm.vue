<script>
import { mapActions, mapState } from 'vuex'
import { format } from 'date-fns'
import { required, requiredIf, minValue, maxValue, minLength } from 'vuelidate/lib/validators'
import { AUTO_GENERATE_OPTIONS } from '@/app/shared.js'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import AutocompleteCategories from '@/components/shared/AutocompleteCategories'
import Checkbox from '@/components/general/Checkbox'
import Datepicker from '@/components/general/Datepicker'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import HelperCloud from '@/components/general/HelperCloud'
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
  name: 'ClosedSessionForm',

  components: {
    Action,
    AutocompleteCategories,
    Checkbox,
    Datepicker,
    Dropdown,
    DropdownLink,
    FormSection,
    InputField,
    HelperCloud,
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
      autoGenerateOptions: AUTO_GENERATE_OPTIONS,
      formData: {
        name: '',
        local: null,
        vacancy_type: '',
        vacancy: null,
        auto_generate: false,
        auto_generate_type: null,
        automatically_session_creation: false,
        start_date: null,
        end_date: null,
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
      return this.offerings.current.meta.courses.filter((item) => item.type.id === 1).length > 0
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
      auto_generate_type: {
        required: requiredIf(function () {
          return this.formData.auto_generate
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
      end_date: {
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
        this.formData.end_date = `${this.formData.end_date} 23:59:59`

        if (!this.formData.auto_generate) this.formData.auto_generate_type = 'none'

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
      this.formData.auto_generate = false
      this.formData.auto_generate_type = null
      this.formData.local = null
      this.formData.team = []
      this.formData.automatically_session_creation = false
      this.formData.start_date = null
      this.formData.end_date = null
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
        {{ $t('offerings.sessions.edit:session.closed.form.title') }}
      </h3>
      <form
        class="session-form"
        @submit.prevent="submit"
      >
        <InputField
          v-model="formData.name"
          :label="$t('global:form.classname')"
          type="text"
          :validation="$v.formData.name"
          :counter="100"
          :dark="accessibility"
        />
        <AutocompleteCategories
          v-model="formData.categories"
          :floating-label="true"
          :label="$tc('global:category', 2)"
        />
        <p class="text-color">{{ $t('offerings.sessions.edit:form.section.closed.date.title') }}</p>
        <div
          class="form-group clearfix"
          data-cols="2"
          data-gap="40"
        >
          <Datepicker
            v-model="formData.start_date"
            :label="$t('global:form.start')"
            :validation="$v.formData.start_date"
            :min="today"
            :dark="accessibility"
          />
          <Datepicker
            v-model="formData.end_date"
            :label="$t('global:form.closure')"
            :min="formData.start_date"
            :validation="$v.formData.end_date"
            :disabled="formData.start_date == null"
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
            class="form-group is-flexible clearfix"
            data-cols="2"
          >
            <Radio
              v-model="formData.vacancy_type"
              :items="vacancyTypes"
              horizontal
              :validation="$v.formData.vacancy_type"
              :dark="accessibility"
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

        <FormSection
          v-if="$isEnabledFeature('auto_create_session') && formData.vacancy_type === 'limited'"
        >
          <div class="checkbox__helper">
            <Checkbox
              v-model="formData.auto_generate"
              :items="[
                {
                  value: true,
                  label: $t('community.sessions.add:modal.add.auto.create.label'),
                },
              ]"
              switch-type
            />

            <HelperCloud class="ml-1">
              <ul v-html="$t('community.sessions.add:modal.add.auto.create.helper')"></ul>
            </HelperCloud>
          </div>

          <Radio
            v-if="formData.auto_generate"
            v-model="formData.auto_generate_type"
            class="ml-5"
            :items="autoGenerateOptions"
            :validation="$v.formData.auto_generate_type"
          />
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
      session-type="closed"
      @remove="$emit('remove', $event)"
      @openModal="OpenModalSchedule"
    />

    <ModalSchedule
      :active="modalScheduleActive"
      :selected-session="selectedScheduleSession"
      :session-type-name="$t('offerings.sessions.edit:session.closed.name')"
      @close="CloseModalSchedule"
    />
  </div>
</template>
