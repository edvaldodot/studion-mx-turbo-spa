<script>
import { defineComponent } from 'vue'

import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'
import Loading from '@/components/general/Loading'

export default defineComponent({
  name: 'GroupEnrollmentsCollapseData',
  components: {
    Datatable,
    Icon,
    Loading,
  },
  props: {
    enrollments: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    enrollmentStatusItem(status) {
      switch (status) {
        case 'error':
          return 'close'
        case 'already_enrolled':
        case 'success':
          return 'check-all'
      }
    },
  },
})
</script>

<template>
  <div class="group-enrollment-collapse-data">
    <div class="enrollment-infos">
      <Datatable
        v-if="enrollments.length"
        :items="enrollments"
        dark
      >
        <template slot="thead">
          <tr>
            <th class="th" width="40%">{{ $t('community.sessions.modal:table.col.2') }}</th>
            <th class="th" width="40%">{{ $t('global:form.username') }}</th>
            <th class="th text-center" width="20%">{{ $t('community.index:modal.datatable.header.4') }}</th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr>
            <td class="td bb">
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
            <td class="td bb">
              <span class="td-text">{{ props.item.username }}</span>
            </td>
            <td class="td bb text-center">
              <span
                :class="[
                  'td-tag td-tag-fixed',
                  {
                    'is-ok': props.item.status === 'success' || props.item.status === 'already_enrolled',
                    'has-error': props.item.status === 'error',
                  },
                ]"
              >
                {{ $t(`session.groups:student.enrollment.status:${props.item.status}`) }}
                <Loading v-if="props.item.status === 'pending'" />
                <Icon
                  v-else
                  :name="enrollmentStatusItem(props.item.status)"
                  wrapper
                  size="medium"
                />
              </span>
            </td>
          </tr>
        </template>
      </Datatable>
    </div>
  </div>
</template>
<style lang="scss">
.group-enrollment-collapse-data {
  padding: 20px 0;
  .datatable-wrapper {
    width: 100%;
    padding: 0 24px 40px;
    .td-tag {
      text-transform: capitalize;
    }
    .datatable-inner .datatable tr:last-of-type .td {
      &.bb {
        border-bottom: 2px solid var(--primary-500er);
      }
    }
  }
}
</style>
