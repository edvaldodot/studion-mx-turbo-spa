<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'
import EvaluationMixin from '@/mixins/Evaluation'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Pagination from '@/components/general/Pagination'

import DatatablePreProject from './components/DatatablePreProject'
import { defaultFilterListOrderOptions } from './options'

import { DEFAULT_TABS } from '../Competency/CompetencyList/shared'

export default defineComponent({
  name: 'PreProjectList',

  components: {
    DatatablePreProject,
    FilterList,
    FilterListSearch,
    FilterListOrder,
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

    const params = {
      session_uuid: this.$route.params.session_uuid,
    }
    this.pgtrInitializePagination('attemptRetrievePreProjectListResource', null, params)
  },

  methods: {
    ...mapActions(['setFetching', 'attemptCourseTopicsRetrieval']),

    handleViewLastAttempt(item) {
      if (item.status === 'not_started') {
        this.$router.push({
          name: 'classroom.assessments.evaluation.access',
          params: {
            type_id: item.topicId,
            type: 'examination',
            session_uuid: this.$route.params.session_uuid,
          },
        })
      } else {
        this.$router.push({
          name: 'classroom.assessments.evaluation.student',
          params: { session_uuid: this.$route.params.session_uuid, id: item.lastTryId },
        })
      }
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
      this.attemptCourseTopicsRetrieval({
        sessionUuid: this.$route.params.session_uuid,
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
  },
})
</script>

<template>
  <div>
    <div class="p-4">
      <FilterList>
        <FilterListSearch
          slot="search"
          @search="pgtrSetSearch('name', $event)"
        />

        <FilterListOrder
          slot="order"
          :on-server="true"
          :options="filterListOrderOptions"
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>

    <div class="py-4">
      <DatatablePreProject
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
