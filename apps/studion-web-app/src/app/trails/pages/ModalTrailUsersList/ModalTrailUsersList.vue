<script>
import DateTime from 'luxon/src/datetime.js'
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { certificateMixin } from '@/mixins/certificateMixin'

import UserSolutionsList from '@/app/trails/components/UserSolutionsList'
import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import EmptyMessage from '@/components/general/EmptyMessage'
import Icon from '@/components/general/Icon'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Pagination from '@/components/general/Pagination'
import Tabs from '@/components/general/Tabs'
import Tooltip from '@/components/general/Tooltip'
import ToastV2 from '@/components/general/ToastV2'
import TextReduce from '@/components/general/TextReduce'

const Alert = () => import('@/components/general/Alert')

export default {
  name: 'ModalTrailUsersList',

  components: {
    UserSolutionsList,
    Alert,
    Modal,
    Action,
    FilterList,
    FilterListSearch,
    EmptyMessage,
    Icon,
    Datatable,
    DatatableCollapseRow,
    Dropdown,
    DropdownLink,
    Pagination,
    Tabs,
    Tooltip,
    ToastV2,
    TextReduce,
  },

  filters: {
    joinGroups(groups) {
      if (groups && Array.isArray(groups)) {
        return groups.map((group) => group.name).join(',')
      }
    },
  },

  mixins: [paginateMixin, certificateMixin],

  props: {
    trailId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      dropdownMap: {},
      confirmUserRemoveModal: false,
      userUuid: null,
      changeStatusModal: false,
      tablinks: [
        {
          text: 'trails.users:modal.tabs.students',
          location: { name: 'trails.users', params: { id: this.trailId } },
        },
        {
          text: 'trails.users:modal.tabs.groups',
          location: { name: 'trails.groups', params: { id: this.trailId } },
        },
      ],
      order: {
        property: 'name',
        type: 'asc',
      },
      toastActive: false,
    }
  },

  computed: {
    ...mapState({
      fetching: 'fetching',
      accessibility: 'accessibility',
      trail: (state) => state.Trails.current,
    }),
    canEnroll() {
      return this.trail.endTime && this.isDateBeforeToday(this.trail.endTime)
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    'trail.users'(users) {
      this.createdDropdownMap(users)
      if (users.length === 0 && this.pgtrParams.page > 1) {
        this.pgtrParams.page--
      }
    },
  },

  created() {
    this.setup()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptTrailRemoveUser',
      'setCurrent',
      'attemptDownloadTrailCertificate',
      'attemptReenrollUserOnTrail',
    ]),
    createdDropdownMap(users) {
      let newDropdownMapList = {}

      users.forEach((user) => {
        newDropdownMapList[user.i_applications_users] = false
      })

      this.$set(this, 'dropdownMap', newDropdownMapList)
    },
    setup() {
      const trailId = this.trailId || null
      if (!trailId) {
        this.$router.push({ name: 'trails.list' })
        return
      }
      this.setCurrent(trailId)
      this.pgtrInitializePagination('trailUsersResource', { trailId })
    },
    toggleDatatableCollapse(appUserId) {
      this.$set(this.dropdownMap, appUserId, !this.dropdownMap[appUserId])
    },
    openModalAddSingleUser() {
      this.$router.push({ name: 'trails.enroll.single', params: { id: this.trailId } })
    },
    openUserRemoveModal(userUuid) {
      this.userUuid = userUuid
      this.confirmUserRemoveModal = true
    },
    closeUserRemoveModal() {
      this.userUuid = null
      this.confirmUserRemoveModal = false
    },
    confirmUserRemoval() {
      this.confirmUserRemoveModal = false
      this.attemptTrailRemoveUser(this.userUuid).then(() => {
        this.pgtrRefresh()
      })
    },
    formatDeadline(deadline) {
      if (!deadline) return '-'

      deadline = deadline.replace(' ', 'T')

      let endDate = DateTime.fromISO(deadline)

      return endDate.toLocaleString()
    },
    downloadCertificate(certificateHash) {
      this.$downloadCertificate(this.attemptDownloadTrailCertificate, certificateHash)
    },
    reenrollUser(userUuid) {
      const payload = {
        pathId: this.$route.params.id,
        userUuid: userUuid,
      }

      this.setFetching(true)
      this.attemptReenrollUserOnTrail(payload)
        .then(() => {
          this.setFeedback({
            message: this.$t('classroom:reenroll.success.admin'),
            type: 'success',
          })
        })
        .catch(({ response }) => {
          if (response.data.message === 'path_ended') {
            this.setFeedback({
              message: this.$t('classroom.list.trails:cant.reenroll.by.date'),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
          this.pgtrRefresh()
        })
    },
  },
}
</script>

<template>
  <div>
    <Modal
      v-show="!changeStatusModal"
      class="trails-users-modal"
      active
      is-page
    >
      <span class="modal-subtitle">{{ $t('trails.users:modal.title') }}</span>
      <h2 class="modal-title text-color">{{ trail.name }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('trails.users:modal.description') }}</p>
      </div>
      <div>
        <Tabs
          :links="tablinks"
          class="text-center"
          dark
        />
        <div class="modal-form-buttons py-4">
          <Tooltip
            slot="button"
            :uppercase="false"
            :width="250"
            medium-font
            shadow
          >
            <template #activator="{ on }">
              <Action
                :text="$t('trails.users:modal.btn.add')"
                :disabled="canEnroll"
                type="button"
                large
                primary
                @click="openModalAddSingleUser()"
                @mouseenter.native="on.mouseenter"
                @mouseleave.native="on.mouseleave"
              />
            </template>
            <span v-if="canEnroll">{{ $t('classroom.list.trails:cant.enroll.by.date') }}</span>
          </Tooltip>

          <FilterList>
            <FilterListSearch
              slot="search"
              :hide-error-details="true"
              dark
              @search="pgtrSetSearch('name', $event)"
            />
          </FilterList>
        </div>
        <Datatable
          v-if="trail && trail.users.length > 0"
          :items="trail.users"
          class="datatable-dropdown-bg"
          dark
        >
          <template
            v-if="!$media.mobile"
            slot="thead"
          >
            <tr>
              <th class="th">{{ $t('trails.users:datatable.header.username') }}</th>
              <th class="th">{{ $t('trails.users:datatable.header.email') }}</th>
              <th class="th text-center">{{ $t('trails.users:datatable.header.end_date') }}</th>
              <th class="th text-center">{{ $t('trails.users:datatable.header.group') }}</th>
              <th class="th text-center">{{ $t('global:status') }}</th>
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
                colspan="4"
                class="td"
              >
                <div class="td-user flex gap-1 align-items-center">
                  <div class="datatable-image">
                    <img
                      v-if="props.item.image"
                      :src="props.item.image"
                      class="w-2rem border-circle"
                    />
                    <Icon
                      v-else
                      class="text-3xl icon-fill-1"
                      name="account_circle"
                      pack="material"
                    />
                  </div>
                  <span class="td-text bolder compact-lines flex-1 text-color">{{
                    props.item.name
                  }}</span>
                </div>
              </td>
            </tr>
            <tr
              class="tr-colspan tr-parent-dropdown"
              :class="{ 'is-open': dropdownMap[props.item.i_applications_users] }"
            >
              <td
                v-if="!$media.mobile"
                class="td h-5rem"
              >
                <div class="td-user flex gap-1 align-items-center">
                  <div class="datatable-image">
                    <img
                      v-if="props.item.image"
                      :src="props.item.image"
                    />
                    <Icon
                      v-else
                      name="account_circle"
                    />
                  </div>
                  <TextReduce
                    text-type
                    :lenght-text="30"
                    :text="props.item.name"
                    class-style="td-text bolder compact-lines flex-1 text-color text-base"
                  />
                </div>
              </td>
              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                >
                  {{ $t('trails.users:datatable.header.email') }}
                </span>
                <span class="td-text">{{ props.item.email }}</span>
              </td>
              <td class="td text-center">
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                >
                  {{ $t('trails.users:datatable.header.end_date') }}
                </span>
                <span class="td-text">{{ formatDeadline(props.item.enrollmentDeadline) }}</span>
              </td>
              <td class="td text-center">
                <span
                  v-if="$media.mobile"
                  class="td-text-header"
                >
                  {{ $t('trails.users:datatable.header.group') }}
                </span>
                <span class="td-text">
                  <template
                    v-if="props.item._embedded.groups && props.item._embedded.groups.length === 1"
                  >
                    {{ props.item._embedded.groups | joinGroups }}
                  </template>
                  <Tooltip
                    v-else-if="
                      props.item._embedded.groups && props.item._embedded.groups.length > 1
                    "
                  >
                    <template #activator="{ on }">
                      <span
                        @mouseenter="on.mouseenter"
                        @mouseleave="on.mouseleave"
                      >
                        <span>
                          {{
                            $t('trails.users:datatable.groups.count', {
                              count: props.item._embedded.groups.length,
                            })
                          }}
                          &nbsp;
                        </span>
                        <Icon
                          class="ml-2"
                          name="alert-circle"
                        />
                      </span>
                    </template>
                    <span>{{ props.item._embedded.groups | joinGroups }}</span>
                  </Tooltip>
                  <template v-else> - </template>
                </span>
              </td>
              <td
                width="110"
                class="td text-center"
              >
                <span class="td-tag td-tag-full">
                  {{
                    props.item.status
                      ? $t(`global:solution.status.${props.item.status.alias}`)
                      : '-'
                  }}
                </span>
              </td>
              <td class="td text-right">
                <Tooltip
                  v-if="props.item.certificate_hash && $isEnabledFeature('certificate_paths')"
                >
                  <template #activator="{ on }">
                    <Action
                      type="button"
                      :icon="'certificate'"
                      @click="downloadCertificate(props.item.certificate_hash)"
                      @mouseenter.native="on.mouseenter"
                      @mouseleave.native="on.mouseleave"
                    />
                  </template>
                  <span>{{ $t('global:download.certificate.second') }}</span>
                </Tooltip>
                <Action
                  :icon="
                    dropdownMap[props.item.i_applications_users]
                      ? 'keyboard_arrow_up'
                      : 'keyboard_arrow_down'
                  "
                  type="button"
                  @click="toggleDatatableCollapse(props.item.i_applications_users)"
                />
                <Dropdown icon="dots-vertical">
                  <DropdownLink
                    :text="$t('trails.users:datatable.dropdown.remove')"
                    type="button"
                    flat
                    @click="openUserRemoveModal(props.item.uuid)"
                  />
                  <DropdownLink
                    v-if="props.item.canReenroll"
                    flat
                    type="button"
                    :text="$t('classroom.list:session.reenroll')"
                    @click="reenrollUser(props.item.uuid)"
                  />
                </Dropdown>
              </td>
            </tr>
            <DatatableCollapseRow
              v-show="dropdownMap[props.item.i_applications_users]"
              :colspan="6"
              :open="dropdownMap[props.item.i_applications_users]"
            >
              <EmptyMessage v-if="!trail.isPublished">
                <h2 class="text-color">
                  {{ $t('trails.users:not.published.solutions.empty.title') }}
                </h2>
                <p class="text-color">
                  {{ $t('trails.users:not.published.solutions.empty.message') }}
                </p>
              </EmptyMessage>
              <UserSolutionsList
                v-else
                :user-id="props.item.i_applications_users"
                :user-uuid="props.item.uuid"
                :name="props.item.name"
                @error="toggleDatatableCollapse(props.item.i_applications_users)"
                @toast="toastActive = true"
              />
            </DatatableCollapseRow>
          </template>
        </Datatable>

        <EmptyMessage v-else>
          <h2 class="text-color">{{ $t('trails.users:empty.title') }}</h2>
          <p class="text-color">{{ $t('trails.users:empty.message') }}</p>
        </EmptyMessage>

        <Pagination
          :active-page="pgtrParams.page"
          :page-count="pgtrLastPage"
          dark
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
          @go-to-page="pgtrParams.page = $event"
          @change-items-per-page="pgtrParams.limit = $event"
        />
      </div>

      <ToastV2
        :active="toastActive"
        :title="$t('trails.users:toast.advice.title')"
        :description="$t('trails.users:toast.advice.description')"
        @close="toastActive = false"
      />
    </Modal>

    <Modal
      :active="confirmUserRemoveModal"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeUserRemoveModal()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('trails.users:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('trails.users:modal.confirm.message') }}</p>
          </div>
          <Alert
            class="mt-5"
            :text="$t('trails.users:modal.alert.text')"
          />
        </div>
        <div class="modal-confirm-footer">
          <Action
            :text="$t('global:confirm')"
            :dark="accessibility"
            type="button"
            flat
            @click="confirmUserRemoval()"
          />
          <Action
            :text="$t('global:cancel')"
            :dark="accessibility"
            type="button"
            flat
            @click="closeUserRemoveModal()"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import '~@/app/trails/styles.scss';
</style>
