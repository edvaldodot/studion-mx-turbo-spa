<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { ContentLoader } from 'vue-content-loader'
import PanelLibraryCard from './components/PanelLibraryCard'
import Action from '@/components/general/Action'
import BlurCard from '@/components/general/BlurCard'
import Skeleton from '@/components/general/Skeleton'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { paginateMixin } from '@/mixins/paginatorMixin'

export default defineComponent({
  name: 'PanelLibrary',

  components: {
    ContentLoader,
    PanelLibraryCard,
    Skeleton,
    BlurCard,
    Action,
  },

  mixins: [paginateMixin],

  data() {
    return {
      isLoading: false,
      items: [],
      libraryQueryParams: {
        page: 1,
        limit: 5,
      },
    }
  },

  created() {
    const sessionUuid = this.$route.params.session_uuid

    this.isLoading = true
    this.attemptGetClassroomLibraryOptimized({ sessionUuid, params: this.libraryQueryParams })
      .then((libraryFilesResponse) => {
        this.items = []
        if (libraryFilesResponse.data.length) {
          this.items = libraryFilesResponse.data.map((item) => {
            return {
              ...item,
              type:
                item.vendorMeta && item.vendorMeta.mimetype
                  ? this.getFileTypes(item.vendorMeta.mimetype)
                  : null,
              session_uuid: this.$route.params.session_uuid,
            }
          })
        }
      })
      .finally(() => {
        this.isLoading = false
      })
  },

  methods: {
    ...mapActions(['attemptGetClassroomLibraryOptimized']),
    getFileTypes(mimeType) {
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
    v-if="items.length"
    class="panel-library mt-5"
    :data-testid="$testId('classroom-library')"
  >
    <h3 class="section-title">
      {{ $t('global:menu.classroom.library') }}
      <Action
        type="button"
        :text="$t('global:view.all')"
        class="section-title__view-all"
        flat
        @click="$router.push({ name: 'classroom.sessionLibrary' })"
      />
    </h3>

    <div class="panel-library__content">
      <BlurCard
        v-if="!isLoading"
        class="announcements"
        hide-scrollbar
        max-height="360px"
      >
        <div class="panel-library__content-items">
          <template v-for="item in items">
            <PanelLibraryCard
              :key="item.id"
              :item="item"
            />
          </template>
        </div>
      </BlurCard>
      <Skeleton
        v-else
        :columns="1"
        :colored="false"
      >
        <ContentLoader
          :speed="2"
          :height="330"
        >
          <rect
            width="100%"
            height="330"
          />
        </ContentLoader>
      </Skeleton>
    </div>
  </div>
</template>

<style lang="scss">
@import 'PanelLibrary.scss';
</style>
