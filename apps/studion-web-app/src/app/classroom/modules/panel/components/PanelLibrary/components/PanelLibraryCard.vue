<script>
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import { defineComponent } from 'vue'
import { formatFileSize } from '@/support/utils/storageUnit'
import { downloadFileMixin } from '@/mixins/downloadFileMixin.js'
import { libraryMixin } from '@/mixins/libraryMixin'
import { mapActions } from 'vuex'

export default defineComponent({
  name: 'PanelLibraryCard',

  components: {
    Action,
    Icon,
  },

  mixins: [downloadFileMixin, libraryMixin],

  props: {
    item: {
      type: Object,
      default: () => {},
    },
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptDownloadLibraryFileRetrieval',
      'attemptClassroomDownloadLibraryFile',
    ]),
    downloadOrAccess() {
      if (this.item.meta && this.item.meta.type === 'file') {
        this.setFetching(true)
        if (this.notEqualsProfile('student')) {
          this.attemptDownloadLibraryFileRetrieval(this.item)
            .then(() => {
              this.setFetching(false)
            })
            .catch(() => {
              this.setFeedback({
                message: this.$t('library:feedback.download.file.error'),
                type: 'error',
              })
            })
            .finally(() => {
              this.setFetching(false)
            })
        } else {
          this.$downloadFile(this.attemptClassroomDownloadLibraryFile, this.item)
        }
        return
      }
      if (this.item.meta && this.item.meta.type === 'external_link') {
        window.open(this.item.filename, '_blank')
      } else {
        this.$router.push({ name: 'classroom.sessionLibrary', query: { folder: this.item.id } })
      }
    },
    formatFileSize,
  },
})
</script>

<template>
  <div
    class="panel-card-library__item"
    :data-testid="$testId('classroom-library-card')"
  >
    <div class="panel-card-library__icon-wrapper">
      <Icon
        :name="getFileIconName(item)"
        size="large"
      />
    </div>
    <div class="panel-card-library__body-wrapper">
      <h3 class="panel-card-library__title">{{ item.title }}</h3>
      <p class="panel-card-library__description">{{ item.description }}</p>
      <div class="panel-card-library__actions">
        <span>{{ getFileSize(item) }}</span>
        <Action
          type="button"
          :text="
            item.meta && item.meta.type === 'file' ? $t('global:download') : $t('global:access')
          "
          flat
          download
          @click="downloadOrAccess()"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'PanelLibraryCard.scss';
</style>
