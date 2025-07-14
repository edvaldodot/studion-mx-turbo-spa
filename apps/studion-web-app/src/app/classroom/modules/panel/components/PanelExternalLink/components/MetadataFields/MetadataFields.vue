<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import Button from '@/components/general/Button'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'

export default defineComponent({
  name: 'MetadataFields',

  components: {
    Button,
    InputField,
    SelectField,
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
    validation: {
      type: Object,
      required: true,
    },
    canDelete: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['update:data', 'remove'],

  data() {
    return {
      fetching: false,
      additionalFieldItems: [],
    }
  },

  computed: {
    localData: {
      get() {
        return this.data
      },
      set(value) {
        this.$emit('update:data', value)
      },
    },
  },

  created() {
    this.fetchMetadataFields()
  },

  methods: {
    ...mapActions(['setFetching', 'attemptGetAdditionalFields', 'setFeedback']),

    async fetchMetadataFields() {
      this.fetching = true
      try {
        const response = await this.attemptGetAdditionalFields({
          sessionUuid: this.$route.params.session_uuid,
        })

        this.additionalFieldItems = response.map((item) => ({
          value: item.metaId,
          text: item.name,
        }))
      } catch {
        this.setFeedback({
          message: this.$t('global:error'),
        })
      } finally {
        this.fetching = false
      }
    },
  },
})
</script>

<template>
  <div class="display-flex-meta-data-fields">
    <InputField
      v-model="localData.name"
      class="input-meta-data-fields"
      :label="$t('global:form.name')"
      :placeholder="$t('tool.external.link.type.placeholder.input.1')"
      :validation="validation.name"
      required
      dark
    />
    <SelectField
      v-model="localData.type"
      class="input-meta-data-fields"
      :label="$t('global:form.type')"
      :placeholder="$t('tool.external.link.type.placeholder.selector.1')"
      :validation="validation.type"
      :items="[
        {
          value: 'meta',
          text: $t('tool.external.link.type.selector.1'),
        },
        {
          value: 'textual',
          text: $t('tool.external.link.type.selector.2'),
        },
      ]"
      required
      dark
    />
    <InputField
      v-if="localData.type === 'textual'"
      v-model="localData.value"
      class="input-meta-data-fields"
      :label="$t('global:form.section.content')"
      :validation="validation.value"
      required
      dark
    />

    <SelectField
      v-if="localData.type === 'meta'"
      v-model="localData.value"
      class="input-meta-data-fields"
      :label="$t('global:form.section.content')"
      :placeholder="$t('tool.external.link.type.placeholder.selector.2')"
      :validation="validation.value"
      :items="additionalFieldItems"
      required
      dark
    />
    <div
      v-if="canDelete"
      class="pt-4"
    >
      <Button
        class="btn-meta-data-fields"
        :inner-prepend-icon="'delete'"
        variant="text"
        @click="$emit('remove')"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import 'MetadataFields.scss';
</style>
