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

    forumRemainingNote: {
      type: Number,
      default: null,
    },

    forumMaxGrade: {
      type: Number,
      default: null,
    },
    isManagement: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    checkFieldAndReset(value) {
      if (value.checked) return
      this.value.max_grade = null
    },
  },
})
</script>

<template>
  <FormSection
    :title="$t('classroom.forum:evaluaton:modal.title')"
    :dark="dark"
    class="evaluation-forum-content text-color"
  >
    <p class="form-section-description text-color">
      {{ $t('classroom.forum:evaluaton:modal.description') }}
    </p>

    <Checkbox
      v-model="value.avaliative"
      dark
      switch-type
      :items="[
        {
          label: $t('classroom.forum:evaluaton:modal.active.forum'),
          value: true,
        },
      ]"
      @change="checkFieldAndReset"
    />

    <div
      v-if="value.avaliative"
      class="full-mark-content"
    >
      <div
        v-if="!isManagement"
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
              any-step
              type="number"
              hide-error-details
              dark
            />
          </div>
        </div>
        <ValidationMessage :validation="validation.max_grade" />
      </div>

      <div class="full-mark-description">
        <div v-if="!isManagement">
          <div class="full-mark-forum">
            <span class="text-color">
              {{ $t('classroom.forum:evaluaton:modal.remaingNote') }}
            </span>
            <p class="text-color">{{ `${forumRemainingNote}`.replace('.', ',') }}</p>
          </div>
          <div class="full-mark-forum">
            <span class="text-color">
              {{ $t('classroom.forum:evaluaton:modal.input.full.mark') }}
            </span>
            <p class="text-color">{{ `${forumMaxGrade}`.replace('.', ',') }}</p>
          </div>
        </div>

        <div class="mandatory-feedback-checkbox">
          <Checkbox
            v-model="value.feedback_mandatory"
            dark
            switch-type
            :items="[
              {
                label: $t('classroom.forum:evaluaton:modal.mandatory.feedback'),
                description: $t('classroom.forum:evaluaton:modal.mandatory.feedback.description'),
                value: true,
              },
            ]"
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

  .form-section-description {
    font-size: 14px;
    color: var(--text-color);
    opacity: 0.7;
    margin-bottom: 25px;
  }

  .full-mark-content {
    padding-left: 40px;

    .form-item {
      margin-bottom: 20px;
    }

    .full-mark-description {
      .full-mark-forum {
        display: flex;

        span {
          color: var(--text-color);
          opacity: 0.7;
          font-size: 14px;
          padding-right: 8px;
          margin-bottom: 12px;
        }

        p {
          color: var(--text-color);
          font-weight: bold;
        }
      }

      .mandatory-feedback-checkbox {
        padding-top: 40px;
        padding-bottom: 60px;
      }
    }

    .full-mark-input {
      display: flex;
      align-items: center;

      p {
        color: var(--text-color);
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
