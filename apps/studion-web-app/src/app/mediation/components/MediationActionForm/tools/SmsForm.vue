<script>
import commonMixin from './mixins/commonMixin'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
const TextAITool = () => import('@/components/shared/TextAITool')

export default {
  name: 'SmsForm',

  components: {
    Action,
    InputField,
    TextAITool,
  },

  mixins: [commonMixin],

  data() {
    return {
      showAI: false,
    }
  },
}
</script>

<template>
  <div class="flex flex-column gap-2">
    <input-field
      v-if="!value.isHidden"
      v-model.trim="value.meta.triggerTime"
      :validation="validation.meta.triggerTime"
      :label="$t('mediation.actions:time_trigger')"
      mask="##:##"
      :hint="$t('mediation.actions:time_trigger.hint')"
      :dark="accessibility"
      :disabled="!canWrite('mediation_plan')"
    />

    <input-field
      v-model.trim="value.title"
      :label="$t('global:form.title')"
      :counter="maxLength"
      :validation="validation.title"
      :dark="accessibility"
      :hint="!value.isHidden ? $t('mediation.actions:hint.title') : ''"
      :disabled="!canWrite('mediation_plan') || value.isHidden"
    />

    <h2 class="mt-3" v-if="!value.isHidden">{{ $t('global:form.message') }}</h2>

    <slot
      v-if="$mediationAiEnabled() && !value.isHidden"
      name="action-template"
    />

    <div
      v-if="!value.isHidden"
      class="input-text-editor bg-black-50"
    >
      <InputField
        v-model.trim="value.message"
        :counter="140"
        :validation="validation.message"
        :disabled="!canWrite('mediation_plan')"
      />

      <Action
        v-if="$mediationAiEnabled()"
        icon="chatbot"
        type="button"
        @click="showAI = !showAI"
      />
    </div>

    <TextAITool
      v-if="showAI"
      :ai-prompt="templateAction ? templateAction.promptAi : null"
      @prompt="$emit('prompt', $event)"
      @settings="$emit('settings', true)"
    />
  </div>
</template>
