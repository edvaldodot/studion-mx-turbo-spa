<script>
import { defineComponent } from 'vue'
import { EMAIL_ATTACHMENT_SIZE_BYTES } from '../../../shared'
import { mapState } from 'vuex'
import commonMixin from './mixins/commonMixin'

import InputField from '@/components/general/InputField'
import TagSelector from '@/components/general/TagSelector'
import TimeField from '@/components/general/TimeField'
import TextEditorMedia from '@/components/shared/TextEditorMedia'
import ValidationMessage from '@/components/general/ValidationMessage'

export default defineComponent({
  name: 'EmailForm',

  components: {
    InputField,
    TagSelector,
    TimeField,
    TextEditorMedia,
    ValidationMessage,
  },

  mixins: [commonMixin],

  data() {
    return {
      PM_EMAIL_ATTACHMENT_SIZE_BYTES: null,
      maxLength: 130,
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

  created() {
    this.PM_EMAIL_ATTACHMENT_SIZE_BYTES = EMAIL_ATTACHMENT_SIZE_BYTES
  },

  methods: {
    addTagToTextEditorMedia(tag) {
      this.$refs.TextEditorMedia.addText(tag.value)
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('email-form')"
    class="mediation-email-form flex flex-column gap-3"
  >
    <TimeField
      v-if="!value.isHidden"
      v-model.trim="value.meta.triggerTime"
      :validation="validation.meta.triggerTime"
      :label="$t('mediation.actions:time_trigger')"
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

    <div v-if="!value.isHidden">
      <div class="content-title">
        <h3 class="my-2">{{ $t('global:form.message') }}</h3>
        <span class="text-base" v-html="$t('mediation.actions:body.disclaimer')"></span>
      </div>

      <slot
        v-if="$mediationAiEnabled()"
        name="action-template"
      />

      <TextEditorMedia
        ref="TextEditorMedia"
        v-model="value"
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

      <div
        class="form-item"
        :class="{ 'theme-dark': accessibility }"
      >
        <ValidationMessage :validation="validation.files" />
      </div>
    </div>
  </div>
</template>
