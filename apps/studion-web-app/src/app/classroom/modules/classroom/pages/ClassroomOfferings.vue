<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import sharedDataMixin from './sharedDataMixin'

import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import Pagination from '@/components/general/Pagination'
import OfferCard from '../components/ClassroomCard/OfferCard'
import Tabs from '@/components/general/Tabs'
import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'

export default {
  name: 'ClassroomOfferings',
  mixins: [paginateMixin, sharedDataMixin],

  components: {
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    Pagination,
    OfferCard,
    Tabs,
    ContentHeader,
    ActionBar,
  },
  data() {
    return {
      offeringSingleSessionUuids: [],
    }
  },
  computed: {
    ...mapState({
      accessibility: (state) => state.accessibility,
      offerings: (state) => state.Classroom.offerings,
    }),
    getEmbed() {
      return this.equalsProfile('student') ? 'user_rating,rating_analysis' : 'rating_analysis'
    },
    getFilterWithoutStatusList() {
      return this.equalsProfile('student') && this.$isEnabledFeature('bidding')
        ? ['desistente']
        : []
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
        ? this.$t('classroom:header.offerrings.description.student')
        : this.$t('classroom:header.offerrings.description.admin')
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
    ...mapActions(['setFetching', 'setFeedback', 'fetchClassroomOfferings']),
    filterStatus(index) {
      this.activeTab = index
      this.currentEnrollmentStatus = index > 0 ? this.enrollmentStatus[index] : ''
      this.pgtrSetCustomFilter('enrollment_status_type_alias', this.currentEnrollmentStatus)
    },
    redirectTo(route, params) {
      this.$router.push({ name: route, params })
    },
    async getTo(offer) {
      this.redirectTo('classroom.offerings.solutions', { id: offer.id })
    },
    setPgtrDefaultFilters() {
      this.pgtrSetCustomFilter('enrollment_status_type_alias', this.currentEnrollmentStatus)
      this.pgtrSetCustomFilter('session_team_only', this.equalsProfile('student') ? 0 : 1)
      this.pgtrSetCustomFilter('enrolled_only', this.equalsProfile('student') ? 1 : 0)
      this.pgtrSetCustomFilter('active', 1)
      this.pgtrSetCustomFilter('without_status', this.getFilterWithoutStatusList)
    },
  },
  created() {
    this.setPgtrDefaultFilters()
    this.pgtrInitializePagination('classroomOfferingsResource', null, { embed: this.getEmbed })
  },
}
</script>

<template>
  <div>
    <ContentHeader
      class="header-admin"
      :title="$t('global:offerings')"
      :tag="$t('global:solution.image.placeholder')"
      :description="headerDescription"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>
    <div class="main-content classroom h-full p-4">
      <div class="py-4">
        <filter-list
          v-if="offerings"
          toggle
          :has-filter="hasFilter"
        >
          <Tabs
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
            :options="filterOfferingsListOrderOptions"
            :on-server="true"
            state="Classroom"
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
          offerings.length === 0 && !pgtrIsSearching && !pgtrIsFiltering && equalsProfile('student')
        "
      >
        <h2>{{ $t('classroom.list:student.empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.list:student.empty.message') }}</p>
      </empty-message>

      <!-- default for managers -->
      <empty-message
        v-if="
          offerings.length === 0 &&
          !pgtrIsSearching &&
          !pgtrIsFiltering &&
          notEqualsProfile('student')
        "
      >
        <h2>{{ $t('classroom.list:managers.empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.list:managers.empty.message') }}</p>
      </empty-message>

      <!-- search -->
      <empty-message v-if="offerings.length === 0 && pgtrIsSearching">
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </empty-message>

      <!-- Filters -->
      <empty-message v-if="offerings.length === 0 && !pgtrIsSearching && pgtrIsFiltering">
        <h2>{{ $t('classroom.list:filter.empty.title') }}</h2>
      </empty-message>

      <div class="center">
        <offer-card
          class="--hoverable"
          v-for="offer in offerings"
          :id="offer.id"
          :courses-count="offer.meta.courses.length"
          :image="offer.image"
          :key="offer.id"
          :period="offer.period"
          :title="offer.title"
          :type="offer.meta.offeringTypeAlias"
          :rating-analysis="offer._embedded.rating_analysis"
          :user-rating="offer._embedded.user_rating"
          :categories="offer.categories"
          @click.native="getTo(offer)"
        >
        </offer-card>

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
