<template>
  <Modal
    active
    back
    is-page
    @close="close"
  >
    <div class="modal-form is-expanded">
      <span class="modal-subtitle">{{ $t('library:modal.link.subtitle') }}</span>
      <h2 class="modal-title text-color is-capitalize">{{ title }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('library:modal.link.description') }}</p>
      </div>
      <div class="content"></div>
      <div class="modal-solution-tools-import-media">
        <FilterList>
          <FilterListSearch
            slot="search"
            hide-error-details
            dark
            @search="pgtrSetSearch('name', $event)"
          />
        </FilterList>
        <EmptyMessage v-if="allMedias.length === 0">
          <h2>{{ $t('global:search.empty.title') }}</h2>
          <p class="text-color">{{ $t('global:search.empty.message') }}</p>
        </EmptyMessage>
        <form
          v-else
          @submit.prevent="submit"
        >
          <Datatable
            :items="allMedias"
            dark
          >
            <template
              v-if="!$media.mobile"
              slot="thead"
            >
              <tr>
                <th class="th">{{ $t('library:datatable.header.1') }}</th>
                <th
                  class="th"
                  width="315"
                >
                  {{ $t('library:datatable.header.2') }}
                </th>
                <th
                  class="th"
                  width="40"
                ></th>
                <th
                  class="th"
                  width="75"
                >
                  {{ $t('library:datatable.header.3') }}
                </th>
              </tr>
            </template>
            <template
              slot="tbody"
              slot-scope="props"
            >
              <tr
                v-if="$media.mobile"
                class="tr-colspan"
              >
                <td
                  class="td"
                  colspan="3"
                >
                  <span class="td-text bolder">{{ props.item.name }}</span>
                </td>
              </tr>
              <tr>
                <td
                  v-if="!$media.mobile"
                  class="td"
                >
                  <span class="td-text bolder">{{ props.item.name }}</span>
                </td>
                <td class="td">
                  <span
                    v-if="$media.mobile"
                    class="td-text-header td-text-header-inline"
                  >
                    {{ $t('library:datatable.header.2') }}
                  </span>
                  <span class="td-text">{{
                    !isExternalLink(props.item)
                      ? formatFileSize(props.item.vendorMeta.size)
                      : $t('global:external.media')
                  }}</span>
                </td>
                <td
                  class="td td-actions"
                  width="40"
                >
                  <Action
                    v-if="!isExternalLink(props.item)"
                    type="link"
                    icon="download"
                    download
                    @click="downloadMedia(props.item)"
                  />
                  <Action
                    v-else-if="isExternalLink(props.item)"
                    type="link"
                    icon="visibility"
                    target="_blank"
                    :url="props.item.path ? props.item.path : props.item.filename"
                  />
                </td>
                <td
                  class="td text-center"
                  width="75"
                >
                  <Checkbox
                    v-model="props.item.linked"
                    :items="[{ value: true }]"
                    switch-type
                    dark
                    @input="toggleMediaLink($event, props.item)"
                  />
                </td>
              </tr>
            </template>
          </Datatable>
          <Pagination
            :active-page="pgtrParams.page"
            :page-count="pgtrLastPage"
            dark
            @next-page="pgtrParams.page++"
            @previous-page="pgtrParams.page--"
            @first-page="pgtrParams.page = 1"
            @last-page="pgtrParams.page = pgtrLastPage"
            @go-to-page="pgtrParams.page = $event"
            @change-items-per-page="pgtrParams.limit = $event"
            dark
          />
          <div class="datatable-item-selected theme-dark">
            <p class="text-color">{{ $t('library:modal.link.datatable.selected') }}</p>
            <span class="datatable-item-selected-length">{{ newLinkedMedias.length }}</span>
          </div>
          <div class="form-submit text-center">
            <Action
              :text="$t('global:form.save')"
              type="button"
              secondary
              large
              submit
              fixed-width
            />
          </div>
        </form>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { formatFileSize } from '@/support/utils/storageUnit'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import Modal from '@/components/general/Modal'
import Pagination from '@/components/general/Pagination'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import EmptyMessage from '@/components/general/EmptyMessage'

export default {
  name: 'ModalImportMedia',
  components: {
    Action,
    Checkbox,
    Datatable,
    Modal,
    FilterList,
    FilterListSearch,
    Pagination,
    EmptyMessage,
  },
  mixins: [paginateMixin],
  props: {
    linkedMedias: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      newLinkedMedias: [],
      allMedias: [],
    }
  },
  computed: {
    ...mapState(['Library', 'Classroom']),
  },
  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    'Library.medias': function () {
      this.allMedias = this.Library.medias.map((file) => {
        return {
          ...file,
          linked: this.newLinkedMedias.some((media) => {
            return media.id === file.id
          }),
        }
      })
    },
  },
  created() {
    this.newLinkedMedias = [...this.linkedMedias]
    this.pgtrParams.classroomUuid = this.Classroom.data.uuid
    this.pgtrInitializePagination('classroomMediasListResource')
  },
  methods: {
    ...mapActions(['attemptDownloadLibraryFileRetrieval', 'setFeedback', 'setFetching']),
    formatFileSize(size) {
      return formatFileSize(size)
    },
    toggleMediaLink(add, media) {
      if (add) {
        this.newLinkedMedias.push(media)
        return
      }

      let idx = this.newLinkedMedias.findIndex((item) => {
        return item.id === media.id
      })
      if (idx > -1) {
        this.newLinkedMedias.splice(idx, 1)
      }
    },
    downloadMedia(file) {
      this.setFetching(true)
      this.attemptDownloadLibraryFileRetrieval(file)
        .catch(() => {
          this.setFeedback({
            message: this.$t('library:feedback.download.file.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    getFileTypes(mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })
      return currentFileType ? currentFileType.alias : null
    },
    submit() {
      this.$emit('submited', this.newLinkedMedias)
    },
    close() {
      this.$emit('close')
    },
    /**
     * @param {Object} item
     */
    isExternalLink(item) {
      return item.meta && item.meta.type && item.meta.type === 'external_link'
    },
  },
}
</script>
