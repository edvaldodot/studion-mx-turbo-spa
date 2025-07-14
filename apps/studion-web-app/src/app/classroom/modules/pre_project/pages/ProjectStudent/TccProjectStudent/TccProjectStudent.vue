<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'
import EvaluationMixin from '@/mixins/Evaluation'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'

import DatatableProjectStudent from './components/DatatableProjectStudent'
import CardProjectStudent from './components/CardProjectStudent'
import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from './options'

import { DEFAULT_TABS } from '@/app/classroom/modules/assessments/pages/Competency/CompetencyList/shared.js'

export default defineComponent({
  name: 'TccProjectStudent',

  components: {
    CardProjectStudent,
    DatatableProjectStudent,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
  },

  mixins: [paginateMixin, EvaluationMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  data() {
    return {
      tabLinks: [],
    }
  },

  computed: {
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },

    params() {
      return {
        sessionUuid: this.$route.params.session_uuid,
      }
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
    this.setupTabs()
    this.pgtrFilterTagOptions = [...defaultFilterListTagOptions()]
    this.pgtrInitializePagination('attemptRetrieveProjectListResource', null, this.params)
  },

  methods: {
    ...mapActions(['setFetching', 'attemptCourseTopicsRetrieval']),

    handleViewLastAttempt(item) {
      this.$router.push({
        name: 'classroom.lessons.course.project.access',
        params: {
          type_id: item.topicId,
          type: 'examination',
          ...this.params,
        },
      })
    },

    setupTabs() {
      const assessmentsTab = DEFAULT_TABS['assessments']
      assessmentsTab.notification = this.hasExaminationNotification()
      this.tabLinks.push(assessmentsTab)

      if (this.$isEnabledFeature('competency')) {
        const competencyTab = DEFAULT_TABS['competency']
        competencyTab.notification = this.hasCompetencyNotification()
        this.tabLinks.push(competencyTab)
      }

      this.tabLinks.push(DEFAULT_TABS['preproject'])

      this.setFetching(true)
      this.attemptCourseTopicsRetrieval(this.params)
        .then(({ data }) => {
          this.addLTIEvaluationOnMenu(data, this.tabLinks)
        })
        .finally(() => {
          this.setFetching(false)
        })
      this.changeHeader({ tabLinks: this.tabLinks })
    },

    /**
     * @param {Object} params
     */
    changeHeader(params) {
      this.$emit('change-header', params)
    },
  },
})
</script>

<template>
  <div>
    <FilterList class="p-4">
      <FilterListTag
        slot="tag"
        :tag-all-filters-active="pgtrTagAllFilters"
        :options="pgtrFilterTagOptions"
      />

      <FilterListSearch
        slot="search"
        @search="pgtrSetSearch('title', $event)"
      />

      <FilterListOrder
        slot="order"
        :on-server="true"
        :options="filterListOrderOptions"
        @update-orders="pgtrUpdateOrder"
      />
    </FilterList>

    <div class="py-4">
      <template v-if="$media.mobile">
        <CardProjectStudent
          v-for="(item, index) in pgtrCurrentData"
          :key="index"
          :topic-name="item.topicName"
          :topic-id="item.topicId"
          :last-try-id="item.lastTryId"
          :status="item.status"
          :schedule-period-start="item.schedulePeriodStart"
          :schedule-period-end="item.schedulePeriodEnd"
          :start-time="item.startTime"
          :end-time="item.endTime"
          :button-disabled="item.buttonDisabled"
          @view:attempt="handleViewLastAttempt"
        />
      </template>
      <DatatableProjectStudent
        v-else
        :items="pgtrCurrentData"
        @view:attempt="handleViewLastAttempt"
      />
    </div>

    <Pagination
      v-if="pgtrCurrentData.length"
      class="center"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @change-items-per-page="pgtrParams.limit = $event"
    />
  </div>
</template>
