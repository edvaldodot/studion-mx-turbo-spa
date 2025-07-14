<script>
import { defineComponent } from 'vue'

import { paginateMixin } from '@/mixins/paginatorMixin'

import { defaultFilterListOrderOptions } from './options'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'
import Datepicker from '@/components/general/Datepicker'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Pagination from '@/components/general/Pagination'

import DataTableBatchDate from './components/DataTableBatchDate.vue'
import { mapActions } from 'vuex'

export default defineComponent({
  name: 'ModalBatchDate',
  components: {
    Modal,
    Datepicker,
    Action,
    DataTableBatchDate,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Pagination,
  },
  mixins: [paginateMixin],

  props: {
    topic: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      initialDate: null,
      endDate: null,
    }
  },

  computed: {
    orderOptions() {
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
    if (!this.topic.id) {
      this.$router.replace({ name: 'community.sessions.timeline' })
      return
    }

    this.pgtrInitializePagination('sessionsBatchDateListResources', null, {
      topicId: this.topic.id,
    })
  },

  methods: {
    ...mapActions(['setFetching']),

    setDatePeriod() {
      this.$refs.dataTableBatchDate.setDatePeriod(this.initialDate, this.endDate)
      this.initialDate = null
      this.endDate = null
    },

    submit() {
      this.$refs.dataTableBatchDate.submit()
    },

    closeModal() {
      this.$emit('refresh-session-timeline')
      this.$router.push({ name: this.$route.meta.modalCloseLink.name })
    },
  },
})
</script>
<template>
  <Modal
    :data-testid="$testId('modal-batch-date')"
    class="modal-batch-date"
    fill-inner-modal
    active
    is-page
  >
    <div class="batch-date-content">
      <div class="batch-date-header">
        <h2>{{ $t('community.sessions.timeline.dropdown:batch.title') }}</h2>
        <h1>{{ topic.name }}</h1>
        <p class="text-color">{{ $t('community.sessions.timeline.dropdown:batch.description') }}</p>
      </div>
    </div>

    <div
      class="batch-data-filter-header"
      data-cols="2"
    >
      <div class="batch-data-picker">
        <div class="picker__area">
          <p class="text-color">{{ $t('community.sessions.timeline.dropdown:batch:date.initial.class') }}</p>
          <Datepicker
            v-model="initialDate"
            :label="$t('global:form.start')"
            :floating-label="false"
            time
            dark
          />
        </div>

        <div class="picker__area">
          <p class="text-color">{{ $t('community.sessions.timeline.dropdown:batch:date.ending.class') }}</p>
          <Datepicker
            v-model="endDate"
            :label="$t('global:form.closure')"
            :floating-label="false"
            :min="initialDate"
            time
            dark
          />
        </div>
        <div class="batch-data-button">
          <Action
            :text="$t('community.sessions.timeline.dropdown:batch.date.button')"
            :disabled="!initialDate && !endDate"
            flat
            class="btn-back text-color"
            type="button"
            @click="setDatePeriod"
          />
        </div>
      </div>

      <div class="batch-date-filter">
        <FilterList>
          <FilterListOrder
            slot="order"
            :options="orderOptions"
            dark
            on-server
            @update-orders="pgtrUpdateOrder"
          />

          <FilterListSearch
            slot="search"
            dark
            hide-error-details
            @search="pgtrSetSearch('name', $event)"
          />
        </FilterList>
      </div>
    </div>

    <DataTableBatchDate
      ref="dataTableBatchDate"
      :items="pgtrCurrentData"
      @close="closeModal"
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

    <div class="form-submit text-center submit__button">
      <Action
        :text="$t('global:save')"
        secondary
        large
        type="button"
        @click="submit"
      />
    </div>
  </Modal>
</template>

<style lang="scss">
@import './ModalBatchDate.scss';
</style>
