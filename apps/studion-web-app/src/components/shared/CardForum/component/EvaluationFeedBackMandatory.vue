<script>
import { defineComponent } from 'vue'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'EvaluationFeedBackMandatory',

  components: {
    Icon,
  },

  props: {
    feedbackValue: {
      type: Object,
      default: () => ({}),
    },
  },
})
</script>

<template>
  <div class="evaluation-feedback-content">
    <div class="evaluation-feedback-header">
      <div class="evaluation-feedback-content-responsible">
        <div class="feedback-author-img">
          <img
            v-if="feedbackValue && feedbackValue.auditInsert.user.image"
            :src="feedbackValue.auditInsert.user.image"
            :alt="feedbackValue.auditInsert.user.name"
            class="evaluation-question-general-feedback-user-image"
          />

          <Icon
            v-else
            name="account_circle"
            class="icon"
          />
        </div>

        <div class="feedback-author-data">
          <p class="date-feedback">{{ formatDate(feedbackValue.auditInsert.dh, 'long') }}</p>
          <p class="responsible-name">{{ feedbackValue.auditInsert.user.name }}</p>
        </div>
      </div>

      <div class="evaluation-feedback-grade">
        <p class="title">{{ $t('classroom.forum:evaluation:responsible:feedback') }}</p>
        <p class="grade">
          {{ feedbackValue.grade }} {{ $t('classroom.forum:evaluaton:modal.points') }}
        </p>
      </div>
    </div>

    <div class="evaluation-feedback-description">
      <p v-html="feedbackValue.feedback"></p>
    </div>
  </div>
</template>

<style lang="scss">
.evaluation-feedback-content {
  background-color: var(--secondary-color);
  border-radius: 8px;
  margin-top: 17px;
  padding: 16px;
  color: var(--text-color);

  .evaluation-feedback-header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 20px;
    font-family: var(--font-family);

    .evaluation-feedback-content-responsible {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .feedback-author-data {
      flex: 1;
    }

    .feedback-author-img {
      $size: 40px;
      width: $size;
      height: $size;
      border-radius: 50%;
      overflow: hidden;

      .icon,
      img {
        width: $size;
        height: $size;
        object-fit: cover;
      }
    }

    .date-feedback {
      font-size: 0.875rem;
      line-height: 1.125rem;
      font-weight: normal;
      color: var(--text-light-color);
      margin-bottom: 4px;
    }

    .responsible-name {
      font-size: 1rem;
      line-height: 1.25rem;
      font-weight: bold;
    }

    .evaluation-feedback-grade {
      text-align: right;

      .title,
      .grade {
        font-size: 0.875rem;
        line-height: 1.5rem;
        font-weight: bold;
      }

      .grade {
        line-height: 1.125rem;
      }
    }
  }
}
</style>