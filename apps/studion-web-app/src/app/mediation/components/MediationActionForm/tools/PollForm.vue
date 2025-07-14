<script>
import commonMixin from './mixins/commonMixin'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Radio from '@/components/general/Radio'
import TextareaField from '@/components/general/TextareaField'

import CustomDatePickerVue from '../components/CustomDatePicker'

export default {
  name: 'PollForm',

  components: {
    Action,
    InputField,
    Radio,
    TextareaField,
    CustomDatePickerVue,
  },

  mixins: [commonMixin],

  data() {
    return {
      alternativeOptions: [
        {
          value: 0,
          label: this.$t('global:form.single.choice'),
        },
        {
          value: 1,
          label: this.$t('global:form.multiple.choice'),
        },
      ],
    }
  },

  created() {
    if (this.value && !this.value.id) {
      this.value.meta.multiplesChoices = null
      this.value.meta.choices = ['', '']
    }
  },

  methods: {
    addAnswer() {
      this.value.meta.choices.push('')
    },

    removeAnswer(index) {
      this.value.meta.choices.splice(index, 1)
    },
  },
}
</script>

<template>
  <div class="form-mediation__poll">
    <custom-date-picker-vue
      :accessibility="accessibility"
      :value="value"
      :validation="validation"
    />

    <input-field
      v-model.trim="value.title"
      :label="$t('global:form.title')"
      :counter="maxLength"
      :validation="validation.title"
      :dark="accessibility"
      :hint="!value.isHidden ? $t('mediation.actions:hint.title') : ''"
      :disabled="!canWrite('mediation_plan')"
    />

    <div v-show="!value.isHidden">
      <input-field
        v-model.trim="value.message"
        :label="$t('global:form.question')"
        :counter="maxLength"
        :validation="validation.message"
        :dark="accessibility"
        :disabled="!canWrite('mediation_plan')"
      />

      <radio
        v-model="value.meta.multiplesChoices"
        horizontal
        :description="$t('global:form.alternatives')"
        :validation="validation.meta.multiplesChoices"
        :items="alternativeOptions"
        :dark="accessibility"
        :disabled="!canWrite('mediation_plan')"
      />

      <textarea-field
        v-for="(_, index) in value.meta.choices"
        :key="index"
        v-model="value.meta.choices[index]"
        :label="$t('global:form.alternative.number', { num: index + 1 })"
        :validation="validation.meta.choices.$each[index]"
        :counter="250"
        :dark="accessibility"
        :disabled="!canWrite('mediation_plan')"
        auto-grow
      >
        <action
          v-if="value.meta.choices.length > 2 && canWrite('mediation_plan')"
          slot="button"
          type="button"
          icon="close"
          @click="removeAnswer(index)"
        />
      </textarea-field>

      <action
        v-if="value.meta.choices.length < 20 && canWrite('mediation_plan')"
        :text="$t('global:form.alternative.add')"
        :dark="accessibility"
        type="button"
        flat
        @click="addAnswer()"
      />
    </div>
  </div>
</template>
