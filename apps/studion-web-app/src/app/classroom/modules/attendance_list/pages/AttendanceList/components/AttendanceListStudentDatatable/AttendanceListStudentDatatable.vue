<script>
import { defineComponent } from 'vue'

import Datatable from '@/components/general/Datatable'

export default defineComponent({
  name: 'AttendanceListStudentDatatable',

  components: {
    Datatable,
  },

  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    getStatus(status) {
      if (status === null) return '-'

      if (status) return this.$t('classroom.attendance.students:present')
      return this.$t('classroom.attendance.students:not.present')
    },
  },
})
</script>

<template>
  <Datatable :items="data">
    <template slot="thead">
      <tr>
        <th class="th">
          {{ $t('classroom.attendance.list:name') }}
        </th>
        <th class="th">
          {{ $t('global:form.description') }}
        </th>
        <th class="th">
          {{ $t('global:modality') }}
        </th>
        <th class="th">
          {{ $t('global:metadata.type.datetime') }}
        </th>
        <th class="th">
          {{ $t('community.index:modal.tab.link.responsible') }}
        </th>
        <th class="th">
          {{ $t('global:status') }}
        </th>
      </tr>
    </template>

    <template
      slot="tbody"
      slot-scope="props"
    >
      <tr class="tr-body">
        <td class="td">
          <span class="td-text">{{ props.item.attendanceTitle }}</span>
        </td>
        <td class="td">
          <span class="td-text">{{ $clearHTMLTags(props.item.attendanceDescription) }}</span>
        </td>
        <td class="td">
          <span class="td-text">{{ $t(`solutions.type:${props.item.attendanceModality}`) }}</span>
        </td>
        <td class="td">
          <span class="td-text">{{
            formatDate(props.item.attendanceListVerificationDate, 'long')
          }}</span>
        </td>
        <td class="td">
          <span class="td-text">{{ props.item.attendanceListVerifier }}</span>
        </td>
        <td class="td">
          <span class="td-text">{{ getStatus(props.item.attendanceListPresent) }}</span>
        </td>
      </tr>
    </template>
  </Datatable>
</template>
