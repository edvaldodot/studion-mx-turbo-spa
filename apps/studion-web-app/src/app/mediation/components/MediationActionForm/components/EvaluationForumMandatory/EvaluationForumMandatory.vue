<script>
import { defineComponent } from 'vue'

import Checkbox from '@/components/general/Checkbox'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import ValidationMessage from '@/components/general/ValidationMessage'

export default defineComponent({
  name: 'EvaluationForumMandatory',

  components: {
    Checkbox,
    FormSection,
    InputField,
    ValidationMessage,
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
    dark: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <FormSection
    :title="$t('classroom.forum:evaluaton:modal.title')"
    :dark="dark"
    class="evaluation-forum-content"
  >
    <p class="form-section-description">{{ $t('classroom.forum:evaluaton:modal.description') }}</p>

    <Checkbox
      v-model="value.avaliative"
      :dark="dark"
      switch-type
      :items="[
        {
          label: $t('classroom.forum:evaluaton:modal.active.forum'),
          description: $t('classroom.forum:evaluaton:modal.active.forum:description'),
          value: true,
        },
      ]"
    />

    <div
      v-if="value.avaliative"
      class="full-mark-content"
    >
      <div
        :class="{ 'theme-dark': dark }"
        class="form-item"
      >
        <div class="full-mark-input">
          <p class="text-color">
            {{ $t('classroom.forum:evaluation:modal.full.mark') }}
          </p>

          <div class="full-mark-input-label">
            <p class="text-color">
              {{ $t('classroom.forum:evaluaton:modal.points') }}
            </p>

            <InputField
              v-model="value.max_grade"
              :validation="validation.max_grade"
              :min="0"
              :max="10"
              :step="0.1"
              :dark="dark"
              type="number"
              hide-error-details
            />
          </div>
        </div>
        <ValidationMessage :validation="validation.max_grade" />
      </div>

      <div class="full-mark-description">
        <div class="mandatory-feedback-checkbox">
          <Checkbox
            v-model="value.feedback_mandatory"
            :dark="dark"
            :items="[
              {
                label: $t('classroom.forum:evaluaton:modal.mandatory.feedback'),
                description: $t('classroom.forum:evaluaton:modal.mandatory.feedback.description'),
                value: true,
              },
            ]"
            switch-type
          />
        </div>
      </div>
    </div>
  </FormSection>
</template>

<style lang="scss">
.evaluation-forum-content {
  background: unset;
  padding-top: 10px;
  color: var(--text-color);

  &.theme-dark {
    .form-section-description {
      color: var(--text-color);
    }

    .full-mark-input {
      p {
        color: var(--text-color);
      }
    }
  }

  .form-section-title {
    padding: 0;
  }

  .form-section-description {
    font-size: 14px;
    opacity: 0.7;
    margin-bottom: 25px;
  }

  .full-mark-content {
    padding-left: 40px;

    .form-item {
      margin-bottom: 20px;
    }

    .full-mark-input {
      display: flex;
      align-items: center;

      p {
        padding-right: 60px;
      }

      .full-mark-input-label {
        max-width: 70px;

        p {
          font-size: 12px;
        }
      }
    }
  }
}
</style>