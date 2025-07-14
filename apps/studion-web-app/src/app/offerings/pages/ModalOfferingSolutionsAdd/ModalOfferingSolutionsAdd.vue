<script>
import { mapActions, mapState } from 'vuex'
import { mapSolutions, TAG_OPTIONS, defaultFilterListOrderOptions } from './utils'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import FilterListOrder from '@/components/general/FilterListOrder'
import ModalOfferingSolutionsWarning from './components/ModalOfferingSolutionsWarning.vue'
import Pagination from '@/components/general/Pagination'

export default {
  name: 'ModalOfferingSolutionsAdd',
  components: {
    Modal,
    Action,
    Checkbox,
    Datatable,
    FilterList,
    FilterListSearch,
    FilterListTag,
    FilterListOrder,
    EmptyMessage,
    ModalOfferingSolutionsWarning,
    Pagination,
  },
  mixins: [paginateMixin],

  props: {
    linkedSolutions: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      items: [],
      selectedSolutions: [],
      showWarning: false,
    }
  },

  computed: {
    ...mapState(['offerings']),

    mappedItems() {
      return this.pgtrCurrentData.map((solution) =>
        mapSolutions(
          solution,
          this.selectedSolutions.findIndex((selected) => selected.id === solution.course_id) > -1
        )
      )
    },

    alreadyLinkedIds() {
      const idArray = []
      this.linkedSolutions.forEach((item) => idArray.push(item.id))

      return idArray
    },

    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },

    isPublished() {
      return this.offerings.current.published
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
    if (this.offerings && this.offerings.current) {
      return this.setup()
    }

    this.closeModal()
  },

  methods: {
    ...mapActions(['attemptCourseListRetrieval', 'setFetching']),

    /**
     * Load solutions on created
     */
    setup() {
      const actionParams = this.prepareParams()

      this.pgtrFilterTagOptions = [...TAG_OPTIONS]
      this.pgtrInitializePagination('getCoursesListToOffering', {}, actionParams)
    },

    /**
     * Prepare params for solutions request
     * @returns {Object}
     */
    prepareParams() {
      return {
        activeOnly: true,
        filter: {
          ...this.checkBranching(),
          course_not_in: this.alreadyLinkedIds,
          active: true,
        },
        order: {
          name: 'asc',
        },
      }
    },

    /**
     * Check if branching is enable and return only child solutions
     * @returns {Object}
     */
    checkBranching() {
      if (this.$isEnabledFeature('branching') && this.offerings.current.branch != null) {
        return {
          branch: this.offerings.current.branch.id,
          ignore_branching: true,
        }
      }
    },

    /**
     * Add/remove courses from selected courses
     * @param {Boolean} add
     * @param {Object} course
     */
    addSolution(add, course) {
      if (add) {
        this.selectedSolutions.push({
          id: course.id,
          name: course.name,
          author: course.author.name,
          type: { alias: course.type.alias },
          conclusionCondition: course.conclusionCondition,
          topics_count: course.topics_count,
          published: false,
        })
      } else {
        let idx = this.selectedSolutions.findIndex((item) => course.id === item.id)
        if (idx > -1) this.selectedSolutions.splice(idx, 1)
      }
    },

    handleSubmit() {
      if (this.selectedSolutions.length === 0 || !this.isPublished || this.showWarning)
        return this.submit()

      this.showWarning = true
    },

    /**
     * Emit event with solutions to link and close modal
     */
    submit() {
      this.$emit('link-solutions', this.selectedSolutions)
      this.closeModal()
      this.$destroy()
    },

    /**
     * Redirect to parent
     */
    closeModal() {
      this.$router.push(this.$route.meta.modalCloseLink)
    },
  },
}
</script>

