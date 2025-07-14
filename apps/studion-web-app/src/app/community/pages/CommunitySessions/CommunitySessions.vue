<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import i18n from '@/support/i18n'

import {
  defaultFilterTagOptions,
  defaultFilterListOrderOptions,
  makePreferenceColumns,
  makeDefaultPreferences,
} from './util'

import { communityMixin } from '@/mixins/community'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import FilterPreferences from '@/components/general/FilterPreferences'
import Pagination from '@/components/general/Pagination'
import EmptyMessage from '@/components/general/EmptyMessage'
import DatatableSessions from './components/DatatableSessions.vue'
const Modal = () => import('@/components/general/Modal')

export default defineComponent({
  name: 'CommunitySessionsClass',

  components: {
    Action,
    ActionBar,
    ContentHeader,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    FilterPreferences,
    Pagination,
    EmptyMessage,
    DatatableSessions,
    Modal,
  },

  mixins: [communityMixin],

  beforeRouteUpdate(to, _, next) {
    if (to.name === 'community.sessions') {
      this.loadSessions()
    }
    next()
  },

  data() {
    return {
      isFiltering: false,
      modalConfirmRemove: false,
      sessionDependencies: {
        hasOffering: false,
        enrollments: 0,
        isRemovable: false,
      },
      paging: { actualPage: 1 },
      queryParams: {
        page: 1,
        filter: {},
        order: { created_at: 'desc' },
      },
      isSearching: false,
      tagAllFilters: null,
      selectedFilters: [],
      metadataColumns: [],
      defaultPreferences: [...makeDefaultPreferences()],
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility', 'Sessions']),

    isEditing() {
      return this.$route.meta.editing || false
    },

    filterTagOptions() {
      return defaultFilterTagOptions()
    },

    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },

    preferenceColumns() {
      let preferences = [...makePreferenceColumns()]

      if (!this.$isEnabledFeature('branching'))
        preferences = preferences.filter(({ value }) => value !== 'branch')

      if (!this.$isEnabledFeature('slug_identity')) {
        preferences = preferences.filter(({ value }) => value !== 'slug')
      }

      return preferences
    },

    preferenceColumnsCount() {
      let preferences = []
      for (let key in this.Settings.displayFeatures.sessions_list) {
        if (this.Settings.displayFeatures.sessions_list[key]) preferences.push(key)
      }
      return preferences.length
    },

    datatableWidth() {
      const columnsNumber = this.preferenceColumnsCount

      if (this.$media.mobile) return '100%'

      if (columnsNumber >= 12) return `calc(100% + ${columnsNumber * 10}%)`

      if (columnsNumber >= 8) return `calc(100% + ${columnsNumber * 8}%)`

      return ''
    },
  },

  watch: {
    'queryParams.page'() {
      this.loadSessions()
    },
  },

  created() {
    this.setFetching(true)
    this.loadItemsPerPagePreferences(this.queryParams)

    this.attemptCategoryListRetrieval()
      .then((categories) => {
        categories.data.data.forEach((category) => {
          this.filterTagOptions.forEach((group) => {
            if (group.name === 'categories' || group.name === 'course_categories') {
              const property = group.name === 'categories' ? 'categories' : 'course_categories'
              group.items.push({
                text: category.name,
                id: category.id,
                property: property,
              })
            }
          })
        })
      })
      .finally(() => {
        this.loadSessions()
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptSessionRemoval',
      'attemptListBatchProcess',
      'attemptSessionListRetrieval',
      'attemptSessionsBatchListRetrieval',
      'attemptSessionDependenciesRetrieval',
      'attemptCategoryListRetrieval',
      'setSessionsData',
      'removeSessionsItem',
    ]),
    changeItemsPerPage(val) {
      this.queryParams.limit = val
      if (this.queryParams.page !== 1) {
        this.queryParams.page = 1
        return
      }
      this.loadSessions()
    },
    openModalAddSession() {
      this.setSessionsData({ path: 'current', value: null })
      this.$router.push({ name: 'community.session.add' })
    },
    openModalSessionInfo(id) {
      this.$router.push({
        name: 'community.session.edit',
        params: {
          id: id,
        },
      })
    },
    openModal({ item, index }) {
      this.setSessionsData({ path: 'current', value: item })
      this.setSessionsData({ path: 'currentIndex', value: index })
      this.openModalSessionInfo(item.id)
    },
    openTimelineModal(data) {
      this.setSessionsData({
        path: 'current',
        value: data,
      })

      this.$router.push({
        name: 'community.sessions.timeline',
        params: { sessionId: data.id },
      })
    },
    removeItemDirectly(item, index) {
      this.setFetching(true)
      this.attemptSessionRemoval(item.id)
        .then(() => {
          this.setFeedback({
            message: i18n.t('community.sessions:feedback.removed', { sessionName: item.name }),
          })
          this.removeSessionsItem({ index: index, deleteCount: 1 })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openRecoveryModal(session) {
      this.$router.push({
        name: 'community.session.recovery',
        params: { sessionId: session.id, topicName: session.recoveryExamination.topicName },
      })
    },
    openModalConfirmRemove({ item, index }) {
      this.setSessionsData({ path: 'current', value: item })
      this.setSessionsData({ path: 'currentIndex', value: index })

      this.setFetching(true)
      this.attemptSessionDependenciesRetrieval(item.id)
        .then(({ data }) => {
          this.sessionDependencies = data
          if (item.offering) {
            this.sessionDependencies.offeringName = item.offering.title
          }
          this.modalConfirmRemove = !this.sessionDependencies.isRemovable
          if (!this.modalConfirmRemove) {
            this.removeItemDirectly(item, index)
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    closeModalConfirmRemove() {
      this.modalConfirmRemove = false
    },
    remove() {
      this.modalConfirmRemove = false
      this.setFetching(true)
      this.attemptSessionRemoval(this.Sessions.current.id)
        .then(() => {
          this.setFeedback({
            message: i18n.t('community.sessions:feedback.removed', {
              sessionName: this.Sessions.current.name,
            }),
          })
          this.removeSessionsItem({ index: 'currentIndex', deleteCount: 1 })
          this.setSessionsData({ path: 'current', value: null })
          this.setSessionsData({ path: 'currentIndex', value: null })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    loadSessions() {
      this.setFetching(true)
      let dataParams = JSON.parse(JSON.stringify(this.queryParams))
      if (this.$isEnabledFeature('branching')) dataParams.embed = 'courses'
      dataParams.filter = this.checkOverrideFilters(dataParams.filter)
      this.attemptSessionListRetrieval(dataParams)
        .then(({ data }) => {
          let sessionsList = data
          if (this.isEditing) {
            let currentIndex = this.Sessions.items.findIndex((item) => {
              return item.id === parseInt(this.$route.params.id)
            })
            this.setSessionsData({ path: 'current', value: this.Sessions.items[currentIndex] })
            this.setSessionsData({ path: 'currentIndex', value: currentIndex })
            if (!this.Sessions.current) {
              this.$router.push({ name: 'community.sessions' })
            }
          }

          if (sessionsList.data.length) {
            this.setFetching(true)
            this.attemptSessionsBatchListRetrieval(sessionsList.data.map((session) => session.id))
              .then(({ data }) => {
                sessionsList.data.forEach((item) => {
                  item.pendingBatch = data[item.id] ? data[item.id].length : 0
                })
              })
              .finally(() => {
                this.paging = sessionsList
                this.setSessionsData({ path: 'items', value: sessionsList.data })
                this.setFetching(false)
              })
          } else {
            this.paging = sessionsList
            this.setSessionsData({ path: 'items', value: sessionsList.data })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    checkOverrideFilters(params) {
      if ('class_with_enrollments' in params && 'class_without_enrollments' in params) {
        delete params.class_with_enrollments
        delete params.class_without_enrollments
      }
      if ('class_with_offering' in params && 'class_without_offering' in params) {
        delete params.class_with_offering
        delete params.class_without_offering
      }
      return params
    },
    updateOrders(item) {
      let order = {}
      if (item && item.property) {
        order[item.property] = item.type
      }
      this.queryParams.order = order
      this.loadSessions()
    },
    search(value) {
      this.isSearching = value !== ''
      delete this.queryParams.page
      this.queryParams.query = { name: value }
      this.loadSessions()
    },

    queryFilters() {
      let params = {
        categories: [],
      }

      this.selectedFilters.forEach((obj) => {
        if (!Array.isArray(params[obj.property])) {
          params[obj.property] = []
        }
        params[obj.property].push(obj.id)
      })

      this.queryParams.filter = params
      this.queryParams.page = 1

      this.loadSessions()
    },

    updateFilters(type, filters) {
      this.selectedFilters = filters

      this.queryFilters()
    },

    nextPage() {
      if (this.paging.nextPage) {
        this.queryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.queryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.queryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.queryParams.page = this.paging.firstPage
      }
    },
    showTagAllFilters(value) {
      this.tagAllFilters = value
    },
    accessClassroom(sessionUuid) {
      return this.$router.push({
        name: 'classroom.panel.dashboard',
        params: { session_uuid: sessionUuid },
      })
    },
    isFilteringSearch(value) {
      this.isFiltering = value
    },
  },
})
</script>

<template>
  <div class="main-content community community-sessions">
    <ContentHeader
      :key="$userUuid"
      :title="$t('community:tab.link.5')"
      :description="$t('community:header.description')"
      :tag="$t('community:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="py-2 px-4">
      <FilterList>
        <Action
          v-if="notEqualsProfile('student') && canWrite('sessions')"
          slot="button"
          class="mb-4"
          :text="$t('community.sessions:btn.add')"
          :dark="accessibility"
          type="button"
          primary
          large
          fixed-width
          @click="openModalAddSession()"
        />

        <FilterListSearch
          slot="search"
          :dark="accessibility"
          hide-error-details
          @search="search"
          @tag-all-filters="showTagAllFilters"
        />

        <FilterListTag
          slot="tag"
          :options="filterTagOptions"
          :tag-all-filters-active="tagAllFilters"
          state="users"
          @update-filters="updateFilters('filter', $event)"
          @update-filtering="isFilteringSearch"
        />

        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          state="users"
          on-server
          @update-orders="updateOrders"
        />

        <FilterPreferences
          slot="preferences"
          :columns="preferenceColumns"
          :default-preferences="defaultPreferences"
          field="sessions_list"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <EmptyMessage v-if="Sessions.items.length === 0">
        <!-- Default -->
        <template v-if="!isSearching && !isFiltering">
          <h2>{{ $t('community.sessions:empty.title') }}</h2>

          <p v-html="$t('community.sessions:empty.message')"></p>
        </template>

        <!-- Filter -->
        <h2 v-if="Sessions.items.length === 0 && !isSearching && isFiltering">
          {{ $t('community.sessions:filter.empty.title') }}
        </h2>

        <!-- Search -->
        <template v-if="(!isFiltering || isFiltering) && isSearching">
          <h2>{{ $t('global:search.empty.title') }}</h2>

          <p class="text-color">{{ $t('global:search.empty.message') }}</p>
        </template>
      </EmptyMessage>
    </div>

    <div class="m-4">
      <div
        v-if="Sessions.items.length"
        class="community-sessions__table"
        :style="{ '--width': datatableWidth }"
      >
        <DatatableSessions
          :key="$userUuid"
          class="overflow-x-scroll w-12"
          :sessions="Sessions.items"
          :default-preferences="defaultPreferences"
          @open:timeline-modal="openTimelineModal"
          @open:modal="openModal"
          @open:remove-modal="openModalConfirmRemove"
          @open:recovery-modal="openRecoveryModal"
          @access:classroom="accessClassroom"
        />

        <Pagination
          :active-page="paging.actualPage"
          :page-count="paging.lastPage"
          @next-page="nextPage"
          @previous-page="previousPage"
          @first-page="firstPage"
          @last-page="lastPage"
          @go-to-page="queryParams.page = $event"
          @change-items-per-page="changeItemsPerPage"
        />
      </div>
    </div>

    <router-view></router-view>

    <Modal
      :active="modalConfirmRemove"
      :cancel="false"
      @close="closeModalConfirmRemove"
    >
      <div class="modal-confirm">
        <div class="modal-confirm-content">
          <h3
            v-if="sessionDependencies.hasOffering"
            class="modal-confirm-title"
          >
            {{ $t('community.sessions:modal.confirm.title.1') }}
          </h3>

          <h3
            v-else-if="sessionDependencies.enrollments > 0"
            class="modal-confirm-title"
          >
            {{ $t('community.sessions:modal.confirm.title.2') }}
          </h3>
        </div>

        <div
          v-if="sessionDependencies.hasOffering || sessionDependencies.enrollments > 0"
          class="modal-confirm-description"
        >
          <p
            v-if="sessionDependencies.hasOffering"
            v-html="
              $t('community.sessions:modal.confirm.message.1', {
                offeringName: sessionDependencies.offeringName,
              })
            "
          ></p>
          <p
            v-else-if="sessionDependencies.enrollments > 0"
            v-html="
              $t('community.sessions:modal.confirm.message.2', {
                num: sessionDependencies.enrollments,
              })
            "
          ></p>
        </div>

        <div class="modal-confirm-footer">
          <Action
            :text="$t('global:understood')"
            :dark="accessibility"
            class="btn-right"
            type="button"
            flat
            @click="closeModalConfirmRemove()"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import '~@/app/community/styles.scss';
</style>
