<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import ModalBody from '@/components/general/ModalBody'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import DatatableBranchMetadata from '../DatatableBranchMetadata'
import ModalConfirmDeleteMetadata from '../ModalConfirmDeleteMetadata'
import Pagination from '@/components/general/Pagination'

export default defineComponent({
  name: 'ModalBranchMetadataList',

  components: {
    Action,
    Modal,
    ModalHeader,
    ModalBody,
    FilterList,
    FilterListSearch,
    DatatableBranchMetadata,
    ModalConfirmDeleteMetadata,
    Pagination,
  },

  mixins: [paginateMixin],

  data() {
    return {
      openConfirmDeleteModal: false,
    }
  },

  computed: {
    ...mapState({
      metadataList: (state) => state.metadata.branchesMetadataList,
    }),
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  async created() {
    this.pgtrInitializePagination('getBranchMetadataList')
  },

  methods: {
    ...mapActions([
      'attemptMetasListRetrieval',
      'setFetching',
      'setMetadataData',
      'attemptMetasRemoval',
    ]),

    createMetadata() {
      this.$router.push({
        name: 'settings.branches.create.metadata',
      })
    },

    editMetadata(metadata) {
      this.setMetadataData({ path: 'current', value: metadata })

      this.$router.push({
        name: 'settings.branches.edit.metadata',
        params: { id: metadata.id },
      })
    },

    deleteMetadata() {
      this.setFetching(true)

      this.attemptMetasRemoval({ entity: 'application_branch', id: this.metadataIdToDelete })
        .then(() => {
          this.metadataIdToDelete = null
          this.openConfirmDeleteModal = false

          this.pgtrRefresh()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    openDeleteModal(item) {
      this.openConfirmDeleteModal = true
      this.metadataIdToDelete = item.id
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-branch-metadata-list')"
    active
    is-page
    back
  >
    <ModalHeader
      :title="$t('global:metadata')"
      :sub-title="$tc('global:branch', 2)"
      :description="$t('settings.branches:modal.metadata.description')"
    />

    <ModalBody class="modal-branch-metadata-list">
      <FilterList>
        <Action
          v-if="notEqualsProfile('student') && canWrite('branches') && !$media.mobile"
          slot="button"
          :text="$tc('global:new')"
          type="button"
          fixed-width
          large
          primary
          @click="createMetadata"
        />

        <FilterListSearch
          slot="search"
          :hide-error-details="true"
          dark
          @search="pgtrSetSearch('name', $event)"
        />
      </FilterList>

      <DatatableBranchMetadata
        :items="metadataList"
        @edit:additional-field="editMetadata"
        @delete:additional-field="openDeleteModal"
      />

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

      <ModalConfirmDeleteMetadata
        v-if="openConfirmDeleteModal"
        @modal:close="openConfirmDeleteModal = false"
        @modal:confirm="deleteMetadata"
      />
    </ModalBody>
  </Modal>
</template>
