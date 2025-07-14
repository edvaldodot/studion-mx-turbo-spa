<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'
import EvaluationMixin from '@/mixins/Evaluation'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Pagination from '@/components/general/Pagination'

import DatatableProject from './components/DatatableProject'
import { defaultFilterListOrderOptions } from './options'

import { DEFAULT_TABS } from '@/app/classroom/modules/assessments/pages/Competency/CompetencyList/shared.js'

export default defineComponent({
  name: 'TccProject',

  components: {
    DatatableProject,
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

    params() {
      return {
        session_uuid: this.$route.params.session_uuid,
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
    this.pgtrInitializePagination('attemptRetrievePreProjectListResource', null, this.params)
  },

  methods: {
    ...mapActions(['setFetching', 'attemptCourseTopicsRetrieval']),

    handleViewLastAttempt(item) {
      this.$router.push({
        name: 'classroom.pre.project.tccproject.modal.datatableProject',
        params: {
          id: item.examinationId,
          session_uuid: this.$route.params.session_uuid,
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
      this.attemptCourseTopicsRetrieval({ sessionUuid: this.params.session_uuid })
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
      <DatatableProject
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

    <RouterView/>
  </div>
</template>
