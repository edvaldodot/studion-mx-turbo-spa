<script>
import { mapActions, mapState } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { certificateMixin } from '@/mixins/certificateMixin'

import sharedDataMixin from './sharedDataMixin'

import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import Pagination from '@/components/general/Pagination'
import TrailCard from '../components/ClassroomCard/TrailCard'
import Tabs from '@/components/general/Tabs'
import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'
import Tooltip from '@/components/general/Tooltip'

export default {
  name: 'ClassroomTrails',
  mixins: [paginateMixin, sharedDataMixin, certificateMixin],
  components: {
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    Pagination,
    TrailCard,
    Tabs,
    ContentHeader,
    ActionBar,
    Tooltip,
  },
  data() {
    return {
      offeringSingleSessionUuids: [],
      loadingUnwatch: null,
    }
  },
  computed: {
    ...mapState({
      accessibility: (state) => state.accessibility,
      trails: (state) => state.Trails.trails,
      Account: (state) => state.Account,
    }),
    enrollDate() {
      return this.equalsProfile('student')
        ? 'enrollments_date,courses_count,categories,user_rating,rating_analysis,history,reenrollment_status'
        : 'categories,rating_analysis'
    },

    hasFilter() {
      const filter = { ...this.pgtrParams.filter }
      return (
        (filter.categories && filter.categories.length > 0) ||
        Object.keys(this.pgtrParams.query).length > 0 ||
        !!this.pgtrParams.order
      )
    },
    headerDescription() {
      return this.equalsProfile('student')
        ? this.$t('classroom:header.trails.description.student')
        : this.$t('classroom:header.trails.description.admin')
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
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'fetchClassroomOfferings',
      'attemptOfferingUserEnrollments',
      'attemptDownloadTrailCertificate',
      'attemptReenrollUserOnTrail',
    ]),
    filterStatus(index) {
      this.activeTab = index
      this.currentEnrollmentStatus = index > 0 ? this.enrollmentStatus[index] : ''
      this.pgtrSetCustomFilter('enrollments_status_type_alias', this.currentEnrollmentStatus)
    },
    loadOfferingSingleSessionUuid(offerId) {
      return this.attemptOfferingUserEnrollments(offerId).then((response) => {
        return response.data.length === 1 ? response.data[0].session : null
      })
    },
    redirectTo(route, params) {
      this.$router.push({ name: route, params })
    },
    getTo(offer) {
      let lessonsCourseRoute = 'classroom.lessons.course'
      if (offer.meta.courses.length === 1) {
        if (this.offeringSingleSessionUuids[offer.id] === undefined) {
          this.loadOfferingSingleSessionUuid(offer.id).then((sessionUuid) => {
            this.offeringSingleSessionUuids[offer.id] = sessionUuid
            this.redirectTo(lessonsCourseRoute, {
              session_uuid: this.offeringSingleSessionUuids[offer.id],
            })
          })
        } else {
          this.redirectTo(lessonsCourseRoute, {
            session_uuid: this.offeringSingleSessionUuids[offer.id],
          })
        }
      } else {
        this.redirectTo('classroom.offerings.solutions', { id: offer.id })
      }
    },
    downloadCertificate(certificatePayload) {
      this.$downloadCertificate(
        this.attemptDownloadTrailCertificate,
        certificatePayload.hash,
        () => {},
        certificatePayload.isHistory
      )
    },
    setPgtrDefaultFilters() {
      this.pgtrSetCustomFilter('enrollments_status_type_alias', this.currentEnrollmentStatus)
      this.pgtrSetCustomFilter('is_published', 1)
      this.pgtrSetCustomFilter('is_classroom', true)
    },
    isAllowedAccess(status) {
      return !['reprovado', 'expirado', 'desistente'].includes(status)
    },
    reenroll(trailId) {
      const payload = {
        pathId: trailId,
        userUuid: this.Account.user.uuid,
      }

      this.setFetching(true)
      this.attemptReenrollUserOnTrail(payload)
        .then(() => {
          this.setFeedback({
            message: this.$t('classroom:reenroll.success'),
            type: 'success',
          })
        })
        .finally(() => {
          this.setFetching(false)
          this.pgtrRefresh()
        })
    },
    canReenrollByDate(trailEndDate) {
      return !trailEndDate || !this.isDateBeforeToday(trailEndDate)
    },
  },
  created() {
    this.setPgtrDefaultFilters()
    this.pgtrInitializePagination('trailsResource', null, { embed: this.enrollDate })
  },
}
</script>

