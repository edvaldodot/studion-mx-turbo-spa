<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import formatISODuration from '@/support/utils/formatISODuration'

import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterPreferences from '@/components/general/FilterPreferences'
import EmptyMessage from '@/components/general/EmptyMessage'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Pagination from '@/components/general/Pagination'
import NotificationCircle from '@/components/general/NotificationCircle'
import BranchesTooltip from '@/app/solutions/components/BranchesTooltip'

import { makeDefaultPreferences, makePreferenceColumns } from '../../../shared'

const Modal = () => import('@/components/general/Modal')

export default {
  name: 'TrailsList',

  components: {
    ContentHeader,
    ActionBar,
    Action,
    Modal,
    FilterList,
    FilterListSearch,
    FilterListTag,
    FilterListOrder,
    FilterPreferences,
    EmptyMessage,
    Datatable,
    Dropdown,
    DropdownLink,
    Pagination,
    NotificationCircle,
    BranchesTooltip,
  },

  mixins: [paginateMixin],

  data() {
    return {
      filterCategoriesOptions: [],
      confirmTrailRemoveModal: false,
      defaultPreferences: [...makeDefaultPreferences()],
      trailId: 0,
      pgtrLoaded: false,
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility', 'fetching', 'Trails']),
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },

    preferenceColumns() {
      let preferences = [...makePreferenceColumns()]

      if (!this.$isEnabledFeature('branching')) {
        return preferences.filter(({ value }) => value !== 'branch')
      }

      return preferences
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
    this.setup()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptTrailsTypesRetrieval',
      'deleteTrail',
      'attemptCategoryListRetrieval',
    ]),

    setup() {
      this.setFetching(true)
      Promise.all([this.attemptTrailsTypesRetrieval(), this.attemptCategoryListRetrieval()])
        .then(([types, categories]) => {
          this.pgtrFilterTagOptions.push({
            title: 'Tipo',
            name: 'paths_type',
            items: types.data.map(({ alias }) => ({
              active: false,
              id: alias,
              text: this.$t(`trails.type:${alias}`),
              property: 'paths_type',
            })),
          })
          this.filterCategoriesOptions = categories.data.data.map((category) => ({
            text: category.name,
            value: category.id,
          }))
        })
        .catch((err) => {
          this.setFeedback({ message: err.message })
        })
        .finally(() => {
          this.setFetching(false)

          this.pgtrDefaultOrder = {
            property: 'created_at',
            type: 'desc',
          }

          this.pgtrRouteParams.active = true
          this.pgtrInitializePagination('trailsResource', null, {
            embed: 'enrollments_count,courses_count',
          })

          this.pgtrLoaded = true
        })
    },

    addUsers(id) {
      this.$router.push({ name: 'trails.users', params: { id } })
    },

    edit(id) {
      this.$router.push({ name: 'trails.update', params: { id } })
    },

    editSolutions(id) {
      this.$router.push({ name: 'trails.create.solutions', params: { id } })
    },

    confirmTrailRemoval() {
      this.setFetching(true)
      this.deleteTrail(this.trailId)
        .then(() => {
          this.pgtrRefresh()
        })
        .catch(({ response: { data } }) => {
          this.setFeedback({ message: this.$t('trails.delete:feedback.error:' + data.message) })
        })
        .finally(() => {
          this.confirmTrailRemoveModal = false
          this.setFetching(false)
        })
    },

    openTrailRemoveModal(trailId) {
      this.trailId = trailId
      this.confirmTrailRemoveModal = true
    },

    closeTrailRemoveModal() {
      this.confirmTrailRemoveModal = false
      this.trailId = 0
    },

    formatDurationInterval(duration) {
      return formatISODuration(duration)
    },

    getTrailBranches(item) {
      let branches = []
      if (item.branches) branches = item.branches
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
  },
}
</script>

