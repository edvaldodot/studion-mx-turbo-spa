<template>
  <div
    v-if="Mediation.mediationPlan.applicability"
    class="main-content mediation-create"
  >
    <mediation-small-header
      :title="Mediation.mediationPlan.name"
      confirm-modal
      @onSubmit="submitData(pageToGo)"
    />
    <div class="mediation">
      <div class="old-center">
        <div class="mediation-data-header">
          <h2 class="mediation-data-title">{{ $t('global:form.step', { num: 2 }) }}</h2>
          <p class="mediation-data-description">
            {{ $t(`mediation.links:link.view.title.${Mediation.mediationPlan.applicability}`) }}
          </p>
          <p class="mediation-data-sub">
            {{
              $t(`mediation.links:link.view.description.${Mediation.mediationPlan.applicability}`)
            }}
          </p>
          <p class="mediation-data-tip">
            {{
              $tc(
                `mediation.links:link.view.tip.${Mediation.mediationPlan.applicability}`,
                Mediation.links.length + 1
              )
            }}
          </p>
        </div>

        <action
          v-if="canWrite('mediation_plan')"
          :text="$t(`mediation.links:btn.add.${Mediation.mediationPlan.applicability}`)"
          type="button"
          primary
          large
          class="mb-5 mt-3"
          @click="$router.push({ name: 'mediation.link.add' })"
        />

        <mediation-link-datatable
          v-model="Mediation.links"
          :is-session="isSession"
          @select-item="(item) => (selectedSession = item)"
          @remove-item="removeLinkedMediation"
        />

        <div class="py-4">
          <Pagination
            :active-first-last="false"
            :active-page="2"
            :page-count="3"
            :float="$media.mobile"
            custom-routing
            disable-items-per-page
            disable-manual-page
            disable-scroll
            block-layout
            show-all-pages
            @next-page="saveAndGoToPage(3)"
            @previous-page="saveAndGoToPage(1)"
            @go-to-page="saveAndGoToPage($event)"
          />
        </div>

        <ModalSessionManualDate
          v-if="selectedSession"
          :session-link="selectedSession"
          @close="selectedSession = null"
        />
      </div>
    </div>

    <RouterView @add-links="addMediationLinks" />
  </div>
</template>

<script>
import Action from '@/components/general/Action'
import Pagination from '@/components/general/Pagination'
import MediationLinkDatatable from '../../components/MediationLinkDatatable'
import MediationSmallHeader from '../../components/MediationSmallHeader'

import { mapActions, mapState } from 'vuex'

import pageMixin from '../../mixins/pageMixin'

const ModalSessionManualDate = () => import('./components/ModalSessionManualDate')

export default {
  name: 'MediationLink',
  components: {
    Action,
    Pagination,
    MediationLinkDatatable,
    MediationSmallHeader,
    ModalSessionManualDate,
  },

  mixins: [pageMixin],

  data() {
    return {
      pageToGo: 3,
      selectedSession: null,
    }
  },

  computed: {
    ...mapState({
      Mediation: (state) => state.Mediation.current,
    }),

    isSession() {
      const hasApplicability =
        this.Mediation && this.Mediation.mediationPlan && this.Mediation.mediationPlan.applicability
      return hasApplicability === 'session'
    },
  },
  created() {
    this.setFetching(true)
    const applicabilityKey =
      this.Mediation.mediationPlan.applicability === 'solution' ? 'courses' : 'sessions'

    this.setMediationLinks(this.Mediation.mediationPlan[applicabilityKey]).finally(() => {
      this.setFetching(false)
    })
  },
  methods: {
    ...mapActions([
      'addMediationLinks',
      'removeMediationLink',
      'attemptSaveMediationLinks',
      'setMediationLinks',
      'attemptGetMediationPlan',
      'setFetching',
      'setFeedback',
    ]),
    removeLinkedMediation(item) {
      this.removeMediationLink(item)
    },

    /**
     * Callback to Generate body payload to send on request.
     * @param {Object} link
     * @returns {number|Object}
     */
    generateLinkData(link) {
      if (!this.isSession) return link.id

      return {
        id: link.id,
        referenceDate: link.referenceDate,
      }
    },

    submitData(callback) {
      this.setFetching(true)
      this.attemptSaveMediationLinks({
        id: this.$route.params.id,
        type: this.Mediation.mediationPlan.applicability,
        data: this.Mediation.links.map(this.generateLinkData),
      })
        .then(() => {
          this.setFeedback({ message: this.$t('mediation.actions:save.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('mediation.actions:save.error'), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
          callback && callback()
        })
    },

    saveAndGoToPage(page) {
      this.pageToGo = page

      let callback = () => {
        page && this.$_goToPage(page)
      }

      if (this.canWrite('mediation_plan')) {
        this.submitData(callback)
      } else {
        callback()
      }
    },
  },
}
</script>

<style lang="scss">
@import '../../styles.scss';
</style>
