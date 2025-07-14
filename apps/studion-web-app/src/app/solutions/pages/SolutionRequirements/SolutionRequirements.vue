<script>
import i18n from '@/support/i18n'
import { mapActions, mapState } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { genericModalConfirmMixin } from '@/mixins/genericModalConfirmMixin'
import { sortCriteria, mapAccessOptions, mapEnrollOption, mapCertificateOptions } from './utils'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import Pagination from '@/components/general/Pagination'

import pageMixin from '../../mixins/pageMixin'

const Modal = () => import('@/components/general/Modal')
const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'SolutionFormRequirements',
  components: {
    Action,
    ActionBar,
    Checkbox,
    ContentHeader,
    InputField,
    Modal,
    ModalConfirm,
    Pagination,
    SelectField,
  },
  mixins: [genericModalConfirmMixin, pageMixin],
  data() {
    return {
      isActive: false,
      isSubmit: false,
      modalConfirm: false,
      enrollOptions: [],
      accessOptions: [],
      certificateOptions: [],
      oldFormData: {},
      finalStatus: {},
      formData: {
        enrollOptions: [],
        accessOptions: [],
        certificateOptions: [],
        onboarding_days: null,
        status_access_not_allowed: [],
        certificateOptionsWarning: [
          i18n.t('solutions.create.requirements:user.ignore.rules.conclusion.warning'),
        ],
      },
      sessionAvailability: null,
      backUrl: { name: 'solutions.index' },
      themeDark: true,
      lastOptionsInteract: {
        lastType: null,
        certificate: null,
        access: null,
        enroll: null,
      },
      hideConclusionRules: [
        'user_mandatory_100',
        'user_minimal_grade',
        'user_mandatory_participation_forum',
        'user_mandatory_consume_conference',
      ],
      hideAccessRules: ['offerings_is_accessibly', 'session_is_availability'],
    }
  },
  validations: {
    formData: {
      accessOptions: {
        required,
      },
      enrollOptions: {
        required,
      },
      onboarding_days: {
        required: requiredIf(function () {
          let accessOption = this.accessOptions.find((item) => item.alias === 'is_ambience_period')
          if (!accessOption || !accessOption.value) {
            return false
          }
          return this.formData.accessOptions.includes(accessOption.value.toString())
        }),
      },
      status_access_not_allowed: {
        required: requiredIf(function () {
          let statusAccessNotAllowed = this.accessOptions.find(
            (item) => item.alias === 'user_not_access_course_in_final_status'
          )
          if (!statusAccessNotAllowed || !statusAccessNotAllowed.value) {
            return false
          }
          return this.formData.accessOptions.includes(statusAccessNotAllowed.value.toString())
        }),
      },
    },
  },
  computed: {
    ...mapState(['accessibility', 'Courses', 'isSavingBlocked']),
    isEditing() {
      return this.$route.params.id || false
    },
    genericConfirmModalTitle() {
      return i18n.t(`solutions.create.requirements:modal.confirm.edit.title`)
    },
    genericConfirmModalDescription() {
      let description = 'solutions.create.requirements:modal.confirm.edit.description'

      if (
        this.lastOptionsInteract.lastType === 'certificate' &&
        this.lastOptionsInteractInfo.certificate.criteria ===
          'user.isOnlyUpdateStatusOnEndSession()'
      ) {
        description =
          'solutions.create.requirements.conclusion.enrollment:modal.confirm.edit.description'
      }

      return i18n.t(description)
    },

    lastOptionsInteractInfo() {
      const typeOptions = ['certificate', 'enroll', 'access']
      const info = { certificate: null, enroll: null, access: null }

      typeOptions.forEach((type) => {
        if (this.lastOptionsInteract && this.lastOptionsInteract[type]) {
          info[type] =
            this.lastOptionsInteract && this.lastOptionsInteract[type]
              ? this.certificateOptions.find(
                  (i) => i.value === parseInt(this.lastOptionsInteract[type].value)
                )
              : null
        }
      })

      return info
    },

    getCurrentCourseTypeAlias() {
      const currentCourse = this.Courses && this.Courses.current
      return currentCourse && currentCourse.type && currentCourse.type.alias
    },

    isCurrentCourseHybrid() {
      return this.getCurrentCourseTypeAlias && this.getCurrentCourseTypeAlias === 'hybrid'
    },

    statusAccessNotAllowedOptions() {
      const courseType = this.Courses.current.type.alias
      const hasModalitySelected = courseType !== null
      const items =
        hasModalitySelected &&
        this.finalStatus &&
        Object.keys(this.finalStatus).length &&
        this.finalStatus[courseType]
      return items || []
    },
  },
  watch: {
    'formData.enrollOptions': {
      deep: true,
      handler(newVal, oldVal) {
        if (this.isEditing && this.isActive) {
          this.showGenericConfirmModal(newVal, oldVal, 'formData.enrollOptions')
        }
      },
    },
    'formData.accessOptions': {
      deep: true,
      handler(newVal, oldVal) {
        if (this.isEditing && this.isActive && !this.isSubmit) {
          this.showGenericConfirmModal(newVal, oldVal, 'formData.accessOptions')
        }
      },
    },
    'formData.certificateOptions': {
      deep: true,
      handler(newVal, oldVal) {
        if (this.isEditing && this.isActive) {
          this.showGenericConfirmModal(newVal, oldVal, 'formData.certificateOptions')
        }
      },
    },
  },
  mounted() {
    this.$emit('fixed-header', true)
    this.$emit('change-theme-footer', { dark: this.themeDark })
  },
  destroyed() {
    this.$emit('fixed-header', false)
    this.$emit('change-theme-footer', { dark: false })
  },
  created() {
    let notDarkFlag = getComputedStyle(document.body).getPropertyValue('--light-generic-background')
    this.themeDark = notDarkFlag && !(notDarkFlag === '1')
    const courseId = parseInt(this.$route.params.id)

    this.setFetching(true)
    Promise.all([
      this.attemptConditionsRetrieval(),
      this.attemptCourseRetrieval({ courseId }),
      this.attemptTypesRetrieval(),
    ])
      .then(
        ([
          { accessConditions, enrollmentConditions, conclusionConditions },
          { data },
          typesResponse,
        ]) => {
          this.accessOptions = (accessConditions || [])
            .filter(({ id, alias }) => {
              if (alias === 'session_is_availability') this.sessionAvailability = id
              return !this.hideAccessRules.includes(alias)
            })
            .map(mapAccessOptions(this.isCurrentCourseHybrid))
            .sort(sortCriteria)

          this.enrollOptions = (enrollmentConditions || []).map(mapEnrollOption).sort(sortCriteria)

          this.certificateOptions = (conclusionConditions || [])
            .filter(({ alias }) => !this.hideConclusionRules.includes(alias))
            .map(mapCertificateOptions)
            .sort(sortCriteria)

          if (data.rules.length) {
            data.rules
              .find((item) => item.type.alias === 'access')
              .conditions.map(({ id }) => this.formData.accessOptions.push(id.toString()))

            data.rules
              .find((item) => item.type.alias === 'enrollment')
              .conditions.map(({ id }) => this.formData.enrollOptions.push(id.toString()))

            data.rules
              .find((item) => item.type.alias === 'conclusion')
              .conditions.map(({ id }) => this.formData.certificateOptions.push(id.toString()))
          }

          this.finalStatus = typesResponse.data.reduce((accumulator, actual) => {
            accumulator[actual.alias] = actual.status
              .filter(({ type }) => type.alias === 'final')
              .map(({ alias }) => ({
                text: this.$t(`global:solution.status.${alias}`),
                value: alias,
              }))
            return accumulator
          }, {})

          this.isActive = data.active
          this.formData.onboarding_days = data.onboardingDays

          data.statusAccessNotAllowed &&
            data.statusAccessNotAllowed.map((status) => {
              this.formData.status_access_not_allowed.push(
                this.statusAccessNotAllowedOptions.find((s) => {
                  return s.value === status.status_alias
                }).value
              )
            })

          this.oldFormData = this.deepClone(this.formData)
          this.setFetching(false)
        }
      )
      .finally(() => {
        this.setFetching(false)
      })
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'setIsSavingBlocked',
      'attemptConditionsRetrieval',
      'attemptCourseRetrieval',
      'attemptCourseCustomRuleCreation',
      'attemptCourseUpdate',
      'attemptTypesRetrieval',
    ]),

    submit(pushRoute = true, toPage = null) {
      const courseId = parseInt(this.$route.params.id)

      if (this.$isEnabledFeature('course_metas') && this.isSavingBlocked) {
        this.setFeedback({
          message: this.$t('solutions.list:update.metadata:error'),
          type: 'error',
        })
        this.$router.push({ name: 'solutions.metadata.register', params: { id: courseId } })

        return
      }

      const sessionAvailability = this.sessionAvailability.toString()
      const accessOptionsFiltered = this.formData.accessOptions.filter(
        (i) => i.toString() !== sessionAvailability
      )
      this.formData.accessOptions = accessOptionsFiltered

      this.$v.formData.$touch()
      if (this.$v.formData.$invalid || accessOptionsFiltered.length === 0) {
        return
      }

      if (sessionAvailability && !this.formData.accessOptions.includes(sessionAvailability)) {
        this.formData.accessOptions.push(sessionAvailability)
      }

      const courseType = this.getCurrentCourseTypeAlias

      const { enrollOptions, accessOptions, certificateOptions } = this.formData

      const ruleCreationAttempts = [
        this.attemptCourseCustomRuleCreation({
          courseId,
          courseType,
          ruleType: 'access',
          conditionsIds: accessOptions,
        }),
        this.attemptCourseCustomRuleCreation({
          courseId,
          courseType,
          ruleType: 'enrollment',
          conditionsIds: enrollOptions,
        }),
        this.attemptCourseCustomRuleCreation({
          courseId,
          courseType,
          ruleType: 'conclusion',
          conditionsIds: certificateOptions,
        }),
      ]

      this.isSubmit = true

      this.setFetching(true)

      Promise.all(ruleCreationAttempts)
        .then(([accessRuleId, enrollmentRuleId, conclusionRuleId]) => {
          let accessOption = this.accessOptions.find((item) => item.alias === 'is_ambience_period')
          let hasOnboardingRule =
            !accessOption || !accessOption.value
              ? false
              : this.formData.accessOptions.includes(accessOption.value.toString())
          const courseData = {
            active: true,
            rules: [accessRuleId, enrollmentRuleId, conclusionRuleId],
            onboarding_days: hasOnboardingRule ? this.formData.onboarding_days : null,
            status_access_not_allowed: this.formData.status_access_not_allowed,
          }

          this.setFetching(true)

          this.attemptCourseUpdate({ courseId, data: courseData })
            .then(() => {
              this.isActive = true

              if (toPage) {
                this.$_goToPage(toPage)
              } else if (pushRoute) {
                this.submitSolutionFeedback('success')
                this.$router.push({ name: 'solutions.index' })
              }
            })
            .catch(() => {
              this.submitSolutionFeedback('error')
            })
            .finally(() => {
              this.setIsSavingBlocked(false)
              this.setFetching(false)
            })
        })
        .catch(() => {
          this.submitSolutionFeedback('error')
        })
        .finally(() => {
          this.setFetching(false)
          this.isSubmit = false
        })
    },
    submitSolutionFeedback(value, type) {
      const feedback = {
        message: this.isActive
          ? i18n.t(`solutions.list:update.${value}`)
          : i18n.t(`solutions.list:create.${value}`),
      }

      if (value === 'error' || type === 'error') {
        feedback.type = 'error'
      }

      this.setFeedback(feedback)
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
      this.modalConfirm = false
      this.submit(true)
    },
    setLastCertificateOptions(type, data) {
      this.lastOptionsInteract.lastType = type
      this.lastOptionsInteract[type] = data
    },
  },
}
</script>

