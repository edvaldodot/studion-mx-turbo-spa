<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { EMAIL_ATTACHMENT_SIZE_BYTES, TRANSMISSION_TYPES } from '../../../../shared'
import { required, requiredIf } from 'vuelidate/lib/validators'

import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import TextEditor from '@/components/general/TextEditor'
import TagSelector from '@/components/general/TagSelector'
import Loading from '@/components/general/Loading'
import Icon from '@/components/general/Icon'
import Tips from '@/components/general/Tips'

export default defineComponent({
  name: 'ActionTemplateCreate',

  components: {
    Action,
    ActionBar,
    ContentHeader,
    InputField,
    SelectField,
    TextEditor,
    TagSelector,
    Loading,
    Icon,
    Tips,
  },

  mixins: [formScrollValidationMixin],

  data() {
    return {
      EMAIL_ATTACHMENT_SIZE_BYTES: EMAIL_ATTACHMENT_SIZE_BYTES,
      transmissionTypes: [],
      formData: {
        titleTemplate: null,
        titleMessage: null,
        message: '',
        promptAi: null,
        transmissionType: null,
      },
      tags: [],
      aiOutput: null,
      promptLoading: false,
      setup: false,
      customInstructionTags: null,
    }
  },

  validations: {
    formData: {
      titleTemplate: { required },
      transmissionType: { required },
      titleMessage: {
        required: requiredIf(function (nestedModel) {
          return nestedModel.transmissionType !== 'sms'
        }),
      },
      message: {
        required: requiredIf(function (nestedModel) {
          return !nestedModel.promptAi
        }),
      },
    },
  },

  computed: {
    ...mapState({
      stateTags: (state) => state.Mediation.tags,
    }),

    allowedTransmissionTypes() {
      const allowedTT = ['email', 'sms', 'announcement', 'topic', 'message']
      return TRANSMISSION_TYPES.filter((type) => allowedTT.includes(type.value))
    },

    availableTags() {
      return this.stateTags && this.stateTags.email && this.stateTags.email.map((tag) => tag.value)
    },

    isEditing() {
      return this.$route.meta.isEditing
    },

    emptyTagsInUse() {
      if (!this.formData.promptAi) return
      const regex = /\{\{\{([^{}]+)\}\}\}/g
      const tags = this.formData.promptAi.match(regex)
      if (!tags) return null
      const filteredTags = tags.filter((tag) => this.emptyTags.includes(tag))
      return [...new Set(filteredTags)].toString().replaceAll(',', ', ')
    },

    emptyTags() {
      return this.customInstructionTags.filter((tag) => tag.value === '').map((tag) => tag.tag)
    },

    titleText() {
      if (this.formData.transmissionType === 'email') {
        return {
          label: this.$t('mediation.templates:create.form.subject'),
          hint: this.$t('mediation.templates:create.form.subject.hint'),
        }
      }

      return {
        label: this.$t('global:form.title'),
        hint: this.$t('mediation.actions:hint.title'),
      }
    },
  },

  watch: {
    'formData.transmissionType': {
      handler(v1, v2) {
        if (v1 !== v2 && this.setup) {
          this.formData.message = ''
          this.formData.titleMessage = null
          this.$v.$reset()
        }
      },
    },
  },

  mounted() {
    this.transmissionTypes = this.allowedTransmissionTypes

    if (!this.stateTags.length) this.attemptGetMediationTags()

    this.setFetching(true)
    this.attemptGetCustomInstructions()
      .then(({ data }) => {
        this.customInstructionTags = data.data || []
      })
      .finally(() => {
        if (this.isEditing) {
          this.setupEdit()
        } else {
          this.setup = true
        }

        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'attemptGetMediationTags',
      'attemptCreateMediationTemplate',
      'attemptUpdateMediationTemplate',
      'attemptGetMediationTemplate',
      'attemptCallAIPrompt',
      'attemptGetCustomInstructions',
      'setFetching',
      'setFeedback',
    ]),

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.$nextTick(() => this.scrollToInputError())
        return
      }

      this.setFetching(true)

      const submitAction = this.isEditing
        ? this.attemptUpdateMediationTemplate
        : this.attemptCreateMediationTemplate

      const actionName = this.isEditing ? 'edit' : 'create'

      submitAction(this.formData)
        .then(() => {
          this.setFeedback({ message: this.$t(`mediation.templates:${actionName}.success`) })
          this.$router.push({ name: 'template.actions.list' })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t(`mediation.templates:${actionName}.error`) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * @desc Setup edit function to get mediation template by id and set form data.
     */
    setupEdit() {
      this.setFetching(true)
      this.attemptGetMediationTemplate(this.$route.params.id)
        .then(({ data }) => {
          this.formData = {
            ...this.formData,
            ...data,
          }
        })
        .finally(() => {
          this.setup = true
          this.setFetching(false)
        })
    },

    replaceTags(value) {
      return value.replace(/<[^>]*>/g, '').replace(/{{{([^{}]+)}}}/g, (match) => {
        const tag = this.customInstructionTags.find((ci) => ci.tag === match)
        return tag ? tag.value : match
      })
    },

    sendPrompt() {
      const payload = { prompt: this.replaceTags(this.formData.promptAi) }

      this.promptLoading = true
      this.attemptCallAIPrompt(payload)
        .then(({ data }) => {
          this.aiOutput = data.answer
        })
        .catch(({ response }) => {
          const error = response.data && response.data.message
          const hint = response.data && response.data.hint && response.data.hint.errors

          const errorList = [
            'ai_invalid_key_request',
            'ai_provider_not_allowed',
            'ai_insufficient_quota',
            'ai_model_not_found_or_no_access',
            'ai_invalid_request',
          ]

          if (errorList.includes(error)) {
            this.setFeedback({ message: this.$t('mediation.actions:ai.error') })
          }

          if (hint.text === 'string_expected_or_length_exceeded') {
            this.setFeedback({ message: this.$t(`mediation.actions:ai.${hint.text}`) })
          }
        })
        .finally(() => {
          this.promptLoading = false
        })
    },

    copy() {
      if (!this.aiOutput) return
      navigator.clipboard.writeText(this.aiOutput)
      this.setFeedback({ message: this.$t('global:clipboard.copy') })
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('action-template-create')">
    <ContentHeader
      :title="!isEditing ? $t('mediation.templates:create.title') : formData.titleTemplate"
      light-theme
      fixed
    >
      <Action
        slot="back"
        :text="$t('global:cancel')"
        type="button"
        class="btn-back text-color"
        icon="keyboard_backspace"
        @click="$router.push({ name: 'template.actions.list' })"
      />
      <ActionBar
        slot="actionbar"
        profile
      />
      <template slot="buttons">
        <Action
          v-if="canWrite('mediation_plan')"
          :text="$t('global:form.save')"
          type="button"
          flat
          @click="submit"
        />
      </template>
    </ContentHeader>

    <div class="mb-5">
      <div class="mt-4">
        <div class="text-center">
          <h2>{{ $t('mediation.templates:create.header.title') }}</h2>
          <p class="text-color">{{ $t('mediation.templates:create.header.description') }}</p>
        </div>
      </div>

      <form
        class="flex flex-column gap-4 mt-5 w-12 xl:w-4 mx-auto"
        @submit.prevent="submit"
      >
        <InputField
          v-model="formData.titleTemplate"
          :label="$t('mediation.templates:create.form.title')"
          :hint="$t('mediation.templates:create.form.title.hint')"
          :validation="$v.formData.titleTemplate"
          :counter="120"
        />

        <SelectField
          v-model="formData.transmissionType"
          :label="$tc('mediation.actions:action')"
          :items="transmissionTypes"
          :validation="$v.formData.transmissionType"
        />

        <InputField
          v-if="formData.transmissionType && formData.transmissionType !== 'sms'"
          v-model="formData.titleMessage"
          :label="titleText.label"
          :hint="titleText.hint"
          :validation="$v.formData.titleMessage"
          :counter="formData.transmissionType === 'email' ? 75 : 100"
        />

        <div class="input-title">
          <h3>{{ $t('mediation.templates:create.form.message.title') }}</h3>
          <p class="text-color">{{ $t('mediation.templates:create.form.message.description') }}</p>
        </div>

        <TextEditor
          v-if="formData.transmissionType && formData.transmissionType !== 'sms'"
          ref="messageInput"
          v-model="formData.message"
          :placeholder="$t('global:form.message')"
          :rows="12"
          :max-file-size="EMAIL_ATTACHMENT_SIZE_BYTES"
          :validation="$v.formData.message"
          class="mt-2"
          embed-image
          image-enabled
          hide-details
          attach-file
          no-fixed
        >
          <template #before-tools>
            <TagSelector
              v-if="availableTags.length && formData.transmissionType === 'email'"
              :tags="availableTags"
              tag-label="mediation.actions:tag.item:"
              @tag="$refs.messageInput.addTag($event)"
            />
          </template>
        </TextEditor>

        <InputField
          v-else
          v-model="formData.message"
          :label="$t('global:form.message')"
          :validation="$v.formData.message"
          :counter="140"
        />

        <div class="input-title">
          <h3>{{ $t('mediation.templates:create.form.ia.title') }}</h3>
          <p class="text-color">{{ $t('mediation.templates:create.form.ia.description') }}</p>
        </div>

        <TextEditor
          v-if="setup && !!customInstructionTags"
          ref="aiInput"
          v-model="formData.promptAi"
          :rows="12"
          :formats="['spanEmbed']"
          class="mt-2 ai-input"
          hide-details
          no-fixed
        >
          <template #before-tools>
            <TagSelector
              v-if="customInstructionTags.length"
              :tags="customInstructionTags.map((ci) => ci.tag)"
              :tag-values="customInstructionTags.map((ci) => ci.value)"
              @tag="$refs.aiInput.addTag($event)"
            />

            <div class="flex align-items-center gap-3">
              <Tips>
                <template #tip>
                  <h3>{{ $t('mediation.templates:create.form.ia.tip.title') }}</h3>
                  <p>
                    {{ $t('mediation.templates:create.form.ia.tip.description') }}
                  </p>
                </template>
              </Tips>

              <div class="flex align-items-center">
                <Icon
                  :title="$t('global:copy')"
                  name="copy"
                  wrapper
                  @click="copy"
                />
                <Action
                  :text="$t('mediation.templates:create.form.ia.tip.test')"
                  :disabled="!formData.promptAi || promptLoading"
                  type="button"
                  flat
                  @click="sendPrompt"
                />
              </div>
            </div>

            <Tips>
              <template #tip>
                <h3>{{ $t('mediation.templates:create.form.ia.tip.title') }}</h3>
                <p>{{ $t('mediation.templates:create.form.ia.tip.description') }}</p>
              </template>
            </Tips>
          </template>
        </TextEditor>

        <div
          v-if="aiOutput || promptLoading"
          class="ia-cmd mb-5"
        >
          <div class="ia-output">
            <Loading v-if="promptLoading" />
            <p v-else>{{ aiOutput }}</p>
          </div>
        </div>

        <div
          v-if="setup && customInstructionTags.length && emptyTagsInUse"
          class="tag-validator mt-3"
        >
          <Icon
            name="alert-circle"
            size="small"
          />
          {{
            $tc(
              'mediation.templates:create.form.ia.tip.validation.test',
              emptyTagsInUse.split(',').length,
              { tag: emptyTagsInUse }
            )
          }}
        </div>

        <div class="text-center">
          <Action
            :text="$t('global:save')"
            class="mt-5"
            type="button"
            fixed-width
            secondary
            large
            submit
          />
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss">
@import './ActionTemplateCreate.scss';
</style>
