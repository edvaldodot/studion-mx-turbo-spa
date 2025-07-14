<script>
import { mapActions, mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import { searchFolderByName, getBreadcrumb, findParentFolder } from './utils'

import Action from '@/components/general/Action'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import ValidationMessage from '@/components/general/ValidationMessage'
import Radio from '@/components/general/Radio'
import InputField from '@/components/general/InputField'
import Loading from '@/components/general/Loading'
import EmptyMessage from '@/components/general/EmptyMessage'

export default {
  components: {
    Action,
    Breadcrumbs,
    ValidationMessage,
    Radio,
    Loading,
    EmptyMessage,
    InputField,
  },
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: Number,
      default: null,
    },
    filter: {
      type: Number,
      default: null,
    },
    mock: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      search: '',
      isLoading: false,
      breadcrumbsList: [],
      currentParent: null,
      folders: [],
      mappedFolders: null,
      currentFolderId: null,
      selectedFolder: null,
      folderTree: [],
    }
  },
  computed: {
    ...mapState(['Classroom']),
    isSearch() {
      return this.search.length > 0
    },
  },
  watch: {
    /**
     * watch for changes in the v-model value, if the selected folder is changed
     * we need to update the breadcrumbsList, currentFolderId and mappedFolders
     */
    value: function () {
      const folderTree = this.getFolderTree()
      let folder = findParentFolder(folderTree, this.value)
      if (!folder) folder = this.getRootFolder(this.folders)
      this.breadcrumbsList = getBreadcrumb(folder.id, this.folders, true)
      this.mapFolder(folder)
      this.currentFolderId = this.value
    },
  },
  /**
   * Get folders from backend and set initial breadcrumbList, currentFolderId and mappedFolders
   * checking if value is set meaning that we are editing a folder
   */
  async created() {
    if (this.mock) {
      this.mappedFolders = [
        {
          name: this.$t('global:menu.classroom.conference'),
          value: 0,
          children: [],
          label: this.$t('global:menu.classroom.conference'),
          disabled: false,
        },
      ]
      this.isLoading = false
      this.selectedFolder = [
        {
          key: 0,
          text: this.$t('global:menu.classroom.conference'),
          value: { id: 0, name: this.$t('global:menu.classroom.conference'), children: [] },
        },
      ]
      return
    }

    this.isLoading = true
    const response = await this.attemptGetConferenceFolderOptions(this.Classroom.data.id)
    this.isLoading = false
    this.folders = cloneDeep(response.data).map((folder) => {
      return {
        ...folder,
        disabled: folder.id == this.filter,
      }
    })

    if (typeof this.value !== 'number') {
      this.initializeEmptySelector(response.data)
      return
    }
    this.initializeCheckedSelector(this.value, this.folders)
  },
  methods: {
    ...mapActions(['attemptGetConferenceFolderOptions']),
    /**
     * Access a folder by clicking on the breadcrumb
     * generating a new breadcrumbList and accessing the selected folder
     * @param {Folder} folder
     */
    changeFolderByBreadcrumb(folder) {
      this.search = ''
      this.breadcrumbsList = getBreadcrumb(folder.id, this.folders)
      this.accessFolder(folder)
    },
    /**
     * Check if a folder has at least one child
     * @param {Folder} folder
     */
    hasChildren(folder) {
      return folder.children && folder.children.length
    },
    selectFolder() {
      if (this.currentFolderId === null) return
      this.selectedFolder = getBreadcrumb(this.currentFolderId, this.folders, true)
      this.$emit('input', this.currentFolderId)
    },
    /**
     * open a folder by clicking on the arrow
     * @param {Folder} folder
     */
    openFolder(folder) {
      this.search = ''
      this.accessFolder(folder)
    },
    /**
     * add a folder to the breadcrumbList
     * @params {Folder} folder
     */
    addBreadcrumb(folder) {
      this.breadcrumbsList.push({
        key: folder.id,
        text: folder.name,
        value: folder,
      })
    },
    /**
     * map a folder to the mappedFolders array
     * @param {Folder} folder
     */
    mapFolder(folder) {
      folder = cloneDeep(folder)
      this.currentParent = folder
      const folders = [...folder.children]
      folders.unshift(folder)
      this.mappedFolders = folders.map((folder) => {
        return {
          ...folder,
          label: folder.name,
          value: folder.id || 0,
        }
      })
    },
    /**
     * Go deep in the folders tree mapping the new folder
     * and adding that folder to the breadcrumbList
     * @params {Folder} folder
     */
    accessFolder(folder) {
      this.mapFolder(folder)
      this.addBreadcrumb(folder)
    },
    searchFolder(search) {
      if (!search) {
        this.resetSearch()
        return
      }
      this.mappedFolders = searchFolderByName(search, this.folders)
    },
    /**
     * Get the root folder of the folders tree
     * @param {Array.<Folder>} folders
     */
    getRootFolder(folders) {
      return {
        id: 0,
        name: this.$t('global:menu.classroom.conference'),
        children: folders,
      }
    },
    resetSearch() {
      const rootFolder = this.getRootFolder(this.folders)
      this.mapFolder(rootFolder)
      this.breadcrumbsList = [
        {
          key: 0,
          text: this.$t('global:menu.classroom.conference'),
          value: rootFolder,
        },
      ]
    },
    getFolderTree() {
      return {
        id: 0,
        name: this.$t('global:menu.classroom.conference'),
        value: 0,
        children: cloneDeep(this.folders),
      }
    },
    /**
     * Initialize the folder selector with no selected Folder
     * @param {Array.<Folder>} folders
     */
    initializeEmptySelector(folders) {
      this.mapFolder({
        name: this.$t('global:menu.classroom.conference'),
        value: 0,
        children: folders,
      })
      this.breadcrumbsList = [
        {
          key: 0,
          text: this.$t('global:menu.classroom.conference'),
          value: this.getRootFolder(folders),
        },
      ]
    },
    /**
     * Initialize the folder with a selected folder
     * @param {number} value
     * @param {Array.<Folder>} folders
     */
    initializeCheckedSelector(value, folders) {
      this.currentFolderId = value
      this.selectFolder()
      const folderTree = this.getFolderTree()
      const folder = findParentFolder(folderTree, value)
      if (!folder) {
        this.mapFolder({
          name: this.$t('global:menu.classroom.conference'),
          value: 0,
          children: folders,
        })
        return
      }
      this.breadcrumbsList = getBreadcrumb(folder.id, folders)
      this.accessFolder(folder)
      this.currentFolderId = value
    },
  },
}
</script>
<template>
  <div
    class="folder-selector"
    :class="{ '--dark': dark, '--disabled': mock }"
  >
    <div class="folder-selector__selector border-black-300">
      <div class="folder-selector__filter">
        <InputField
          v-model="search"
          :placeholder="$t('global:search')"
          :disabled="mock"
          prepend-icon="search"
          dark
          class="text-color"
          @input="searchFolder"
        />
      </div>

      <div class="folder-selector__results">
        <Loading
          v-if="isLoading"
          :dark="dark"
        />

        <div class="branch-selector__result">
          <Breadcrumbs
            v-if="breadcrumbsList.length && !isSearch"
            :breadcrumbs-list="breadcrumbsList"
            size="large"
            highlight-current
            clickable
            @click="changeFolderByBreadcrumb"
          />

          <Radio
            v-if="mappedFolders"
            v-model="currentFolderId"
            :dark="dark"
            :items="mappedFolders"
            :class="{ 'is-search': isSearch }"
            :disabled="mock"
            dynamic
          >
            <template
              slot="precontent"
              slot-scope="props"
            >
              <Breadcrumbs
                v-if="isSearch"
                :breadcrumbs-list="props.item.breadcrumbs"
                size="large"
                highlight-current
                clickable
                @click="changeFolderByBreadcrumb"
              />
            </template>

            <template
              slot="actions"
              slot-scope="props"
            >
              <Action
                v-if="hasChildren(props.item)"
                :disabled="props.item.disabled"
                icon="keyboard_arrow_right"
                type="button"
                flat
                @click="openFolder(props.item)"
              />
            </template>
          </Radio>

          <EmptyMessage v-if="isSearch && !mappedFolders.length">
            <h2>{{ $t('global:search.empty.title') }}</h2>
          </EmptyMessage>
        </div>
      </div>
    </div>
    <div class="folder-selector__info">
      <Action
        v-if="canWrite('classroom:library') && !mock"
        :text="$t('global:folders.select')"
        :dark="dark"
        type="button"
        flat
        @click="selectFolder"
      />

      <h3 class="form-section-title mt-3">{{ $t('global:folders.selected') }}</h3>

      <Breadcrumbs
        highlight-current
        size="large"
        :dark="dark"
        :breadcrumbs-list="selectedFolder"
      />

      <div
        v-if="validation.$error"
        class="validation-message"
      >
        <ValidationMessage :validation="validation" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'ConferenceFolderSelector.scss';
</style>
