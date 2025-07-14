<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { assessmentMixin } from '@/mixins/assessmentMixin'
import { paginateMixin } from '@/mixins/paginatorMixin'
import evaluationMixin from '@/mixins/Evaluation'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Modal from '@/components/general/Modal'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import ModalEvaluationSelectAttempt from '../../../ModalEvaluationSelectAttempt'
import Pagination from '@/components/general/Pagination'
import NotificationCircle from '@/components/general/NotificationCircle'
import SlugTooltip from '@/components/general/SlugTooltip'

import { getLabelAttemptOfTries } from '../../../../utils/labels'

export default defineComponent({
  name: 'ModalExaminationsStudents',

  components: {
    Datatable,
    EmptyMessage,
    Modal,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Dropdown,
    DropdownLink,
    ModalEvaluationSelectAttempt,
    Pagination,
    NotificationCircle,
    SlugTooltip,
  },

  mixins: [assessmentMixin, paginateMixin, evaluationMixin],

  data() {
    return {
      selectedEvaluation: null,
    }
  },

  computed: {
    ...mapState(['fetching', 'Classroom']),

    isHybrid() {
      return this.Classroom.data.course.type.alias === 'hybrid'
    },

    statusList() {
      return [
        'not_started',
        'started',
        'pending',
        'passed',
        'failed',
        'accomplished',
        'resolved',
        'awaiting_correction',
        'retake',
        'expired',
      ]
    },

    title() {
      return (
        this.pgtrCurrentData && this.pgtrCurrentData[0] && this.pgtrCurrentData[0].examination_name
      )
    },

    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc',
        },
        {
          text: this.$t('global:filter.grade.asc'),
          value: 1,
          property: 'grade',
          type: 'desc',
        },
        {
          text: this.$t('global:filter.grade.desc'),
          value: 2,
          property: 'grade',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 3,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 4,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },
  },

  watch: {
    pgtrIsFetching: {
      handler(loading) {
        this.setFetching(loading)
      },
    },

    '$route.params.enrollment': {
      immediate: true,
      handler(value) {
        if (!value) return

        this.selectedEvaluation = {
          topic: { name: this.title },
          params: {
            sessionUuid: this.$route.params.session_uuid,
            examinationId: this.$route.params.id,
            enrollmentId: this.$route.params.enrollment,
          },
        }
      },
    },
  },

  created() {
    let payload = {
      query: {
        examination_id: this.$route.params.id,
        sessionUuid: this.$route.params.session_uuid,
      },
    }

    this.pgtrDefaultOrder = {
      property: 'name',
      type: 'asc',
    }

    this.setTagOptions()

    const evaluationParams = this.getFromLocalStorage('evaluation-preferences') || {}

    const sessionEvaluationParams =
      evaluationParams[this.$route.params.session_uuid] &&
      evaluationParams[this.$route.params.session_uuid][this.$route.params.id]

    if (sessionEvaluationParams) {
      payload = sessionEvaluationParams
    }

    this.pgtrInitializePagination('getStudentExaminations', null, payload)
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching']),

    setTagOptions() {
      const mappedStatus = this.statusList.map((statusName) => {
        return {
          text: this.$t(`classroom.assessments.evaluation:status.${statusName}`),
          id: statusName,
          property: 'status',
          active: false,
        }
      })

      this.pgtrFilterTagOptions = [
        {
          title: this.$t('global:status'),
          name: 'status',
          items: mappedStatus,
        },
      ]
    },

    redirect(props) {
      this.$router.push({
        name: 'classroom.assessments.evaluation.student',
        params: {
          id: props.item.enrollment_examination_id,
        },
        query: {
          examination_id: this.$route.params.id,
          order: new URLSearchParams(this.pgtrParams.order).toString(),
        },
      })
    },

    accessAttempt(item) {
      this.$router.push({
        name: 'classroom.assessments.evaluation.student',
        params: {
          id: item,
        },
        query: {
          examination_id: this.$route.params.id,
          order: new URLSearchParams(this.pgtrParams.order).toString(),
        },
      })
    },

    close() {
      const preferences = this.getFromLocalStorage('evaluation-preferences') || {}

      preferences[this.$route.params.session_uuid] = {
        ...preferences[this.$route.params.session_uuid],
        [this.$route.params.id]: this.pgtrParams,
      }

      this.saveToLocalStorage('evaluation-preferences', preferences)
      this.$emit('close')
    },

    openAllAttempts(item) {
      this.$router.push({ params: { enrollment: item.i_sessions_applications_users } })
    },

    closeAttemptSelection() {
      this.$router.push({ params: { enrollment: null } })
    },

    showHighestGradeCondition(status, grade) {
      if (this.isHybrid) {
        switch (status) {
          case 'pending':
            return this.$t('classroom.assessments.evaluation:status.not.corrected')
          case 'accomplished':
            return this.getFormatedGrade(grade)
          default:
            return '-'
        }
      } else {
        return this.getFormatedGrade(grade)
      }
    },

    getFormatedGrade(grade) {
      return grade > 0 ? grade.replace('.', ',') : '0'
    },
    getLabelAttemptOfTries,
  },
})
</script>