<template>
  <div class="solutions-create step-04">
    <content-header
      :title="isEditing ? Courses.current.name : $t('solutions.create:header.title')"
      light-theme
      fixed
    >
      <action
        slot="back"
        type="button"
        :text="$t('global:back.solutions')"
        class="btn-back text-color"
        icon="keyboard_backspace"
        @click="openModalConfirm()"
      />
      <action-bar
        slot="actionbar"
        profile
      />
      <template slot="buttons">
        <action
          v-if="canWrite('courses')"
          :text="$t('global:form.save')"
          flat
          type="button"
          @click="submit(false)"
        />
      </template>
    </content-header>
    <div
      class="mt-4 bg-black-50"
      :class="{ 'theme-dark': themeDark }"
    >
      <div class="center">
        <div class="solutions-create-header">
          <h2 class="solutions-create-title text-color">
            {{ $t('global:form.step', { num: getActivePage(4) }) }}
          </h2>
          <p class="solutions-create-description text-color">
            {{ $t('solutions.create.requirements:header.description') }}
          </p>
        </div>
        <form @submit.prevent="submit">
          <div class="flex flex-column gap-1">
            <checkbox
              v-model="formData.enrollOptions"
              :description="$t('solutions.create.requirements:enroll')"
              :items="enrollOptions"
              :dark="themeDark"
              :disabled="!canWrite('courses')"
              :validation="$v.formData.enrollOptions"
              class-description="font-bold"
              force-array
              switch-type
              @change="(data) => setLastCertificateOptions('enroll', data)"
            >
              <template #additional-fields="{ item }">
                <p
                  v-if="$te(`solutions.create.requirements.help:${item.item.alias}`)"
                  class="form-checkbox-warning ml-6 text-black-500 font-italic py-1"
                >
                  {{ $t(`solutions.create.requirements.help:${item.item.alias}`) }}
                </p>
              </template>
            </checkbox>
            <checkbox
              v-model="formData.accessOptions"
              :description="$t('solutions.create.requirements:access')"
              :items="accessOptions"
              :dark="themeDark"
              :disabled="!canWrite('courses')"
              :validation="$v.formData.accessOptions"
              class-description="font-bold"
              force-array
              switch-type
              @change="(data) => setLastCertificateOptions('access', data)"
            >
              <template
                v-if="
                  (data.item.item.label ===
                    $t('solutions.create.requirements:is.ambience.period') &&
                    data.item.value) ||
                  $te(`solutions.create.requirements.help:${data.item.item.alias}`)
                "
                slot="additional-fields"
                slot-scope="data"
              >
                <p
                  v-if="$te(`solutions.create.requirements.help:${data.item.item.alias}`)"
                  class="form-checkbox-warning ml-6 text-black-500 font-italic py-1"
                >
                  {{ $t(`solutions.create.requirements.help:${data.item.item.alias}`) }}
                </p>
                <div class="w-4">
                  <input-field
                    v-if="
                      data.item.value &&
                      data.item.item.label === $t('solutions.create.requirements:is.ambience.period')
                    "
                    v-model="formData.onboarding_days"
                    class="my-2"
                    type="number"
                    :min="1"
                    :label="$t('global:solution.duration')"
                    :disabled="!canWrite('courses')"
                    :validation="$v.formData.onboarding_days"
                  />
                  <SelectField
                    v-if="
                      data.item.value &&
                      data.item.item.label ===
                        $t('solutions.create.requirements:user.not.access.course.in.final.status')
                    "
                    v-model="formData.status_access_not_allowed"
                    :label="$t('global:status')"
                    class="my-2"
                    :items="statusAccessNotAllowedOptions"
                    :validation="$v.formData.status_access_not_allowed"
                    multiple
                  />
                </div>
              </template>
            </checkbox>
            <checkbox
              v-model="formData.certificateOptions"
              :description="$t('solutions.create.requirements:certificate')"
              :items="certificateOptions"
              :items-warning="formData.certificateOptionsWarning"
              :dark="themeDark"
              :disabled="!canWrite('courses')"
              :validation="$v.formData.certificateOptions"
              class-description="font-bold"
              class-warn="text-black-500 font-italic ml-6"
              force-array
              switch-type
              @change="(data) => setLastCertificateOptions('certificate', data)"
            >
              <template #additional-fields="{ item }">
                <p
                  v-if="$te(`solutions.create.requirements.help:${item.item.alias}`)"
                  class="form-checkbox-warning ml-6 text-black-500 font-italic py-1"
                >
                  {{ $t(`solutions.create.requirements.help:${item.item.alias}`) }}
                </p>
              </template>
            </checkbox>
          </div>
        </form>

        <Pagination
          v-if="pageCount"
          class-wrapper="mx-auto my-8"
          :active-first-last="false"
          :active-page="getActivePage(4)"
          :dark="themeDark"
          :page-count="pageCount"
          float
          disable-items-per-page
          disable-manual-page
          block-layout
          show-all-pages
          custom-next
          :custom-next-text="$t('solutions.create:form.submit')"
          :disable-custom-next="!canWrite('courses')"
          @next-page="submit(true)"
          @previous-page="submit(false, getActivePage(4) - 1)"
          @go-to-page="($e) => submit(false, $e)"
        />
      </div>
    </div>

    <modal
      :active="modalConfirm"
      :cancel="false"
    >
      <div class="modal-confirm">
        <action
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
          <action
            v-if="isEditing && !isDeeplyEqual(formData, oldFormData)"
            type="button"
            :text="$t('global:save.leave')"
            flat
            :dark="accessibility"
            @click="save()"
          />
          <action
            type="button"
            :text="$t('global:leave')"
            flat
            :dark="accessibility"
            @click="leave()"
          />
          <action
            type="button"
            :text="$t('global:cancel')"
            flat
            :dark="accessibility"
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </modal>

    <modal-confirm
      :active="genericConfirmModalData.isActiveModal"
      :title="genericConfirmModalTitle"
      :cancel-btn-text="$t('global:not.now')"
      :confirm-btn-text="$t('global:yes')"
      @confirm="confirmDataChange"
      @close="cancelDataChange"
    >
      <slot name="description">
        <p v-html="genericConfirmModalDescription"></p>
      </slot>
    </modal-confirm>
  </div>
</template>

<style lang="scss">
@import '~@/app/solutions/styles.scss';
</style>
