<script>
import { defineComponent } from 'vue'
import config from '@/config'

import { mapState, mapActions } from 'vuex'
import { formatFileSize } from '@/support/utils/storageUnit'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { required } from 'vuelidate/lib/validators'
import sumAllFileSizes from '@/support/customValidators/sumAllFileSizes'

import filesizeValidator from '@/support/customValidators/filesizeValidator'
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'
import debounce from 'lodash/debounce'
import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import FileField from '@/components/general/FileField'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import Checkbox from '@/components/general/Checkbox'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Tips from '@/components/general/Tips'
import ValidationMessage from '@/components/general/ValidationMessage'
import SessionsModal from '../../../../../management/pages/ManagementSessions/components/SessionsModal'
import TagSelector from '@/components/general/TagSelector'
import Datepicker from '@/components/general/Datepicker'

const TextEditor = () => import('@/components/general/TextEditor')

const ALLOWED_IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

const { EMAIL_ATTACHMENT_LIMIT_SIZE_MB } = config
export const EMAIL_ATTACHMENT_SIZE_BYTES = (EMAIL_ATTACHMENT_LIMIT_SIZE_MB || 5) * 1024 * 1024

export default defineComponent({
  name: 'ClassroomMessagesNew',
  components: {
    Action,
    Autocomplete,
    FileField,
    Icon,
    InputField,
    TextEditor,
    ValidationMessage,
    Checkbox,
    Tips,
    Dropdown,
    DropdownLink,
    SessionsModal,
    TagSelector,
    Datepicker,
  },

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  props: {
    isManagement: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      interactionId: null,
      currentMessage: null,
      tabLinks: [
        {
          text: 'classroom.messages:tab.link.1',
          location: {
            name: 'classroom.messages.inbox',
          },
        },
        {
          text: 'classroom.messages:tab.link.2',
          location: {
            name: 'classroom.messages.sent',
          },
        },
        {
          text: 'classroom.messages:tab.link.3',
          location: {
            name: 'classroom.messages.draft',
          },
        },
        {
          text: 'classroom.messages:tab.link.4',
          location: {
            name: 'classroom.messages.trash',
          },
        },
      ],
      formData: {
        message_id: null,
        to: [],
        subject: '',
        body: '',
        attachment: [],
        attachments: [],
        parent: null,
        scheduled_time: '',
        hide_people: false,
      },

      openSessionsModal: false,
      selectedSessionsIds: [],

      searchValue: '',
      tempFile: null,
      tempMediaFile: null,
      scheduleDatepicker: false,
      autocompleteSearching: false,
      autocompleteItems: [],
      groupsList: [],
      loaded: [],
      allowedImageTypes: ALLOWED_IMAGE_TYPES,
      tags: null,
    }
  },
  validations: {
    formData: {
      to: {
        required,
        userNotFound() {
          return !this.$v.formData.to.required.$invalid && this.searchValue.length === 0
        },
      },
      subject: {
        required,
      },
      body: {
        required,
      },
      attachments: {
        maxSizeAllowed: sumAllFileSizes(EMAIL_ATTACHMENT_SIZE_BYTES),
      },
    },
    tempFile: {
      filesize: filesizeValidator(EMAIL_ATTACHMENT_SIZE_BYTES),
    },
    tempMediaFile: {
      filesize: filesizeValidator(EMAIL_ATTACHMENT_SIZE_BYTES),
      mimeType: mimeTypeValidator(ALLOWED_IMAGE_TYPES),
    },
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('classroom:message')
    },

    sendDraft() {
      return !this.isManagement
    },

    sessionUuid() {
      return this.$route.params.session_uuid
    },
    isNew() {
      return this.$route.name === 'classroom.messages.new'
    },
    isDraft() {
      return this.$route.name === 'classroom.messages.edit.draft'
    },
    isReply() {
      return this.$route.name === 'classroom.messages.reply'
    },
    isForward() {
      return this.$route.name === 'classroom.messages.forward'
    },
    messageTitle() {
      if (this.isDraft) {
        return 'classroom.messages.new:message.title.edit'
      } else if (this.isReply) {
        return 'classroom.messages.new:message.title.reply'
      } else if (this.isForward) {
        return 'classroom.messages.new:message.title.forward'
      } else {
        return 'classroom.messages.new:message.title.new'
      }
    },
    to() {
      return this.formData.to
    },
    subject() {
      return this.formData.subject
    },
    body() {
      return this.formData.body
    },
    attachment() {
      return this.formData.attachment
    },
    scheduled_time() {
      return this.formData.scheduled_time
    },
    hide_people() {
      return this.formData.hide_people
    },
    filteredGroups() {
      if (!this.formData.to) return this.groupsList

      return this.groupsList.filter((group) => {
        const index = this.formData.to.findIndex((item) => item.type === group.type)
        return index === -1
      })
    },
    showHidePeopleCheckbox() {
      return this.formData.to.length >= 2 || this.groupsList.length !== this.filteredGroups.length
    },
  },

  watch: {
    to: debounce(function () {
      if (this.sendDraft) this.draft('to', this.formData.to)
    }, 500),
    subject: debounce(function () {
      if (this.sendDraft) this.draft('subject', this.formData.subject)
    }, 1000),
    body: debounce(function () {
      if (this.sendDraft) this.draft('body', this.formData.body)
    }, 1000),
    attachment: function () {
      if (this.sendDraft) this.draft('attachments', this.formData.attachment)
    },
    scheduled_time: function () {
      if (this.sendDraft) this.draft('scheduled_time', this.formData.scheduled_time)
    },
    hide_people: function () {
      if (this.sendDraft) this.draft('hide_people', this.formData.hide_people)
    },
  },

  created() {
    this.getTagsEmail(this.sessionUuid)
    setTimeout(() => this.buildPage(), 100)
    this.$emit('change-header', {
      tabLinks: this.tabLinks,
      customClasses: { messages: true },
    })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptMessageRetrieval',
      'attemptSendMessage',
      'attemptSendMessageMultipleSessions',
      'attemptMessageSubject',
      'attemptManagementMessageSubject',
      'attemptDraftMessageCreation',
      'attemptDraftMessageUpdate',
      'attemptMessageAttachmentCreation',
      'attemptDeleteMessageAttachment',
      'attemptDownloadMessageAttachment',
      'attemptInteractionTrash',
      'attemptUploadMediaFile',
      'attemptGetEmailTags',
    ]),
    validateAutoComplete(inputVal) {
      this.searchValue = inputVal
    },
    sendMessage() {
      this.$v.formData.$touch()
      if (!this.$v.formData.$invalid) {
        if (this.isManagement && this.selectedSessionsIds <= 0) {
          this.setFeedback({ message: this.$t('classroom.messages:min.sessions'), type: 'error' })
          return
        }

        this.setFetching(true)
        const request = this.isManagement
          ? this.attemptSendMessageMultipleSessions({
              data: { ...this.formData, sessions_ids: [...this.selectedSessionsIds] },
            })
          : this.attemptSendMessage({
              sessionUuid: this.sessionUuid,
              data: this.formData,
            })

        request
          .then(() => {
            this.setFeedback({ message: this.$t('classroom.message:feedback.message.sent') })

            if (this.isManagement) {
              this.$router.push({
                name: 'management.messages.index',
              })
            } else {
              this.$router.push({
                name: 'classroom.messages.inbox',
                params: { session_uuid: this.sessionUuid },
              })
            }
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    draft(field, value) {
      if (!this.loaded[field]) {
        this.loaded[field] = true
        return
      }
      let data = {}
      data[field] = value
      if (this.formData.message_id) {
        data.message_id = this.formData.message_id
        this.updateDraft(data)
      } else {
        if (field === 'attachments') {
          this.setFetching(true)
        }
        this.createDraft(data)
      }
    },
    createDraft(data) {
      this.attemptDraftMessageCreation({
        sessionUuid: this.sessionUuid,
        data: data,
      })
        .then((response) => {
          this.formData.message_id = response.data.message.id
          this.interactionId = response.data.id
          if (data.attachments) {
            this.formData.attachments = response.data.message.attachments.attachments
            this.loaded['attachments'] = false
            this.formData.attachment = []
          }
        })
        .catch(({ response }) => {
          const responseMessage = response && response.data && response.data.message

          if (responseMessage && responseMessage === 'invalid_tags') {
            this.setFeedback({ message: this.$t('classroom.message:feedback.message.invalid_tag') })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    updateDraft(data) {
      if (data.attachments) {
        return this.addAttachment(data)
      }
      this.attemptDraftMessageUpdate({
        sessionUuid: this.sessionUuid,
        data: data,
      }).catch(({ response }) => {
        const responseMessage = response && response.data && response.data.message

        if (responseMessage && responseMessage === 'invalid_tags') {
          this.setFeedback({ message: this.$t('classroom.message:feedback.message.invalid_tag') })
        }
      })
    },
    addAttachment(data) {
      this.setFetching(true)
      this.attemptMessageAttachmentCreation({
        sessionUuid: this.sessionUuid,
        data: data,
      })
        .then((response) => {
          this.formData.attachments = response.data.attachments
          this.loaded['attachments'] = false
          this.formData.attachment = []
        })
        .catch(({ response }) => {
          this.formData.attachment = []
          this.setFeedback({
            message: this.$t(
              `classroom.message:feedback.message.attachment.error:${response.data.message.replace(
                /_/g,
                '.'
              )}`
            ),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openFile() {
      this.$refs.file.$refs.label.click()
    },
    openMediaFile() {
      this.$refs.mediaFile.$refs.label.click()
    },
    addFile() {
      if (!this.$v.tempFile.$invalid) {
        let fileArray = Array.from(this.tempFile)
        this.formData.attachment.push(...fileArray)
        this.tempFile = null
      } else {
        this.setFeedback({
          message: this.$t('classroom.message:feedback.message.attachment.error:invalid.file.size'),
          type: 'error',
        })
      }
    },
    addMediaFile() {
      if (!this.$v.tempMediaFile.$invalid) {
        this.setFetching(true)
        this.attemptUploadMediaFile({ file: this.tempMediaFile })
          .then(({ data }) => {
            let imgAttrs = { 'max-width': 'max-width: 100%' }
            this.$refs.textField.addImageUrl(data.url, imgAttrs)
            this.tempMediaFile = null
            this.$refs.mediaFile.clear()
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else if (!this.$v.tempMediaFile.mimeType) {
        this.setFeedback({
          message: this.$t('classroom.message:feedback.message.attachment.error:invalid.file.type'),
          type: 'error',
        })
      } else {
        this.setFeedback({
          message: this.$t('classroom.message:feedback.message.attachment.error:invalid.file.size'),
          type: 'error',
        })
      }
    },
    removeFile(file, index) {
      this.setFetching(true)
      this.attemptDeleteMessageAttachment({
        sessionUuid: this.sessionUuid,
        messageId: this.formData.message_id,
        filename: file.filename,
      })
        .then(() => {
          this.formData.attachments.splice(index, 1)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    formatFileSize,
    trashMessages() {
      if (!this.interactionId) {
        return this.goBack()
      }
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)
      this.attemptInteractionTrash({ sessionUuid, action: 'trash', data: [this.interactionId] })
        .then(() => {
          this.goBack()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    getFileTypeIcon(mimeType) {
      let alias = this.getAliasFileTypes(mimeType)
      return alias ? 'file-' + alias : 'file'
    },
    getAliasFileTypes(mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })
      return currentFileType ? currentFileType.alias : null
    },
    openScheduleDatepicker() {
      this.scheduleDatepicker = true
      this.$nextTick(() => {
        this.$refs.datepicker.datepicker.altInput.focus()
      })
    },
    closeScheduleDatepicker() {
      this.scheduleDatepicker = false
      this.formData.scheduled_time = null
    },
    goBack() {
      if (this.isManagement) {
        this.$router.push({ name: 'management.messages.index' })
      } else if (this.isDraft) {
        this.$router.push({
          params: { session_uuid: this.sessionUuid },
          name: 'classroom.messages.draft',
        })
      } else {
        this.$router.push({
          params: { session_uuid: this.sessionUuid },
          name: 'classroom.messages.inbox',
        })
      }
    },
    printMessage() {
      let routeData = this.$router.resolve({
        name: 'classroom.messages.print',
        params: {
          session_uuid: this.$route.params.session_uuid,
          interaction_id: this.$route.params.interaction_id,
        },
      })
      window.open(window.location.origin + routeData.href, '_blank')
    },
    isSearching(value) {
      this.autocompleteSearching = value !== ''
    },

    /**
     *
     * @param {Object[]} options
     */
    setSubjectAutocompleteItems(options = []) {
      this.autocompleteItems = options.map((item, index) => {
        item.onlySearchable = item.type === 'users'

        if (this.equalsProfile('student') && item.profile) {
          item.name = `${item.name} | ${
            item.profile.name === 'Admin' ? this.$t('global:admin') : item.profile.name
          }`
        }

        item.id = index
        return item
      })
    },

    buildPage() {
      if (this.isManagement) {
        this.setFetching(true)
        this.attemptManagementMessageSubject()
          .then(({ data }) => {
            this.groupsList = data.groups
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else {
        this.setFetching(true)
        this.attemptMessageSubject({ sessionUuid: this.sessionUuid })
          .then(({ data }) => {
            this.setSubjectAutocompleteItems(data.users)
            this.groupsList = data.groups
          })
          .finally(() => {
            this.setFetching(false)
          })
      }

      if (!this.isNew && !this.isManagement) {
        this.interactionId = this.$route.params.interaction_id
        this.setFetching(true)
        this.attemptMessageRetrieval({
          sessionUuid: this.sessionUuid,
          interactionId: this.interactionId,
        })
          .then(({ data }) => {
            this.currentMessage = data
            this.formData.message_id = data.message.id
            this.formData.interaction_id = data.id
            this.formData.parent = data.message.parent
            this.formData.body = data.message.body || ''
            this.formData.to =
              data.message.filters && data.message.filters.filters
                ? data.message.filters.filters
                : []
            this.formData.attachments = data.message.attachments
              ? data.message.attachments.attachments
              : []
            this.formData.scheduled_time = data.message.scheduledTime
              ? this.formatDate(data.message.scheduledTime, 'long')
              : null
            if (this.formData.scheduled_time) {
              this.openScheduleDatepicker()
            }
            this.formData.attachment = []
            this.formData.subject = (data.message.subject || '').slice(0, 130)
            this.formData.hide_people = data.message.hidePeople
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else {
        this.loaded['to'] = true
        this.loaded['subject'] = true
        this.loaded['body'] = true
        this.loaded['attachments'] = true
        this.loaded['scheduled_time'] = true
        this.loaded['hide_people'] = true
      }
    },
    addToReceiver(value) {
      this.formData.to.push(value)
    },
    getTagsEmail(sessionUuid) {
      if (!sessionUuid) return

      this.setFetching(true)
      this.attemptGetEmailTags(sessionUuid)
        .then(({ data }) => {
          this.tags = this.getTagsWithBrackets(data)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    getTagsWithBrackets(value) {
      const tagList = Object.keys(value).map((key) => `{{${key}}}`)

      return tagList
    },

    /**
     * @description For messages created via my management, retrieves the first tag from the selected sessions.
     * @param {Object} params
     * @param {Array<Number>} params.selectedIds
     * @returns {void}
     */
    updateSessions(data) {
      if (!data.selectedIds.length) return

      this.getTagsEmail(data.selectedSessions[0].uuid)
      this.selectedSessionsIds = [...data.selectedIds]
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('classroom-messages-new')"
    class="inner-content"
  >
    <div class="mt-4 center">
      <Action
        :text="$t('global:back')"
        type="button"
        icon="keyboard_backspace"
        icon-size="small"
        class="btn-back text-color"
        @click="goBack()"
      />

      <h2 class="message-title">{{ $t(messageTitle) }}</h2>

      <div
        v-if="notEqualsProfile('student')"
        class="message-template"
      >
        <p v-html="$t('classroom.messages.new:message.template')"></p>
      </div>

      <div class="message-card">
        <div class="message-card-options">
          <Action
            icon="delete"
            type="button"
            @click="trashMessages()"
          />
        </div>

        <form
          class="message-card-form"
          autocomplete="off"
          @submit.prevent="sendMessage"
        >
          <div class="flex align-items-center message-card-section people-select">
            <Autocomplete
              v-model="formData.to"
              class="w-full"
              :floating-label="false"
              :label="$t(isManagement ? 'global:filters' : 'global:form.to')"
              :items="autocompleteItems"
              :validation="$v.formData.to"
              :max-value="-1"
              :dark="accessibility"
              :disable-input="isManagement"
              option-property="name"
              hide-input-append
              hide-details
              :nullable="false"
              tip
              @internalSearch="validateAutoComplete"
            />
            <Dropdown
              v-if="filteredGroups.length"
              icon="add-user"
              classes="add-people p-1 mt-4"
              right
            >
              <DropdownLink
                v-for="item in filteredGroups"
                :key="item.name"
                :text="item.name"
                disable-uppercase
                @click="addToReceiver(item)"
              >
                <template #onhover>
                  <Tips
                    v-if="!$media.mobile"
                    shadow
                  >
                    <template #tip>
                      <h3>{{ item.name }}</h3>
                      <p class="text-color">{{ item.description }}</p>
                    </template>
                  </Tips>
                </template>
              </DropdownLink>
            </Dropdown>
          </div>

          <div
            v-show="showHidePeopleCheckbox"
            v-if="notEqualsProfile('student')"
            class="message-card-section"
          >
            <Checkbox
              v-model="formData.hide_people"
              :data-testid="$testId('checkbox--hide')"
              :items="[{ value: true, label: $t('classroom.messages.new:hide') }]"
            />
          </div>

          <div class="message-card-section">
            <InputField
              v-model="formData.subject"
              :floating-label="false"
              :label="$t('global:form.subject')"
              :validation="$v.formData.subject"
              :dark="accessibility"
              :max="130"
              :counter="130"
              hide-details
            />
          </div>

          <div class="message-card-section text-editor-container">
            <FileField
              ref="file"
              v-model="tempFile"
              :label="$t('global:form.attach.file')"
              :validation="$v.tempFile"
              :dark="accessibility"
              class="hidden"
              @input="addFile"
            />

            <FileField
              ref="mediaFile"
              v-model="tempMediaFile"
              :label="$t('global:form.attach.file')"
              :validation="$v.tempMediaFile"
              :dark="accessibility"
              :accept="allowedImageTypes.join()"
              class="hidden"
              @input="addMediaFile"
            />

            <TextEditor
              ref="textField"
              v-model="formData.body"
              :max-rows="20"
              :rows="12"
              :floating-label="false"
              :label="$t('global:form.message')"
              :validation="$v.formData.body"
              hide-details
              image-enabled
              class="m-4"
            >
              <template slot="attachment">
                <div class="message-card-attachment">
                  <div
                    v-for="(file, index) in isManagement
                      ? formData.attachment
                      : formData.attachments"
                    :key="index"
                    class="message-card-attachment-item"
                  >
                    <div class="message-card-attachment-inner">
                      <Icon
                        :name="getFileTypeIcon(file.mimeType)"
                        class="message-card-attachment-type"
                        wrapper
                      />

                      <span class="message-card-attachment-name">{{ file.name }}</span>

                      <span class="message-card-attachment-size">
                        {{ formatFileSize(file.size) }}
                      </span>

                      <Action
                        class="message-card-attachment-btn"
                        type="button"
                        icon="delete"
                        @click="removeFile(file, index)"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="form-item mb-2"
                  :class="{ 'theme-dark': accessibility }"
                >
                  <ValidationMessage :validation="$v.formData.attachments" />
                </div>
              </template>

              <Action
                slot="attach"
                type="button"
                icon="attach_file"
                @click="openFile"
              />

              <Action
                slot="embed-image"
                type="button"
                icon="file-image"
                @click="openMediaFile"
              />
              <template slot="before-tools">
                <TagSelector
                  v-if="tags && tags.length && notEqualsProfile('student')"
                  :tags="tags"
                  :title="$t('text.editor:tag.selector.title')"
                  tag-label="mediation.actions:tag.item:"
                  @tag="$refs.textField.addTag($event)"
                />
              </template>
              <template slot="actions-tools">
                <div class="actions-tools-container">
                  <div
                    v-if="isManagement"
                    class="sessions__select"
                  >
                    <Action
                      v-if="hasWriteAccess"
                      :dark="accessibility"
                      :text="$t('bind.sessions:modal.title')"
                      type="button"
                      flat
                      @click="openSessionsModal = true"
                    />
                  </div>
                  <Action
                    v-if="!scheduleDatepicker && (hasWriteAccess || isStudent())"
                    :dark="accessibility"
                    :text="$t('global:form.send.schedule')"
                    class="btn-schedule"
                    type="button"
                    flat
                    @click="openScheduleDatepicker()"
                  />
                  <Datepicker
                    v-if="scheduleDatepicker"
                    ref="datepicker"
                    v-model="formData.scheduled_time"
                    :label="$t('global:form.date')"
                    :validation="$v.formData.scheduled_time"
                    :floating-label="false"
                    :dark="accessibility"
                    time
                  />
                  <Action
                    v-if="hasWriteAccess || isStudent()"
                    :dark="accessibility"
                    :text="$t('global:form.send')"
                    type="button"
                    submit
                    secondary
                  />
                </div>
              </template>
            </TextEditor>
          </div>
        </form>
      </div>
    </div>

    <SessionsModal
      v-if="openSessionsModal"
      :ids="selectedSessionsIds"
      filter-tool="messageTool"
      @close="openSessionsModal = false"
      @submit="updateSessions"
    />
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/messages/styles.scss';
</style>
