<script>
import { defineComponent } from 'vue'
import config from '@/config'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import NotificationCircle from '@/components/general/NotificationCircle'
import Tooltip from '@/components/general/Tooltip'
import Icon from '@/components/general/Icon'
import DataTableTd from '@/components/general/DataTableTd'

import { assessmentMixin } from '@/mixins/assessmentMixin'
import EvaluationMixin from '@/mixins/Evaluation'

import { getLabelAttemptOfTries } from '../../../../utils/labels'

const { HIDE_COLUMN_STUDENT_EVALUATION_LIST } = config

export default defineComponent({
  name: 'StudentEvaluationList',

  components: {
    Datatable,
    Dropdown,
    DropdownLink,
    NotificationCircle,
    Tooltip,
    Icon,
    DataTableTd,
  },

  mixins: [assessmentMixin, EvaluationMixin],

  props: {
    evaluations: {
      type: Object,
      default: () => {},
    },
    checkColumn: {
      type: Function,
      default: () => {},
    },
  },

  computed: {
    computedVisibleColumns() {
      let columns = [
        'name',
        'term',
        'date',
        'mandatory',
        'attempts',
        'grade',
        'last-attempts',
        'status',
      ]

      let hideColumn = HIDE_COLUMN_STUDENT_EVALUATION_LIST

      if (hideColumn && hideColumn.length) {
        columns = columns.filter((col) => !hideColumn.includes(col))
      }

      return columns.reduce((acc, column) => {
        acc[column] = this.checkColumn(column)
        return acc
      }, {})
    },
  },

  methods: {
    showHighestGradeCondition(item) {
      const { highestGradeDecimal } = item

      return highestGradeDecimal !== null && !(typeof highestGradeDecimal === 'number')
    },

    openEvaluation(item) {
      if (this.$isEnabledFeature('examination_tool_feature')) {
        return this.openExaminationToolFeature(item)
      }

      this.openEvaluationStudent(item)
    },

    openEvaluationStudent(item, isRetry = false) {
      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          type_id: item.topicId,
          type: 'examination',
          session_uuid: this.$route.params.session_uuid,
          isCorrection: true,
          retry: isRetry,
        },
      })
    },

    openExaminationToolFeature(item) {
      const isCorrection = item.status === 'awaiting_correction'
      const isStarted = item.status !== 'not_started'

      this.$router.push({
        name: 'classroom.assessments.evaluation.access',
        params: {
          type_id: item.topicId,
          type: 'examination',
          session_uuid: this.$route.params.session_uuid,
          isCorrection: isCorrection,
          isStarted: isStarted,
        },
      })
    },

    openModalAttempts(item) {
      this.$emit('openModalAttempts', item)
    },

    getLabelAttemptOfTries,

    showTryAgainButton(item) {
      return (
        item.status !== 'awaiting_correction' && item.attempts > 0 && item.attempts < item.tries
      )
    },
  },
})
</script>
<template>
  <div class="datatable__student-evaluation">
    <Datatable
      :items="evaluations.data"
      :data-test="$testId('student-evaluation-list')"
    >
      <template slot="thead">
        <tr v-if="!$media.mobile">
          <th
            v-if="computedVisibleColumns.name"
            class="th"
          >
            {{ $t('classroom.assessments.evaluation:datatable.header.1.1') }}
          </th>
          <th
            v-if="computedVisibleColumns.term"
            class="th vacancies"
          >
            <Tooltip
              :uppercase="false"
              :width="230"
              medium-font
              dark
            >
              <template #activator="{ on }">
                <span v-on="on">
                  {{ $t('classroom.assessments.evaluation:datatable.header.2.1') }}
                  <Icon
                    name="help"
                    class="tooltip-evaluation-icon"
                    size="small"
                    wrapper
                  />
                </span>
              </template>
              <span>
                {{ $t('classroom.assessments.evaluation:datatable.header.tooltip.2.1') }}
              </span>
            </Tooltip>
          </th>
          <th
            v-if="computedVisibleColumns.date"
            class="th vacancies"
          >
            <Tooltip
              :uppercase="false"
              :width="230"
              medium-font
              dark
            >
              <template #activator="{ on }">
                <span v-on="on">
                  {{ $t('classroom.assessments.evaluation:datatable.header.11.1') }}
                  <Icon
                    name="help"
                    class="tooltip-evaluation-icon"
                    size="small"
                    wrapper
                  />
                </span>
              </template>

              <span>
                {{ $t('classroom.assessments.evaluation:datatable.header.tooltip.11.1') }}</span
              >
            </Tooltip>
          </th>
          <th
            v-if="computedVisibleColumns.mandatory"
            class="th"
          >
            {{ $t('classroom.assessments.evaluation:datatable.header.16') }}
          </th>
          <th
            v-if="computedVisibleColumns.attempts"
            class="th"
          >
            {{ $t('classroom.assessments.evaluation:datatable.header.6') }}
          </th>
          <th
            v-if="computedVisibleColumns.grade"
            class="th"
          >
            {{ $t('classroom.assessments.evaluation:datatable.header.7') }}
          </th>
          <th
            v-if="computedVisibleColumns['last-attempts']"
            class="th"
          >
            {{ $t('classroom.assessments.evaluation:datatable.header.9') }}
          </th>
          <th
            v-if="computedVisibleColumns.status"
            class="th"
          >
            {{ $t('global:status') }}
          </th>
          <th class="th">
            {{ $t('classroom.assessments.evaluation:datatable.header.17') }}
          </th>
        </tr>
        <tr
          v-if="$media.mobile"
          class="tr-colspan"
        >
          <td
            class="label-title"
            colspan="3"
          >
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
          :class="{
            'tr-body': !$media.mobile,
            'tr-mobile': $media.mobile,
          }"
        >
          <DataTableTd
            v-if="computedVisibleColumns.name"
            label="classroom.assessments.evaluation:datatable.header.1.1"
          >
            <NotificationCircle
              v-if="checkExistingNotification('examination_id', props.item.examination)"
              class="datatable__notification-circle"
            />
            <Tooltip
              :uppercase="false"
              :width="200"
              medium-font
              dark
            >
              <template #activator="{ on }">
                <span
                  class="clamp-line"
                  v-on="on"
                >
                  {{ props.item.evaluationName }}
                </span>
              </template>

              <span>{{ props.item.evaluationName }}</span>
            </Tooltip>
          </DataTableTd>

          <DataTableTd
            v-if="computedVisibleColumns.term"
            label="classroom.assessments.evaluation:datatable.header.2.1"
          >
            {{
              props.item.schedulePeriodStart
                ? $t('global:period:between', {
                    initial: formatDate(props.item.schedulePeriodStart, 'long'),
                    final: formatDate(props.item.schedulePeriodEnd, 'long'),
                  })
                : '-'
            }}
          </DataTableTd>

          <DataTableTd
            v-if="computedVisibleColumns.date"
            label="classroom.assessments.evaluation:datatable.header.11.1"
          >
            <div class="date-evaluation">
              <span>
                {{ props.item.startTime ? formatDate(props.item.startTime, 'long') : '-' }}
              </span>

              <span>
                {{ props.item.endTime ? formatDate(props.item.endTime, 'long') : '-' }}
              </span>
            </div>
          </DataTableTd>

          <DataTableTd
            v-if="computedVisibleColumns.mandatory"
            label="classroom.assessments.evaluation:datatable.header.16"
          >
            {{ props.item.mandatory ? $t('global:yes') : $t('global:no') }}
          </DataTableTd>
          <DataTableTd
            v-if="computedVisibleColumns.attempts"
            label="classroom.assessments.evaluation:datatable.header.6"
          >
            <span v-if="props.item.tries === 0"> - </span>
            <span
              v-else
              class="td-tag"
              v-html="getLabelAttemptOfTries(props.item.attempts, props.item.tries)"
            ></span>
          </DataTableTd>

          <DataTableTd
            v-if="computedVisibleColumns.grade"
            label="classroom.assessments.evaluation:datatable.header.8"
          >
            {{
              props.item.correctionTime
                ? getFormattedGrade(props.item.highestGradeDecimal, 'long')
                : '-'
            }}
          </DataTableTd>
          <DataTableTd
            v-if="computedVisibleColumns['last-attempts']"
            label="classroom.assessments.evaluation:datatable.header.9"
          >
            {{
              showHighestGradeCondition(props.item) && props.item.status !== 'pending'
                ? getFormattedGrade(props.item.lastGrade)
                : '-'
            }}
          </DataTableTd>
          <DataTableTd
            v-if="computedVisibleColumns.status"
            label="global:status"
          >
            <span :class="['td-tag', `status-${props.item.status}`]">
              {{ $t(`classroom.assessments.evaluation:status.${props.item.status}`) }}
            </span>
          </DataTableTd>

          <DataTableTd label="classroom.assessments.evaluation:datatable.header.17">
            <Dropdown
              class="cell__dropdown"
              icon="dots-vertical"
              right
            >
              <DropdownLink
                :text="
                  props.item.status === 'not_started' ? $t('global:start') : $t('global:access')
                "
                @click="openEvaluation(props.item)"
              />
              <DropdownLink
                v-if="showTryAgainButton(props.item)"
                :text="$t('classroom.assessments.evaluation:question.submit.again.student')"
                @click="openEvaluationStudent(props.item, true)"
              />
              <DropdownLink
                v-if="props.item.showHistoryTries && props.item.attempts > 0"
                :text="$t('classroom.assessments.evaluation:see.previous.answers')"
                @click="openModalAttempts(props.item)"
              />
            </Dropdown>
          </DataTableTd>
        </tr>
      </template>
    </Datatable>
  </div>
</template>

<style scoped lang="scss">
@import './StudentEvaluationList.scss';
</style>
