<script>
import commonMixin from './mixins/commonMixin'

import InputField from '@/components/general/InputField'
import TextEditor from '@/components/general/TextEditor'
import Checkbox from '@/components/general/Checkbox'
import RadioColors from '@/components/shared/RadioColors'

import CustomDatePickerVue from '../components/CustomDatePicker'

export default {
  name: 'CalendarForm',

  components: {
    CustomDatePickerVue,
    InputField,
    TextEditor,
    Checkbox,
    RadioColors,
  },

  mixins: [commonMixin],

  data() {
    return {
      maxLength: 100,
    }
  },
}
</script>

<template>
  <div class="calendar-form">
    <CustomDatePickerVue
      :accessibility="accessibility"
      :value="value"
      :validation="validation"
    />

    <InputField
      v-model.trim="value.title"
      :label="$t('global:form.title')"
      :counter="maxLength"
      :validation="validation.title"
      :dark="accessibility"
      :hint="!value.isHidden ? $t('mediation.actions:hint.title') : ''"
      :disabled="!canWrite('mediation_plan') || value.isHidden"
    />

    <div
      v-show="!value.isHidden"
      :class="{ 'theme-dark': accessibility }"
    >
      <p class="form-item-description">
        {{ $t('global:form.description') }}
      </p>

      <TextEditor
        ref="textField"
        v-model="value.message"
        :counter="1500"
        :disabled="!canWrite('mediation_plan')"
        :writable="canWrite('mediation_plan')"
        :rows="20"
        :validation="validation.message"
      />

      <Checkbox
        v-model="value.meta.allUsers"
        :items="[{ value: true, label: $t('global:form.all') }]"
        switch-type
        :dark="accessibility"
        :disabled="!canWrite('mediation_plan')"
      />

      <RadioColors
        :value="value.meta"
        :validation="validation.meta"
        :dark="accessibility"
        :disabled="!canWrite('mediation_plan')"
      />
    </div>
  </div>
</template>
