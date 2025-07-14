<template>
  <div class="main-content mediation-create">
    <MediationSmallHeader
      :title="Mediation.current.mediationPlan.name"
      :disable-save="$v.$invalid"
      confirm-modal
      :is-scheduled="isScheduled"
      @onSubmit="submitData"
    />
    <div class="mediation mediation__action">
      <div>
        <div class="mediation-data-header">
          <h2 class="mediation-data-title">{{ $t('global:form.step', { num: 3 }) }}</h2>
          <p
            class="mediation-data-description"
            v-html="$t('mediation.add:daily.actions.description', { day: $route.params.day })"
          ></p>
        </div>

        <Action
          v-if="!isScheduled"
          class="mb-2"
          flat
          icon="keyboard_backspace"
          type="button"
          :text="$t('mediation.actions:back.to.action')"
          @click="canWrite('mediation_plan') ? (leaveModal = true) : leave()"
        />

        <DailyActionItem
          v-for="(mediation, index) in mediations"
          :key="mediation.id"
          :mediation="mediation"
          :validation="$v.mediations.$each[index]"
          @remove="setDeleteConfirmModalState(true, { ...mediation, index })"
          @settings="$emit('settings', true)"
          @preview="handleNavigationPreview"
        />

        <div>
          <Action
            v-if="canWrite('mediation_plan')"
            flat
            type="button"
            :text="$t('mediation.mediation:btn.add')"
            @click="openAddActionModal"
          />
        </div>
      </div>
    </div>

    <MediationModalAddAction
      v-if="modalAddAction.active"
      :ref-date="$route.params.day"
      @close="closeAddActionModal"
      @submit="addActionCard"
      @settings="$emit('settings', true)"
    />

    <ModalConfirm
      :active="leaveModal"
      :title="$t('mediation.modal:confirm.back.actions')"
      @close="leaveModal = false"
      @confirm="leave()"
    >
      <p class="text-color">{{ $t('mediation.modal:confirm.description') }}</p>
    </ModalConfirm>

    <ModalConfirm
      :active="
        modalDeleteAction.active &&
        modalDeleteAction.item &&
        typeof modalDeleteAction.item.index === 'number'
      "
      :title="
        $t('mediation.actions:modal.remove.title:action', {
          action: getTransmissionTypeTranslation(modalDeleteAction.item.transmissionType),
        })
      "
      :confirm-btn-text="$t('mediation.actions:modal.remove:confirm_remove')"
      @close="setDeleteConfirmModalState(false)"
      @confirm="removeCard(modalDeleteAction.item.index)"
    >
      <p v-html="$t('mediation.actions:modal.remove.description:action')"></p>
    </ModalConfirm>
    <RouterView />
  </div>
</template>

<script>
import { getActionInfo } from '@/domains/mediation/utils'

import Action from '@/components/general/Action'
import ModalConfirm from '@/components/general/ModalConfirm'

import MediationSmallHeader from '../../components/MediationSmallHeader'
import MediationModalAddAction from '../../components/MediationModalAddAction'
import DailyActionItem from './components/DailyActionItem'

import mediationModalControl from '../../mixins/mediationModalControl'

import { mapState, mapActions } from 'vuex'

import { handleMediationData } from '../../utils'
import { ACTION_FORM_VALIDATION } from '../../shared'

export default {
  name: 'MediationDailyActions',
  components: {
    Action,
    DailyActionItem,
    MediationSmallHeader,
    MediationModalAddAction,
    ModalConfirm,
  },

  mixins: [mediationModalControl],

  data() {
    return {
      mediations: [],
      leaveModal: false,
    }
  },

  computed: {
    ...mapState(['Mediation']),

    isScheduled() {
      return !!this.$route.params.scheduled
    },
  },

  created() {
    this.refreshData()
  },

  methods: {
    ...mapActions([
      'attemptGetMediationConfigs',
      'attemptSetMediationConfigs',
      'attemptCreateMediationAction',
      'setFetching',
      'setFeedback',
    ]),

    refreshData() {
      this.setFetching(true)
      this.attemptGetMediationConfigs(this.$route.params)
        .then((mediations) => {
          this.mediations = handleMediationData(mediations.data)
          this.$v.$touch()
        })
        .catch(({ response }) => {
          if (response.data.message === 'mediation_plan_not_found') {
            this.setFeedback({ message: this.$t('mediation.actions:not.found') })
            this.$router.push({ name: 'mediation.list' })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    removeCard(index) {
      this.mediations.splice(index, 1)
      this.setDeleteConfirmModalState(false)
      this.submitData()
    },

    handleNavigationPreview(item) {
      this.$router.push({
        name: `${item.transmissionType}.preview.action`,
        params: {
          id: item.id,
          title: item.title,
          scheduled: this.isScheduled ? this.$route.params.scheduled : null,
        },
      })
    },

    /**
     * Get right translation based on mediation transmission type.
     * @param {String} transmissionType
     */
    getTransmissionTypeTranslation(transmissionType) {
      const selectedTranslation = getActionInfo(transmissionType)
      return selectedTranslation && selectedTranslation.text
    },

    addActionCard(action) {
      const mediationId = this.$route.params.id

      this.setFetching(true)
      this.attemptCreateMediationAction({ action, mediationId })
        .then(() => {
          this.refreshData()
          this.setFeedback({ message: this.$t('mediation.actions:create.action.success') })
        })
        .finally(() => this.setFetching(false))
    },

    leave() {
      this.$router.push({
        name: 'mediation.actions',
        params: {
          ...this.$route.params,
        },
      })
    },

    submitData() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        const planId = this.$route.params.id

        this.attemptSetMediationConfigs({
          data: {
            mediations: this.mediations,
            mediationPlanId: planId,
            daysSinceReferenceDate: this.$route.params.day,
          },
        })
          .then(() => {
            this.refreshData()
            this.setFeedback({ message: this.$t('mediation.actions:save.success') })
            this.checkStillHaveActions()
          })
          .catch(() => {
            this.setFeedback({ message: this.$t('mediation.actions:save.error'), type: 'error' })
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },

    /**
     * Check if the mediation has actions and redirect
     */
    checkStillHaveActions() {
      const hasMediationActions =
        this.mediations.filter((mediation) => {
          const numberReferenceDay =
            mediation.period === 'before'
              ? Math.abs(mediation.daysSinceReferenceDate) * -1
              : mediation.daysSinceReferenceDate

          return numberReferenceDay === this.$route.params.day
        }).length > 0

      if (!hasMediationActions) this.leave()
    },

    backScheduled() {
      this.$router.push({ name: this.$route.params.scheduled })
    },
  },

  validations: {
    mediations: {
      $each: ACTION_FORM_VALIDATION,
    },
  },
}
</script>

<style lang="scss">
@import '../../styles.scss';
@import './MediationDailyActions.scss';
</style>
