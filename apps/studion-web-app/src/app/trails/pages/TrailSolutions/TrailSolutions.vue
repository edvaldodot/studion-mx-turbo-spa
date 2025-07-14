<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import * as TYPES from '@/domains/trails/vuex/mutation-types'

import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'
import Action from '@/components/general/Action'
import Draggable from '@/components/general/Draggable'
import DraggableItem from '@/components/general/DraggableItem'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import Loading from '@/components/general/Loading'
import SelectField from '@/components/general/SelectField'
import Pagination from '@/components/general/Pagination'
import ModalDialog from '@/components/general/ModalDialog'
import ModalConfirm from '@/components/general/ModalConfirm'
import ModalInformation from '@/components/general/ModalInformation'
import TooltipSlot from '@/components/general/TooltipSlot'

import ModalSessionAllowance from './components/ModalSessionAllowance'

export default defineComponent({
  name: 'TrailSolutions',

  components: {
    ContentHeader,
    ActionBar,
    Action,
    ModalDialog,
    ModalConfirm,
    Draggable,
    DraggableItem,
    Dropdown,
    DropdownLink,
    Icon,
    Loading,
    SelectField,
    Pagination,
    ModalSessionAllowance,
    ModalInformation,
    TooltipSlot,
  },

  beforeRouteLeave(to, from, next) {
    this.leaveRouteName = to.name

    if (this.isReadOnly || this.allowLeave) {
      this.$store.commit(TYPES.RESET_CURRENT)
      next()
      return
    }

    if (this.isSolutionsDirty) {
      this.modalLeaveConfirm = true
      return
    }

    this.$store.commit(TYPES.RESET_CURRENT)
    next()
  },

  data() {
    return {
      drag: false,
      backUrl: { name: 'trails.list' },
      modalLeaveConfirm: false,
      modalLeave: false,
      selectSolutionsOptions: [],
      allowLeave: false,
      leaveModalTitle: this.$t('trails.create:modal.confirm.title'),
      leaveRouteName: 'trails.list',
      modalAddSolutionConfirm: false,
      modalRemoveSolutionConfirm: false,
      selectedSolution: null,
      watchedSolutions: [],
      oldSolutions: null,
      modalPrerequisiteSolutionConfirm: false,
      modalOrderSolutionConfirm: false,
      modalUpdateConclusionRulesConfirm: false,
      solutionsSubmitted: 0,
      submitAction: () => {},
      showSessionModalAllowance: null,
      showStatusModal: {
        status: null,
        id: null,
      },
      debounceStatusInterval: null,
    }
  },

  computed: {
    ...mapState({
      fetching: 'fetching',
      accessibility: 'accessibility',
      trail: (state) => state.Trails.current,
      solutions: (state) => state.Trails.current.solutions,
      isSolutionsDirty: (state) => state.Trails.current.solutionsChanged,
    }),
    hasProcessingSolutions() {
      return this.watchedSolutions.find((solution) => {
        if (solution.meta) {
          return solution.meta.import_status === 'waiting'
        }
      })
    },
    trailId() {
      return this.$route.params.id
    },
    isEditing() {
      return this.trailId || false
    },
    canWriteTrails() {
      return this.canWrite('trails') && this.notEqualsProfile('student')
    },
    isEditingPublished() {
      return this.isEditing && this.trail.isPublished
    },
    isReadOnly() {
      return !this.canWriteTrails
    },
    dragOptions() {
      return {
        animation: 300,
        group: 'solutions',
        disabled: false,
        ghostClass: 'ghost',
        handle: '.handle',
      }
    },
    modalOrderAndPrerequisiteTitle() {
      if (!this.modalPrerequisiteSolutionConfirm && !this.modalOrderSolutionConfirm) return ''
      return this.modalOrderSolutionConfirm
        ? this.$t('trails.create:modal.edit.solutions.order.confirm.title')
        : this.$t('trails.create:modal.edit.solutions.prerequisite.confirm.title')
    },
    modalOrderAndPrerequisiteDescription() {
      if (!this.modalPrerequisiteSolutionConfirm && !this.modalOrderSolutionConfirm) return ''
      return this.modalOrderSolutionConfirm
        ? this.$t('trails.create:modal.edit.solutions.order.confirm.description')
        : this.$t('trails.create:modal.edit.solutions.prerequisite.confirm.description')
    },
    hasCertificateEnabled() {
      return !!(
        this.$isEnabledFeature('certificate_paths') &&
        this.trail.certificate &&
        this.trail.certificate.id
      )
    },
    allSolutionsHasSameConclusionRules() {
      const courses = this.solutions
      const withRules = courses.filter((course) => course.conclusion_enrollment_condition)
      return withRules.length === courses.length || withRules.length === 0
    },
    isPublishPossible() {
      return !this.isEditingPublished && this.canWriteTrails && this.solutions.length ? true : false
    },
  },

  watch: {
    watchedSolutions: {
      deep: true,
      handler(newVal, oldVal) {
        if (
          newVal.length !== oldVal.length ||
          !oldVal.length ||
          this.modalPrerequisiteSolutionConfirm ||
          this.modalOrderSolutionConfirm
        ) {
          return
        }

        if (this.hasChangedOrder(newVal, oldVal)) {
          this.modalOrderSolutionConfirm = true
          this.oldSolutions = this.deepClone(oldVal)
        } else if (this.hasChangedPrerequisite(newVal, oldVal)) {
          this.modalPrerequisiteSolutionConfirm = true
          this.oldSolutions = this.deepClone(oldVal)
        }
      },
    },
    solutions: {
      deep: true,
      handler(newSolutions) {
        if (this.isEditingPublished) {
          this.watchedSolutions = this.deepClone(newSolutions)
        }
        this.createSelectOptions()
      },
    },
  },

  created() {
    this.setup()
    this.debounceStatus()
  },

  mounted() {
    this.$emit('fixed-header', true)
  },

  destroyed() {
    this.$emit('fixed-header', false)
  },

  beforeDestroy() {
    if (this.debounceStatusInterval) clearInterval(this.debounceStatusInterval)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'setCurrent',
      'attemptAddTrailSolutions',
      'attemptGetTrailSolutionsStatus',
      'attemptGetTrailErrorSheet',
      'fetchTrailSolutions',
      'addSolutions',
      'removeSolution',
      'remapPrerequisite',
      'moveSolution',
      'publishTrail',
      'clearSolutionsChanged',
      'setSolutions',
    ]),
    hasChangedPrerequisite(newSolutions, oldSolutions) {
      return oldSolutions.some((solution, index) => {
        return solution.prerequisite !== newSolutions[index].prerequisite
      })
    },
    hasChangedOrder(newSolutions, oldSolutions) {
      return oldSolutions.some((solution, index) => {
        return solution.id !== newSolutions[index].id
      })
    },
    setup() {
      this.setCurrent(this.trailId)
      this.fetchTrailSolutions(this.trailId)
    },
    getSolutionNameById(id) {
      const solutionName = this.solutions.find((solution) => solution.course_id === id) || ''
      return solutionName.course_name
    },
    createSelectOptions() {
      this.selectSolutionsOptions = this.solutions.map((s1) => {
        return this.solutions
          .filter((s2) => s2.position < s1.position)
          .map((s3) => ({
            text: this.$t('trails.create.solutions:draggable.prerequisite.text', {
              num: s3.position,
            }),
            value: s3.course_id,
          }))
      })
    },
    leave() {
      this.modalLeaveConfirm = false
      this.allowLeave = true

      if (this.leaveRouteName !== 'trails.list') {
        this.$router.push({ name: this.leaveRouteName })
        return
      }

      this.$router.push(this.backUrl)
    },
    async saveAndLeave(ignoreConclusionRuleStep = false, skipModal = false) {
      if (skipModal) {
        this.modalLeaveConfirm = false
        this.allowLeave = true
      }

      if (!this.verifySolutionRulesIsSame(ignoreConclusionRuleStep)) {
        this.submitAction = () => this.saveAndLeave(true)
        return
      }

      if (this.canWriteTrails)
        await this.submit({ ignoreConclusionRuleStep, reFetchSolutions: false })

      this.leave()
    },
    async publish(ignoreConclusionRuleStep = false) {
      if (!this.verifySolutionRulesIsSame(ignoreConclusionRuleStep)) {
        this.submitAction = () => this.publish(true)
        return
      }

      const result = await this.submit({
        isPublish: true,
        ignoreConclusionRuleStep,
        reFetchSolutions: false,
      })

      if (result && result.response && result.response.data && result.response.data.exception) {
        return
      }

      await this.publishTrail()
      this.leave()
    },
    orderSolutions(event) {
      this.drag = false
      let { direction, oldIndex, newIndex } = event
      if (direction) {
        if (
          (direction === 'up' && oldIndex === 0) ||
          (direction === 'down' && oldIndex === this.solutions.length - 1)
        ) {
          return
        }
        this.moveSolution({ oldIndex, newIndex })
      }
      this.remapPrerequisite()
      this.createSelectOptions()
    },

    /**
     * @typedef {Object} SubmitPayload
     * @property {boolean} isPublish
     * @property {boolean} ignoreConclusionRuleStep
     * @property {boolean} reFetchSolutions
     */

    /**
     * @param {SubmitPayload} payload
     */
    submit(payload = {}, callback) {
      /**
       * @type SubmitPayload
       */
      const {
        isPublish = false,
        ignoreConclusionRuleStep = false,
        reFetchSolutions = true,
      } = payload

      if (!this.verifySolutionRulesIsSame(ignoreConclusionRuleStep)) {
        this.submitAction = () => this.submit({ isPublish, ignoreConclusionRuleStep: true })
        return
      }

      this.modalUpdateConclusionRulesConfirm = false

      const data = {
        trailId: this.trailId,
        solutions: this.solutions,
        isPublish,
      }

      this.solutionsSubmitted = this.solutions.length

      return this.attemptAddTrailSolutions(data)
        .then((data) => {
          if (!reFetchSolutions) return data

          this.setFetching(true)
          this.setFetchTrailSolutionsInterval().finally(() => {
            this.setFetching(false)
            callback && callback()
          })

          return data
        })
        .catch((data) => {
          const { response } = data

          if (response && response.data && response.data.message === 'expired_path') {
            this.setFeedback({ message: this.$t('tails.create:form.expired.trail.error') })
          }

          return data
        })
    },

    /**
     * This method create a promise and interval to handle with trail queue,
     * when API returns the same solution list length intervals is clear end
     * promises is resolved.
     */
    setFetchTrailSolutionsInterval() {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          this.fetchTrailSolutions(this.trailId)
            .then((res) => {
              if (res.data.length === this.solutionsSubmitted) {
                clearInterval(interval)
                resolve()
              }
            })
            .catch(() => {
              clearInterval(interval)
              reject()
            })
        }, 5000)
      })
    },

    evaluateShowAddTrailSolutionsModal() {
      if (this.isEditingPublished) {
        this.showModalAddSolutionConfirm()
        return
      }

      this.showAddTrailSolutionsModal()
    },
    showModalAddSolutionConfirm() {
      this.modalAddSolutionConfirm = true
    },
    hideModalAddSolutionConfirm() {
      this.modalAddSolutionConfirm = false
    },
    showAddTrailSolutionsModal() {
      this.hideModalAddSolutionConfirm()
      this.$router.push({ name: 'trails.create.solutions.add' })
    },
    closeModalSessionAllowance() {
      this.showSessionModalAllowance = null
      this.setup()
    },
    takeOutSolution(solutionId, isNew) {
      if (isNew) this.removeSolution(solutionId)
      else {
        this.selectedSolution = solutionId
        this.modalRemoveSolutionConfirm = true
      }
    },
    removeSolutionCancel() {
      this.selectedSolution = null
      this.modalRemoveSolutionConfirm = false
    },
    removeSolutionConfirm() {
      this.removeSolution(this.selectedSolution)
      this.selectedSolution = null
      this.modalRemoveSolutionConfirm = false
    },
    async rollbackSolutions() {
      this.watchedSolutions = this.deepClone(this.oldSolutions)
      await this.setSolutions(this.oldSolutions)
      this.oldSolutions = null
      this.modalPrerequisiteSolutionConfirm = false
      this.modalOrderSolutionConfirm = false
    },
    confirmModalChangeSolutions() {
      this.oldSolutions = null
      this.modalPrerequisiteSolutionConfirm = false
      this.modalOrderSolutionConfirm = false
    },
    verifySolutionRulesIsSame(ignoreConclusionRuleStep = false) {
      if (!ignoreConclusionRuleStep && !this.allSolutionsHasSameConclusionRules) {
        this.modalUpdateConclusionRulesConfirm = true
        return false
      }
      return true
    },
    updateConclusionRuleAndSubmit() {
      this.submitAction()
    },
    openTimelineModal(data) {
      this.$router.push({
        name: 'trails.create.solutions.timeline',
        params: { sessionId: data.session_id },
        query: {
          startTime: this.trail.startTime,
          endTime: this.trail.endTime,
        },
      })
    },
    timelineLabel(enable = true) {
      if (enable) return this.$t('trails.create.solutions.manage:classes.timeline')
      return `${this.$t('trails.create.solutions.manage:classes.timeline')} (${this.$t(
        'global:save.to.enable'
      )})`
    },
    openSessionAllowanceModal(session) {
      this.showSessionModalAllowance = session
    },
    goToPreviousPage() {
      this.leaveRouteName = 'trails.update'
      this.saveAndLeave(false, true)
    },

    getStatus(meta) {
      if (!meta) return
      if (meta.import_status === 'waiting') return 'processing'
      else if (meta.import_status === 'done') return 'finished'
      else if (meta.import_status === 'error') return 'err'
      else return meta.import_status
    },

    debounceStatus() {
      this.debounceStatusInterval = setInterval(() => {
        if (!this.hasProcessingSolutions) return
        this.attemptGetTrailSolutionsStatus(this.trailId).then(({ data }) => {
          this.solutions.forEach((solution) => {
            const newSolutionStatus = data.find(
              (updatedSolution) => updatedSolution.pathcoursesessionid === solution.id
            )
            solution.meta.import_status = newSolutionStatus.import_status
            this.$set(solution, 'meta', solution.meta)
          })
        })
      }, 5000)
    },

    downloadErrorSheet(pathCourseId) {
      this.setFetching(true)
      this.attemptGetTrailErrorSheet(pathCourseId).finally(() => {
        this.setFetching(false)
      })
    },
  },
})
</script>

