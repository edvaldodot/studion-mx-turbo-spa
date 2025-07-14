<script>
import Icon from '../Icon'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'UploadFile',
  components: {
    Icon,
    ValidationMessage,
  },
  props: {
    value: {
      type: FileList,
      default: () => null,
    },
    label: {
      type: String,
      default: () => null,
    },
    hint: {
      type: String,
      default: () => null,
    },
    showAppendInner: {
      type: Boolean,
      default: () => true,
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    hideErrorDetails: {
      type: Boolean,
      default: () => false,
    },
    required: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    model() {
      return this.value
    },
    componentId() {
      return `upload-file-${this._uid}`
    },
    classes() {
      return {
        '--disabled': this.disabled,
        '--error': this.validation.$error,
      }
    },
    getFilesNames() {
      if (this.model) {
        const filesQuantity = Array.from(this.model)

        if (filesQuantity.length > 1) {
          return this.$tc(
            'library:card.folder.files',
            filesQuantity.length > 1 ? filesQuantity.length : 0,
            {
              num: filesQuantity.length,
            }
          )
        }

        return this.model[0].name
      }

      return null
    },
    filesMoreOne() {
      if (this.model) {
        return Array.from(this.model).length > 0
      }

      return false
    },
    labelButtonAdd() {
      return this.filesMoreOne
        ? this.$t('global:upload.change.file')
        : this.$t('global:upload.add.file')
    },
  },
  methods: {
    handlerInput(event) {
      const { files } = event.target
      this.$emit('input', files)
    },
    addFile() {
      this.$refs.inputFile.click()
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('upload-file')"
    :class="['upload-file', classes]"
  >
    <label class="upload-file__label">
      {{ label }}
      <span
        v-show="required"
        class="upload-file__required"
      >
        *
      </span>
    </label>
    <div class="upload-file__wrapper">
      <div class="upload-file__prepend">
        <slot name="prepend" />
      </div>
      <div class="upload-file__inner">
        <div class="upload-file__prepend-inner">
          <slot name="prepend-inner" />
        </div>
        <input
          type="text"
          class="upload-file__input"
          v-bind="$attrs"
          readonly
          :value="getFilesNames"
        />
        <input
          :id="componentId"
          ref="inputFile"
          type="file"
          hidden
          v-bind="$attrs"
          v-on="{ ...$listeners, input: (event) => handlerInput(event) }"
        />
        <div
          v-show="showAppendInner"
          class="upload-file__append-inner"
        >
          <slot name="append-inner" />
        </div>
      </div>
      <div class="upload-file__append">
        <slot name="append">
          <button
            class="upload-file__add"
            :disabled="disabled"
            @click="addFile"
          >
            {{ labelButtonAdd }}
          </button>
        </slot>
      </div>
    </div>
    <div
      v-if="!hideErrorDetails"
      class="upload-file__hint"
    >
      {{ hint }}
    </div>
    <ValidationMessage :validation="validation" />
  </div>
</template>

<style lang="scss">
@import 'UploadFile.scss';
</style>
