<script>
import { defineComponent } from 'vue'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'QuestionFormObs',

  components: {
    Icon,
  },

  props: {
    label: {
      type: String,
      default: '',
    },
  },
})
</script>

<template>
  <section
    :data-testid="$testId('question-form-obs')"
    class="discursive-obs mt-4"
  >
    <Icon
      name="error"
      size="medium"
      pack="material"
      class="text-primary icon-fill-1"
    />

    <p class="discursive-obs-text text-color">
      {{ label }}
    </p>
  </section>
</template>

<style lang="scss">
.discursive-obs {
  gap: 8px;
  display: flex;
  color: var(--text-color);
  padding-bottom: 10px;

  font-size: 0.975em;

  p {
    padding: 4px 0;
  }

  .icon-wrapper {
    color: var(--primary-color);
  }
}
</style>
