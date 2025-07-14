<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf, minValue, maxValue, minLength } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import AutocompleteCategories from '@/components/shared/AutocompleteCategories'
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
  name: 'IndividualSessionForm',

  components: {
    Action,
    AutocompleteCategories,
    Dropdown,
    DropdownLink,
    FormSection,
    InputField,
    Modal: () => import('@/components/general/Modal'),
    Radio,
    SendMessagesToAdmins,
    SessionConfigsList,
    SessionTeam,
    PeriodSelector,
  },

  mixins: [formScrollValidationMixin],

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formData: {
        name: '',
        local: null,
        vacancy_type: null,
        vacancy: null,
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
      modalPublishingError: false,
      publishingErrors: [],
    }
  },

  computed: {
    ...mapState(['offerings', 'accessibility']),

    offeringIsReady() {
      return this.offerings.current.published
    },

    hasCoursePresential() {
      return this.offerings.current
        ? this.offerings.current.meta.courses.filter((item) => item.type.id === 1).length > 0
        : false
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
      'attemptProfileListRetrieval',
      'attemptSaveOfferingMeta',
      'attemptOfferingPublishing',
      'setOfferingsData',
    ]),

    isLimited() {
      if (this.formData.vacancy_type === 'unlimited') {
        this.formData.vacancy = null
      }
      return this.formData.vacancy_type === 'limited'
    },

    submit() {
      this.$v.$touch()
      if (this.$v.formData.team.$invalid) {
        this.$refs.sessionTeam.$v.$touch()
      }

      this.$nextTick(() => this.scrollToInputError())

      if (!this.$v.$invalid) {
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
      this.formData.vacancy_type = null
      this.formData.vacancy = null
      this.formData.local = null
      this.formData.team = []
    },

    selectOther() {
      this.$emit('reset-session')
    },

    closeModalPublishingError() {
      this.modalPublishingError = false
      this.publishingErrors = []
    },
  },
}
</script>

<template>
  <div class="session-form-container">
    <div
      v-if="!offeringIsReady && canWrite('offerings')"
      class="session-card"
    >
      <div class="session-card-options">
        <Dropdown
          icon="dots-vertical"
          right
        >
          <Dropdown-link
            :text="$t('offerings.sessions.edit:session.change')"
            @click="selectOther"
          />
        </Dropdown>
      </div>
      <h3 class="session-card-title">
        {{ $t('offerings.sessions.edit:session.individual.form.title') }}
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
              horizontal
              :items="vacancyTypes"
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
            :disabled="disabled"
            :dark="accessibility"
            secondary
            submit
          />
        </div>
      </form>
    </div>

    <SessionConfigsList
      session-type="individual"
      @remove="$emit('remove', $event)"
    />

    <Modal
      :active="modalPublishingError"
      :cancel="false"
      @close="closeModalPublishingError"
    >
      <div class="modal-confirm">
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('offerings.publishing:modal.confirm.error') }}</h3>
        </div>
        <div class="modal-confirm-description">
          <p class="text-color">{{ $t('offerings.publishing:modal.confirm.error.message') }}</p>
          <ul>
            <li
              v-for="(error, index) in publishingErrors"
              :key="index"
            >
              {{ $t(`offerings.publishing:modal.confirm.error.${error}`) }}
            </li>
          </ul>
        </div>
        <div class="modal-confirm-footer">
          <Action
            type="button"
            :text="$t('global:understood')"
            :dark="accessibility"
            flat
            @click="closeModalPublishingError()"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>
