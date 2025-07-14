<script>
import { required } from 'vuelidate/lib/validators'
import config from '@/config'

import Action from '@/components/general/Action'
import FileField from '@/components/general/FileField'
import HorizontalTopicList from '@/components/general/HorizontalTopicList'
import Modal from '@/components/general/Modal'

import { DEFAULT_MIN_PASSWORD_SIZE } from '@/support/utils/passwordSize'

import { TOPICS } from '@/app/community/shared'
const { CUSTOM_PASSWORD_REQUIREMENTS } = config

export default {
  name: 'ModalSendSheet',
  components: {
    Action,
    FileField,
    HorizontalTopicList,
    Modal,
  },
  props: {
    showBatch: {
      type: Boolean,
    },
    formBatchData: {
      type: Object,
      required,
    },
    backBtn: {
      type: String,
    },
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    sampleBtnText: {
      type: String,
    },
    confirmBtnText: {
      type: String,
      required,
    },
    validation: {
      required,
    },
    topics: {
      type: String,
      required,
    },
    isBatchEditing: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    batchEntityType() {
      return this.topics
    },
    helperTopicsText() {
      const batchOperation = this.isBatchEditing ? 'edit' : 'add'
      const textHandle = {
        default: (text) => text,
        password: this.mountCustomPasswordHint,
      }

      const topics = TOPICS[this.batchEntityType][batchOperation].map((topic) => {
        return { text: textHandle[topic.handler || 'default'](topic.text) }
      })

      return topics
    },

    hasCustomPassword() {
      return (
        this.$isEnabledFeature('password_requirements') &&
        CUSTOM_PASSWORD_REQUIREMENTS &&
        CUSTOM_PASSWORD_REQUIREMENTS.ENABLED
      )
    },
  },
  methods: {
    backButton() {
      this.$emit('backButton')
    },
    downloadTemplate() {
      this.$emit('downloadTemplate')
    },
    addNewMedia() {
      this.$emit('uploadSheet')
    },
    mountCustomPasswordHint(defaultText) {
      if (this.hasCustomPassword) {
        const { LOWER_CASE, UPPER_CASE, NUMBER, SPECIAL_CHAR, SIZE } = CUSTOM_PASSWORD_REQUIREMENTS

        let customTextArr = [this.$t('global:password.force.hint.header')]
        if (LOWER_CASE) customTextArr.push(`${this.$t('global:password.force.hint.custom.1')};`)
        if (UPPER_CASE) customTextArr.push(`${this.$t('global:password.force.hint.custom.2')};`)
        if (NUMBER) customTextArr.push(`${this.$t('global:password.force.hint.custom.3')};`)
        if (SPECIAL_CHAR) customTextArr.push(`${this.$t('global:password.force.hint.custom.4')};`)
        if (SIZE)
          customTextArr.push(`${this.$t('global:password.force.hint.custom.5', { text: SIZE })};`)
        else
          customTextArr.push(
            `${this.$t('global:password.force.hint.1', { size: DEFAULT_MIN_PASSWORD_SIZE })};`
          )

        return customTextArr.join('<br>')
      }

      return defaultText
    },
  },
}
</script>
<template>
  <modal
    :active="showBatch"
    :cancel="false"
    is-page
    class="modal-send-sheet"
  >
    <Action
      :text="backBtn ? backBtn : $t('global:back')"
      class="btn-back text-color"
      icon="keyboard_backspace"
      icon-size="medium"
      type="button"
      @click="backButton"
    ></Action>
    <span
      class="modal-subtitle"
      v-if="subTitle"
      >{{ subTitle }}</span
    >
    <h2
      class="modal-title text-color"
      v-if="title"
    >
      {{ title }}
    </h2>
    <div
      class="modal-description text-color"
      v-if="description"
    >
      <p
        class="text-color"
        v-html="description"
      ></p>
    </div>
    <HorizontalTopicList
      :width="batchEntityType === 'user' ? '1300px' : '100%'"
      :topicItems="helperTopicsText"
      dark
    />
    <div class="flex justify-content-center">
      <Action
        v-if="sampleBtnText"
        :text="sampleBtnText"
        fixed-width
        large
        secondary
        type="button"
        @click="downloadTemplate()"
      ></Action>
    </div>
    <div class="modal-form">
      <form @submit.prevent="addNewMedia">
        <file-field
          :label="$t('global:form.attach.file')"
          :validation="validation.formBatchData.file"
          v-model="formBatchData.file"
        ></file-field>
        <div class="form-submit text-center">
          <Action
            :text="confirmBtnText"
            fixed-width
            large
            secondary
            submit
            type="button"
          ></Action>
        </div>
      </form>
    </div>
  </modal>
</template>

<style lang="scss">
@import './ModalSendSheet.scss';
</style>
