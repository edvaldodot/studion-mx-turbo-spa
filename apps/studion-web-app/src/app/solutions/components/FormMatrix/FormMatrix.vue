<script>
import { defineComponent } from 'vue'
import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'

export default defineComponent({
  name: 'FormMatrix',

  components: {
    Action,
    InputField,
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
    canEdit: {
      type: Boolean,
      default: false,
    },
    itemProperty: {
      type: String,
      default: 'title',
    },
    itemsLimit: {
      type: Number,
      default: null,
    },
    choicesLimit: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      question: this.value,
    }
  },

  methods: {
    add(key) {
      this.question[key].push({ type: 'matrix' })
    },

    remove(key, index) {
      this.question[key].splice(index, 1)
    },
  },
})
</script>

<template>
  <div
    class="form__matrix"
    :data-testid="$testId('competency-form-matrix')"
  >
    <div>
      <h3 class="modal-form-box-title mt-5">{{ $tc('global:topic', 2) }}</h3>

      <InputField
        v-for="(item, index) in question.items"
        :key="index"
        v-model.trim="item[itemProperty]"
        :label="$t('global:form.title')"
        :validation="validation.items.$each[index][itemProperty]"
        :counter="150"
        :disabled="!canWrite('courses')"
        dark
      >
        <Action
          v-if="question.items.length > 1 && canEdit"
          slot="button"
          :title="$t('global:exclude')"
          type="button"
          icon="close"
          @click="remove('items', index)"
        />
      </InputField>

      <Action
        v-if="canEdit && (!itemsLimit || question.items.length < itemsLimit)"
        :text="$t('global:add.topic.2')"
        class="text-right"
        type="button"
        dark
        flat
        @click="add('items')"
      />
    </div>

    <div>
      <h3 class="modal-form-box-title mt-5">{{ $tc('global:column', 2) }}</h3>

      <InputField
        v-for="(choice, index) in question.choices"
        :key="index"
        v-model.trim="choice[itemProperty]"
        :label="$t('global:form.column.name')"
        :validation="validation.choices.$each[index][itemProperty]"
        :counter="35"
        :disabled="!canWrite('courses')"
        dark
      >
        <Action
          v-if="question.choices.length > 2 && canEdit"
          slot="button"
          :title="$t('global:exclude')"
          type="button"
          icon="close"
          @click="remove('choices', index)"
        />
      </InputField>

      <Action
        v-if="canEdit && (!choicesLimit || question.choices.length < choicesLimit)"
        :text="$t('global:add.column')"
        type="button"
        dark
        flat
        @click="add('choices')"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import './FormMatrix.scss';
</style>
