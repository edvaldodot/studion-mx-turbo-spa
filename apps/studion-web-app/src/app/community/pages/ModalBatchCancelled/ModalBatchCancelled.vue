<script>
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalBatchCancelled',
  components: {
    Action,
    Datatable,
    Modal
  },
  props: {
    activeBatchProgress: {
      required: true
    }
  },
  computed: {
    ...mapState(['accessibility', 'Sessions'])
  },
  methods: {
    backToListModal () {
      this.$emit('backToList')
    },
    downloadBatchSummary () {
      this.$emit('downloadBatchSummary')
    }
  }
}
</script>
<template>
  <modal :active="true" :cancel="false" is-page>
    <h2 class="modal-title text-color modal-batch-enroll-title">{{ $t('community.sessions:modal.batch.processing.completition.stopped.title') }}</h2>
    <span class="modal-batch-enroll-subtitle">{{ $t('community.sessions:modal.batch.processing.completition.stopped.subtitle') }}</span>
    <div class="modal-description text-color">
      <p v-html="$t('community.sessions:modal.batch.processing.completition.stopped.description')"></p>
      <action :dark="accessibility" :text="$t('community.sessions:modal.batch.processing.completition.download_sheet')"
              @click="downloadBatchSummary()" flatten type="button"></action>
    </div>
    <datatable :items="[activeBatchProgress]" dark>
      <template slot="thead">
        <tr>
          <th class="th text-center" width="25%">{{ $t('community.sessions.batch.completition:datatable.header.1') }}</th>
          <th class="th text-center" width="25%">{{ $t('community.sessions.batch.completition:datatable.header.2') }}</th>
          <th class="th text-center" width="25%">{{ $t('community.sessions.batch.completition:datatable.header.3') }}</th>
          <th class="th text-center" width="25%">{{ $t('community.sessions.batch.completition:datatable.header.4') }}</th>
        </tr>
      </template>
      <template slot="tbody" slot-scope="props">
        <tr class="tr-colspan">
          <td class="td text-center">
            <span class="td-text bolder">{{ props.item.enrollBatchAmountSent }}</span>
          </td>
          <td class="td text-center">
            <span class="td-text bolder">
              {{ Sessions.current.vacancy.max_vacancy || $t('global:form.unlimited')}}
            </span>
          </td>
          <td class="td text-center">
            <span class="td-text bolder" >{{ props.item.state.success }}</span>
          </td>
          <td class="td text-center">
            <span class="td-text bolder" >{{ props.item.state.error }}</span>
          </td>
        </tr>
      </template>
    </datatable>
    <div class="modal-spaced">
      <action :text="$t('global:back.sessions')" @click="backToListModal" class="btn-back center" icon="keyboard_backspace" icon-size="medium" type="button"></action>
    </div>
  </modal>
</template>
