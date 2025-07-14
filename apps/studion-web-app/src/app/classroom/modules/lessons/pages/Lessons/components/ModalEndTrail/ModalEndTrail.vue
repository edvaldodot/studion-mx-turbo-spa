<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import ModalClassic from '@/components/general/ModalClassic'
import Action from '@/components/general/Action'
import Rating from '@/components/general/Rating'
import CertificateActions from '@/components/general/CertificateActions'

import { certificateMixin } from '@/mixins/certificateMixin'

export default defineComponent({
  name: 'ModalEndTrail',

  components: {
    ModalClassic,
    Action,
    Rating,
    CertificateActions,
  },

  mixins: [certificateMixin],

  props: {
    path: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      ratingAnalysis: null,
      userRating: null,
      activeModal: true,
    }
  },

  computed: {
    getTrailEmbed() {
      return this.equalsProfile('student') ? 'user_rating,rating_analysis' : 'rating_analysis'
    },
    modalTitle() {
      return this.$t('modal:end.trail.title') + this.path.name
    },
    modalDescription() {
      return this.$isEnabledFeature('rating')
        ? this.$t('classroom.next.solution.modal:rating.description')
        : ''
    },
  },

  created() {
    if (!this.path) return

    this.setFetching(true)
    this.attemptTrailRetrieval({
      trailId: this.path.id,
      params: { embed: this.getTrailEmbed },
    })
      .then(({ data }) => {
        const {
          _embedded: { rating_analysis = null, user_rating = null },
        } = data

        this.ratingAnalysis = rating_analysis
        this.userRating = user_rating
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions(['setFetching', 'attemptDownloadTrailCertificate', 'attemptTrailRetrieval']),

    downloadCertificate() {
      this.$downloadCertificate(this.attemptDownloadTrailCertificate, this.path.certificateHash)
    },
  },
})
</script>

<template>
  <ModalClassic
    v-show="activeModal"
    :data-testid="$testId('modal-end-trail')"
    :description="modalDescription"
    icon="school-hat"
    @close="$emit('close')"
  >
    <template #title>
      <h1>{{ modalTitle }}</h1>
    </template>
    <div class="modal-end-trail__body">
      <div
        v-if="$isEnabledFeature('rating')"
        class="modal-end-trail__rating"
      >
        <p class="modal-end-trail__call-rating">{{ $t('modal:end.trail.call.rating') }}</p>

        <Rating
          v-if="ratingAnalysis && userRating"
          :id="path.id"
          :star-size="18"
          :rating-analysis="ratingAnalysis"
          :user-rating="userRating"
          resource-type="trail"
          @openModal="activeModal = false"
          @closeModal="activeModal = true"
          @rating-submited="activeModal = true"
        />
      </div>

      <div
        v-if="path.certificateHash"
        class="modal-end-trail__certificate"
        :class="{ 'b-top': $isEnabledFeature('rating') }"
      >
        <div>
          <h2 class="certificate__title">{{ $t('global:download.certificate.available') }}</h2>
          <p class="certificate__description">{{ $t('modal:end.trail.certificate.obs') }}</p>
        </div>

        <Action
          :text="$t('global:download.certificate')"
          icon="certificate"
          type="button"
          secondary
          @click="downloadCertificate"
        />

        <div class="certificate__linked-in">
          <CertificateActions
            :certificate-title="path.name"
            :certificate-issued-at="path.certificateIssuedAt"
            remove-download
          />
        </div>
      </div>
    </div>
  </ModalClassic>
</template>

<style lang="scss">
@import 'ModalEndTrail.scss';
</style>
