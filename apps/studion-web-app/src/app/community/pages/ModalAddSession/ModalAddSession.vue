<script>
import i18n from '@/support/i18n'
import { mapActions, mapState } from 'vuex'
import { required, requiredIf, minValue, minLength } from 'vuelidate/lib/validators'
import { format, parseISO } from 'date-fns'
import { AUTO_GENERATE_OPTIONS } from '@/app/shared.js'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'
import { SESSION_TEAM_OPTIONS } from '@/support/utils/constants'
import slugValidator from '@/support/customValidators/slugValidator'
import { dateIntervalToTypeAndNumber } from '@/support/utils/duration'
import debounce from 'lodash/debounce'

import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import AutocompleteCategories from '@/components/shared/AutocompleteCategories'
import Checkbox from '@/components/general/Checkbox'
import Datepicker from '@/components/general/Datepicker'
import FormSection from '@/components/general/FormSection'
import HelperCloud from '@/components/general/HelperCloud'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import Radio from '@/components/general/Radio'
import SelectField from '@/components/general/SelectField'
import SendMessagesToAdmins from '@/app/offerings/components/SendMessagesToAdmins/SendMessagesToAdmins.vue'
import DateFrequencyField from '../../components/DateFrequencyField'
import DatatableScheduleBlocks from '../../components/DatatableScheduleBlocks'
import PeriodSelector from '@/app/offerings/components/PeriodSelector'
import ModalConfirm from '@/components/general/ModalConfirm'
import Tips from '@/components/general/Tips'

import SessionTabsModal from '../../components/SessionTabsModal'
import DatatableTeam from '@/components/shared/DatatableTeam'
import {
  hasPrimaryMember,
  responsibleDifferentProfile,
} from '@/support/customValidators/responsibleValidator'
import { parseDuration, reduceDuration } from '@/support/utils/duration'
import { getDefaultScheduleBlock, parseScheduleBlock } from './scheduleBlock'
import { scheduleBlocksSort, checkDuplicates } from '@/support/utils/scheduleBlock'
import { PERIOD_VALIDATIONS, PERIOD_DATA } from '@/app/offerings/shared'

