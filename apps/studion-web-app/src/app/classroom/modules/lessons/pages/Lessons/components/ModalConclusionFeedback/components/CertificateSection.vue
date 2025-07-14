<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { certificateMixin } from '@/mixins/certificateMixin'

import Action from '@/components/general/Action'
import LinkedInAction from '@/components/general/LinkedInAction'

export default defineComponent({
  name: 'CertificateSection',

  components: {
    Action,
    LinkedInAction,
  },

  mixins: [certificateMixin],

  props: {
    currentSolution: {
      type: Object,
      default: () => ({}),
    },
  },

  methods: {
    ...mapActions(['attemptMyselfDownloadCertificate']),

    downloadCertificate() {
      this.$downloadCertificate(
        this.attemptMyselfDownloadCertificate,
        this.currentSolution.enrollment.certificateHash
      )
    },

    getCertificateDate() {
      const date = new Date(this.currentSolution.enrollment.certificateIssuedAt)
      return {
        issueYear: date.getUTCFullYear(),
        issueMonth: date.getUTCMonth() + 1,
      }
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('certificate-section')"
    class="certificate-section"
  >
    <p class="text-color">{{ $t('modal:end.trail.certificate.obs') }}</p>

    <div class="actions-wrapper">
      <LinkedInAction
        :name="currentSolution.course.name"
        :small="false"
        :date="getCertificateDate()"
      />

      <Action
        :text="$t('global:download.certificate')"
        icon="certificate"
        type="button"
        secondary
        @click="downloadCertificate"
      />
    </div>
  </div>
</template>
