<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'

import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import Action from '@/components/general/Action'
import DatatableAnnouncement from '../components/DatatableAnnouncement'
import announcementsMixin from '@/app/classroom/modules/panel/mixins/announcementsMixin.js'
import ModalAnnouncements from '@/app/classroom/modules/panel/pages/Announcements/ModalAnnouncements/ModalAnnouncements.vue'
const Modal = () => import('@/components/general/Modal')

import { defaultFilterListOrderOptions, defaultFilterListTagOptions } from '../options'

export default defineComponent({
  name: 'TabAnnouncement',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Pagination,
    DatatableAnnouncement,
    Action,
    ModalAnnouncements,
    Modal,
  },

  mixins: [paginateMixin, announcementsMixin],

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
  },

  created() {
    this.managementCreate = true
    this.pgtrFilterTagOptions = [...defaultFilterListTagOptions()]
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('Management/announcement/announcementListResource')
  },

  methods: {
    ...mapActions(['setFetching']),
  },
})
</script>

<template>
  <div :data-testid="$testId('tab-announcement')">
    <div class="p-3">
      <FilterList>
        <template slot="filterTab">
          <div class="tabs-filter">
            <slot />
          </div>
        </template>
        <Action
          v-if="canWrite('classroom:announcement')"
          slot="button"
          :text="$t('classroom.panel.announcements:btn.add')"
          :dark="accessibility"
          type="button"
          primary
          large
          fixed-width
          @click="openModalAddAnnouncement()"
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
      <DatatableAnnouncement
        :data-announcement="pgtrCurrentData"
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
      <modal
        v-show="!modalSession"
        :active.sync="modalAddAnnouncement"
        close-event
        @close="closeModalAddAnnouncement"
      >
        <ModalAnnouncements
          ref="modalAnnoucements"
          :announcement="formData"
          is-management
          :course-name="pgtrCurrentData.courseName"
          :validations="$v"
          @submit="submit"
          @add-media-file="addMediaFile"
          @session-modal-open="(e) => (modalSession = e)"
        />
      </modal>
    </div>
  </div>
</template>
