<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import ModalStatusTimelineNavMixin from './ModalStatusTimelineNavMixin'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'

export default defineComponent({
  name: 'ModalStatusTimeline',

  components: {
    Action,
    Datatable,
    EmptyMessage,
    Modal,
    ModalHeader,
  },

  mixins: [ModalStatusTimelineNavMixin],

  props: {
    name: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      tableData: [],
      pageReady: false,
    }
  },

  computed: {
    enrollmentId() {
      return this.$route.params.enrollmentId
    },
  },

  created() {
    this.setFetching(true)
    this.attemptGetEnrollmentLogs(this.enrollmentId)
      .then(({ data }) => {
        this.tableData = data.data
        this.pageReady = true
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions(['setFetching', 'attemptGetEnrollmentLogs']),

    getStatus(status) {
      const normalizedStatus = status
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')

      return this.$t(`global:solution.status.${normalizedStatus}`)
    },
  },
})
</script>

<template>
  <Modal
    class="modal-status-timeline"
    active
    is-page
    back
    @close="goBack()"
  >
    <ModalHeader
      :sub-title="$t('global:status.history')"
      :title="name"
      :description="$t('community.sessions.modal:status.timeline.description')"
      class="modal-status-timeline__header"
    />

    <Action
      v-if="
        canRead('sessions:enrollment_status_change') &&
        canWrite('sessions:enrollment_status_change')
      "
      :text="$t('global:status.change')"
      type="button"
      class="my-4"
      fixed-width
      primary
      large
      @click="changeStatus"
    />

    <Datatable
      v-if="tableData"
      :items="tableData"
    >
      <template slot="thead">
        <tr>
          <th class="th">
            {{ $t('global:status.old') }}
          </th>
          <th class="th">
            {{ $t('global:status.changed') }}
          </th>
          <th class="th">
            {{ $t('global:reason') }}
          </th>
          <th class="th">
            {{ $t('global:date.changed') }}
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item }"
      >
        <tr>
          <td class="td">
            <span class="td-text"> {{ getStatus(item.statusFrom) }} </span>
          </td>
          <td class="td">
            <span class="td-text"> {{ getStatus(item.statusTo) }} </span>
          </td>
          <td class="td">
            <span class="td-text"> {{ item.reasonStatusChangeName }} </span>
          </td>
          <td class="td">
            <span class="td-text"> {{ formatDate(item.statusInsertAt, 'long') }} </span>
          </td>
        </tr>
      </template>
    </Datatable>

    <EmptyMessage
      v-if="pageReady && !tableData.length"
      :title="$t('global:search.empty.title')"
    />
  </Modal>
</template>
