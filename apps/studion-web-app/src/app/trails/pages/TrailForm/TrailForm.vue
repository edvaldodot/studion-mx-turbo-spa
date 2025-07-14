<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf, maxValue, minValue, numeric } from 'vuelidate/lib/validators'

import {
  hasPrimaryMember,
  responsibleDifferentProfile,
} from '@/support/customValidators/responsibleValidator'
import { SESSION_TEAM_OPTIONS } from '@/support/utils/constants'
import * as TYPES from '@/domains/trails/vuex/mutation-types'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'
import { dateIntervalToTypeAndNumber } from '@/support/utils/duration'

import { makeDurationTypeList, makeCheckboxClosedSessionList } from './util'

import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'
import Action from '@/components/general/Action'
import AutocompleteCategories from '@/components/shared/AutocompleteCategories'
import BranchSelector from '@/components/shared/BranchSelector'
import Checkbox from '@/components/general/Checkbox'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import TextareaField from '@/components/general/TextareaField'
import SelectField from '@/components/general/SelectField'
import Upload from '@/components/general/Upload'
import Pagination from '@/components/general/Pagination'
import Autocomplete from '@/components/general/Autocomplete'
import DatatableTeam from '@/components/shared/DatatableTeam'
import Datepicker from '@/components/general/Datepicker'