<template>
  <div>
    <ContentHeader
      class="trails-header"
      :title="$t('global:trails')"
      :tag="$t('global:solution.image.placeholder')"
      :description="headerDescription"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>
    <div class="main-content classroom h-full p-4">
      <div class="p-3">
        <filter-list
          toggle
          :has-filter="hasFilter"
        >
          <tabs
            v-if="this.equalsProfile('student')"
            :links="tablinks"
            :index-active="activeTab"
            @tabChange="filterStatus"
            slot="tabs"
            show-bottom-border
            class="mb-4"
          />
          <filter-list-search
            slot="search"
            :hideErrorDetails="true"
            :dark="accessibility"
            @search="pgtrSetSearch('title', $event)"
            @tagAllFilters="tagAllFilters = $event"
          >
          </filter-list-search>

          <FilterListOrder
            slot="order"
            state="Classroom"
            :options="filterTrailsListOrderOptions"
            :on-server="true"
            @update-orders="pgtrUpdateOrder"
          />

          <filter-list-order
            multiple
            slot="categories"
            state="classroom"
            :onServer="true"
            :label="$tc('global:category', 2)"
            :options="filterCategoriesOptions"
            :select-all-option="false"
            @update-orders="pgtrSetFilterCategories"
          ></filter-list-order>
        </filter-list>
      </div>

      <!-- default for student -->
      <empty-message
        v-if="
          trails.length === 0 && !pgtrIsSearching && !pgtrIsFiltering && equalsProfile('student')
        "
      >
        <h2>{{ $t('classroom.list:student.trails.empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.list:student.trails.empty.message') }}</p>
      </empty-message>

      <!-- default for managers -->
      <empty-message
        v-if="
          trails.length === 0 && !pgtrIsSearching && !pgtrIsFiltering && notEqualsProfile('student')
        "
      >
        <h2>{{ $t('classroom.list:managers.trails.empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.list:managers.trails.empty.message') }}</p>
      </empty-message>

      <!-- search -->
      <empty-message v-if="trails.length === 0 && pgtrIsSearching">
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </empty-message>

      <!-- Filters -->
      <empty-message v-if="trails.length === 0 && !pgtrIsSearching && pgtrIsFiltering">
        <h2>{{ $t('classroom.list:filter.empty.title') }}</h2>
      </empty-message>

      <div class="center">
        <template v-for="trail in trails">
          <Tooltip
            :key="trail.id"
            vertical-align="middle"
            :uppercase="false"
            :width="230"
            medium-font
            shadow
          >
            <template v-slot:activator="{ on }">
              <TrailCard
                :id="trail.id"
                :key="trail.id"
                :to="{ name: 'classroom.trail.sessions', params: { id: trail.id } }"
                :courses-count="trail.courses_count"
                :duration="trail.duration"
                :enrollment-date="trail.enrollments_date"
                :image="trail.image"
                :name="trail.name"
                :student-count="trail.student_count"
                :type="trail.paths_type"
                :rating-analysis="trail._embedded ? trail._embedded.rating_analysis : {}"
                :user-rating="trail._embedded ? trail._embedded.user_rating : {}"
                :categories="trail._embedded ? trail._embedded.categories : []"
                :certificate-hash="trail.certificate_hash"
                :certificate-issued-at="trail.certificate_issued_at"
                :is-certificate-already-downloaded="!!trail.certificate_downloaded_at"
                :status-alias="trail.status"
                :allow-access="isAllowedAccess(trail.status)"
                :can-reenroll="trail.can_reenroll"
                :can-reenroll-by-date="canReenrollByDate(trail.end_date)"
                :start-date="trail.start_date"
                :first-access="trail.first_access"
                :end-date="trail.end_date"
                :enrollments-list="trail.histories"
                @onDownloadCertificate="downloadCertificate"
                @reenroll="reenroll(trail.id)"
                @mouseenter.native="on.mouseenter"
                @mouseleave.native="on.mouseleave"
              >
              </TrailCard>
            </template>
            <span v-if="!isAllowedAccess(trail.status)">
              {{ $t('trail.classroom:block.access.by.status') }}
            </span>
          </Tooltip>
        </template>

        <pagination
          :activePage="pgtrParams.page"
          :pageCount="pgtrLastPage"
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
          @go-to-page="pgtrParams.page = $event"
          @change-items-per-page="pgtrParams.limit = $event"
        ></pagination>
      </div>
    </div>
  </div>
</template>
