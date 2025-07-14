<script>
import { defineComponent } from 'vue'

import HelperCloudQuestions from '../../../ExaminationQuestions/components/HelperCloudQuestions'
import InputField from '@/components/general/InputField'
import Checkbox from '@/components/general/Checkbox'

export default defineComponent({
  name: 'ResearchQuestionsLinearScale',

  components: {
    HelperCloudQuestions,
    InputField,
    Checkbox,
  },

  props: {
    value: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      mutableQuestion: this.value,
    }
  },
})
</script>

<template>
  <div class="modal-form-box-ls">
    <div class="flex gap-2 align-items-center">
      <InputField
        v-model="mutableQuestion.initial_scale"
        :min="0"
        :max="mutableQuestion.final_scale"
        :step="1"
        any-step
        type="number"
        dark
      />
      <span class="text-base text-color">{{ $t('global:to').toLowerCase() }}</span>
      <InputField
        v-model="mutableQuestion.final_scale"
        :min="mutableQuestion.intial_scale"
        :max="10"
        type="number"
        dark
      />
    </div>

    <div class="flex gap-1 flex-column modal-form-box-ls-markers my-3">
      <div class="flex gap-3 align-items-center">
        <p class="text-color">{{ mutableQuestion.initial_scale }}</p>
        <InputField
          v-model="mutableQuestion.initial_label"
          class="w-12"
          :label="$t('global:marker')"
          :counter="100"
          autocomplete="name"
          type="text"
          dark
        />
      </div>
      <div class="flex gap-3 align-items-center">
        <p class="text-color">{{ mutableQuestion.final_scale }}</p>
        <InputField
          v-model="mutableQuestion.final_label"
          class="w-12"
          :label="$t('global:marker')"
          :counter="100"
          autocomplete="name"
          type="text"
          dark
        />
      </div>

      <div class="flex align-items-center modal-form-box-ls-markers-tip">
        <Checkbox
          v-model="mutableQuestion.does_not_apply"
          :items="[
            {
              label: $t('solutions.create.classes:modal.ls.checkbox'),
              value: true,
            },
          ]"
        />
        <HelperCloudQuestions
          class="text-color"
          type="research_linear_scale-tip"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.modal-form-box--research {
  .modal-form-box-ls-markers {
    &-n {
      display: flex;
      align-items: center;
      gap: 2em;

      .form-item {
        width: 100%;
      }

      p {
        margin-bottom: 1.8em;
        width: 24px;
      }
    }

    &-tip {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
