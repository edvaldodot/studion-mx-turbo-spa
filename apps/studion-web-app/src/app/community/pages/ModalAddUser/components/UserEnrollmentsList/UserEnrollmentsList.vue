<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { format, parseISO } from 'date-fns'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { certificateMixin } from '@/mixins/certificateMixin'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import HorizontalSwitch from '@/components/general/HorizontalSwitch'
import UserEnrollmentColapseData from '@/app/community/components/UserEnrollmentColapseData'
import TrailEnrollmentColapseData from '@/app/community/components/TrailEnrollmentColapseData'
import Tooltip from '@/components/general/Tooltip'

export default defineComponent({
  name: 'UserEnrollmentsList',
  components: {
    Action,
    Datatable,
    DatatableCollapseRow,
    EmptyMessage: () => import('@/components/general/EmptyMessage'),
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    Pagination,
    UserEnrollmentColapseData,
    TrailEnrollmentColapseData,
    HorizontalSwitch,
    Tooltip,
  },
  mixins: [paginateMixin, certificateMixin],
  props: {
    userUuid: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      selectedOption: 'courses',
      HorizontalSwitchOptions: [
        { text: this.$t('global:solutions'), value: 'courses' },
        { text: this.$t('global:trails'), value: 'paths' },
        { text: this.$t('global:offerings'), value: 'offers' },
      ],
      dropdownMap: [],
      enrollmentStatusAliases: [
        'nao_iniciou',
        'em_andamento',
        'aprovado',
        'reprovado',
        'expirado',
        'desistente',
      ],
    }
  },
  computed: {
    ...mapState({
      userEnrollments: (state) => state.users.currentEnrollments,
    }),
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.date.new'),
          value: 0,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 1,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },
    hasCertificate() {
      return (
        (this.$isEnabledFeature('certificate_paths') && this.selectedOption === 'paths') ||
        ['courses', 'offers'].includes(this.selectedOption)
      )
    },
    getEmptyMessage() {
      if (this.userEnrollments.length > 0) {
        return ''
      }

      if (this.pgtrIsSearching) {
        return this.$t('global:search.empty.title')
      }

      if (this.filterActiveItems.status && this.filterActiveItems.status.length > 0) {
        return this.$t('community.index:filter.empty.title')
      }

      return this.$t('community.index:modal.enrollments.empty.message')
    },
  },
  watch: {
    selectedOption() {
      this.pgtrParams.filter.context = this.selectedOption
    },
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    userEnrollments: {
      immediate: true,
      handler() {
        this.dropdownMap = []
      },
    },
  },
  created() {
    this.pgtrFilterTagOptions.push({
      title: this.$t('community.index:datatable.header.status'),
      name: 'status',
      value: 'class',
      items: this.enrollmentStatusAliases.map((alias) => ({
        active: false,
        id: alias,
        text: this.$t(`global:solution.status.${alias}`),
        property: 'status',
      })),
    })
    this.pgtrParams.filter = {
      context: 'courses',
    }
    this.pgtrInitializePagination('userEnrollmentsResource', null, { userUuid: this.userUuid })
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptMyselfDownloadCertificate',
      'attemptDownloadTrailCertificate',
    ]),
    checkIfHasCollapse(item) {
      const isSelectedCoursesOrPaths =
        this.selectedOption === 'courses' || this.selectedOption === 'paths'
      const hasHistories = item.histories && item.histories.length > 0
      const isStudentAllowedReenroll = item.studentAllowedReenroll
      const hasSessionEnrollments = item.sessionEnrollments && item.sessionEnrollments.length > 0

      return (
        isSelectedCoursesOrPaths &&
        (hasHistories || isStudentAllowedReenroll || hasSessionEnrollments)
      )
    },
    verifyToggleIsDisabled(offering, trail, certificateHash) {
      if (this.$media.mobile) return false
      return !offering && !trail && !certificateHash
    },
    toggleEnrollmentDatatableCollapse(index) {
      this.$set(this.dropdownMap, index, !this.dropdownMap[index])
    },
    formatDate(date) {
      return format(parseISO(date), 'dd/MM/yyyy')
    },
    downloadCertificate(certificateHash) {
      this.$emit('start-download')

      if (this.selectedOption === 'paths') {
        this.$downloadCertificate(this.attemptDownloadTrailCertificate, certificateHash, () =>
          this.$emit('end-download')
        )
      } else {
        this.$downloadCertificate(this.attemptMyselfDownloadCertificate, certificateHash, () =>
          this.$emit('end-download')
        )
      }
    },
    getLeftColumnName(item) {
      switch (this.selectedOption) {
        case 'courses':
          return item.solution
        case 'paths':
          return item.trail
        case 'offers':
          return item.session
      }
    },
    getRightColumnName(item) {
      switch (this.selectedOption) {
        case 'courses':
        case 'paths':
          return item.solution
        case 'offers':
          return item.offering
      }
    },
    getColumnName(item) {
      switch (this.selectedOption) {
        case 'courses':
          return item.session
        case 'paths':
          return item.trail
        case 'offers':
          return item.solution
      }
    },
    getDate(date) {
      return date ? this.formatDate(date) : '-'
    },
  },
})
</script>

