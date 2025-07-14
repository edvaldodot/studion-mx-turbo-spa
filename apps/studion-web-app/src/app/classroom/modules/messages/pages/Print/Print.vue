<script>
import { mapActions, mapState } from 'vuex'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { format, parseISO } from 'date-fns'

import config from '@/config'
import Icon from '@/components/general/Icon'
import Logo from '@/components/general/Logo'

const { WHITE_LABEL } = config

export default {
  name: 'classroomMessagesPrint',
  components: {
    Icon,
    Logo
  },
  data () {
    return {
      format: format,
      parseISO: parseISO,
      message: {
        sender: {
          image: null,
          name: null
        },
        id: null,
        conversation: []
      }
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account']),
    isWhiteLabel () {
      return WHITE_LABEL
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptMessageRetrieval'
    ]),
    parseRecipients (recipients) {
      return recipients.map(({ name }) => {
        return name
      }).join(', ')
    },
    getFlatMessageSet (interaction) {
      const mainThread = {
        sender: {
          image: interaction.message.userData.image,
          name: interaction.message.userData.name || 'Unknown'
        },
        date: this.formatDate(interaction.creationTime),
        datetime: interaction.creationTime,
        subject: interaction.message.subject,
        content: interaction.message.body,
        id: interaction.message.id,
        interaction_id: interaction.id,
        trash: interaction.trash,
        bookmarked: interaction.bookmarked,
        attachments: interaction.message.attachments.attachments,
        recipients: this.parseRecipients(interaction.message.filters.filters),
        conversation: []
      }

      if (!interaction.relatedInteractions.length) {
        return mainThread
      }

      mainThread.conversation = interaction.relatedInteractions.map((interaction) => {
        return {
          sender: {
            image: interaction.message.userData.image,
            name: interaction.message.userData.name || 'Unknown'
          },
          date: format(parseISO(interaction.creationTime), 'dd/MM/yyyy'),
          datetime: interaction.creationTime,
          content: interaction.message.body,
          id: interaction.message.id,
          interaction_id: interaction.id,
          attachments: interaction.message.attachments.attachments,
          recipients: this.parseRecipients(interaction.message.filters.filters),
          conversation: []
        }
      })

      return mainThread
    },
    getFileTypeIcon (mimeType) {
      let alias = this.getAliasFileTypes(mimeType)
      return alias ? 'file-' + alias : 'file'
    },
    getAliasFileTypes (mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })
      return currentFileType ? currentFileType.alias : null
    },
    buildPage () {
      document.body.classList.add('print')
      const { session_uuid, interaction_id } = this.$route.params // eslint-disable-line camelcase

      this.setFetching(true)
      this.attemptMessageRetrieval({ sessionUuid: session_uuid, interactionId: interaction_id })
        .then(({ data }) => {
          this.setFetching(false)
          this.message = this.getFlatMessageSet(data)
          this.$nextTick(() => {
            setTimeout(() => {
              window.print()
            }, 500)
          })
        }).finally(() => {
          this.setFetching(false)
        })
    }
  },
  created () {
    setTimeout(() => this.buildPage(), 100)
    this.$emit('change-header', {
      hideHeader: true
    })
  },
  beforeRouteLeave (to, from, next) {
    this.$emit('change-header', {})
  }
}
</script>

<template>
  <div class="print-email" v-if="message.id">
    <logo :theme="$theme" v-if="!isWhiteLabel"></logo>
    <h1 class="message-title">{{ message.subject }}</h1>
    <div class="message" v-for="(messageItem, index) in message.conversation" :key="`message-${index}`">
      <div class="message-info">
        <div class="message-info-names">
          <span class="message-info-sender">{{ $t('classroom.messages.view:info.from') }} {{ messageItem.sender.name }}</span>
          <span class="message-info-recipients">{{ $t('classroom.messages.view:info.to') }} {{ messageItem.recipients }}</span>
        </div>
        <div class="message-info-datetime">
          <span class="message-info-date">{{ formatDate(messageItem.datetime) }}</span>
          <span class="message-info-time">{{ formatDate(messageItem.datetime, 'shortTime') }}</span>
        </div>
      </div>
      <div class="message-content editor-content" v-html="messageItem.content"></div>
      <template v-if="messageItem.attachments.length > 0">
        <div class="message-attachments">
          <p class="message-attachments-title">{{ $t('classroom.messages.print:info.attachment') }}</p>
          <div class="message-attachment-item" v-for="(attachment, index) in messageItem.attachments" :key="index">
            <icon class="message-attachment-item-icon" :name="getFileTypeIcon(attachment.mimeType)"/>
            <span class="message-attachment-item-text">{{ attachment.name }}</span>
          </div>
        </div>
      </template>
    </div>
    <div class="message">
      <div class="message-info">
        <div class="message-info-names">
          <span class="message-info-sender">{{ $t('classroom.messages.view:info.from') }} {{ message.sender.name }}</span>
          <span class="message-info-recipients">{{ $t('classroom.messages.view:info.to') }} {{ message.recipients }}</span>
        </div>
        <div class="message-info-datetime">
          <span class="message-info-date">{{ format(parseISO(message.datetime), 'dd/MM/yyyy') }}</span>
          <span class="message-info-time">{{ format(parseISO(message.datetime), 'HH:mm') }}</span>
        </div>
      </div>
      <div class="message-content editor-content" v-html="message.content"></div>
      <template v-if="message.attachments.length > 0">
        <div class="message-attachments">
          <p class="message-attachments-title">{{ $t('classroom.messages.print:info.attachment') }}</p>
          <div class="message-attachment-item" v-for="(attachment, index) in message.attachments" :key="index">
            <icon class="message-attachment-item-icon" :name="getFileTypeIcon(attachment.mimeType)"/>
            <span class="message-attachment-item-text">{{ attachment.name }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">@import "~@/app/classroom/modules/messages/styles.scss";</style>
