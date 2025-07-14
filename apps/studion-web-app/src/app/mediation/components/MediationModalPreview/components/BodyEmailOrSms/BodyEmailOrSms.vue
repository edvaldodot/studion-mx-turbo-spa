<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { formatFileSize } from '@/support/utils/storageUnit'
import { fileTypes } from '@/domains/library/support/fileTypes'

import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'BodyEmailOrSms',

  components: {
    Icon,
  },

  props: {
    type: {
      type: String,
      default: '',
    },
    item: {
      type: Object,
      default: () => {},
    },
  },

  computed: {},

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptDownloadMessageAttachment']),
    formatFileSize,
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
  },
})
</script>

<template>
  <div
    v-if="item"
    class="email-content"
  >
    <div
      class="email-content-body"
      v-html="item.message"
    ></div>
    <div
      v-if="type === 'email'"
      class="email-content-footer"
    >
      <div
        v-for="(file, index) in item.attachments"
        :key="index"
        class="content-footer__attachments"
      >
        <Icon
          :name="getFileTypeIcon(file.mimetype)"
          class="message-card-attachment-type"
          wrapper
        />
        <span class="message-card-attachment-name">{{ file.filename }}</span>
        <span class="message-card-attachment-size">{{ formatFileSize(file.filesize) }}</span>
        <Icon
          name="download"
          class="message-card-attachment-btn"
          wrapper
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.email-content {
  display: flex;
  flex-direction: column;
  padding: 45px 7px 40px 43px;
  border-radius: 8px;
  border-top: 6px solid #139ba8;
  background: #ffffff;
  width: 100%;

  .email-content-body {
    font-size: 16px;
    ol,
    ul {
      padding-left: 1.5em;
    }

    ol {
      list-style: decimal;
    }

    ul {
      list-style: disc;
    }

    a {
      text-decoration: underline;
    }
  }
  .email-content-footer {
    display: flex;
    margin: 20px 0;
    .content-footer__attachments {
      background: #f2f2f2;
      height: 40px;
      margin-right: 10px;
      .message-card-attachment-icon {
        position: absolute;
        top: 10px;
        right: 170px;
        color: var(--black-700);
      }

      .message-card-attachment-type {
        margin-right: 5px;
        float: left;
      }
      .message-card-attachment-name {
        font-family: var(--font-family);
        font-weight: bold;
        font-size: 1.4em;
        float: left;
        line-height: 40px;
        width: 170px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 5px;
      }
      .message-card-attachment-size {
        font-weight: 300;
        font-size: 1.4em;
        float: left;
        line-height: 40px;
        margin-right: 10px;
        width: 50px;
        text-align: right;
      }

      .message-card-attachment-btn {
        float: left;
        color: var(--primary-500);
      }
    }
  }
}
</style>
