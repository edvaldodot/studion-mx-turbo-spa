<script>
import Icon from '@/components/general/Icon'
import { mapState } from 'vuex'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AnnulledFeedback',

  components: {
    Icon,
  },
  computed: {
    ...mapState(['Classroom']),

    position() {
      return this.Classroom.data.team
    },

    perfilPrimary() {
      return this.position.find((member) => member.position === 'primary')
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('annulled-feedback')"
    class="evaluation-question-feedback is-warning"
  >
    <Icon
      name="alert-circle"
      class="evaluation-question-feedback-icon"
      size="large"
      wrapper
    />

    <span class="evaluation-question-feedback-title text-color">
      {{
        $t('classroom.assessments.evaluation:answer.annulled', { name: perfilPrimary.profile.name })
      }}
    </span>
  </div>
</template>
