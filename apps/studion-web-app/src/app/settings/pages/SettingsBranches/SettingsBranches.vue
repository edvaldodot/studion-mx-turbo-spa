<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { settingsMixin } from '@/mixins/settings'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import Pagination from '@/components/general/Pagination'

const Modal = () => import('@/components/general/Modal')
const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default defineComponent({
  name: 'SettingsBranches',

  components: {
    Action,
    ActionBar,
    Breadcrumbs,
    ContentHeader,
    Datatable,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    Modal,
    ModalConfirm,
    Pagination,
  },

  mixins: [settingsMixin, paginateMixin],

  data() {
    return {
      removeBranchError: false,
      branchToRemove: null,
      modalRemoveConfirm: false,
      parentId: null,
      currentBranch: null,
      breadcrumbsList: [],
    }
  },

  computed: {
    ...mapState({
      currentParentBranch: (state) => state.Branches.currentParentBranch,
      branchesList: (state) => state.Branches.list,
      isFetching: (state) => state.fetching,
    }),
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },

    currentParentBranch: {
      handler(parent) {
        if (!parent) return
        this.mountBreadcrumbs(parent)
        this.pgtrParams.filter = { parent_id: parent.id }
        if (!this.pgtrIsInitialized) {
          this.pgtrInitializePagination('branchesListResource')
        }
      },
    },
  },

  async created() {
    this.changeBranchFolder(null)
  },

  destroyed() {
    this.attemptClearBranchesList()
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptBranchRemove',
      'attemptSetCurrentParent',
      'attemptClearBranchesList',
    ]),

    create(parentId) {
      this.$router.push({ name: 'settings.branches.create', params: { id: parentId } })
    },

    edit(id) {
      this.$router.push({ name: 'settings.branches.edit', params: { id } })
    },

    openMetadata() {
      this.$router.push({
        name: 'settings.branches.metadata',
      })
    },

    checkToRemove(branch) {
      let message = null
      if (this.isParentBranch(branch)) message = 'cant_remove_node_with_children'
      else if (this.branchHasUsers(branch)) message = 'branch_has_users'
      else if (this.branchHasCourses(branch)) message = 'branch_has_courses'

      if (message) {
        this.setFeedback({
          message: this.$t(`settings.branches:feedback.branch.removed.error:${message}`),
        })
        return
      }

      this.branchToRemove = branch
      this.modalRemoveConfirm = true
    },
    isParentBranch(branch) {
      if (!branch.materializedPathChildrens) return false
      return branch.materializedPathChildrens.split(',').length > 1
    },
    branchHasUsers(branch) {
      return !!branch.linkedUsers
    },
    branchHasCourses(branch) {
      return !!branch.linkedCourses
    },
    remove(id) {
      this.closeModalRemoveConfirm()
      this.setFetching(true)
      this.attemptBranchRemove(id)
        .then(() => {
          this.setFeedback({ message: this.$t('settings.branches:feedback.branch.removed') })
          this.refreshBranches()
        })
        .catch(({ response }) => {
          const { message } = response.data
          if (message === 'branch_has_users') {
            this.openRemoveErrorModal()
            return
          }

          if (['cant_remove_node_with_children', 'branch_has_courses'].includes(message)) {
            this.setFeedback({
              message: this.$t(`settings.branches:feedback.branch.removed.error:${message}`),
            })
            return
          }

          this.setFeedback({
            message: this.$t('settings.branches:feedback.branch.removed.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    refreshBranches(modifiedBranchId = null, modifiedBranchParentId = null) {
      if (modifiedBranchId === this.currentParentBranch.id) {
        this.pgtrClearQueryHistory()
        this.refreshCurrentParentData()
        return
      }

      if (
        modifiedBranchId &&
        modifiedBranchId !== this.currentParentBranch.id &&
        modifiedBranchParentId !== this.currentParentBranch.id
      ) {
        this.pgtrClearQueryHistory()
        this.changeBranchFolder(modifiedBranchParentId || modifiedBranchId)
        return
      }

      this.pgtrRefresh()
    },
    openRemoveErrorModal() {
      this.removeBranchError = true
    },
    closeRemoveErrorModal() {
      this.removeBranchError = false
    },
    closeModalRemoveConfirm() {
      this.branchToRemove = null
      this.modalRemoveConfirm = false
    },
    refreshCurrentParentData() {
      this.changeBranchFolder(this.currentParentBranch.id)
    },
    async changeBranchFolder(item = null) {
      this.setFetching(true)
      try {
        await this.attemptSetCurrentParent(item)
      } finally {
        this.setFetching(false)
      }
    },
    mountBreadcrumbs(currentItem, acc = []) {
      if (!currentItem) return

      acc.push({
        text: currentItem.name,
        key: currentItem.id,
        value: currentItem,
      })

      if (currentItem.parentGroup && typeof currentItem.parentGroup === 'object') {
        this.mountBreadcrumbs(currentItem.parentGroup, acc)
      } else {
        this.breadcrumbsList = acc.reverse()
      }
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('settings-branches')"
    class="main-content settings branches"
  >
    <ContentHeader
      :title="$t('settings:header.title.7')"
      :description="$t('settings:header.description.6')"
      :tag="$t('settings:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-3">
      <FilterList>
        <template v-if="notEqualsProfile('student') && canWrite('branches')">
          <Action
            slot="button"
            :text="$t('settings:branch.btn.add')"
            type="button"
            fixed-width
            large
            primary
            @click="create(currentParentBranch.id)"
          />

          <Action
            slot="button"
            :text="$tc('global:metadata')"
            type="button"
            fixed-width
            flat
            @click="openMetadata"
          />
        </template>

        <FilterListSearch
          v-if="branchesList.length || pgtrIsSearching"
          slot="search"
          :hide-error-details="true"
          @search="pgtrSetSearch('name', $event)"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <div
        v-if="breadcrumbsList.length"
        class="branches-navigation"
      >
        <Breadcrumbs
          v-if="breadcrumbsList.length"
          :breadcrumbs-list="breadcrumbsList"
          size="large"
          clickable
          highlight-current
          @click="changeBranchFolder"
        />

        <Dropdown
          v-if="notEqualsProfile('student') && canWrite('branches')"
          icon="dots-vertical"
          right
        >
          <DropdownLink
            :text="$t('global:edit')"
            @click="edit(currentParentBranch.id)"
          />

          <DropdownLink
            :text="$t('settings.branches:modal.create.title')"
            @click="create(currentParentBranch.id)"
          />
        </Dropdown>
      </div>

      <Datatable
        v-if="branchesList.length && !isFetching"
        :items="branchesList"
      >
        <template
          v-if="!$media.mobile"
          slot="thead"
        >
          <tr>
            <th class="th">{{ $tc('global:branch') }}</th>

            <th class="th text-center">{{ $t('community.profiles:datatable.header.2') }}</th>

            <th class="th">{{ $t('community.profiles:datatable.header.3') }}</th>

            <th class="th" width="40"></th>
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
              class="td"
              colspan="2"
              @click="changeBranchFolder(props.item)"
            >
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $tc('global:branch') }}
              </span>

              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
          </tr>

          <tr>
            <td
              v-if="!$media.mobile"
              class="td clickable"
              width="45%"
              @click="changeBranchFolder(props.item)"
            >
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>

            <td
              class="td clickable"
              :class="{ 'text-center': !$media.mobile }"
              @click="changeBranchFolder(props.item)"
            >
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('community.profiles:datatable.header.2') }}
              </span>

              <span class="td-text">{{ props.item.linkedUsers }}</span>
            </td>

            <td
              class="td clickable"
              @click="changeBranchFolder(props.item)"
            >
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('community.profiles:datatable.header.3') }}
              </span>

              <span class="td-text">
                {{
                  props.item.pending
                    ? $t('community.profiles:datatable.irregular')
                    : $t('community.profiles:datatable.regular')
                }}
              </span>
            </td>

            <td class="td td-actions flex flex-reverse">
              <Dropdown
                v-if="notEqualsProfile('student') && canWrite('branches')"
                icon="dots-vertical"
                right
              >
                <DropdownLink
                  :text="$t('global:edit')"
                  @click="edit(props.item.id)"
                />

                <DropdownLink
                  :text="$t('global:remove')"
                  @click="checkToRemove(props.item)"
                />

                <DropdownLink
                  :text="$t('settings.branches:modal.create.title')"
                  @click="create(props.item.id)"
                />
              </Dropdown>

              <Action
                flat
                type="button"
                icon="keyboard_arrow_right"
                @click="changeBranchFolder(props.item)"
              />
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

    <div class="p-4">
      <EmptyMessage v-if="branchesList.length === 0 && !pgtrIsFetching">
        <h2 v-if="pgtrIsSearching">{{ $t('global:search.empty.title') }}</h2>

        <h2 v-if="!pgtrIsSearching">{{ $t('settings.branches:list.empty.title') }}</h2>

        <p v-if="pgtrIsSearching">{{ $t('global:search.empty.message') }}</p>

        <p v-if="!pgtrIsSearching">{{ $t('settings.branches:list.empty.message') }}</p>
      </EmptyMessage>
    </div>

    <RouterView @saved="refreshBranches" />

    <ModalConfirm
      :active="modalRemoveConfirm"
      :title="$t('settings.branches:modal.remove.confirm.title')"
      @close="closeModalRemoveConfirm"
      @confirm="remove(branchToRemove.id)"
    >
      <p
        v-if="branchToRemove"
        v-html="
          $t('settings.branches:modal.remove.confirm.description', { name: branchToRemove.name })
        "
      ></p>
    </ModalConfirm>

    <Modal
      :active="removeBranchError"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeRemoveErrorModal"
        />

        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{ $t('settings.branches:feedback.branch.removed.error.title') }}
          </h3>

          <div class="modal-confirm-description">
            <p v-html="$t('settings.branches:feedback.branch.removed.error.description')"></p>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import '~@/app/settings/styles.scss';
@import 'SettingsBranches.scss';
</style>
