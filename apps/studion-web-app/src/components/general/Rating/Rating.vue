<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import StarRating from 'vue-star-rating'
import Action from '../Action'
import Icon from '../Icon'
import InputField from '@/components/general/InputField'

export default defineComponent({
  name: 'TheRating',

  components: {
    StarRating,
    Action,
    Icon,
    InputField,
    Modal: () => import('../Modal'),
  },

  props: {
    id: {
      type: Number,
      default: null,
    },
    ratingAnalysis: {
      type: Object,
      default: null,
    },
    userRating: {
      type: Object,
      default: null,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    showQuantity: {
      type: Boolean,
      default: false,
    },
    resourceType: {
      type: String,
      default: '',
    },
    inline: {
      type: Boolean,
      default: false,
    },
    clickStars: {
      type: Boolean,
      default: false,
    },
    activeColor: {
      type: String,
      default: 'var(--rating-color)',
    },
    starSize: {
      type: Number,
      default: 12,
    },
    noHeader: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      alreadyRated: false,
      average: 0,
      quantity: 0,
      activeModal: false,
      ratingValue: 0,
      ratingComment: null,
      startPoints: [
        100, 0, 123.51141009169893, 67.63932022500211, 195.10565162951536, 69.09830056250526,
        138.04226065180615, 112.36067977499789, 158.77852522924732, 180.90169943749473, 100, 140,
        41.2214747707527, 180.90169943749476, 61.95773934819386, 112.3606797749979,
        4.894348370484636, 69.09830056250527, 76.48858990830107, 67.63932022500211,
      ],
    }
  },

  computed: {
    ratingProps() {
      return {
        increment: 1,
        'star-size': 25,
        'border-color': '#ffffff',
        'border-width': 2,
        'inactive-color': '#ffffff00',
        'show-rating': false,
        padding: 20,
        'active-border-color': '#ffd055',
      }
    },
    modalTitle() {
      const key = this.resourceType === 'session' ? 'solution' : this.resourceType
      const type = this.$t(`global:${key}`).toLowerCase()
      const preposition = this.$t(`global:that:${key === 'solution' ? 'male' : 'female'}`)

      return this.$t('rating:modal.title', {
        type,
        preposition,
      })
    },
    canRate() {
      return this.equalsProfile('student') && this.userRating && this.userRating.can_rate
    },
    ratingSubtitle() {
      return this.alreadyRated ? this.$t('rating:subtitle.rated') : this.$t('rating:subtitle')
    },
    showAlreadyRated() {
      return this.equalsProfile('student') && this.alreadyRated
    },
  },

  watch: {
    ratingAnalysis(newRatingAnalysis) {
      this.configRatingAnalysis(newRatingAnalysis)
    },
    userRating(newUserRating) {
      this.configUserRating(newUserRating)
    },
  },

  created() {
    this.configUserRating(this.userRating)
    this.configRatingAnalysis(this.ratingAnalysis)
  },

  methods: {
    ...mapActions(['setFeedback', 'sendRating']),
    openModal() {
      this.$emit('openModal')
      this.activeModal = true
    },
    closeModal() {
      this.activeModal = false
      this.$emit('closeModal')
    },
    async submit() {
      const { ratingValue: rating, resourceType: resource, id, ratingComment: comment } = this

      const response = await this.sendRating({
        id,
        rating,
        resource,
        comment,
      })

      this.setFeedback({ message: this.$t('rating:modal.feedback.success') })

      this.activeModal = false
      this.alreadyRated = true
      this.configRatingAnalysis(response.data.ratingAnalysis)

      const ratingSubmited = {
        ratingAnalysis: {
          quantity: this.quantity,
          average: this.average,
        },
        userRating: {
          can_rate: false,
          rating,
        },
      }

      this.$emit('rating-submited', ratingSubmited)
    },

    configRatingAnalysis(ratingAnalysis) {
      if (!ratingAnalysis) ratingAnalysis = {}
      const { average = 0, quantity = 0 } = ratingAnalysis

      this.average = average
      this.quantity = quantity
    },

    configUserRating(userRating) {
      if (!userRating) userRating = {}
      const { rating = 0 } = userRating

      this.ratingValue = rating
      this.alreadyRated = rating > 0
    },
  },
})
</script>

<template>
  <div
    v-if="$isEnabledFeature('rating')"
    :data-testid="$testId('rating')"
    class="rating"
    :class="{ dark, inline: inline && !clickStars, center: inline && !clickStars }"
  >
    <template v-if="!inline">
      <StarRating
        :rating="average"
        :increment="0.1"
        :star-size="starSize"
        :read-only="true"
        :star-points="startPoints"
        :border-width="1"
        :padding="2"
        :active-color="activeColor"
        :border-color="activeColor"
        inactive-color="var(--inactive-rating-color)"
      />

      <div
        v-if="showQuantity"
        class="rating__total"
      >
        <Icon
          class="rating__total-icon"
          name="person"
          size="small"
          wrapper
        />

        <span>{{ quantity }} Total</span>
      </div>

      <Action
        v-if="showAlreadyRated || canRate"
        :text="alreadyRated ? $t('rating:button.evaluate.disabled') : $t('rating:button.evaluate')"
        :disabled="alreadyRated"
        :url="{ name: 'offerings.create' }"
        :dark="dark"
        class="rating__button"
        type="button"
        primary
        small
        @click.stop="openModal"
      />
    </template>

    <template v-else-if="showAlreadyRated || canRate">
      <div class="rating__stars">
        <StarRating
          v-model="ratingValue"
          v-bind="ratingProps"
          border-color="#45484c"
          :star-points="startPoints"
        />
      </div>

      <InputField
        v-model="ratingComment"
        class="rating__comment"
        :placeholder="$t('global:form.optional_comment')"
        :counter="255"
        @input="$emit('onCommentChange')"
      />

      <Action
        v-if="!alreadyRated && !clickStars"
        :text="$t('rating:button.evaluate')"
        :disabled="ratingValue === 0"
        class="rating__button"
        type="button"
        medium
        secondary
        @click="submit"
      />
    </template>

    <Modal
      :active.sync="activeModal"
      @close="closeModal()"
    >
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('rating:modal.subtitle') }}</span>

        <h2 class="modal-title text-color is-capitalize">{{ modalTitle }}</h2>

        <div class="text-center">
          <p class="rating-text text-color">{{ $t('rating:modal.text') }}</p>

          <StarRating
            v-model="ratingValue"
            v-bind="ratingProps"
            border-color="#45484c"
            :star-points="startPoints"
          />

          <InputField
            v-model="ratingComment"
            class="rating__comment"
            :placeholder="$t('global:form.optional_comment')"
            :counter="255"
          />

          <Action
            :text="$t('rating:button.evaluate')"
            :disabled="ratingValue === 0"
            class="mt-1"
            type="button"
            secondary
            large
            @click="submit"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import 'Rating.scss';
</style>