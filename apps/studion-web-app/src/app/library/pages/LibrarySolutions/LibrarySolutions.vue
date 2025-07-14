<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf, url } from 'vuelidate/lib/validators'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { formatFileSize } from '@/support/utils/storageUnit'
import fileSize from '@/support/customValidators/filesizeValidator'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { libraryMixin } from '@/mixins/libraryMixin'
import { previewModal } from '@/components/general/ModalPreview/methods'

import Accordion from '@/components/general/Accordion'
import AccordionItem from '@/components/general/AccordionItem'
import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import Pagination from '@/components/general/Pagination'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'
import ModalPreview from '@/components/general/ModalPreview'

import { solutionItemAdapter } from './util'

export default {
  name: 'LibrarySolutions',
  components: {
    Accordion,
    AccordionItem,
    Action,
    ActionBar,
    ContentHeader,
    Dropdown,
    DropdownLink,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Icon,
    InputField,
    TextareaField,
    Pagination,
    SelectField,
    ModalPreview,
    Checkbox: () => import('@/components/general/Checkbox'),
    DataStorageProgress: () => import('@/components/general/DataStorageProgress'),
    Datatable: () => import('@/components/general/Datatable'),
    EmptyMessage: () => import('@/components/general/EmptyMessage'),
    FileField: () => import('@/components/general/FileField'),
    Modal: () => import('@/components/general/Modal'),
  },

  mixins: [paginateMixin, libraryMixin],

  data() {
    return {
      allItems: [],
      allItemsLinked: [],
      formDataLinksIds: [],
      solutionsItems: [],
      noLinkItems: [],
      media: null,
      currentAccordionOpened: -1,
      storage: {
        usedPercent: 0,
        max: 0,
        used: 0,
      },
      modalMediaActive: false,
      modalPreviewActive: false,
      modalLinkActive: false,
      modalSelectedSolution: null,
      modalSelectedIndex: null,
      modalConfirmActive: false,
      formData: {
        title: null,
        description: null,
        file: null,
        type: null,
        url: null,
      },
      formDataLinks: [],
      currentDeleteItem: null,
      currentDeleteIndex: null,
      librarySolutionsCoursesQueryParams: {
        page: 1,
      },
      pagingCourses: { actualPage: 1 },
      librarySolutionsUnassocQueryParams: {
        page: 1,
      },
      pagingUnassoc: { actualPage: 1 },
      avoidRefresh: false,
    }
  },
  validations: {
    formData: {
      type: { required },
      title: {
        required,
      },
      description: {
        required,
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
    ...mapState(['Account', 'accessibility']),
    selectedSolutionId() {
      return this.modalSelectedSolution ? this.modalSelectedSolution.id : null
    },

    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'title',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc',
        },
      ]
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
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    'librarySolutionsCoursesQueryParams.page'() {
      if (this.avoidRefresh) {
        this.avoidRefresh = false
        return
      }
      this.loadLibrarySolutions()
    },
    'librarySolutionsUnassocQueryParams.page'() {
      if (this.avoidRefresh) {
        this.avoidRefresh = false
        return
      }
      this.loadLibraryUnassoc()
    },
  },
  created() {
    this.pgtrParams.limit = 4
    this.setFetching(true)

    this.attemptQuotaRetrieval()
      .then((quotaResponse) => {
        this.storage.usedPercent = quotaResponse.data.relative
        this.storage.used = quotaResponse.data.used
        this.storage.max = quotaResponse.data.total
      })
      .then(() => {
        this.loadLibrarySolutions()
        this.loadLibraryUnassoc()
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'libraryWithoutRelationResource',
      'attemptLibraryFileCreation',
      'attemptLibraryFileRemoval',
      'attemptCourseAssociatedLibraryRetrieval',
      'attemptDownloadLibraryFileRetrieval',
      'attemptLibraryWithoutRelationRetrieval',
      'attemptCourseListRetrieval',
      'attemptQuotaRetrieval',
      'attemptLibraryFileCourseAssociation',
      'attemptLibraryFileCourseDisassociation',
      'attemptRetrieveLibraryFile',
    ]),

    previewModal,

    deleteItem(index) {
      const currentItem = this.items[index]
      this.setFetching(true)
      this.attemptLibraryFileRemoval(currentItem.id).then(() => {
        this.setFetching(false)
        this.items.splice(index, 1)
      })
    },
    openModalAddMedia() {
      this.modalMediaActive = true
    },
    closeModalAddMedia() {
      this.modalMediaActive = false
      this.$v.$reset()
      this.formData.title = null
      this.formData.description = null
      this.formData.file = null
    },
    openModalPreview(media) {
      this.setFetching(true)
      this.attemptRetrieveLibraryFile(media.id)
        .then((response) => {
          media.url = window.URL.createObjectURL(response.data)
          this.media = media
          this.modalPreviewActive = true
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    closeModalPreview() {
      this.modalPreviewActive = false
      this.media = null
    },
    openModalAddLink(solution, index) {
      this.modalSelectedSolution = solution
      this.modalSelectedIndex = index
      this.formDataLinksIds = solution.media.map((media) => media.id)
      this.loadAllData({ openModalLink: true })
    },
    closeModalAddLink() {
      this.modalLinkActive = false
      this.modalSelectedSolution = null
      this.allItems.forEach((item) => {
        item.linked = false
      })
      this.formDataLinks = []
      this.formDataLinksIds = []
      this.allItemsLinked = []
      this.noLinkItems.map((obj) => {
        if (obj.linked) {
          obj.linked = false
        }
      })
    },
    openModalConfirm(item, index, list) {
      this.modalConfirmActive = true
      this.currentDeleteItem = item
      this.currentDeleteIndex = index
    },
    closeModalConfirm() {
      this.modalConfirmActive = false
      this.currentDeleteItem = null
      this.currentDeleteIndex = null
    },
    addNewMedia() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.modalMediaActive = false
        this.setFetching(true)
        this.attemptLibraryFileCreation(this.formData)
          .then(({ data }) => {
            this.setFeedback({ message: this.$t('library:feedback.upload.file') })
            this.loadLibrarySolutions({ mustUpdate: true, index: this.currentAccordionOpened })
            this.loadLibraryUnassoc()
            this.closeModalAddMedia()
          })
          .catch(() => {
            this.setFeedback({
              message: this.$t('library:feedback.upload.file.error'),
              type: 'error',
            })
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    resetMediaForm() {
      this.$v.$reset()
      this.formData.type === 'file' ? (this.formData.url = null) : (this.formData.file = null)
    },
    removeLinkFile(course, courseIndex, filesIds, index, elem) {
      this.setFetching(true)
      this.attemptLibraryFileCourseDisassociation({ courseId: course.id, filesIds })
        .then(() => {
          this.loadLibrarySolutions({ mustUpdate: true, index: courseIndex })
          this.loadLibraryUnassoc()
          this.setFeedback({ message: this.$t('library:feedback.removed.link') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    deleteFile() {
      this.modalConfirmActive = false
      this.setFetching(true)
      this.attemptLibraryFileRemoval(this.currentDeleteItem.id)
        .then(() => {
          this.loadLibrarySolutions({ mustUpdate: true, index: this.currentAccordionOpened })
          this.loadLibraryUnassoc()
          this.closeModalConfirm()
          this.setFeedback({ message: this.$t('library:feedback.removed.media') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    addMediaLink(add, id, title) {
      if (add) {
        this.formDataLinks.push({ id: id, title: title })
        this.formDataLinksIds.push(id)
      } else {
        let idx = this.formDataLinks.map((item) => item.id).indexOf(id)
        let idxId = this.formDataLinksIds.indexOf(id)
        if (idx > -1) {
          this.formDataLinks.splice(idx, 1)
        }
        if (idxId > -1) {
          this.formDataLinksIds.splice(idxId, 1)
        }
      }
    },
    saveLinks() {
      this.modalLinkActive = false
      const filesIds = this.formDataLinksIds
      const courseId = this.modalSelectedSolution.id
      this.setFetching(true)
      this.attemptLibraryFileCourseAssociation({ courseId, filesIds })
        .then(({ data }) => {
          this.modalSelectedSolution.media = data.map((file) => {
            return this.fileFormat(file)
          })
          this.modalSelectedSolution.mediaLength = data.length
          this.closeModalAddLink()
        })
        .finally(() => {
          this.loadLibraryUnassoc()
          this.setFetching(false)
        })
    },
    getContent(index, elem) {
      if (!elem.isOpen) {
        this.solutionsItems[index].loading = true
        this.currentAccordionOpened = index
        this.attemptCourseAssociatedLibraryRetrieval({
          courseId: this.solutionsItems[index].id,
        }).then(({ data }) => {
          this.solutionsItems[index].mediaLength = data.length
          if (data.length) {
            this.solutionsItems[index].media = data.map((file) => {
              return this.fileFormat(file)
            })
          } else {
            this.solutionsItems[index].media = []
          }
          this.solutionsItems[index].loading = false
          if (Object.keys(elem).includes('openContent')) {
            elem.openContent()
          }
        })
      }
    },
    getFileTypes(mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })
      return currentFileType ? currentFileType.alias : null
    },
    downloadFile(file) {
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
    updateQuota() {
      this.setFetching(true)
      this.attemptQuotaRetrieval()
        .then(({ data }) => {
          this.storage.usedPercent = data.relative
          this.storage.used = data.used
          this.storage.max = data.total
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    getAllItemsUpdated() {
      this.allItems.forEach((item) => {
        item.linked = !!this.formDataLinksIds.includes(item.id)
      })
    },
    updateAllItemsAfterChanges(content) {
      let isLinked
      this.allItems.forEach((item) => {
        if (
          typeof content === 'object' &&
          Object.keys(content).includes('firstTime') &&
          content.firstTime === true &&
          this.allItems.length > 0
        ) {
          isLinked =
            this.modalSelectedSolution.media.filter((media) => {
              return media.id === item.id
            }).length > 0
          item.linked = isLinked
        } else {
          isLinked = item.linked
        }
        if (!this.formDataLinksIds.includes(item.id) && item.linked) {
          this.formDataLinks.push(item)
        }
        // add or update item in complete list item
        if (
          this.allItemsLinked.filter((media) => {
            if (media.id === item.id) {
              media.linked = item.linked
              return true
            } else {
              return false
            }
          }).length === 0
        ) {
          let itemAux = item
          itemAux.linked = isLinked
          this.allItemsLinked.push(itemAux)
        }
      })
    },
    async loadAllData(content) {
      this.setFetching(true)
      this.pgtrInitializePagination('libraryWithoutRelationResource')

      this.$nextTick(() => {
        this.allItems = []
        let isFirstTime = false

        if (
          typeof content === 'object' &&
          Object.keys(content).includes('openModalLink') &&
          content.openModalLink === true
        ) {
          this.modalLinkActive = true
          isFirstTime = true
        }

        if (this.pgtrCurrentData.length) {
          this.allItems = this.pgtrCurrentData.map((file) => {
            return this.fileFormat(file)
          })
          if (this.allItemsLinked.length === 0) this.allItemsLinked = this.allItems
          else if (this.modalLinkActive) this.getAllItemsUpdated()

          if (this.modalLinkActive) this.updateAllItemsAfterChanges({ firstTime: isFirstTime })
        }

        this.setFetching(false)
      })
    },
    fileFormat(file) {
      return {
        id: file.id,
        title: file.title,
        description: file.description,
        size: this.getFileSize(file),
        url: file.path,
        metaType: file.meta.type || 'file',
        type: this.getFileTypes(file.meta.type),
        fileName: file.filename,
        courses: file.courses ? file.courses : [],
        sessions: file.sessions ? file.sessions : [],
        countFiles: file.countFiles ? file.countFiles : 0,
      }
    },
    formatSize(size) {
      return formatFileSize(size)
    },
    nextPageCourses() {
      if (this.pagingCourses.nextPage) {
        this.librarySolutionsCoursesQueryParams.page = this.pagingCourses.nextPage
      }
    },
    previousPageCourses() {
      if (this.pagingCourses.previousPage) {
        this.librarySolutionsCoursesQueryParams.page = this.pagingCourses.previousPage
      }
    },
    lastPageCourses() {
      if (this.pagingCourses.lastPage) {
        this.librarySolutionsCoursesQueryParams.page = this.pagingCourses.lastPage
      }
    },
    firstPageCourses() {
      if (this.pagingCourses.firstPage) {
        this.librarySolutionsCoursesQueryParams.page = this.pagingCourses.firstPage
        this.loadLibrarySolutions()
      }
    },
    changeItemsPerPageCourses(val, type) {
      this.avoidRefresh = true
      if (type === 'courses') {
        this.librarySolutionsCoursesQueryParams.limit = val
        this.firstPageCourses()
      } else {
        this.librarySolutionsUnassocQueryParams.limit = val
        this.firstPageUnassoc()
      }
    },
    loadLibrarySolutions(updateContent) {
      this.setFetching(true)
      this.attemptCourseListRetrieval(this.librarySolutionsCoursesQueryParams)
        .then((libraryCoursesFilesResponse) => {
          if (libraryCoursesFilesResponse.data.data.length) {
            this.solutionsItems = libraryCoursesFilesResponse.data.data.map((item) => {
              return solutionItemAdapter(item)
            })
            this.pagingCourses = libraryCoursesFilesResponse.data
            if (updateContent && updateContent.mustUpdate) {
              if (updateContent.index >= 0) {
                this.getContent(updateContent.index, { isOpen: false })
              }
            }
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    nextPageUnassoc() {
      if (this.pagingUnassoc.nextPage) {
        this.librarySolutionsUnassocQueryParams.page = this.pagingUnassoc.nextPage
      }
    },
    previousPageUnassoc() {
      if (this.pagingUnassoc.previousPage) {
        this.librarySolutionsUnassocQueryParams.page = this.pagingUnassoc.previousPage
      }
    },
    lastPageUnassoc() {
      if (this.pagingUnassoc.lastPage) {
        this.librarySolutionsUnassocQueryParams.page = this.pagingUnassoc.lastPage
      }
    },
    firstPageUnassoc() {
      if (this.pagingUnassoc.firstPage) {
        this.librarySolutionsUnassocQueryParams.page = this.pagingUnassoc.firstPage
        this.loadLibraryUnassoc()
      }
    },
    loadLibraryUnassoc() {
      this.setFetching(true)
      this.attemptLibraryWithoutRelationRetrieval(this.librarySolutionsUnassocQueryParams)
        .then((libraryUnrelatedResponse) => {
          this.noLinkItems = libraryUnrelatedResponse.data.data.map((file) => this.fileFormat(file))
          this.pagingUnassoc = libraryUnrelatedResponse.data
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <div class="main-content library">
    <ContentHeader
      :title="$t('library:tab.link.2')"
      :description="$t('library:header.description.2')"
      :tag="$t('library:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-3">
      <FilterList>
        <Action
          v-if="notEqualsProfile('student') && canWrite('libraries')"
          slot="button"
          :text="$t('library:btn.add')"
          type="button"
          primary
          large
          fixed-width
          :dark="accessibility"
          @click="openModalAddMedia()"
        />
        <template
          v-if="storage.used > 0"
          slot="other"
        >
          <DataStorageProgress
            :used="storage.used"
            :used-percent="storage.usedPercent"
            :total="storage.max"
          />
        </template>
      </FilterList>
    </div>

    <div class="p-3">
      <EmptyMessage v-if="solutionsItems.length === 0">
        <h2>{{ $t('library.solutions:empty.title') }}</h2>
      </EmptyMessage>
    </div>

    <div class="center">
      <Accordion
        v-if="solutionsItems.length"
        card
        :dark="accessibility"
      >
        <template slot="header">
          <span class="accordion-header-text">{{
            $t('library.solutions:accordion.header.1')
          }}</span>
          <span
            v-if="!$media.mobile"
            class="accordion-header-text"
            >{{ $t('library.solutions:accordion.header.2') }}</span
          >
        </template>
        <AccordionItem
          v-for="(item, index) in solutionsItems"
          :key="index"
          :loading="item.loading"
          @open="getContent(index, $event)"
        >
          <template slot="header">
            <span class="library-solution-title">{{ item.name }}</span>
            <span class="library-solution-media">{{
              $tc('library.solutions:accordion.media', item.mediaLength, { num: item.mediaLength })
            }}</span>
          </template>
          <template
            v-if="!item.loading"
            slot="content"
          >
            <div
              v-if="notEqualsProfile('student') && canWrite('libraries')"
              :class="{ 'text-right': !$media.mobile }"
            >
              <Action
                type="button"
                :dark="accessibility"
                :text="$t('library.solutions:btn.add.link')"
                flat
                @click="openModalAddLink(item, index)"
              />
            </div>
            <div
              v-if="item.media.length === 0"
              class="accordion-empty text-center"
            >
              <p>{{ $t('library.solutions:accordion.empty') }}</p>
            </div>
            <Datatable
              v-else
              :items="item.media"
              light
              :dark="accessibility"
            >
              <template
                v-if="!$media.mobile"
                slot="thead"
              >
                <tr>
                  <th
                    class="th"
                    width="40"
                  ></th>
                  <th class="th">{{ $t('library:datatable.header.1') }}</th>
                  <th
                    class="th"
                    width="150"
                  >
                    {{ $t('library:datatable.header.2') }}
                  </th>
                  <th
                    class="th text-center"
                    width="120"
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
                    colspan="2"
                  >
                    <Icon
                      :name="getFileIconName(props.item)"
                      class="icon-filetype"
                      wrapper
                    />
                    <span class="td-text bolder">{{ props.item.title }}</span>
                  </td>
                </tr>
                <tr class="tr-small">
                  <td
                    v-if="!$media.mobile"
                    class="td"
                  >
                    <Icon
                      :name="getFileIconName(props.item)"
                      class="icon-filetype"
                      wrapper
                    />
                  </td>
                  <td
                    v-if="!$media.mobile"
                    class="td"
                  >
                    <span class="td-text bolder">{{ props.item.title }}</span>
                  </td>
                  <td class="td">
                    <span
                      v-if="$media.mobile"
                      class="td-text-header td-text-header-inline"
                      >{{ $t('library:datatable.header.2') }}</span
                    >
                    <span class="td-text">{{
                      props.item.metaType !== 'external_link'
                        ? getFileSizeMeta(props.item)
                        : 'Mídia externa'
                    }}</span>
                  </td>
                  <td
                    class="td td-actions"
                    width="120"
                  >
                    <Action
                      v-if="props.item.metaType === 'file'"
                      type="button"
                      icon="download"
                      class="text-color"
                      @click="downloadFile(props.item)"
                    />
                    <Action
                      v-if="props.item.metaType === 'external_link'"
                      type="link"
                      icon="visibility"
                      :url="props.item.url"
                      target="_blank"
                    />
                    <Dropdown
                      v-if="notEqualsProfile('student') && canWrite('libraries')"
                      icon="dots-vertical"
                      right
                    >
                      <DropdownLink
                        :text="$t('global:remove.linked')"
                        @click="removeLinkFile(item, index, props.item.id, props.index, $event)"
                      />
                      <DropdownLink
                        :text="$t('global:remove')"
                        @click="openModalConfirm(props.item, index, 'solution')"
                      />
                      <DropdownLink
                        v-if="props.item.metaType === 'file'"
                        :text="$t('global:download')"
                        @click="downloadFile(props.item)"
                      />
                    </Dropdown>
                  </td>
                </tr>
              </template>
            </Datatable>
          </template>
        </AccordionItem>
        <Pagination
          :active-page="pagingCourses.actualPage"
          :page-count="pagingCourses.lastPage"
          @next-page="nextPageCourses"
          @previous-page="previousPageCourses"
          @first-page="firstPageCourses"
          @last-page="lastPageCourses"
          @go-to-page="librarySolutionsCoursesQueryParams.page = $event"
          @change-items-per-page="changeItemsPerPageCourses($event, 'courses')"
        />
      </Accordion>

      <template v-if="noLinkItems.length">
        <Datatable
          :items="noLinkItems"
          :title="$t('library.solutions:datatable.title')"
          light
          card
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="60"
              ></th>
              <th class="th">{{ $t('library:datatable.header.1') }}</th>
              <th
                class="th"
                width="170"
              >
                {{ $t('library:datatable.header.2') }}
              </th>
              <th
                class="th"
                width="120"
              ></th>
            </tr>
          </template>
          <template
            slot="tbody"
            slot-scope="props"
          >
            <tr
              v-if="$media.mobile"
              class="tr-colspan tr-colspan-small"
            >
              <td
                class="td"
                colspan="2"
              >
                <Icon
                  :name="getFileIconName(props.item)"
                  class="icon-filetype"
                  wrapper
                />
                <span class="td-text bolder">{{ props.item.title }}</span>
              </td>
            </tr>
            <tr :class="{ 'tr-small': $media.mobile }">
              <td
                v-if="!$media.mobile"
                class="td"
              >
                <Icon
                  :name="getFileIconName(props.item)"
                  class="icon-filetype"
                  wrapper
                />
              </td>
              <td
                v-if="!$media.mobile"
                class="td"
              >
                <span class="td-text bolder">{{ props.item.title }}</span>
              </td>
              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header td-text-header-inline"
                  >{{ $t('library:datatable.header.2') }}</span
                >
                <span class="td-text">{{
                  props.item.metaType === 'file' ? props.item.size : 'Mídia externa'
                }}</span>
              </td>

              <td
                class="td td-actions"
                width="120"
              >
                <Action
                  v-if="previewModal().accept(props.item.type, props.item.metaType)"
                  type="button"
                  icon="visibility"
                  @click="openModalPreview(props.item)"
                />
                <Action
                  v-if="props.item.metaType === 'external_link'"
                  :url="props.item.url"
                  type="link"
                  icon="goto-external"
                  target="_blank"
                />
                <Action
                  v-if="props.item.metaType !== 'external_link'"
                  type="link"
                  icon="download"
                  class="text-color"
                  download
                  @click="downloadFile(props.item)"
                />
                <Dropdown
                  v-if="notEqualsProfile('student') && canWrite('libraries')"
                  icon="dots-vertical"
                  right
                >
                  <DropdownLink
                    :text="$t('global:remove')"
                    @click="openModalConfirm(props.item, props.index, 'unrelated')"
                  />
                  <DropdownLink
                    v-if="previewModal().accept(props.item.type, props.item.metaType)"
                    :text="$t('global:view.more')"
                    @click="openModalPreview(props.item)"
                  />
                  <DropdownLink
                    v-if="props.item.metaType === 'file'"
                    :text="$t('global:download')"
                    download
                    @click="downloadFile(props.item)"
                  />
                </Dropdown>
              </td>
            </tr>
          </template>
        </Datatable>
        <Pagination
          :active-page="pagingUnassoc.actualPage"
          :page-count="pagingUnassoc.lastPage"
          @next-page="nextPageUnassoc"
          @previous-page="previousPageUnassoc"
          @first-page="firstPageUnassoc"
          @last-page="lastPageUnassoc"
          @go-to-page="librarySolutionsUnassocQueryParams.page = $event"
          @change-items-per-page="changeItemsPerPageCourses($event, 'unassoc')"
        />
      </template>
    </div>

    <Modal
      :active.sync="modalMediaActive"
      @close="closeModalAddMedia()"
    >
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('library:modal.subtitle') }}</span>
        <h2 class="modal-title">
          {{ formData.id ? $t('library:modal.title.edit') : $t('library:modal.title.add') }}
        </h2>
        <form @submit.prevent="addNewMedia">
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
            auto-grow
            :validation="$v.formData.description"
            dark
          />
          <div v-if="formData.type === 'file'">
            <FileField
              v-model="formData.file"
              :label="$t('global:form.attach.file')"
              :validation="$v.formData.file"
              dark
            />
          </div>
          <div v-if="formData.type === 'external_link'">
            <InputField
              v-model="formData.url"
              :label="$t('global:external.media.url')"
              :validation="$v.formData.url"
              dark
            />
          </div>
          <div class="form-submit text-center">
            <Action
              :text="formData.id ? $t('global:edit') : $t('global:add')"
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

    <ModalPreview
      v-if="media"
      :media="media"
      :is-active="modalPreviewActive"
      @close="closeModalPreview"
      @download="downloadFile(media)"
    />

    <Modal
      :active.sync="modalLinkActive"
      @close="closeModalAddLink()"
    >
      <div class="modal-form is-expanded">
        <span class="modal-subtitle">{{ $t('library:modal.link.subtitle') }}</span>
        <h2 class="modal-title is-capitalize">
          {{ modalSelectedSolution ? modalSelectedSolution.name : '' }}
        </h2>
        <div class="modal-description">
          <p>{{ $t('library:modal.link.description') }}</p>
        </div>
        <div class="content">
          <FilterList>
            <FilterListSearch
              slot="search"
              :dark="true"
              :hide-error-details="true"
              @search="pgtrSetSearch('title', $event)"
            />
            <FilterListOrder
              slot="order"
              :dark="true"
              :on-server="true"
              :options="filterListOrderOptions"
              @update-orders="pgtrUpdateOrder"
            />
          </FilterList>
        </div>
        <EmptyMessage v-if="pgtrCurrentData.length === 0">
          <h2>{{ $t('library:modal.link.empty.title') }}</h2>
          <p v-html="$t('library:modal.link.empty.message')"></p>
        </EmptyMessage>
        <form
          v-if="pgtrCurrentData.length"
          @submit.prevent="saveLinks"
        >
          <Datatable
            :items="pgtrCurrentData"
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
                  class="th text-center"
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
                  <span class="td-text bolder">{{ props.item.title }}</span>
                </td>
              </tr>
              <tr>
                <td
                  v-if="!$media.mobile"
                  class="td"
                >
                  <span class="td-text bolder">{{ props.item.title }}</span>
                </td>
                <td class="td">
                  <span
                    v-if="$media.mobile"
                    class="td-text-header td-text-header-inline"
                    >{{ $t('library:datatable.header.2') }}</span
                  >
                  <span class="td-text">{{
                    props.item.metaType !== 'external_link'
                      ? getFileSize(props.item)
                      : 'Mídia externa'
                  }}</span>
                </td>
                <td
                  class="td td-actions"
                  width="40"
                >
                  <Action
                    v-if="props.item.meta.type !== 'external_link'"
                    type="button"
                    icon="download"
                    class="text-color"
                    download
                    @click="downloadFile(props.item)"
                  />
                  <Action
                    v-else
                    type="link"
                    icon="visibility"
                    :url="props.item.path"
                    target="_blank"
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
                    @input="addMediaLink($event, props.item.id, props.item.title)"
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
          />

          <div class="flex gap-2">
            <p class="text-base">{{ $t('library:modal.link.datatable.selected') }}</p>
            <span class="text-base">{{ formDataLinks.length }}</span>
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
    </Modal>

    <Modal :active.sync="modalConfirmActive">
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
            <p>{{ $t('library:modal.confirm.message') }}</p>
            <ul>
              <li
                v-for="(course, index) in currentDeleteItem.courses"
                :key="index"
              >
                {{ course.name }}
              </li>
              <li
                v-for="(session, index) in currentDeleteItem.sessions"
                :key="index"
              >
                {{ session.name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            type="button"
            :text="$t('global:confirm')"
            flat
            :dark="accessibility"
            @click="deleteFile()"
          />
          <Action
            type="button"
            :text="$t('global:cancel')"
            flat
            class="btn-cancel"
            :dark="accessibility"
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import 'styles.scss';
</style>
