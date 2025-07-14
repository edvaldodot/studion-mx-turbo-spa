<script>
/// <reference path="../../utils/typedefs.js" />
import { mapActions, mapState } from 'vuex'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { formatFileSize } from '@/support/utils/storageUnit'
import { previewModal } from '@/components/general/ModalPreview/methods'
import filterOptionsMixin from '../../utils/filterOptionsMixin'
import { libraryMixin } from '@/mixins/libraryMixin'

import Action from '@/components/general/Action'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import CardFolder from '@/app/classroom/components/CardFolder'
import CardMedia from '@/components/shared/CardMedia'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListType from '@/components/general/FilterListType'
import LibraryDatatable from '@/components/general/Library/LibraryDatatable'
import Pagination from '@/components/general/Pagination'
import ModalConfirm from '@/components/general/ModalConfirm'

import ModalAddImport from '../ModalAddImport/ModalAddImport.vue'
import ModalPreview from '@/components/general/ModalPreview'
import { downloadFileMixin } from '@/mixins/downloadFileMixin.js'

export default {
  name: 'Library',

  components: {
    Action,
    ActionSubmenu,
    Breadcrumbs,
    CardFolder,
    CardMedia,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListType,
    LibraryDatatable,
    ModalAddImport,
    Pagination,
    ModalPreview,
    ModalConfirm,
  },

  mixins: [filterOptionsMixin, downloadFileMixin, libraryMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  data() {
    return {
      selectedOption: 'folders',
      horizontalSwitchOptions: [
        { text: this.$t('library:tab.folders'), value: 'folders' },
        { text: this.$t('library:tab.medias'), value: 'medias' },
      ],
      libraryQueryParams: {
        page: 1,
        query: {},
        order: { created_at: 'desc' },
      },
      listingMode: false,
      paging: { actualPage: 1 },
      pagingModal: { actualPage: 1 },
      items: [],
      media: null,
      filterTagOptions: [
        {
          title: 'Tipo',
          name: 'type',
          items: [
            { label: 'Online', value: 0 },
            { label: 'Presencial', value: 1 },
            { label: 'Blended', value: 2 },
          ],
        },
        {
          title: 'Cobrança',
          name: 'charge',
          items: [
            { label: 'Gratuito', value: 0 },
            { label: 'Pago', value: 1 },
          ],
        },
        {
          title: 'Acquisição',
          name: 'purchase',
          items: [
            { label: 'Comprado', value: 0 },
            { label: 'Não comprado', value: 1 },
          ],
        },
        {
          title: 'Inscrições',
          name: 'registrations',
          items: [
            { label: 'Inscrições abertas', value: 0 },
            { label: 'Encerradas', value: 1 },
          ],
        },
      ],
      modalMediaActive: false,
      modalPreviewActive: false,
      modalImportActive: false,
      showSubmenu: false,
      linkHeader: [
        {
          text: this.$t('classroom.library:datatable.header.1'),
        },
        {
          text: this.$t('classroom.library:datatable.header.2'),
          size: 315,
        },
        {
          text: this.$t('classroom.library:datatable.header.3'),
          align: 'center',
          size: 75,
        },
      ],
      currentFolderId: 0,
      breadcrumbsList: [
        {
          text: this.$t('global:menu.classroom.library'),
          key: 0,
          isEditable: true,
        },
      ],
      disabledAction: false,
      currentDeleteItem: null,
      closeModalConfirm: false,
    }
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    isClassroom() {
      return this.$route.params.session_uuid
    },
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('classroom:library')
    },
    fileTypeOptions() {
      return [
        {
          text: this.$tc('global:attachment', 1),
          value: 'file',
        },
        {
          text: this.$t('global:external.media'),
          value: 'external_link',
        },
      ]
    },
  },

  watch: {
    'libraryQueryParams.page'() {
      this.loadLibrary()
    },
  },

  mounted() {
    this.getLocalStorageFilter()
  },

  created() {
    this.$emit('change-header', {
      customClasses: { library: true },
    })
    if (!this.Classroom.data.toolsTypes.find((t) => t.alias === 'sessionLibrary')) {
      this.$router.push({ name: 'classroom.panel' })
    }
    this.loadItemsPerPagePreferences(this.libraryQueryParams)
    if (this.$route.query.folder) {
      this.openFolder(this.$route.query.folder)
    } else {
      this.loadLibrary()
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptGetClassroomLibrary',
      'attemptLibraryFileCreationOnResource',
      'attemptLibraryFileSessionAssociation',
      'attemptQuotaRetrieval',
      'attemptDownloadLibraryFileRetrieval',
      'attemptClassroomDownloadLibraryFile',
      'attemptLibraryFileSessionDisassociation',
      'attemptLibraryRetrieval',
      'attemptClassroomPreviewLibraryFile',
      'attemptMoveLibraryFile',
      'attemptUpdateSessionLibraryFolder',
      'attemptRemoveSessionLibraryFolder',
    ]),

    previewModal,
    changeItemsPerPage(val) {
      this.libraryQueryParams.limit = val
      if (this.libraryQueryParams.page !== 1) {
        this.libraryQueryParams.page = 1
        return
      }
      this.loadLibrary()
    },

    changeType(value) {
      this.setLocalStorageFilter(value)
      if (this.isManualTrigger) {
        this.paramsHelper.mode = value
        return
      }
      this.listingMode = value
    },

    setLocalStorageFilter(value) {
      localStorage.setItem('libraryClassroomFilter', JSON.stringify({ listingMode: value }))
    },

    getLocalStorageFilter() {
      const filter = JSON.parse(localStorage.getItem('libraryClassroomFilter'))
      if (filter) {
        this.listingMode = filter.listingMode
      }
    },

    deleteItem(id) {
      this.setFetching(true)
      this.attemptLibraryFileSessionDisassociation({
        sessionUuid: this.$route.params.session_uuid,
        filesIds: id,
      })
        .then(() => {
          this.setFeedback({ message: this.$t('library:feedback.removed.file') })
          this.closeDeleteModalConfirm()
          this.loadLibrary()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('library:feedback.remove.file.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    downloadFile(file) {
      this.setFetching(true)

      const downloadAction = this.attemptClassroomDownloadLibraryFile

      this.$downloadFile(downloadAction, file)
    },

    /**
     * @param {Folder} folder
     */
    openModalEditFolder(folder) {
      const params = {
        session_uuid: this.$route.params.session_uuid,
        parentId: this.currentFolderId,
        folder,
      }
      this.$router.push({ name: 'classroom.library.add.folder', params })
    },
    /**
     * @param {Folder} folder
     */
    async deleteFolder(folder) {
      try {
        this.setFetching(true)
        await this.attemptRemoveSessionLibraryFolder({
          sessionUuid: this.$route.params.session_uuid,
          folderId: folder.id,
        })
        this.setFeedback({ message: this.$t('library:feedback.delete.folder') })
        this.closeDeleteModalConfirm()
        this.loadLibrary()
      } catch (error) {
        this.setFeedback({
          message: this.$t('library:feedback.delete.folder.error'),
          type: 'error',
        })
      } finally {
        this.setFetching(false)
      }
    },

    confirmDelete(item) {
      this.currentDeleteItem = item
      this.closeModalConfirm = true
    },

    closeDeleteModalConfirm() {
      this.closeModalConfirm = false
    },

    deleteItemOrFolder() {
      if (!this.currentDeleteItem.isLocked && !this.currentDeleteItem.editable) {
        this.deleteItem(this.currentDeleteItem.id)
      } else {
        this.deleteFolder(this.currentDeleteItem)
      }
    },

    openModalAddMedia(isFolder, item) {
      if (isFolder) {
        this.openModalAddFolder(item)
      } else {
        this.$router.push({ name: 'classroom.library.add.media' })
      }
    },

    openModalEdit(item) {
      if (item.isFolder) {
        this.openModalEditFolder(item)
      } else {
        this.openModalEditMedia(item)
      }
    },

    openModalPreview(item) {
      const media = item

      this.setFetching(true)
      this.attemptClassroomPreviewLibraryFile(media)
        .then((response) => {
          media.url = window.URL.createObjectURL(response.data)
          this.media = media
          this.modalPreviewActive = true
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openModalAddFolder(item) {
      this.$router.push({
        name: 'classroom.library.add.folder',
        params: {
          session_uuid: this.$route.params.session_uuid,
          parentId: item ? item.id : this.currentFolderId,
        },
      })
    },
    closeModalPreview() {
      this.modalPreviewActive = false
      this.media = null
    },
    openModalImportMedia(item) {
      if (item && item.isFolder) {
        this.currentFolderId = item.id
      }
      this.modalImportActive = true
    },
    closeModalImportMedia() {
      this.modalImportActive = false
    },
    getFileTypes(mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })
      return currentFileType ? currentFileType.alias : null
    },
    openSubmenu() {
      this.showSubmenu = !this.showSubmenu
    },
    nextPage() {
      if (this.paging.nextPage) {
        this.libraryQueryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.libraryQueryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.libraryQueryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.libraryQueryParams.page = this.paging.firstPage
      }
    },

    /**
     * Call the API to move a file to a new folder
     * @param {LibraryFile} file
     * @param {Folder} target
     */
    async moveLibraryFile(file, target) {
      try {
        const data = {
          fileId: file.id,
          parentId: target.id,
          sessionUuid: this.$route.params.session_uuid,
        }
        this.setFetching(true)
        await this.attemptMoveLibraryFile(data)
        this.setFeedback({ message: this.$t('classroom.library:file.drop.feedback') })
        this.loadLibrary()
      } catch (error) {
        this.setFeedback({ message: this.$t('global:error'), type: 'error' })
      } finally {
        this.setFetching(false)
      }
    },
    /**
     * Call the API to move a folder to a new folder
     * @param {Folder} folder
     * @param {Folder} target
     */
    async moveLibraryFolder(folder, target) {
      try {
        const data = {
          ...folder,
          parent: target.id,
        }
        this.setFetching(true)
        await this.attemptUpdateSessionLibraryFolder({
          sessionUuid: this.$route.params.session_uuid,
          formData: data,
        })
        this.setFeedback({ message: this.$t('classroom.library:folder.drop.feedback') })
        this.loadLibrary()
      } catch (error) {
        this.setFeedback({ message: this.$t('global:error'), type: 'error' })
      } finally {
        this.setFetching(false)
      }
    },
    /**
     * Handle the drag start event adding the item data to the dataTransfer
     * @param {DragEvent} event
     * @param {LibraryFile|Folder} item
     */
    handleDragStart(event, item) {
      const data = JSON.stringify(item)
      event.dataTransfer.setData('application/json', data)
    },
    handleDragOver(event) {
      event.preventDefault()
    },
    /**
     * Handle the drop event checking if the item is a file or a folder
     * and calling the appropriate method
     * @param {DragEvent} event
     * @param {Folder} targetFolder
     */
    async handleDrop(event, targetFolder) {
      event.preventDefault()
      const item = JSON.parse(event.dataTransfer.getData('application/json'))
      if (!item || !item.id) return
      if (targetFolder.title || item.id === targetFolder.id) return
      if (item.title) {
        await this.moveLibraryFile(item, targetFolder)
        return
      }
      await this.moveLibraryFolder(item, targetFolder)
    },
    /**
     * Loads a new library folder by access a specific folder in its
     * card updating the breadcrumbs list and the current folder id
     * @param {Folder} folder
     */
    openFolder(folder) {
      if (folder.metaType === 'file') return
      !folder.editable ? (this.disabledAction = true) : (this.disabledAction = false)
      this.currentFolderId = folder ? folder.id : 0
      this.loadLibrary(folder)
    },

    nextBreadcrumb(folder) {
      this.currentFolderId = folder.id
      this.$set(this.libraryQueryParams, 'folder', folder.id)
      this.$set(this.libraryQueryParams, 'page', 1)
      this.breadcrumbsList.push({ text: folder.title, key: folder.id, isEditable: folder.editable })
      this.loadLibrary()
    },

    /**
     * this method is used to go to access a specific folder in the
     * library by clicking on a breadcrumb updating the breadcrumbs
     * list and the current folder id and loading the library
     * items
     * @param {number} folderId
     */

    goToFolder(folderId) {
      this.currentFolderId = folderId

      const breadcrumbIndex =
        this.breadcrumbsList.findIndex((breadcrumb) => breadcrumb.key === folderId) + 1

      if (breadcrumbIndex !== -1) {
        const breadcrumb = this.breadcrumbsList[breadcrumbIndex - 1]
        this.disabledAction = !breadcrumb.isEditable
      }

      this.breadcrumbsList = this.breadcrumbsList.slice(0, breadcrumbIndex)

      this.$set(this.libraryQueryParams, 'folder', folderId)
      this.$set(this.libraryQueryParams, 'page', 1)
      this.loadLibrary()
    },
    /**
     * receive a item and returns if it is draggable or not
     * @param {LibraryFile|Folder} item
     * @returns {boolean}
     */
    isItemDraggable(item) {
      if (item.title && !item.editable) return false
      return this.notEqualsProfile('student')
    },
    loadLibrary(folder = null) {
      const sessionUuid = this.$route.params.session_uuid

      this.setFetching(true)
      this.attemptGetClassroomLibrary({ sessionUuid, params: this.libraryQueryParams })
        .then((libraryFilesResponse) => {
          this.items = []
          if (libraryFilesResponse.data.data.length) {
            this.items = libraryFilesResponse.data.data.map((item) => {
              if (!item.meta) return { ...item, key: `folder-${item.id}` }
              return {
                id: item.id,
                key: `file-${item.id}`,
                title: item.title,
                fileName: item.filename,
                description: item.description,
                size: formatFileSize(item.vendorMeta.size),
                metaType: item.metaType || (item.meta && item.meta.type),
                url: item.path || item.filename,
                type: this.getFileTypes(item.vendorMeta.mimetype),
                session_uuid: this.$route.params.session_uuid,
                editable: item.editable,
                isFolder: item.isFolder,
                countFiles: item.countFiles,
                isLocked: item.isLocked,
              }
            })

            this.paging = libraryFilesResponse.data

            if (folder) {
              this.nextBreadcrumb(folder)
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          this.setFetching(false)
        })
    },
    /**
     * receives a string and set it to the library query params
     * as a search query then call the loads the library with
     * the new query params
     * @param {string} search
     */
    filterSearch(search) {
      this.$set(this.libraryQueryParams.query, 'title', search)
      this.loadLibrary()
    },
    /**
     * receives a filterOrder object then set the library order query
     * param with its values then call the loads the library with
     * the new query params
     * @param {Object} orderItem
     */
    filterOrder(orderItem) {
      this.libraryQueryParams.order = {}
      this.$set(this.libraryQueryParams.order, orderItem.property, orderItem.type)
      this.loadLibrary()
    },
    openModalEditMedia(media) {
      this.$router.push({
        name: 'classroom.library.add.media',
        params: { media: { ...media, folderId: this.currentFolderId } },
      })
    },

    addLinks(item) {
      let filesIds = []
      for (var i in item) {
        filesIds.push(item[i].id)
      }
      if (filesIds.length > 0) {
        this.importValidate = false
        this.setFetching(true)
        const payload = {
          sessionUuid: this.$route.params.session_uuid,
          filesIds: filesIds,
          parent: this.currentFolderId,
        }

        this.attemptLibraryFileSessionAssociation(payload)
          .then(() => {
            this.loadLibrary()
            this.closeModalImportMedia()
            if (filesIds.length > 1) {
              this.setFeedback({
                message: this.$t('library:feedback.import.links', { num: filesIds.length }),
              })
            } else {
              this.setFeedback({ message: this.$t('library:feedback.import.link') })
            }
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else {
        this.importValidate = true
      }
    },
  },
}
</script>

<template v-if="componentLoader">
  <div class="p-3 inner-content library-classroom">
    <div class="my-4">
      <FilterList>
        <template slot="other">
          <div class="filter-list-center">
            <breadcrumbs
              class="center library__breadcrumbs"
              :breadcrumbs-list="breadcrumbsList"
              :dark="accessibility"
              clickable
              highlight-current
              size="large"
              @click="goToFolder"
            />

            <div class="wrapper-filter flex gap-1 align-items-center justify-content-end">
              <FilterListSearch
                slot="search"
                ref="filterlistsearch"
                :dark="accessibility"
                @search="filterSearch"
              />

              <FilterListOrder
                slot="order"
                :on-server="true"
                :options="filterListOrderOptions"
                @update-orders="filterOrder"
              />

              <FilterListType
                class="p-0 m-0"
                v-model="listingMode"
                :initial-value="listingMode"
                @change="changeType"
              />
            </div>
          </div>
        </template>
      </FilterList>
    </div>

    <div
      v-if="hasWriteAccess"
      slot="button"
      class="center library-actions-wrapper my-4"
    >
      <ActionSubmenu :show.sync="showSubmenu">
        <Action
          slot="button"
          type="button"
          :text="$t('classroom.library:btn.add')"
          :dark="accessibility"
          :primary="showSubmenu ? false : true"
          :secondary="showSubmenu ? true : false"
          fixed-width
          :disabled="disabledAction"
          large
          @click="openSubmenu()"
        />

        <template slot="actions">
          <Action
            type="button"
            :text="$t('global:folder')"
            :dark="accessibility"
            secondary
            small
            @click="openModalAddFolder()"
          />
          <Action
            type="button"
            :text="$t('classroom.library:library.media')"
            :dark="accessibility"
            secondary
            small
            @click="openModalAddMedia()"
          />
          <Action
            type="button"
            :text="$t('classroom.library:library.import')"
            :dark="accessibility"
            secondary
            small
            @click="openModalImportMedia()"
          />
        </template>
      </ActionSubmenu>
    </div>

    <EmptyMessage v-if="items.length === 0">
      <h2>{{ $t('classroom.library:empty.title') }}</h2>

      <p>
        {{
          hasWriteAccess && !disabledAction
            ? $t('classroom.library:empty.message:admin')
            : $t('classroom.library:empty.message:student')
        }}
      </p>
    </EmptyMessage>

    <template v-else>
      <div class="center my-4">
        <div
          v-if="!listingMode"
          class="library-list"
          :data-size="$media.mobile ? 2 : 4"
        >
          <span
            v-for="(item, index) in items"
            :key="item.key"
            class="card__wrapper"
            :draggable="isItemDraggable(item).toString()"
            :class="{ draggable__items: isItemDraggable(item) }"
            v-on:dragstart="handleDragStart($event, item)"
            v-on:dragover="handleDragOver"
            v-on:drop="handleDrop($event, item)"
          >
            <CardMedia
              v-if="!item.isFolder"
              :title="item.title"
              :description="item.description"
              :type="item.type"
              :size="getFileSizeMeta(item)"
              :url="item.url"
              :meta-type="item.metaType"
              :thumbnail="item.thumbnail"
              :editable="hasWriteAccess && item.editable"
              :is-locked="item.isLocked"
              :mandatory="!!item.mandatory"
              :openable="previewModal().accept(item.type, item.metaType)"
              :downloadable="item.metaType !== 'external_link'"
              @open="openModalPreview(item)"
              @delete="confirmDelete(item)"
              @download="downloadFile(item)"
              @edit="openModalEditMedia(item)"
              @accessFolder="openFolder(item)"
            >
            </CardMedia>

            <CardFolder
              v-else
              :editable="item.editable"
              :is-locked="item.isLocked"
              :name="item.name || item.title"
              :description="item.description"
              :size="getFileSizeMeta(item)"
              @open="openFolder(item)"
              @delete="confirmDelete(item)"
              @edit="openModalEditFolder(item)"
            />
          </span>
        </div>
        <div v-if="listingMode">
          <LibraryDatatable
            :items="items"
            @editFile="openModalEdit"
            @removeFile="confirmDelete"
            @openAddMediaModal="openModalAddMedia"
            @accessFolderContent="openFolder"
            @openAddImportModal="openModalImportMedia"
            @openModalPreview="openModalPreview"
          />
        </div>
        <Pagination
          :active-page="paging.actualPage"
          :page-count="paging.lastPage"
          @next-page="nextPage"
          @previous-page="previousPage"
          @first-page="firstPage"
          @last-page="lastPage"
          @go-to-page="libraryQueryParams.page = $event"
          @change-items-per-page="changeItemsPerPage"
        ></Pagination>
      </div>
    </template>

    <RouterView @update="loadLibrary()" />

    <ModalPreview
      v-if="media"
      :media="media"
      :is-active="modalPreviewActive"
      @close="closeModalPreview"
      @download="downloadFile(media)"
    />

    <ModalAddImport
      v-if="modalImportActive"
      :modal-import-active="modalImportActive"
      :selected-option="selectedOption"
      :horizontal-switch-options="horizontalSwitchOptions"
      :title="Classroom.data.course.name"
      :prop-id="isClassroom"
      @closeModalImportMedia="closeModalImportMedia"
      @loadLibrary="loadLibrary"
      @add-links="addLinks"
    />

    <ModalConfirm
      :title="$t('library:modal.confirm.title')"
      :active="closeModalConfirm"
      :confirm-btn-text="$t('global:confirm')"
      @close="closeDeleteModalConfirm"
      @confirm="deleteItemOrFolder"
    >
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import 'styles.scss';
</style>
