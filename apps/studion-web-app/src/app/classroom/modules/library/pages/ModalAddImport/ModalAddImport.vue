<script>
import { mapActions, mapState } from 'vuex'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import DatatableModalAddImport from './components/DatatableModalAddImport.vue'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import EmptyMessage from '@/components/general/EmptyMessage'
import HorizontalSwitch from '@/components/general/HorizontalSwitch'
import Modal from '@/components/general/Modal'
import Pagination from '@/components/general/Pagination'

import { downloadFileMixin } from '@/mixins/downloadFileMixin.js'
import filterOptionsMixin from '../../utils/filterOptionsMixin'
import { paginateMixin } from '@/mixins/paginatorMixin'

export default {
  name: 'ModalAddImport',

  components: {
    Breadcrumbs,
    DatatableModalAddImport,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    HorizontalSwitch,
    Modal,
    Pagination,
  },

  mixins: [downloadFileMixin, filterOptionsMixin, paginateMixin],

  props: {
    horizontalSwitchOptions: {
      type: Array,
      required: true,
    },

    modalImportActive: {
      type: Boolean,
      default: false,
    },

    selectedOption: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    propId: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      breadcrumbsList: [
        {
          text: this.$t('global:menu.classroom.library'),
          key: 'root',
        },
      ],
      formDataLinks: [],
      importValidate: false,
      mutableSelectedOption: this.selectedOption,
      mutableModalImportActive: this.modalImportActive,
    }
  },

  computed: {
    ...mapState(['Classroom']),
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    'pgtrParams.page'() {
      this.scrollToTop()
    },
  },

  created() {
    this.filterIdFolder()
  },

  methods: {
    ...mapActions(['setFetching']),

    closeModalImportMedia() {
      this.$emit('closeModalImportMedia')
    },

    goToFolder(folderId) {
      this.currentFolderId = folderId
      this.breadcrumbsList = this.breadcrumbsList.slice(
        0,
        this.breadcrumbsList.findIndex((breadcrumb) => breadcrumb.key === folderId) + 1
      )
      this.filterIdFolder(folderId)
    },

    filterIdFolder(folder = 'root') {
      const filter = {
        filter: {
          parent_folder_id: folder,
          importing: this.propId,
        },
      }
      this.pgtrInitializePagination('libraryFilesListResource', {}, filter)
    },

    loadLibrary() {
      this.$emit('loadLibrary')
    },

    openFolder(folder) {
      if (!folder.isFolder || !folder.countFiles) return
      this.filterIdFolder(folder.id)
      this.breadcrumbsList.push({ text: folder.filename, key: folder.id })
    },

    addLinks(item) {
      this.$emit('add-links', item)
    },

    scrollToTop() {
      const modalContent = this.$refs.modalContentImport.$refs.modalContent
      if (modalContent) {
        modalContent.scrollTop = 0
      }
    },
  },
}
</script>

<template>
  <Modal
    ref="modalContentImport"
    class="modal-library-add-import"
    :active.sync="mutableModalImportActive"
    is-page
    only-close-one-modal
    @close="closeModalImportMedia()"
  >
    <div class="modal-form is-expanded">
      <span
        v-if="mutableSelectedOption === horizontalSwitchOptions[1].value"
        class="modal-subtitle"
        >{{ $t('classroom.library:modal.import.subtitle') }}</span
      >

      <span
        v-if="mutableSelectedOption === horizontalSwitchOptions[0].value"
        class="modal-subtitle"
        >{{ $t('classroom.library:modal.import.subtitle.2') }}</span
      >

      <h2 class="modal-title is-capitalize">
        {{ title }}
      </h2>

      <div class="modal-description">
        <p>{{ $t('classroom.library:modal.import.description') }}</p>
      </div>

      <div
        slot="button"
        class="horizontal-switch__wrapper"
      >
        <HorizontalSwitch
          root-class="bg-black-400"
          v-model="mutableSelectedOption"
          :options="horizontalSwitchOptions"
        />
      </div>

      <FilterList>
        <template slot="other">
          <div class="filter-list-center-modal flex">
            <Breadcrumbs
              class="center library__breadcrumbs"
              :breadcrumbs-list="breadcrumbsList"
              clickable
              highlight-current
              size="large"
              @click="goToFolder"
            />

            <div class="wrapper-filter flex gap-1 align-items-center">
              <FilterListSearch
                slot="search"
                ref="filterlistsearch"
                hide-error-details
                @search="pgtrSetSearch('title', $event)"
              />

              <FilterListOrder
                slot="order"
                :on-server="true"
                :options="filterListOrderOptions"
                @update-orders="pgtrUpdateOrder"
              />
            </div>
          </div>
        </template>
      </FilterList>

      <div v-if="mutableSelectedOption === horizontalSwitchOptions[0].value">
        <DatatableModalAddImport
          v-if="pgtrCurrentData.length > 0"
          v-model="formDataLinks"
          :items="pgtrCurrentData"
          :is-folder="true"
          @openFolder="openFolder"
          @loadLibrary="loadLibrary"
          @closeModalImportMedia="closeModalImportMedia"
          @save-links="addLinks"
        />
        <template v-else>
          <EmptyMessage class="modal-description empty-classroom-library">
            <h1 class="text-color">{{ $t('classroom.library:empty.add.folder.title') }}</h1>
            <p class="text-color">{{ $t('classroom.library:empty.add.folder.text') }}</p>
          </EmptyMessage>
        </template>
      </div>

      <div v-if="mutableSelectedOption === horizontalSwitchOptions[1].value">
        <DatatableModalAddImport
          v-if="pgtrCurrentData.length > 0"
          v-model="formDataLinks"
          :items="pgtrCurrentData"
          :is-folder="false"
          @openFolder="openFolder"
          @loadLibrary="loadLibrary"
          @closeModalImportMedia="closeModalImportMedia"
          @save-links="addLinks"
        />

        <template v-else>
          <EmptyMessage class="modal-description empty-classroom-library">
            <h1 class="text-color">{{ $t('classroom.library:empty.add.media.title') }}</h1>
            <p class="text-color">{{ $t('classroom.library:empty.add.media.text') }}</p>
          </EmptyMessage>
        </template>
      </div>
    </div>

    <Pagination
      class="mt-5"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      dark
      disable-scroll
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @go-to-page="pgtrParams.page = $event"
      @change-items-per-page="pgtrParams.limit = $event"
    />
  </Modal>
</template>
<style lang="scss">
@import './styles.scss';
</style>
