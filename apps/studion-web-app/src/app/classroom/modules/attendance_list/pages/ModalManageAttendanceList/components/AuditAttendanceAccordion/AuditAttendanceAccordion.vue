<script>
import { defineComponent } from 'vue'

import TableDiv from '@/components/general/TableDiv'
import TableDivCol from '@/components/general/TableDivCol'
import TableDivLine from '@/components/general/TableDivLine'
import Accordion from '@/components/general/Accordion'
import AccordionItem from '@/components/general/AccordionItem'

export default defineComponent({
  name: 'AuditAttendanceAccordion',

  components: {
    TableDiv,
    TableDivCol,
    TableDivLine,
    Accordion,
    AccordionItem,
  },

  props: {
    auditList: {
      type: Array,
      default: () => [],
    },
    showDate: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <Accordion
    :data-testid="$testId('audit-attendance-accordion')"
    card
    dark
  >
    <AccordionItem
      :title="$t('global:editions.before')"
      dark
    >
      <template slot="content">
        <TableDiv dark>
          <template #body>
            <TableDivLine
              v-for="audit in auditList"
              :key="audit.id"
              :data-testid="$testId('audit-attendance-accordion')"
              :break-on-mobile="$media.mobile"
            >
              <TableDivCol
                :label="$t('global:form.date')"
                :enable-label="$media.mobile"
                min-width="100px"
                p-size
              >
                {{ formatDate(audit.auditInsert.dh) }}
              </TableDivCol>

              <TableDivCol
                max-width="500px"
                width="100%"
                p-size
                bolder
              >
                {{ audit.auditInsert.user.name }}
              </TableDivCol>
            </TableDivLine>
          </template>
        </TableDiv>
      </template>
    </AccordionItem>
  </Accordion>
</template>
