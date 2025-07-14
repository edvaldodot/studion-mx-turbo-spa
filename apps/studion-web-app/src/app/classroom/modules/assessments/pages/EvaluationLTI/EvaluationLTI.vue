<script>
import { mapState, mapActions } from 'vuex'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import Pagination from '@/components/general/Pagination'

import { DEFAULT_TABS } from '../Competency/CompetencyList/shared'

export default {
  name: 'EvaluationLTI',
  components: {
    Action,
    Datatable,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    Pagination,
  },
  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },
  data() {
    return {
      tabLinks: [],
      optionIndexTab: 0,
      existLesson: null,
      evaluations: [],
      evaluationsStudents: { actualPage: 1, data: [] },
      queryParams: { order: { created_at: 'desc' } },
      searching: false,
      dataExaminations: [],
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },
  mounted() {
    this.$emit('change-theme-footer', { dark: false })
  },
  created() {
    this.tabLinks = [
      {
        text: 'classroom.assessments.tab.link.1',
        location: {
          name: 'classroom.assessments.evaluation',
        },
      },
    ]
    if (this.notEqualsProfile('student')) {
      this.tabLinks = [DEFAULT_TABS['assessments']]
    }
    if (this.$isEnabledFeature('competency')) {
      this.tabLinks.push(DEFAULT_TABS['competency'])
    }

    if (this.$isEnabledFeature('pre_project_examination') && this.Classroom.data.preProject) {
      this.tabLinks.push(DEFAULT_TABS['preproject'])
    }

    this.tabLinks.push(DEFAULT_TABS['lti'])

    this.$emit('change-header', {
      customClasses: { evaluation: true },
      tabLinks: this.tabLinks,
    })
    let params = {
      sessionUuid: this.sessionUuid,
      searchParams: { ...this.queryParams, type: 'lti' },
    }
    this.setFetching(true)
    Promise.all([
      this.attemptCourseTopicsRetrieval({
        sessionUuid: this.sessionUuid,
      }),
      this.attemptListClassroomEvaluationLTIByCurrentEnrollment(params),
    ])
      .then(([dataCourse, dataEnrollment]) => {
        this.dataExaminations = dataCourse.data.filter((data) => data.type === 'examination')
        this.existLesson = this.dataExaminations.length > 0
        this.evaluationsStudents = dataEnrollment.data
        this.evaluations = dataEnrollment.data.data
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptListClassroomEvaluation',
      'attemptListClassroomEvaluationLTIByCurrentEnrollment',
      'attemptCourseTopicsRetrieval',
    ]),
    openEvaluation(topicId) {
      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          type_id: topicId,
          type: 'examination',
          session_uuid: this.sessionUuid,
          isCorrection: true,
        },
      })
    },
    loadEvaluationsByEnrollments() {
      this.setFetching(true)
      let params = {
        sessionUuid: this.sessionUuid,
        searchParams: { ...this.queryParams, type: 'lti' },
      }

      this.attemptListClassroomEvaluationLTIByCurrentEnrollment(params)
        .then(({ data }) => {
          this.evaluations = data.data
          this.evaluationsStudents = data
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    search(value) {
      this.searching = value !== ''
      this.queryParams.query = { name: value }
      this.loadEvaluationsByEnrollments()
    },
    nextPage() {
      if (this.evaluationsStudents.nextPage) {
        this.queryParams.page = this.evaluationsStudents.nextPage
        this.loadEvaluationsByEnrollments()
      }
    },
    previousPage() {
      if (this.evaluationsStudents.previousPage) {
        this.queryParams.page = this.evaluationsStudents.previousPage
        this.loadEvaluationsByEnrollments()
      }
    },
    lastPage() {
      if (this.evaluationsStudents.lastPage) {
        this.queryParams.page = this.evaluationsStudents.lastPage
        this.loadEvaluationsByEnrollments()
      }
    },
    firstPage() {
      if (this.evaluationsStudents.firstPage) {
        this.queryParams.page = this.evaluationsStudents.firstPage
        this.loadEvaluationsByEnrollments()
      }
    },
  },
}
</script>

<template>
  <div class="inner-content">
    <FilterList
      v-if="notEqualsProfile('student') && (evaluationsStudents.data.length > 0 || searching)"
    >
      <filter-list-search
        v-show="optionIndexTab === 0"
        slot="search"
        ref="filterlistsearch"
        :dark="accessibility"
        @search="search"
      />
    </FilterList>

    <template v-if="evaluationsStudents.data.length === 0">
      <EmptyMessage v-if="equalsProfile('student') && !searching">
        <h2>{{ $t('classroom.assessments.evaluation:empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.assessments.evaluation:empty.message.1') }}</p>
        <p class="text-color">{{ $t('classroom.assessments.evaluation:empty.message.2') }}</p>
      </EmptyMessage>

      <EmptyMessage v-if="notEqualsProfile('student') && !searching">
        <h2>{{ $t('classroom.assessments.evaluation.list:empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.assessments.evaluation.list:empty.message.1') }}</p>
        <p v-html="$t('classroom.assessments.evaluation.list:empty.message.2')"></p>
      </EmptyMessage>

      <EmptyMessage v-if="existLesson === true && searching">
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </EmptyMessage>
    </template>

    <div
      v-if="evaluationsStudents.data.length > 0"
      class="center mt-10"
    >
      <Datatable :items="evaluations">
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th class="th col-5">
              {{ $t('classroom.assessments.evaluation:datatable.header.1') }}
            </th>
            <th class="th col-2 text-center">
              {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
            </th>
            <th class="th col-2 text-center">
              {{ $t('classroom.assessments.evaluation:datatable.header.8') }}
            </th>
            <th class="th col-2 text-center">
              {{ $t('classroom.assessments.evaluation:datatable.header.9') }}
            </th>
            <th
              v-if="equalsProfile('student')"
              class="th col-1"
            ></th>
          </tr>
          <tr
            v-if="$media.mobile"
            class="tr-colspan"
          >
            <td class="label-title">
              <span class="td-text bolder">{{
                $t('classroom.assessments.evaluation:datatable.header.1')
              }}</span>
            </td>
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
              class="label-title-name"
              colspan="4"
            >
              <span
                class="td-text"
                :style="{ display: 'block' }"
                >{{ props.item.topicName }}</span
              >
            </td>
          </tr>
          <tr
            v-if="$media.mobile"
            class="tr-colspan"
          >
            <td class="td text-center col-3">
              <span class="td-text bolder">{{
                $t('classroom.assessments.evaluation:datatable.header.10')
              }}</span>
            </td>
            <td class="td text-center col-3">
              <span class="td-text bolder">{{
                $t('classroom.assessments.evaluation:datatable.header.8')
              }}</span>
            </td>
            <td class="td text-center col-3">
              <span class="td-text bolder">{{
                $t('classroom.assessments.evaluation:datatable.header.9')
              }}</span>
            </td>
            <td
              v-if="notEqualsProfile('student')"
              class="td col-3 td-actions text-right"
            ></td>
          </tr>
          <tr class="tr-body">
            <td
              v-if="!$media.mobile"
              class="td"
            >
              <span class="td-text bolder">{{ props.item.topicName }}</span>
            </td>
            <td class="td text-center">
              <span class="td-text">{{ props.item.userData.name }}</span>
            </td>
            <td class="td text-center">
              <span class="td-text">{{ props.item.highestGrade }}</span>
            </td>
            <td class="td text-center">
              <span class="td-text bolder">{{ props.item.lastTryGrade }}</span>
            </td>
            <td
              v-if="equalsProfile('student')"
              class="td td-actions text-right"
            >
              <Action
                type="button"
                icon="visibility"
                class="is-highlight"
                @click="openEvaluation(props.item.topicId)"
              />
            </td>
          </tr>
        </template>
      </Datatable>

      <Pagination
        :active-page="evaluationsStudents.actualPage"
        :page-count="evaluationsStudents.lastPage"
        @next-page="nextPage"
        @previous-page="previousPage"
        @first-page="firstPage"
        @last-page="lastPage"
        @go-to-page="evaluationsStudents.actualPage = $event"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/assessments/styles.scss';
</style>
