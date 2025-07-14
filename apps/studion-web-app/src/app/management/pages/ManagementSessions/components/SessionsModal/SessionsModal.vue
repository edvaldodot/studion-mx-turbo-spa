<script>
import { defineComponent } from 'vue'
import lodash from 'lodash'

import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import ModalBody from '@/components/general/ModalBody'
import Pagination from '@/components/general/Pagination'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'

import Action from '@/components/general/Action'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions } from 'vuex'

import { defaultFilterListOrderOptions } from './options'
import SessionsDatatable from '../SessionsDatatable/SessionsDatatable.vue'

export default defineComponent({
  name: 'SessionsModal',

  components: {
    Modal,
    ModalHeader,
    ModalBody,
    Pagination,
    Action,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    SessionsDatatable,
  },

  mixins: [paginateMixin],

  props: {
    ids: {
      type: Array,
      default: () => [],
    },

    filterTool: {
      type: String,
      default: '',
    },

    avaliativeForum: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedIds: [],
      selectedSessions: [],
    }
  },

  computed: {
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    ids(newValue) {
      this.selectedIds = newValue
    },
  },

  created() {
    this.selectedIds = this.ids

    const filter = { tool: this.filterTool, status: ['active'] }

    if (this.avaliativeForum) {
      filter.is_forum_evaluation = true
    }

    this.pgtrInitializePagination('Management/sessions/attemptModalSessionListResource', null, {
      filter,
    })
  },

  methods: {
    ...mapActions(['setFetching']),

    closeModal() {
      this.$emit('close')
    },

    submitEvent() {
      const selectedSessions = []

      this.selectedSessions.map((i) => {
        selectedSessions.push(lodash.cloneDeep(i))
      })

      this.$emit('submit', {
        selectedIds: [...this.selectedIds],
        selectedSessions,
      })

      this.closeModal()
    },
  },
})
</script>

<template>
  <Modal
    :active="true"
    :is-page="true"
    fill-inner-modal
    class="sessions-modal"
    only-close-one-modal
    @close="closeModal"
  >
    <ModalHeader
      :title="$t('bind.sessions:modal.title')"
      :description="$t('bind.sessions:modal.description')"
      is-capitalize
    />

    <ModalBody class="session-modal__body">
      <div class="py-4">
        <FilterList>
          <FilterListSearch
            slot="search"
            dark
            @search="pgtrSetSearch('name', $event)"
          />

          <FilterListOrder
            slot="order"
            :on-server="true"
            :options="filterListOrderOptions"
            large-width
            dark
            @update-orders="pgtrUpdateOrder"
          />
        </FilterList>
      </div>

      <SessionsDatatable
        v-model="selectedIds"
        :data-list="pgtrCurrentData"
        :is-forum-evaluation="avaliativeForum"
        @selected-sessions="selectedSessions = $event"
      />

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        dark
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @change-items-per-page="pgtrParams.limit = $event"
      />

      <div class="session-modal__footer text-center">
        <Action
          :text="$t('global:bind')"
          type="button"
          fixed-width
          secondary
          large
          @click="submitEvent"
        />
      </div>
    </ModalBody>
  </Modal>
</template>

<style lang="scss">
.sessions-modal {
  padding: 20px 64px;

  @media (max-width: 1023px) {
    padding: 20px;
  }
}

.session-modal__footer {
  padding: 60px 20px;
}

.session-modal__body {
  .filter-options {
    .filter-toggle-container {
      align-items: flex-start;
    }
  }
}
</style>
