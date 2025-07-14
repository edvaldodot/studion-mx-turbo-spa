<script>
import { defineComponent } from 'vue'

import Radio from '@/components/general/Radio'
import ValidationMessage from '@/components/general/ValidationMessage'

export default defineComponent({
  name: 'LinearScaleQuestion',

  components: {
    Radio,
    ValidationMessage,
  },

  props: {
    value: {
      type: Object,
      default: null,
    },
    items: {
      type: Array,
      default: () => [],
    },
    leftLabel: {
      type: String,
      default: null,
    },
    rightLabel: {
      type: String,
      default: null,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      mutableValue: this.value,
    }
  },

  computed: {
    breakLine() {
      return this.items.length > 5
    },

    mappedItems() {
      return this.items.map((item) => {
        if (item.label !== 'does_not_apply') return item

        return {
          ...item,
          label: this.$t('global:do.not.apply'),
        }
      })
    },
  },
})
</script>

<template>
  <div>
    <div
      class="linear-scale-question"
      :class="{ '--break': breakLine }"
    >
      <div
        class="linear-scale-question-block linear-scale-question__marker text-center flex align-items-center"
        :class="{ 'linear-scale-question-block--break': !breakLine }"
      >
        <div class="text-color text-base">{{ mutableValue.meta.initial_label }}</div>
        <div
          v-if="$media.mobile && !breakLine"
          class="text-color text-base"
        >
          {{ mutableValue.meta.final_label }}
        </div>
      </div>
      <Radio
        v-model="mutableValue.answer"
        :items="mappedItems"
        :bottom-values="!breakLine || !$media.mobile"
        :validation="validation"
        :details="false"
      />
      <div
        v-if="!($media.mobile && !breakLine) && mutableValue.meta.final_label"
        class="linear-scale-question-block text-color text-base text-center flex align-items-center"
      >
        {{ mutableValue.meta.final_label }}
      </div>
    </div>

    <ValidationMessage
      :validation="validation"
      class="mt-3"
    />
  </div>
</template>

<style lang="scss">
@import './LinearScaleQuestion.scss';
</style>
