<script>
import { mapState, mapActions } from 'vuex'
import * as TYPES from '@/domains/offerings/vuex/mutations-types'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Draggable from '@/components/general/Draggable'
import DraggableItem from '@/components/general/DraggableItem'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Pagination from '@/components/general/Pagination'
import ModalConfirm from '@/components/general/ModalConfirm'
import SelectField from '@/components/general/SelectField'

import pageMixin from '../../mixins/pageMixin'
import commonsMixin from '../../mixins/commonsMixin'

export default {
  name: 'OfferingSolutionsForm',
  components: {
    Action,
    ActionBar,
    ContentHeader,
    Draggable,
    DraggableItem,
    Dropdown,
    DropdownLink,
    Pagination,
    ModalConfirm,
    SelectField,
    Modal: () => import('@/components/general/Modal'),
  },

  mixins: [pageMixin, commonsMixin],

  data() {
    return {
      formData: {
        courses: [],
      },
      offering: {
        published: false,
      },
      backUrl: {
        name: 'offerings.list',
      },
      modalConfirm: false,
      modalLeave: false,
      modalPublishingError: false,
      modalUpdateConclusionRulesConfirm: false,
      isTryingPublish: false,
      shouldGoToNextPageAfterSave: false,
      publishingErrors: [],
      drag: false,
      prerequisiteItems: [],
      showFeedback: true,
    }
  },
  computed: {
    ...mapState(['offerings', 'accessibility']),

    /**
     * Return if offering is already published
     * @returns {Boolean}
     */
    offeringIsReady() {
      return this.offerings && this.offerings.current && this.offerings.current.published
    },

    isEditing() {
      return this.$route.params.id || false
    },

    hasSchedule() {
      return (this.formData.configs || []).some((session) =>
        (session.courses || []).some((course) => course.start_date)
      )
    },

    allSolutionsHasSameConclusionRules() {
      const courses = this.formData.courses
      const withRules = courses.filter((course) => course.conclusionCondition)
      return withRules.length === courses.length || withRules.length === 0
    },

    hasNewSolutions() {
      return this.formData.courses.some((course) => !course.published)
    },

    publishedSolutions() {
      return this.formData.courses.filter((course) => course.published)
    },
  },

  created() {
    this.setFetching(true)
    this.attemptOfferingRetrieval({ offeringId: this.$route.params.id })
      .then(({ data }) => {
        this.formData = data.meta
        this.$store.commit(TYPES.SET_CURRENT, data)
        this.loadCourses()
      })
      .finally(() => {
        this.setFetching(false)
      })
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
      'attemptOfferingRetrieval',
      'attemptSaveOfferingMeta',
      'attemptOfferingPublishing',
    ]),

    /**
     * Push all linked courses
     */
    loadCourses() {
      const coursesArray = this.formData.courses

      this.formData.courses = coursesArray
        .map((course) => {
          return {
            id: course.id,
            name: course.name,
            author: course.author,
            type: {
              alias: course.type.alias,
            },
            conclusionCondition: course.conclusion_enrollment_condition,
            prerequisite_course_id: course.prerequisite_course_id,
            topics_count: course.topics_count,
            published: course.published,
            position: course.position,
          }
        })
        .sort((a, b) => a.position - b.position)

      if (this.isEditing && this.hasSchedule) {
        this.showFeedback &&
          this.setFeedback({ message: this.$t('offerings:feedback.schedule.periods') })
      }

      this.setPrerequisiteItems()
    },

    /**
     * Add linkedSolutions to formData
     * @param {Array<Object>} solutions
     */
    linkSolutions(solutions) {
      let linkCount = this.formData.courses.length

      const linkSolutions = solutions.map((solution) => {
        return {
          ...solution,
          position: ++linkCount,
        }
      })

      this.formData.courses = [...this.formData.courses, ...linkSolutions]
      this.setPrerequisiteItems()
    },

    /**
     * Remove solution by id (without save)
     * @param {Number} id - Solution id
     */
    removeSolution(id) {
      const idx = this.formData.courses.findIndex((course) => course.id === id)
      if (idx > -1) {
        this.formData.courses.splice(idx, 1)
        this.formData.courses.forEach((course, index) => {
          course.position = index + 1
        })
      }

      this.setPrerequisiteItems()
      this.remapPrerequisites()
    },

    /**
     * Save solution current information without publish
     * @param {Boolean} next - Set if keep in current screen or redirect
     * @param {Boolean} ignoreConclusionRuleStep
     */
    saveMeta(next = true, ignoreConclusionRuleStep = false, callback) {
      let params = this.getParams()

      this.isTryingPublish = false
      this.shouldGoToNextPageAfterSave = next

      if (!this.verifySolutionRulesIsSame(ignoreConclusionRuleStep)) return

      this.setFetching(true)
      this.attemptSaveOfferingMeta(params)
        .then(({ data }) => {
          this.$store.commit(TYPES.SET_CURRENT, data)
          if (this.shouldGoToNextPageAfterSave) {
            if (this.modalLeave) {
              this.$router.push(this.backUrl)
              this.showFeedback &&
                this.setFeedback({ message: this.$t('offerings:feedback.saved') })
            }
          } else {
            this.showFeedback && this.setFeedback({ message: this.$t('offerings:feedback.saved') })
          }
        })
        .finally(() => {
          this.setFetching(false)
          callback && callback()
        })
    },

    verifySolutionRulesIsSame(ignoreConclusionRuleStep = false) {
      if (!ignoreConclusionRuleStep && !this.allSolutionsHasSameConclusionRules) {
        this.modalUpdateConclusionRulesConfirm = true
        return false
      }
      return true
    },

    doneUpdateConclusionRuleUpdate() {
      if (this.isTryingPublish) this.publishOffering(true)
      else this.saveMeta(this.shouldGoToNextPageAfterSave, true)

      this.modalUpdateConclusionRulesConfirm = false
    },

    /**
     * Save meta and publish offering
     */
    publishOffering(ignoreConclusionRuleStep = false) {
      let params = this.getParams()

      this.isTryingPublish = true
      if (!this.verifySolutionRulesIsSame(ignoreConclusionRuleStep)) return

      this.setFetching(true)
      this.attemptSaveOfferingMeta(params)
        .then(({ data }) => {
          this.$store.commit(TYPES.SET_CURRENT, data)
          this.attemptOfferingPublishing(this.$route.params.id)
            .then(() => {
              this.$router.push({ name: 'offerings.list' })
            })
            .catch(({ response }) => {
              this.$commons_handlePublishError(response)
            })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * Return default params to create save/publish request
     * @returns {Object}
     */
    getParams() {
      return {
        offeringId: this.$route.params.id,
        meta: this.formData,
      }
    },

    closeModalPublishingError() {
      this.modalPublishingError = false
      this.publishingErrors = []
    },

    openModalConfirm() {
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
      this.saveMeta()
    },

    /**
     * @description Change solution positions
     */
    orderSolutions(event) {
      this.moveSolutionHandler(event)
      this.reorderSolution()
      this.setPrerequisiteItems()
      this.remapPrerequisites()
      this.drag = false
    },

    /**
     * @description reorder solutions positions
     */
    reorderSolution() {
      const offerSolutions = this.formData.courses

      for (let i = 0; i < offerSolutions.length; i++) {
        offerSolutions[i].position = i + 1
      }
    },

    isValidDirection(direction, oldIndex, listSize) {
      if (!direction) return true

      if (
        (direction === 'up' && oldIndex === 0) ||
        (direction === 'down' && oldIndex === listSize - 1)
      ) {
        return false
      }

      return true
    },

    moveSolutions(solutionA, solutionB, offerSolutions) {
      const movedSolution = offerSolutions.splice(solutionA, 1)[0]
      offerSolutions.splice(solutionB, 0, movedSolution)
    },

    /**
     * @description Move solution to a new index
     */
    moveSolutionHandler(event) {
      const offerSolutions = this.formData.courses

      const { direction, oldIndex, newIndex } = event

      const isMovingPublishedSolution =
        offerSolutions[oldIndex].published || offerSolutions[newIndex].published

      if (!this.isValidDirection(direction, oldIndex, offerSolutions.length)) return

      if (!this.drag) {
        this.moveSolutions(oldIndex, newIndex, offerSolutions)
      }

      if (isMovingPublishedSolution) {
        // Rollback solution position
        this.moveSolutions(newIndex, oldIndex, offerSolutions)
      }

      this.$set(this.formData, 'courses', offerSolutions)
    },

    /**
     * @description Set a list of valid prerequisites by item
     * @returns {Array<Object>}
     */
    setPrerequisiteItems() {
      this.prerequisiteItems = this.formData.courses.map((_, idxPrerequisite) => {
        return this.formData.courses
          .filter((_, idxFilter) => idxFilter < idxPrerequisite)
          .map((offeringSolution, solutionPosition) => {
            return {
              text: `${this.$t('global:solution')} ${solutionPosition + 1}`,
              value: offeringSolution.id,
            }
          })
      })
    },

    /**
     * Map and remove invalid prerequisites
     * @returns {Array}
     */
    remapPrerequisites() {
      return this.formData.courses.map((solution) => {
        const prerequisiteSolution = this.formData.courses.find(
          (s) => s.id === solution.prerequisite_course_id
        )

        if (!prerequisiteSolution || prerequisiteSolution.position > solution.position) {
          solution.prerequisite_course_id = null
        }

        return solution
      })
    },

    saveAndGoToPage(page, next = false) {
      let callback = () => {
        page && this.$_goToPage(page)
      }

      this.showFeedback = false

      if (this.canWrite('offerings')) this.saveMeta(next, false, callback)
      else callback()
    },
  },
}
</script>

<template>
  <div class="offerings-create-step-02">
    <ContentHeader
      :title="
        isEditing && offerings.current ? offerings.current.title : $t('offerings:form.header.title')
      "
      light-theme
      fixed
    >
      <Action
        slot="back"
        :text="$media.mobile ? $t('global:back') : $t('global:back.offerings')"
        type="button"
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
          :text="$t('global:form.publish')"
          :disabled="!canWrite('offerings')"
          :dark="accessibility"
          type="button"
          flat
          @click="publishOffering()"
        />
        <Action
          :text="$t('global:form.save')"
          :dark="accessibility"
          :disabled="!canWrite('offerings')"
          type="button"
          flat
          @click="saveMeta(false)"
        />
      </template>
    </ContentHeader>

    <div class="section">
      <div class="center">
        <div class="offerings-create-header">
          <h2 class="offerings-create-title">{{ $t('global:form.step', { num: 2 }) }}</h2>
          <p class="offerings-create-description">
            {{ $t('offerings.solutions.edit:header.description') }}
          </p>
        </div>

        <Draggable
          :list="formData.courses"
          :dark="accessibility"
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
              {{ $t('global:header.position.number') }}
            </th>
            <th class="th w-3 mr-8 text-base">
              {{ $t('offerings.solutions.edit:datatable.header.solutions') }}
            </th>
            <th class="th w-3 text-left text-base">
              {{ $t('offerings.solutions.edit:datatable.header.classes') }}
            </th>
            <th class="w-auto" />
          </template>

          <TransitionGroup
            type="transition"
            :name="!drag ? 'flip-list' : null"
          >
            <DraggableItem
              v-for="(course, index) in formData.courses"
              :key="course.id"
              :index="index"
              :disabled="course.published"
              @order="orderSolutions"
            >
              <div class="draggable-item-col w-16rem">
                <p class="item-title">{{ course.name }}</p>
              </div>

              <div class="draggable-item-col w-3">
                <p class="item-title">{{ course.topics_count }}</p>
              </div>

              <div class="draggable-item-col w-5">
                <SelectField
                  v-if="index > 0"
                  v-model="course.prerequisite_course_id"
                  :disabled="course.published"
                  :label="$t('offerings.solutions:draggable.prerequisite.label')"
                  :items="prerequisiteItems[index]"
                />
              </div>

              <template slot="actions">
                <Dropdown
                  icon="dots-vertical"
                  right
                >
                  <DropdownLink
                    :text="$t('global:remove')"
                    :disabled="course.published"
                    @click="removeSolution(course.id)"
                  />
                </Dropdown>
              </template>
            </DraggableItem>
          </TransitionGroup>
        </Draggable>

        <div
          class="datatable-item-selected flex align-items-center text-base"
          :class="{ 'mt-4': formData.courses.length, 'mt-8': !formData.courses.length }"
        >
          <div class="text-color">{{ $t('offerings.solutions.edit:datatable.item.selected') }}</div>
          <div class="datatable-item-selected-length mx-1">{{ formData.courses.length }}</div>
        </div>

        <Action
          :text="$t('global:solution.btn.add')"
          :disabled="!canWrite('offerings')"
          class="mb-5 mt-3 btn-add__solutions"
          type="button"
          primary
          large
          @click="
            $router.push({
              name: 'offerings.solutions.add',
            })
          "
        />

        <Pagination
          v-if="pageCount"
          class-wrapper="mx-auto my-8"
          :active-first-last="false"
          :active-page="2"
          :page-count="pageCount"
          :show-all-pages="Boolean($route.params.id)"
          float
          block-layout
          disable-scroll
          disable-items-per-page
          custom-routing
          @next-page="saveAndGoToPage(3)"
          @previous-page="saveAndGoToPage(1)"
          @go-to-page="saveAndGoToPage($event)"
        />
      </div>
    </div>

    <router-view
      :linked-solutions="formData.courses"
      @link-solutions="linkSolutions"
    />

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
          <h3 class="modal-confirm-title">{{ $t('offerings.create:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('offerings.create:modal.confirm.message') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            v-if="!offeringIsReady && canWrite('offerings')"
            :text="$t('global:save.leave')"
            :dark="accessibility"
            type="button"
            flat
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
            :text="$t('global:understood')"
            :dark="accessibility"
            type="button"
            flat
            @click="closeModalPublishingError()"
          />
        </div>
      </div>
    </Modal>

    <ModalConfirm
      :active="modalUpdateConclusionRulesConfirm"
      :title="$t('global:attention')"
      @close="modalUpdateConclusionRulesConfirm = false"
      @confirm="doneUpdateConclusionRuleUpdate()"
    >
      <div class="modal-confirm-description">
        <p class="text-color">
          {{ $t('offerings.publishing:modal.confirm.update.conclusion.rules.description') }}
        </p>
      </div>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import '~@/app/offerings/styles.scss';
</style>
