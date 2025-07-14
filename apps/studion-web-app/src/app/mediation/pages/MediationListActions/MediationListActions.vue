<template>
  <div class="main-content  mediation-list-actions">
    <mediation-small-header
      :title="Mediation.current.mediationPlan.name"
      disable-save
    />
    <div class=" mediation">
      <div class="center mt-4">
        <div class="mediation-data-header">
          <h2 class="mediation-data-title">
            {{ $t("global:form.step", { num: 3 }) }}
          </h2>
          <p class="mediation-data-description">
            {{ $tc('mediation.add:list.actions.view.description', actionDays.length + 1) }}
          </p>
          <p
            class="mediation-data-tip"
            v-html="
              $t(
                `${
                  actionDays.length
                    ? 'mediation.add:list.actions.view.tip.hasActions'
                    : 'mediation.add:list.actions.view.tip'
                }`
              )
            "
          ></p>
        </div>
        <div class="py-4">
          <filter-group-actions
            :initial-view-state="filters.view"
            :profile-options="getProfilesSet"
            :actions-options="getActionsSet"
            :has-filter-active="hasActiveCustomFilter"
            @add="openAddActionModal"
            @batch="$router.push({ name: 'mediation.batch.list.add' })"
            @batch-list="$router.push({ name: 'mediation.batch.list' })"
            @update-filter-profile="(value) => (filters.profile = value)"
            @update-order="(value) => (filters.order = value)"
            @update-tag-filters="(value) => (filters.tag = value)"
            @filter-view="(value) => (filters.view = value)"
          />
        </div>
        <div>
          <data-table-actions
            v-if="actionDays.length"
            :items="actionDays"
            @go-to="(item) => goToPage('mediation.actions.day', item)"
            @delete-action="(item) => setDeleteConfirmModalState(true, item)"
          />
          <empty-message v-else>
            <template v-if="hasActiveCustomFilter">
              <h2>{{ $t('global:search.empty.title') }}</h2>
            </template>

            <template v-else>
              <h2>{{ $t('mediation:action:empty.title') }}</h2>
              <p class="text-color">{{ $t('mediation:action:empty.message') }}</p>
            </template>
          </empty-message>
        </div>

        <div class="py-4">
          <Pagination
            :active-first-last="false"
            :active-page="3"
            :page-count="3"
            float
            disable-items-per-page
            disable-manual-page
            block-layout
            show-all-pages
            custom-next
            :custom-next-text="$t('global:finish')"
            @next-page="goToPage('mediation.list')"
            @previous-page="goToPage(2)"
            @go-to-page="goToPage($event)"
          />
        </div>
      </div>
    </div>

    <mediation-modal-add-action
      v-if="modalAddAction.active"
      @close="closeAddActionModal"
      @submit="addActionCard"
      @settings="$emit('settings', true)"
    />

    <modal-confirm
      :active="
        modalDeleteAction.active &&
        modalDeleteAction.item &&
        typeof modalDeleteAction.item.day === 'number'
      "
      :title="
        $t('mediation.actions:modal.remove.title:day', {
          day: modalDeleteAction.item.day,
        })
      "
      :confirm-btn-text="$t('mediation.actions:modal.remove:confirm_remove')"
      @close="setDeleteConfirmModalState(false)"
      @confirm="removeActions(modalDeleteAction.item)"
    >
      <p
        v-html="
          $t('mediation.actions:modal.remove.description:day', { day: modalDeleteAction.item.day })
        "
      ></p>
    </modal-confirm>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'

import EmptyMessage from '@/components/general/EmptyMessage'
import ModalConfirm from '@/components/general/ModalConfirm'
import Pagination from '@/components/general/Pagination'

import DataTableActions from './components/DataTableActions'
import FilterGroupActions from './components/FilterGroupActions'
import MediationSmallHeader from '../../components/MediationSmallHeader'
import MediationModalAddAction from '../../components/MediationModalAddAction'

import mediationModalControl from '../../mixins/mediationModalControl'

import pageMixin from '../../mixins/pageMixin'

