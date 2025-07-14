<script>
import {mapActions, mapState} from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalUnenrollStudent',
  components: {
    Action,
    Datatable,
    Icon,
    Modal
  },
  data () {
    return {
      title: '',
      description: '',
      currentOfferingEnrollment: ''
    }
  },
  props: {
    currentEnrollment: {
      type: Object,
      default: () => {
      }
    }
  },
  computed: {
    ...mapState(['accessibility'])
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptUnenrollment',
      'attemptEnrolledSessionsByOfferingRetrieval'
    ]),
    closeModalRemoveStudent () {
      this.$emit('close')
    },
    submitRemoveStudent () {
      this.setFetching(true)
      this.attemptUnenrollment(this.currentEnrollment.id).then(({data}) => {
        this.$emit('updateList')
        this.closeModalRemoveStudent()
        this.setFeedback({message: this.$t('community.sessions.modal:remove.student.confirm.sucess', {studentName: this.currentEnrollment.name})})
      }).catch(({response}) => {
        this.setFeedback({message: this.$t('community.sessions.modal:remove.student.confirm.error'), type: 'error'})
      }).finally(() => {
        this.setFetching(false)
      })
    },
    getStudentEnrollment () {
      this.setFetching(true)
      this.attemptEnrolledSessionsByOfferingRetrieval(this.currentEnrollment.id).then(({data}) => {
        this.currentOfferingEnrollment = data
        if (this.currentOfferingEnrollment !== '') {
          this.title = 'community.sessions.modal:remove.student.title.1'
          this.description = 'community.sessions.modal:remove.student.description.1'
        } else {
          this.title = 'community.sessions.modal:remove.student.title.2'
          this.description = 'community.sessions.modal:remove.student.description.2'
        }
      }).finally(() => {
        this.setFetching(false)
      })
    },

    getStatusLabel (item) {
      if (item.status) return this.$t(item.status)

      const statusAlias = item.statusAlias

      if (statusAlias === 'nao_iniciou') return this.$t('community.sessions.add:modal.student.status.notstarted')
      if (statusAlias === 'em_andamento') return this.$t('community.sessions.add:modal.student.status.inprogress')
      if (statusAlias === 'aprovado') return this.$t('community.sessions.add:modal.student.status.approved')
      if (statusAlias === 'reprovado') return this.$t('community.sessions.add:modal.student.status.disapproved')
      if (statusAlias === 'expirado') return this.$t('community.sessions.add:modal.student.status.expired')
      if (statusAlias === 'desistente') return this.$t('community.sessions.add:modal.student.status.quitter')
      if (statusAlias === 'realizado') return this.$t('global:solution.status.realizado')
    }
  },
  created () {
    this.getStudentEnrollment()
  }
}
</script>
<template>
  <modal :active="true" :cancel="false" is-page>
    <div class="modal-confirm">
      <div class="modal-confirm-content">
        <h3 class="modal-confirm-title">{{ $t(`${title}`) }}</h3>
        <div class="modal-confirm-description">
          <p
            v-html="$t(`${description}`, {
                offeringName: currentOfferingEnrollment !== '' ? currentOfferingEnrollment.offering.title : '',
                studentName: currentEnrollment != null   ? currentEnrollment.name : ''
              })"
          ></p>
        </div>
      </div>
      <datatable
        :items="currentOfferingEnrollment !== '' ? currentOfferingEnrollment.enrollments : [currentEnrollment]">
        <template slot="thead">
          <tr>
            <th class="th" v-if="currentOfferingEnrollment !== ''">{{ $t('community.sessions.modal:table.col.1') }}</th>
            <th class="th" v-else>{{ $t('community.sessions.modal:table.col.2') }}</th>
            <th class="th" style="text-align: center">{{ $t('community.sessions.modal:table.col.3') }}</th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr class="tr-colspan tbody-td">

            <td class="td flex pt-4 gap-2 align-items-center">
              <div class="datatable-image" v-if="currentOfferingEnrollment === ''">
                <img
                  v-if="props.item.image !== null"
                  :src="props.item.image"
                  class="w-2rem border-circle"
                />
                <Icon
                  v-else
                  class="text-3xl icon-fill-1"
                  name="account_circle"
                  pack="material"
                />
              </div>
              <span class="td-text bolder">{{ currentOfferingEnrollment !== '' ? props.item.courseName : props.item.name }}</span>
            </td>
            <td class="td" style="text-align: center">
              <span class="td-text">{{ currentOfferingEnrollment !== '' ? $t(`${props.item.enrollmentStatus}`) : getStatusLabel(props.item) }}</span>
            </td>
          </tr>
        </template>
      </datatable>
      <div class="modal-confirm-footer">
        <action :dark="accessibility" :text="$t('global:cancel')" @click="closeModalRemoveStudent()" class="btn-left"
                flat type="button"></action>
        <action :dark="accessibility" :text="$t('community.sessions.modal:btn.remove.student')"
                @click="submitRemoveStudent()" class="btn-right" flat type="button"></action>
      </div>
    </div>
  </modal>
</template>
