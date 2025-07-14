<script>
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import Checkbox from '@/components/general/Checkbox'
import TooltipSlot from '@/components/general/TooltipSlot'
import Icon from '@/components/general/Icon'

export default {
  name: 'LTIForm',

  components: {
    Checkbox,
    FormSection,
    Icon,
    InputField,
    TooltipSlot,
  },

  props: {
    asset: {
      type: Object,
      required: true,
    },

    assetValidation: {
      type: Object,
      required: true,
    },
  },
}
</script>

<template>
  <FormSection>
    <FormSection>
      <InputField
        v-model.trim="asset.urlSupplier"
        :validation="assetValidation.urlSupplier"
        :label="$t('solutions.create.classes:video.lti:url.supplier')"
        :disabled="!canWrite('courses')"
        dark
      />

      <div class="tooltip-wrapper">
        <Checkbox
          v-model="asset.newTab"
          :items="[
            {
              value: true,
              label: $t('solutions.create.classes:video.lti:url.newTab'),
            },
          ]"
          switch-type
          dark
        />

        <TooltipSlot
          :width="460"
          class="tooltip__topic"
          :arrow="!$media.mobile"
          shadow
          dark
        >
          <template #activator>
            <Icon
              class="tip__icon"
              size="small"
              name="help"
              wrapper
              dark
            />
          </template>

          <template #content>
            <p
              class="tooltip__description"
              v-html="$t('solutions.create.classes:video.lti:url.newTab:hint')"
            ></p>
          </template>
        </TooltipSlot>
      </div>
      <Checkbox
        v-model="asset.is_examination"
        :items="[
          {
            value: true,
            label: $t('solutions.create.classes:video.lti:is.examination'),
          },
        ]"
        switch-type
        dark
      />
    </FormSection>

    <InputField
      v-model.trim="asset.key"
      :validation="assetValidation.key"
      :label="$t('solutions.create.classes:video.lti:key')"
      :disabled="!canWrite('courses')"
      dark
    />

    <InputField
      v-model.trim="asset.secret"
      :validation="assetValidation.secret"
      :label="$t('solutions.create.classes:video.lti:secret')"
      :disabled="!canWrite('courses')"
      type="password"
      autocomplete="one-time-code"
      dark
    />

    <InputField
      v-model.trim="asset.contentId"
      :label="$t('solutions.create.classes:video.lti:content.id')"
      :disabled="!canWrite('courses')"
      dark
    />

    <InputField
      v-model.trim="asset.disciplineName"
      :label="$t('solutions.create.classes:video.lti:discipline.name')"
      :disabled="!canWrite('courses')"
      dark
    />
  </FormSection>
</template>

<style lang="scss">
.tooltip-wrapper {
  display: flex;
  gap: 10px;

  .tooltip {
    height: min-content;
    padding-top: 8px;
  }
}

.tooltip__description {
  font-size: 1rem;
}
</style>
