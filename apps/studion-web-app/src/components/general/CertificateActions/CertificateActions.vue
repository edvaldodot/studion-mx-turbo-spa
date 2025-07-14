<script>
import { defineComponent } from 'vue'
import Action from '../Action'
import LinkedInAction from '../LinkedInAction'

export default defineComponent({
  name: 'CertificateActions',

  components: {
    Action,
    LinkedInAction,
  },

  props: {
    isDownloaded: {
      type: [Boolean, String],
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    column: {
      type: Boolean,
      default: false,
    },
    certificateTitle: {
      type: String,
      default: '',
    },
    certificateIssuedAt: {
      type: String,
      default: '',
    },
    brokenDownloadText: {
      type: Boolean,
      default: false,
    },
    removeDownload: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    downloadText() {
      return this.isDownloaded ? this.$t('global:download.second') : this.$t('global:download')
    },
    certificateDate() {
      if (!this.certificateIssuedAt) return null
      const certificateDate = new Date(this.certificateIssuedAt)

      return {
        issueMonth: certificateDate.getMonth() + 1,
        issueYear: certificateDate.getFullYear(),
      }
    },
  },
})
</script>

<template>
  <div
    data-testid="certificate-actions"
    class="certificate__actions"
    :class="{ 'broken-download-text': brokenDownloadText && isDownloaded, 'is-column': column }"
  >
    <div class="action__download">
      <Action
        v-if="!removeDownload"
        class="text-white"
        :text="downloadText"
        :dark="dark"
        :small="small"
        type="button"
        icon="certificate"
        flat
        @click="$emit('download')"
      />
    </div>

    <div class="action__linkedin">
      <LinkedInAction
        class="text-white"
        button-custom-class="text-white"
        :name="certificateTitle"
        :dark="dark"
        :small="small"
        :date="certificateDate"
        tooltip
      />
    </div>
  </div>
</template>

<style lang="scss">
.certificate__actions {
  display: flex;
  flex-direction: column;

  .btn {
    padding-left: 0;
  }

  &.broken-download-text {
    height: 85px;

    .action__download {
      padding: 0;
      .btn {
        text-align: left;
        display: grid;
        grid-template-columns: 25px 170px;
        padding: 0;
        height: 20px;
        margin-bottom: 15px;
      }
    }

    .action__linkedin {
      .btn {
        padding-left: 0;
        margin-left: 2px;
      }
    }
  }

  &.is-column {
    flex-direction: column;

    .btn {
      text-align: left;
      box-sizing: border-box;
      margin-top: 10px;
      padding: 0;
      height: 20px;
    }
  }
}
</style>
