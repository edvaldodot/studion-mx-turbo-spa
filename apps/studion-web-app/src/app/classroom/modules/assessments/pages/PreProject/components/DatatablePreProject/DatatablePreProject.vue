<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import EmptyMessage from '@/components/general/EmptyMessage'
import SlugTooltip from '@/components/general/SlugTooltip'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'DatatablePreProject',

  components: {
    Action,
    Datatable,
    DatatableCollapseRow,
    EmptyMessage,
    SlugTooltip,
    Dropdown,
    DropdownLink,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      itemsWithDropdown: [],
    }
  },

  watch: {
    items: {
      handler(newItems) {
        this.itemsWithDropdown = newItems.map((item) => {
          return Object.assign({}, item, { dropdown: true })
        })
      },
      immediate: true,
    },
  },

  methods: {
    getStudentsNameLabel(evaluations) {
      const names = evaluations.map(
        (evaluation) => evaluation.userData.studentName || evaluation.userData.name
      )
      const firstTwoNames = names.slice(0, 2).join(', ')
      const restCount = names.length - 2

      return restCount > 0 ? `${firstTwoNames} +${restCount}` : firstTwoNames
    },

    showHighestGradeCondition(item) {
      const { lastTryIsGrade, lastTryGrade, attempts, gradeFormat, highestGrade } = item

      const isHiddenGradeFormat = this.equalsProfile('student') && gradeFormat === 'hidden'

      return (
        !highestGrade ||
        isHiddenGradeFormat ||
        (lastTryIsGrade === null && attempts === null) ||
        (attempts === 1 && lastTryGrade === null)
      )
    },

    getFormattedGrade(grade) {
      return grade > 0 ? grade.replace('.', ',') : '0'
    },

    buttonLabel(status) {
      return this.$t(
        status === 'awaiting_correction' && !this.equalsProfile('student')
          ? 'classroom.assessments.evaluation:correct.last.attempt'
          : 'classroom.assessments.evaluation:see.last.attempt'
      )
    },

    activeAccessIfNotStarted(status) {
      return status !== 'not_started' || this.equalsProfile('student')
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('datatable-pre-project')"
    class="center datatable-with-collapse px-4"
  >
    <Datatable
      v-if="itemsWithDropdown.length"
      :items="itemsWithDropdown"
    >
      <template
        v-if="!$media.mobile"
        slot="thead"
      >
        <tr>
          <th class="th col-2 pl-1">
            <span class="clamp-line">
              {{ $t('classroom.assessments.evaluation:datatable.header.1') }}
            </span>
          </th>

          <th
            v-if="$isEnabledFeature('slug_identity')"
            class="th"
          >
            <span class="clamp-line">
              {{ $t('global:slug') }}
            </span>
          </th>

          <th class="th">
            <span class="clamp-line">
              {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
            </span>
          </th>

          <th class="th"></th>
          <th
            width="75"
            class="th"
          ></th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item }"
      >
        <tr
          class="tr-parent-dropdown"
          :class="{ 'is-open': item.dropdown }"
        >
          <td class="td pl-2">
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line bolder"
            >
              {{ $t('classroom.assessments.evaluation:datatable.header.1') }}
            </span>
            <span
              class="td-text clamp-line"
              :class="{ bolder: !$media.mobile }"
            >
              {{ item.preProject.enrollments[0].topicName }}
            </span>
          </td>

          <td
            v-if="$isEnabledFeature('slug_identity')"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line bolder"
            >
              {{ $t('global:slug') }}
            </span>

            <SlugTooltip :slug="item.preProject.enrollments[0].slug" />
          </td>

          <td class="td">
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line bolder"
            >
              {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
            </span>

            <span class="td-text clamp-line">{{
              getStudentsNameLabel(item.preProject.enrollments)
            }}</span>
          </td>

          <td class="td col-2">
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line bolder"
            >
            </span>
            <span
              v-if="!item.preProject.id"
              class="td-text clamp-line not-group"
            >
              <p class="not-group">
                {{ $t('classroom.assessments.evaluation:datatable.students.without.group') }}
              </p>
            </span>
          </td>

          <td class="td td-actions">
            <Action
              type="button"
              :icon="item.dropdown ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              class="btn-dropdown text-right"
              @click="item.dropdown = !item.dropdown"
            />
          </td>
        </tr>

        <DatatableCollapseRow
          v-if="item.dropdown"
          :colspan="6"
          :open="item.dropdown"
        >
          <Datatable
            v-if="item.preProject.enrollments"
            :items="item.preProject.enrollments"
            class="details"
          >
            <template slot="thead">
              <tr v-if="!$media.mobile">
                <th class="th col-3">
                  <span class="clamp-line">{{ $t('global:form.name') }}</span>
                </th>
                <th class="th col-2">
                  <span class="clamp-line">{{ $t('global:shipping') }}</span>
                </th>

                <th class="th">
                  <span
                    v-if="!$isEnabledFeature('examination_tool_feature')"
                    class="clamp-line"
                  >
                    {{ $t('classroom.assessments.evaluation:datatable.header.6') }}
                  </span>
                </th>

                <th class="th">
                  <span class="clamp-line">
                    {{
                      $t(
                        $isEnabledFeature('examination_tool_feature')
                          ? 'classroom.assessments.evaluation:datatable.header.7'
                          : 'classroom.assessments.evaluation:datatable.header.8'
                      )
                    }}
                  </span>
                </th>

                <th class="th col-2">
                  <span class="clamp-line">{{ $t('global:correction') }}</span>
                </th>

                <th class="th">
                  <span class="clamp-line">{{ $t('global:status') }}</span>
                </th>

                <th class="th"></th>
              </tr>
            </template>

            <template
              slot="tbody"
              slot-scope="innerProps"
            >
              <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
                <td class="td">
                  <span
                    v-if="$media.mobile"
                    class="td-text-header clamp-line bolder"
                  >
                    {{ $t('classroom.assessments.evaluation:datatable.header.5') }}
                  </span>
                  <span class="td-text clamp-line">
                    {{ innerProps.item.userData.studentName || innerProps.item.userData.name }}
                  </span>
                </td>

                <td class="td">
                  <span
                    v-if="$media.mobile"
                    class="td-text-header clamp-line bolder"
                  >
                    {{ $t('global:shipping') }}
                  </span>
                  <span class="td-text clamp-line">
                    {{
                      innerProps.item.endTime ? formatDate(innerProps.item.endTime, 'long') : '-'
                    }}
                  </span>
                </td>

                <td class="td">
                  <span
                    v-if="$media.mobile && !$isEnabledFeature('examination_tool_feature')"
                    class="td-text-header clamp-line bolder"
                  >
                    {{ $t('classroom.assessments.evaluation:datatable.header.6') }}
                  </span>

                  <span
                    v-if="innerProps.item.tries && !$isEnabledFeature('examination_tool_feature')"
                    class="td-tag"
                    v-html="
                      $t('classroom.assessments.evaluation:attempts', {
                        num1: innerProps.item.attempts > 0 ? innerProps.item.attempts : 0,
                        num2: innerProps.item.tries,
                      })
                    "
                  ></span>

                  <span
                    v-if="!innerProps.item.tries && !$isEnabledFeature('examination_tool_feature')"
                    class="td-tag clamp-line"
                  >
                    {{ innerProps.item.attempts }}
                  </span>
                </td>

                <td class="td">
                  <span
                    v-if="$media.mobile"
                    class="td-text-header clamp-line bolder"
                  >
                    {{
                      $t(
                        $isEnabledFeature('examination_tool_feature')
                          ? 'classroom.assessments.evaluation:datatable.header.7'
                          : 'classroom.assessments.evaluation:datatable.header.8'
                      )
                    }}
                  </span>

                  <span class="td-text clamp-line">{{
                    showHighestGradeCondition(innerProps.item)
                      ? '-'
                      : getFormattedGrade(innerProps.item.highestGrade)
                  }}</span>
                </td>

                <td class="td">
                  <span
                    v-if="$media.mobile"
                    class="td-text-header clamp-line bolder"
                  >
                    {{ $t('global:correction') }}
                  </span>
                  <span class="td-text clamp-line">
                    {{
                      innerProps.item.correctionTime
                        ? formatDate(innerProps.item.correctionTime, 'long')
                        : '-'
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
                    v-if="innerProps.item.gradeFormat === 'hidden' && equalsProfile('student')"
                    class="td-text column-td bolder"
                  >
                    {{ $t('classroom.assessments.evaluation:status.resolved') }}
                  </span>

                  <span
                    v-else
                    class="td-text"
                  >
                    {{ $t(`classroom.assessments.evaluation:status.${innerProps.item.status}`) }}
                  </span>
                </td>

                <td class="td td-actions">
                  <Dropdown
                    v-if="
                      Number(innerProps.item.lastTryId) &&
                      !$isEnabledFeature('examination_tool_feature')
                    "
                    icon="dots-vertical"
                  >
                    <DropdownLink
                      :text="buttonLabel(innerProps.item.status)"
                      @click="$emit('view:attempt', innerProps.item, item.preProject.sessionsUuid)"
                    />
                  </Dropdown>
                  <div
                    v-if="
                      $isEnabledFeature('examination_tool_feature') &&
                      activeAccessIfNotStarted(innerProps.item.status)
                    "
                  >
                    <Action
                      :data-testid="$testId('action-button--submit')"
                      :text="$t('classroom.assessments.evaluation:datatable.header.15')"
                      type="button"
                      small
                      flat
                      @click="$emit('view:attempt', innerProps.item, item.preProject.sessionsUuid)"
                    />
                  </div>
                </td>
              </tr>
            </template>
          </Datatable>
        </DatatableCollapseRow>
      </template>
    </Datatable>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>
  </div>
</template>

<style lang="scss">
@import './DatatablePreProject.scss';
</style>
