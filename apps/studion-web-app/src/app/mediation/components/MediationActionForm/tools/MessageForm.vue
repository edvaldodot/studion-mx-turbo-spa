<script>
import commonMixin from './mixins/commonMixin'

import { EMAIL_ATTACHMENT_SIZE_BYTES } from '../../../shared'
import { mapState } from 'vuex'

import InputField from '@/components/general/InputField'
import TagSelector from '@/components/general/TagSelector'
import TimeField from '@/components/general/TimeField'
import TextEditorMedia from '@/components/shared/TextEditorMedia'

export default {
  name: 'MessageForm',

  components: {
    InputField,
    TagSelector,
    TimeField,
    TextEditorMedia,
  },

  mixins: [commonMixin],

  data() {
    return {
      PM_EMAIL_ATTACHMENT_SIZE_BYTES: EMAIL_ATTACHMENT_SIZE_BYTES,
    }
  },

  computed: {
    ...mapState({
      tags: (state) => state.Mediation.tags.email,
    }),

    availableTags() {
      return this.tags.map((tag) => tag.value)
    },
  },
}
</script>

<template>
  <div class="flex flex-column gap-2">
    <TimeField
      v-if="!value.isHidden"
      v-model.trim="value.meta.triggerTime"
      :validation="validation.meta.triggerTime"
      :label="$t('mediation.actions:time_trigger')"
      :dark="accessibility"
      :disabled="!canWrite('mediation_plan')"
      placeholder="00:00"
    />

    <h2
      v-if="!value.isHidden"
      class="my-3"
    >
      {{ $t('global:form.message') }}
    </h2>

    <InputField
      v-if="!value.isHidden"
      v-model.trim="value.title"
      :validation="validation.title"
      :label="$t('global:form.subject')"
      :disabled="!canWrite('mediation_plan')"
      :dark="accessibility"
      :counter="200"
    />

    <div v-if="!value.isHidden">
      <slot
        v-if="$mediationAiEnabled()"
        name="action-template"
      />

      <TextEditorMedia
        ref="TextEditorMedia"
        v-model="value"
        :label="$t('global:form.message')"
        :validation="validation.message"
        :item="'message'"
        :rows="{ min: 12, max: 20 }"
        :writable="canWrite('mediation_plan')"
        :disabled="!canWrite('mediation_plan')"
        :max-file-size="PM_EMAIL_ATTACHMENT_SIZE_BYTES"
        :enable-ai="$mediationAiEnabled()"
        :ai-prompt="templateAction ? templateAction.promptAi : null"
        attach-file
        embed-image
        image-enabled
        no-fixed
        @prompt="$emit('prompt', $event)"
        @settings="$emit('settings', true)"
      >
        <template #before-tools>
          <TagSelector
            :tags="availableTags"
            :title="$t('text.editor:tag.selector.title')"
            tag-label="mediation.actions:tag.item:"
            @tag="$refs.TextEditorMedia.$refs.textField.addTag($event)"
          />
        </template>
      </TextEditorMedia>
    </div>
  </div>
</template>
