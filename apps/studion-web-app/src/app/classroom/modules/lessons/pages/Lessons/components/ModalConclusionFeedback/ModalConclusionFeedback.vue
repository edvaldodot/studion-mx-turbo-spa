<script>
import { defineComponent } from 'vue'
import config from '@/config'

const { PORTAL_CONFIGS } = config

import ModalInformation from '@/components/general/ModalInformation'
import InlineSvg from 'vue-inline-svg'

const CertificateSection = () => import('./components/CertificateSection.vue')
const RatingSection = () => import('./components/RatingSection.vue')
const RedirectSection = () => import('./components/RedirectSection.vue')
const PortalSection = () => import('./components/PortalSection.vue')

export default defineComponent({
  name: 'ModalConclusionFeedback',

  components: {
    ModalInformation,
    CertificateSection,
    RatingSection,
    RedirectSection,
    PortalSection,
    InlineSvg,
  },

  props: {
    currentSolution: {
      type: Object,
      default: () => ({}),
    },
    alreadyFinished: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    currentEmbedded() {
      return this.currentSolution._embedded || {}
    },

    customerUsesPortal() {
      return !!PORTAL_CONFIGS
    },

    showRating() {
      if (!this.$isEnabledFeature('rating')) return false
      return this.currentEmbedded.user_rating && this.currentEmbedded.user_rating['can_rate']
    },

    showCertificate() {
      const enrollment = this.currentSolution.enrollment
      return enrollment && enrollment.certificateHash
    },

    iconSource() {
      return `/assets/images/svg/neutralStates/neutral_state_62.svg`
    },
  },
})
</script>

<template>
  <ModalInformation
    :data-testid="$testId('modal-conclusion-feedback')"
    active
    class="modal-conclusion-feedback"
    width="582px"
    closable
    @close="$emit('close')"
  >
    <template #pre-content>
      <InlineSvg
        width="45%"
        height="45%"
        :src="iconSource"
      />
    </template>
    <template
      v-if="customerUsesPortal"
      #title
    >
      {{ $t('classrom.panel.class.cards:already.approved.solution') }}
    </template>

    <template
      v-else
      #title
    >
      {{
        $t('classrom.panel.class.cards:approved.solution', {
          solutionName: currentSolution.course.name,
        })
      }}
    </template>

    <template
      v-if="customerUsesPortal"
      #content
    >
      <PortalSection></PortalSection>
    </template>

    <template
      v-else-if="(showRating || showCertificate) && !customerUsesPortal"
      #content
    >
      <RatingSection
        v-if="showRating"
        :current-solution="currentSolution"
        @closeRating="$emit('close')"
      />

      <CertificateSection
        v-if="showCertificate && !$hideCertificateDownload()"
        :current-solution="currentSolution"
      />
    </template>

    <template
      v-else
      #content
    >
      <RedirectSection />
    </template>
  </ModalInformation>
</template>

<style lang="scss">
@import './ModalConclusionFeedback.scss';
</style>