export default {
  name: 'ModalAddSession',

  components: {
    Action,
    Autocomplete,
    AutocompleteCategories,
    Checkbox,
    DatatableTeam,
    DateFrequencyField,
    DatatableScheduleBlocks,
    Datepicker,
    FormSection,
    HelperCloud,
    InputField,
    Modal,
    Radio,
    SelectField,
    SendMessagesToAdmins,
    SessionTabsModal,
    PeriodSelector,
    Tips,
    ModalConfirm,
  },

  mixins: [formScrollValidationMixin],

  data() {
    return {
      allowedReenrollmentStatus: [],
      formData: {
        statusOption: {
          id: null,
        },
        session: {
          name: null,
          slug: '',
          association: 1,
          offering: {
            id: null,
            name: null,
          },
          solution: {
            id: null,
            access: null,
          },
          duration: {
            type: 'd',
            number: null,
            dateInterval: null,
          },
          vacancyType: 'unlimited',
          vacancy: null,
          team: [],
          students: [],
          start_time: null,
          end_time: null,
          extended_time: null,
          sessionUuid: null,
          schedule_block: [],
          schedule_grant_access: [],
          auto_generate: false,
          auto_generate_type: null,
          reenrollment_allowed: false,
          status_allowed_reenrollment: [],
          categories: [],
          allowAllProfilesSendKb: true,
          ...PERIOD_DATA,
        },
        student: {
          uuid: null,
          status: null,
        },
      },
      autoGenerateOptions: AUTO_GENERATE_OPTIONS,
      currentScheduleBlock: getDefaultScheduleBlock(),
      currentScheduleAllowed: getDefaultScheduleBlock(),
      hasBlock: false,
      hasAllowance: false,
      offeringItems: [],
      solutionItems: [],
      solutionLoading: false,
      vacancyTypes: [
        {
          value: 'unlimited',
          label: i18n.t('global:form.unlimited'),
        },
        {
          value: 'limited',
          label: i18n.t('global:form.limited'),
        },
      ],
      solutionTypeAccessItems: [
        {
          value: 'individual',
          text: i18n.t('offerings.sessions.edit:session.individual.name'),
        },
        {
          value: 'open',
          text: i18n.t('offerings.sessions.edit:session.open.name'),
        },
        {
          value: 'closed',
          text: i18n.t('offerings.sessions.edit:session.closed.name'),
        },
      ],
      autocompleteItems: [],
      autocompleteItemsStudents: [],
      autocompleteLoading: false,
      profilesList: [],
      searchedProfiles: [],
      loadingProfiles: false,
      member: {
        profile_id: null,
        profile_name: null,
        name: null,
        id: null,
        uuid: null,
        user: null,
        position: null,
      },
      solution: null,
      showStartDate: false,
      showEndDate: false,
      showExtendedDate: false,
      extendedDateActive: false,
      modalDateChangeConfirmActive: false,
      modalDurationChangeConfirmActive: false,
      modalChangeExtendedDate: false,
      currentDateItemName: null,
      branchIds: null,
      prevSessionDuration: null,
      periodValidations: PERIOD_VALIDATIONS,
      extensionLimitDays: 0,
      allowsExtension: false,
      extendedTimeOld: null,
    }
  },
  validations() {
    const objectValidation = {
      formData: {
        statusOption: {
          id: {
            required,
          },
        },
        session: {
          association: {
            required,
          },
          name: {
            required,
            minLength: minLength(3),
          },
          slug: {
            slugValidation: slugValidator,
          },
          auto_generate_type: {
            required: requiredIf(function () {
              return this.formData.session.auto_generate
            }),
          },
          duration: { number: {}, type: {} },
          offering: {
            id: {
              required: requiredIf(function () {
                return this.formData.session.association === 0 && !this.isEditing
              }),
            },
            name: {
              required: requiredIf(function () {
                return this.formData.session.association === 0 && !this.isEditing
              }),
            },
          },
          solution: {
            id: {
              required: requiredIf(function () {
                return this.formData.session.association === 1 && !this.isEditing
              }),
            },
            access: {
              required: requiredIf(function () {
                return this.formData.session.association === 1 && !this.isEditing
              }),
            },
          },
          start_time: {
            required: requiredIf(function () {
              return this.showStartDate
            }),
          },
          end_time: {
            required: requiredIf(function () {
              return this.showEndDate && this.formData.session.start_time != null
            }),
          },
          extended_time: {
            required: requiredIf(function () {
              return this.showExtendedDate && this.extendedDateActive && this.isEditing
            }),
          },
          vacancy: {
            required: requiredIf(function () {
              return this.formData.session.vacancyType === 'limited'
            }),
            minValue(value) {
              if (this.formData.session.vacancyType === 'limited') {
                return minValue(this.minVacancy)(value)
              } else {
                return minValue(this.minVacancy)(null)
              }
            },
          },
          team: {
            required,
            hasPrimaryMember,
            responsibleDifferentProfile,
            justOneMemberPrimary: (v) => {
              const primaries = v.filter((i) => i.position === 'primary')
              if (primaries.length > 1) return false
              return true
            },
          },
        },
        student: {
          uuid: {
            required,
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
    }

    if (this.hasOffering) {
      objectValidation.formData.session = {
        ...objectValidation.formData.session,
        ...this.periodValidations,
      }
    }

    return objectValidation
  },
  computed: {
    ...mapState(['Sessions', 'profiles', 'fetching', 'accessibility']),
    hasPrimaryTeamMember() {
      return this.formData.session.team.find(
        (member) => member.position === SESSION_TEAM_OPTIONS[0].value
      )
    },
    isEditing() {
      return this.$route.meta.editing || false
    },
    minVacancy() {
      return this.formData.session.students.length || 0
    },
    sessionSelected() {
      return this.Sessions.current
        ? {
            solutions: [this.Sessions.current.course],
            type: this.Sessions.current.type,
            period: this.Sessions.current.availability,
            offering: this.hasOffering
              ? this.Sessions.current.offering.title
              : this.Sessions.current.course.name,
            name: this.Sessions.current.name,
          }
        : null
    },
    isSessionOpen() {
      if (!this.$route.meta.editing) {
        return true
      }
      if (
        this.Sessions.current.availability.final == null ||
        this.Sessions.current.availability.final === ''
      ) {
        return true
      }
      let effectiveDate = this.Sessions.current.availability.final
      let endDate = new Date(effectiveDate).getTime()
      let now = new Date().getTime()
      return endDate >= now
    },
    disabledResponsible() {
      return this.$isEnabledFeature('branching') && !this.isEditing && !this.solution
    },
    solutionTypeAccessItemsFiltered() {
      return this.solutionTypeAccessItems.filter((item) =>
        this.solutionHasConclusionEnrollmentCondition ? item.value === 'closed' : true
      )
    },
    solutionHasConclusionEnrollmentCondition() {
      if (!this.solution || !this.solution.length) return false
      return this.solution[0].conclusionEnrollmentCondition
    },
    durationTypeList() {
      return [
        {
          text: this.$t('global:days'),
          value: 'd',
        },
        {
          text: this.$t('global:hours'),
          value: 'h',
        },
      ]
    },
    showSessionDeadline() {
      return (
        this.$isEnabledFeature('session_deadline') &&
        this.formData.session.solution.access &&
        this.formData.session.solution.access !== 'closed'
      )
    },
    hasOffering() {
      return (
        this.Sessions.current && this.Sessions.current.offering && this.Sessions.current.offering.id
      )
    },
    minExtendedDay() {
      return this.formData.session.end_time
    },
  },
  watch: {
    'formData.session.duration': {
      deep: true,
      handler(duration) {
        parseDuration(duration)
      },
    },
    'formData.session.team': {
      deep: true,
      handler() {
        this.$v.formData.session.team.$touch()
      },
    },
  },
  created() {
    this.setFetching(true)
    this.attemptProfileListRetrieval({ limit: 1000 })
      .then(({ data: allProfiles }) => {
        this.profilesList = allProfiles.data
          .filter(({ alias }) => alias !== 'student')
          .map(({ name, id, alias }) => ({
            text: alias === 'agent' ? name : i18n.t(`global:${alias}`),
            value: id,
            alias: alias,
          }))

        if (this.isEditing && this.$route.params.id && this.Sessions.current) {
          this.formData.session.name = this.Sessions.current.name

          if (this.$isEnabledFeature('slug_identity')) {
            this.formData.session.slug = this.Sessions.current.slug
          }

          this.formData.session.session_id = this.Sessions.current.id
          this.formData.session.sessionUuid = this.Sessions.current.uuid
          this.formData.session.reenrollment_allowed = this.Sessions.current.reenrollmentAllowed

          const autoGenerateType = this.Sessions.current.autoGenerateType
          this.formData.session.auto_generate = autoGenerateType !== 'none'
          this.formData.session.auto_generate_type =
            autoGenerateType !== 'none' ? autoGenerateType : null

          this.parseEditingDuration(this.Sessions.current)
          this.branchIds = this.Sessions.current.course.branches
            ? this.Sessions.current.course.branches.map((branch) => branch.id)
            : null
          if (this.$isEnabledFeature('session_block') && this.Sessions.current.scheduleBlock) {
            this.formData.session.schedule_block = this.Sessions.current.scheduleBlock
          }
          this.formData.session.schedule_grant_access = this.Sessions.current.scheduleGrantAccess

          this.formData.session.solution.access = this.Sessions.current.type
          this.formData.session.solution.type = this.Sessions.current.course.type.alias
          this.checkSolutionTypeAccess()
          this.formData.session.start_time = this.Sessions.current.availability.initial
          this.formData.session.end_time = this.Sessions.current.availability.final
          this.formData.session.extended_time = this.Sessions.current.availability.extended || null
          this.formData.session.enrollmentType = this.Sessions.current.enrollmentType.type
          this.formData.session.enrollmentStartDate = this.Sessions.current.enrollmentType.start
          this.formData.session.enrollmentEndDate = this.Sessions.current.enrollmentType.end
          this.extendedDateActive = this.formData.session.extended_time !== null
          this.extensionLimitDays = this.Sessions.current.availability.extensionLimitDays
          this.allowsExtension = this.Sessions.current.availability.allowsExtension

          if (this.formData.session.extended_time !== null) {
            this.extendedTimeOld = this.formData.session.extended_time.substr(0, 10)
          }

          this.setAllowedReenrollmentStatus()

          if (this.formData.session.reenrollment_allowed) {
            this.formData.session.status_allowed_reenrollment =
              this.Sessions.current.statusAllowedReenrollment.map((item) => item.status_alias)
          }
          this.formData.session.vacancy = !this.Sessions.current.vacancy.free
            ? this.Sessions.current.vacancy.max_vacancy
            : null

          this.formData.session.team = this.Sessions.current.team.map((item) => {
            const teamItem = {
              id: item.applicationUser.id,
              uuid: item.applicationUser.uuid,
              name: item.applicationUser.userData.name || null,
              profile_name:
                item.profile.alias === 'agent'
                  ? item.profile.name
                  : i18n.t(`global:${item.profile.alias}`),
              profile_id: item.profile.id,
              position: item.position || SESSION_TEAM_OPTIONS[2].value,
            }

            if (!this.hasOffering) {
              teamItem.uniqueId = teamItem.uuid + teamItem.profile_name
            }

            return teamItem
          })
          this.formData.session.categories = this.Sessions.current.categories
          this.formData.session.allowAllProfilesSendKb =
            this.Sessions.current.allowAllProfilesSendKb
          this.formData.session.vacancyType = this.Sessions.current.vacancy.free
            ? 'unlimited'
            : 'limited'
          if (this.$refs.dataTableTeam) {
            this.$refs.dataTableTeam.fixTeamOrder()
          }
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptProfileListRetrieval',
      'attemptListUsersNonStudentByName',
      'attemptProfilesByUser',
      'attemptCourseListRetrieval',
      'attemptSessionUpdate',
      'attemptCreateSession',
      'addSessionsItems',
      'setSessionsCurrentItemData',
    ]),
    closeDateChangeModalConfirm() {
      this.modalDateChangeConfirmActive = false
      this.currentDateItemName = null
    },
    cancelDateChange() {
      let formDataAttrName = null
      switch (this.currentDateItemName) {
        case 'initial':
          formDataAttrName = 'start_time'
          break
        case 'final':
          formDataAttrName = 'end_time'
          break
      }
      if (this.formData.session[formDataAttrName]) {
        this.formData.session[formDataAttrName] =
          this.Sessions.current.availability[this.currentDateItemName]
      }
      this.closeDateChangeModalConfirm()
    },
    cancelDurationChange() {
      this.modalDurationChangeConfirmActive = false
    },
    onSwitchMember() {
      this.$v.member.$reset()
    },

    confirmDateChange() {
      this.closeDateChangeModalConfirm()
    },
    openDateChangeModalConfirm(itemName, itemValue) {
      const availability = this.Sessions.current && this.Sessions.current.availability
      const refDate = availability && availability[itemName]
      if (!refDate) return

      const date = typeof refDate === 'string' ? parseISO(refDate) : refDate
      const dateFormatted = format(date, 'yyyy-MM-dd')

      if (this.isEditing && itemValue !== dateFormatted) {
        this.currentDateItemName = itemName
        this.modalDateChangeConfirmActive = true
      }
    },
    addMember() {
      this.$v.member.$touch()

      if (!this.$v.member.$invalid) {
        let existentMembers = []

        if (this.hasOffering) {
          let member = this.formData.session.team.find(
            (item) => item.uuid === this.member.user[0].uuid
          )

          if (member) existentMembers.push(member)
        } else {
          existentMembers = this.formData.session.team.filter((item) => {
            return (
              item.uuid === this.member.user[0].uuid &&
              item.profile_name === this.member.profile_name
            )
          })
        }

        if (!existentMembers.length) {
          const tempMember = {
            name: this.member.user[0].name,
            profile_id: this.member.profile_id,
            profile_name: this.member.profile_name,
            user_id: this.member.user[0].id,
            uuid: this.member.user[0].uuid,
            position: SESSION_TEAM_OPTIONS[2].value,
          }

          if (!this.hasOffering) {
            tempMember.uniqueId = tempMember.uuid + tempMember.profile_name
          }

          if (!this.hasPrimaryTeamMember) {
            tempMember.position = SESSION_TEAM_OPTIONS[0].value
            this.formData.session.team.unshift({ ...tempMember })
          } else {
            this.formData.session.team.push({ ...tempMember })
          }
        } else {
          this.setFeedback({
            message: i18n.t('community.sessions.add:modal.feedback.team.member.exists'),
            type: 'error',
          })
        }

        this.member.profile_id = null
        this.member.profile_name = null
        this.member.user = null
        this.$v.member.$reset()
      }
    },
    removeMember(index) {
      this.formData.session.team.splice(index, 1)
    },
    getSolutionBranchIds() {
      return this.isEditing ? this.branchIds : this.formData.session.solution.branches
    },
    getUsersList(value) {
      if (value.length) {
        this.autocompleteLoading = true
        this.member.name = null
        this.member.id = null
        this.member.uuid = null
        this.member.user = null
        const branchIds = this.getSolutionBranchIds()

        this.attemptListUsersNonStudentByName({
          userName: value,
          branchIds,
        })
          .then(({ data }) => {
            this.autocompleteLoading = false
            this.autocompleteItems = data
              ? data.map(({ name, applicationUserId, uuid }) => ({
                  name: name,
                  id: applicationUserId,
                  uuid: uuid,
                }))
              : []
          })
          .catch(() => {
            this.autocompleteLoading = false
            this.autocompleteItems = []
          })
      }
      return true
    },
    getProfileName(value) {
      if (!value) return
      let elem = this.profilesList.find((elem) => {
        return elem.id === value
      })
      this.member.profile_name = elem.alias === 'agent' ? elem.name : i18n.t(`global:${elem.alias}`)
    },
    selectUser(data) {
      if (!data) {
        this.member.profile_id = null
        this.$v.member.profile_id.$reset()
      }

      if (data && this.member.id === null) {
        this.member.name = data[0].name
        this.member.id = data[0].id
        this.member.uuid = data[0].uuid
        this.member.user = data[0]
        this.getProfiles()
      }
    },
    resetMember() {
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

    setAllowedReenrollmentStatus() {
      const allowedtypes = [{ text: this.$t('global:solution.status.expirado'), value: 'expirado' }]

      const isHybrid = this.formData.session.solution.type === 'hybrid'

      if (isHybrid) {
        allowedtypes.push({ text: this.$t('global:solution.status.realizado'), value: 'realizado' })
        this.allowedReenrollmentStatus = allowedtypes
        return
      }

      allowedtypes.push({ text: this.$t('global:solution.status.reprovado'), value: 'reprovado' })
      allowedtypes.push({ text: this.$t('global:solution.status.desistente'), value: 'desistente' })
      allowedtypes.push({ text: this.$t('global:solution.status.aprovado'), value: 'aprovado' })
      this.allowedReenrollmentStatus = allowedtypes
    },

    selectSolution(data) {
      if (data) {
        this.formData.session.solution.type = data[0].type
        this.formData.session.solution.id = data[0].value
        if (this.$isEnabledFeature('branching'))
          this.formData.session.solution.branches = data[0].branches
      }
      if (this.$isEnabledFeature('branching')) this.resetMember()

      if (data && this.solutionHasConclusionEnrollmentCondition) {
        this.formData.session.solution.access = this.solutionTypeAccessItemsFiltered[0].value
      } else this.formData.session.solution.access = null

      this.formData.session.status_allowed_reenrollment = null
      this.formData.session.reenrollment_allowed = false
      this.setAllowedReenrollmentStatus()

      this.checkSolutionTypeAccess()
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
    formatCategoriesList() {
      if (this.formData.session.categories) {
        this.formData.session.categories = this.formData.session.categories.map(
          (category) => category.id
        )
      }
    },

    handleSubmit() {
      const changedExtendedDate = this.extendedTimeOld !== this.formData.session.extended_time

      if (changedExtendedDate) {
        this.modalChangeExtendedDate = true
      } else {
        delete this.formData.session.extended_time
        this.submit()
      }
    },

    submit() {
      if (!this.canWrite('sessions')) return

      this.$v.formData.session.$touch()
      if (this.$v.formData.session.team.$invalid) {
        this.$v.member.$touch()
      }
      if (!this.$v.formData.session.$invalid) {
        this.formData.session.session_id ? this.checkDurationChanged() : this.submitCreation()
      }

      this.$nextTick(() => this.scrollToInputError())
    },
    submitCreation() {
      this.setFetching(true)
      this.formatCategoriesList()
      this.formatAutoGenerateType()
      this.attemptCreateSession(this.formData.session)
        .then(({ data }) => {
          this.addSessionsItems(data)
          this.setFeedback({ message: i18n.t('community.sessions.add:feedback.success') })
          this.$router.push({ name: 'community.sessions' })
        })
        .catch(({ response }) => {
          this.formData.session.team.forEach((member) => {
            if (member.position) return
            member.position = SESSION_TEAM_OPTIONS[2].value
          })
          this.setFeedback({
            message: i18n.t(
              `community.sessions.add:feedback.error:${response.data.message.replace(/_/g, '.')}`
            ),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    submitUpdate() {
      this.setFetching(true)
      this.formatCategoriesList()
      this.formatAutoGenerateType()
      let team = this.formData.session.team
      this.formData.session.team = []
      this.formData.session.team = team
        .filter((item) => !item.dirty)
        .map((item) => {
          return {
            uuid: item.uuid,
            position: item.position,
            profile_id: item.profile_id,
          }
        })
      if (!this.extendedDateActive) {
        this.formData.session.extended_time = null
      }

      this.setupEnrollmentData()

      this.formData.session.vacancy =
        this.formData.session.vacancyType !== 'unlimited' ? this.formData.session.vacancy : 0
      this.attemptSessionUpdate(this.formData.session)
        .then(({ data }) => {
          this.setSessionsCurrentItemData(data)
          this.setFeedback({ message: i18n.t('community.sessions.edit:feedback.success') })
          this.$router.push({ name: 'community.sessions' })
          this.resetEnrollmentData()
        })
        .catch(({ response }) => {
          this.formData.session.team = team
          this.setFeedback({
            message: i18n.t(
              `community.sessions.edit:feedback.error:${response.data.message.replace(/_/g, '.')}`
            ),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    setupEnrollmentData() {
      if (this.formData.session.enrollmentType) {
        this.formData.session.enrollment_type = this.formData.session.enrollmentType
      }

      if (this.formData.session.enrollmentStartDate) {
        this.formData.session.enrollment_start_date =
          `${this.formData.session.enrollmentStartDate} 00:00:00`.substring(0, 19)
      }

      if (this.formData.session.enrollmentEndDate) {
        this.formData.session.enrollment_end_date =
          `${this.formData.session.enrollmentEndDate} 23:59:59`.substring(0, 19)
      }
    },

    resetEnrollmentData() {
      this.formData.session.enrollmentType = null
      this.formData.session.enrollmentStartDate = null
      this.formData.session.enrollmentEndDate = null
    },

    getSolutionList(value) {
      if (value.length) {
        this.solutionLoading = true

        const payload = {
          query: {
            name: value,
          },
          embed: 'branches',
          activeOnly: true,
          allCoursesRead: this.$isEnabledFeature('branching') ? false : true,
        }

        this.attemptCourseListRetrieval(payload)
          .then(({ data }) => {
            if (data && data.data && data.data.length) {
              this.solutionItems = data.data.map((item) => {
                const solutionItem = {
                  onlySearchable: false,
                  value: item['course_id'],
                  name: item['course_name'],
                  conclusionEnrollmentCondition: !!item['conclusion_enrollment_condition'],
                  type: item['course_type_alias'],
                }

                if (this.$isEnabledFeature('branching')) {
                  solutionItem.branches = item._embedded.branches.map((branch) => branch.id)
                }

                return solutionItem
              })
            } else {
              this.solutionItems = []
            }
          })
          .catch(() => {
            this.solutionItems = []
          })
          .finally(() => {
            this.solutionLoading = false
          })
      }

      return true
    },

    checkDurationChanged() {
      if (this.prevSessionDuration !== this.formData.session.duration.dateInterval) {
        this.modalDurationChangeConfirmActive = true
      } else {
        this.submitUpdate()
      }
    },
    /**
     * Set auto_generate_type right string
     */
    formatAutoGenerateType() {
      const data = this.formData.session
      if (!data.auto_generate) data.auto_generate_type = 'none'
    },
    checkSolutionTypeAccess() {
      this.showStartDate = false
      this.showEndDate = false
      this.showExtendedDate = false
      this.formData.session.start_time = null
      this.formData.session.end_time = null
      if (this.formData.session.solution.access === 'open') {
        this.showStartDate = true
        this.showEndDate = false
        this.showExtendedDate = false
        if (!this.isEditing) {
          this.formData.session.start_time = null
          this.formData.session.end_time = null
        }
      }
      if (this.formData.session.solution.access === 'closed') {
        this.showStartDate = true
        this.showEndDate = true
        this.showExtendedDate = true
        if (!this.isEditing) {
          this.formData.session.start_time = null
          this.formData.session.end_time = null
        }
      }
    },
    parseSolutions(solutions) {
      return solutions
        .map(({ name }) => {
          return name
        })
        .join('<br>')
    },
    /**
     * Check if current Sessions has saved duration and update formData fields
     * @param {Object} current
     */
    parseEditingDuration(current) {
      this.prevSessionDuration = null
      if (!current.duration) {
        this.formData.session.duration = {
          type: 'd',
          number: null,
          dateInterval: null,
        }
      } else {
        const parsedDuration = dateIntervalToTypeAndNumber(current.duration)
        this.formData.session.duration = {
          dateInterval: current.duration,
          type: parsedDuration.type,
          number: parsedDuration.number || parsedDuration.hours,
        }
        this.prevSessionDuration = reduceDuration(current.duration)
      }
    },
    addScheduleBlock() {
      this.$refs.datefrequencefield && this.$refs.datefrequencefield.touchRequiredFields()

      const isSessionBlockValid = !this.$refs.datefrequencefield.$v.value.$invalid
      if (!isSessionBlockValid) return

      this.formData.session.schedule_block.push(parseScheduleBlock(this.currentScheduleBlock))
      this.currentScheduleBlock = getDefaultScheduleBlock()
      this.$refs.datefrequencefield.resetValidations()
    },
    removeScheduleBlock(index) {
      this.formData.session.schedule_block.sort(scheduleBlocksSort).splice(index, 1)
    },
    addScheduleAllowance() {
      this.$refs.datefrequencefieldallowed &&
        this.$refs.datefrequencefieldallowed.touchRequiredFields()

      const isSessionBlockValid = !this.$refs.datefrequencefieldallowed.$v.value.$invalid
      if (!isSessionBlockValid) return

      const newScheduleBlock = parseScheduleBlock(this.currentScheduleAllowed)

      const isDuplicate = checkDuplicates(
        newScheduleBlock,
        this.formData.session.schedule_grant_access
      )

      if (isDuplicate) {
        this.setFeedback({
          type: 'info',
          message: this.$t('community.sessions:session.allowance.duplicate.warning'),
        })
        return
      }

      this.formData.session.schedule_grant_access.push(newScheduleBlock)
      this.currentScheduleAllowed = getDefaultScheduleBlock()
      this.$refs.datefrequencefieldallowed.resetValidations()
    },
    removeScheduleAllowance(index) {
      this.formData.session.schedule_grant_access.sort(scheduleBlocksSort).splice(index, 1)
    },
    toggleScheduleBlock(val) {
      if (this.formData.session.schedule_grant_access.length > 0 && val) {
        this.setFeedback({
          type: 'info',
          message: this.$t('community.sessions:modal.toggle.block.warning'),
        })
        this.$nextTick(() => {
          this.hasBlock = false
        })
        return
      }

      this.hasAllowance = false
      this.hasBlock = val
    },
    toggleScheduleAllowance(val) {
      if (this.formData.session.schedule_block.length > 0 && val) {
        this.setFeedback({
          type: 'info',
          message: this.$t('community.sessions:modal.toggle.allowance.warning'),
        })
        this.$nextTick(() => {
          this.hasAllowance = false
        })
        return
      }

      this.hasBlock = false
      this.hasAllowance = val
    },

    searchSolutionDebounce: debounce(function (value) {
      if (value === null || value.length === 0 || value.length > 2) {
        this.getSolutionList(value)
      }
    }, 2000),
  },
}
</script>

<template>
  <Modal
    active
    cancel
    is-page
  >
    <div class="modal-form modal-add-session">
      <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
      <h2
        v-if="canWrite('sessions')"
        class="modal-title text-color"
      >
        {{
          isEditing
            ? $t('community.sessions:modal.edit.title')
            : $t('community.sessions:modal.add.title')
        }}
      </h2>
      <h2
        v-else
        class="modal-title text-color"
      >
        {{ formData.session.name }}
      </h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('community.sessions:modal.description') }}</p>
      </div>

      <SessionTabsModal
        :rendering-condition="isEditing"
        :tab-link-active="0"
        :show-mediation-plan-tab="
          (canRead('mediation_plan') || canWrite('mediation_plan')) && $isEnabledFeature('pm')
        "
      />

      <form
        class="flex flex-column gap-4"
        @submit.prevent="handleSubmit"
      >
        <template v-if="formData.session.association === 1 && !isEditing">
          <Autocomplete
            v-model="solution"
            :label="$t('community.sessions.add:solution.label')"
            :placeholder="$t('community.sessions.add:solution.placeholder')"
            :items="solutionItems"
            :validation="$v.formData.session.solution.id"
            :hint="$t('community.sessions.add:solution.hint')"
            :loading="solutionLoading"
            option-property="name"
            append-icon="search"
            async
            dark
            @input="selectSolution"
            @search="searchSolutionDebounce"
          />
          <AutocompleteCategories
            v-model="formData.session.categories"
            :floating-label="true"
            :label="$tc('global:category', 2)"
            dark
          />
          <SelectField
            v-model="formData.session.solution.access"
            :label="$t('community.sessions.add:solution.type.access.label')"
            :items="solutionTypeAccessItemsFiltered"
            :validation="$v.formData.session.solution.access"
            :disabled="!solution || !solution.length"
            dark
            @input="checkSolutionTypeAccess"
          />
        </template>

        <template v-if="isEditing && sessionSelected">
          <p class="form-item-description text-color">{{ $t('community.sessions.add:linked.information') }}</p>
          <div class="session-offering-detail text-color">
            <span class="session-offering-detail-item text-color">
              {{ $t('community.sessions.add:session.type') }}
              <b>
                {{
                  sessionSelected.type
                    ? $t(`offerings.sessions.edit:session.${sessionSelected.type}.name`)
                    : '-'
                }}
              </b>
            </span>
            <span class="session-offering-detail-item text-color">
              {{ $t('community.sessions.add:solutions') }}
              <b><br /><span v-html="parseSolutions(sessionSelected.solutions)"></span></b>
            </span>
          </div>
          <AutocompleteCategories
            v-model="formData.session.categories"
            :floating-label="true"
            :label="$tc('global:category', 2)"
            dark
          />
          <p class="form-item-description text-color">
            {{ $t('community.sessions.add:session.information') }}
          </p>
        </template>

        <InputField
          v-model="formData.session.name"
          :disabled="!canWrite('sessions')"
          :label="$t('community.sessions.add:session.name')"
          :validation="$v.formData.session.name"
          :counter="150"
          dark
        />

        <InputField
          v-if="$isEnabledFeature('slug_identity')"
          v-model="formData.session.slug"
          :validation="$v.formData.session.slug"
          :label="$t('global:slug.identity')"
          :counter="100"
          :disabled="!canWrite('courses')"
          dark
          @input="(val) => (formData.session.slug = formData.session.slug.toUpperCase())"
        />

        <FormSection
          v-if="showSessionDeadline"
          class="session-deadline"
          :title="$t('community.sessions.add:completion.deadline')"
        >
          <p
            class="form-item-description text-color"
            v-html="$t('community.sessions.add:completion.deadline.description')"
          />
          <div
            class="form-group clearfix"
            data-cols="2"
            data-gap="40"
          >
            <InputField
              v-model="formData.session.duration.number"
              type="number"
              :label="$t('global:solution.duration')"
              :min="1"
              :max="2000"
              :maxlength="5"
              :validation="$v.formData.session.duration.number"
              dark
            />
            <SelectField
              v-model="formData.session.duration.type"
              :items="durationTypeList"
              :label="$t('global:form.type')"
              :validation="$v.formData.session.duration.type"
              :allow-clear="false"
              dark
            />
          </div>
        </FormSection>

        <FormSection
          v-if="showStartDate"
          :title="$t('community.sessions.add:offering.date')"
        >
          <div
            class="form-group clearfix"
            data-cols="2"
            data-gap="40"
          >
            <Datepicker
              v-model="formData.session.start_time"
              :data-testid="$testId('session--start-time')"
              :label="$t('global:form.start')"
              :max="formData.session.end_time"
              :validation="$v.formData.session.start_time"
              :disabled="!isSessionOpen || !canWrite('sessions')"
              dark
              @input="openDateChangeModalConfirm('initial', formData.session.start_time)"
            />
            <Datepicker
              v-if="showEndDate"
              v-model="formData.session.end_time"
              :data-testid="$testId('session--end-time')"
              :label="$t('global:form.closure')"
              :min="formData.session.start_time"
              :validation="$v.formData.session.end_time"
              :disabled="
                formData.session.start_time == null || !isSessionOpen || !canWrite('sessions')
              "
              dark
              @input="openDateChangeModalConfirm('final', formData.session.end_time)"
            />
          </div>

          <template v-if="isEditing && showExtendedDate">
            <div
              class="form-group clearfix fix-align"
              data-cols="2"
              data-gap="40"
            >
              <Checkbox
                v-model="extendedDateActive"
                :data-testid="$testId('session--enable-extended-time')"
                :disabled="!allowsExtension"
                :items="[
                  { value: true, label: $t('community.sessions.add:session.extend_closure') },
                ]"
                dark
                switch-type
              />
              <Datepicker
                :key="formData.session.end_time"
                v-model="formData.session.extended_time"
                :data-testid="$testId('session--extended-time')"
                :label="$t('community.sessions.add:session.closure_extended')"
                :validation="$v.formData.session.extended_time"
                :disabled="!extendedDateActive || !allowsExtension"
                :min="minExtendedDay"
                dark
              >
                <template #right-float>
                  <Tips
                    :dark="false"
                    margin-top="10px"
                    small-font
                    arrow
                  >
                    <template #tip>
                      <p class="text-color"
                        v-html="
                          $t('community.sessions.add:session.closure_extended.max.tip', {
                            days: extensionLimitDays,
                          })
                        "
                      ></p>
                    </template>
                  </Tips>
                </template>
              </Datepicker>
            </div>
          </template>
        </FormSection>

        <PeriodSelector
          v-if="hasOffering"
          v-model="formData.session"
          :validation="$v.formData.session"
          dark
        />

        <FormSection
          :title="$t('community.sessions.add:offering.vacancy.title')"
          dark
        >
          <div
            class="flex flex-column"
            data-cols="2"
          >
            <Radio
              v-model="formData.session.vacancyType"
              :items="vacancyTypes"
              :disabled="!canWrite('sessions')"
              horizontal
              dark
            />
            <InputField
              v-model="formData.session.vacancy"
              :label="$t('global:form.number.vacancies')"
              type="number"
              :min="1"
              :validation="$v.formData.session.vacancy"
              :disabled="formData.session.vacancyType === 'unlimited' || !canWrite('sessions')"
              dark
            />
          </div>
        </FormSection>

        <FormSection>
          <div
            v-if="
              $isEnabledFeature('auto_create_session') &&
              formData.session.solution.access === 'closed' &&
              formData.session.vacancyType === 'limited'
            "
            class="checkbox__helper"
          >
            <Checkbox
              v-model="formData.session.auto_generate"
              :items="[
                { value: true, label: $t('community.sessions.add:modal.add.auto.create.label') },
              ]"
              dark
              switch-type
              class="mb-5"
            />

            <HelperCloud
              class="ml-1"
              dark
            >
              <ul v-html="$t('community.sessions.add:modal.add.auto.create.helper')"></ul>
            </HelperCloud>
          </div>

          <Radio
            v-if="formData.session.auto_generate"
            v-model="formData.session.auto_generate_type"
            :items="autoGenerateOptions"
            :validation="$v.formData.session.auto_generate_type"
            class="ml-5"
            dark
          />

          <Checkbox
            v-model="formData.session.reenrollment_allowed"
            :disabled="disabledResponsible"
            :items="[{ value: true, label: $t('community.sessions.add:modal.add.reenroll.label') }]"
            dark
            switch-type
          />

          <SelectField
            v-if="formData.session.reenrollment_allowed"
            v-model="formData.session.status_allowed_reenrollment"
            :items="allowedReenrollmentStatus"
            :label="$t('community.sessions.add:modal.add.final.status.label')"
            :validation="$v.formData.session.duration.type"
            :allow-clear="false"
            multiple
            dark
          />
        </FormSection>

        <FormSection
          v-if="canWrite('sessions')"
          class="bg-black-100 border-round-xl p-4"
          :title="$t('offerings.sessions.edit:form.section.agent.title')"
          dark
        >
          <div class="flex align-items-center gap-2">
            <Autocomplete
              v-model="member.user"
              append-icon="search"
              async
              :label="$t('global:form.name')"
              :items="autocompleteItems"
              :loading="autocompleteLoading"
              :validation="$v.member.user"
              :disabled="disabledResponsible"
              option-property="name"
              dark
              @search="getUsersList($event)"
              @input.capture="selectUser($event)"
            />
            <SelectField
              v-model="member.profile_id"
              :label="$tc('global:form.profile', 1)"
              :disabled="disabledResponsible"
              :items="searchedProfiles"
              :loading="loadingProfiles"
              :validation="$v.member.profile_id"
              dark
              @input="getProfileName"
            />
            <Action
              slot="button"
              class="modal-add-session__button-submit-responsible"
              type="button"
              icon-size="small"
              icon="add"
              :text="$t('offerings.sessions.edit:session.team.submit')"
              primary
              @click="addMember"
            />
          </div>

          <DatatableTeam
            ref="dataTableTeam"
            :dark="true"
            :team="formData.session.team"
            :validation="$v.formData.session.team"
            :custom-item-identifier="hasOffering ? 'uuid' : 'uniqueId'"
            @remove="removeMember"
            @switch="onSwitchMember"
          />
        </FormSection>

        <SendMessagesToAdmins
          v-model="formData.session"
          :mode-dark="true"
        />

        <template v-if="Sessions.current && !hasOffering">
          <div
            v-if="$isEnabledFeature('session_block')"
            class="form-section bg-black-300 border-round-xl p-4 schedule-block"
          >
            <div class="optional">
              <h3 class="form-section-title text-color">
                {{ $t('community.sessions.add:session.block.label') }}
              </h3>
              <Checkbox
                v-model="hasBlock"
                :items="[{ value: true, label: '' }]"
                dark
                switch-type
                @change="toggleScheduleBlock"
              />
            </div>
            <p class="form-section-hint">
              {{ $t('community.sessions.add:session.block.hint') }}
            </p>
            <DateFrequencyField
              v-if="hasBlock"
              ref="datefrequencefield"
              v-model="currentScheduleBlock"
            />
            <Action
              v-if="hasBlock"
              class="schedule-block__add text-secondary-900"
              type="button"
              :text="$t('community.sessions.add:modal.add.schedule.block')"
              flat
              @click="addScheduleBlock"
            />
          </div>

          <DatatableScheduleBlocks
            :title="$t('schedule.block:datatable.added.blocks')"
            :items="formData.session.schedule_block"
            @remove="removeScheduleBlock"
          />

          <div class="form-section bg-black-300 border-round-xl p-4 schedule-allowed">
            <div class="optional">
              <h3 class="form-section-title text-color">
                {{ $t('community.sessions.add:session.allowance.label') }}
              </h3>
              <Checkbox
                v-model="hasAllowance"
                :items="[{ value: true, label: '' }]"
                dark
                switch-type
                @change="toggleScheduleAllowance"
              />
            </div>
            <p class="form-section-hint">
              {{ $t('community.sessions.add:session.allowance.hint') }}
            </p>
            <DateFrequencyField
              v-if="hasAllowance"
              ref="datefrequencefieldallowed"
              v-model="currentScheduleAllowed"
            />
            <Action
              v-if="hasAllowance"
              class="schedule-allowed__add text-secondary-900"
              type="button"
              :text="$t('community.sessions.add:modal.add.schedule.allowance')"
              flat
              @click="addScheduleAllowance"
            />
          </div>

          <DatatableScheduleBlocks
            :title="$t('schedule.block:datatable.added.allowances')"
            :items="formData.session.schedule_grant_access"
            @remove="removeScheduleAllowance"
          />
        </template>

        <div class="form-submit text-center">
          <Action
            v-if="canWrite('sessions')"
            :text="formData.session.session_id ? $t('global:save') : $t('global:form.save')"
            type="button"
            secondary
            large
            submit
            fixed-width
          />
        </div>
      </form>
    </div>

    <Modal
      :active.sync="modalDateChangeConfirmActive"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          class="btn-close"
          icon="close"
          icon-size="medium"
          type="button"
          @click="closeDateChangeModalConfirm"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{ $t('community.sessions:modal.confirm.datechange.title') }}
          </h3>
          <div class="modal-confirm-description">
            <p class="text-color">
              {{ $t('community.sessions:modal.confirm.datechange.description') }}
            </p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            :dark="accessibility"
            :text="$t('global:confirm')"
            flat
            type="button"
            @click="confirmDateChange()"
          />
          <Action
            :dark="accessibility"
            :text="$t('global:cancel')"
            class="btn-cancel"
            flat
            type="button"
            @click="cancelDateChange()"
          />
        </div>
      </div>
    </Modal>

    <Modal
      :active.sync="modalDurationChangeConfirmActive"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          class="btn-close"
          icon="close"
          icon-size="medium"
          type="button"
          @click="cancelDurationChange()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{ $t('community.sessions:modal.confirm.durationchange.title') }}
          </h3>
          <div class="modal-confirm-description">
            <p class="text-color">
              {{ $t('community.sessions:modal.confirm.durationchange.description') }}
            </p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            :dark="accessibility"
            :text="$t('global:confirm')"
            flat
            type="button"
            @click="submitUpdate()"
          />
          <Action
            :dark="accessibility"
            :text="$t('global:cancel')"
            class="btn-cancel"
            flat
            type="button"
            @click="cancelDurationChange()"
          />
        </div>
      </div>
    </Modal>

    <ModalConfirm
      :active="modalChangeExtendedDate"
      :title="$t('community.sessions:modal.extended.date.title')"
      @close="modalChangeExtendedDate = false"
      @confirm="submit"
    >
      <p v-html="$t('community.sessions:modal.extended.date.description')"></p>
    </ModalConfirm>
  </Modal>
</template>

<style lang="scss">
@import 'ModalAddSession.scss';
</style>
