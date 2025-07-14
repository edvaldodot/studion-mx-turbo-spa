<template>
  <div
    :class="{ dark, collapsed: value.isHidden }"
    class="form-mediation__configs"
  >
    <div
      class="clearfix flex flex-column gap-4"
      :class="{ 'form-group': value.isHidden && shouldNotShowFilter }"
      data-gap="40"
      data-cols="2"
    >
      <select-field
        v-model="value.transmissionType"
        :items="transmissionTypes"
        :label="$t('global:form.transmission.type')"
        :validation="validation.transmissionType"
        :hint="!value.isHidden ? $t('mediation.actions:hint.transmission') : ''"
        :dark="dark"
        :disabled="!canWrite('mediation_plan') || value.isHidden"
        @input="clearMessage()"
      />

      <responsible-picker
        v-if="value.transmissionType !== 'event'"
        v-show="!value.isHidden"
        :accessibility="dark"
        :value="value"
        :validation="validation"
      />

      <select-field
        v-if="shouldNotShowFilter"
        v-model="value.filterId"
        :items="filters"
        :label="$t('global:form.filter')"
        :validation="validation.filterId"
        :hint="!value.isHidden ? $t('mediation.actions:hint.filters') : ''"
        :title="getFilter(value.filterId, 'text')"
        :disabled="!canWrite('mediation_plan') || value.isHidden"
      >
        <template #right-float>
          <Tips v-if="value.filterId">
            <template #tip>
              <h3>{{ getFilter(value.filterId, 'text') }}</h3>
              <p>{{ getFilter(value.filterId, 'description') }}</p>
            </template>
          </Tips>
        </template>
      </select-field>
    </div>

    <Checkbox
      v-if="value.transmissionType === 'message'"
      v-model="value.meta.hidePeople"
      :items="[{ value: true, label: $t('classroom.messages.new:hide') }]"
      switch-type
    />

    <div
      v-show="!value.isHidden"
      class="mediation-schedule"
    >
      <h3 class="text-color mb-3">{{ $t('mediation.actions:schedule.title') }}</h3>
      <select-field
        v-model="value.referenceDate"
        class="mediation-schedule__reference"
        :items="dateReferences"
        :validation="validation.referenceDate"
        :dark="dark"
        :title="getReferenceLabel(value.referenceDate)"
        :disabled="!canWrite('mediation_plan')"
        :label="$t('mediation.actions:form.referenceDate.label')"
      />
      <div
        v-if="value.referenceDate"
        class="mediation-schedule__form flex flex-column"
      >
        <div class="flex align-items-center gap-2">
          <input-field
            v-model="value.daysSinceReferenceDate"
            class="mediation-schedule__days w-4"
            type="number"
            :items="transmissionTypes"
            :validation="validation.daysSinceReferenceDate"
            :min="0"
            :dark="dark"
            :disabled="!canWrite('mediation_plan')"
          />
          <span class="text-color text-base">{{ $t('mediation.actions:schedule.middle.1') }}</span>
        </div>
        <template v-if="value.referenceDate === 'session_start_date'">
          <div class="flex align-items-center gap-2">
            <select-field
              v-model="value.period"
              class="mediation-schedule__period w-4"
              :items="referencePeriod"
              :validation="validation.period"
              :disabled="!canWrite('mediation_plan')"
            />
            <span class="text-color text-base">{{
              $t('mediation.actions:schedule.end.session_start_date')
            }}</span>
          </div>
        </template>
        <span
          v-else-if="value.referenceDate === 'enrollment_first_access_date'"
          class="text-color"
        >
          {{ $t('mediation.actions:schedule.end.enrollment_first_access_date') }}
        </span>
        <span
          v-else
          class="text-color"
          >{{ $t('mediation.actions:schedule.end.enrollment_date') }}</span
        >
      </div>
      <p class="mediation-schedule__tips text-color">{{ $t('mediation.actions:schedule.tips') }}</p>
    </div>

    <component
      :is="switchComponent"
      :value="value"
      :validation="validation"
      :template-action="templateAction ? templateAction[0] : null"
      :class="{ '--hide-ai-undo': !messageHistory.length }"
      @prompt="executeAIAction($event)"
      @settings="$emit('settings', true)"
    >
      <template #action-template>
        <Autocomplete
          v-model="templateAction"
          :label="$t('mediation.actions:template')"
          :items="templateActionList"
          :dark="dark"
          :loading="templateActionLoading"
          option-property="titleTemplate"
          append-icon="search"
          class="mt-3"
          async
          @search="getTemplateAction($event)"
          @input.capture="setTemplateAction($event)"
        />
      </template>
    </component>

    <ModalDialog
      :active="modalSMS"
      @close="toggleSmsWarningModal(false)"
    >
      <template #title>
        {{ $t('mediation.actions:sms.warning.modal.title') }}
      </template>
      <template #description>
        <p v-html="$t('mediation.actions:sms.warning.modal.description')"></p>
      </template>
      <template #footer>
        <checkbox
          v-model="preventSMSWarning"
          :items="[
            { value: true, label: $t('mediation.actions:sms.warning.modal.dismiss.forever') },
          ]"
        />
      </template>
    </ModalDialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import {
  TRANSMISSION_TYPES,
  DATE_REFERENCES,
  REFERENCE_PERIOD,
  TOOLS_WITH_META,
} from '../../shared'
import { getActionInfo } from '@/domains/mediation/utils'

