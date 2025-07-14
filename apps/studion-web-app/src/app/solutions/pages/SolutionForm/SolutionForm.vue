<script>
import { mapActions, mapState } from 'vuex'
import {
  required,
  requiredIf,
  numeric,
  minLength,
  maxLength,
  maxValue,
  minValue,
} from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'
import { genericModalConfirmMixin } from '@/mixins/genericModalConfirmMixin'
import slugValidator from '@/support/customValidators/slugValidator'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import AutocompleteCategories from '@/components/shared/AutocompleteCategories'
import BranchSelector from '@/components/shared/BranchSelector'
import BranchSelectorOptions from '@/components/shared/BranchSelectorOptions'
import ContentHeader from '@/components/general/ContentHeader'
import Checkbox from '@/components/general/Checkbox'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import Pagination from '@/components/general/Pagination'
import Radio from '@/components/general/Radio'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'
import Tips from '@/components/general/Tips'
import Upload from '@/components/general/Upload'
import WorkloadLimitTooltip from '../../components/WorkloadLimitTooltip'
import TextEditor from '@/components/general/TextEditor'

import pageMixin from '../../mixins/pageMixin'

const Modal = () => import('@/components/general/Modal')
const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'SolutionForm',
  components: {
    Action,
    ActionBar,
    AutocompleteCategories,
    BranchSelector,
    BranchSelectorOptions,
    Checkbox,
    ContentHeader,
    FormSection,
    InputField,
    Modal,
    ModalConfirm,
    Pagination,
    Radio,
    SelectField,
    TextareaField,
    Upload,
    TextEditor,
    Tips,
    WorkloadLimitTooltip,
  },
  mixins: [formScrollValidationMixin, genericModalConfirmMixin, pageMixin],
  data() {
    return {
      modalityList: [],
      finalStatus: {},
      durationTypeList: [
        {
          text: this.$t('global:weeks'),
          value: 'w',
        },
        {
          text: this.$t('global:days'),
          value: 'd',
        },
        {
          text: this.$t('global:hours'),
          value: 'h',
        },
      ],
      certificateList: [],
      workloadTypeList: [
        {
          text: this.$t('global:hours'),
          value: 'h',
        },
        {
          text: this.$t('global:minutes'),
          value: 'i',
        },
      ],
      certificateOptions: [
        {
          label: this.$t('solutions.create:form.certificate.option.1'),
          value: 2,
        },
        {
          label: this.$t('solutions.create:form.certificate.option.2'),
          value: 1,
        },
        {
          label: this.$t('solutions.create:form.certificate.option.3'),
          value: 0,
        },
      ],
      isValidCertificateTypeChange: true,
      oldFormData: {},
      formData: {
        active: false,
        type: null,
        name: null,
        description: null,
        technical_requirements: null,
        branches: [],
        categories: [],
        slug: '',
        workload: {
          hours: 0,
          minutes: 0,
          number: null,
          type: 'h',
        },
        duration: {
          hours: 0,
          minutes: 0,
          number: null,
          type: null,
        },
        certificates: {
          type: null,
          model: null,
        },
        finalStatus: null,
        image: null,
        workloadLimit: false,
        audience: null,
        programContent: null,
        canReadWhenUp: false,
      },
      backUrl: { name: 'solutions.index' },
      modalConfirm: false,
      modalLeave: false,
      openedBranches: [],
      modalConfirmContext: 'solutions.create',
      savedBranches: [],
    }
  },
  validations: {
    formData: {
      type: {
        required,
      },
      name: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(120),
      },
      description: {
        required,
        minLength: minLength(3),
      },
      technical_requirements: {
        required,
        minLength: minLength(3),
      },
      branches: {
        required: requiredIf(function () {
          return this.$isEnabledFeature('branching')
        }),
      },
      workload: {
        hours: {
          required,
          numeric,
          minValueResumed: function () {
            if (this.formData.workload.minutes === 0) {
              return minValue(1)(this.formData.workload.hours)
            }
            return minValue(0)
          },
        },
        minutes: {
          required: requiredIf(function () {
            return this.formData.workload.hours !== 0 || !this.formData.workload.minutes
          }),
          minValueResumed: function () {
            if (this.formData.workload.hours === 0) {
              return minValue(1)(this.formData.workload.minutes)
            }
            return minValue(0)
          },
          numeric,
          maxValue: maxValue(59),
        },
        type: {
          required,
        },
      },

      slug: {
        slugValidation: slugValidator,
      },

      duration: {
        number: {
          required: requiredIf(function () {
            return this.formData.duration.type !== 'h'
          }),
          numeric,
          minValueResumed: function () {
            if (this.formData.duration.type === 'h') return true
            return minValue(1)(this.formData.duration.number)
          },
        },
        type: {
          required,
        },
        hours: {
          required: requiredIf(function () {
            return this.formData.duration.type === 'h'
          }),
          minValueResumed: function () {
            if (this.formData.duration.type !== 'h') return true
            return minValue(1)(this.formData.duration.hours)
          },
        },
        minutes: {
          required: requiredIf(function () {
            return this.formData.duration.type === 'h'
          }),
          minValueResumed: function () {
            if (this.formData.duration.type !== 'h') return true
            if (this.formData.duration.minutes === 0) {
              return minValue(1)(this.formData.duration.hours)
            }
            return minValue(0)
          },
          maxValue: maxValue(59),
        },
      },
      certificates: {
        type: {
          required,
          isValidCertificateTypeChange() {
            return this.isValidCertificateTypeChange
          },
        },
        model: {
          required: requiredIf(function () {
            return this.formData.certificates.type > 0
          }),
        },
      },
      finalStatus: {
        required,
      },
      image: {
        required,
      },
    },
  },
  computed: {
    ...mapState(['accessibility', 'Courses', 'isSavingBlocked']),
    isEditing() {
      return this.$route.params.id || false
    },
    isActive() {
      return !!this.formData.active
    },

    nextRouteName() {
      return this.pageCount && this.pageCount === 5
        ? 'solutions.metadata.register'
        : 'solutions.create.tools'
    },

    finalStatusList() {
      const hasModalitySelected = this.formData.type !== null
      const items =
        hasModalitySelected &&
        this.finalStatus &&
        Object.keys(this.finalStatus).length &&
        this.finalStatus[this.formData.type]
      return items || []
    },

    getTypeAliasByValue() {
      const modality = this.modalityList.find((modality) => modality.value === this.formData.type)
      return modality ? modality.alias : 'tip'
    },
  },
  watch: {
    'formData.certificates.type': {
      deep: true,
      handler(newVal, oldVal) {
        if (this.isEditing && this.isActive) {
          this.showGenericConfirmModal(newVal, oldVal, 'formData.certificates.type')
        }
      },
    },
    'formData.certificates.model': {
      deep: true,
      handler(newVal, oldVal) {
        if (this.isEditing && this.isActive) {
          this.showGenericConfirmModal(newVal, oldVal, 'formData.certificates.model')
        }
      },
    },
    'formData.finalStatus': {
      deep: true,
      handler(newVal, oldVal) {
        if (this.isEditing && this.isActive) {
          this.showGenericConfirmModal(newVal, oldVal, 'formData.finalStatus')
        }
      },
    },
    'formData.type': {
      immediate: true,
      handler(newVal) {
        if (this.formData.finalStatus === null) return

        const statusList = this.finalStatus[newVal]
        const hasStatusListed =
          statusList && statusList.find((status) => status.value === this.formData.finalStatus)

        if (!hasStatusListed) {
          this.formData.finalStatus = null
        }
      },
    },
  },
  mounted() {
    this.$emit('change-theme-footer', { dark: false })
    this.$emit('fixed-header', true)
  },
  created() {
    const courseId = this.$route.params.id || null
    this.setFetching(true)

    Promise.all([
      this.attemptTypesRetrieval(),
      this.attemptCertificateListRetrieval({
        filter: { style: 'solution' },
        limit: 1000,
      }),
    ])
      .then(([types, certificates]) => {
        this.certificateList = certificates.data.data.map(({ id, description }) => {
          let descriptionText =
            description === 'default'
              ? this.$t('settings.certificate.list:default.model')
              : description
          return { text: descriptionText, value: id }
        })
        this.modalityList = types.data.map(({ alias, id }) => ({
          value: id,
          text: this.$t(`solutions.type:${alias}`),
          alias,
        }))

        this.finalStatus = types.data.reduce((accumulator, actual) => {
          accumulator[actual.id] = actual.status
            .filter(({ type }) => type.alias === 'final')
            .map(({ alias, id }) => ({
              text: this.$t(`global:solution.status.${alias}`),
              value: id,
            }))
          return accumulator
        }, {})

        if (courseId) {
          this.setFetching(true)
          this.attemptCourseRetrieval({ courseId, params: { embed: 'bidding_meta' } })
            .then(({ data }) => {
              const meta = data._embedded.meta || {}

              this.formData.name = data.name
              this.formData.description = data.description
              this.formData.technical_requirements = data.technical_requirements
              this.formData.type = data.type.id
              const workload = this.parseMinutesToHoursMinutes(
                data.workload.type === 'h' ? Number(data.workload.value) * 60 : data.workload.value
              )
              this.formData.workload = {
                type: 'h',
                number: data.workload.value,
                hours: Number(workload.split(':')[0] || 0),
                minutes: Number(workload.split(':')[1] || 0),
              }
              const duration = this.parseMinutesToHoursMinutes(
                data.duration.type === 'h' ? Number(data.duration.value) * 60 : data.duration.value
              )
              this.formData.duration = {
                type: data.duration.type === 'i' ? 'h' : data.duration.type,
                number: data.duration.value,
                hours: Number(duration.split(':')[0] || 0),
                minutes: Number(duration.split(':')[1] || 0),
              }
              this.formData.certificates = data.certificate
                ? {
                    type: data.certificate_type,
                    model: data.certificate.id,
                  }
                : {
                    type: data.certificate_type,
                    model: null,
                  }
              this.formData.finalStatus = data.finalStatus.id
              this.formData.image = data.image || null
              this.formData.active = data.active ? 1 : 0
              this.formData.categories = data.categories
              this.formData.canReadWhenUp = data.canReadWhenUp || false
              this.formData.workloadLimit = data.workloadLimit

              if (this.$isEnabledFeature('slug_identity')) {
                this.formData.slug = data.slug
              }

              if (this.$isEnabledFeature('branching')) {
                this.savedBranches = data.branches
              }
              this.formData.programContent = meta.program_content || ''
              this.formData.audience = meta.audience || ''

              this.oldFormData = this.deepClone(this.formData)

              if (this.$isEnabledFeature('course_metas')) {
                this.attemptGetCourseMetadata(courseId).then(({ data }) => {
                  if (data.length > 0) {
                    data.forEach((customField) => {
                      if (customField.required && !customField.value) {
                        this.setIsSavingBlocked(true)
                      }
                    })
                  }
                })
              }

              this.$nextTick(() => {
                if (
                  this.$isEnabledFeature('branching') &&
                  this.formData.branch &&
                  this.formData.branch.length === 0
                ) {
                  this.$v.formData.branch.$touch()
                }
              })
            })
            .finally(() => {
              this.setFetching(false)
              this.$v.$touch()
            })
        } else {
          this.setFetching(false)
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
  destroyed() {
    this.$emit('fixed-header', false)
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'setIsSavingBlocked',
      'attemptCourseRetrieval',
      'attemptTypesRetrieval',
      'attemptStatusListRetrieval',
      'attemptCertificateListRetrieval',
      'attemptCourseCreation',
      'attemptCourseUpdate',
      'attemptGetCourseMetadata',
    ]),
    parseFormData() {
      let workload =
        Number(this.formData.workload.hours) * 60 + Number(this.formData.workload.minutes)

      let duration = null

      if (this.formData.duration.type === 'h') {
        duration = `${
          Number(this.formData.duration.hours) * 60 + Number(this.formData.duration.minutes)
        }i`
      } else {
        duration = `${this.formData.duration.number}${this.formData.duration.type}`
      }
      const data = {
        type_id: this.formData.type,
        name: this.formData.name,
        description: this.formData.description,
        technical_requirements: this.formData.technical_requirements,
        workload_type: 'i',
        workload_value: workload,
        duration: duration,
        final_status_id: this.formData.finalStatus,
        certificate_id: this.formData.certificates.model,
        certificate_type: this.formData.certificates.type,
        image: this.formData.image,
        can_read_when_up: this.formData.canReadWhenUp,
        workloadLimit: this.formData.workloadLimit ? 1 : 0,
        active: this.formData.active,
        categories: this.formData.categories
          ? this.formData.categories.map((category) => category.id)
          : [],
        meta: {
          program_content: this.formData.programContent,
          audience: this.formData.audience,
        },
      }

      if (this.$isEnabledFeature('branching')) {
        data.branch_ids = [...this.formData.branches]
      }

      if (this.$isEnabledFeature('slug_identity')) {
        data.slug = this.formData.slug
      }

      return data
    },

    onDurationTypeChange() {
      this.formData.duration.number = null
      this.formData.duration.hours = 0
      this.formData.duration.minutes = 0
    },

    submitCreation(next) {
      let data = this.parseFormData()

      this.setFetching(true)
      this.attemptCourseCreation(data)
        .then(({ data }) => {
          if (next) {
            if (this.modalLeave) {
              this.$router.push(this.backUrl)
            } else {
              this.$router.push({ name: this.nextRouteName, params: { id: data.id } })
            }
          } else {
            this.$router.push({ name: 'solutions.update', params: { id: data.id } })
            this.setFeedback({ message: this.$t('solutions.create:feedback.saved') })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    submitUpdate(next, toPage = null) {
      let data = this.parseFormData()

      this.setFetching(true)
      this.attemptCourseUpdate({ courseId: this.$route.params.id, data: data })
        .then(({ data }) => {
          if (next) {
            if (toPage) {
              this.$_goToPage(toPage)
            } else if (this.modalLeave) {
              this.$router.push(this.backUrl)
              this.setFeedback({ message: this.$t('solutions.create:feedback.saved') })
            } else {
              this.$router.push({ name: this.nextRouteName, params: { id: data.id } })
            }
          } else {
            this.setFeedback({ message: this.$t('solutions.create:feedback.saved') })
          }
        })
        .catch(({ response }) => {
          const errorMessage = response.data && response.data.message
          const errorList = [
            'invalid_certificate_type_change',
            'can_not_edit_an_hybrid_course',
            'can_not_edit_to_hybrid_course',
          ]

          if (errorMessage === errorList[0]) {
            this.isValidCertificateTypeChange = false
            this.$v.formData.certificates.type.$touch()
          }

          this.setFeedback({
            message: this.$t(
              `solutions.update:feedback.error${
                errorList.includes(errorMessage) ? ':' + errorMessage : ''
              }`
            ),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    submit(next, toPage = null) {
      const courseId = Number(this.$route.params.id)

      if (this.$isEnabledFeature('course_metas') && this.isSavingBlocked && toPage > 2) {
        this.setFeedback({
          message: this.$t('solutions.list:update.metadata:error'),
          type: 'error',
        })
        this.$router.push({ name: 'solutions.metadata.register', params: { id: courseId } })

        return
      }

      if (!this.canWrite('courses')) {
        return this.canReadAction(next)
      }

      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.$route.params.id ? this.submitUpdate(next, toPage) : this.submitCreation(next)
      }

      this.$nextTick(() => this.scrollToInputError())
    },
    canReadAction(next) {
      if (next) {
        if (this.modalLeave) {
          this.$router.push(this.backUrl)
        } else {
          this.$router.push({ name: this.nextRouteName, params: { id: this.$route.params.id } })
        }
      }
    },
    openModalConfirm() {
      if (!this.canWrite('courses')) {
        return this.leave()
      }
      this.modalConfirm = true
    },
    closeModalConfirm() {
      this.modalConfirm = false
    },
    leave() {
      this.modalConfirm = false
      this.$nextTick(() => {
        this.$router.push(this.backUrl)
      })
    },
    save() {
      this.modalLeave = true
      this.modalConfirm = false
      this.submit(true)
    },
    changeCertificateType() {
      this.isValidCertificateTypeChange = true
      this.$v.formData.certificates.type.$touch()
    },
  },
}
</script>

<template>
  <div class="main-content solutions-create">
    <ContentHeader
      :title="isEditing ? formData.name : $t('solutions.create:header.title')"
      light-theme
      fixed
    >
      <Action
        slot="back"
        type="button"
        :text="$t('global:back.solutions')"
        class="btn-back text-color"
        icon="keyboard_backspace"
        @click="openModalConfirm()"
      />
      <ActionBar
        slot="actionbar"
        profile
      />
      <template slot="buttons">
        <Action
          v-if="notEqualsProfile('student') && canWrite('courses')"
          :text="$t('global:form.save')"
          type="button"
          flat
          :dark="accessibility"
          @click="submit(false)"
        />
      </template>
    </ContentHeader>
    <div class="mt-4">
      <div class="center">
        <div class="solutions-create-header text-color">
          <h2 class="solutions-create-title">{{ $t('global:form.step', { num: 1 }) }}</h2>
          <p class="solutions-create-description">
            {{ $t('solutions.create:header.description') }}
          </p>
        </div>
        <form
          class="flex flex-column gap-3 w-12 xl:w-4 mx-auto"
          @submit.prevent="submit"
        >
          <SelectField
            v-model="formData.type"
            :label="$t('global:form.modality')"
            :items="modalityList"
            :validation="$v.formData.type"
            :dark="accessibility"
            :disabled="!canWrite('courses')"
          >
            <template #right-float>
              <Tips shadow>
                <template #tip>
                  <h3 class="mb-1">
                    {{ $t(`solutions.type:${getTypeAliasByValue}`) }}
                  </h3>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <p v-html="$t(`solutions.type:${getTypeAliasByValue}.description`)"></p>
                </template>
              </Tips>
            </template>
          </SelectField>
          <InputField
            v-model="formData.name"
            :label="$t('global:form.title')"
            :validation="$v.formData.name"
            :counter="120"
            :dark="accessibility"
            :disabled="!canWrite('courses')"
          />
          <TextareaField
            v-model="formData.description"
            :label="$t('global:solution.description')"
            :validation="$v.formData.description"
            :dark="accessibility"
            :disabled="!canWrite('courses')"
          />
          <TextareaField
            v-if="$isEnabledFeature('bidding')"
            v-model="formData.audience"
            :label="$t('global:solution.audience')"
            auto-grow
            :counter="300"
            :dark="accessibility"
            :disabled="!canWrite('courses')"
          />
          <TextEditor
            v-if="$isEnabledFeature('bidding') || $isEnabledFeature('certificate_back')"
            v-model="formData.programContent"
            class="solution-form--text-editor"
            bubble
            :counter="2500"
            :max-rows="10"
            :rows="1"
            :label="$t('global:solution.program_content')"
            :dark="accessibility"
          />
          <AutocompleteCategories
            v-model="formData.categories"
            :floating-label="true"
            :label="$tc('global:category', 2)"
          />
          <InputField
            v-if="$isEnabledFeature('slug_identity')"
            v-model="formData.slug"
            :validation="$v.formData.slug"
            :label="$t('global:slug.identity')"
            :counter="100"
            :dark="accessibility"
            :disabled="!canWrite('courses')"
            @input="(val) => (formData.slug = formData.slug.toUpperCase())"
          />

          <BranchSelector
            :value="savedBranches"
            :validation="$v.formData.branches"
            class="mb-5"
            multiple
            @change="formData.branches = $event"
          >
            <BranchSelectorOptions
              v-model="formData"
              :data="formData.branches"
            />
          </BranchSelector>

          <TextareaField
            v-model="formData.technical_requirements"
            :label="$t('global:solution.requirements')"
            :validation="$v.formData.technical_requirements"
            auto-grow
            :counter="2500"
            :dark="accessibility"
            :disabled="!canWrite('courses')"
          />
          <FormSection :title="$t('global:solution.workload')">
            <div
              class="form-group clearfix"
              data-cols="2"
              data-gap="40"
            >
              <InputField
                v-model="formData.workload.hours"
                :data-testid="$testId('solution-form--workload-value')"
                :validation="$v.formData.workload.hours"
                :label="$t('global:hours')"
                :disabled="!canWrite('courses')"
                :dark="accessibility"
                :min="0"
                :max="9999"
                :maxlength="5"
                type="number"
              />
              <InputField
                v-model="formData.workload.minutes"
                :data-testid="$testId('solution-form--workload-value')"
                :validation="$v.formData.workload.minutes"
                :label="$t('global:minutes')"
                :disabled="!canWrite('courses')"
                :dark="accessibility"
                :min="0"
                :max="59"
                :maxlength="5"
                type="number"
              />
            </div>
          </FormSection>

          <FormSection :title="$t('global:solution.duration')">
            <div
              class="form-group clearfix"
              :data-cols="formData.duration.type === 'h' ? 4 : 2"
              data-gap="40"
            >
              <SelectField
                v-model="formData.duration.type"
                :data-testid="$testId('solution-form--duration-type')"
                :validation="$v.formData.duration.type"
                :label="$t('global:form.type')"
                :items="durationTypeList"
                :disabled="!canWrite('courses')"
                :dark="accessibility"
                @input="onDurationTypeChange"
              />
              <InputField
                v-if="formData.duration.type !== 'h'"
                v-model="formData.duration.number"
                :data-testid="$testId('solution-form--duration')"
                :label="$t('global:solution.duration')"
                :validation="$v.formData.duration.number"
                :disabled="!canWrite('courses')"
                :dark="accessibility"
                :min="0"
                :max="99999"
                :maxlength="5"
                type="number"
              />
              <div
                v-if="formData.duration.type === 'h'"
                class="solution-form--duration-hours"
              >
                <InputField
                  v-model="formData.duration.hours"
                  :data-testid="$testId('solution-form--duration-hours')"
                  :label="$t('global:hours')"
                  :validation="$v.formData.duration.hours"
                  :disabled="!canWrite('courses')"
                  :dark="accessibility"
                  :min="0"
                  :max="9999"
                  :maxlength="5"
                  type="number"
                />
                <InputField
                  v-model="formData.duration.minutes"
                  :data-testid="$testId('solution-form--duration-minutes')"
                  :label="$t('global:minutes')"
                  :validation="$v.formData.duration.minutes"
                  :disabled="!canWrite('courses')"
                  :dark="accessibility"
                  :min="0"
                  :max="59"
                  :maxlength="5"
                  type="number"
                />
              </div>
            </div>
          </FormSection>

          <FormSection :title="$t('solutions.create:form.final.status.title')">
            <p class="form-item-description-light">
              {{ $t('solutions.create:form.final.status.description') }}
            </p>
            <SelectField
              v-model="formData.finalStatus"
              :label="$t('solutions.create:form.final.status.label')"
              :items="finalStatusList"
              :validation="$v.formData.finalStatus"
              :dark="accessibility"
              :disabled="!canWrite('courses')"
            />
          </FormSection>
          <FormSection :title="$t('global:form.certificate')">
            <Radio
              v-model="formData.certificates.type"
              :items="certificateOptions"
              horizontal
              :validation="$v.formData.certificates.type"
              :dark="accessibility"
              :disabled="!canWrite('courses')"
              @input="changeCertificateType()"
            />
            <SelectField
              v-show="formData.certificates.type"
              v-model="formData.certificates.model"
              :label="$t('global:form.certificate.model')"
              :items="certificateList"
              :validation="$v.formData.certificates.model"
              :dark="accessibility"
              :disabled="!canWrite('courses')"
            />
          </FormSection>
          <FormSection
            v-if="$isEnabledFeature('workload_limit')"
            :title="$t('solutions.create:form.class.time.title')"
            class="class-time"
          >
            <p class="form-item-description-light mt-2">
              {{ $t('solutions.create:form.class.time.description') }}
            </p>
            <Checkbox
              v-model="formData.workloadLimit"
              :items="[
                {
                  label: $t('solutions.create:form.class.time.checkbox'),
                  value: true,
                },
              ]"
              switch-type
            />

            <WorkloadLimitTooltip />
          </FormSection>
          <Upload
            v-model="formData.image"
            :icon="'image-multiple'"
            :label="$t('global:upload.add.image')"
            :description="$t('global:upload.title')"
            cropper
            :width="300"
            :height="200"
            :validation="$v.formData.image"
            :dark="accessibility"
            :disabled="!canWrite('courses')"
          />
        </form>

        <Pagination
          v-if="pageCount"
          class="text-color"
          class-wrapper="mx-auto my-8"
          :active-first-last="false"
          :active-page="1"
          :page-count="pageCount"
          :show-all-pages="Boolean($route.params.id)"
          float
          block-layout
          disable-scroll
          disable-items-per-page
          custom-routing
          @next-page="submit(true)"
          @previous-page="submit(false)"
          @go-to-page="($e) => submit(true, $e)"
        />
      </div>
    </div>

    <Modal
      :active="modalConfirm"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('solutions.create:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('solutions.create:modal.confirm.message') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            v-if="isEditing && !isDeeplyEqual(formData, oldFormData)"
            type="button"
            :text="$t('global:save.leave')"
            flat
            :dark="accessibility"
            @click="save()"
          />
          <Action
            type="button"
            :text="$t('global:leave')"
            flat
            :dark="accessibility"
            @click="leave()"
          />
          <Action
            type="button"
            :text="$t('global:cancel')"
            flat
            :dark="accessibility"
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>

    <ModalConfirm
      :active="genericConfirmModalData.isActiveModal"
      :title="genericConfirmModalTitle"
      :cancel-btn-text="$t('global:not.now')"
      :confirm-btn-text="$t('global:yes')"
      @confirm="confirmDataChange"
      @close="cancelDataChange"
    >
      <slot name="description">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="genericConfirmModalDescription"></p>
      </slot>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import '~@/app/solutions/styles.scss';
</style>
