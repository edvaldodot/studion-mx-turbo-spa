<script>
import { defineComponent } from 'vue'
import TextEditorMedia from '@/components/shared/TextEditorMedia'

export default defineComponent({
  name: 'CompetencyFormDiscursive',

  components: {
    TextEditorMedia,
  },

  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      question: this.value,
    }
  },
})
</script>

<template>
  <div :data-testid="$testId('competency-form-discursive')">
    <TextEditorMedia
      v-model="question"
      :validation="validation.question"
      :item="'question'"
      :disabled="!canWrite('courses')"
      :label="$t('solutions.create.classes:modal.statement')"
      :showa-attached-files="false"
      image-enabled
      embed-image
    />
  </div>
</template>
