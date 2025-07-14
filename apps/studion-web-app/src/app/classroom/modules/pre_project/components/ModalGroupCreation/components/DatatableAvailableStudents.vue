<script>
import { defineComponent } from 'vue'

import Datatable from '@/components/general/Datatable'
import StudentInfo from './StudentInfo.vue'

export default defineComponent({
  name: 'DatatableAvailableStudents',

  components: {
    Datatable,
    StudentInfo,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },

    reachedLimit: {
      type: Boolean,
      default: false,
    },
    datatableHeader: {
      type: String,
      default() {
        return this.$t('pre.project.panel.group:modal.create.group:table.students:1')
      },
    },
  },
})
</script>

<template>
  <Datatable :items="items">
    <template slot="thead">
      <tr>
        <th class="th">{{ datatableHeader }}</th>
      </tr>
    </template>

    <template
      slot="tbody"
      slot-scope="{ item }"
    >
      <tr>
        <td class="td">
          <StudentInfo
            :name="item.name"
            :photo="item.image"
            :selected="item.selected"
            :disabled="reachedLimit && !item.selected"
            @student:toggle="$emit('student:toggle', item, $event.checked)"
          />
        </td>
      </tr>
    </template>
  </Datatable>
</template>
