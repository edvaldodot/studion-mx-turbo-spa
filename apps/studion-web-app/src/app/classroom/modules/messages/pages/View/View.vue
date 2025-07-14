<script>
import { mapActions, mapState } from 'vuex'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { formatFileSize } from '@/support/utils/storageUnit'

import orderBy from 'lodash/orderBy'
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import TopBar from '@/components/general/TopBar'

export default {
  name: 'classroomMessagesView',
  components: {
    Action,
    Icon,
    TopBar,
  },
  data() {
    return {
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
      message: {
        sender: {
          image: null,
          name: null,
        },
        id: null,
        conversation: [],
      },
      lastMessageOpened: null,
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    orderedRelatedInteractions: function () {
      return orderBy(this.message.conversation, 'datetime')
    },
    hasWriteAccess() {
      return this.canWrite('classroom:message')
    },

    backButtonLabel() {
      return this.$route.params.management
        ? this.$t('management:back.to.management')
        : this.$t('global:back')
    },
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptMessageRetrieval',
      'attemptInteractionTrash',
      'attemptDeleteMessage',
      'attemptDownloadMessageAttachment',
      'attemptBookmarkMessage',
      'attemptCreateReplyDraftMessage',
      'attemptCreateForwardDraftMessage',
    ]),
    formatFileSize,
    downloadFile(file, interactionId) {
      file.interaction_id = interactionId
      this.setFetching(true)
      this.attemptDownloadMessageAttachment({
        sessionUuid: this.$route.params.session_uuid,
        data: file,
      })
        .then(() => {
          this.setFetching(false)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    setBookmark() {
      const sessionUuid = this.$route.params.session_uuid
      const interactionId = this.message.interaction_id

      this.attemptBookmarkMessage({ sessionUuid, interactionId }).then(() => {
        this.message.bookmarked = !this.message.bookmarked
      })
    },
    openMessage(index) {
      if (this.lastMessageOpened !== null) {
        return
      }
      this.message.conversation[index].open = !this.message.conversation[index].open
      this.$refs.content[index].style.height = this.message.conversation[index].open
        ? this.$refs.content[index].scrollHeight + 'px'
        : '0px'
    },
    replyMessage() {
      let sessionUuid = this.$route.params.session_uuid
      let interactionId = this.message.interaction_id
      this.setFetching(true)
      this.attemptCreateReplyDraftMessage({ sessionUuid, interactionId })
        .then(({ data }) => {
          this.$router.push({
            params: {
              session_uuid: this.$route.params.session_uuid,
              interaction_id: data.id,
              type: 'reply',
            },
            name: 'classroom.messages.reply',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    forwardMessage() {
      let sessionUuid = this.$route.params.session_uuid
      let interactionId = this.message.interaction_id
      this.setFetching(true)
      this.attemptCreateForwardDraftMessage({ sessionUuid, interactionId })
        .then(({ data }) => {
          this.$router.push({
            params: {
              session_uuid: this.$route.params.session_uuid,
              interaction_id: data.id,
              type: 'reply',
            },
            name: 'classroom.messages.forward',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    printMessage() {
      let routeData = this.$router.resolve({
        name: 'classroom.messages.print',
        params: {
          session_uuid: this.$route.params.session_uuid,
          interaction_id: this.message.interaction_id,
        },
      })
      window.open(window.location.origin + routeData.href, '_blank')
    },
    removeMessage() {
      if (this.message.trash) {
        return this.deleteMessage()
      }
      return this.trashMessage()
    },
    trashMessage() {
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)
      this.attemptInteractionTrash({
        sessionUuid,
        action: 'trash',
        data: [this.message.interaction_id],
      })
        .then(() => {
          this.$router.push({
            name: 'classroom.messages.inbox',
            params: {
              session_uuid: this.$route.params.session_uuid,
            },
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    deleteMessage() {
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)
      this.attemptDeleteMessage({ sessionUuid, interactions: [this.message.interaction_id] })
        .then(() => {
          this.$router.push({
            name: 'classroom.messages.inbox',
            params: {
              session_uuid: this.$route.params.session_uuid,
            },
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    recover() {
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)
      this.attemptInteractionTrash({
        sessionUuid,
        action: 'recover',
        data: [this.message.interaction_id],
      })
        .then(() => {
          this.$router.push({
            name: 'classroom.messages.inbox',
            params: {
              session_uuid: this.$route.params.session_uuid,
            },
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    cardInfoButtonText(recipient, hidePeople) {
      if (hidePeople) return this.$t('classroom.messages.view:info')
      return (
        this.$t('classroom.messages.view:info.to') + ' ' + this.parseMinimalRecipients(recipient)
      )
    },
    parseRecipients(recipients) {
      if (!recipients) {
        return ''
      }
      return recipients
        .map((item) => {
          return item.name
        })
        .join(', ')
    },
    parseMinimalRecipients(recipients) {
      if (!recipients) {
        return ''
      }
      if (recipients.length > 1) {
        return this.$t('classroom.messages.view:info.recipient', {
          name: recipients[0].name,
          length: recipients.length - 1,
        })
      } else {
        return recipients[0].name
      }
    },
    getFlatMessageSet(interaction) {
      const mainThread = {
        attachments: interaction.message.attachments.attachments,
        sender: {
          image: interaction.message.userData.image,
          name: interaction.message.userData.name || '',
        },
        date: this.formatDate(interaction.creationTime, 'long'),
        dateScheduled: interaction.message.scheduledTime
          ? this.formatDate(interaction.message.scheduledTime, 'long')
          : '',
        datetime: interaction.creationTime,
        status: interaction.message.status,
        subject: interaction.message.subject,
        content: interaction.message.body,
        id: interaction.message.id,
        hidePeople: interaction.message.hidePeople,
        interaction_id: interaction.id,
        trash: interaction.trash,
        bookmarked: interaction.bookmarked,
        recipient: interaction.message.filters.filters,
        conversation: [],
        informationPopup: false,
      }

      if (!interaction.relatedInteractions.length) {
        return mainThread
      }

      mainThread.conversation = interaction.relatedInteractions.map((interaction) => {
        return {
          attachments: interaction.message.attachments.attachments,
          sender: {
            image: interaction.message.userData.image,
            name: interaction.message.userData.name || 'Unknown',
          },
          recipient: interaction.message.filters.filters,
          date: this.formatDate(interaction.creationTime, 'long'),
          datetime: interaction.creationTime,
          content: interaction.message.body,
          hidePeople: interaction.message.hidePeople,
          id: interaction.message.id,
          interaction_id: interaction.id,
          conversation: [],
          informationPopup: false,
          open: false,
        }
      })

      return mainThread
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
    openInfo(item) {
      this.closeInfo()
      item.informationPopup = true
      this.lastMessageOpened = item
    },
    closeInfo(event) {
      if (this.lastMessageOpened) {
        this.lastMessageOpened.informationPopup = false
        this.lastMessageOpened = null
      }
    },
    buildPage() {
      const { session_uuid, interaction_id } = this.$route.params // eslint-disable-line camelcase

      this.setFetching(true)
      this.attemptMessageRetrieval({ sessionUuid: session_uuid, interactionId: interaction_id })
        .then(({ data }) => {
          this.message = this.getFlatMessageSet(data)
        })
        // eslint-disable-next-line handle-callback-err
        .catch((error) => {
          this.setFeedback({ message: this.$t('global:access.denied') })
          this.$router.push({
            name: 'classroom.messages.inbox',
            params: {
              session_uuid: this.$route.params.session_uuid,
            },
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    backAction() {
      if (this.$route.params.management) {
        this.$router.push({ name: this.$route.params.management })
        return
      }

      this.$router.push({
        name: `classroom.messages.${this.$route.params.type}`,
        params: { session_uuid: this.$route.params.session_uuid },
      })
    },
  },
  created() {
    setTimeout(() => this.buildPage(), 100)
    this.$emit('change-header', {
      tabLinks: this.tabLinks,
      customClasses: { messages: true },
    })
  },
  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },
}
</script>

<template>
  <div class="inner-content">
    <TopBar>
      <Action
        icon="keyboard_backspace"
        :text="backButtonLabel"
        icon-size="small"
        type="button"
        flat
        @click="backAction"
      />
    </TopBar>

    <div
      class="center"
      v-if="message.id"
    >
      <div class="message-info">
        <h2 class="message-info-title">{{ message.subject }}</h2>
      </div>

      <div class="message-card">
        <div
          class="message-card-options"
          v-if="hasWriteAccess"
        >
          <action
            type="button"
            v-if="message.trash"
            :text="$t('classroom.messages:btn.trash.recover')"
            @click="recover()"
          />
          <action
            type="button"
            icon="print"
            @click="printMessage()"
          />
          <action
            type="button"
            :icon="message.trash ? 'delete-forever' : 'delete'"
            @click="removeMessage()"
          />
        </div>

        <div class="message-card-conversation">
          <template v-if="message.conversation.length">
            <div
              class="message-card-item is-retractable"
              :class="{ 'is-open': messageItem.open }"
              v-for="(messageItem, index) in orderedRelatedInteractions"
              @click="openMessage(index)"
              ref="card"
              :key="index"
            >
              <div class="message-card-header">
                <icon
                  name="keyboard_arrow_down"
                  class="message-card-item-icon"
                  wrapper
                />
                <div class="message-card-sender-info">
                  <img
                    :src="messageItem.sender.image"
                    :alt="messageItem.sender.name"
                    class="message-card-sender-image"
                    v-if="messageItem.sender.image"
                  />
                  <icon
                    name="account_circle"
                    class="message-card-sender-image-icon"
                    v-else
                  />
                  <div class="message-card-info">
                    <span class="message-card-sender-name">{{ messageItem.sender.name }}</span>
                    <div
                      class="message-card-info-recipient"
                      @click.stop="openInfo(messageItem)"
                    >
                      <span class="message-card-info-recipient-text">
                        {{ cardInfoButtonText(messageItem.recipient, messageItem.hidePeople) }}
                      </span>
                      <icon
                        class="message-card-info-recipient-icon"
                        name="arrow_drop_down"
                      />
                    </div>
                    <div
                      class="message-card-info-content"
                      :class="{ 'is-open': messageItem.informationPopup }"
                      v-click-outside="closeInfo"
                    >
                      <div class="message-card-info-item">
                        <span class="message-card-info-label">{{
                          $t('classroom.messages.view:info.from')
                        }}</span>
                        <span class="message-card-info-value">{{ messageItem.sender.name }}</span>
                      </div>
                      <div
                        v-if="!messageItem.hidePeople"
                        class="message-card-info-item"
                      >
                        <span class="message-card-info-label">{{
                          $t('classroom.messages.view:info.to')
                        }}</span>
                        <span class="message-card-info-value">{{
                          parseRecipients(messageItem.recipient)
                        }}</span>
                      </div>
                      <div class="message-card-info-item">
                        <span class="message-card-info-label">{{
                          $t('classroom.messages.view:info.date')
                        }}</span>
                        <span class="message-card-info-value">{{ messageItem.date }}</span>
                      </div>
                      <div class="message-card-info-item">
                        <span class="message-card-info-label">{{
                          $t('classroom.messages.view:info.subject')
                        }}</span>
                        <span class="message-card-info-value">{{ message.subject }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span class="message-card-date">{{ messageItem.date }}</span>
                <icon
                  class="message-card-attachment-icon"
                  name="attach_file"
                  wrapper
                  size="medium"
                  v-if="messageItem.attachments && messageItem.attachments.length > 0"
                />
              </div>
              <div
                class="message-card-content"
                ref="content"
              >
                <div
                  class="message-card-content-inner editor-content"
                  v-html="messageItem.content"
                ></div>
                <div class="message-card-attachment">
                  <div
                    class="message-card-attachment-item"
                    v-for="(file, index) in messageItem.attachments"
                    :key="index"
                  >
                    <div class="message-card-attachment-inner">
                      <icon
                        :name="getFileTypeIcon(file.mimeType)"
                        class="message-card-attachment-type"
                        wrapper
                      />
                      <span class="message-card-attachment-name">{{ file.name }}</span>
                      <span class="message-card-attachment-size">{{
                        formatFileSize(file.size)
                      }}</span>
                      <action
                        type="button"
                        icon="download"
                        @click.stop="downloadFile(file, messageItem.interaction_id)"
                        class="message-card-attachment-btn"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div class="message-card-item">
            <div class="message-card-header">
              <div class="message-card-sender-info">
                <img
                  :src="message.sender.image"
                  :alt="message.sender.name"
                  class="message-card-sender-image"
                  v-if="message.sender.image"
                />
                <icon
                  name="account_circle"
                  class="message-card-sender-image-icon"
                  v-else
                />
                <div class="message-card-info">
                  <span class="message-card-sender-name">{{ message.sender.name }}</span>
                  <div
                    class="message-card-info-recipient"
                    @click.stop="openInfo(message)"
                  >
                    <span class="message-card-info-recipient-text">
                      {{ cardInfoButtonText(message.recipient, message.hidePeople) }}
                    </span>
                    <icon
                      class="message-card-info-recipient-icon"
                      name="arrow_drop_down"
                    />
                  </div>
                  <div
                    class="message-card-info-content"
                    :class="{ 'is-open': message.informationPopup }"
                    v-click-outside="closeInfo"
                  >
                    <div class="message-card-info-item">
                      <span class="message-card-info-label">{{
                        $t('classroom.messages.view:info.from')
                      }}</span>
                      <span class="message-card-info-value">{{ message.sender.name }}</span>
                    </div>
                    <div
                      v-if="!message.hidePeople"
                      class="message-card-info-item"
                    >
                      <span class="message-card-info-label">{{
                        $t('classroom.messages.view:info.to')
                      }}</span>
                      <span class="message-card-info-value">{{
                        parseRecipients(message.recipient)
                      }}</span>
                    </div>
                    <div class="message-card-info-item">
                      <span class="message-card-info-label">{{
                        $t('classroom.messages.view:info.date')
                      }}</span>
                      <span class="message-card-info-value">{{ message.date }}</span>
                    </div>
                    <div class="message-card-info-item">
                      <span class="message-card-info-label">{{
                        $t('classroom.messages.view:info.subject')
                      }}</span>
                      <span class="message-card-info-value">{{ message.subject }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <span
                class="message-card-date"
                v-if="message.dateScheduled !== null && !$media.mobile"
                >{{ message.date }}</span
              >
              <span
                class="message-card-date"
                v-else-if="!$media.mobile"
                >{{ $t('classroom.messages:scheduled') }} {{ message.dateScheduled }}</span
              >
              <icon
                class="message-card-attachment-icon"
                name="attach_file"
                wrapper
                size="mediun"
                v-if="message.attachments && message.attachments.length > 0"
              />
            </div>

            <div class="message-card-content">
              <div
                class="message-card-content-inner editor-content"
                v-html="message.content"
              ></div>
              <div class="message-card-attachment">
                <div
                  class="message-card-attachment-item"
                  v-for="(file, index) in message.attachments"
                  :key="index"
                >
                  <div class="message-card-attachment-inner">
                    <icon
                      :name="getFileTypeIcon(file.mimeType)"
                      class="message-card-attachment-type"
                      wrapper
                    />
                    <span class="message-card-attachment-name">{{ file.name }}</span>
                    <span class="message-card-attachment-size">{{
                      formatFileSize(file.size)
                    }}</span>
                    <action
                      type="button"
                      icon="download"
                      @click="downloadFile(file, message.interaction_id)"
                      class="message-card-attachment-btn"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="message-card-footer"
          v-if="!message.trash && !message.status.scheduled && hasWriteAccess"
        >
          <img
            :src="Account.user.profile_image"
            alt=""
            v-if="Account.user.profile_image"
            class="message-card-profile-image"
          />
          <icon
            name="account_circle"
            class="message-card-profile-image-icon"
            v-else
          />
          <action
            v-if="hasWriteAccess"
            type="button"
            :text="$t('classroom.messages.view:reply')"
            @click="replyMessage()"
            flat
            :dark="accessibility"
          />
          <action
            v-if="hasWriteAccess"
            type="button"
            :text="$t('classroom.messages.view:forward')"
            @click="forwardMessage()"
            flat
            :dark="accessibility"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/messages/styles.scss';
</style>
