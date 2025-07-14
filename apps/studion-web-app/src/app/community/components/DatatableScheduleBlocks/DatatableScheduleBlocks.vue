<template>
  <div class="schedule-block__table" :class="{'--mobile': $media.mobile}" v-show="items.length">
    <span class="schedule-block__title text-color">{{ title }}</span>
    <datatable class="w-full" dark :items="sortedItems">
      <template slot="thead" v-if="!$media.mobile">
        <tr class="text-color">
          <th class="th">{{$t('schedule.block:datatable.header.1')}}</th>
          <th class="th">{{$t('schedule.block:datatable.header.2')}}</th>
          <th class="th">{{$t('schedule.block:datatable.header.3')}}</th>
          <th class="th">{{$t('schedule.block:datatable.header.4')}}</th>
          <th></th>
        </tr>
      </template>
      <template slot="tbody" slot-scope="props">
        <tr class="text-color">
          <td class="start-column">
            <div v-if="$media.mobile">{{$t('schedule.block:datatable.header.1')}}</div>
            <span>{{ formatDate(props.item.startDateAt) }}</span>
          </td>
          <td class="hour-column">
            <div v-if="$media.mobile">{{$t('schedule.block:datatable.header.2')}}</div>
            <div class="period">
              <span>{{ getFormatedTime(props.item.startDateAt) }}</span>
              <span>{{ getFormatedTime(props.item.endDateAt) }}</span>
            </div>
          </td>
          <td class="repeat-column">
            <div v-if="$media.mobile">{{$t('schedule.block:datatable.header.3')}}</div>
            <div>{{ getFrequencyText(props.item) }}</div>
            <div>{{ getByDayText(props.item) }}</div>
          </td>
          <td class="repeat-end-column">
            <div v-if="$media.mobile">{{$t('schedule.block:datatable.header.4')}}</div>
            <span>{{ getRepeatEndsAtText(props.item) }}</span>
          </td>
          <td class="remove-column">
            <action icon="close" type="button" @click="$emit('remove', props.index)" />
          </td>
        </tr>
      </template>
    </datatable>
  </div>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import { format } from 'date-fns'

import Datatable from '@/components/general/Datatable'
import Action from '@/components/general/Action'

import { weekDaysSort } from './utils'
import { scheduleBlocksSort } from '@/support/utils/scheduleBlock'

export default {
  components: {
    Datatable,
    Action
  },
  props: {
    title: {
      type: String,
      default: () => '',
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      frequencyDict: {
        daily: 'day',
        weekly: 'week',
        monthly: 'month',
        yearly: 'year'
      }
    }
  },
  computed: {
    sortedItems () {
      const items = cloneDeep(this.items)
      return items.sort(scheduleBlocksSort)
    }
  },
  methods: {
    getFormatedTime (dateString) {
      return format(new Date(dateString), 'HH:mm')
    },
    getFrequencyText (item) {
      if (!item.frequency) return '-'
      if (item.frequency === 'daily' && item.interval === 1) return this.$t('schedule.block:datatable.every.day')
      const type = this.$tc(`global:${this.frequencyDict[item.frequency]}.plural`, item.interval)
      return this.$t('community.sessions.modal:schedule.block.table.frequency', {number: item.interval, type})
    },
    getByDayText (item) {
      if (!item.byDay || item.byDay.length === 0) return ''

      return [...item.byDay].sort(weekDaysSort).map(day => this.$t(`global:abbreviation.${day.toLowerCase()}`)).join(', ')
    },
    getRepeatEndsAtText (item) {
      if (!item.frequency) return '-'

      if (!item.repeatEndsAt) return this.$t('date.frequency.field:finishing.class')

      return this.formatDate(item.repeatEndsAt)
    }
  }
}
</script>
<style lang="scss">
  @import 'DatatableScheduleBlock.scss';
</style>