<template>
  <div>
    <Modal
      :active="!Boolean($route.params.enrollment)"
      is-page
      :data-test="$testId('modal-examinations-students')"
      class="modal-examinations-students"
      @close="close"
    >
      <span class="modal-subtitle">{{ $t('classroom.assessments.tab.link.1') }}</span>
      <h2 class="modal-title text-color">
        {{ title }}
      </h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('classroom.examinations.users.list:modal.description') }}</p>
      </div>
      <div class="py-3">
        <FilterList>
          <FilterListOrder
            slot="order"
            :options="filterListOrderOptions"
            :label="$t('global:filter.order.label')"
            :initial-value="pgtrParams.order"
            on-server
            dark
            @update-orders="pgtrUpdateOrder"
          />
          <FilterListSearch
            slot="search"
            ref="filterlistsearch"
            :initial-value="pgtrParams.query['name']"
            hide-error-details
            dark
            @search="pgtrSetSearch('name', $event)"
          />
          <FilterListTag
            slot="tag"
            :tag-all-filters-active="pgtrTagAllFilters"
            :options="pgtrFilterTagOptions"
            :initial-value="pgtrParams.filter"
            dark
          />
        </FilterList>
      </div>

      <div v-if="pgtrCurrentData && pgtrCurrentData.length > 0">
        <Datatable
          :items="pgtrCurrentData"
          dark
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th class="th col-3">
                {{ $t('classroom.assessments.evaluation:datatable.header.5') }}
              </th>

              <th
                v-if="$isEnabledFeature('slug_identity')"
                class="th col-1"
              >
                {{ $t('global:slug.identity') }}
              </th>

              <th
                class="th"
                width="15%"
              >
                {{ $t('global:shipping') }}
              </th>

              <th
                class="th"
                width="10%"
              >
                {{ $t('classroom.assessments.evaluation:datatable.header.6') }}
              </th>
              <th
                class="th"
                width="10%"
              >
                {{ $t('classroom.assessments.evaluation:datatable.header.8') }}
              </th>
              <th
                class="th"
                width="12%"
              >
                {{ $t('classroom.assessments.evaluation:datatable.header.9') }}
              </th>
              <th
                class="th"
                width="15%"
              >
                {{ $t('global:correction') }}
              </th>
              <th class="th">{{ $t('global:status') }}</th>
              <th class="th"></th>
            </tr>
          </template>
          <template
            slot="tbody"
            slot-scope="props"
          >
            <tr
              :class="{
                'tr-body': !$media.mobile,
                'tr-mobile': $media.mobile,
              }"
            >
              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('classroom.assessments.evaluation:datatable.header.5') }}
                </span>
                <NotificationCircle
                  v-if="
                    checkExistingNotification(
                      'enrollment_id',
                      props.item.i_sessions_applications_users
                    ) && checkExistingNotification('examination_id', props.item.i_examinations)
                  "
                  class="datatable__notification-circle"
                />
                <span class="td-text column-td bolder">{{ props.item.student_name }}</span>
              </td>

              <td
                v-if="$isEnabledFeature('slug_identity')"
                class="td text-center"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('global:slug.identity') }}
                </span>
                <span class="td-text column-td">
                  <SlugTooltip :slug="props.item.slug" />
                </span>
              </td>
              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('global:shipping') }}
                </span>
                <span class="td-text column-td">
                  {{ props.item.end_time ? formatDate(props.item.end_time, 'long') : '-' }}
                </span>
              </td>

              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('classroom.assessments.evaluation:datatable.header.6') }}
                </span>
                <span
                  class="td-tag"
                  v-html="getLabelAttemptOfTries(props.item.last_attempt, props.item.tries)"
                ></span>
              </td>

              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('classroom.assessments.evaluation:datatable.header.8') }}
                </span>
                <span class="td-text column-td">
                  {{
                    showHighestGradeCondition(props.item.examination_status, props.item.max_grade)
                  }}
                </span>
              </td>

              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('classroom.assessments.evaluation:datatable.header.9') }}
                </span>
                <span class="td-text column-td">
                  {{
                    showHighestGradeCondition(props.item.examination_status, props.item.last_grade)
                  }}
                </span>
              </td>

              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('global:correction') }}
                </span>
                <span class="td-text column-td">
                  {{
                    props.item.correctionTime ? formatDate(props.item.correctionTime, 'long') : '-'
                  }}
                </span>
              </td>

              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('global:status') }}
                </span>
                <span
                  class="td-text column-td"
                  :class="{ hasGrade: props.item.lastTryIsGrade }"
                >
                  {{
                    $t(`classroom.assessments.evaluation:status.${props.item.examination_status}`)
                  }}
                </span>
              </td>

              <td class="td text-right td-actions">
                <dropdown
                  v-if="
                    props.item.enrollment_examination_id &&
                    isUserAllowedInContext('classroom:examination', 'evaluate')
                  "
                  icon="dots-vertical"
                  right
                >
                  <dropdown-link
                    :text="$t('classroom.assessments.evaluation:see.attempts')"
                    @click="openAllAttempts(props.item)"
                  />
                  <dropdown-link
                    v-if="allowsCorrect(props.item.examination_status)"
                    :text="$t('classroom.assessments.evaluation:correct')"
                    @click="redirect(props)"
                  />
                </dropdown>
              </td>
            </tr>
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
      <EmptyMessage v-else>
        <h2>{{ $t('classroom.examinations.users.list:modal.title.empty') }}</h2>
      </EmptyMessage>
    </Modal>

    <ModalEvaluationSelectAttempt
      :active="Boolean($route.params.enrollment)"
      :data="selectedEvaluation"
      @close="closeAttemptSelection"
      @access="accessAttempt"
    />
  </div>
</template>
<style lang="scss">
@import './ModalExaminationsStudents.scss';
</style>
