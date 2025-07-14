<template>
  <Datatable class="enrollments-datatable" :items="enrollmentsList">
    <template slot="thead">
      <tr>
        <th class="th" width="25%">{{ $t('global:form.date') }}</th>

        <th class="th" width="25%">{{ $t('global:status')}}</th>

        <th class="th" width="50%">{{ $tc('global:certificate', 1) }}</th>
      </tr>
    </template>

    <template slot="tbody" slot-scope="props">
      <tr>
        <td class="td bolder">
          <p class="text-color text-base">{{ formatDate(props.item.statusUpdatedAt) }}</p>
        </td>

        <td class="td bolder">
          <p class="text-color text-base">{{ $t(`global:solution.status.${props.item.statusAlias}`) }}</p>
        </td>

        <td class="td td-actions action-buttons bolder">
          <Action
            v-if="props.item.certificateHash"
            :text="$t('global:download.certificate')"
            @click.stop="downloadCertificate(props.item.certificateHash)"
            type="button"
            class="session-card-content__action-certificate"
            flat
            dark
          />

          <span v-else>-</span>
        </td>
      </tr>
    </template>
  </Datatable>
</template>

<script>

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'

export default {
  name: 'EnrollmentsDatatable',

  components: {
    Action,
    Datatable
  },

  props: {
    enrollmentsList: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    downloadCertificate (hash) {
      this.$emit('downloadCertificate', hash)
    }
  }
}
</script>

<style lang="scss">
  @import "EnrollmentsDatatable.scss";
</style>