<template>
  <div class="main-content trails-create step-02">
    <ContentHeader
      :title="isEditing ? trail.name : $t('trails.create:header.title')"
      light-theme
      fixed
    >
      <Action
        slot="back"
        :text="$t('global:back.trails')"
        :data-testid="$testId('action-button--back')"
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
          v-if="isReadOnly"
          :data-testid="$testId('action-button--save')"
          :text="$t('global:form.save')"
          :dark="accessibility"
          type="button"
          flat
          @click="leave()"
        />
        <Action
          v-else
          :data-testid="$testId('action-button--save')"
          :text="$t('global:form.save')"
          :dark="accessibility"
          type="button"
          flat
          @click="submit()"
        />
      </template>
    </ContentHeader>

    <div class="">
      <div class="center mt-4">
        <div class="trails-create-header">
          <h2 class="trails-create-title">{{ $t('global:form.step', { num: 2 }) }}</h2>
          <p class="trails-create-description">
            {{ $t('trails.create.solutions:header.description') }}
          </p>
          <p
            v-if="notEqualsProfile('student')"
            class="helper-text"
          >
            {{ $t('trails.create.solutions:helper.text') }}
          </p>
        </div>

        <div
          v-if="!isReadOnly"
          class="action-btn"
          :class="{ 'text-center': solutions.length === 0 }"
        >
          <Action
            :text="$t('global:solution.btn.add')"
            :data-testid="$testId('action-button--add-solution')"
            type="button"
            primary
            large
            @click="evaluateShowAddTrailSolutionsModal"
          />
        </div>

        <Draggable
          v-if="solutions.length"
          v-bind="dragOptions"
          :disabled="isReadOnly"
          :list="solutions"
          class="mb-8"
          enumerated
          @start="drag = true"
          @end="orderSolutions"
        >
          <template #index="{ index }">
            <div class="w-2rem text-left text-2xl text-color">
              {{ index }}
            </div>
          </template>
          <template slot="headers">
            <th class="th text-left text-base w-2rem">
              {{ $t('trails.create.solutions:draggable.header.1') }}
            </th>
            <th width="1%"></th>
            <th
              class="th text-base"
              :width="$media.mobile ? '60%' : '40%'"
            >
              {{ $t('trails.create.solutions:draggable.header.2') }}
            </th>
            <th
              class="th text-base"
              width="12.5%"
            >
              {{ $t('trails.create.solutions:draggable.header.3') }}
            </th>
            <th
              v-if="!$media.mobile"
              class="th text-base"
              width="10%"
            >
              {{ $t('global:status') }}
            </th>
            <th
              v-if="!$media.mobile"
              class="th text-base"
              width="11%"
            >
              {{ $t('offerings.solutions.edit:datatable.conclusion') }}
            </th>
            <th
              class="th"
              width=""
            ></th>
          </template>

          <TransitionGroup
            :name="!drag ? 'flip-list' : null"
            type="transition"
          >
            <DraggableItem
              v-for="(solution, index) in solutions"
              :key="`solution-${solution.course_id}`"
              :index="index"
              :class="{ 'new-item': solution.isNew && isEditingPublished }"
              @order="orderSolutions"
            >
              <div class="draggable-item-col col-5 pl-3">
                <p class="text-color">
                  {{ solution.course_name }}
                  <TooltipSlot
                    v-if="solution.only_read_branch"
                    :width="460"
                    :arrow="!$media.mobile"
                    class="tooltip__topic"
                    shadow
                  >
                    <template #activator>
                      <Icon
                        class="tip__icon"
                        size="small"
                        name="help"
                        wrapper
                      />
                    </template>

                    <template #content>
                      <p class="tooltip__description">
                        {{ $t('trails.create.solutions.only.read.branch') }}
                      </p>
                    </template>
                  </TooltipSlot>
                </p>
              </div>
              <div class="draggable-item-col col-1">
                <p class="text-center">{{ solution.topics_count }}</p>
              </div>
              <div class="draggable-item-col col-2">
                <p
                  v-if="getStatus(solution.meta)"
                  class="text-center tag"
                  @click="showStatusModal = { status: getStatus(solution.meta), id: solution.id }"
                >
                  <span>{{ $t(`global:${getStatus(solution.meta)}`) }}</span>
                  <Loading v-if="getStatus(solution.meta) === 'processing'" />
                  <Icon
                    v-else-if="getStatus(solution.meta) === 'finished'"
                    class="tag--finished"
                    name="check-all"
                    wrapper
                    size="medium"
                  />
                  <Icon
                    v-else-if="getStatus(solution.meta) === 'err'"
                    class="tag--err"
                    name="close"
                    wrapper
                    size="medium"
                  />
                </p>
              </div>
              <div
                v-if="!$media.mobile"
                class="draggable-item-col col-1"
              >
                <p class="text-color">
                  {{
                    solution.conclusion_enrollment_condition
                      ? $t('global:postponed')
                      : $t('global:normal')
                  }}
                </p>
              </div>
              <div class="draggable-item-col col-2 pr-3">
                <SelectField
                  v-model="solution.prerequisite"
                  :disabled="index === 0 || isReadOnly"
                  :label="$t('trails.create.solutions:draggable.prerequisite.label')"
                  :items="selectSolutionsOptions[index]"
                  :class="{ invisible: index === 0 }"
                />
              </div>
              <Dropdown
                slot="actions"
                icon="dots-vertical"
                right
              >
                <DropdownLink
                  :text="$t('global:remove')"
                  @click="takeOutSolution(solution.course_id, solution.isNew)"
                />
                <DropdownLink
                  v-if="trail.startTime"
                  :disabled="!solution.session_id"
                  :text="timelineLabel(!!solution.session_id)"
                  @click="openTimelineModal(solution)"
                />
                <DropdownLink
                  v-if="solution.session_id"
                  :text="$t('community.sessions.add:session.allowance.label')"
                  @click="openSessionAllowanceModal(solution)"
                />
              </Dropdown>
            </DraggableItem>
          </TransitionGroup>
        </Draggable>

        <Pagination
          class-wrapper="mx-auto my-8"
          :active-first-last="false"
          :active-page="2"
          :custom-next-text="$t(isPublishPossible ? 'global:form.publish' : 'global:save.leave')"
          :page-count="2"
          :prev-page="{
            name: 'trails.update',
            params: { id: trailId },
          }"
          block-layout
          custom-next
          disable-items-per-page
          disable-manual-page
          float
          show-all-pages
          @next-page="isPublishPossible ? publish() : saveAndLeave()"
          @previous-page="goToPreviousPage()"
          @go-to-page="goToPreviousPage()"
        />
      </div>
    </div>

    <ModalConfirm
      :active="modalRemoveSolutionConfirm"
      :title="$t('trails.create:modal.remove.solution.title')"
      @close="removeSolutionCancel()"
      @confirm="removeSolutionConfirm()"
    >
      <p class="modal__uppercase">
        {{ $t('trails.create:modal.confirm.edit.solutions:description.important') }}
      </p>
      <ul>
        <li
          v-html="
            $t('trails.create:modal.confirm.remove.solutions:disclaimer.access', {
              solution: getSolutionNameById(selectedSolution),
            })
          "
        ></li>

        <li>
          {{ $t('trails.create:modal.confirm.edit.solutions:disclaimer.progress') }}
        </li>

        <li v-html="$t('trails.create:modal.confirm.edit.solutions:disclaimer.save')"></li>
      </ul>
    </ModalConfirm>

    <ModalConfirm
      :active="modalAddSolutionConfirm"
      :title="$t('trails.create:modal.add.solution.confirm.title')"
      @close="modalAddSolutionConfirm = false"
      @confirm="showAddTrailSolutionsModal"
    >
      <p class="modal__uppercase">
        {{ $t('trails.create:modal.confirm.edit.solutions:description.important') }}
      </p>
      <ul>
        <li>
          {{ $t('trails.create:modal.confirm.edit.solutions:disclaimer.progress') }}
        </li>

        <li
          v-if="hasCertificateEnabled"
          v-html="$t('trails.create:modal.confirm.edit.solutions:disclaimer.certificate.invalid')"
        ></li>

        <li
          v-if="hasCertificateEnabled"
          v-html="$t('trails.create:modal.confirm.edit.solutions:disclaimer.certificate.reissue')"
        ></li>

        <li v-html="$t('trails.create:modal.confirm.edit.solutions:disclaimer.save')"></li>
      </ul>
    </ModalConfirm>

    <ModalConfirm
      :active="modalOrderSolutionConfirm || modalPrerequisiteSolutionConfirm"
      :title="modalOrderAndPrerequisiteTitle"
      :confirm-btn-text="$t('global:yes')"
      :cancel-btn-text="$t('global:not.now')"
      @close="rollbackSolutions"
      @confirm="confirmModalChangeSolutions"
    >
      <p class="text-color">{{ modalOrderAndPrerequisiteDescription }}</p>
    </ModalConfirm>

    <ModalConfirm
      :active="modalUpdateConclusionRulesConfirm"
      :title="$t('global:attention')"
      @close="modalUpdateConclusionRulesConfirm = false"
      @confirm="updateConclusionRuleAndSubmit()"
    >
      <div class="modal-confirm-description">
        <p class="text-color">
          {{ $t('offerings.publishing:modal.confirm.update.conclusion.rules.description') }}
        </p>
      </div>
    </ModalConfirm>

    <ModalDialog
      :active="modalLeaveConfirm"
      @close="modalLeaveConfirm = false"
    >
      <template #title>{{ leaveModalTitle }}</template>

      <template #description>
        <p class="text-color">{{ $t('trails.create:modal.confirm.message') }}</p>
      </template>

      <template #footer>
        <Action
          v-if="isSolutionsDirty"
          :text="$t('global:save.leave')"
          :dark="accessibility"
          type="button"
          flat
          @click="saveAndLeave()"
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
          @click="modalLeaveConfirm = false"
        />
      </template>
    </ModalDialog>

    <ModalInformation
      v-if="showStatusModal.status"
      class="trails-create step-02 modal--status"
      active
      closable
      back
      @close="showStatusModal = {}"
    >
      <template #title>
        {{ $t(`trails.create:modal.status.title.${showStatusModal.status}`) }}
      </template>
      <template #description>
        <div class="text-center">
          <p class="text-center">
            {{ $t(`trails.create:modal.status.description.${showStatusModal.status}`) }}
          </p>
          <Action
            v-if="showStatusModal.status === 'err'"
            :text="$t('community.sessions:modal.batch.processing.completition.download_sheet')"
            class="mt-5"
            type="button"
            secondary
            large
            @click="downloadErrorSheet(showStatusModal.id)"
          />
        </div>
      </template>
    </ModalInformation>

    <ModalSessionAllowance
      v-if="showSessionModalAllowance"
      :session="showSessionModalAllowance"
      @close="closeModalSessionAllowance"
    />

    <RouterView @addSolutions="addSolutions($event)" />
  </div>
</template>

<style lang="scss">
@import '~@/app/trails/styles.scss';
</style>