const Modal = () => import('@/components/general/Modal')
const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'TrailForm',

  components: {
    ContentHeader,
    ActionBar,
    Action,
    BranchSelector,
    AutocompleteCategories,
    Checkbox,
    FormSection,
    InputField,
    TextareaField,
    SelectField,
    Upload,
    Pagination,
    Modal,
    ModalConfirm,
    Autocomplete,
    DatatableTeam,
    Datepicker,
  },

  mixins: [formScrollValidationMixin],

  beforeRouteLeave(to, from, next) {
    this.leaveRouteName = to.name

    if (!this.canWriteTrails || this.allowLeave) {
      this.resetCurrent(to)
      next()
      return
    }

    if (this.isFormDirty) {
      this.openModalConfirm()
      return
    }

    next()
  },

  data() {
    return {
      finalStatusList: [],
      oldFormData: {},
      formData: {
        id: null,
        name: null,
        description: null,
        image: null,
        duration: {
          number: null,
          hours: 0,
          minutes: 0,
          type: 'h',
        },
        finalStatusId: null,
        closedSession: false,
        branches: [],
        allowAccessAfterDuration: true,
        team: [],
        categories: [],
        certificate: {
          enable: false,
          model: null,
        },
        workload: {
          hours: 0,
          minutes: 0,
          type: 'h',
        },
        reenrollmentAllowed: false,
        statusAllowedReenrollment: [],
        startTime: null,
        endTime: null,
      },
      openedBranches: [],
      member: {
        profile_id: null,
        profile_name: null,
        name: null,
        id: null,
        uuid: null,
        user: null,
        position: null,
      },
      backUrl: { name: 'trails.list' },
      modalConfirm: false,
      modalLeave: false,
      autocompleteItems: [],
      autocompleteLoading: false,
      profilesList: [],
      searchedProfiles: [],
      loadingProfiles: false,
      allowLeave: false,
      leaveModalTitle: this.$t('trails.create:modal.confirm.title'),
      leaveRouteName: 'trails.list',
      currentMemberToRemove: null,
      isOpenModalAddMember: false,
      isOpenModalRemoveMember: false,
      isOpenModalSaveBeforeNextStep: false,
      touchableSpecificsProperties: ['duration', 'categories', 'team', 'image'],
      certificateList: [],
      durationTypeList: [...makeDurationTypeList()],
      checkboxClosedSessionList: [...makeCheckboxClosedSessionList()],
      savedBranches: [],
    }
  },
  validations: {
    formData: {
      name: { required },
      description: {},
      image: {},
      duration: {
        number: {},
        type: {},
        hours: {},
        minutes: {},
      },
      closedSession: {},
      workload: {
        hours: {
          required,
          numeric,
          minValueResumed: function () {
            if (this.formData.workload.minutes === 0) {
              return minValue(1)(this.formData.workload.hours)
            }
            return minValue(0)(this.formData.workload.hours)
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
            return minValue(0)(this.formData.workload.minutes)
          },
          numeric,
          maxValue: maxValue(59),
        },
        type: {
          required,
        },
      },
      finalStatusId: {
        required,
      },
      statusAllowedReenrollment: {
        required: requiredIf(function () {
          return !!this.formData.reenrollmentAllowed
        }),
      },
      branches: {
        required: requiredIf(function () {
          return this.$isEnabledFeature('branching')
        }),
      },
      team: {
        required,
        hasPrimaryMember,
        responsibleDifferentProfile,
      },
      categories: {},
      certificate: {
        model: {
          required: requiredIf(function () {
            return this.$isEnabledFeature('certificate_paths') && this.formData.certificate.enable
          }),
        },
      },
    },
    member: {
      profile_id: {
        required,
      },
      user: {
        required,
      },
    },
  },
  computed: {
    ...mapState(['accessibility']),
    ...mapState({
      trail: (state) => state.Trails.current,
    }),
    hasPrimaryTeamMember() {
      return this.formData.team.find((member) => member.position === SESSION_TEAM_OPTIONS[0].value)
    },
    isEditing() {
      return this.$route.params.id || false
    },
    canWriteTrails() {
      return this.canWrite('trails') && this.notEqualsProfile('student')
    },
    isReadOnly() {
      return !this.canWriteTrails
    },
    closedSessionCanBeToggled() {
      return !(parseInt(this.formData.duration.hours) || parseInt(this.formData.duration.minutes) || parseInt(this.formData.duration.number))
    },
    isFormDirty() {
      return (
        this.$v.formData.name.$dirty ||
        this.$v.formData.description.$dirty ||
        this.$v.formData.image.$dirty ||
        this.$v.formData.branches.$dirty ||
        this.$v.formData.duration.number.$dirty ||
        this.$v.formData.duration.type.$dirty ||
        this.$v.formData.closedSession.$dirty ||
        this.$v.formData.finalStatusId.$dirty ||
        this.$v.formData.categories.$dirty ||
        this.$v.formData.team.$dirty
      )
    },
  },
  watch: {
    formData: {
      deep: true,
      handler() {
        if (this.isEditing) {
          this.touchableSpecificsProperties.forEach((property) => {
            this.$v.formData[property].$touch()
          })
        }
        this.formData.workload.hours = parseInt(this.formData.workload.hours)
        this.formData.workload.minutes = parseInt(this.formData.workload.minutes)
      },
    },
    'formData.branches': {
      handler() {
        this.member = {
          profile_id: null,
          profile_name: null,
          name: null,
          id: null,
          uuid: null,
          user: null,
          position: null,
        }
      },
    },
    isFormDirty() {
      this.allowLeave = false
    },
    closedSessionCanBeToggled() {
      if (this.closedSessionCanBeToggled) {
        this.formData.closedSession = false
      }
    }
  },
  created() {
    this.setup()
  },
  mounted() {
    this.$emit('fixed-header', true)
  },
  destroyed() {
    this.$emit('fixed-header', false)
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptTrailRetrieval',
      'setCurrent',
      'attemptTrailCreation',
      'attemptTrailUpdate',
      'attemptListUsersNonStudentByName',
      'attemptProfilesByUser',
      'attemptCertificateListRetrieval',
      'attemptGetTrailFinalStatusList',
    ]),
    onDurationTypeChange() {
      this.formData.duration.number = 0
      this.formData.duration.hours = 0
      this.formData.duration.minutes = 0
    },
    async setup() {
      const trailId = this.$route.params.id || null

      this.setFetching(true)
      this.attemptGetTrailFinalStatusList()
        .then(({ data }) => {
          this.finalStatusList = data
            .filter(({ alias }) => alias !== 'realizado')
            .map(({ name, id }) => ({ text: name, value: id }))
        })
        .finally(() => {
          this.setFetching(false)
        })

      if (trailId) {
        /**
         *
         */
        await this.setCurrent(trailId)

        this.oldFormData = Object.assign({}, this.oldFormData, this.formData)
        this.oldFormData.id = this.trail.id
        this.oldFormData.name = this.trail.name
        this.oldFormData.description = this.trail.description

        const workload =
          this.trail.workload && this.parseMinutesToHoursMinutes(
            this.trail.workload.type === 'h' ? Number(this.trail.workload.value) * 60 : this.trail.workload.value
          )
        this.oldFormData.workload = {
          type: 'h',
          number: this.trail.workload.value,
          hours: Number(workload.split(':')[0] || 0),
          minutes: Number(workload.split(':')[1] || 0),
        }

        const parsedDuration =
          this.trail.duration && dateIntervalToTypeAndNumber(this.trail.duration)

        this.oldFormData.duration = {
          type: (parsedDuration && parsedDuration.type) || null,
          number: parsedDuration && parsedDuration.number,
          hours: parsedDuration && parsedDuration.type === 'h' ? parsedDuration.hours || 0 : null,
          minutes: parsedDuration && parsedDuration.type === 'h' ? parsedDuration.minutes || 0 : null,
        }

        this.oldFormData.finalStatusId = this.trail.finalStatus && this.trail.finalStatus.id

        this.oldFormData.reenrollmentAllowed = this.trail.reenrollmentAllowed
        this.oldFormData.statusAllowedReenrollment =
          this.trail.statusAllowedReenrollment &&
          this.trail.statusAllowedReenrollment.map((item) => {
            return item.statusAlias
          })

        this.oldFormData.branches = this.trail.branches ? [...this.trail.branches] : []

        this.oldFormData.image = this.trail.image || null
        this.oldFormData.team = this.trail.pathsTeam
          ? this.trail.pathsTeam.map((item) => {
              return {
                id: item.id,
                name: item.applicationUser.userData.name,
                profile_name:
                  item.profile.alias === 'agent'
                    ? item.profile.name
                    : this.$t(`global:${item.profile.alias}`),
                profile_id: item.profile.id,
                user_id: item.applicationUser.id,
                uuid: item.applicationUser.uuid,
                position: item.position || SESSION_TEAM_OPTIONS[2].value,
              }
            })
          : []
        this.oldFormData.categories =
          this.trail._embedded && this.trail._embedded.categories
            ? [...this.trail._embedded.categories]
            : []
        this.oldFormData.certificate = {
          enable: !!(this.trail.certificate && this.trail.certificate.id),
          model: this.trail.certificate && this.trail.certificate.id,
        }
        if (this.$isEnabledFeature('branching')) {
          this.savedBranches = this.trail.branches
        }

        this.oldFormData.closedSession = this.trail.closedSession
        this.oldFormData.startTime = this.trail.startTime
        this.oldFormData.endTime = this.trail.endTime

        this.formData = Object.assign({}, this.formData, this.oldFormData)

        this.$nextTick(() => {
          this.$v.$reset()

          if (
            this.$isEnabledFeature('branching') &&
            this.formData.branches &&
            this.formData.branches.length === 0
          ) {
            this.$v.formData.branches.$touch()
          }
        })
      }

      if (this.$isEnabledFeature('certificate_paths')) {
        try {
          this.setFetching(true)
          const { data: response } = await this.attemptCertificateListRetrieval({
            filter: { style: 'path' },
            limit: 999,
          })
          this.certificateList = response.data.map(({ id, description }) => {
            let descriptionText =
              description === 'default'
                ? this.$t('settings.certificate.list:default.model')
                : description
            return { text: descriptionText, value: id }
          })
        } finally {
          this.setFetching(false)
        }
      }
    },
    submitCreation(next) {
      let team = this.formData.team
      let newFormData = this.formData

      if (newFormData.duration.hours === 0 && newFormData.duration.minutes === 0) {
        newFormData.duration.hours = null
        newFormData.duration.minutes = null
      }

      if (newFormData.duration.number === 0) {
        newFormData.duration.number = null
      }

      if (this.$isEnabledFeature('branching')) {
        newFormData.branch_ids = [...this.formData.branches]
      }
      this.setFetching(true)
      this.attemptTrailCreation(newFormData)
        .then(({ data }) => {
          this.$v.$reset()
          this.formData.id = data.id
          this.allowLeave = true

          if (next) {
            if (this.modalLeave) {
              this.$router.push(this.backUrl)
            } else {
              this.$router.push({ name: 'trails.create.solutions', params: { id: data.id } })
            }
          } else {
            this.formData.team = team
            this.$router.push({ name: 'trails.update', params: { id: data.id } })
            this.setFeedback({ message: this.$t('trails.create:feedback.saved') })
          }
        })
        .catch(({ response }) => {
          this.formData.team.forEach((member) => {
            if (member.position) return
            member.position = SESSION_TEAM_OPTIONS[2].value
          })
          let typeError = response.data.message ? ':' + response.data.message : ''
          this.setFeedback({ message: this.$t('trails.create:feedback.error' + typeError) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    goToTrailsSolution: function (id) {
      this.$router.push({ name: 'trails.create.solutions', params: { id: id } })
    },
    submitUpdate(next) {
      const team = this.formData.team
      this.formData.team = []

      this.formData.team = team
        .filter((item) => !item.dirty)
        .map((item) => {
          return {
            uuid: item.uuid,
            position: item.position,
            profile_id: item.profile_id,
          }
        })

      const newFormData = this.formData

      if (this.$isEnabledFeature('branching')) {
        newFormData.branch_ids = [...this.formData.branches]
      }

      this.setFetching(true)
      this.attemptTrailUpdate(newFormData)
        .then(({ data }) => {
          this.$v.$reset()

          if (next) {
            this.allowLeave = true
            if (this.modalLeave) {
              this.$router.push(this.backUrl)
            } else {
              this.goToTrailsSolution(data.id)
            }
          } else {
            this.formData.team = team
            this.$router.push({ name: 'trails.update', params: { id: data.id } })
            this.setFeedback({ message: this.$t('trails.create:feedback.saved') })
          }
        })
        .catch(({ response }) => {
          this.formData.team = team
          let typeError = response.data.message ? ':' + response.data.message : ''
          this.setFeedback({ message: this.$t('trails.create:feedback.error' + typeError) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submit(next) {
      this.$v.formData.$touch()
      if (this.formData.team.length < 1) this.$v.member.$touch()

      this.$nextTick(() => this.scrollToInputError())
      this.closeModalSaveBeforeNextStep()

      if (this.$v.formData.$invalid) return
      if (this.formData.team.length < 1 && this.$v.member.$invalid) return

      this.isEditing ? this.submitUpdate(next) : this.submitCreation(next)
    },
    save() {
      this.modalLeave = true
      this.modalConfirm = false
      this.submit(true)
    },
    openModalConfirm() {
      this.modalConfirm = true
    },
    closeModalConfirm() {
      this.modalConfirm = false
    },
    leave() {
      this.modalConfirm = false
      this.allowLeave = true

      if (this.leaveRouteName !== 'trails.list') {
        this.$router.push({ name: this.leaveRouteName })
        return
      }

      this.$router.push(this.backUrl)
    },
    getBranchesIds() {
      return this.formData.branches.length ? this.formData.branches : []
    },
    getUsersList(value) {
      if (value.length) {
        this.autocompleteLoading = true
        this.member.name = null
        this.member.id = null
        this.member.uuid = null
        this.member.user = null
        this.attemptListUsersNonStudentByName({
          userName: value,
          branchIds: this.getBranchesIds(),
        })
          .then(({ data }) => {
            this.autocompleteLoading = false
            this.autocompleteItems = data
              ? data
                  .map(({ name, applicationUserId, uuid }) => {
                    return {
                      name: name,
                      id: applicationUserId,
                      uuid: uuid,
                    }
                  })
                  .filter((mapItem) => {
                    let founded = this.formData.team.find((item) => {
                      return item.uuid === mapItem.uuid
                    })
                    return founded === undefined
                  })
              : []
          })
          .catch(() => {
            this.autocompleteLoading = false
            this.autocompleteItems = []
          })
      }
      return true
    },
    selectUser(data) {
      if (data && this.member.id === null) {
        this.member.name = data[0].name
        this.member.id = data[0].id
        this.member.uuid = data[0].uuid
        this.member.user = data[0]
        this.getProfiles()
      }
    },
    getProfiles() {
      this.loadingProfiles = true
      this.searchedProfiles = []
      this.profilesList = []
      this.attemptProfilesByUser(this.member.uuid).then(({ data }) => {
        this.profilesList = data.filter(({ alias }) => alias !== 'student')
        this.searchedProfiles = data
          .filter(({ alias }) => alias !== 'student')
          .map(({ name, id }) => ({ text: name, value: id }))
        this.loadingProfiles = false
      })
    },
    getProfileName(value) {
      let elem = this.profilesList.find((elem) => {
        return elem.id === value
      })
      this.member.profile_name =
        elem.alias === 'agent' ? elem.name : this.$t(`global:${elem.alias}`)
    },
    openConfirmAddMember() {
      if (!this.isEditing) {
        this.addMember()
        return
      }

      this.$v.member.$touch()
      if (this.$v.member.$invalid) return
      this.isOpenModalAddMember = true
    },
    closeConfirmAddMember() {
      this.isOpenModalAddMember = false
    },
    addMember() {
      this.closeConfirmAddMember()
      this.$v.member.$touch()
      this.$v.formData.team.$touch()
      if (!this.$v.member.$invalid) {
        let existentMember = this.formData.team.find(
          (item) => item.uuid === this.member.user[0].uuid
        )
        if (existentMember) {
          this.setFeedback({
            message: this.$t('trails.create:form.feedback.team.member.exists'),
            type: 'error',
          })
        } else {
          const tempMember = {
            name: this.member.user[0].name,
            profile_id: this.member.profile_id,
            profile_name: this.member.profile_name,
            user_id: this.member.user[0].id,
            uuid: this.member.user[0].uuid,
            position: SESSION_TEAM_OPTIONS[2].value,
          }
          if (!this.hasPrimaryTeamMember) {
            tempMember.position = SESSION_TEAM_OPTIONS[0].value
            this.formData.team.unshift({ ...tempMember })
          } else {
            this.formData.team.push({ ...tempMember })
          }
        }
        this.member.profile_id = null
        this.member.profile_name = null
        this.member.user = null
        this.$v.member.$reset()
      }
    },
    openConfirmRemoveMember(memberIndex) {
      this.currentMemberToRemove = memberIndex
      if (!this.isEditing) {
        this.removeMember()
        return
      }

      this.isOpenModalRemoveMember = true
    },
    closeConfirmRemoveMember() {
      this.isOpenModalRemoveMember = false
    },
    removeMember() {
      this.closeConfirmRemoveMember()
      this.formData.team.splice(this.currentMemberToRemove, 1)
    },
    resetCurrent(to) {
      if (to.name === 'trails.list') {
        this.$store.commit(TYPES.RESET_CURRENT, {})
      }
    },
    evaluateToGoNextStep() {
      if (!this.isEditing) return this.submit(true)

      if (this.isFormDirty) {
        this.isOpenModalSaveBeforeNextStep = true
        return
      }

      this.goToTrailsSolution(this.trail.id)
    },
    closeModalSaveBeforeNextStep() {
      this.isOpenModalSaveBeforeNextStep = false
    },
    onSwitchMember() {
      this.$v.member.$reset()
    },
    clearStartEndTime() {
      this.formData.startTime = null
      this.formData.endTime = null
    },
    clearEndTime(event) {
      if (!event) {
        this.formData.endTime = null
      }
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('trail-path-1')"
    class="main-content h-full trails-create"
  >
    <ContentHeader
      :title="isEditing ? formData.name : $t('trails.create:header.title')"
      light-theme
      fixed
    >
      <Action
        slot="back"
        :text="$t('global:back.trails')"
        icon="keyboard_backspace"
        class="btn-back text-color"
        type="button"
        @click="leave()"
      />

      <ActionBar
        slot="actionbar"
        profile
      />

      <template slot="buttons">
        <Action
          v-if="canWriteTrails"
          :text="$t('global:form.save')"
          :dark="accessibility"
          type="button"
          flat
          @click="submit(false)"
        />
      </template>
    </ContentHeader>

    <div class="mt-4">
      <div class="center">
        <div class="trails-create-header">
          <h2 class="trails-create-title">{{ $t('global:form.step', { num: 1 }) }}</h2>
          <p class="trails-create-description">{{ $t('trails.create:header.description') }}</p>
        </div>

        <form
          :data-testid="$testId('trail-path-1--trail-form')"
          class="form"
          @submit.prevent="submit(true)"
        >
          <InputField
            v-model.trim="formData.name"
            :data-testid="$testId('trail-form--title')"
            :label="$t('global:form.title')"
            :validation="$v.formData.name"
            :disabled="isReadOnly"
            :dark="accessibility"
            :counter="120"
          />

          <TextareaField
            v-model="formData.description"
            :data-testid="$testId('trail-form--description')"
            :label="$t('global:form.description')"
            :validation="$v.formData.description"
            :disabled="isReadOnly"
            :dark="accessibility"
            :counter="240"
            auto-grow
          />

          <FormSection :title="$tc('global:category', 2)">
            <p class="form-item-description-light">
              {{ $t('trails.create:form.categories.description') }}
            </p>
            <AutocompleteCategories
              v-model="formData.categories"
              :data-testid="$testId('trail-form--categories')"
              :validation="$v.formData.categories"
              :label="$tc('global:category', 2)"
              :disabled="!canWriteTrails"
              :floating-label="true"
              :dark="accessibility"
            />
          </FormSection>

          <div class="trail-form-time-content__wrapper">
            <FormSection :title="$t('global:solution.duration')">
              <p class="form-item-description-light">
                {{ $t('trails.create:form.duration.description') }}
              </p>
              <div
                class="form-group clearfix"
                :data-cols="formData.duration.type === 'h' ? 4 : 2"
                data-gap="40"
              >
                <SelectField
                  v-model="formData.duration.type"
                  :data-testid="$testId('trail-form--duration-type')"
                  :validation="$v.formData.duration.type"
                  :label="$t('global:form.type')"
                  :items="durationTypeList"
                  :disabled="isReadOnly"
                  :dark="accessibility"
                  @input="onDurationTypeChange"
                />
                <InputField
                  v-if="formData.duration.type !== 'h'"
                  v-model="formData.duration.number"
                  :data-testid="$testId('trail-form--duration')"
                  :label="$t('global:solution.duration')"
                  :validation="$v.formData.duration.number"
                  :disabled="isReadOnly"
                  :dark="accessibility"
                  :min="0"
                  :max="9999"
                  :maxlength="5"
                  type="number"
                />
                <div
                  v-if="formData.duration.type === 'h'"
                  class="trail-form--duration-hours"
                >
                  <InputField
                    v-model="formData.duration.hours"
                    :data-testid="$testId('trail-form--duration-hours')"
                    :label="$t('global:hours')"
                    :validation="$v.formData.duration.hours"
                    :disabled="isReadOnly"
                    :dark="accessibility"
                    :min="0"
                    :max="9999"
                    :maxlength="5"
                    type="number"
                  />
                  <InputField
                    v-model="formData.duration.minutes"
                    :data-testid="$testId('trail-form--duration-minutes')"
                    :label="$t('global:minutes')"
                    :validation="$v.formData.duration.minutes"
                    :disabled="isReadOnly"
                    :dark="accessibility"
                    :min="0"
                    :max="59"
                    :maxlength="5"
                    type="number"
                  />
                </div>
              </div>

              <Checkbox
                v-model="formData.closedSession"
                :data-testid="$testId('trail-form--closed-session')"
                :items="checkboxClosedSessionList"
                :disabled="closedSessionCanBeToggled"
                switch-type
                @input="clearStartEndTime"
              />

              <template v-if="!formData.closedSession">
                <div class="trails-create-timeline--wrapper">
                  <p class="text-color">{{ $t('trails.create:form.duration.timeline') }}</p>
                  <i>{{ $t('trails.create:form.duration.timeline.tip') }}</i>
                </div>

                <div
                  class="form-group clearfix"
                  data-cols="2"
                  data-gap="40"
                >
                  <Datepicker
                    v-model="formData.startTime"
                    :data-testid="$testId('trail-form--start-time')"
                    :label="$t('global:form.start')"
                    @input="clearEndTime"
                  />
                  <Datepicker
                    v-model="formData.endTime"
                    :data-testid="$testId('trail-form--end-time')"
                    :disabled="!formData.startTime"
                    :min="formData.startTime"
                    :label="$t('global:form.closure')"
                  />
                </div>
              </template>
            </FormSection>

            <FormSection :title="$t('global:solution.workload')">
              <div
                class="form-group clearfix"
                data-cols="2"
                data-gap="40"
              >
                <InputField
                  v-model="formData.workload.hours"
                  :data-testid="$testId('trail-form--workload-value')"
                  :validation="$v.formData.workload.hours"
                  :label="$t('global:hours')"
                  :disabled="isReadOnly"
                  :dark="accessibility"
                  :min="0"
                  :max="2000"
                  :maxlength="5"
                  type="number"
                />
                <InputField
                  v-model="formData.workload.minutes"
                  :data-testid="$testId('trail-form--workload-value')"
                  :validation="$v.formData.workload.minutes"
                  :label="$t('global:minutes')"
                  :disabled="isReadOnly"
                  :dark="accessibility"
                  :min="0"
                  :max="59"
                  :maxlength="5"
                  type="number"
                />
              </div>
            </FormSection>

            <FormSection :title="$t('solutions.create:form.final.status.title')">
              <p class="form-item-description-light">
                {{ $t('solutions.create:form.final.status.description') }}
              </p>
              <SelectField
                v-model="formData.finalStatusId"
                :label="$t('solutions.create:form.final.status.label')"
                :items="finalStatusList"
                :validation="$v.formData.finalStatusId"
                :dark="accessibility"
                :disabled="isReadOnly"
              />
            </FormSection>

            <div class="trails-create-reenrollment__enable">
              <Checkbox
                v-model="formData.reenrollmentAllowed"
                :data-testid="$testId('trail-form--enable-reenrollment')"
                :items="[{ value: true, label: $t('trails.create:form.reenrollment.enable') }]"
                :disabled="isReadOnly"
                class="mt-5"
                switch-type
              />
            </div>
            <template v-if="formData.reenrollmentAllowed">
              <div class="trails-create-timeline--wrapper">
                <i>{{ $t('trails.create:form.reenrollment.description') }}</i>
              </div>
              <div class="trails-create-reenrollment__options">
                <Checkbox
                  v-model="formData.statusAllowedReenrollment"
                  :data-testid="$testId('trail-form--enable-reenrollment-options')"
                  :items="[
                    { value: 'aprovado', label: $t('global:solution.status.aprovado') },
                    { value: 'reprovado', label: $t('global:solution.status.reprovado') },
                    { value: 'expirado', label: $t('global:solution.status.expirado') },
                    { value: 'desistente', label: $t('global:solution.status.desistente') },
                  ]"
                  :disabled="isReadOnly"
                  class="mt-5"
                  :validation="$v.formData.statusAllowedReenrollment"
                />
              </div>
            </template>
          </div>

          <FormSection
            v-if="$isEnabledFeature('certificate_paths')"
            :title="$t('global:form.certificate')"
            class="mb-10"
          >
            <Checkbox
              v-model="formData.certificate.enable"
              :data-testid="$testId('trail-form--enable-certificate')"
              :items="[{ value: true, label: $t('trails.create:form.certificate.enable') }]"
              :disabled="isReadOnly"
              class="mt-5"
              switch-type
            />

            <SelectField
              v-if="formData.certificate.enable"
              v-model="formData.certificate.model"
              :data-testid="$testId('trail-form--certificate-model')"
              :validation="$v.formData.certificate.model"
              :label="$t('global:form.certificate.model')"
              :items="certificateList"
              :disabled="isReadOnly"
              :dark="accessibility"
            />
          </FormSection>

          <Upload
            v-model="formData.image"
            :data-testid="$testId('trail-form--image')"
            :validation="$v.formData.duration.image"
            :description="$t('global:upload.title')"
            :label="$t('global:upload.add.image')"
            :disabled="isReadOnly"
            :dark="accessibility"
            :width="300"
            :height="200"
            icon="image-multiple"
            class="trail-image"
            cropper
          />

          <div class="trail-form-branch-content__wrapper bg-black-100">
            <BranchSelector
              :value="savedBranches"
              :validation="$v.formData.branches"
              class="mb-5 bg-black-100"
              multiple
              @change="formData.branches = $event"
            />
          </div>

          <div class="trail-form-team-content__wrapper bg-black-100">
            <FormSection
              v-if="!isReadOnly"
              :title="$t('trails.create:form.responsible')"
            >
              <div
                class="form-group clearfix responsible-group"
                data-cols="2"
                data-gap="40"
              >
                <Autocomplete
                  v-model="member.user"
                  :disabled="$isEnabledFeature('branching') && !formData.branches.length"
                  :label="$t('global:form.user')"
                  :loading="autocompleteLoading"
                  :validation="$v.member.user"
                  :items="autocompleteItems"
                  option-property="name"
                  append-icon="search"
                  async
                  @input.capture="selectUser($event)"
                  @search="getUsersList($event)"
                />

                <SelectField
                  v-model="member.profile_id"
                  :validation="$v.member.profile_id"
                  :label="$t('global:form.position')"
                  :loading="loadingProfiles"
                  :items="searchedProfiles"
                  :disabled="!member.user"
                  @input="getProfileName"
                />
              </div>

              <Action
                :validation="$v.formData.team"
                :text="$t('trails.create:form.responsible.btn.add')"
                class="btn-add-responsible"
                type="button"
                flat
                @click="openConfirmAddMember"
              />
            </FormSection>

            <DatatableTeam
              ref="dataTableTeam"
              :team="formData.team"
              :validation="$v.formData.team"
              @remove="openConfirmRemoveMember"
              @switch="onSwitchMember"
            />
          </div>
        </form>
        <Pagination
          class-wrapper="mx-auto my-8"
          :active-first-last="false"
          :active-page="1"
          :page-count="2"
          :show-all-pages="Boolean($route.params.id)"
          float
          block-layout
          disable-scroll
          disable-items-per-page
          custom-routing
          @next-page="canWriteTrails ? submit(true) : goToTrailsSolution(trail.id)"
          @go-to-page="canWriteTrails ? submit(true) : goToTrailsSolution(trail.id)"
        />
      </div>
    </div>

    <Modal
      :active="modalConfirm"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          class="btn-close"
          icon-size="medium"
          type="button"
          icon="close"
          @click="closeModalConfirm()"
        />

        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ leaveModalTitle }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('trails.create:modal.confirm.message') }}</p>
          </div>
        </div>

        <div class="modal-confirm-footer">
          <Action
            v-if="isFormDirty && !$v.formData.$invalid"
            :text="$t('global:save.leave')"
            :dark="accessibility"
            flat
            type="button"
            @click="save()"
          />

          <Action
            :text="$t('global:leave')"
            :dark="accessibility"
            type="button"
            flat
            @click="leave()"
          />

          <Action
            :text="$t('global:cancel')"
            :dark="accessibility"
            type="button"
            flat
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>

    <ModalConfirm
      :title="$t('trails.update:modal.confirm.add.member.title')"
      :cancel-btn-text="$t('global:not.now')"
      :confirm-btn-text="$t('global:yes')"
      :active="isOpenModalAddMember"
      @confirm="addMember"
      @close="closeConfirmAddMember"
    >
      <slot name="description">
        <p class="text-color">{{ $t('trails.update:modal.confirm.add.member.description') }}</p>
      </slot>
    </ModalConfirm>

    <ModalConfirm
      :title="$t('trails.update:modal.confirm.remove.member.title')"
      :cancel-btn-text="$t('global:not.now')"
      :confirm-btn-text="$t('global:yes')"
      :active="isOpenModalRemoveMember"
      @close="closeConfirmRemoveMember"
      @confirm="removeMember"
    >
      <slot name="description">
        <p class="text-color">{{ $t('trails.update:modal.confirm.remove.member.description') }}</p>
      </slot>
    </ModalConfirm>

    <ModalConfirm
      :title="$t('trails.update:modal.confirm.save.nextStep.title')"
      :confirm-btn-text="$t('global:yes')"
      :cancel-btn-text="$t('global:no')"
      :active="isOpenModalSaveBeforeNextStep"
      @close="closeModalSaveBeforeNextStep"
      @confirm="submit(true)"
    >
      <slot name="description">
        <p class="text-color">{{ $t('trails.update:modal.confirm.save.nextStep.description') }}</p>
      </slot>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import '~@/app/trails/styles.scss';
</style>