import FileField from '@/components/general/FileField'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import TextEditor from '@/components/general/TextEditor'
import Tips from '@/components/general/Tips'
import ModalDialog from '@/components/general/ModalDialog'
import Checkbox from '@/components/general/Checkbox'
import Autocomplete from '@/components/general/Autocomplete'

import {
  AnnouncementForm,
  EmailForm,
  ForumForm,
  SmsForm,
  CalendarForm,
  ChatroomForm,
  PollForm,
  MessageForm,
} from './tools'
import ResponsiblePicker from './components/ResponsiblePicker'

export default {
  name: 'MediationActionForm',

  components: {
    AnnouncementForm,
    EmailForm,
    ForumForm,
    SmsForm,
    CalendarForm,
    PollForm,
    ChatroomForm,
    MessageForm,
    Autocomplete,
    FileField,
    Icon,
    InputField,
    ResponsiblePicker,
    SelectField,
    TextEditor,
    Tips,
    ModalDialog,
    Checkbox,
  },

  props: {
    value: {
      type: Object,
      default: () => {},
    },
    validation: {
      type: Object,
      required: true,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    /**
     * Set DaysSinceReferenceDate on create and lock input if not null
     */
    refDate: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      transmissionTypes: TRANSMISSION_TYPES,
      dateReferences: DATE_REFERENCES,
      referencePeriod: REFERENCE_PERIOD,
      modalSMS: false,
      preventSMSWarning: null,
      templateActionLoading: false,
      templateAction: [],
      templateActionList: [],
      messageHistory: [],
      shouldResetField: false,
    }
  },

  computed: {
    ...mapState({
      filters: ({ Mediation }) => Mediation.filters,
      Meta: (state) => state.Mediation.current.mediationPlan.meta,
      CustomInstructions: (state) => state.Mediation.customInstructions,
    }),

    /**
     * Select component name based on select transmission type.
     * @return {string}
     */
    switchComponent() {
      const actionInfo = getActionInfo(this.value.transmissionType)
      const componentName = (actionInfo && actionInfo.component) || ''
      return componentName
    },

    /**
     * Handler to not show filter select.
     * @return {boolean}
     */
    shouldNotShowFilter() {
      const hasTransmissionType = this.value.transmissionType || ''
      return !TOOLS_WITH_META.includes(hasTransmissionType)
    },
  },

  watch: {
    'value.transmissionType': {
      immediate: true,
      handler(newValue) {
        this.shouldResetField && this.resetDateReferences()
        const isSms = newValue === 'sms'
        const isEmailOrSms = newValue === 'email' || isSms
        const hasOneDateOption = this.dateReferences.length === 1

        this.toggleSmsWarningModal(isSms && !this.preventSMSWarning)
        this.templateAction = null

        const referenceEnrollmentDate = {
          text: this.$t('mediation.actions:reference.enrollment_date'),
          value: 'enrollment_date',
        }

        const referenceFirstAccessDate = {
          text: this.$t('mediation.actions:reference.enrollment_first_access_date'),
          value: 'enrollment_first_access_date',
        }

        if (isEmailOrSms && hasOneDateOption) {
          this.dateReferences.push(referenceEnrollmentDate, referenceFirstAccessDate)
        }

        if (this.value.meta) {
          this.value.meta.transmissionType = newValue
        }

        this.$nextTick(() => {
          this.shouldResetField = true
        })
      },
    },

    'value.referenceDate': {
      immediate: true,
      handler(newValue) {
        if (!this.value.meta) return
        this.value.meta.referenceDate = newValue
      },
    },
  },

  created() {
    this.preventSMSWarning = !!this.getFromLocalStorage('pm-prevent-sms-warning')
    if (this.preventSMSWarning) {
      this.modalSMS = false
    }
    if (typeof this.refDate === 'string' || typeof this.refDate === 'number') {
      this.value.daysSinceReferenceDate = Math.abs(Number(this.refDate))
      this.value.period = Number(this.refDate) >= 0 ? 'after' : 'before'
    }
  },

  methods: {
    ...mapActions([
      'attemptAutocompleteTemplateActions',
      'attemptCallAI',
      'attemptCallAIWithContext',
      'attemptCallAIPrompt',
      'setFetching',
      'setFeedback',
    ]),

    resetDateReferences() {
      this.dateReferences = this.dateReferences.slice(0, 1)

      const isInvalidDate = ['enrollment_date', 'enrollment_first_access_date'].includes(
        this.value.referenceDate
      )

      if (isInvalidDate) {
        this.value.referenceDate = null
      }
    },

    clearMessage() {
      this.value.message = null
      this.$set(this.value, 'title', null)
    },
    getFilter(id, key) {
      const filter = this.filters.find((filter) => filter.value === id)
      if (filter) return filter[key]
    },
    getReferenceLabel(id) {
      const reference = this.dateReferences.find((reference) => reference.value === id)
      if (reference) return reference.text
    },
    toggleSmsWarningModal(show = false) {
      this.modalSMS = show
      if (!show && this.preventSMSWarning) {
        this.saveToLocalStorage('pm-prevent-sms-warning', true)
      }
    },

    setTemplateAction(value) {
      if (!value) return
      if (value[0].titleMessage) this.value.title = value[0].titleMessage
      this.value.message = value[0].message
    },

    getTemplateAction(value) {
      if (value.length) {
        this.templateActionLoading = true
        this.templateAction = null

        const payload = { title: value, type: this.value.transmissionType }

        this.attemptAutocompleteTemplateActions(payload)
          .then(({ data }) => {
            this.templateActionList = data
              ? data.map((template) => {
                  return {
                    value: template.id,
                    ...template,
                  }
                })
              : []
          })
          .catch(() => {
            this.autocompleteItems = []
          })
          .finally(() => {
            this.templateActionLoading = false
          })
      }

      return true
    },

    replaceTags(value) {
      const tags = this.Meta && this.Meta && this.Meta.customInstructions
      const canUseTags = this.Meta && this.Meta && this.Meta.isEnabledCustomInstructions
      if (!tags || !canUseTags) return value

      const tagRegex = /{{{([^{}]+)}}}/g

      const replacedPMTags = value.replace(tagRegex, (match) => {
        return tags[match] !== undefined ? tags[match] : match
      })

      return replacedPMTags.replace(tagRegex, (match) => {
        const tag = this.CustomInstructions.find((ci) => ci.tag === match)
        return tag ? tag.value : match
      })
    },

    /**
     * Returns the appropriate AI dispatch action based on the provided event.
     *
     * @param {Object} event - The event object.
     * @return {Function} The AI dispatch action.
     */
    getAiDispatchAction(event) {
      const { context, prompt } = event

      if (context) return this.attemptCallAIWithContext
      if (prompt) return this.attemptCallAIPrompt
      return this.attemptCallAI
    },

    executeAIAction(event) {
      if (event.operationCustomPromptType === 'Undo') return this.undoAIAction()

      if (!event.prompt && !this.value.message)
        return this.setFeedback({ message: this.$t('mediation.actions:ai.message.required') })

      this.messageHistory.push(this.value.message)

      const dispatchAction = this.getAiDispatchAction(event)
      const payload = { ...event }

      if (!event.prompt) {
        payload.text = this.value.message || ''
      } else {
        payload.prompt = this.replaceTags(payload.prompt.replace(/<[^>]*>/g, ''))
      }

      if (event.context) {
        payload.context = this.value.message
      } else {
        delete payload.context
      }

      this.setFetching(true)
      dispatchAction(payload)
        .then(({ data }) => {
          if (this.value.transmissionType === 'sms') {
            return (this.value.message = data.answer.substr(0, 140))
          }

          this.value.message = data.answer
        })
        .catch(({ response }) => {
          const error = response.data && response.data.message
          const hint = response.data && response.data.hint && response.data.hint.errors

          const errorList = [
            'ai_invalid_key_request',
            'ai_provider_not_allowed',
            'ai_insufficient_quota',
            'ai_model_not_found_or_no_access',
            'ai_invalid_request',
          ]

          if (errorList.includes(error)) {
            this.setFeedback({ message: this.$t('mediation.actions:ai.error') })
          }

          if (hint.text === 'string_expected_or_length_exceeded') {
            this.setFeedback({ message: this.$t(`mediation.actions:ai.${hint.text}`) })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    undoAIAction() {
      this.value.message = this.messageHistory.pop()
    },
  },
}
</script>

<style lang="scss">
@import './MediationActionForm.scss';
</style>
