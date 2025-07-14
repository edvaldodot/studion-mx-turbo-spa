<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'

export default defineComponent({
  name: 'DatatablePreProject',

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
})
</script>

<template>
  <div
    :data-testid="$testId('datatable-pre-project')"
    class="center datatable-with-collapse px-4"
  >
    <Datatable
      v-if="items"
      :items="items"
    >
      <template slot="thead">
        <tr>
          <th class="th col-4 pl-1">
            <span class="clamp-line">
              {{ $t('classroom.assessments.project:datatable.header.1') }}
            </span>
          </th>

          <th
            v-if="$isEnabledFeature('slug_identity')"
            class="th col-1"
          >
            <span class="clamp-line">{{ $t('global:slug') }}</span>
          </th>

          <th class="th col-5">
            <span class="clamp-line">{{
              $t('classroom.assessments.project:datatable.header.2')
            }}</span>
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
              {{ item.title }}
            </span>
          </td>

          <td
            v-if="$isEnabledFeature('slug_identity')"
            class="td"
          >
            <div class="project-data-table-wrapper">
              <span class="td-text text-color">
                {{ item.slug ? item.slug : '-' }}
              </span>
            </div>
          </td>

          <td class="td">
            <div
              v-if="item.schedulePeriodStart && item.schedulePeriodEnd"
              class="project-data-table-wrapper"
            >
              <span class="td-text text-color">
                {{ $t(`classroom.assessments.evaluation:datatable.status.open`) }}:
                <strong>{{ formatDate(item.schedulePeriodStart, 'long') }}</strong>
              </span>
              <span class="td-text text-color">
                {{ $t(`classroom.assessments.evaluation:datatable.status.close`) }}:
                <strong> {{ formatDate(item.schedulePeriodEnd, 'long') }} </strong>
              </span>
            </div>
            <div v-else>
              <span class="td-text text-color">-</span>
            </div>
          </td>

          <td class="td td-actions">
            <Action
              :data-testid="$testId('action-button--submit')"
              :text="$t('global:access')"
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
@import './DatatableProject.scss';
</style>
