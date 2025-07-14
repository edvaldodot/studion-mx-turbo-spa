<script>
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Icon from '@/components/general/Icon'
import CategoriesChips from '@/components/general/CategoriesChips'

const Rating = () => import('@/components/general/Rating')

export default {
  components: {
    Card,
    CardBody,
    CardImage,
    CardActions,
    Icon,
    Rating,
    CategoriesChips
  },
  props: {
    id: Number,
    coursesCount: Number,
    image: String,
    type: String,
    title: String,
    period: { type: Object, default: null },
    ratingAnalysis: { type: Object, default: null },
    userRating: { type: Object, default: null },
    categories: { type: Array, default: () => ([]) }
  },
  computed: {
    imageWidth () {
      return !this.$media.mobile ? 339 : '100%'
    },
    imageHeight () {
      return !this.$media.mobile ? 226 : 230
    },
    actionsWidth () {
      return !this.$media.mobile ? 50 : 'auto'
    },
    actionsHeight () {
      return this.$media.mobile ? 50 : 'auto'
    },
    typeText () {
      switch (this.type) {
        case 'presential':
          return this.$t('solutions.type:presential')
        case 'distance':
          return this.$t('solutions.type:distance')
        case 'blended':
          return this.$t('solutions.type:blended')
        case 'online_with_tutoring':
          return this.$t('solutions.type:online_with_tutoring')
        case 'online_self_instructional':
          return this.$t('solutions.type:online_self_instructional')
        case 'hybrid':
          return this.$t('solutions.type:hybrid')
        default:
          return this.$t('solutions.type:without')
      }
    },
    coursesCountText () {
      return this.coursesCount > 1 || this.coursesCount === 0
        ? this.$t('classroom:offerings.card.courses.count.plural')
        : this.$t('classroom:offerings.card.courses.count.single')
    }
  },
  methods: {
    downloadCertificate ($event) {
      $event.stopPropagation()
    }
  }
}
</script>

<template>
  <Card
    dark
    class="classroom-card offer-card"
    v-bind="this.$attrs"
    :horizontal="!$media.mobile"
    rounded
  >
    <card-image
      :src="image"
      :width="imageWidth"
      :height="imageHeight"
      use-img
    >
    </card-image>

    <card-body>
      <span class="classroom-card__type">{{ typeText }}</span>
      <h3 class="classroom-card__title">{{ title }}</h3>
      <rating
        :id="id"
        dark
        show-quantity
        resource-type="offering"
        :rating-analysis="ratingAnalysis"
        :user-rating="userRating"
      />
      <categories-chips :categories="categories" color="success" />
      <div class="spacer" />
      <div class="classroom-card__footer">
        <p class="classroom-card__footer-text">
          <strong>{{ coursesCount }}</strong>
          {{ coursesCountText }}
        </p>
      </div>
    </card-body>

    <card-actions
      centered
      no-padding
      :width="actionsWidth"
      :height="actionsHeight"
    >
      <icon name="keyboard_arrow_right" class="classroom-card__icon" />
    </card-actions>

  </Card>
</template>
