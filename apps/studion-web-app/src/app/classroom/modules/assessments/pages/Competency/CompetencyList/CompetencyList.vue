<script>
import { defineComponent } from 'vue'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions, mapState } from 'vuex'
import CompetencyListTable from './components/CompetencyListTable'
import CompetenciesListTable from './components/CompetenciesListTable'
import CompetencyStudentListTable from './components/CompetencyStudentListTable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import Tabs from '@/components/general/Tabs'

import { DEFAULT_TABS } from './shared'

import EvaluationMixin from '@/mixins/Evaluation'

export default defineComponent({
  name: 'CompetencyList',

  components: {
    CompetenciesListTable,
    CompetencyListTable,
    CompetencyStudentListTable,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    Tabs,
  },

  mixins: [paginateMixin, EvaluationMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  data() {
    return {
      tabLinks: [],
      tabLinksEvaluationType: [],
      optionIndexTab: 0,
    }
  },

  computed: {
    ...mapState([{ Classroom: (state) => state.Classroom.data }, 'accessibility']),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: this.equalsProfile('student') ? 'competency_name' : 'name',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },
  },

  watch: {
    '$route.name': {
      immediate: true,
      handler(newValue) {
        this.setup(newValue)
      },
    },

    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.pgtrFilterTagOptions.push({
      title: this.$t('global:status'),
      name: 'status',
      items: [
        {
          active: false,
          id: 'finished',
          text: this.$t(`classroom.assessments.evaluation:competency.finished`),
          property: 'status',
        },
        {
          active: false,
          id: 'finished_with_comment',
          text: this.$t(`classroom.assessments.evaluation:competency.finished_with_comment`),
          property: 'status',
        },
        {
          active: false,
          id: 'open',
          text: this.$t(`classroom.assessments.evaluation:competency.open`),
          property: 'status',
        },
      ],
    })

    if (this.notEqualsProfile('student')) {
      this.tabLinksEvaluationType = [
        {
          text: 'classroom.competency.assessments.tab2.link.1',
          location: {
            name: 'classroom.assessments.competency.evaluation',
          },
        },
        {
          text: 'classroom.competency.assessments.tab2.link.2',
          location: {
            name: 'classroom.assessments.competency.student',
          },
        },
      ]
    }

    this.checkFilter()
    this.setupTabs()
  },

  methods: {
    ...mapActions(['setFetching', 'attemptCourseTopicsRetrieval']),

    setup(newValue) {
      if (newValue.includes('.competency.')) {
        this.optionIndexTab = newValue.includes('.student') ? 1 : 0
        const params = {
          session_uuid: this.$route.params.session_uuid,
          params: this.getParams(),
        }
        if (this.equalsProfile('student')) {
          this.pgtrInitializePagination('getCompetencyListResource', null, params)
        } else {
          this.pgtrInitializePagination(
            this.optionIndexTab === 0
              ? 'getCompetenciesListResource'
              : 'getStudentsCompetencyListResource',
            null,
            params
          )
        }
      }
    },

    /** If doesn't have type param, set evaluation by default */
    checkFilter() {
      const competencyRoute = this.$route.name

      if (competencyRoute === 'classroom.assessments.competency') {
        this.$router.replace({ name: `${competencyRoute}.evaluation` })
      }
    },

    /**
     * Add tabs and emit change header
     */
    setupTabs() {
      const assessmentsTab = DEFAULT_TABS['assessments']
      assessmentsTab.notification = this.hasExaminationNotification()
      this.tabLinks.push(assessmentsTab)

      const competencyTab = DEFAULT_TABS['competency']
      competencyTab.notification = this.hasCompetencyNotification()
      this.tabLinks.push(competencyTab)

      this.setFetching(true)
      this.attemptCourseTopicsRetrieval({
        sessionUuid: this.sessionUuid,
      })
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

    /**
     * Return filter params
     * @returns {Object}
     */
    getParams() {
      return {
        filter: {
          student: this.$route.name === 'classroom.assessments.competency.student' ? 1 : 0,
          competency: this.$route.name === 'classroom.assessments.competency.evaluation' ? 1 : 0,
        },
      }
    },
  },
})
</script>

<template>
  <div
    class="inner-content"
    :data-testid="$testId('competency-list')"
  >
    <div class="py-4 pr-4">
      <FilterList>
        <FilterListTag
          v-if="equalsProfile('student')"
          slot="tag"
          :tag-all-filters-active="pgtrTagAllFilters"
          :options="pgtrFilterTagOptions"
          state="Competencies"
        />
        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :label="$t('global:filter.order.label')"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
        <FilterListSearch
          slot="search"
          ref="filterlistsearch"
          hide-error-details
          @search="pgtrSetSearch('name', $event)"
        />
        <template slot="filterTab">
          <div class="tabs-filter">
            <div class="filter-tab-options mb-4">
              <Tabs
                :links="tabLinksEvaluationType"
                :index-active="optionIndexTab"
                :dark="accessibility"
              />
            </div>
          </div>
        </template>
      </FilterList>
    </div>

    <div class="p-4">
      <template v-if="pgtrCurrentData.length && pgtrCurrentData.length > 0">
        <template v-if="equalsProfile('student')">
          <CompetencyListTable />
        </template>
        <template v-else>
          <CompetenciesListTable
            v-if="optionIndexTab === 0"
            @updateList="setup($route.name)"
          />
          <CompetencyStudentListTable
            v-else-if="optionIndexTab === 1"
            @updateList="setup($route.name)"
          />
        </template>

        <Pagination
          class="center"
          :active-page="pgtrParams.page"
          :page-count="pgtrLastPage"
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
          @go-to-page="pgtrParams.page = $event"
          @change-items-per-page="pgtrParams.limit = $event"
        />
      </template>

      <EmptyMessage v-else>
        <h2>{{ $t('classroom.assessments.competency:empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.assessments.competency:empty.message') }}</p>
      </EmptyMessage>
    </div>
  </div>
</template>
