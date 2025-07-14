<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Pagination from '@/components/general/Pagination'
import EmptyMessage from '@/components/general/EmptyMessage'

import MediationLinkDatatable from '../../components/MediationLinkDatatable'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'MediationModalAddLink',
  mixins: [paginateMixin],
  components: {
    Modal,
    ModalConfirm,
    Action,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Pagination,
    MediationLinkDatatable,
    EmptyMessage
  },
  data () {
    return {
      formData: {
        links: []
      },
      type: null,
      hasChanged: false,
      toolsWarning: false
    }
  },
  computed: {
    ...mapState({
      mediation: state => state.Mediation.current
    }),
    getAddedLinksIds () {
      return this.mediation.links.reduce((carr, link) => {
        carr.push(link.id)
        return carr
      }, [])
    },
    mappedLinksList () {
      if (!this.mediation.availableLinks) return []
      return this.mediation.availableLinks.map(s => {
        this.$set(s, 'import', (this.formData.links.some(fs => fs.id === s.course_id)))
        return s
      })
    },
    filterListOrderOptions () {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc'
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc'
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc'
        }
      ]
    },
    emptyLinks () {
      return this.mappedLinksList.length === 0
    }
  },
  watch: {
    'pgtrIsFetching': {
      immediate: true,
      handler (loading) {
        this.setFetching(loading)
      }
    },
    'mediation.mediationPlan.applicability': {
      immediate: true,
      handler () {
        if (this.mediation.mediationPlan.applicability) {
          const pmApplicability = this.mediation.mediationPlan.applicability
          this.pgtrInitializePagination(
            'mediationLinksResource',
            { type: pmApplicability },
            { filter: { [this.getFilterParam(pmApplicability)]: this.getAddedLinksIds } }
          )
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'setFetching'
    ]),
    getFilterParam (applicability) {
      return applicability === 'solution' ? 'course_not_in' : 'session_not_in'
    },
    selectSolution (value) {
      if (value.event) {
        this.formData.links.push({
          ...value.item,
          id: value.item.course_id || value.item.id,
          name: value.item.course_name || value.item.name,
          isNew: true
        })
      } else {
        this.formData.links = this.formData.links.filter(link => {
          const id = value.item.id || value.item.course_id
          return link.id !== id
        })
      }
    },
    addLinks () {
      if (this.mediation.mediationPlan.applicability === 'session') {
        this.formData.links = this.formData.links.map(link => {
          return {
            ...link,
            startDateTime: link.availability.initial,
            endDateTime: link.availability.extended
              ? link.availability.extended
              : link.availability.final
          }
        })
      }

      this.$emit('add-links', [...this.formData.links])
      this.$router.push({ name: 'mediation.link', params: {id: this.$route.params.id} })
      this.$destroy()
    }
  }
}
</script>

<template>
  <modal class="add-solution-modal" :active="true" is-page>
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t(`mediation.links:modal.subtitle.${mediation.mediationPlan.applicability}`) }}</span>
      <h2 class="modal-title text-color">{{ mediation.mediationPlan.name }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t(`mediation.links:modal.description.${mediation.mediationPlan.applicability}`) }}</p>
      </div>
    </div>

    <div class="py-4">
      <filter-list>
        <filter-list-search
          dark
          slot="search"
          :hide-error-details="true"
          @search="pgtrSetSearch('name', $event)"
        />
        <filter-list-order
          dark
          slot="order"
          :options="filterListOrderOptions"
          @update-orders="pgtrUpdateOrder"
          :on-server="true"
        />
      </filter-list>
    </div>

    <empty-message dark v-if="emptyLinks">
      <template v-if="!pgtrIsFiltering && !pgtrIsSearching">
        <h2>{{ $t('solutions.list:empty.title') }}</h2>
        <p class="text-color">{{ $t('solutions.list:empty.message') }}</p>
      </template>
      <template v-if="pgtrIsFiltering && !pgtrIsSearching">
        <h2>{{ $t('solutions.list:filter.empty.title') }}</h2>
      </template>
      <template v-if="!pgtrIsFiltering && pgtrIsSearching">
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </template>
    </empty-message>

    <mediation-link-datatable
      v-model="mappedLinksList"
      @select-solution="selectSolution"
      dark
      is-import
    />

    <div v-if="mappedLinksList.length" class="my-2 datatable-item-selected theme-dark flex gap-1 text-base">
      <div class="text-color">{{ $t(`mediation.links:modal.datatable.${mediation.mediationPlan.applicability}.selected`) }}</div>
      <span class="datatable-item-selected-length">{{ formData.links.length }}</span>
    </div>

    <pagination
      v-if="mappedLinksList.length"
      dark
      class="mb-8"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @go-to-page="pgtrParams.page = $event"
      @change-items-per-page="pgtrParams.limit = $event"
    />

    <div class="text-center">
      <action
        v-if="mappedLinksList.length"
        large
        secondary
        class="mb-10"
        type="button"
        :disabled="formData.links.length === 0"
        :text="$t('global:add')"
        @click="toolsWarning = true"
      />
    </div>

    <modal-confirm
      :active="toolsWarning"
      :title="$t('mediation.links:modal.warning.tools.title')"
      @close="toolsWarning = false"
      @confirm="addLinks"
    >
      <p v-html="$t('mediation.links:modal.warning.tools.description')"></p>
    </modal-confirm>
  </modal>
</template>