export default {
  name: 'MediationListActions',

  components: {
    DataTableActions,
    FilterGroupActions,
    EmptyMessage,
    MediationSmallHeader,
    MediationModalAddAction,
    ModalConfirm,
    Pagination,
  },

  mixins: [mediationModalControl, pageMixin],

  props: {
    openSettings: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      filters: {
        order: {},
        profile: [],
        tag: [],
        view: false,
      },
    }
  },

  computed: {
    ...mapState(['Mediation']),

    ...mapGetters(['getInitialDayAction', 'getFinalDayAction', 'getProfilesSet', 'getActionsSet']),

    hasActiveCustomFilter() {
      const hasSelectedProfile = this.filters.profile.length
      const hasSelectedTag = this.filters.tag.length

      return Boolean(hasSelectedProfile || hasSelectedTag)
    },

    /**
     * Get action days based on filters.
     * @returns {object[]}
     */
    actionDays() {
      let actions = this.deepClone(this.Mediation.actions || [])

      if (!this.filters.view) {
        actions = this.getDaysOnRange(actions)
      }

      if (this.filters.order && this.filters.order.type) {
        actions = this.orderDays(actions)
      }

      if (this.filters.profile && this.filters.profile.length) {
        actions = this.filterProfiles(actions)
      }

      if (this.filters.tag && this.filters.tag.length) {
        actions = this.filterAction(actions)
      }

      return actions
    },
  },

  watch: {
    hasActiveCustomFilter: {
      immediate: true,
      handler(value) {
        this.filters.view = value
      },
    },
  },

  created() {
    if (this.openSettings) this.$emit('settings', true)

    this.setFetching(true)
    this.attemptGetMediationActions(this.$route.params.id)
      .catch(() => {
        this.setFeedback({
          message: this.$t('mediation.actions:setup.filter.error'),
          type: 'error',
        })
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'attemptMediationActionSetup',
      'attemptGetMediationActions',
      'attemptCreateMediationAction',
      'attemptSetMediationConfigs',
      'setFetching',
      'setFeedback',
    ]),

    /**
     * Get filtered actions based on selected action on filter.
     * @param {object[]} actions
     * @returns {object[]}
     */
    filterAction(actions) {
      let tempAction = actions.filter((action) => {
        return action.actions.list.find((action) =>
          this.filters.tag.find((tag) => tag.value === action)
        )
      })

      return tempAction.map((action) => {
        action.profiles.items = action.profiles.items.filter((item) => {
          return this.filters.tag.find((tag) => tag.value === item.transmission)
        })

        return action
      })
    },

    /**
     * Get filtered actions based on selected profile on filter.
     * @param {object[]} actions
     * @returns {object[]}
     */
    filterProfiles(actions) {
      let tempAction = actions.filter((action) => {
        return action.profiles.list.find((profile) => this.filters.profile.includes(profile))
      })

      return tempAction.map((action) => {
        action.profiles.items = action.profiles.items.filter((item) =>
          this.filters.profile.includes(item.profile)
        )
        return action
      })
    },

    /**
     * Order action day given order type asc/desc.
     * @param {object[]} actions
     * @returns {object[]}
     */
    orderDays(actions) {
      const tempActions = [...actions]

      if (this.filters.order.type === 'desc') {
        tempActions.sort((a, b) => b.day - a.day)
        return tempActions
      }

      tempActions.sort((a, b) => a.day - b.day)
      return tempActions
    },

    /**
     * Get all days between an initial/final day.
     * @param {object[]} actions
     * @returns {object[]}
     */
    getDaysOnRange(actions) {
      const allDaysAvailable = []

      const daysBefore = this.getInitialDayAction
      const daysAfter = this.getFinalDayAction

      if (typeof daysBefore !== 'number' && typeof daysAfter !== 'number') return actions

      for (let day = daysBefore; day <= daysAfter; day++) {
        let baseItem = {
          day: day,
        }

        const item = actions.find((item) => item.day === day)

        if (item) {
          baseItem = item
        }

        allDaysAvailable.push(baseItem)
      }

      return allDaysAvailable
    },

    addActionCard(action) {
      const mediationId = this.$route.params.id

      this.setFetching(true)
      this.attemptCreateMediationAction({ action, mediationId }).then(() => {
        this.attemptGetMediationActions(mediationId)
          .then(() => {
            this.setFeedback({ message: this.$t('mediation.actions:create.action.success') })
          })
          .finally(() => this.setFetching(false))
      })
    },

    /**
     *
     * @param {Object} metadataItem
     */
    removeActions(metadataItem) {
      if (!metadataItem) return
      const planId = this.$route.params.id

      this.setFetching(true)
      this.attemptSetMediationConfigs({
        data: {
          mediations: [],
          mediationPlanId: planId,
          daysSinceReferenceDate: metadataItem.day,
        },
      })
        .then(() => this.attemptGetMediationActions(planId))
        .then(() => {
          this.setFeedback({ message: this.$t('mediation.actions:save.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('mediation.actions:save.error'), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
          this.setDeleteConfirmModalState(false)
        })
    },

    goToPage(page, reference) {
      const day = reference && typeof reference.day === 'number' ? reference.day : null

      page && this.$_goToPage(page, null, day)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles.scss';
@import 'MediationListActions.scss';
</style>
