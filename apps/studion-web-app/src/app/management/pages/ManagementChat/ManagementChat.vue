<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import DatatableManagementChat from './components/DatatableManagementChat'
import chatMixin from './mixins/chatmixin.js'

import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from './options'

export default defineComponent({
  name: 'ManagementChat',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    DatatableManagementChat,
    Action,
    Modal: () => import('@/components/general/Modal'),
    ModalEditChat: () => import('@/components/shared/ModalEditChat'),
  },

  mixins: [paginateMixin, chatMixin],

  computed: {
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },
    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:chat')
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.pgtrFilterTagOptions = [...defaultFilterListTagOptions()]
    this.pgtrDefaultOrder.property = 'start_time'
    this.pgtrRouteParams.active = true
    this.isManagementCreate = true
    this.pgtrInitializePagination('Management/chat/chatsListResource')
  },

  methods: {
    ...mapActions(['setFetching', 'Management/chat/attemptChatRoomCreation']),

    openModalAddChat() {
      this.modalChatActive = true
    },

    submitCreate() {
      this.setFetching(true)
      let data = this.parseFormData()

      this['Management/chat/attemptChatRoomCreation'](data)
        .then(() => {
          this.closeModalAddChat()
          this.setFeedback({ message: this.$t('management:chat.create.success') })
          this.pgtrRefresh()
        })
        .catch(({ response }) => {
          const message = response.data.mensage
          if (response.data.message === 'start_should_not_be_greater_than_end') {
            this.setFeedback({ message: `classroom.chat:feedback.create.error.${message}` })
          }
          this.modalChatActive = true
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    addNewChat() {
      this.$v.$touch()
      if (this.$v.formData.sessions_ids.$invalid) {
        this.setFeedback({
          message: this.$t('management:chat.validation.replicate.class'),
        })
      }
      if (!this.$v.$invalid) {
        this.formData.chat_id ? this.chat.id : null
        this.modalChatActive = false

        this.submitCreate()
      }
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-forum')">
    <div class="p-3">
      <FilterList>
        <template slot="filterTab">
          <div class="tabs-filter">
            <slot />
          </div>
        </template>
        <Action
          v-if="hasWriteAccess"
          slot="button"
          type="button"
          :text="$t('classroom.chat:btn.add')"
          primary
          large
          fixed-width
          :dark="accessibility"
          @click="openModalAddChat()"
        />

        <FilterListSearch
          slot="search"
          :initial-value="pgtrParams.query['name']"
          hide-error-details
          @search="pgtrSetSearch('name', $event)"
        />

        <FilterListOrder
          slot="order"
          :initial-value="pgtrParams.order"
          :options="filterListOrderOptions"
          on-server
          @update-orders="pgtrUpdateOrder"
        />

        <FilterListTag
          slot="tag"
          :initial-value="pgtrParams.filter"
          :options="pgtrFilterTagOptions"
          :tag-all-filters-active="pgtrTagAllFilters"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <DatatableManagementChat
        :data-forum="pgtrCurrentData"
        @refresh-data="pgtrRefresh"
      />

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>
    <Modal
      v-show="!modalSession"
      :active.sync="modalChatActive"
      @close="closeModalAddChat()"
    >
      <ModalEditChat
        class="modal-add-achat"
        :chat="formData"
        :validations="$v"
        :is-management-create="isManagementCreate"
        @submit="addNewChat"
        @session-modal-open="modalSession = $event"
      />
    </Modal>
    <RouterView />
  </div>
</template>
