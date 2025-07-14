<script>
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import Icon from '@/components/general/Icon'
import Loading from '@/components/general/Loading'
import Pagination from '@/components/general/Pagination'

import { mapState, mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

export default {
  name: 'FilterTabResultShow',

  components: {
    Action,
    Datatable,
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    Icon,
    Loading,
    Pagination
  },

  mixins: [paginateMixin],

  computed: {
    ...mapState({
      Filters: state => state.Filters.filterPreview
    }),

    filterListOrderOptions () {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc'
        }
      ]
    }
  },

  data () {
    return {
      isLoading: false
    }
  },

  watch: {
    'pgtrIsFetching': {
      immediate: true,
      handler (loading) {
        this.isLoading = loading
      }
    }
  },

  props: {
    value: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptDownloadSpreadsheet'
    ]),

    downloadPreview (format) {
      this.attemptDownloadSpreadsheet({
        format,
        session: this.value.session[0],
        filterId: this.$route.params.id
      })
    }
  },

  created () {
    this.pgtrInitializePagination(
      'filterPreviewResource', {
        id: this.$route.params.id,
        session: this.value.session[0].id
      }, {}
    )
  }
}
</script>

<template>
  <div class="modal-show-results modal-view-filter">
    <action
      large
      secondary
      fixed-width
      type="button"
      @click="$emit('back')"
      :text="$t('mediation.filter:results.new')"
    />

    <filter-list>
      <div class="modal-show-results__info" slot="button">
        <p class="text-color">{{ $t('global:solution') }}: {{ value.solution[0].course_name }}</p>
        <p class="text-color">{{ $t('mediation:applicability.session') }}: {{ value.session[0].name }}</p>
      </div>
      <filter-list-search
        dark
        hideErrorDetails
        @search="pgtrSetSearch('name', $event)"
        slot="search"
      />
      <filter-list-order
        dark
        onServer
        :options="filterListOrderOptions"
        :label="$t('global:filter.order.label')"
        @update-orders="pgtrUpdateOrder"
        slot="order"
        class="ml-5"
      />
      <div class="modal-show-results__download" :title="$t('global:download')" slot="categories">
        <span @click="downloadPreview('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')">
          <icon name="xls"></icon>
        </span>
        <span @click="downloadPreview('text/csv')">
          <icon name="csv"></icon>
        </span>
      </div>
    </filter-list>

    <div
      v-if="isLoading"
      class="text-center mt-10"
    >
      <loading dark/>
    </div>

    <div class="center mt-10" v-else>
      <datatable :items="Filters.data" v-if="Filters && Filters.data && Filters.data.length" dark>
        <template slot="thead" v-if="!$media.mobile">
          <tr>
            <th class="th">{{ $t('global:user') }}</th>
            <th class="th" width="180">{{ $t('global:form.username') }}</th>
            <th class="th" width="250">{{ $t('global:form.email') }}</th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="{ item }">
          <tr>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{ $t('global:user') }}</span>
              <span class="td-text">{{ item.name }}</span>
            </td>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{ $t('global:form.username') }}</span>
              <span class="td-text">{{ item.username }}</span>
            </td>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{ $t('global:form.email') }}</span>
              <span class="td-text">{{ item.email }}</span>
            </td>
          </tr>
        </template>
      </datatable>

      <empty-message v-else>
        <p class="text-color">{{ $t('mediation.filter:empty.results') }}</p>
      </empty-message>

      <pagination
        dark
        :activePage="pgtrParams.page"
        :pageCount="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>
  </div>
</template>
