<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'

export default defineComponent({
  name: 'DatatablePreProjectStudent',

  components: {
    Action,
    Datatable,
    EmptyMessage,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    buttonLabel(status) {
      return this.$t(
        status === 'awaiting_correction' && !this.equalsProfile('student')
          ? 'classroom.assessments.evaluation:correct.last.attempt'
          : 'classroom.assessments.evaluation:see.last.attempt'
      )
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
      v-if="items.length > 0"
      :items="items"
    >
      <template slot="thead">
        <tr>
          <th class="th col-4 pl-1">
            <span class="clamp-line">
              {{ $t('classroom.assessments.project:datatable.header.1') }}
            </span>
          </th>

          <th class="th col-4">
            <span class="clamp-line">{{
              $t('classroom.assessments.project:datatable.header.2')
            }}</span>
          </th>

          <th class="th col-5">
            <span class="clamp-line">{{ $t('global:status') }}</span>
          </th>

          <th class="th"></th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item }"
      >
        <tr class="tr-parent-dropdown">
          <td class="td pl-2">
            <span
              class="td-text clamp-line"
              :class="{ bolder: !$media.mobile }"
            >
              {{ item.topicName }}
            </span>
          </td>

          <td class="td">
            <div class="project-data-table-student-wrapper">
              <span class="td-text clamp-line text-color">
                {{ $t(`classroom.assessments.evaluation:datatable.status.open`) }}:
                <strong>{{
                  item.schedulePeriodStart ? formatDate(item.schedulePeriodStart, 'long') : '-'
                }}</strong>
              </span>
              <span class="td-text clamp-line text-color">
                {{ $t(`classroom.assessments.evaluation:datatable.status.close`) }}:
                <strong>
                  {{ item.schedulePeriodEnd ? formatDate(item.schedulePeriodEnd, 'long') : '-' }}
                </strong>
              </span>
            </div>
          </td>

          <td class="td">
            <div class="project-data-table-student-wrapper">
              <span class="td-text project-data-table-background-status font-bold">
                {{ $t(`classroom.assessments.evaluation:status.${item.status}`) }}
              </span>
              <span class="td-text clamp-line text-sm text-color">
                {{ $t(`classroom.assessments.evaluation:datatable.status.started`) }}:
                <strong>
                  {{ item.startTime ? formatDate(item.startTime, 'long') : '-' }}
                </strong>
              </span>
              <span class="td-text clamp-line text-sm text-color">
                {{ $t('classroom.assessments.evaluation:datatable.status.send') }}:
                <strong>
                  {{ item.endTime ? formatDate(item.endTime, 'long') : '-' }}
                </strong>
              </span>
            </div>
          </td>

          <td class="td td-actions">
            <Action
              :data-testid="$testId('action-button--submit')"
              :disabled="item.buttonDisabled"
              :text="item.status === 'not_started' ? $t('global:start') : $t('global:access')"
              type="button"
              small
              flat
              @click="$emit('view:attempt', item)"
            />
          </td>
        </tr>
      </template>
    </Datatable>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>
  </div>
</template>

<style lang="scss">
@import './DatatableProjectStudent.scss';
</style>
