<script>
import { mapActions, mapState } from 'vuex'
import { communityMixin } from '@/mixins/community'
import sharedDataMixin from '../../sharedDataMixin'
import i18n from '@/support/i18n'

import { paginateMixin } from '@/mixins/paginatorMixin'

import debounce from 'lodash/debounce'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import ContentHeader from '@/components/general/ContentHeader'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import FilterPreferences from '@/components/general/FilterPreferences'
import Pagination from '@/components/general/Pagination'
const Modal = () => import('@/components/general/Modal')

import DatatableUsers from './components/DatatableUsers'

import { makeDefaultPreferences } from '../../shared'

export default {
  name: 'CommunityList',

  components: {
    Action,
    ActionBar,
    ActionSubmenu,
    ContentHeader,
    DatatableUsers,
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    FilterPreferences,
    Modal,
    Pagination,
  },

  mixins: [communityMixin, sharedDataMixin, paginateMixin],

  beforeRouteUpdate(to, from, next) {
    const currentRoute = 'community.users'

    if (to.name === currentRoute && from.name !== currentRoute) {
      this.loadUsers()
    }

    next()
  },

  data() {
    return {
      showSubmenu: false,
      paging: { actualPage: 1 },
      userQueryParams: {},
      modalConfirm: false,
      modalConfirmDeactivate: false,
      currentDeleteId: null,
      currentDeleteIndex: null,
      index: null,
      tagAllFilters: null,
      metadataColumns: [],
      filterTagOptions: [
        {
          text: i18n.t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc',
        },
      ],
      defaultPreferences: [...makeDefaultPreferences()],
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility', 'users']),
    isEditing() {
      return this.$route.meta.editing || false
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
    /**
     * Get the number of visible columns from state
     * @returns {number}
     */
    preferenceColumnsCount() {
      let preferences = []
      for (let key in this.Settings.displayFeatures.users_list) {
        if (this.Settings.displayFeatures.users_list[key]) preferences.push(key)
      }
      return preferences.length
    },

    /**
     * Set the datatable width based on the number of visible columns.
     */
    datatableWidth() {
      const columnsNumber = this.preferenceColumnsCount

      if (this.$media.mobile) return '100%'

      if (columnsNumber >= 12) return `calc(100% + ${columnsNumber * 10}%)`

      if (columnsNumber >= 8) return `calc(100% + ${columnsNumber * 8}%)`

      return '100%'
    },

    visibleMetaColumns() {
      const visible = []
      this.metadataColumns.forEach((meta) => {
        if (
          this.Settings.displayFeatures.users_list &&
          this.Settings.displayFeatures.users_list[meta.value]
        )
          visible.push(meta)
      })
      return visible
    },
    /**
     * Add metadata columns and filter if feature flag is enable in branch columns
     */
    preferenceColumns() {
      let items = []
      items = this.preferenceColumnsList.filter(
        (item) => !item.value.includes('branch') || this.$isEnabledFeature('branching')
      )
      items.push(...this.metadataColumns)
      return items
    },

    isFiltering() {
      const hasTag = this.pgtrParams && this.pgtrParams.filter

      return this.pgtrIsFiltering || hasTag
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(value) {
        this.setFetching(value)
      },
    },
  },

  created() {
    let requestPromises = [
      this.attemptProfileListRetrieval({ limit: 1000 }),
      this.attemptMetasListRetrieval({ entity: 'application_user', searchParams: { limit: 1000 } }),
    ]

    this.setFetching(true)
    Promise.all(requestPromises)
      .then(([profilesListResponse, metadataResponse]) => {
        metadataResponse.data.data.forEach((metaItem) => {
          this.metadataColumns.push({
            label: metaItem.meta.name,
            value: metaItem.meta.alias,
          })
        })
        this.setUsersData({ path: 'profiles', value: profilesListResponse.data.data })
        let filter = {
          title: 'Perfil',
          name: 'profile_id',
          items: [],
        }
        filter.items = profilesListResponse.data.data.map((obj) => {
          return {
            text: obj.alias === 'student' ? i18n.t(`global:${obj.alias}`) : obj.name,
            id: obj.id,
            property: 'profile_id',
          }
        })

        this.filterTagOptions.push(filter)

        if (this.isEditing) {
          this.setUsersData({
            path: 'current',
            value: this.users.items.find((item) => item.uuid === this.$route.params.id),
          })
          if (!this.users.current) {
            this.$router.push({ name: 'community.users' })
          }
        }
      })
      .finally(() => {
        this.setFetching(false)
      })

    this.loadUsers()
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptUserListRetrieval',
      'attemptUserActiveUserToggle',
      'attemptUserRemoval',
      'attemptProfileListRetrieval',
      'attemptConfirmUser',
      'setUsersData',
      'attemptMetasListRetrieval',
      'impersonateUser',
    ]),

    openModalAddUser() {
      this.$router.push({ name: 'community.users.create', query: this.$route.query })
    },

    openModalConfirm() {
      this.modalConfirm = true
    },

    openModalConfirmDeactivate(item) {
      this.modalConfirmDeactivate = item
    },

    closeModalConfirm() {
      this.modalConfirm = false
      this.modalConfirmDeactivate = false
      this.currentDeleteId = null
      this.currentDeleteIndex = null
    },

    activateToggle(item) {
      this.setFetching(true)
      this.attemptUserActiveUserToggle(item.uuid)
        .then(() => {
          this.setFeedback({
            message: i18n.t(
              !item.active
                ? 'community.index:feedback.activated.success'
                : 'community.index:feedback.deactivated.success'
            ),
          })
          this.loadUsers()
        })
        .catch(() => {
          this.$impersonateFeedbackError()
          this.setFeedback({
            message: i18n.t(
              !item.active
                ? 'community.index:feedback.activated.error'
                : 'community.index:feedback.deactivated.error'
            ),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
      this.closeModalConfirm()
    },

    remove(id, index) {
      this.currentDeleteId = id
      this.currentDeleteIndex = index
      this.openModalConfirm()
    },

    deleteUser() {
      this.modalConfirm = false
      this.setFetching(true)
      this.attemptUserRemoval(this.currentDeleteId)
        .then(() => {
          this.closeModalConfirm()
          this.setFeedback({ message: i18n.t('community.index:feedback.removed.success') })
        })
        .catch(() => {
          this.setFeedback({
            message: i18n.t('community.index:feedback.removed.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    edit(item) {
      this.setUsersData({ path: 'current', value: item })
      this.$router.push({
        name: 'community.users.edit',
        params: { id: item.uuid },
        query: this.$route.query,
      })
    },

    confirmUser(item) {
      this.setFetching(true)
      return this.attemptConfirmUser(item.email)
        .then(() => {
          this.setFeedback({ message: i18n.t('community.index:feedback.activated.success') })
          this.loadUsers()
        })
        .catch(() => {
          this.setFeedback({
            message: i18n.t('community.index:feedback.activated.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    loadUsers() {
      this.pgtrRouteParams.active = true
      this.pgtrInitializePagination('userListResource', null)
    },

    updateFilters(filters) {
      let params = {}
      filters.map((obj) => {
        if (!Array.isArray(params[obj.property])) {
          params[obj.property] = []
        }
        params[obj.property].push(obj.id)
      })

      this.pgtrParams.filter = params
    },

    searchDebounce: debounce(function (value) {
      if (value === null || value.length === 0 || value.length > 2) {
        this.pgtrSetSearch('name', value)
      }
    }, 2000),

    showTagAllFilters(value) {
      this.tagAllFilters = value
    },

    openSubmenu() {
      this.showSubmenu = !this.showSubmenu
    },

    openModalBatchAddUser() {
      this.$router.push({ name: 'community.users.batch', query: this.$route.query })
    },

    openFinishedBatches() {
      this.$router.push({ name: 'community.users.batch.list', query: this.$route.query })
    },
  },
}
</script>

<template>
  <div class="main-content community community-user">
    <ContentHeader
      :key="$userUuid"
      :title="$t('community:header.title.1')"
      :description="$t('community:header.description')"
      :tag="$t('community:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-3">
      <FilterList>
        <div
          slot="button"
          class="community__buttons"
        >
          <ActionSubmenu
            slot="button"
            :show.sync="showSubmenu"
          >
            <Action
              v-if="notEqualsProfile('student') && canWrite('users')"
              slot="button"
              :dark="accessibility"
              :text="$t('community.index:btn.add')"
              fixed-width
              large
              primary
              type="button"
              @click="openSubmenu()"
            />
            <template slot="actions">
              <Action
                :text="$t('community.sessions.add:btn.add.single')"
                dark
                secondary
                small
                type="button"
                @click="openModalAddUser()"
              />
              <Action
                :text="$t('community.sessions.add:btn.add.batch')"
                dark
                secondary
                small
                type="button"
                @click="openModalBatchAddUser()"
              />
            </template>
          </ActionSubmenu>
          <Action
            slot="extra-button"
            :text="$t('community.users:menu.button.finished.batches')"
            flat
            icon-size="medium"
            type="button"
            @click="openFinishedBatches()"
          />
        </div>
        <FilterListSearch
          slot="search"
          :initial-value="pgtrParams.query['name']"
          :dark="accessibility"
          hide-error-details
          @search="searchDebounce"
          @tagAllFilters="showTagAllFilters"
        />
        <FilterListTag
          v-if="filterTagOptions[1]"
          slot="tag"
          :initial-value="pgtrParams.filter"
          :options="filterTagOptions"
          :tag-all-filters-active="tagAllFilters"
          state="users"
          @update-filters="updateFilters"
        />
        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :initial-value="pgtrParams.order"
          state="users"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
        <FilterPreferences
          slot="preferences"
          :columns="preferenceColumns"
          :default-preferences="defaultPreferences"
          field="users_list"
        />
      </FilterList>
    </div>

    <!-- Filters -->
    <div class="p-4">
      <EmptyMessage v-if="users.userList.length === 0 && !pgtrIsSearching && isFiltering">
        <h2>{{ $t('community.index:filter.empty.title') }}</h2>
      </EmptyMessage>

      <!-- Search -->
      <EmptyMessage
        v-if="
          ((users.userList.length === 0 && !isFiltering) ||
            (users.userList.length === 0 && isFiltering)) &&
          pgtrIsSearching
        "
      >
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </EmptyMessage>
    </div>

    <div
      v-if="users.userList.length"
      class="p-4 community-users__table"
      :style="{ '--width': datatableWidth }"
    >
      <DatatableUsers
        :key="$userUuid"
        :users="users.userList"
        :meta-columns="visibleMetaColumns"
        :default-preferences="defaultPreferences"
        :preference-columns-count="preferenceColumnsCount"
        @edit:user="edit"
        @toggle-activation:user="openModalConfirmDeactivate"
        @confirm:user="confirmUser"
        @impersonate:user="(user) => impersonateUser({ user })"
      />

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

    <router-view></router-view>

    <Modal
      :active="modalConfirm"
      :cancel="false"
      :close-event="true"
      @close="closeModalConfirm"
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
          <h3 class="modal-confirm-title">{{ $t('community.index:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description text-color">
            <p class="text-color">{{ $t('community.index:modal.confirm.message') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            type="button"
            :text="$t('global:confirm')"
            flat
            :dark="accessibility"
            @click="deleteUser()"
          />
          <Action
            type="button"
            :text="$t('global:cancel')"
            flat
            class="btn-cancel"
            :dark="accessibility"
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>

    <Modal
      :active="!!modalConfirmDeactivate"
      :cancel="false"
      :close-event="true"
      @close="closeModalConfirm"
    >
      <div class="modal-confirm">
        <Action
          class="btn-close"
          icon="close"
          icon-size="medium"
          type="button"
          @click="closeModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{
              modalConfirmDeactivate.active
                ? $t('community.index:modal.confirm.deactivate.user.title')
                : $t('community.index:modal.confirm.active.user.title')
            }}
          </h3>
          <div class="modal-confirm-description">
            <p class="text-color">
              {{
                modalConfirmDeactivate.active
                  ? $t('community.index:modal.confirm.deactivate.user.message')
                  : $t('community.index:modal.confirm.active.user.message')
              }}
            </p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            :dark="accessibility"
            :text="$t('global:confirm')"
            flat
            type="button"
            @click="activateToggle(modalConfirmDeactivate)"
          />
          <Action
            :dark="accessibility"
            :text="$t('global:cancel')"
            class="btn-cancel"
            flat
            type="button"
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import '~@/app/community/styles.scss';
</style>