<template>
  <div class="user-enrollments-list__wrap">
    <div class="p-4">
      <FilterList class-custom="flex align-items-center justify-content-between h-5rem">
        <div
          slot="button"
          class="horizontal-switch__wrapper"
        >
          <HorizontalSwitch
            v-model="selectedOption"
            root-class="bg-black-200 -mt-2"
            option-class="text-color"
            :options="HorizontalSwitchOptions"
          />
        </div>
        <FilterListSearch
          slot="search"
          hide-error-details
          dark
          @search="pgtrSetSearch('title', $event)"
        />
        <FilterListTag
          slot="tag"
          :options="pgtrFilterTagOptions"
          :tag-all-filters-active="pgtrTagAllFilters"
          state="users"
          dark
        />
        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          on-server
          dark
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>
    <EmptyMessage v-if="!userEnrollments.length">
      <h2 v-if="getEmptyMessage">{{ getEmptyMessage }}</h2>

      <p v-if="pgtrIsSearching">{{ $t('global:search.empty.message') }}</p>
    </EmptyMessage>

    <Datatable
      v-if="userEnrollments.length && !pgtrIsFetching"
      :items="userEnrollments"
      :light="true"
      dark
      class="datatable-dropdown-bg"
    >
      <template
        v-if="!$media.mobile"
        slot="thead"
      >
        <tr class="tr-colspan">
          <th
            class="th"
            width="25%"
          >
            {{ $t('community.index:modal.datatable.header.enroll.date') }}
          </th>
          <th
            v-if="selectedOption === 'paths'"
            class="th"
            width="25%"
          >
            {{ $t('community.index:modal.datatable.header.0') }}
          </th>
          <th
            v-if="selectedOption === 'courses'"
            class="th"
            width="25%"
          >
            {{ $t('community.index:modal.datatable.header.2') }}
          </th>
          <th
            v-if="selectedOption !== 'paths'"
            class="th"
            width="25%"
          >
            {{ $t('community.index:modal.datatable.header.3') }}
          </th>
          <th
            v-if="selectedOption === 'offers'"
            class="th"
            width="25%"
          >
            {{ $t('global:initial.date') }}
          </th>
          <th
            v-if="selectedOption === 'offers'"
            class="th"
            width="25%"
          >
            {{ $t('global:end.date') }}
          </th>
          <th
            v-if="selectedOption === 'offers'"
            class="th"
            width="25%"
          >
            {{ $t('community.index:modal.datatable.header.1') }}
          </th>
          <th
            v-if="selectedOption === 'offers'"
            class="th"
            width="25%"
          >
            {{ $t('global:solution') }}
          </th>
          <th
            class="th text-center"
            width="25%"
          >
            {{ $t('community.index:modal.datatable.header.4') }}
          </th>
          <th
            v-if="hasCertificate"
            class="th"
            width="25%"
          >
            {{ $t('community.index:modal.datatable.header.6') }}
          </th>
          <th
            class="th text-center"
            width="10%"
          ></th>
        </tr>
      </template>
      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr
          class="tr-body tr-parent-dropdown"
          :class="{ 'is-open': dropdownMap[props.index] }"
        >
          <td
            class="td"
            :width="$media.mobile ? '80%' : ''"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header"
              >{{ $t('community.index:modal.datatable.header.enroll.date') }}</span
            >
            <span class="td-text bolder">{{ formatDate(props.item.date) }}</span>
          </td>
          <td
            v-if="!$media.mobile && selectedOption === 'offers'"
            class="td"
          >
            <span class="td-text bolder">{{ getLeftColumnName(props.item) }}</span>
          </td>
          <template v-if="!$media.mobile && selectedOption === 'offers'">
            <td class="td">
              <span class="td-text">{{ getDate(props.item.sessionStartDate) }}</span>
            </td>
            <td class="td">
              <span class="td-text">{{ getDate(props.item.sessionEndDate) }}</span>
            </td>
          </template>
          <td
            v-if="!$media.mobile && selectedOption !== 'paths'"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header"
              >{{ $t('community.index:modal.datatable.header.3') }}</span
            >
            <span class="td-text bolder">{{ getRightColumnName(props.item) }}</span>
          </td>
          <td
            v-if="!$media.mobile"
            class="td"
          >
            <span class="td-text">{{ getColumnName(props.item) }}</span>
          </td>
          <td
            class="td"
            :class="{ 'text-center': !$media.mobile }"
            :width="$media.mobile ? '50%' : ''"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header text-color"
              >{{ $t('community.index:modal.datatable.header.4') }}</span
            >
            <span class="td-tag text-color">{{
              $te(`global:solution.status.${props.item.status}`)
                ? $t(`global:solution.status.${props.item.status}`)
                : props.item.status
            }}</span>
          </td>
          <td
            v-if="hasCertificate & !$media.mobile"
            class="td"
          >
            <Tooltip
              v-if="props.item.certificateHash"
              :uppercase="false"
              :bold-font="false"
              :width="232"
              vertical-align="top"
            >
              <template #activator="{ on }">
                <div v-on="on">
                  <Action
                    flat
                    type="button"
                    class="enrollment-colapse-data__action"
                    :text="$t('global:download.certificate')"
                    @click="downloadCertificate(props.item.certificateHash)"
                  />
                </div>
              </template>

              <span>{{ $t(`global:download.certificate.${selectedOption}`) }}</span>
            </Tooltip>
            <span
              v-else
              class="td-text"
              >{{ $t('global:unavailable') }}</span
            >
          </td>
          <td class="td text-center">
            <action
              v-if="checkIfHasCollapse(props.item)"
              type="button"
              :icon="dropdownMap[props.index] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              @click="toggleEnrollmentDatatableCollapse(props.index)"
            />
          </td>
        </tr>
        <tr
          v-if="$media.mobile"
          class="tr-parent-dropdown"
          :class="{ 'is-open': dropdownMap[props.index] }"
        >
          <td
            class="label-title-name"
            width="50%"
          >
            <span
              v-if="selectedOption === 'courses'"
              class="td-text-header"
              >{{ $t('community.index:modal.datatable.header.2') }}</span
            >
            <span
              v-if="selectedOption === 'offers'"
              class="td-text-header"
              >{{ $t('community.index:modal.datatable.header.1') }}</span
            >
            <span
              v-if="selectedOption === 'paths'"
              class="td-text-header"
              >{{ $t('community.index:modal.datatable.header.0') }}</span
            >
            <span class="td-text bolder">{{
              selectedOption === 'offers'
                ? getRightColumnName(props.item)
                : getLeftColumnName(props.item)
            }}</span>
          </td>
          <td class="td">
            <template v-if="selectedOption === 'courses'">
              <span class="td-text-header">{{
                $t('community.index:modal.datatable.header.3')
              }}</span>
              <span class="td-text bolder">
                {{ props.item.session ? props.item.session : '-' }}
              </span>
            </template>
            <template v-else>
              <span class="td-text-header">{{
                $t('community.index:modal.datatable.header.2')
              }}</span>
              <span class="td-text bolder">
                {{ props.item.solution ? props.item.solution : '-' }}
              </span>
            </template>
          </td>
          <td></td>
        </tr>
        <DatatableCollapseRow
          v-show="dropdownMap[props.index]"
          :colspan="5"
          :open="dropdownMap[props.index]"
        >
          <UserEnrollmentColapseData
            v-if="selectedOption === 'courses'"
            :session-id="props.item.sessionId"
            :enrollment-history="props.item.histories"
            :can-reenroll="props.item.studentAllowedReenroll"
            @start-download="isDownloading = true"
            @end-download="isDownloading = false"
            @reenrolled="pgtrRefresh()"
          />
          <TrailEnrollmentColapseData
            v-if="selectedOption === 'paths'"
            :enrollment-history="props.item.histories"
            :session-enrollments="props.item.sessionEnrollments"
            @start-download="isDownloading = true"
            @end-download="isDownloading = false"
          />
        </DatatableCollapseRow>
      </template>
    </Datatable>
    <Pagination
      dark
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
</template>

<style lang="scss">
@import 'UserEnrollmentsList.scss';
</style>
