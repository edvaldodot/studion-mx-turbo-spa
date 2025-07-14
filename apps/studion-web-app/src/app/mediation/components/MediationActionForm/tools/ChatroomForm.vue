<script>
import commonMixin from './mixins/commonMixin'

import InputField from '@/components/general/InputField'
import Upload from '@/components/general/Upload'
import Checkbox from '@/components/general/Checkbox'
import CustomDatePickerVue from '../components/CustomDatePicker'

export default {
  name: 'ChatroomForm',

  components: {
    CustomDatePickerVue,
    InputField,
    Upload,
    Checkbox,
  },

  mixins: [commonMixin],

  data () {
    return {
      maxLength: 100
    }
  },

  created () {
    const message = this.value && this.value.message
    if (message) return
    this.value.message = new Date().toLocaleString()
  }
}
</script>

<template>
  <div class="forum-form">
    <custom-date-picker-vue
      :accessibility="accessibility"
      :value="value"
      :validation="validation"
    />

    <Checkbox
      v-if="!value.isHidden"
      v-model="value.meta.showTimeLeft"
      :items="[{ value: true, label: $t('classroom.chat:modal.time.left') }]"
      :disabled="!canWrite('mediation_plan')"
      :dark="accessibility"
      switch-type
    />

    <input-field
      v-model.trim="value.title"
      class="my-2"
      :label="$t('classroom.chat:modal.form.title')"
      :counter="maxLength"
      :validation="validation.title"
      :dark="accessibility"
      :hint="!value.isHidden ? $t('mediation.actions:hint.title:chat') : ''"
      :disabled="!canWrite('mediation_plan') || value.isHidden"
    />

    <div v-if="!value.isHidden" class="mt-4">
      <upload
        :dark="accessibility"
        v-model="value.meta.image"
        :icon="'image-multiple'"
        :label="$t('global:upload.add.image')"
        :description="$t('classroom.chat:modal.form.image')"
        :width="460"
        :cropper="true"
        :disabled="!canWrite('mediation_plan')"
      />
    </div>
  </div>
</template>
