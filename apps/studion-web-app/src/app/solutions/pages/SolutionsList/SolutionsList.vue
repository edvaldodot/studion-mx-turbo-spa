<script>
import i18n from '@/support/i18n'
import { mapActions, mapState, mapGetters } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Action from '@/components/general/Action'
import BranchesTooltip from '../../components/BranchesTooltip'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import FilterPreferences from '@/components/general/FilterPreferences'
import Icon from '@/components/general/Icon'
import Pagination from '@/components/general/Pagination'
import TooltipSlot from '@/components/general/TooltipSlot'
import SlugTooltip from '@/components/general/SlugTooltip'
import SolutionsHeader from '../../components/SolutionsHeader'

import { makeDefaultPreferences, makePreferenceColumns } from '../../shared'

const Modal = () => import('@/components/general/Modal')

export default {
  name: 'SolutionsList',

  components: {
    Action,
    BranchesTooltip,
    Datatable,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    FilterPreferences,
    Modal,
    Icon,
    Pagination,
    TooltipSlot,
    SlugTooltip,
    SolutionsHeader,
  },

  mixins: [paginateMixin],

  data() {
    return {
      dependencies: {
        sessions: 0,
        offerings: 0,
        enrollments: 0,
        isRemovable: false,
      },
      listAllLinks: [],
      modalConfirmRemove: false,
      solutionRemove: {},
      modalConfirmDuplicate: false,
      solutionDuplicate: {},
      deactivateDependencies: {
        sessions: 0,
        offerings: 0,
        enrollments: 0,
        isRemovable: false,
      },
      modalConfirmDeactivate: false,
      solutionDeactivate: {
        courseId: 0,
        index: 0,
      },
      filterCategoriesOptions: [],
      defaultPreferences: [...makeDefaultPreferences()],
      metadataColumns: [],
      pgtrLoaded: false,
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility', 'Courses', 'Settings']),
    showDescriptionModalConfirm() {
      if (this.dependencies.sessions > 0) {
        return true
      }
      if (this.dependencies.offerings > 0) {
        return true
      }
      if (this.dependencies.enrollments > 0) {
        return true
      }

      return false
    },
    filterListOrderOptions() {
      return [
        {
          text: i18n.t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc',
        },
        {
          text: i18n.t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: i18n.t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },

    preferenceColumns() {
      let preferences = [...makePreferenceColumns()]

      if (!this.$isEnabledFeature('branching')) {
        preferences = preferences.filter(({ value }) => value !== 'branch')
      }

      if (!this.$isEnabledFeature('slug_identity')) {
        preferences = preferences.filter(({ value }) => value !== 'slug')
      }

      if (this.$isEnabledFeature('course_metas')) {
        preferences = [preferences, this.metadataColumns].flat()
      }

      return preferences
    },

    visibleMetaColumns() {
      return this.metadataColumns.filter((meta) => {
        return (
          this.Settings.displayFeatures.solutions_list &&
          this.Settings.displayFeatures.solutions_list[meta.value]
        )
      })
    },

    /**
     * Get the number of visible columns from state
     * @returns {number}
     */
    preferenceColumnsCount() {
      let preferences = []
      for (let key in this.Settings.displayFeatures.solutions_list) {
        if (this.Settings.displayFeatures.solutions_list[key]) preferences.push(key)
      }
      return preferences.length
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.setFetching(true)
    Promise.all([
      this.attemptTypesRetrieval(),
      this.attemptCategoryListRetrieval(),
      this.attemptMetasListRetrieval({ entity: 'course', searchParams: { limit: 1000 } }),
    ])
      .then(([types, categories, metas]) => {
        this.pgtrFilterTagOptions.push({
          title: i18n.t('solutions.type:type'),
          name: 'type',
          items: types.data.map(({ alias }) => ({
            active: false,
            id: alias,
            text: i18n.t(`solutions.type:${alias}`),
            property: 'alias',
          })),
        })
        this.filterCategoriesOptions = categories.data.data.map((category) => ({
          text: category.name,
          value: category.id,
        }))
        this.metadataColumns = metas.data.data.map((metaItem) => {
          return {
            label: metaItem.meta.name,
            value: metaItem.meta.alias,
          }
        })
      })
      .finally(() => {
        this.pgtrDefaultOrder = {
          property: 'created_at',
          type: 'desc',
        }
        this.pgtrRouteParams.active = true
        this.pgtrInitializePagination('solutionListResource', null, {
          embed: 'categories,branches,meta',
        })
        this.setFetching(false)
        this.pgtrLoaded = true
      })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptCourseListRetrieval',
      'attemptCourseRetrieval',
      'attemptCourseCreation',
      'attemptCourseUpdate',
      'attemptCourseRemoval',
      'attemptCourseDuplicate',
      'attemptTypesRetrieval',
      'attemptCourseDependencies',
      'attemptCourseActivateToggle',
      'toggleCourseStatusOnFront',
      'attemptCategoryListRetrieval',
      'attemptMetasListRetrieval',
    ]),
    ...mapGetters(['getCourseListPreferences']),
    addTopic(courseId) {
      this.$router.push({
        name: 'solutions.create.classes.create',
        params: { id: courseId },
      })
    },
    listTopics(courseId) {
      this.$router.push({
        name: 'solutions.create.classes',
        params: { id: courseId },
      })
    },
    activateToggle(courseId, index) {
      this.closeModalConfirmDeactivate()
      this.setFetching(true)

      const solution = this.Courses.solutionsList[index]

      this.attemptCourseActivateToggle(courseId)
        .then(({ data }) => {
          this.setFeedback({
            message: i18n.t(
              data.active === true
                ? 'solutions.list:feedback.activated'
                : 'solutions.list:feedback.deactivated',
              { solutionName: solution.course_name }
            ),
          })
          this.toggleCourseStatusOnFront(courseId)
        })
        .catch(() => {
          let message = i18n.t('solutions.list:feedback.activation.error')
          if (solution.course_active) {
            message = i18n.t('solutions.list:feedback.deactivation.error')
          }
          this.setFeedback({ message: message })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    deactivate(courseId, index) {
      this.solutionDeactivate = {
        courseId: courseId,
        index: index,
      }
      this.setFetching(true)
      this.attemptCourseDependencies({ courseId, justNotPublishedOfferings: true })
        .then(({ data }) => {
          if (!data.offerings && !data.paths) {
            this.activateToggle(courseId, index)
          } else {
            this.deactivateDependencies = data
            this.modalConfirmDeactivate = true
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    edit(courseId) {
      this.$router.push({
        name: 'solutions.update',
        params: { id: courseId },
      })
    },
    remove() {
      this.setFetching(true)
      this.closeModalConfirmRemove()
      this.attemptCourseRemoval(this.solutionRemove.id)
        .then(() => {
          this.pgtrRefresh()
          this.setFeedback({
            message: i18n.t('solutions.list:feedback.removed', {
              solutionName: this.solutionRemove.name,
            }),
          })
          this.solutionRemove = {}
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    confirmRemove(courseId, name) {
      this.solutionRemove = {
        id: courseId,
        name: name,
      }

      this.setFetching(true)
      this.attemptCourseDependencies({ courseId })
        .then(({ data }) => {
          this.dependencies = data
          this.modalConfirmRemove = true
          this.listAllLinks = [
            {
              name: i18n.t('solutions.list:datatable.link1'),
              quantity: this.dependencies.offerings,
            },
            {
              name: i18n.t('solutions.list:datatable.link2'),
              quantity: this.dependencies.sessions,
            },
          ]
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    closeModalConfirmRemove() {
      this.modalConfirmRemove = false
    },
    closeModalConfirmDeactivate() {
      this.modalConfirmDeactivate = false
    },
    /**
     * Gets a courseItem and extract the categories
     * @param {Object} item
     * @returns {Array}
     */
    getSolutionCategories(item) {
      let categories = []
      if (item._embedded && item._embedded.categories) categories = item._embedded.categories
      return categories
    },
    /**
     * Receives a courseItem and extract the branches
     * @param {Object} item
     * @returns {Array}
     */
    getSolutionBranches(item) {
      let branches = []
      if (item._embedded && item._embedded.branches) branches = item._embedded.branches
      return branches
    },
    /**
     * Receive a column name and check if it should show
     * @param {string} name
     * @returns {boolean}
     */
    checkIfColumnIsVisible(name) {
      if (this.preferenceColumnsCount === 0) return this.defaultPreferences.includes(name)
      return this.Settings.displayFeatures.solutions_list[name]
    },
    async duplicate(courseId, accessAfter) {
      try {
        const data = {
          courseId,
          language: this.$i18n.locale,
        }
        this.setFetching(true)
        const response = await this.attemptCourseDuplicate(data)
        this.modalConfirmDuplicate = false

        if (!accessAfter) {
          this.setFeedback({ message: i18n.t('solutions.list:duplicate.success') })
          this.pgtrRefresh()
          return
        }

        this.$router.push({
          name: 'solutions.update',
          params: { id: response.data.id },
        })
      } catch (error) {
        if (error.response.data.message === 'course_name_greater_than_allowed') {
          this.setFeedback({
            message: i18n.t('duplicate.feedback.error:course_name_greater_than_allowed'),
            type: 'error',
          })
        } else {
          this.setFeedback({ message: i18n.t('solutions.list:duplicate.error'), type: 'error' })
        }
      } finally {
        this.setFetching(false)
      }
    },
    confirmDuplicate(item) {
      this.solutionDuplicate = {
        id: item.course_id,
        name: item.course_name,
      }
      this.modalConfirmDuplicate = true
    },
    closeModalConfirmDuplicate() {
      this.modalConfirmDuplicate = false
    },

    /**
     * Return a specific meta of solution
     * @param {Object} solution
     * @param {String} meta
     * @returns {String|Boolean} The value of the specified meta, or false if not found
     */
    getSolutionMeta(solution, meta) {
      if (!this.$isEnabledFeature('course_metas')) return

      const foundMeta = solution._embedded.meta.find((embeddedMeta) => embeddedMeta.alias === meta)

      if (!foundMeta || !foundMeta.value) return false

      switch (foundMeta.type) {
        case 'select':
          return this.mapAndJoinMetaValues(
            foundMeta.options.filter((option) => foundMeta.value === option.id)
          )
        case 'multiple_select':
          return this.mapAndJoinMetaValues(
            foundMeta.options.filter((option) => {
              return foundMeta.value.some((val) => val === option.id)
            })
          )
        case 'date':
          return this.formatDate(foundMeta.value)
        default:
          return foundMeta.value
      }
    },
    mapAndJoinMetaValues(values) {
      return values.map((option) => option.fields.name).join(', ')
    },
    hasIATool(tools) {
      return JSON.parse(tools).find((tool) => tool.alias === 'aiTutor')
    },
  },
}
</script>

<template>
  <div>
    <SolutionsHeader
      :title="$t('solutions:header.title')"
      :description="$t('solutions:header.description')"
    />
    <div class="content p-4">
      <div class="p-3">
        <FilterList v-if="pgtrLoaded">
          <Action
            v-if="notEqualsProfile('student') && canWrite('courses')"
            slot="button"
            :dark="accessibility"
            :url="{ name: 'solutions.create' }"
            :text="$t('solutions.list:btn.add')"
            primary
            large
            fixed-width
          />
          <FilterListSearch
            slot="search"
            :dark="accessibility"
            :initial-value="pgtrParams.query['name']"
            hide-error-details
            @search="pgtrSetSearch('name', $event)"
          />
          <FilterListTag
            slot="tag"
            :tag-all-filters-active="pgtrTagAllFilters"
            :options="pgtrFilterTagOptions"
            :initial-value="pgtrParams.filter"
            state="Courses"
          />
          <FilterListOrder
            slot="order"
            :options="filterListOrderOptions"
            :label="$t('global:filter.order.label')"
            :initial-value="pgtrParams.order"
            on-server
            @update-orders="pgtrUpdateOrder"
          />
          <FilterListOrder
            slot="categories"
            :label="$tc('global:category', 2)"
            :options="filterCategoriesOptions"
            :select-all-option="false"
            :initial-value="pgtrParams.filter.categories"
            multiple
            on-server
            @update-orders="pgtrSetFilterCategories"
          />
          <FilterPreferences
            slot="preferences"
            :columns="preferenceColumns"
            :default-preferences="defaultPreferences"
            field="solutions_list"
          />
        </FilterList>
      </div>

      <EmptyMessage
        v-if="Courses.solutionsList && Courses.solutionsList.length === 0 && !pgtrIsFetching"
      >
        <h2 v-if="pgtrIsSearching">{{ $t('global:search.empty.title') }}</h2>
        <h2 v-if="pgtrIsFiltering && !pgtrIsSearching">
          {{ $t('solutions.list:filter.empty.title') }}
        </h2>
        <h2 v-if="!pgtrIsFiltering && !pgtrIsSearching">{{ $t('solutions.list:empty.title') }}</h2>

        <p v-if="pgtrIsSearching">{{ $t('global:search.empty.message') }}</p>
        <p v-if="!pgtrIsFiltering && !pgtrIsSearching">{{ $t('solutions.list:empty.message') }}</p>
      </EmptyMessage>

      <div
        v-if="Courses.solutionsList && Courses.solutionsList.length > 0"
        class="center solutions-list__table"
      >
        <Datatable
          :items="Courses.solutionsList"
          :dark="accessibility"
        >
          <template
            v-if="!$media.mobile"
            slot="thead"
          >
            <tr>
              <th
                v-if="checkIfColumnIsVisible('name')"
                class="th"
              >
                {{ $t('solutions.list:datatable.header.1') }}
              </th>

              <th
                v-if="checkIfColumnIsVisible('slug') && $isEnabledFeature('slug_identity')"
                class="th"
              >
                {{ $t('global:slug.identity') }}
              </th>

              <th
                v-if="checkIfColumnIsVisible('type')"
                class="th"
                width="120"
              >
                {{ $t('solutions.list:datatable.header.2') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('status')"
                class="th"
              >
                {{ $t('solutions.list:datatable.header.3') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('topics_count')"
                class="th"
              >
                {{ $t('solutions.list:datatable.header.4') }}
              </th>

              <th
                v-if="checkIfColumnIsVisible('branch')"
                class="th"
              >
                {{ $t('solutions.list:datatable.header.5') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('category')"
                class="th"
              >
                {{ $t('solutions.list:datatable.header.6') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('workload')"
                class="th"
              >
                {{ $t('solutions.list:datatable.header.7') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('duration')"
                class="th"
              >
                {{ $t('solutions.list:datatable.header.8') }}
              </th>
              <template v-if="$isEnabledFeature('course_metas')">
                <th
                  v-for="meta in visibleMetaColumns"
                  :key="meta.value"
                  class="th"
                >
                  {{ meta.label }}
                </th>
              </template>
              <th
                class="th"
                width="40"
              ></th>
              <th
                class="th"
                width="40"
              ></th>
            </tr>
          </template>
          <template
            slot="tbody"
            slot-scope="props"
          >
            <tr
              v-if="$media.mobile && checkIfColumnIsVisible('name')"
              class="tr-colspan"
            >
              <td
                class="td"
                colspan="4"
              >
                <div class="cell__name">
                  <div class="solutions-list__image">
                    <img
                      class="name__image"
                      :src="props.item.course_image"
                      :alt="props.item.course_name"
                    />
                    <TooltipSlot
                      v-if="hasIATool(props.item.course_available_tools)"
                      :width="180"
                      horizontal-align="right"
                      shadow
                      arrow
                    >
                      <template #activator>
                        <Icon name="chatbot" />
                      </template>

                      <template #content>
                        <p class="solutions-list__image--tooltip">
                          {{ $t('solutions.list:chatbot.tooltip') }}
                        </p>
                      </template>
                    </TooltipSlot>
                  </div>
                  <span class="td-text bolder name__text">{{ props.item.course_name }}</span>
                  <TooltipSlot
                    :width="180"
                    :disable-content="!props.item.only_read_branch"
                    horizontal-align="right"
                    shadow
                  >
                    <template #activator>
                      <Dropdown
                        v-if="notEqualsProfile('student') && canWrite('courses')"
                        :disabled="props.item.only_read_branch"
                        class="cell__dropdown"
                        icon="dots-vertical"
                        right
                      >
                        <DropdownLink
                          v-if="props.item.course_active === false"
                          :text="$t('global:activate')"
                          @click="activateToggle(props.item.course_id, props.index)"
                        />
                        <DropdownLink
                          v-if="props.item.course_active === true"
                          :text="$t('global:deactivate')"
                          @click="deactivate(props.item.course_id, props.index)"
                        />
                        <DropdownLink
                          :text="$t('global:edit')"
                          @click="edit(props.item.course_id)"
                        />
                        <DropdownLink
                          :text="$t('global:remove')"
                          @click="confirmRemove(props.item.course_id, props.item.course_name)"
                        />
                        <DropdownLink
                          :text="$t('global:duplicate')"
                          @click="confirmDuplicate(props.item)"
                        />
                        <DropdownLink
                          :text="$t('global:add.topic')"
                          @click="addTopic(props.item.course_id)"
                        />
                        <DropdownLink
                          :text="$t('global:list.topic')"
                          @click="listTopics(props.item.course_id)"
                        />
                      </Dropdown>
                    </template>

                    <template #content>
                      <p class="solutions-list__image--tooltip">
                        {{ $t('trails.create.solutions.only.read.branch.blocker') }}
                      </p>
                    </template>
                  </TooltipSlot>
                </div>
              </td>
            </tr>
            <tr :class="{ 'tr-mobile': $media.mobile }">
              <td
                v-if="!$media.mobile && checkIfColumnIsVisible('name')"
                class="td"
              >
                <div class="cell__name">
                  <div class="solutions-list__image">
                    <img
                      class="name__image"
                      :src="props.item.course_image"
                      :alt="props.item.course_name"
                    />
                    <TooltipSlot
                      v-if="hasIATool(props.item.course_available_tools)"
                      :width="180"
                      horizontal-align="right"
                      shadow
                      arrow
                    >
                      <template #activator>
                        <Icon name="chatbot" />
                      </template>

                      <template #content>
                        <p class="solutions-list__image--tooltip">
                          {{ $t('solutions.list:chatbot.tooltip') }}
                        </p>
                      </template>
                    </TooltipSlot>
                  </div>
                  <span class="td-text bolder name__text">{{ props.item.course_name }}</span>
                </div>
              </td>

              <td
                v-if="checkIfColumnIsVisible('slug') && $isEnabledFeature('slug_identity')"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('global:slug.identity') }}</span
                >
                <SlugTooltip :slug="props.item.slug" />
              </td>

              <td
                v-if="checkIfColumnIsVisible('type')"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('solutions.list:datatable.header.2') }}</span
                >
                <span :class="{ 'td-tag': !$media.mobile, 'td-text': $media.mobile }">{{
                  props.item.course_type_alias
                    ? $t('solutions.type:' + props.item.course_type_alias)
                    : $t('global:without.modality')
                }}</span>
              </td>
              <td
                v-if="checkIfColumnIsVisible('status')"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('solutions.list:datatable.header.3') }}</span
                >
                <span class="td-text">{{
                  props.item.course_active
                    ? $t('global:active.female')
                    : $t('global:inactive.female')
                }}</span>
              </td>
              <td
                v-if="checkIfColumnIsVisible('topics_count')"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('solutions.list:datatable.header.4') }}</span
                >
                <span class="td-text">{{
                  props.item.topics_count ? props.item.topics_count : '-'
                }}</span>
              </td>

              <td
                v-if="checkIfColumnIsVisible('branch')"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('solutions.list:datatable.header.5') }}</span
                >
                <BranchesTooltip :branches="getSolutionBranches(props.item)" />
                <TooltipSlot
                  v-if="props.item.only_read_branch"
                  :width="460"
                  :arrow="!$media.mobile"
                  class="tooltip__topic"
                  shadow
                  dark
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
              </td>
              <td
                v-if="checkIfColumnIsVisible('category')"
                class="td td__category"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('solutions.list:datatable.header.6') }}</span
                >
                <span
                  v-for="categorie in getSolutionCategories(props.item)"
                  :key="categorie.name"
                  class="category-tag td-tag"
                  >{{ categorie.name }}</span
                >
                <span
                  v-if="getSolutionCategories(props.item).length === 0"
                  class="td-text"
                  >-</span
                >
              </td>
              <td
                v-if="checkIfColumnIsVisible('workload')"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('solutions.list:datatable.header.7') }}</span
                >
                <span class="td-text">{{
                  formatVisualTime({
                    type: props.item.course_workload_type,
                    value: props.item.course_workload_value,
                  })
                }}</span>
              </td>
              <td
                v-if="checkIfColumnIsVisible('duration')"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('solutions.list:datatable.header.8') }}</span
                >
                <span class="td-text">{{ getDurationText(props.item.course_duration) }}</span>
              </td>
              <template v-if="$isEnabledFeature('course_metas')">
                <td
                  v-for="meta in visibleMetaColumns"
                  :key="meta.value"
                  class="td"
                >
                  <span
                    v-if="$media.mobile"
                    class="td-text-header"
                    >{{ meta.label }}</span
                  >
                  <span class="td-text">
                    {{ getSolutionMeta(props.item, meta.value) || '-' }}
                  </span>
                </td>
              </template>

              <td
                v-if="!$media.mobile"
                class="td td-button td-small text-right"
              >
                <TooltipSlot
                  :disable-content="!props.item.only_read_branch"
                  :width="460"
                  class="tooltip__topic"
                  shadow
                >
                  <template #activator>
                    <Action
                      :text="$t('global:view.more')"
                      :dark="accessibility"
                      :disabled="props.item.only_read_branch"
                      type="button"
                      flat
                      @click="edit(props.item.course_id)"
                    />
                  </template>

                  <template #content>
                    <p class="tooltip__description">
                      {{ $t('trails.create.solutions.only.read.branch.blocker') }}
                    </p>
                  </template>
                </TooltipSlot>
              </td>
              <td
                v-if="!$media.mobile || !checkIfColumnIsVisible('name')"
                class="td td-actions"
                width="40"
              >
                <TooltipSlot
                  :disable-content="!props.item.only_read_branch"
                  :width="460"
                  class="tooltip__topic"
                  shadow
                >
                  <template #activator>
                    <Dropdown
                      v-if="notEqualsProfile('student') && canWrite('courses')"
                      :right="!!checkIfColumnIsVisible('name')"
                      :disabled="props.item.only_read_branch"
                      icon="dots-vertical"
                    >
                      <DropdownLink
                        v-if="props.item.course_active === false"
                        :text="$t('global:activate')"
                        @click="activateToggle(props.item.course_id, props.index)"
                      />
                      <DropdownLink
                        v-if="props.item.course_active === true"
                        :text="$t('global:deactivate')"
                        @click="deactivate(props.item.course_id, props.index)"
                      />
                      <DropdownLink
                        :text="$t('global:edit')"
                        @click="edit(props.item.course_id)"
                      />
                      <DropdownLink
                        :text="$t('global:remove')"
                        @click="confirmRemove(props.item.course_id, props.item.course_name)"
                      />
                      <DropdownLink
                        :text="$t('global:duplicate')"
                        @click="confirmDuplicate(props.item)"
                      />
                      <DropdownLink
                        :text="$t('global:add.topic')"
                        @click="addTopic(props.item.course_id)"
                      />
                      <DropdownLink
                        :text="$t('global:list.topic')"
                        @click="listTopics(props.item.course_id)"
                      />
                    </Dropdown>
                  </template>

                  <template #content>
                    <p class="tooltip__description">
                      {{ $t('trails.create.solutions.only.read.branch.blocker') }}
                    </p>
                  </template>
                </TooltipSlot>
              </td>
            </tr>
          </template>
        </Datatable>

        <Pagination
          :active-page="pgtrParams.page"
          :page-count="pgtrLastPage"
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
          @go-to-page="pgtrParams.page = $event"
          @change-items-per-page="pgtrParams.limit = $event"
        />
      </div>

      <Modal
        v-if="
          dependencies.offerings > 0 || (dependencies.sessions > 0 && dependencies.enrollments > 0)
        "
        :active="modalConfirmRemove"
        :cancel="false"
        @close="closeModalConfirmRemove"
      >
        <div class="modal-confirm">
          <div class="modal-confirm-content">
            <h3 class="modal-confirm-title">{{ $t('solutions.list:modal.confirm.title') }}</h3>
            <div
              v-if="showDescriptionModalConfirm"
              class="modal-confirm-description"
            >
              <p class="text-color">{{ $t('solutions.list:modal.confirm.message') }}</p>
              <Datatable
                :items="listAllLinks"
                :dark="accessibility"
              >
                <template slot="thead">
                  <tr>
                    <th class="th">{{ $t('solutions.list:datatable.column.link') }}</th>
                    <th
                      class="th"
                      style="text-align: right"
                    >
                      {{ $t('solutions.list:datatable.column.quantity') }}
                    </th>
                  </tr>
                </template>
                <template
                  slot="tbody"
                  slot-scope="props"
                >
                  <tr v-if="props.item.quantity">
                    <td class="td">
                      <span class="td-text bolder">{{
                        props.item.name ? props.item.name : '-'
                      }}</span>
                    </td>
                    <td
                      class="td"
                      style="text-align: right"
                    >
                      <span class="td-text">{{
                        props.item.quantity ? props.item.quantity : '-'
                      }}</span>
                    </td>
                  </tr>
                </template>
              </Datatable>
            </div>
          </div>
          <div class="modal-confirm-footer">
            <Action
              :text="$t('global:understood')"
              :dark="accessibility"
              type="button"
              class="btn-right"
              flat
              @click="closeModalConfirmRemove()"
            />
          </div>
        </div>
      </Modal>

      <Modal
        v-else
        :active="modalConfirmRemove"
        :cancel="false"
        @close="closeModalConfirmRemove"
      >
        <div class="modal-confirm">
          <div class="modal-confirm-content">
            <h3 class="modal-confirm-title">{{ $t('solutions.list:modal.confirm.title.1') }}</h3>
            <div class="modal-confirm-description">
              <p class="text-color">{{ $t('solutions.list:modal.confirm.message.1') }}</p>
            </div>
          </div>
          <div class="modal-confirm-footer">
            <Action
              :text="$t('global:cancel')"
              :dark="accessibility"
              type="button"
              flat
              @click="closeModalConfirmRemove()"
            />
            <Action
              v-if="dependencies.isRemovable === true"
              :text="$t('global:proceed')"
              :dark="accessibility"
              type="button"
              class="btn-right"
              flat
              @click="remove()"
            />
            <span v-else>{{ $t('solutions.list:modal.confirm.remove.not.allowed') }}</span>
          </div>
        </div>
      </Modal>

      <Modal
        :active="modalConfirmDuplicate"
        :cancel="false"
        @close="closeModalConfirmDuplicate"
      >
        <div class="modal-confirm">
          <div class="modal-confirm-content">
            <h3 class="modal-confirm-title">
              {{ $t('solutions.list:modal.confirm.duplicate.title') }}
            </h3>
            <div class="modal-confirm-description">
              <div class="modal-duplicate__message">
                <p class="text-color">
                  {{
                    $t('solutions.list:modal.confirm.duplicate.message.start', {
                      solutionName: solutionDuplicate.name,
                    })
                  }}
                </p>

                <ul>
                  <li>{{ $t('solutions.list:modal.confirm.duplicate.message.items.video') }}</li>
                  <li>{{ $t('solutions.list:modal.confirm.duplicate.message.items.audio') }}</li>
                  <li>{{ $t('solutions.list:modal.confirm.duplicate.message.items.pdf') }}</li>
                  <li>{{ $t('solutions.list:modal.confirm.duplicate.message.items.pptx') }}</li>
                  <li>{{ $t('solutions.list:modal.confirm.duplicate.message.items.scorm') }}</li>
                  <li>
                    {{ $t('solutions.list:modal.confirm.duplicate.message.items.external.link') }}
                  </li>
                  <li>
                    {{ $t('solutions.list:modal.confirm.duplicate.message.items.examination') }}
                  </li>
                  <li>{{ $t('solutions.list:modal.confirm.duplicate.message.items.research') }}</li>
                </ul>

                <p class="text-color">{{ $t('solutions.list:modal.confirm.duplicate.message.end') }}</p>
              </div>
            </div>
          </div>
          <div class="modal-confirm-footer">
            <Action
              :text="$t('global:cancel')"
              :dark="accessibility"
              type="button"
              flat
              @click="closeModalConfirmDuplicate"
            />
            <Action
              :text="$t('solutions.list:modal.confirm.duplicate.access')"
              :dark="accessibility"
              type="button"
              class="btn-right"
              flat
              @click="duplicate(solutionDuplicate.id, true)"
            />
          </div>
        </div>
      </Modal>

      <Modal
        :active="modalConfirmDeactivate"
        :cancel="false"
        @close="closeModalConfirmDeactivate"
      >
        <div class="modal-confirm">
          <div class="modal-confirm-content">
            <h3 class="modal-confirm-title">
              {{ $t('solutions.list:modal.deactivate.confirm.title') }}
            </h3>
            <div class="modal-confirm-description">
              <p class="text-color">{{ $t('solutions.list:modal.confirm.deactivate.message') }}</p>
              <ul>
                <li v-if="deactivateDependencies.offerings">
                  {{
                    $t('solutions.list:modal.confirm.dependency.offerings', {
                      num: deactivateDependencies.offerings,
                    })
                  }}
                </li>
                <li v-if="deactivateDependencies.paths">
                  {{
                    $t('solutions.list:modal.confirm.dependency.paths', {
                      num: deactivateDependencies.paths,
                    })
                  }}
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-confirm-footer">
            <Action
              :dark="accessibility"
              :text="$t('global:deactivate')"
              type="button"
              flat
              @click="activateToggle(solutionDeactivate.courseId, solutionDeactivate.index)"
            />
            <Action
              :text="$t('global:cancel')"
              :dark="accessibility"
              type="button"
              class="btn-cancel"
              flat
              @click="closeModalConfirmDeactivate()"
            />
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/app/solutions/styles.scss';
</style>