<template>
  <Modal
    class="add-offerings-solutions-modal"
    back
    active
    is-page
  >
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('offerings.solutions.edit:modal.import.subtitle') }}</span>
      <h2
        v-if="offerings && offerings.current"
        class="modal-title text-color"
      >
        {{ offerings.current.title }}
      </h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('offerings.solutions.edit:modal.import.text') }}</p>
      </div>
    </div>

    <div class="py-4">
      <FilterList>
        <FilterListSearch
          slot="search"
          dark
          hide-error-details
          @search="pgtrSetSearch('name', $event)"
        />
        <FilterListTag
          slot="tag"
          :options="pgtrFilterTagOptions"
          :tag-all-filters-active="pgtrTagAllFilters"
          state="Courses"
          dark
        />
        <FilterListOrder
          slot="order"
          :label="$t('global:filter.order.label')"
          :options="filterListOrderOptions"
          on-server
          dark
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <Datatable
        v-if="mappedItems.length"
        :items="mappedItems"
        dark
      >
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th class="th">{{ $t('offerings.solutions.edit:datatable.header.1') }}</th>
            <th
              class="th"
              width="145"
            >
              {{ $t('offerings.solutions.edit:datatable.conclusion') }}
            </th>
            <th
              class="th"
              width="145"
            >
              {{ $t('offerings.solutions.edit:datatable.header.2') }}
            </th>
            <th
              class="th"
              width="180"
            >
              {{ $t('offerings.solutions.edit:datatable.header.3') }}
            </th>
            <th
              class="th text-center"
              width="95"
            >
              {{ $t('global:solution.duration') }}
            </th>
            <th
              class="th text-center"
              width="95"
            >
              {{ $t('community.sessions:datatable.header.8') }}
            </th>
            <th
              class="th text-center"
              width="95"
            >
              {{ $t('offerings.solutions.edit:datatable.header.4') }}
            </th>
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
              colspan="3"
            >
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
          </tr>
          <tr>
            <td
              v-if="!$media.mobile"
              class="td"
            >
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('offerings.solutions.edit:datatable.conclusion') }}
              </span>
              <span class="td-text">
                {{ props.item.conclusionCondition ? $t('global:postponed') : $t('global:normal') }}
              </span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('offerings.solutions.edit:datatable.header.2') }}
              </span>
              <span :class="{ 'td-tag': !$media.mobile, 'td-text': $media.mobile }">
                {{
                  props.item.type
                    ? $t('solutions.type:' + props.item.type.alias)
                    : $t('solutions.type:without')
                }}
              </span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('offerings.solutions.edit:datatable.header.3') }}
              </span>
              <span class="td-text">
                {{ props.item.author ? props.item.author.name : $t('global:without.author') }}
              </span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('global:solution.duration') }}
              </span>
              <span class="td-text">
                {{ getDurationText(props.item.course_duration) }}
              </span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('community.sessions:datatable.header.8') }}
              </span>
              <span class="td-text">
                {{ formatDate(props.item.course_created_at, 'long') }}
              </span>
            </td>
            <td class="td text-center">
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('offerings.solutions.edit:datatable.header.4') }}
              </span>
              <Checkbox
                v-model="props.item.inOffer"
                :items="[{ value: true }]"
                :disabled="!canWrite('offerings')"
                switch-type
                dark
                @input="addSolution($event, props.item)"
              />
            </td>
          </tr>
        </template>
      </Datatable>

      <EmptyMessage
        v-else
        dark
      >
        <template v-if="pgtrIsSearching">
          <h2>{{ $t('global:search.empty.title') }}</h2>
          <p class="text-color">{{ $t('global:search.empty.message') }}</p>
        </template>
        <template v-else>
          <h2>{{ $t('solutions.list:empty.title') }}</h2>
          <p class="text-color">{{ $t('solutions.list:empty.message') }}</p>
        </template>
      </EmptyMessage>

      <Pagination
        dark
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>
    <div class="text-center">
      <Action
        :text="$t('global:import')"
        class="mt-5 mb-10"
        type="button"
        secondary
        large
        @click="handleSubmit"
      />
    </div>

    <ModalOfferingSolutionsWarning
      :active="showWarning"
      @close="showWarning = false"
      @save="handleSubmit"
    />
  </Modal>
</template>
