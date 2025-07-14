<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import { defaultFilterTagOptions, makePreferenceColumns, makeDefaultPreferences } from './util'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterPreferences from '@/components/general/FilterPreferences'
import ModalEvaluationSelectAttempt from '../ModalEvaluationSelectAttempt'
import Tabs from '@/components/general/Tabs'
import Pagination from '@/components/general/Pagination'
import EvaluationByStudent from './components/EvaluationByStudent'
import EvaluationList from './components/EvaluationList'
import StudentEvaluationList from './components/StudentEvaluationList'
import EvaluationMixin from '@/mixins/Evaluation'
import config from '@/config'

const { HIDE_COLUMN_STUDENT_EVALUATION_LIST } = config

export default defineComponent({
  name: 'TheEvaluation',
  components: {
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListTag,
    FilterListSearch,
    FilterPreferences,
    ModalEvaluationSelectAttempt,
    Tabs,
    Pagination,
    EvaluationByStudent,
    StudentEvaluationList,
    EvaluationList,
  },
  mixins: [EvaluationMixin],
  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },
  data() {
    return {
      tabLinks: [],
      tabLinksEvaluationType: [],
      optionIndexTab: 0,
      existLesson: null,
      listingMode: false,
      evaluations: {
        actualPage: 1,
        data: [],
      },
      evaluationsStudents: { actualPage: 1, data: [] },
      queryParams: {
        page: 1,
        query: {},
        limit: 12,
        order: {},
      },
      currentData: null,
      modalClass: false,
      searching: false,
      dataExaminations: [],
      dataCourse: null,
      isFiltering: false,
      defaultPreferences: [...makeDefaultPreferences()],
    }
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility', 'Settings']),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
    changeTypeIcons() {
      if (this.equalsProfile('student')) {
        return ['clipboard-account']
      } else {
        return ['clipboard-account', 'clipboard-text']
      }
    },
    isHybrid() {
      return this.Classroom.data.course.type.alias === 'hybrid'
    },

    filterListOrderOptions() {
      const isStudent = this.equalsProfile('student')
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: isStudent ? 'title' : 'name',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'end_time',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'end_time',
          type: 'desc',
        },
        {
          text: this.$t('global:filter.grade.asc'),
          value: 3,
          property: 'grade',
          type: 'desc',
        },
        {
          text: this.$t('global:filter.grade.desc'),
          value: 4,
          property: 'grade',
          type: 'asc',
        },
      ]
    },
    filterTagOptionsFF() {
      return defaultFilterTagOptions()
    },

    preferenceColumns() {
      let preferences = [...makePreferenceColumns()]
      let hideColumn = HIDE_COLUMN_STUDENT_EVALUATION_LIST
      if (hideColumn && hideColumn.length) {
        preferences = preferences.filter((col) => !hideColumn.includes(col.value))
      }

      return preferences
    },

    visibleMetaColumns() {
      return this.metadataColumns.filter((meta) => {
        return (
          this.Settings.displayFeatures.evaluation_list &&
          this.Settings.displayFeatures.evaluation_list[meta.value]
        )
      })
    },
    preferenceColumnsCount() {
      let preferences = []
      for (let key in this.Settings.displayFeatures.evaluation_list) {
        if (this.Settings.displayFeatures.evaluation_list[key]) preferences.push(key)
      }
      return preferences.length
    },
  },

  watch: {
    'Classroom.notifications.length'() {
      this.mountHeaderLinks()
    },
  },

  mounted() {
    this.$emit('change-theme-footer', { dark: false })
  },
  created() {
    this.setFetching(true)
    this.queryParams.order = this.equalsProfile('student')
      ? { is_graded: 'asc', aud_dh_update: 'asc' }
      : { created_at: 'desc' }
    this.mountHeaderLinks()
    this.setup()
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptListClassroomEvaluation',
      'attemptListClassroomEvaluationByEnrollment',
      'attemptListClassroomEvaluationByCurrentEnrollment',
      'attemptCourseTopicsRetrieval',
    ]),
    /**
     * Check if LTI is able to be added in evaluation menu
     * @param {Object} dataCourse
     */
    changeType(value) {
      this.listingMode = value
      if (value === false) {
        this.loadEvaluationsByEnrollments()
      } else if (this.evaluations.length === 0) {
        this.loadClassroomEvaluations()
      }
    },

    mountHeaderLinks() {
      this.tabLinks = [
        {
          text: 'classroom.assessments.tab.link.1',
          notification: this.hasExaminationNotification(),
          location: {
            name: 'classroom.assessments.evaluation',
          },
        },
      ]
      if (this.notEqualsProfile('student')) {
        this.tabLinks = [
          {
            text: 'classroom.assessments.tab.link.1',
            notification: this.hasExaminationNotification(),
            location: {
              name: 'classroom.assessments.evaluation',
            },
          },
        ]
        this.tabLinksEvaluationType = [
          {
            text: 'classroom.assessments.tab2.link.1',
          },
          {
            text: 'classroom.assessments.tab2.link.2',
          },
        ]
      }
      if (this.$isEnabledFeature('competency')) {
        this.tabLinks.push({
          text: 'classroom.assessments.tab.link.2',
          notification: this.hasCompetencyNotification(),
          location: {
            name: 'classroom.assessments.competency',
          },
        })
      }

      this.$emit('change-header', {
        customClasses: { evaluation: true },
        tabLinks: this.tabLinks,
      })
    },

    setup() {
      const itemsPerPagePreferences = this.getFromLocalStorage('itemsPerPagePreferences') || {}
      if (itemsPerPagePreferences[this.$route.name]) {
        this.queryParams.limit = itemsPerPagePreferences[this.$route.name]
      }

      let params = {
        sessionUuid: this.sessionUuid,
        searchParams: this.queryParams,
      }
      this.setFetching(true)
      Promise.all([
        this.attemptCourseTopicsRetrieval({
          sessionUuid: this.sessionUuid,
        }),
        this.equalsProfile('student')
          ? this.attemptListClassroomEvaluationByCurrentEnrollment(params)
          : this.attemptListClassroomEvaluationByEnrollment(params),
      ])
        .then(([dataCourse, dataEnrollment]) => {
          this.dataExaminations = dataCourse.data.filter((data) => data.type === 'examination')
          this.existLesson = dataEnrollment.data.data.length > 0
          this.evaluationsStudents = dataEnrollment.data
          this.addLTIEvaluationOnMenu(dataCourse.data, this.tabLinks)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    changeItemsPerPage(val) {
      this.queryParams.limit = val
      if (this.queryParams.page !== 1) {
        this.queryParams.page = 1
        return
      }
      this.checkCurrentPageLoad()
    },
    checkTab(index) {
      if (this.optionIndexTab !== null && this.optionIndexTab !== index) {
        this.$refs.filterlistsearch.clearSearch()
        this.$refs.filterlistsearch.closeSearchForm()
      }
      this.optionIndexTab = index
      if (index === 0) {
        this.listingMode = false
        this.loadEvaluationsByEnrollments()
      } else if (index === 1) {
        this.listingMode = true
        this.loadClassroomEvaluations()
      }
    },
    existLessonSession() {
      this.setFetching(true)
      this.attemptCourseTopicsRetrieval(this.sessionUuid)
        .then(({ data }) => {
          this.existLesson = data.filter((data) => data.type === 'examination').length > 0
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openEvaluationStudent(item) {
      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          type_id: item.topicId,
          type: 'examination',
          session_uuid: this.sessionUuid,
          isCorrection: true,
        },
      })
    },
    openEvaluation(evaluation) {
      if (['expired', 'started'].includes(evaluation.status)) {
        return this.$router.push({
          name: 'classroom.lessons.course.type',
          params: {
            type_id: evaluation.examination.topic.id,
            type: 'examination',
            session_uuid: this.sessionUuid,
          },
        })
      }

      this.$router.push({
        name: 'classroom.assessments.evaluation.student',
        params: {
          id: evaluation.id,
          session_uuid: this.sessionUuid,
        },
      })
    },
    openEvaluationGroup(id) {
      this.$router.push({
        name: 'classroom.assessments.evaluation.all',
        params: {
          id: id,
          session_uuid: this.sessionUuid,
        },
      })
    },
    loadEvaluationsByEnrollments() {
      this.setFetching(true)
      let params = {
        sessionUuid: this.sessionUuid,
        searchParams: this.queryParams,
      }
      let promise
      if (this.equalsProfile('student')) {
        promise = this.attemptListClassroomEvaluationByCurrentEnrollment(params)
      } else {
        promise = this.attemptListClassroomEvaluationByEnrollment(params)
      }
      promise
        .then(({ data }) => {
          this.evaluationsStudents = data
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    search(value) {
      this.searching = value !== ''
      let params = { name: value }
      if (this.equalsProfile('student')) {
        params = { title: value }
      }
      this.queryParams.query = params
      this.checkCurrentPageLoad()
    },

    checkCurrentPageLoad() {
      if (this.optionIndexTab === 0) {
        this.loadEvaluationsByEnrollments()
      } else {
        this.loadClassroomEvaluations()
      }
    },

    checkPagePaginationAttributes(attr) {
      if (this.optionIndexTab === 0 && this.evaluationsStudents[attr]) return true

      if (this.optionIndexTab === 1 && this.evaluations[attr]) return true

      return false
    },
    nextPage() {
      if (this.checkPagePaginationAttributes('nextPage')) {
        this.queryParams.page = this.evaluationsStudents.nextPage
        this.checkCurrentPageLoad()
      }
    },
    previousPage() {
      if (this.checkPagePaginationAttributes('previousPage')) {
        this.queryParams.page = this.evaluationsStudents.previousPage
        this.checkCurrentPageLoad()
      }
    },
    lastPage() {
      if (this.checkPagePaginationAttributes('lastPage')) {
        this.queryParams.page = this.evaluationsStudents.lastPage
        this.checkCurrentPageLoad()
      }
    },
    firstPage() {
      if (this.checkPagePaginationAttributes('firstPage')) {
        this.queryParams.page = this.evaluationsStudents.firstPage
        this.checkCurrentPageLoad()
      }
    },
    openModalClass(item) {
      this.loadEvaluationAttempts(item)
      this.modalClass = true
    },
    loadClassroomEvaluations() {
      this.setFetching(true)
      this.attemptListClassroomEvaluation({
        sessionUuid: this.sessionUuid,
        searchParams: this.queryParams,
      })
        .then(({ data }) => {
          this.evaluations = data || []
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    loadEvaluationAttempts(item) {
      this.currentData = {
        user: item.student,
        topic: {
          id: item.topicId,
          name: item.evaluationName,
        },
        course: {
          name: this.Classroom.data.course.name,
        },
        params: {
          sessionUuid: this.sessionUuid,
          examinationId: item.examination,
          enrollmentId: item.enrollmentId,
        },
      }
    },

    closeModalClass() {
      this.modalClass = false
    },
    isInPeriod(topicId) {
      const topic = this.dataExaminations.find((item) => item.id === topicId)
      if (!topic.topicPeriods) return false
      return topic.topicPeriods.schedulePeriod.open
    },
    filterOrder(value) {
      this.queryParams.order = {}
      if (value) {
        this.queryParams.order[value.property] = value.type
      }
      this.checkCurrentPageLoad()
    },

    updateFilters(filters) {
      this.selectedFilters = filters

      this.queryFilters()
    },

    queryFilters() {
      let params = {
        categories: [],
      }

      this.selectedFilters.forEach((obj) => {
        if (!Array.isArray(params[obj.property])) {
          params[obj.property] = []
        }
        params[obj.property].push(obj.id)
      })

      this.queryParams.filter = { ...this.queryParams.query, ...params }

      this.checkCurrentPageLoad()
    },

    isFilteringSearch(value) {
      this.isFiltering = value
    },
    checkIfColumnIsVisible(name) {
      if (this.preferenceColumnsCount === 0) return this.defaultPreferences.includes(name)
      return this.Settings.displayFeatures.evaluation_list[name]
    },
  },
})
</script>

<template>
  <div
    class="inner-content p-4"
    :data-test="$testId('evaluation-container')"
  >
    <div class="p-4">
      <FilterList>
        <FilterListSearch
          slot="search"
          ref="filterlistsearch"
          :dark="accessibility"
          @search="search"
        />
        <FilterListTag
          v-if="equalsProfile('student')"
          slot="tag"
          :options="filterTagOptionsFF"
          @update-filters="updateFilters($event)"
          @update-filtering="isFilteringSearch"
        />
        <FilterListOrder
          v-if="equalsProfile('student')"
          slot="order"
          :options="filterListOrderOptions"
          :label="$t('global:filter.order.label')"
          on-server
          @update-orders="filterOrder"
        />
        <FilterPreferences
          v-if="equalsProfile('student')"
          slot="preferences"
          :columns="preferenceColumns"
          :default-preferences="defaultPreferences"
          field="evaluation_list"
        />
        <template slot="filterTab">
          <div class="tabs-filter">
            <div class="filter-tab-options">
              <Tabs
                :links="tabLinksEvaluationType"
                :index-active="optionIndexTab"
                :dark="accessibility"
                @tabChange="checkTab"
              />
            </div>
          </div>
        </template>
      </FilterList>
    </div>

    <EmptyMessage v-if="existLesson === false && notEqualsProfile('student') && !isFiltering">
      <h2>{{ $t('classroom.assessments.evaluation:empty.title.2') }}</h2>
      <p class="text-color">{{ $t('classroom.assessments.evaluation:empty.message.3') }}</p>
      <p v-html="$t('classroom.assessments.evaluation:empty.message.4')"></p>
    </EmptyMessage>

    <EmptyMessage v-if="existLesson === false && equalsProfile('student') && !isFiltering">
      <h2>{{ $t('classroom.assessments.evaluation:empty.title.2') }}</h2>
      <p class="text-color">{{ $t('classroom.assessments.evaluation:empty.message.3') }}</p>
      <p v-html="$t('classroom.assessments.evaluation:empty.message.5')"></p>
    </EmptyMessage>

    <EmptyMessage
      v-if="
        existLesson === true &&
        evaluationsStudents.data.length === 0 &&
        equalsProfile('student') &&
        !searching &&
        !isFiltering
      "
    >
      <h2>{{ $t('classroom.assessments.evaluation:empty.title') }}</h2>
      <p class="text-color">{{ $t('classroom.assessments.evaluation:empty.message.1') }}</p>
      <p class="text-color">{{ $t('classroom.assessments.evaluation:empty.message.2') }}</p>
    </EmptyMessage>

    <EmptyMessage
      v-if="
        existLesson === true &&
        evaluationsStudents.data.length === 0 &&
        notEqualsProfile('student') &&
        !searching &&
        !isFiltering
      "
    >
      <h2>{{ $t('classroom.assessments.evaluation.list:empty.title') }}</h2>
      <p class="text-color">{{ $t('classroom.assessments.evaluation.list:empty.message.1') }}</p>
      <p v-html="$t('classroom.assessments.evaluation.list:empty.message.2')"></p>
    </EmptyMessage>

    <EmptyMessage
      v-if="
        existLesson === true && evaluationsStudents.data.length === 0 && searching && !isFiltering
      "
    >
      <h2>{{ $t('global:search.empty.title') }}</h2>
      <p class="text-color">{{ $t('global:search.empty.message') }}</p>
    </EmptyMessage>

    <EmptyMessage v-if="evaluationsStudents.data.length === 0 && !searching && isFiltering">
      <h2>{{ $t('community.sessions:filter.empty.title') }}</h2>
    </EmptyMessage>

    <div
      v-if="existLesson === true && evaluationsStudents.data.length > 0"
      class="center py-4"
    >
      <template v-if="optionIndexTab === 1 && listingMode && evaluations.data.length > 0">
        <EvaluationByStudent :evaluations="evaluations.data" />
      </template>

      <template v-else-if="optionIndexTab === 0 && evaluationsStudents.data.length > 0">
        <template v-if="equalsProfile('student')">
          <StudentEvaluationList
            :evaluations="evaluationsStudents"
            :check-column="checkIfColumnIsVisible"
            @openModalAttempts="openModalClass"
          />
        </template>
        <template v-else>
          <EvaluationList :evaluations="evaluationsStudents" />
        </template>
      </template>
      <Pagination
        :active-page="
          optionIndexTab === 0 ? evaluationsStudents.actualPage : evaluations.actualPage
        "
        :page-count="optionIndexTab === 0 ? evaluationsStudents.lastPage : evaluations.lastPage"
        @next-page="nextPage"
        @previous-page="previousPage"
        @first-page="firstPage"
        @last-page="lastPage"
        @go-to-page="
          optionIndexTab === 0
            ? (evaluationsStudents.actualPage = $event)
            : (evaluations.actualPage = $event)
        "
        @change-items-per-page="changeItemsPerPage"
      />
    </div>

    <ModalEvaluationSelectAttempt
      :active="modalClass"
      :data="currentData"
      @close="closeModalClass"
      @access="openEvaluation"
    />
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/assessments/styles.scss';
</style>
