<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import EmptyMessage from '@/components/general/EmptyMessage'
import Icon from '@/components/general/Icon'
import { previewModal } from '@/components/general/ModalPreview/methods'

import { libraryMixin } from '@/mixins/libraryMixin'
import { downloadFileMixin } from '@/mixins/downloadFileMixin.js'

export default {
  name: 'LibraryDatatable',
  components: {
    Action,
    ActionSubmenu,
    Datatable,
    Dropdown,
    DropdownLink,
    Icon,
    Breadcrumbs,
    EmptyMessage,
  },
  mixins: [libraryMixin, downloadFileMixin],
  props: {
    hideHeader: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    },
    breadcrumbsList: {
      type: Array,
      default: () => [],
    },
    notCollection: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      currentItems: [],
      currentBreadcrumb: [],
    }
  },
  computed: {
    ...mapState(['Library']),

    itemsLibrary() {
      return this.Library.instanceLibrary
    },
  },

  watch: {
    'Library.updateLibraryList': {
      immediate: true,
      handler(newValue) {
        let { isUpdating, item } = newValue

        if (!isUpdating && !item) return

        let folderIndex = this.currentItems.findIndex((folder) => folder.id === item.folder.id)

        if (folderIndex < 0) return

        this.toggleFolderList(this.currentItems[folderIndex], true)

        this.attemptToUpdateLibraryList({ isUpdating: false, item: null })
      },
    },
    itemsLibrary: {
      immediate: true,
      handler(newValue) {
        if (this.itemsLibrary.length > 0) {
          this.currentItems = newValue
        }
      },
    },
    items: {
      immediate: true,
      handler(newValue) {
        this.currentItems = newValue
      },
    },
    breadcrumbsList: {
      immediate: true,
      handler(newValue) {
        this.currentBreadcrumb = newValue
      },
    },
  },
  created() {
    this.currentItems = this.items
    this.currentBreadcrumb = this.breadcrumbsList
  },
  methods: {
    ...mapActions([
      'attemptDownloadLibraryFileRetrieval',
      'attemptLibraryRetrieval',
      'attemptToUpdateLibraryList',
      'attemptDownloadLibraryFileRetrieval',
      'attemptClassroomDownloadLibraryFile',
      'attemptClassroomPreviewLibraryFile',
      'setFetching',
    ]),
    previewModal,

    downloadFile(item) {
      this.setFetching(true)
      if (this.notEqualsProfile('student')) {
        this.attemptDownloadLibraryFileRetrieval(item)
          .then(() => {
            this.setFetching(false)
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else {
        this.$downloadFile(this.attemptClassroomDownloadLibraryFile, item)
      }
    },
    async toggleFolderList(item, isOpen = null) {
      if (!item.isFolder || !item.folder.parentFolder) return

      let folderIndex = this.currentItems.findIndex((folder) => folder.id === item.id)

      this.$set(
        this.currentItems[folderIndex],
        'isOpen',
        isOpen || !this.currentItems[folderIndex].isOpen
      )

      if (!isOpen && this.folderHasChildren(this.currentItems[folderIndex])) return

      let filter = {
        filter: {
          parent_folder_id: item.id,
        },
      }

      this.setFetching(true)

      let folderContent = await this.attemptLibraryRetrieval(filter).finally(() => {
        this.setFetching(false)
      })

      this.$set(this.currentItems[folderIndex], 'childrenFolders', folderContent.data.data)
    },
    folderHasChildren(item) {
      return item.childrenFolders && item.childrenFolders.length > 0
    },
    openFolderActionSubmenu(item) {
      if (!item.isFolder) return

      this.closeAllSubmenus()

      let folderIndex = this.currentItems.findIndex((folder) => folder.id === item.id)
      this.$set(
        this.currentItems[folderIndex],
        'isActionSubmenuOpen',
        !this.currentItems[folderIndex].isActionSubmenuOpen
      )
    },
    closeAllSubmenus() {
      this.currentItems.forEach((folder) => {
        this.$set(folder, 'isActionSubmenuOpen', false)
      })
    },
    editFile(item) {
      this.$emit('editFile', item)
    },
    removeFile(item) {
      this.$emit('removeFile', item)
    },
    openAddMediaModal(isFolder = false, item) {
      this.$emit('openAddMediaModal', isFolder, item)
    },
    openAddImportModal(item) {
      this.$emit('openAddImportModal', item)
    },
    async accessFolderContent(item) {
      this.$emit('accessFolderContent', item)
    },
    goToFolder(folderId) {
      this.$emit('goToFolder', folderId)
    },
    openModalPreview(item) {
      this.$emit('openModalPreview', item)
    },
  },
}
</script>

<template>
  <div>
    <Breadcrumbs
      v-if="breadcrumbsList"
      highlight-current
      clickable
      class="center library__breadcrumbs"
      :breadcrumbs-list="breadcrumbsList"
      size="large"
      @click="goToFolder"
    />

    <Datatable
      v-if="currentItems.length > 0"
      :items="currentItems"
    >
      <template
        v-if="!hideHeader"
        slot="thead"
      >
        <tr>
          <th
            class="th"
            colspan="2"
          >
            {{ $t('library:title.add') }}
          </th>
          <th
            class="th"
            width="135"
          >
            {{ $t('library:title.data') }}
          </th>
          <th
            class="th"
            width="60"
          ></th>
        </tr>
      </template>
      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr
          v-if="props.item"
          :class="{ 'is-folder': props.item.isFolder }"
        >
          <td
            class="td file-icon text-center area-click"
            width="60"
            @click="accessFolderContent(props.item)"
          >
            <Icon
              :name="getFileIconName(props.item)"
              size="medium"
              wrapper
            />
          </td>
          <td
            class="td area-click"
            @click="accessFolderContent(props.item)"
          >
            <span class="td-text bolder">{{ props.item.title || props.item.filename }}</span>
          </td>
          <td
            class="td"
            width="135"
          >
            <span class="td-text">
              {{ getFileSize(props.item) }}
            </span>
          </td>
          <td class="td flex align-items-center gap-2 justify-content-center td-actions h-5rem">
            <Action
              v-if="
                props.item.metaType === 'file' ||
                (props.item && props.item.meta && props.item.meta.type === 'file')
              "
              class="text-color"
              download
              icon="download"
              @click.stop="() => downloadFile(props.item)"
            />
            <Action
              v-if="
                props.item.metaType === 'external_link' ||
                (props.item && props.item.meta && props.item.meta.type === 'external_link')
              "
              :url="props.item.path"
              type="link"
              icon="goto-external"
              class="text-color"
              target="_blank"
            />
            <Action
              v-if="previewModal().accept(props.item.type, props.item.metaType)"
              type="button"
              icon="visibility"
              class="text-color"
              @click="openModalPreview(props.item)"
            />
            <ActionSubmenu
              :show.sync="props.item.isActionSubmenuOpen"
              position="left"
            >
              <Action
                v-if="
                  props.item.isFolder &&
                  notEqualsProfile('student') &&
                  canWrite('libraries') &&
                  props.item.editable
                "
                slot="button"
                icon="add_circle"
                class="text-color"
                icon-size="medium"
                @click.stop="openFolderActionSubmenu(props.item)"
              />

              <template slot="actions">
                <Action
                  :text="$t('classroom.library:library.upload')"
                  dark
                  icon="file_upload"
                  class="text-color"
                  icon-size="medium"
                  secondary
                  type="button"
                  @click="openAddMediaModal(false, props.item)"
                />
                <Action
                  :text="$t('classroom.library:modal.add.folder.title.add')"
                  dark
                  icon="folder"
                  class="text-color"
                  icon-size="medium"
                  secondary
                  type="button"
                  @click="openAddMediaModal(true, props.item)"
                />
                <Action
                  v-if="notCollection"
                  :text="$t('solutions.create.tools:library.import')"
                  dark
                  icon="folder-multiple-image"
                  class="text-color"
                  icon-size="medium"
                  secondary
                  type="button"
                  @click="openAddImportModal(props.item)"
                />
              </template>
            </ActionSubmenu>
            <Dropdown
              v-if="notEqualsProfile('student') && !props.item.isLocked"
              icon="dots-vertical"
              icon-size="medium"
              right
            >
              <DropdownLink
                v-if="canWrite('libraries') && breadcrumbsList.length < 1 && props.item.editable"
                :text="$t('global:edit')"
                @click="editFile(props.item)"
              />
              <DropdownLink
                v-if="canWrite('libraries')"
                :text="$t('global:remove')"
                @click="removeFile(props.item)"
              />
            </Dropdown>
          </td>
        </tr>
      </template>
    </Datatable>
    <template v-else>
      <EmptyMessage class="modal-description empty-classroom-library">
        <h1>
          {{ $t('classroom.library:empty.list') }}
        </h1>
      </EmptyMessage>
    </template>
  </div>
</template>

<style lang="scss">
@import 'LibraryDatatable.scss';
</style>
