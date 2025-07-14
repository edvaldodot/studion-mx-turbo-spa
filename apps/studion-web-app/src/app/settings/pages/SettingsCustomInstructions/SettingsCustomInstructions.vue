<template>
  <div
    :data-testid="$testId('settings-custom-instructions')"
    class="main-content  settings settings-custom-instructions"
  >
    <ContentHeader
      :title="$t('settings:tab.instructions')"
      :description="$t('settings.instructions:header')"
      :tag="$t('settings:header.title')"
      class="header-admin"
    />

    <div class="old-center clearfix mt-5">
      <h3 class="mb-2">{{ $t('settings.instructions:add') }}</h3>

      <CustomInstructionsForm
        v-model="formData"
        on-server
        optional-value
        @create="create($event)"
        @edit="edit($event)"
        @remove="remove($event)"
      />

      <div class="mt-4">
        <EmptyMessage v-if="formData.customInstructions.length === 0">
          <h3>{{ $t('settings.instructions:empty') }}</h3>
        </EmptyMessage>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import ContentHeader from '@/components/general/ContentHeader'
import CustomInstructionsForm from '@/app/settings/pages/SettingsCustomInstructions/components/CustomInstructionsForm'
import EmptyMessage from '@/components/general/EmptyMessage'

export default defineComponent({
  name: 'SettingsCustomInstructions',

  components: {
    ContentHeader,
    CustomInstructionsForm,
    EmptyMessage,
  },

  data() {
    return {
      formData: {
        customInstructions: [],
      },
    }
  },

  created() {
    this.setFetching(true)
    this.attemptGetCustomInstructions()
      .then(({ data }) => {
        this.formData.customInstructions = data.data.map((ci) => {
          return [ci.tag, ci.value, ci.id || null]
        })
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'attemptGetCustomInstructions',
      'attemptCreateCustomInstruction',
      'attemptUpdateCustomInstruction',
      'attemptDeleteCustomInstruction',
      'setFeedback',
      'setFetching',
    ]),

    formatPayload(event) {
      return {
        tag: event.name,
        value: event.value,
      }
    },

    create(event) {
      this.setFetching(true)
      this.attemptCreateCustomInstruction(this.formatPayload(event))
        .then(({ data }) => {
          this.formData.customInstructions.push([data.tag, data.value, data.id])
          this.setFeedback({ message: this.$t('settings.instructions:create.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('settings.instructions:create.error') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    edit(event) {
      if (!event.editMode)
        return this.setFeedback({ message: this.$t('settings.instructions:edit.duplicated') })

      this.setFetching(true)
      this.attemptUpdateCustomInstruction({
        data: this.formatPayload({ name: event.toEdit[0], value: event.newValue }),
        id: event.toEdit[2],
      })
        .then(() => {
          const editedIndex = this.formData.customInstructions.findIndex(
            (ci) => ci[0] === event.toEdit[0]
          )
          this.$set(this.formData.customInstructions[editedIndex], 1, event.newValue)
          this.setFeedback({ message: this.$t('settings.instructions:edit.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('settings.instructions:edit.error') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    remove(event) {
      this.setFetching(true)
      this.attemptDeleteCustomInstruction(event[2])
        .then(() => {
          const idx = this.formData.customInstructions.findIndex((ci) => ci[2] === event[2])
          this.formData.customInstructions.splice(idx, 1)
          this.setFeedback({ message: this.$t('settings.instructions:remove.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('settings.instructions:remove.error') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<style lang="scss">
@import './SettingsCustomInstructions.scss';
</style>
