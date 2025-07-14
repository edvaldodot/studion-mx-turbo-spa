<script>
import { mapActions, mapState } from 'vuex'
import { communityMixin } from '@/mixins/community'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Icon from '@/components/general/Icon'
import Pagination from '@/components/general/Pagination'
import Tooltip from '@/components/general/Tooltip'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'CommunityGroups',
  mixins: [communityMixin, paginateMixin],
  components: {
    Action,
    ActionBar,
    Checkbox,
    ContentHeader,
    Datatable,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Icon,
    Pagination,
    ModalConfirm,
    Tooltip
  },
  data () {
    return {
      deleteConfirmModal: false,
      currentGroup: null
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'Groups'])
  },
  watch: {
    'groupsList.loading': {
      immediate: true,
      handler (value) {
        this.setFetching(value)
      }
    },
    'pgtrIsFetching': {
      immediate: true,
      handler (loading) {
        this.setFetching(loading)
      }
    },
    '$route' (to, from) {
      if (to.name === 'community.groups' && (from.name === 'community.groups.create' || from.name === 'community.groups.update')) this.pgtrRefresh()
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'deleteGroup'
    ]),
    openDeleConfirmModal (groupId) {
      this.deleteConfirmModal = true
      this.currentGroupId = groupId
    },
    openModalAddGroup (groupId) {
      if (groupId) {
        this.$router.push({ name: 'community.groups.update', params: { groupId } })
        return
      }

      this.$router.push({ name: 'community.groups.create' })
    },
    openModalUsersOfGroup (groupId) {
      this.$router.push({ name: 'community.groups.users', params: { id: groupId } })
    },
    confirmDelete () {
      this.deleteGroup(this.currentGroupId)
        .finally(() => {
          this.deleteConfirmModal = false
          this.currentGroupId = null
          this.pgtrRefresh()
        })
    }
  },
  created () {
    this.pgtrInitializePagination('groupListResource', null, { embed: 'users_count' })
  }
}
</script>

<template>
  <div class="main-content community">
    <ContentHeader
      :title="$t('community:header.title.3')"
      :description="$t('community:header.description.2')"
      :tag="$t('community:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-4">
      <filter-list>
        <action
          :text="$t('community.groups:btn.add')"
          type="button"
          v-if="this.notEqualsProfile('student') && this.canWrite('groups')"
          primary
          large
          fixed-width
          slot="button"
          @click="openModalAddGroup()"
          :dark="accessibility"
        />
        <filter-list-search
          :dark="accessibility"
          :hide-error-details="true"
          @search="pgtrSetSearch('name', $event)"
          slot="search"
        />
      </filter-list>
    </div>

    <div class="p-4" v-if="Groups.groupsList.length">
      <datatable :items="Groups.groupsList" :dark="accessibility">
        <template slot="thead" v-if="!$media.mobile">
          <tr>
            <th class="th">{{ $t('community.groups:datatable.header.1') }}</th>
            <th class="th flex align-center">
              {{ $t('community.groups:datatable.header.2') }}
              <tooltip :uppercase="false" :width="280">
                <template v-slot:activator="{ on }">
                  <span class="d-inline-flex ml-1" v-on="on">
                    <icon dark name="alert-circle" />
                  </span>
                </template>
                <span>{{ $t('trails.groups:datatable.users.info') }}</span>
              </tooltip>
            </th>
            <th class="th" width="40"></th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr v-if="$media.mobile" class="tr-colspan tr-colspan-small">
            <td class="td" colspan="4">
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
          </tr>
          <tr :class="{'tr-small': $media.mobile}">
            <td class="td" v-if="!$media.mobile">
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
            <td class="td">
              <span class="td-text-header td-text-header-inline" v-if="$media.mobile">{{
                  $t('community.groups:datatable.header.2')
                }}</span>
              <span class="td-text">{{ props.item._embedded.users_count }}</span>
            </td>
            <td class="td td-actions" width="40">
              <dropdown icon="dots-vertical" right v-if="notEqualsProfile('student') && canWrite('groups')">
                <dropdown-link
                  :text="$t('global:edit')"
                  @click="openModalAddGroup(props.item.id)"
                />
                <dropdown-link
                  :text="$t('community.groups:datatable.btn.members')"
                  @click="openModalUsersOfGroup(props.item.id)"
                />
                <dropdown-link
                  :text="$t('global:remove')"
                  @click="openDeleConfirmModal(props.item.id)"
                />
              </dropdown>
            </td>
          </tr>
        </template>
      </datatable>

      <pagination
        :activePage="pgtrParams.page"
        :pageCount="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>

    <div class="p-4" v-else>
      <empty-message>
        <template v-if="!Object.values(pgtrParams.query).length">
          <h2>{{ $t('community.groups:empty.title') }}</h2>
          <p class="text-color">{{ $t('community.groups:empty.message') }}</p>
        </template>
        <template v-else>
          <h2>{{ $t('global:search.empty.title') }}</h2>
          <p class="text-color">{{ $t('global:search.empty.message') }}</p>
        </template>
      </empty-message>
    </div>
    <modal-confirm
      :active="deleteConfirmModal"
      :title="$t('community.groups:modal.remove.title')"
      @close="deleteConfirmModal = false"
      @confirm="confirmDelete"
    >
      <p class="text-color">{{ $t('community.groups:modal.remove.description') }}</p>
    </modal-confirm>

    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import "~@/app/community/styles.scss";
</style>
