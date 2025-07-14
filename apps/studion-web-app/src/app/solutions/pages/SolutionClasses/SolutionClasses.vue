<script>
import { defineComponent } from 'vue'
import { mapActions, mapState, mapGetters } from 'vuex'

import { requiredIf } from 'vuelidate/lib/validators'
import { classTypeAlias } from '../../shared'
import pageMixin from '../../mixins/pageMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import ContentHeader from '@/components/general/ContentHeader'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import Draggable from '@/components/general/Draggable'
import DraggableItem from '@/components/general/DraggableItem'
import Loading from '@/components/general/Loading'
import Pagination from '@/components/general/Pagination'
import SelectField from '@/components/general/SelectField'
import Tooltip from '@/components/general/Tooltip'
import SlugTooltip from '@/components/general/SlugTooltip'

export default defineComponent({
  name: 'SolutionClasses',

  components: {
    Action,
    ActionBar,
    ActionSubmenu,
    ContentHeader,
    Draggable,
    DraggableItem,
    Dropdown,
    DropdownLink,
    Icon,
    Loading,
    Modal: () => import('@/components/general/Modal'),
    ModalConfirm: () => import('@/components/general/ModalConfirm'),
    ModalWarning: () => import('@/components/general/ModalWarning'),
    ModalPreviewEvaluation: () => import('./components/ModalPreviewEvaluation'),
    Pagination,
    SelectField,
    Tooltip,
    SlugTooltip,
  },

  mixins: [pageMixin],

  data() {
    return {
      modalConfirm: false,
      modalLeave: false,
      courseId: this.$route.params.id,
      classItems: [],
      backUrl: { name: 'solutions.index' },
      timer: null,
      initDate: null,
      showSubmenu: false,
      drag: false,
      modalWarningDisable: false,
      modalWarningRemove: false,
      modalConfirmRemove: false,
      modalCompetencyEditWarning: false,
      previewEvaluation: null,
      classToRemove: null,
    }
  },
  computed: {
    ...mapGetters(['isFetching']),
    ...mapState(['accessibility', 'Courses', 'isSavingBlocked']),
    isEditing() {
      return this.$route.params.id || false
    },
    dragOptions() {
      return {
        animation: 300,
        group: 'topics',
        disabled: false,
        ghostClass: 'ghost',
        handle: '.handle',
      }
    },
    warningTitleText() {
      return this.modalWarningDisable
        ? this.$t('solutions.create:modal.warning:disable.topic.prerequisite.title')
        : this.$t('solutions.create:modal.confirm:remove.topic.title')
    },
    warningDescriptionText() {
      return this.modalWarningDisable
        ? this.$t('solutions.create:modal.warning:disable.topic.prerequisite.description')
        : this.$t('solutions.create:modal.warning:remove.topic.prerequisite.description')
    },
  },

  validations() {
    const firstItem = this.classItems[0] || {}

    return {
      classItems: {
        $each: {
          prerequisiteId: {
            required: requiredIf(function (nestedModel) {
              return (
                !(nestedModel.id === firstItem.id) &&
                this.Courses.current.workloadLimit &&
                nestedModel.active
              )
            }),
          },
        },
      },
    }
  },

  watch: {
    'Courses.currentTopics': {
      handler: function (topics) {
        this.setupTopicsItemsList(topics)
      },
    },
  },

  created() {
    const courseId = this.courseId
    this.setFetching(true)
    this.attemptCourseRetrieval({ courseId })
    this.attemptTopicsRetrieval({ courseId }).finally(() => {
      this.setFetching(false)
    })
  },

  mounted() {
    this.$emit('fixed-header', true)
    this.$emit('change-theme-footer', { dark: false })
  },

  beforeDestroy() {
    clearTimeout(this.timer)
  },

  destroyed() {
    this.$emit('fixed-header', false)
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptTopicToggle',
      'attemptTopicRemoval',
      'attemptTopicsRetrieval',
      'attemptTopicsAssetsStatusRetrieval',
      'attemptCourseRetrieval',
      'attemptTopicUpdate',
      'attemptUpdateTopicOrder',
      'attemptDownloadTopicAsset',
    ]),
    savedClass(topic) {
      const classItemIndex = this.classItems.findIndex((classItem) => classItem.id === topic.id)
      if (topic.prerequisite) topic.prerequisiteId = topic.prerequisite.id

      if (classItemIndex >= 0) {
        this.classItems.splice(classItemIndex, 1, { ...this.classItems[classItemIndex], ...topic })
      } else {
        this.classItems.push(topic)
      }
      this.checkAssetStatus(this.courseId)
      this.setFetching(true)
      this.attemptTopicsRetrieval({ courseId: this.courseId }).finally(() => {
        this.setFetching(false)
      })
    },
    classToggle(topic) {
      if (topic.active && this.isTopicPrerequisite(topic)) {
        this.modalWarningDisable = true
        return
      }

      this.setFetching(true)
      this.attemptTopicToggle(topic.id)
        .then(() => {
          topic.active = !topic.active
          this.remapPrerequisite()
          this.createSelectOptions()
          this.setFeedback({
            message: this.$t(
              `solutions.toggle.classes:feedback.${topic.active ? 'active' : 'inactive'}.success`,
              { name: topic.name }
            ),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    classEdit(topic) {
      if (topic.competency_answers) {
        this.modalCompetencyEditWarning = topic
        return
      }

      this.$router.push({
        name: 'solutions.create.classes.update',
        params: { id: this.courseId, topicId: topic.id },
      })
    },

    handleCreatedModal() {
      this.$router.push({
        name: 'solutions.create.classes.create',
      })
    },

    editCompetency() {
      this.$router.push({
        name: 'solutions.create.classes.update',
        params: { id: this.courseId, topicId: this.modalCompetencyEditWarning.id },
      })

      this.modalCompetencyEditWarning = false
    },
    attemptToRemoveTopic(topic) {
      if (this.isTopicPrerequisite(topic)) {
        this.modalWarningRemove = true
        return
      }

      this.classToRemove = topic
      this.modalConfirmRemove = true
    },
    classRemove(topic) {
      this.closeModalConfirmRemove()
      this.setFetching(true)
      const index = this.classItems.findIndex((topicItem) => topicItem.id === topic.id)
      this.attemptTopicRemoval(topic.id)
        .then(() => {
          this.setFeedback({ message: this.$t('solutions.create.classes:feedback.remove.success') })
          this.classItems.splice(index, 1)
          this.remapPrerequisite()
          this.createSelectOptions()
        })
        .catch(({ response }) => {
          if (response.data && response.data.message === 'topic_asset_has_session_application') {
            this.setFeedback({
              message: this.$t('solutions.create.classes:feedback.remove.error:has.session'),
              type: 'error',
            })
            return
          }
          this.setFeedback({
            message: this.$t('solutions.create.classes:feedback.remove.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    goToNextStep() {
      if (!this.validate()) return

      this.$router.push({
        name: 'solutions.create.requirements',
        params: { id: this.$route.params.id },
      })
    },
    goToPreviousStep() {
      if (!this.validate()) return

      this.$router.push({
        name: 'solutions.create.tools',
        params: { id: this.$route.params.id },
      })
    },
    goToPage(event) {
      if (!this.validate()) return
      this.$_goToPage(event)
    },
    validate() {
      this.$v.$touch()
      if (!this.$v.$invalid) return true

      this.setFeedback({ message: this.$t('solutions.create:feedback.workload.invalid') })
      return false
    },
    save(next) {
      if (!this.validate()) return

      if (next) {
        this.leave()
      }

      this.$impersonateFeedbackError()

      this.setFeedback({ message: this.$t('solutions.create:feedback.saved') })
    },
    openModalConfirm() {
      if (!this.canWrite('courses')) {
        return this.leave()
      }
      this.modalConfirm = true
    },
    orderTopics(event) {
      let { direction, oldIndex, newIndex } = event
      let orderMode = direction ? 'Arrow' : 'Drag'

      if (direction) {
        if (
          (direction === 'up' && oldIndex === 0) ||
          (direction === 'down' && oldIndex === this.classItems.length - 1)
        ) {
          return
        }
      }

      this.drag = false
      this.moveTopic(oldIndex, newIndex, orderMode)
    },
    moveTopic(oldIndex, newIndex, orderMode) {
      if (oldIndex !== newIndex) {
        let toMove = orderMode === 'Drag' ? this.classItems[newIndex] : this.classItems[oldIndex]

        Object.assign(toMove, { position: newIndex + 1 })
        if (toMove.prerequisiteId) delete toMove.prerequisiteId

        this.attemptUpdateTopicOrder({ formData: toMove })
          .then(() => {
            let classItem =
              orderMode === 'Drag'
                ? this.classItems.splice(newIndex, 1)[0]
                : this.classItems.splice(oldIndex, 1)[0]

            this.classItems.splice(newIndex, 0, classItem)

            this.remapPrerequisite()
            this.createSelectOptions()
          })
          .catch(() => {
            if (orderMode === 'Drag') {
              let classItem = this.classItems.splice(newIndex, 1)[0]
              this.classItems.splice(oldIndex, 0, classItem)
            }
          })
      }
    },
    saveTopicPrerequisite(prerequisiteId, classItem, itemIndex) {
      const isTopicTemplate = false
      const isListContextUpdate = true

      Object.assign(classItem, { prerequisiteId })
      this.$set(this.classItems, itemIndex, classItem)

      this.attemptTopicUpdate({ formData: classItem, isTopicTemplate, isListContextUpdate })
    },
    remapPrerequisite() {
      this.classItems.forEach((topic, index) => {
        topic.position = index + 1
        if (topic.position === 1) topic.prerequisiteId = null
      })

      this.classItems.forEach((topic) => {
        const prerequisitedTopic = this.classItems.find((t) => t.id === topic.prerequisiteId)

        if (
          !prerequisitedTopic ||
          prerequisitedTopic.position > topic.position ||
          !prerequisitedTopic.active
        ) {
          topic.prerequisiteId = null
        }
      })
    },
    createSelectOptions() {
      this.selectClassesOptions = this.classItems.map((_, idx1) => {
        return this.classItems
          .filter((_, idx2) => idx2 < idx1)
          .map((t3, idx3) => ({
            text: `${this.$t('global:lesson')} ${idx3 + 1}`,
            value: t3.id,
            isActive: t3.active,
          }))
          .filter((t4) => t4.isActive)
      })
    },
    closeModalConfirm() {
      this.modalConfirm = false
    },
    openActionSubmenu() {
      this.showSubmenu = !this.showSubmenu
    },
    leave() {
      this.modalConfirm = false
      this.$nextTick(() => {
        this.$router.push(this.backUrl)
      })
    },
    checkAssetStatus(courseId) {
      this.attemptTopicsAssetsStatusRetrieval(courseId).then(({ data }) => {
        this.classItems = this.classItems.map((item) => {
          let assetStatus = data.filter((statusItem) => statusItem.topicId === item.id)
          item.assetStatus = assetStatus.length > 0 ? assetStatus[0].status : 'complete'
          item.assetActive = assetStatus.length > 0 ? assetStatus[0].assetActive : true
          item.active = assetStatus.length > 0 ? assetStatus[0].topicActive : true
          item.assetType = assetStatus.length > 0 ? assetStatus[0].type : '-'
          item.hasTemplate = assetStatus.length > 0 ? assetStatus[0].hasTemplate : true
          return item
        })
        if (this.classItems.filter((item) => item.assetStatus === 'waiting').length > 0) {
          if (this.timer) clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.checkAssetStatus(this.courseId)
          }, 10000)
        }
        this.remapPrerequisite()
        this.createSelectOptions()
      })
    },
    setupTopicsItemsList(topics) {
      const classItems = topics
        ? topics.map((item) => {
            item.assetActive = item && item.assets.length ? item.assets[0].active : false
            if (item.prerequisite) this.$set(item, 'prerequisiteId', item.prerequisite.id)
            return item
          })
        : []

      this.$set(this, 'classItems', classItems)

      if (this.classItems.length > 0) {
        this.checkAssetStatus(this.courseId)
      }

      this.createSelectOptions()
    },
    isTopicPrerequisite(topic) {
      return this.classItems.findIndex((t) => t.prerequisiteId === topic.id) >= 0
    },
    closeModalWarning() {
      this.modalWarningDisable = false
      this.modalWarningRemove = false
    },
    closeModalConfirmRemove() {
      this.modalConfirmRemove = false
      this.classToRemove = null
    },
    /**
     * Receive an array of assets and check if the topic asset is
     * downloadable
     * @param {Array} assets
     */
    hasDownloadableAsset(assets) {
      if (!assets || !assets[0]) return false

      const isPdf = assets[0].type && assets[0].type.name === 'PDF'
      const isDownloadable = assets[0].meta && assets[0].meta.is_downloadable
      return isPdf && isDownloadable
    },
    async downloadTopicAsset(asset) {
      await this.attemptDownloadTopicAsset({ assetId: asset.id, filename: asset.description })
    },
    /**
     * Get topic assets and returns asset type translated text
     * @param {Object} topicAssets
     */
    getFileType(assetType) {
      if (!assetType) return '-'
      if (assetType in classTypeAlias) return classTypeAlias[assetType].toLowerCase()
      else return '-'
    },
    openModalNewScormVersion(classItem) {
      this.$router.push({ name: 'solutions.updateScorm', params: { topicId: classItem.id } })
    },

    openModalViewEvaluation(classItem) {
      this.previewEvaluation = classItem
    },

    checkIfIsScorm(classItem) {
      return classItem.assets && classItem.assets[0] && classItem.assets[0].type.name === 'Scorm'
    },
  },
})
</script>

<template>
  <div class="solutions-create step-03">
    <ContentHeader
      :title="isEditing ? Courses.current.name : $t('solutions.create:header.title')"
      fixed
      light-theme
    >
      <Action
        slot="back"
        :text="$t('global:back.solutions')"
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
          v-if="notEqualsProfile('student') && canWrite('courses')"
          :text="$t('global:form.save')"
          :dark="accessibility"
          type="button"
          flat
          @click="save(false)"
        />
      </template>
    </ContentHeader>

    <div class="mt-4">
      <div class="center">
        <div class="solutions-create-header">
          <h2 class="solutions-create-title">
            {{ $t('global:form.step', { num: getActivePage(3) }) }}
          </h2>

          <p
            v-if="notEqualsProfile('student') && canWrite('courses')"
            class="solutions-create-description"
          >
            {{ $t('solutions.create.classes:header.description') }}
          </p>
        </div>

        <div
          v-if="classItems.length === 0"
          class="text-center"
        >
          <p
            v-if="notEqualsProfile('student') && canWrite('courses')"
            class="helper-text"
          >
            {{ $t('solutions.create.classes:helper.text') }}
          </p>
        </div>

        <Draggable
          v-if="classItems.length"
          v-bind="dragOptions"
          enumerated
          class="mb-10"
          :list="classItems"
          @start="drag = true"
          @end="orderTopics"
        >
          <template #index="{ index }">
            <div class="w-2rem text-left text-2xl text-color">
              {{ index }}
            </div>
          </template>
          <template slot="headers">
            <th
              class="th text-left text-base"
              width="2%"
            >
              {{ $t('trails.create.solutions:draggable.header.1') }}
            </th>
            <th
              class="th text-base"
              width="1.5%"
            ></th>
            <th
              class="th text-base text-left"
              width="9.5%"
            >
              {{ $t('solutions.create.classes:datatable.header.name') }}
            </th>

            <th
              v-if="!$media.mobile"
              class="th text-base"
              width="2.9%"
            >
              {{ $t('solutions.create.classes:datatable.header.type') }}
            </th>

            <th
              v-if="!$media.mobile"
              class="th text-base"
              width="1.6%"
            >
              {{ $t('solutions.create.classes:datatable.header.mandatory') }}
            </th>

            <th
              v-if="!$media.mobile"
              class="th text-base"
              width="2.5%"
            >
              {{ $t('global:file') }}
            </th>
            <th
              class="th text-base"
              width="3%"
            ></th>
            <th
              v-if="!$media.mobile && $isEnabledFeature('slug_identity')"
              class="th text-base"
              width="1%"
            >
              {{ $t('global:slug.identity') }}
            </th>

            <th
              v-if="!$media.mobile"
              class="th text-base"
              width="3%"
            >
              {{ $t('solutions.create.classes:datatable.header.status') }}
            </th>

            <th
              class="th text-base"
              width="9%"
            ></th>
          </template>

          <TransitionGroup
            type="transition"
            :name="!drag ? 'flip-list' : null"
          >
            <div
              v-for="(classItem, index) in classItems"
              :key="`class-${classItem.id}`"
            >
              <DraggableItem
                :class="{ 'is-blocker': classItem.restrictProgress }"
                :index="index"
                @order="orderTopics"
              >
                <div
                  class="draggable-item-col text-center w-3"
                  :class="{
                    'class-item__name': classItem.restrictProgress || $media.mobile,
                    'col-3 pr-3': !$media.mobile,
                  }"
                >
                  <p class="text-color text-left">{{ classItem.name }}</p>

                  <Tooltip
                    v-if="classItem.restrictProgress"
                    dark
                    :uppercase="false"
                    :width="280"
                  >
                    <template #activator="{ on }">
                      <span
                        class="ml-1"
                        v-on="on"
                      >
                        <Icon
                          name="alert-circle"
                          size="small"
                        />
                      </span>
                    </template>

                    <span>{{ $t('solutions.create.classes:tootip.restrict.progress') }}</span>
                  </Tooltip>
                </div>

                <div
                  class="draggable-item-col text-center w-1 class-item__type"
                  :class="{ 'col-1 pr-3': !$media.mobile }"
                >
                  <p
                    v-if="$media.mobile"
                    class="item-title"
                  >
                    {{ $t('solutions.create.classes:datatable.header.type') }}
                  </p>
                  <p v-if="classItem.isRecovery">
                    {{ $t(`solutions.create.classes:modal.type.recovery`) }}
                  </p>
                  <p v-else>{{ $t(`solutions.create.classes:modal.type.${classItem.type}`) }}</p>
                </div>

                <div
                  class="draggable-item-col text-center w-1 class-item__mandatory"
                  :class="{ 'col-2': !$media.mobile }"
                >
                  <p
                    v-if="$media.mobile"
                    class="item-title"
                  >
                    {{ $t('solutions.create.classes:datatable.header.mandatory') }}
                  </p>

                  <p class="text-color">
                    {{ classItem.mandatory ? $t('global:yes') : $t('global:no') }}
                  </p>
                </div>

                <div
                  v-if="!$media.mobile"
                  class="draggable-item-col text-center w-1"
                  :class="{ 'col-1': !$media.mobile }"
                >
                  <p class="asset__type">{{ getFileType(classItem.assetType) }}</p>
                </div>

                <div
                  class="draggable-item-col text-center w-1 class-item__asset"
                  :class="{ 'col-2': !$media.mobile }"
                >
                  <div
                    v-if="$media.mobile"
                    class="file__name text-sm"
                  >
                    <p class="item-title">{{ $t('global:file') }}</p>

                    <p class="asset__type">{{ getFileType(classItem.assetType) }}</p>
                  </div>

                  <span
                    :class="[
                      'td-tag p-1 px-2 border-round-xl td-tag-fixed text-sm',
                      {
                        'is-ok': classItem.assetStatus === 'complete',
                        'has-error': classItem.assetStatus === 'error',
                      },
                    ]"
                  >
                    <span v-if="classItem.assetStatus">{{
                      $t(`solutions.create.classes:status.${classItem.assetStatus}`)
                    }}</span>

                    <Loading v-if="classItem.assetStatus === 'waiting' || !classItem.assetStatus" />

                    <Icon
                      v-if="classItem.assetStatus === 'complete'"
                      name="check-all"
                      wrapper
                      size="medium"
                    />

                    <Icon
                      v-if="classItem.assetStatus === 'error'"
                      name="close"
                      wrapper
                      size="medium"
                    />
                  </span>
                </div>

                <div
                  v-if="$isEnabledFeature('slug_identity')"
                  class="draggable-item-col text-center w-1 class-item__slug"
                  :class="{ 'col-1': !$media.mobile }"
                >
                  <p
                    v-if="$media.mobile"
                    class="item-title"
                  >
                    {{ $t('global:slug.identity') }}
                  </p>

                  <SlugTooltip
                    :slug="classItem.examinationSlug"
                    :clamp-line="false"
                  />
                </div>

                <div
                  class="draggable-item-col text-center w-1 class-item__active"
                  :class="{ 'col-1': !$media.mobile }"
                >
                  <p
                    v-if="$media.mobile"
                    class="item-title"
                  >
                    {{ $t('solutions.create.classes:datatable.header.status') }}
                  </p>

                  <p class="text-color">
                    {{ classItem.active ? $t('global:active') : $t('global:inactive') }}
                  </p>
                </div>

                <div
                  class="draggable-item-col w-2 class-item__prerequisite"
                  :class="{ 'pr-3 col-2': !$media.mobile }"
                >
                  <SelectField
                    v-if="!$isEnabledFeature('examination_tool_feature')"
                    v-model="classItem.prerequisiteId"
                    :validation="$v.classItems.$each[index].prerequisiteId"
                    :disabled="index === 0"
                    :label="$t('trails.create.solutions:draggable.prerequisite.label')"
                    :items="selectClassesOptions[index]"
                    :class="{ invisible: index === 0 }"
                    @input="saveTopicPrerequisite($event, classItem, index)"
                  />
                </div>

                <Dropdown
                  slot="actions"
                  right
                  icon="dots-vertical"
                >
                  <DropdownLink
                    v-if="!classItem.active && classItem.assetActive === true"
                    :text="$t('global:activate')"
                    @click="classToggle(classItem)"
                  />

                  <DropdownLink
                    v-if="classItem.active"
                    :text="$t('global:deactivate')"
                    @click="classToggle(classItem)"
                  />

                  <DropdownLink
                    :text="$t('global:edit')"
                    @click="classEdit(classItem)"
                  />

                  <DropdownLink
                    v-if="!classItem.competency_answers"
                    :text="$t('global:remove')"
                    @click="attemptToRemoveTopic(classItem)"
                  />

                  <DropdownLink
                    v-if="hasDownloadableAsset(classItem.assets)"
                    :text="$t('solutions.create.classes:download.asset')"
                    @click="downloadTopicAsset(classItem.assets[0])"
                  />

                  <DropdownLink
                    v-if="checkIfIsScorm(classItem)"
                    :text="$t('solutions.create.classes:new.version')"
                    @click="openModalNewScormVersion(classItem)"
                  />

                  <template v-if="classItem.type === 'examination'">
                    <Tooltip
                      v-if="classItem.hasTemplate"
                      :uppercase="false"
                      :width="257"
                      :bold-font="false"
                    >
                      <template #activator="{ on }">
                        <DropdownLink
                          :text="$t('solutions.create.classes:see.evaluation')"
                          disabled
                          @mouseenter.native="on.mouseenter"
                          @mouseleave.native="on.mouseleave"
                        />
                      </template>

                      <span>{{ $t('solutions.create.classes:see.evaluation:disabled') }}</span>
                    </Tooltip>

                    <DropdownLink
                      v-else
                      :text="$t('solutions.create.classes:see.evaluation')"
                      @click="openModalViewEvaluation(classItem)"
                    />
                  </template>
                </Dropdown>
              </DraggableItem>
            </div>
          </TransitionGroup>
        </Draggable>

        <div class="text-center">
          <ActionSubmenu
            v-if="$isEnabledFeature('topic_template')"
            slot="button"
            :show.sync="showSubmenu"
          >
            <Action
              v-if="notEqualsProfile('student') && canWrite('courses')"
              slot="button"
              class="btn-add-solution-class"
              :dark="accessibility"
              :text="$t('solutions.create.classes:btn.add')"
              fixed-width
              large
              primary
              type="button"
              @click="openActionSubmenu()"
            />

            <template slot="actions">
              <Action
                :text="$t('solutions.create.classes:btn.add.bindClass')"
                dark
                secondary
                small
                type="button"
                @click="$router.push({ name: 'solutions.create.classes.bind' })"
              />

              <Action
                :text="$t('solutions.create.classes:btn.add.newClass')"
                dark
                secondary
                small
                type="button"
                @click="handleCreatedModal"
              />
            </template>
          </ActionSubmenu>

          <Action
            v-if="
              notEqualsProfile('student') &&
              canWrite('courses') &&
              !$isEnabledFeature('topic_template')
            "
            :text="$t('solutions.create.classes:btn.add')"
            :dark="accessibility"
            primary
            large
            fixed-width
            type="button"
            @click="handleCreatedModal"
          />
        </div>

        <Pagination
          v-if="pageCount"
          class-wrapper="mx-auto my-8"
          :active-first-last="false"
          :active-page="getActivePage(3)"
          :page-count="pageCount"
          :dark="accessibility"
          float
          disable-items-per-page
          block-layout
          show-all-pages
          custom-routing
          @go-to-page="goToPage"
          @next-page="goToNextStep"
          @previous-page="goToPreviousStep"
        />
      </div>
    </div>

    <ModalWarning
      :active="modalWarningDisable || modalWarningRemove"
      :title="warningTitleText"
      @close="closeModalWarning"
    >
      <slot>
        <p class="text-color">{{ warningDescriptionText }}</p>
      </slot>
    </ModalWarning>

    <ModalConfirm
      :active="modalConfirmRemove"
      :title="$t('solutions.create:modal.confirm:remove.topic.title')"
      :cancel-btn-text="$t('global:cancel')"
      :confirm-btn-text="$t('global:remove')"
      @confirm="classRemove(classToRemove)"
      @close="closeModalConfirmRemove"
    >
      <slot name="description">
        <p class="text-color">
          {{ $t('solutions.create:modal.confirm:remove.topic.description') }}
        </p>
      </slot>
    </ModalConfirm>

    <ModalConfirm
      :active="!!modalCompetencyEditWarning"
      :title="$t('solutions.create:modal.confirm:edit.competency.topic.title')"
      :cancel-btn-text="$t('global:cancel')"
      :confirm-btn-text="$t('global:continue')"
      @confirm="editCompetency()"
      @close="modalCompetencyEditWarning = false"
    >
      <slot name="description">
        <p class="text-color">
          {{ $t('solutions.create:modal.confirm:edit.competency.topic.description') }}
        </p>
      </slot>
    </ModalConfirm>

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
            :text="$t('global:save.leave')"
            :dark="accessibility"
            type="button"
            flat
            @click="save(true)"
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

    <ModalPreviewEvaluation
      v-if="previewEvaluation !== null"
      :evaluation="previewEvaluation"
      is-page
      closable
      @close="previewEvaluation = null"
    />

    <RouterView
      @saved-topic="savedClass"
      @saved-scorm-version="checkAssetStatus(courseId)"
    />
  </div>
</template>

<style lang="scss">
@import '~@/app/solutions/styles.scss';
.solutions-create {
  &.step-03 {
    .btn-add-solution-class {
      margin-bottom: 40px;
    }
  }
}
</style>
