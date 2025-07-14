<script>
import { defineComponent } from 'vue'

import Rating from '@/components/general/Rating'

export default defineComponent({
  name: 'RatingSection',

  components: {
    Rating,
  },

  props: {
    currentSolution: {
      type: Object,
      default: () => ({}),
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('rating-section')"
    class="rating-section"
  >
    <p class="description">
      {{
        $t('rating:modal.title', {
          type: $t('global:solution').toLowerCase(),
          preposition: $t('global:that:male'),
        })
      }}
    </p>

    <Rating
      :id="currentSolution.course.id"
      :star-size="24"
      :user-rating="currentSolution._embedded.user_rating"
      :rating-analysis="currentSolution._embedded.rating_analysis"
      resource-type="session"
      inline
      @rating-submited="$emit('closeRating')"
    />
  </div>
</template>