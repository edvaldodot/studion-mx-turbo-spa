<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf, url } from 'vuelidate/lib/validators'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { libraryMixin } from '@/mixins/libraryMixin'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { formatFileSize } from '@/support/utils/storageUnit'
import fileSize from '@/support/customValidators/filesizeValidator'

import FilterListOrder from '@/components/general/FilterListOrder'
import Action from '@/components/general/Action'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import ActionBar from '@/components/general/ActionBar'
import BranchSelector from '@/components/shared/BranchSelector'
import BranchSelectorOptions from '@/components/shared/BranchSelectorOptions'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import CardMedia from '@/components/shared/CardMedia'
import ContentHeader from '@/components/general/ContentHeader'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListType from '@/components/general/FilterListType'
import LibraryDatatable from '@/components/general/Library/LibraryDatatable'
import Pagination from '@/components/general/Pagination'
import SelectField from '@/components/general/SelectField'
import { defaultFilterListOrderOptions } from './options'

export default {
  name: 'LibraryList',
  components: {
    Action,
    ActionSubmenu,
    ActionBar,
    BranchSelector,
    BranchSelectorOptions,
    Breadcrumbs,
    CardMedia,
    ContentHeader,
    FilterList,
    FilterListSearch,
    FilterListType,
    LibraryDatatable,
    Pagination,
    SelectField,
    FilterListOrder,
    EmptyMessage: () => import('@/components/general/EmptyMessage'),
    FileField: () => import('@/components/general/FileField'),
    InputField: () => import('@/components/general/InputField'),
    Modal: () => import('@/components/general/Modal'),
    TextareaField: () => import('@/components/general/TextareaField'),
  },

  mixins: [libraryMixin, paginateMixin],

  data() {
    return {
      DEFAULT_BREADCRUMB: {
        key: 1,
        text: this.$t('library:header.title'),
        value: 'root',
      },
      breadcrumbsList: [this.DEFAULT_BREADCRUMB],
      creating: false,
      currentDeleteIndex: null,
      currentDeleteItem: null,
      editingItem: null,
      oldMedia: null,
      formData: {
        type: null,
        description: '',
        file: null,
        title: null,
        url: null,
        branches: null,
        canReadWhenUp: false,
        parent: null,
      },
      items: [],
      media: null,
      savedBranches: [],
      pgtrLoaded: false,
      showSubmenu: false,
      listingMode: false,
      paramsHelper: {
        order: {},
        mode: false,
        categories: null,
        counter: 0,
      },
      componentLoader: false,
      fromRoute: null,
      shouldPreserveBreadcrumb: true,
    }
  },
  validations: {
    formData: {
      type: { required },
      title: {
        required,
      },
      description: {
        required: requiredIf(function () {
          return !this.isFolderModalRoute
        }),
      },
      branches: {
        required: requiredIf(function () {
          return this.$isEnabledFeature('branching') && this.formData.type !== 'folder'
        }),
      },
      url: {
        url,
        required: requiredIf(function () {
          return this.formData.type === 'external_link'
        }),
      },
      file: {
        required: requiredIf(function () {
          return this.formData.id === undefined && this.formData.type === 'file'
        }),
        fileSize: fileSize(524288000),
      },
    },
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'Library', 'fetching']),
    isFolderModalRoute() {
      return this.$route.meta.isFolderModal || false
    },
    modalMediaActive() {
      return this.$route.meta.modalMediaActive || false
    },

    modalConfirmActive() {
      return this.$route.meta.modalConfirmActive || false
    },
    itemsLibrary() {
      return this.Library.instanceLibrary
    },
    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('libraries')
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
    isNewCatalog() {
      return this.$isEnabledFeature('offering_v2')
    },
    isManualTrigger() {
      return this.isNewCatalog && this.$media.mobile
    },
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },
    isDigitalCollection() {
      return ['library.all', 'library.folder'].includes(this.$route.name)
    },
  },
  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    itemsLibrary: {
      immediate: true,
      handler() {
        this.buildBreadcrumbs()
      },
    },
  },
  mounted() {
    this.getLocalStorageFilter()
    this.pgtrRouteParams.active = true
    this.updateCardList()
  },

  beforeDestroy() {
    this.clearLocalBreadcrumbs()
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptLibraryFileCreation',
      'attemptLibraryFileUpdate',
      'attemptDownloadLibraryFileRetrieval',
      'attemptLibraryFileRemoval',
      'attemptToUpdateLibraryList',
      'mediaListResource',
      'attemptGetFolder',
    ]),
    changeType(value) {
      this.setLocalStorageFilter(value)
      if (this.isManualTrigger) {
        this.paramsHelper.mode = value
        return
      }
      this.listingMode = value
    },

    deleteFile() {
      this.setFetching(true)
      this.attemptLibraryFileRemoval(this.currentDeleteItem.id)
        .then(() => {
          this.setFeedback({ message: this.$t('library:feedback.removed.file') })
          this.closeModalConfirm()
          this.pgtrRefresh()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    closeModalAddEdit() {
      this.media = null
      this.resetFormData()
      this.$router.push({ name: 'library.all' })
    },
    openModalEditMedia(isEditFolder = false, idBack) {
      this.$router.push({
        name: `library.all.edit${isEditFolder ? '.folder' : ''}`,
        params: { id: this.formData.id, idEdit: idBack },
      })
    },
    resetFormData() {
      this.$v.$reset()
      delete this.formData.id
      this.oldMedia = null
      this.formData.title = null
      this.formData.description = ''
      this.formData.file = null
      this.formData.url = null
      this.formData.type = null
      this.formData.branches = null
      this.formData.canReadWhenUp = false
    },
    resetMediaForm() {
      this.$v.$reset()
      if (this.oldMedia) {
        this.formData.file = this.oldMedia.type === 'file' ? this.oldMedia.media : null
        this.formData.url = this.oldMedia.type !== 'file' ? this.oldMedia.media : null
      }
    },
    openModalConfirm(item, index) {
      this.currentDeleteItem = item
      this.currentDeleteIndex = index
      this.$router.push({ name: 'library.all.delete', params: { id: item.id } })
    },
    closeModalConfirm() {
      this.currentDeleteItem = null
      this.currentDeleteIndex = null
      this.$router.back()
    },
    openModalAddMedia(isAddFolder = false, item = {}) {
      let folderId = this.$route.params.id || item.id || null
      let params = {}
      this.resetFormData()
      if (folderId) {
        params = {
          id: folderId,
        }
      }

      this.$router.push({
        name: `library.all.create${isAddFolder ? '.folder' : ''}`,
        params,
      })
    },
    saveMedia(isFolder = false) {
      if (isFolder === true) {
        this.formData.type = 'folder'
      }

      this.$v.$touch()

      if (this.$v.$invalid) return
      this.setFetching(true)
      this.formData.id ? this.editMedia() : this.addMedia()
    },

    navigationCardMode() {
      const id = this.$route.params.id
      if (this.$route.params.idEdit) {
        let idRouteBack = this.$route.params.idEdit
        this.breadcrumbsClickHandler(idRouteBack)
      } else {
        this.breadcrumbsClickHandler(id)
      }
    },

    addMedia() {
      this.formData.parent_folder_id = this.$route.params.id
      this.attemptLibraryFileCreation(this.formData)
        .then(() => {
          this.navigationCardMode()
          this.pgtrRefresh()
          this.setFeedback({ message: this.$t('library:feedback.upload.file') })
        })
        .catch((error) => {
          if (error.response.data.message === 'folder_already_exist') {
            this.setFeedback({
              message: this.$t('library:feedback.upload.file.error.folder.duplicate'),
              type: 'error',
            })
          } else {
            this.setFeedback({
              message: this.$t('library:feedback.upload.file.error'),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    editMedia() {
      if (this.$isEnabledFeature('branching')) {
        this.parseFormDataBranchIds(this.formData)
      }

      this.attemptLibraryFileUpdate(this.formData)
        .then(() => {
          this.navigationCardMode()
          this.pgtrRefresh()
          this.resetFormData()
          this.setFeedback({ message: this.$t('library:feedback.change.file') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    setLocalStorageFilter(value) {
      localStorage.setItem('libraryFilter', JSON.stringify({ listingMode: value }))
    },
    getLocalStorageFilter() {
      const filter = JSON.parse(localStorage.getItem('libraryFilter'))
      if (filter) {
        this.listingMode = filter.listingMode
      }
    },
    setLocalBreadcrumbsLength(value) {
      localStorage.setItem('BreadcrumbsLength', JSON.stringify({ data: value }))
    },
    getLocalBreadcrumbsLength() {
      const filter = JSON.parse(localStorage.getItem('BreadcrumbsLength'))
      return filter
    },

    clearLocalBreadcrumbs() {
      localStorage.removeItem('BreadcrumbsLength')
    },

    /**
     * If has branches, pass data to branch_ids.
     * @param {Object} formData
     */
    parseFormDataBranchIds(formData) {
      if (!formData.branches) return
      formData.branch_ids = [...formData.branches]
    },

    getFileTypes(mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })

      return currentFileType ? currentFileType.alias : null
    },
    editFile(item, id = 'root') {
      let url = item.url ? item.url : item.path

      item.meta.type !== 'external_link' ? (url = null) : url
      const parent = id === 'root' ? '' : id
      this.editingItem = item
      this.formData.id = item.id
      this.formData.title = item.title
      this.formData.description = item.description
      this.formData.file = item.filename
      this.formData.type = item.meta.type || 'file'
      this.formData.url = url
      this.formData.canReadWhenUp = item.canReadWhenUp
      this.formData.parent_folder_id = parent
      if (this.$isEnabledFeature('branching')) this.savedBranches = item.branches
      this.oldMedia = {
        type: item.metaType || 'file',
        media: item.metaType === 'external_link' ? item.url : item.fileName,
      }

      this.openModalEditMedia(item.isFolder, id)
    },

    async updateCardList(id = 'root') {
      if (this.pgtrIsSearching) return

      let filter = {
        filter: {
          parent_folder_id: this.$route.params.id || id,
        },
      }

      if (!this.pgtrRouteParams.ignore.includes('filter|parent_folder_id')) {
        this.pgtrRouteParams.ignore.push('filter|parent_folder_id')
      }

      this.pgtrInitializePagination('mediaListResource', {}, filter)
      this.componentLoader = true
      this.buildBreadcrumbs()
    },

    async breadcrumbsClickHandler(id) {
      await this.$router.push({
        name: id === 'root' || !id ? 'library.all' : 'library.folder',
        params: { id: id },
      })

      this.pgtrParams.filter = { parent_folder_id: id }
      // TODO remove workaround after refactoring the FilterListSearch to use V-Model
      if (this.pgtrParams.query.title) {
        this.callClearSearchOnFilterList('filterSearch')
        this.pgtrSetSearch('title', '')
      }
    },

    buildBreadcrumbs() {
      if (this.$route.name === 'library.all') {
        this.breadcrumbsList = [this.DEFAULT_BREADCRUMB]
        this.clearLocalBreadcrumbs()
        return
      }

      const folder = this.itemsLibrary && this.itemsLibrary[0] && this.itemsLibrary[0].folder

      if (folder) {
        let breadcrumbs = []
        let currentFolder = folder

        while (currentFolder) {
          breadcrumbs.unshift({
            key: currentFolder.id,
            text:
              currentFolder.title === 'Root'
                ? this.$t('library:header.title')
                : currentFolder.title,
            value: currentFolder.title === 'Root' ? 'root' : currentFolder.id,
          })
          currentFolder = currentFolder.parentFolder
        }
        breadcrumbs.pop()
        this.breadcrumbsList = breadcrumbs
        this.setLocalBreadcrumbsLength(this.breadcrumbsList)
      } else {
        const item = {
          text: this.$route.query.title,
          key: Number(this.$route.params.id),
          value: this.$route.params.id,
        }

        const value = this.getLocalBreadcrumbsLength()

        if (value && value.data) {
          const breadCrumbItemsList = [...value.data, { ...item }].filter(
            (item) => item && item.key !== undefined
          )

          const ids = breadCrumbItemsList.map((item) => item.key)
          const duplicate = ids.filter((id, index) => ids.indexOf(id) !== index)

          if (duplicate.length > 0) {
            breadCrumbItemsList.pop()
          }
          this.breadcrumbsList = breadCrumbItemsList
          this.setLocalBreadcrumbsLength(this.breadcrumbsList)
        } else {
          if (!value && this.itemsLibrary.length === 0) {
            this.breadcrumbsList = [this.DEFAULT_BREADCRUMB, { ...item }]
            this.setLocalBreadcrumbsLength(this.breadcrumbsList)
          }
        }
      }
    },

    formatFileSize,
    openSubmenu() {
      this.showSubmenu = !this.showSubmenu
    },

    downloadFile(item) {
      this.setFetching(true)
      this.attemptDownloadLibraryFileRetrieval({
        id: item.id,
        fileName: item.filename,
      }).finally(() => {
        this.setFetching(false)
      })
    },
    async accessFolderContent(item) {
      if (!item || typeof item !== 'object' || !item.isFolder) {
        return
      }

      const id = item.id
      const title = item.title

      await this.$router.push({
        name: 'library.folder',
        params: { id: id },
        query: {
          ...this.$route.query,
          title: title,
        },
      })

      this.pgtrParams.filter = { parent_folder_id: id }
    },
  },
}
</script>

<template>
  <div class="main-content library">
    <ContentHeader
      :title="$t('global:submenu.management')"
      :description="$t('library:header.description')"
      :tag="$t('library:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div>
      <FilterList v-if="componentLoader">
        <template slot="other">
          <div class="filter-list-center">
            <div class="p-4">
              <Breadcrumbs
                v-if="breadcrumbsList.length > 0"
                :breadcrumbs-list="breadcrumbsList"
                size="large"
                clickable
                highlight-current
                @click="breadcrumbsClickHandler"
              />
            </div>

            <div class="p-4 gap-2 w-6 flex align-items-center justify-content-end">
              <FilterListSearch
                ref="filterSearch"
                :dark="accessibility"
                :initial-value="pgtrParams.query['title']"
                hide-error-details
                @search="pgtrSetSearch('title', $event)"
              />

              <FilterListOrder
                slot="order"
                :initial-value="pgtrParams.order"
                :options="filterListOrderOptions"
                on-server
                @update-orders="pgtrUpdateOrder"
              />

              <FilterListType
                v-if="notEqualsProfile('student')"
                v-model="listingMode"
                class="p-0 m-0"
                :initial-value="listingMode"
                @change="changeType"
              />
            </div>
          </div>
        </template>
      </FilterList>
    </div>

    <div class="center library-actions-wrapper">
      <ActionSubmenu :show.sync="showSubmenu">
        <Action
          v-if="notEqualsProfile('student') && canWrite('libraries')"
          slot="button"
          :text="$t('library:btn.add')"
          type="button"
          fixed-width
          large
          primary
          @click="openSubmenu()"
        />

        <template slot="actions">
          <Action
            type="button"
            :text="$t('library:btn.folder')"
            :dark="accessibility"
            secondary
            small
            @click="openModalAddMedia(true)"
          />
          <Action
            type="button"
            :text="$t('library:btn.media')"
            :dark="accessibility"
            secondary
            small
            @click="openModalAddMedia()"
          />
        </template>
      </ActionSubmenu>
    </div>

    <div
      v-if="itemsLibrary.length === 0"
      class="p-4"
    >
      <EmptyMessage>
        <h2 v-if="pgtrIsSearching || pgtrIsFiltering">{{ $t('global:search.empty.title') }}</h2>
        <h2 v-else>{{ $t('library.index:empty.title') }}</h2>
        <p v-if="pgtrIsSearching || pgtrIsFiltering">{{ $t('global:search.empty.message') }}</p>
        <p v-else>{{ $t('library.index:empty.message') }}</p>
      </EmptyMessage>
    </div>

    <div
      v-else
      class="center"
    >
      <div
        v-if="!listingMode"
        class="library-list"
        :data-size="$media.mobile ? 2 : 4"
      >
        <CardMedia
          v-for="(item, index) in itemsLibrary"
          :id="item.id"
          :key="index"
          :title="item.title"
          :description="item.description"
          :meta-type="item.metaType"
          :type="getFileTypes(item.vendorMeta.getcontenttype)"
          :size="getFileSize(item)"
          :url="item.url"
          :thumbnail="item.thumbnail"
          :editable="hasWriteAccess"
          :is-locked="item.isLocked"
          :only-read-branch="item.onlyReadBranch"
          :count-files="item.countFiles || 0"
          @delete="openModalConfirm(item)"
          @download="downloadFile(item)"
          @edit="editFile(item, $route.params.id)"
          @accessFolder="accessFolderContent(item)"
        />
      </div>
      <div v-if="listingMode">
        <LibraryDatatable
          :items="itemsLibrary"
          :not-collection="!isDigitalCollection"
          @editFile="editFile"
          @removeFile="openModalConfirm"
          @updateList="updateCardList"
          @openAddMediaModal="openModalAddMedia"
          @accessFolderContent="accessFolderContent"
        />
      </div>
      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>

    <Modal
      v-show="modalMediaActive && !creating"
      :active="modalMediaActive && !creating"
      @close="$router.back()"
    >
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('library:modal.subtitle') }}</span>
        <h2 class="modal-title text-color text-color">
          {{ formData.id ? $t('library:modal.title.edit') : $t('library:modal.title.add') }}
        </h2>
        <form
          class="center"
          @submit.prevent="saveMedia"
        >
          <SelectField
            v-model="formData.type"
            :label="$t('global:form.type')"
            :show-optional="false"
            :items="fileTypeOptions"
            :validation="$v.formData.type"
            dark
            @input="resetMediaForm"
          />
          <InputField
            v-model="formData.title"
            :label="$t('global:form.title')"
            :counter="100"
            :validation="$v.formData.title"
            dark
          />
          <TextareaField
            v-model="formData.description"
            :label="$t('global:form.description')"
            :counter="280"
            :rows="1"
            :max-rows="5"
            :validation="$v.formData.description"
            auto-grow
            dark
          />

          <BranchSelector
            v-if="$isEnabledFeature('branching')"
            :value="savedBranches"
            :validation="$v.formData.branches"
            class="mb-5"
            multiple
            @change="formData.branches = $event"
          >
            <BranchSelectorOptions
              v-model="formData"
              :data="formData.branches"
            />
          </BranchSelector>

          <div v-if="formData.type === 'file'">
            <FileField
              v-model="formData.file"
              :label="$t('global:form.attach.file')"
              :validation="$v.formData.file"
            />
          </div>
          <div v-if="formData.type === 'external_link'">
            <Input-field
              v-model="formData.url"
              :label="$t('global:external.media.url')"
              :validation="$v.formData.url"
              dark
            />
          </div>
          <div class="form-submit text-center">
            <Action
              :text="formData.id ? $t('global:save') : $t('global:add')"
              type="button"
              secondary
              large
              submit
              fixed-width
            />
          </div>
        </form>
      </div>
    </Modal>

    <Modal
      :active.sync="modalConfirmActive"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('library:modal.confirm.title') }}</h3>
          <div
            v-if="
              currentDeleteItem &&
              (currentDeleteItem.courses.length || currentDeleteItem.sessions.length)
            "
            class="modal-confirm-description"
          >
            <p class="text-color">{{ $t('library:modal.confirm.message') }}</p>
            <ul>
              <li
                v-for="course in currentDeleteItem.courses"
                :key="course.id"
              >
                {{ course.name }}
              </li>
              <li
                v-for="session in currentDeleteItem.sessions"
                :key="session.id"
              >
                {{ session.name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            :text="$t('global:confirm')"
            :dark="accessibility"
            type="button"
            flat
            @click="deleteFile()"
          />
          <Action
            :text="$t('global:cancel')"
            :dark="accessibility"
            type="button"
            class="btn-cancel"
            flat
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>

    <Modal
      v-show="isFolderModalRoute && !creating"
      :active="isFolderModalRoute && !creating"
      @close="$router.back()"
    >
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('library:modal.subtitle') }}</span>
        <h2 class="modal-title text-color text-color">
          {{ $t(`library:modal.title.${formData.id ? 'edit' : 'add'}.folder`) }}
        </h2>
        <form
          class="centerf"
          @submit.prevent="saveMedia(true)"
        >
          <InputField
            v-model="formData.title"
            :label="$t('global:form.title')"
            :counter="100"
            :validation="$v.formData.title"
            dark
          />
          <TextareaField
            v-model="formData.description"
            :label="$t('global:form.description') + ' ' + $t('global:form.optional')"
            :counter="280"
            :rows="1"
            :max-rows="5"
            :validation="$v.formData.description"
            auto-grow
            dark
          />
          <div class="form-submit text-center">
            <Action
              :text="$t(`global:${formData.id ? 'save' : 'create'}`)"
              type="button"
              primary
              large
              submit
              fixed-width
            />
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import 'styles.scss';
</style>
