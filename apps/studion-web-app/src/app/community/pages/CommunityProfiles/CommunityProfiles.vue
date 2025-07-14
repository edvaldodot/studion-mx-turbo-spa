<script>
import { mapActions, mapState } from 'vuex'
import { communityMixin } from '@/mixins/community'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FilterList from '@/components/general/FilterList'
import Pagination from '@/components/general/Pagination'

export default {
  name: 'CommunityProfiles',

  components: {
    Action,
    ActionBar,
    ContentHeader,
    Datatable,
    Dropdown,
    DropdownLink,
    FilterList,
    Pagination,
  },

  mixins: [communityMixin],

  beforeRouteUpdate(to, _, next) {
    if (to.name === 'community.profiles') {
      this.loadProfiles()
    }
    next()
  },

  data() {
    return {
      paging: { actualPage: 1 },
      queryParams: {
        page: 1,
      },
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility', 'profiles']),
  },

  watch: {
    'queryParams.page'() {
      this.loadProfiles()
    },
  },

  created() {
    this.loadItemsPerPagePreferences(this.queryParams)
    this.loadProfiles()
    this.setFetching(true)
    this.attemptContextsRetrieval()
      .then(({ data }) => {
        this.setProfilesData({ path: 'contexts', value: data })
        this.setFetching(false)
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptProfileListAllRetrieval',
      'attemptProfileDelete',
      'attemptProfileActivation',
      'attemptProfileDeactivation',
      'attemptContextsRetrieval',
      'setProfilesData',
    ]),

    changeItemsPerPage(val) {
      this.queryParams.limit = val
      if (this.queryParams.page !== 1) {
        this.queryParams.page = 1
        return
      }
      this.loadProfiles()
    },

    openModalAddProfile() {
      this.$router.push({ name: 'community.profiles.create' })
    },

    activate(item) {
      this.setFetching(true)
      this.attemptProfileActivation(item.id)
        .then(() => {
          item.active = true
          this.setFeedback({ message: this.$t('community.profiles:feedback.profile.activated') })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('community.profiles:feedback.activated.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    deactivate(item) {
      this.setFetching(true)
      this.attemptProfileDeactivation(item.id)
        .then(() => {
          this.setFeedback({ message: this.$t('community.profiles:feedback.profile.deactivated') })
          this.loadProfiles()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('community.profiles:feedback.deactivated.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    edit(item) {
      this.setProfilesData({ path: 'current', value: item })
      this.$router.push({ name: 'community.profiles.edit', params: { id: item.id } })
    },

    remove(id) {
      this.setFetching(true)
      this.attemptProfileDelete(id)
        .then(() => {
          const isLastItem = this.profiles.items.length === 1

          this.setFeedback({ message: this.$t('community.profiles:feedback.profile.removed') })

          if (isLastItem) {
            return this.previousPage()
          }

          this.loadProfiles()
        })
        .catch(({ response }) => {
          if (response.data.message === 'has_users_association') {
            this.setFeedback({
              message: this.$t(
                'community.profiles:feedback.profile.removed.error:has_users_association'
              ),
              type: 'error',
            })
          } else {
            this.setFeedback({
              message: this.$t('community.profiles:feedback.profile.removed.error'),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    loadProfiles() {
      this.setFetching(true)
      this.attemptProfileListAllRetrieval(this.queryParams)
        .then(({ data }) => {
          this.paging = data
          this.setProfilesData({ path: 'items', value: data.data })
        })
        .finally(() => {
          this.setFetching(false)
        })
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
  },
}
</script>

<template>
  <div class="main-content community">
    <ContentHeader
      :key="$userUuid"
      :title="$t('community:header.title.2')"
      :description="$t('community:header.description.1')"
      :tag="$t('community:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-3">
      <filter-list>
        <action
          v-if="this.notEqualsProfile('student') && this.canWrite('profiles')"
          type="button"
          slot="button"
          fixed-width
          primary
          large
          :dark="accessibility"
          :text="$t('community.profiles:btn.add')"
          @click="openModalAddProfile()"
        />
      </filter-list>
    </div>

    <div
      class="p-4"
      v-if="profiles.items.length"
    >
      <datatable
        :items="profiles.items"
        :dark="accessibility"
      >
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th class="th" width="75%">{{ $t('community.profiles:datatable.header.1') }}</th>
            <th
              class="th text-center"
              width="10%"
            >
              {{ $t('community.profiles:datatable.header.2') }}
            </th>
            <th class="th" width="10%"></th>
            <th
              class="th"
              width="5%"
            ></th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr
            v-if="$media.mobile"
            class="tr-colspan tr-colspan-small"
          >
            <td
              class="td"
              colspan="3"
            >
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
          </tr>
          <tr :class="{ 'tr-small': $media.mobile }">
            <td
              class="td"
              v-if="!$media.mobile"
            >
              <span
                class="td-text-header"
                v-if="$media.mobile"
                >{{ $t('community.profiles:datatable.header.1') }}</span
              >
              <span class="td-text bolder">
                {{
                  ['student', 'admin'].includes(props.item.alias)
                    ? $t(props.item.alias)
                    : props.item.name
                }}
              </span>
            </td>
            <td
              class="td"
              :class="{ 'text-center': !$media.mobile }"
            >
              <span
                class="td-text-header td-text-header-inline"
                v-if="$media.mobile"
                >{{ $t('community.profiles:datatable.header.2') }}</span
              >
              <span class="td-text">{{ props.item.profileUsersCount }}</span>
            </td>
            <td class="td td-button td-small">
              <Action
                flat
                :text="$t('global:view.more')"
                :dark="accessibility"
                type="button"
                @click="edit(props.item)"
              />
            </td>
            <td
              class="td td-actions"
              width="40"
            >
              <dropdown
                right
                icon="dots-vertical"
                v-if="
                  props.item.alias !== 'admin' &&
                  props.item.alias !== 'student' &&
                  notEqualsProfile('student') &&
                  canWrite('profiles')
                "
              >
                <DropdownLink
                  v-if="!props.item.active"
                  :text="$t('global:activate')"
                  @click="activate(props.item)"
                />
                <DropdownLink
                  v-if="props.item.active"
                  :text="$t('global:deactivate')"
                  @click="deactivate(props.item)"
                />
                <DropdownLink
                  :text="$t('global:edit')"
                  @click="edit(props.item)"
                />
                <DropdownLink
                  :text="$t('global:remove')"
                  @click="remove(props.item.id)"
                />
              </Dropdown>
            </td>
          </tr>
        </template>
      </Datatable>

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

    <RouterView />
  </div>
</template>

<style lang="scss">
@import '~@/app/community/styles.scss';
</style>
