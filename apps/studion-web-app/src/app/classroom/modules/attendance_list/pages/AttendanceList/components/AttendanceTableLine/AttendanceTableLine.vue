<script>
import { defineComponent } from 'vue'

import TableDivCol from '@/components/general/TableDivCol'
import TableDivLine from '@/components/general/TableDivLine'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Action from '@/components/general/Action'

export default defineComponent({
  name: 'AttendanceTableLine',

  components: {
    Action,
    TableDivCol,
    TableDivLine,
    Dropdown,
    DropdownLink,
  },

  props: {
    item: {
      type: Object,
      required: true,
    },
    showDate: {
      type: Boolean,
      default: false,
    },
    showHour: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <TableDivLine
    :data-testid="$testId('attendance--table-div-line')"
    :break-on-mobile="$media.mobile"
  >
    <TableDivCol
      :label="$t('global:form.date')"
      :enable-label="showDate && $media.mobile"
      min-width="100px"
      p-size
    >
      {{ showDate ? formatDate(item.attendance_list_start_date) : '' }}
    </TableDivCol>

    <TableDivCol
      :label="$t('global:hour')"
      :enable-label="showDate && $media.mobile"
      min-width="120px"
      p-size
    >
      {{
        showHour
          ? `${formatDate(item.attendance_list_start_date, 'shortTime')} - ${formatDate(
              item.attendance_list_end_date,
              'shortTime'
            )}`
          : ''
      }}
    </TableDivCol>

    <TableDivCol
      :label="$t('classroom.attendance.list:name')"
      :enable-label="$media.mobile"
      max-width="500px"
      width="100%"
      p-size
      bolder
    >
      {{ item.title }}
    </TableDivCol>

    <TableDivCol
      :label="$t('global:modality')"
      :enable-label="$media.mobile"
      min-width="100px"
      p-size
    >
      {{ item.modality }}
    </TableDivCol>

    <TableDivCol
      :mobile-options="$media.mobile"
      min-width="130px"
      align-right
      fill
    >
      <Action
        type="button"
        :text="$t('global:assess')"
        flat
        @click="$emit('open-attendance-list-modal')"
      />

      <Dropdown
        icon="dots-vertical"
        right
      >
        <Dropdown-link
          :text="$t('global:edit')"
          @click="$emit('open-edit-modal')"
        />
        <Dropdown-link
          :text="$t('global:download')"
          @click="$emit('download-attendance-list')"
        />
        <Dropdown-link
          v-if="!item.updated"
          :text="$t('global:remove')"
          @click="$emit('open-confirm-modal-remove')"
        />
      </Dropdown>
    </TableDivCol>
  </TableDivLine>
</template>