<template>
  <div class="main-content  trails-list">
    <ContentHeader
      :description="$t('trails:header.description')"
      :title="$t('trails:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-4">
      <FilterList v-if="pgtrLoaded">
        <Action
          v-if="notEqualsProfile('student') && canWrite('paths')"
          slot="button"
          class="mb-2"
          :dark="accessibility"
          :text="$t('trails.list:btn.add')"
          :url="{ name: 'trails.create' }"
          fixed-width
          large
          primary
        />
        <FilterListSearch
          slot="search"
          :dark="accessibility"
          :hide-error-details="true"
          :initial-value="pgtrParams.query['name']"
          @search="pgtrSetSearch('name', $event)"
        />
        <FilterListTag
          slot="tag"
          :options="pgtrFilterTagOptions"
          :tag-all-filters-active="pgtrTagAllFilters"
          :initial-value="pgtrParams.filter"
          state="Trails"
        />
        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :initial-value="pgtrParams.order"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
        <FilterListOrder
          slot="categories"
          :initial-value="pgtrParams.filter['categories']"
          :label="$tc('global:category', 2)"
          :options="filterCategoriesOptions"
          :select-all-option="false"
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

    <div class="p-4">
      <div
        v-if="Trails.trails.length > 0"
        class="center"
      >
        <Datatable
          :dark="accessibility"
          :items="Trails.trails"
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
                {{ $t('trails.list:datatable.header.name') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('trail_type')"
                class="th text-center"
              >
                {{ $t('trails.list:datatable.header.trail_type') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('course_count')"
                class="th text-center"
              >
                {{ $t('trails.list:datatable.header.course_count') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('duration')"
                class="th text-center"
              >
                {{ $t('trails.list:datatable.header.duration') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('student_count')"
                class="th text-center"
              >
                {{ $t('trails.list:datatable.header.student_count') }}
              </th>
              <th
                v-if="checkIfColumnIsVisible('status')"
                class="th text-center"
              >
                {{ $t('trails.list:datatable.header.status') }}
              </th>
              <th
                v-if="$isEnabledFeature('branching') && checkIfColumnIsVisible('branch')"
                class="th"
              >
                {{ $t('trails.list:datatable.header.branch') }}
              </th>
              <th class="th"></th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="props"
          >
            <tr
              v-if="$media.mobile"
              class="tr-colspan"
            >
              <td
                v-if="checkIfColumnIsVisible('name')"
                class="td"
              >
                <span class="td-text bolder">{{ props.item.name }}</span>
              </td>
            </tr>
            <tr>
              <td
                v-if="!$media.mobile && checkIfColumnIsVisible('name')"
                class="td"
                width="30%"
              >
                <span class="td-text bolder">{{ props.item.name }}</span>
              </td>
              <td
                v-if="checkIfColumnIsVisible('trail_type')"
                class="td text-center"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                >
                  {{ $t('trails.list:datatable.header.trail_type') }}
                </span>
                <span :class="{ 'td-tag': !$media.mobile, 'td-text': $media.mobile }">{{
                  $t('trails.type:' + (props.item.paths_type || 'without'))
                }}</span>
              </td>
              <td
                v-if="checkIfColumnIsVisible('course_count')"
                class="td text-center"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('trails.list:datatable.header.course_count') }}</span
                >
                <span class="td-text">{{ props.item.courses_count }}</span>
              </td>
              <td
                v-if="checkIfColumnIsVisible('duration')"
                class="td text-center"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('trails.list:datatable.header.duration') }}</span
                >
                <span class="td-text">{{
                  formatDurationInterval(props.item.duration) || '-'
                }}</span>
              </td>
              <td
                v-if="checkIfColumnIsVisible('student_count')"
                class="td text-center"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('trails.list:datatable.header.student_count') }}</span
                >
                <span class="td-text">{{ props.item.enrollments_count }}</span>
              </td>
              <td
                v-if="checkIfColumnIsVisible('status')"
                class="td text-center"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                  >{{ $t('trails.list:datatable.header.status') }}</span
                >
                <span class="td-text">{{
                  props.item.is_published
                    ? $t('global:published.female')
                    : $t('global:inactive.female')
                }}</span>
              </td>
              <td
                v-if="$isEnabledFeature('branching') && checkIfColumnIsVisible('branch')"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                >
                  {{ $t('trails.list:datatable.header.branch') }}
                </span>
                <BranchesTooltip :branches="getTrailBranches(props.item)" />
              </td>
              <td
                class="td td-actions"
                width="40"
              >
                <NotificationCircle
                  v-if="props.item.has_error"
                  class="absolute right-0 mr-6"
                />
                <Dropdown
                  v-if="notEqualsProfile('student') && canWrite('paths')"
                  icon="dots-vertical"
                  right
                >
                  <DropdownLink
                    v-if="props.item.active === false"
                    :text="$t('global:activate')"
                    @click="activateToggle(props.item.id, props.index)"
                  />
                  <DropdownLink
                    v-if="props.item.active === true"
                    :text="$t('global:deactivate')"
                    @click="deactivate(props.item.id, props.index)"
                  />
                  <DropdownLink
                    :text="$t('trails.list:datatable.dropdown.students')"
                    @click="addUsers(props.item.id)"
                  />
                  <DropdownLink
                    :text="$t('global:route.solutions.index')"
                    @click="editSolutions(props.item.id)"
                  >
                    <template #description>
                      <NotificationCircle
                        v-if="props.item.has_error"
                        class="dropdown-notification"
                      />
                    </template>
                  </DropdownLink>
                  <DropdownLink
                    :text="$t('global:edit')"
                    @click="edit(props.item.id)"
                  />
                  <DropdownLink
                    :text="$t('global:remove')"
                    @click="openTrailRemoveModal(props.item.id)"
                  />
                </Dropdown>
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
    </div>

    <div class="p-4">
      <EmptyMessage v-if="Trails.trails.length === 0 && !pgtrIsFetching">
        <h2 v-if="pgtrIsSearching">{{ $t('global:search.empty.title') }}</h2>
        <h2 v-if="pgtrIsFiltering && !pgtrIsSearching">
          {{ $t('solutions.list:filter.empty.title') }}
        </h2>
        <h2 v-if="!pgtrIsFiltering && !pgtrIsSearching">{{ $t('trails.list:empty.title') }}</h2>

        <p v-if="pgtrIsSearching">{{ $t('global:search.empty.message') }}</p>
        <p v-if="!pgtrIsFiltering && !pgtrIsSearching">{{ $t('trails.list:empty.message') }}</p>
      </EmptyMessage>
    </div>

    <Modal
      :active="confirmTrailRemoveModal"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeTrailRemoveModal()"
        />

        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('trails.delete:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('trails.delete:modal.confirm.message') }}</p>
          </div>
        </div>

        <div class="modal-confirm-footer">
          <Action
            flat
            type="button"
            :text="$t('global:confirm')"
            :dark="accessibility"
            @click="confirmTrailRemoval()"
          />
          <Action
            flat
            type="button"
            :text="$t('global:cancel')"
            :dark="accessibility"
            @click="closeTrailRemoveModal()"
          />
        </div>
      </div>
    </Modal>

    <RouterView />
  </div>
</template>

<style lang="scss">
.trails-list {
  .notification-circle__color {
    position: absolute;
    right: 0;
  }
  .dropdown-notification {
    right: 6px;
  }
}
</style>
