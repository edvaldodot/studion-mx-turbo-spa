<template>
  <div class="folder-selector mt-3">
    <div class="folder-selector__selector">
      <div class="folder-selector__filter">
        <input-field prependIcon="search" v-model="search" dark :placeholder="$t('global:search')" @input="searchFolder" />
      </div>

      <div class="folder-selector__results">
        <loading
          :dark="dark"
          v-if="isLoading"
        />

        <div class="branch-selector__result" v-else-if="canWrite('classroom:library')">
          <breadcrumbs
            v-if="breadcrumbsList.length && !isSearch"
            clickable
            highlight-current
            size="large"
            :breadcrumbs-list="breadcrumbsList"
            @click="changeFolderByBreadcrumb"
          />

          <radio
            v-if="mappedFolders"
            :dark="dark"
            :items=" mappedFolders"
            :class="{ 'is-search': isSearch }"
            v-model="currentFolderId"
            dynamic
          >
            <template slot="precontent" slot-scope="props">
              <breadcrumbs
                v-if="isSearch"
                clickable
                highlight-current
                size="large"
                :breadcrumbs-list="props.item.breadcrumbs"
                @click="changeFolderByBreadcrumb"
              />
            </template>

            <template slot="actions" slot-scope="props">
              <action
                v-if="hasChildren(props.item)"
                flat
                type="button"
                icon="keyboard_arrow_right"
                @click="openFolder(props.item)"
              />
            </template>
          </radio>

          <empty-message v-if="isSearch && !mappedFolders.length">
            <h2>{{ $t('global:search.empty.title') }}</h2>
          </empty-message>
        </div>
      </div>
    </div>
    <div class="folder-selector__info">
      <action
        flat
        type="button"
        :text="$t('global:folders.select')"
        @click="selectFolder"
        v-if="canWrite('classroom:library')"
      />

      <h3 class="form-section-title mt-3">{{ $t('global:folders.selected') }}</h3>

      <breadcrumbs
        highlight-current
        size="large"
        :dark="dark"
        :breadcrumbs-list="selectedFolder"
      />

      <div class="validation-message" v-if="validation.$error">
        <validation-message :validation="validation" />
      </div>
    </div>
  </div>
</template>
<script>
/// <reference path="../../utils/typedefs.js" />
import { mapActions } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import { searchFolderByName, getBreadcrumb, findParentFolder } from './utils'

import Action from '@/components/general/Action'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
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
    FilterList,
    FilterListSearch
  },
  props: {
    dark: {
      type: Boolean,
      default: false
    },
    validation: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      search: '',
      isLoading: false,
      breadcrumbsList: [],
      currentParent: null,
      folders: [],
      mappedFolders: null,
      currentFolderId: null,
      selectedFolder: null,
      folderTree: []
    }
  },
  computed: {
    isSearch () {
      return this.search.length > 0
    }
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
    }
  },
  /**
   * Get folders from backend and set initial breadcrumbList, currentFolderId and mappedFolders
   * checking if value is set meaning that we are editing a folder
   */
  async created () {
    this.isLoading = true
    const response = await this.attemptGetFolderList(this.$route.params.session_uuid)
    this.isLoading = false
    this.folders = cloneDeep(response.data)
    if (typeof this.value !== 'number') {
      this.initializeEmptySelector(response.data)
      return
    }
    this.initializeCheckedSelector(this.value, this.folders)
  },
  methods: {
    ...mapActions(['attemptGetFolderList']),
    /**
     * Access a folder by clicking on the breadcrumb
     * generating a new breadcrumbList and accessing the selected folder
     * @param {Folder} folder
     */
    changeFolderByBreadcrumb (folder) {
      this.search = ''
      this.breadcrumbsList = getBreadcrumb(folder.id, this.folders)
      this.accessFolder(folder)
    },
    /**
     * Check if a folder has at least one child
     * @param {Folder} folder
     */
    hasChildren (folder) {
      return folder.children && folder.children.length
    },
    selectFolder () {
      if (this.currentFolderId === null) return
      this.selectedFolder = getBreadcrumb(this.currentFolderId, this.folders, true)
      this.$emit('input', this.currentFolderId)
    },
    /**
     * open a folder by clicking on the arrow
     * @param {Folder} folder
     */
    openFolder (folder) {
      this.search = ''
      this.accessFolder(folder)
    },
    /**
     * add a folder to the breadcrumbList
     * @params {Folder} folder
     */
    addBreadcrumb (folder) {
      this.breadcrumbsList.push({
        key: folder.id,
        text: folder.name,
        value: folder
      })
    },
    /**
     * map a folder to the mappedFolders array
     * @param {Folder} folder
     */
    mapFolder (folder) {
      folder = cloneDeep(folder)
      this.currentParent = folder
      const folders = [...folder.children]
      folders.unshift(folder)
      this.mappedFolders = folders.map(folder => {
        return {
          ...folder,
          label: folder.name,
          value: folder.id || 0
        }
      })
    },
    /**
     * Go deep in the folders tree mapping the new folder
     * and adding that folder to the breadcrumbList
     * @params {Folder} folder
     */
    accessFolder (folder) {
      this.mapFolder(folder)
      this.addBreadcrumb(folder)
    },
    searchFolder (search) {
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
    getRootFolder (folders) {
      return {
        id: 0,
        name: this.$t('global:menu.classroom.library'),
        children: folders
      }
    },
    resetSearch () {
      const rootFolder = this.getRootFolder(this.folders)
      this.mapFolder(rootFolder)
      this.breadcrumbsList = [
        {
          key: 0,
          text: this.$t('global:menu.classroom.library'),
          value: rootFolder
        }
      ]
    },
    getFolderTree () {
      return {
        id: 0,
        name: this.$t('global:menu.classroom.library'),
        value: 0,
        children: cloneDeep(this.folders)
      }
    },
    /**
     * Initialize the folder selector with no selected Folder
     * @param {Array.<Folder>} folders
     */
    initializeEmptySelector (folders) {
      this.mapFolder({
        name: this.$t('global:menu.classroom.library'),
        value: 0,
        children: folders
      })
      this.breadcrumbsList = [
        {
          key: 0,
          text: this.$t('global:menu.classroom.library'),
          value: this.getRootFolder(folders)
        }
      ]
    },
    /**
     * Initialize the folder with a selected folder
     * @param {number} value
     * @param {Array.<Folder>} folders
     */
    initializeCheckedSelector (value, folders) {
      this.currentFolderId = value
      this.selectFolder()
      const folderTree = this.getFolderTree()
      const folder = findParentFolder(folderTree, value)
      if (!folder) {
        this.mapFolder({
          name: this.$t('global:menu.classroom.library'),
          value: 0,
          children: folders
        })
        return
      }
      this.breadcrumbsList = getBreadcrumb(folder.id, folders)
      this.accessFolder(folder)
      this.currentFolderId = value
    }
  }
}
</script>
<style lang="scss">
  @import 'FolderSelector.scss';
</style>
