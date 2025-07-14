<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Datatable from '@/components/general/Datatable'
import Checkbox from '@/components/general/Checkbox'
import Icon from '@/components/general/Icon'
import TooltipSlot from '@/components/general/TooltipSlot'
import Pagination from '@/components/general/Pagination'
import EmptyMessage from '@/components/general/EmptyMessage'

export default {
  components: {
    Modal,
    Action,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Datatable,
    Icon,
    TooltipSlot,
    Checkbox,
    Pagination,
    EmptyMessage,
  },
  mixins: [paginateMixin],
  data() {
    return {
      formData: {
        solutions: [],
      },
      hasChanged: false,
    }
  },
  computed: {
    ...mapState({
      trail: (state) => state.Trails.current,
    }),
    getAddedSolutionsIds() {
      return this.trail.solutions.reduce((carr, solution) => {
        carr.push(solution.course_id)
        return carr
      }, [])
    },
    mappedSolutionsList() {
      if (!this.trail.availableSolutions) return []
      return this.trail.availableSolutions.map((s) => {
        this.$set(
          s,
          'import',
          this.formData.solutions.some((fs) => fs.course_id === s.course_id)
        )
        return s
      })
    },
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
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
    this.setup()
  },
  methods: {
    ...mapActions(['setCurrent', 'setFetching']),
    setup() {
      const trailId = this.$route.params.id
      const filters = {
        course_not_in: this.getAddedSolutionsIds,
        active: 1,
      }

      if (this.$isEnabledFeature('branching')) {
        filters.branch = this.trail.branches.map((branch) => branch.id)
      }

      this.setCurrent(trailId)
      this.pgtrInitializePagination('trailSolutionsResource', { trailId }, { filter: filters })
    },
    selectSolution(value, solution) {
      if (value) {
        this.formData.solutions.push({
          course_id: solution.course_id,
          course_name: solution.course_name,
          topics_count: solution.topics_count,
          conclusion_enrollment_condition: solution.conclusion_enrollment_condition,
          only_read_branch: solution.only_read_branch,
          isNew: true,
        })
      } else {
        this.formData.solutions = this.formData.solutions.filter(
          (s) => s.course_id !== solution.course_id
        )
      }
    },
    addSolutions() {
      this.$emit('addSolutions', [...this.formData.solutions])
      this.$router.push({ name: 'trails.create.solutions' })
      this.$destroy()
    },
  },
}
</script>

<template>
  <Modal
    :active="true"
    class="add-solution-modal"
    is-page
  >
    <div class="modal-form">
      <span class="modal-subtitle">
        {{ $t('trails.create.solutions:modal.subtitle') }}
      </span>
      <h2 class="modal-title text-color">{{ trail.name }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('trails.create.solutions:modal.description') }}</p>
      </div>
    </div>

    <div class="py-4">
      <FilterList>
        <FilterListSearch
          slot="search"
          :hide-error-details="true"
          dark
          @search="pgtrSetSearch('name', $event)"
        />
        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :on-server="true"
          dark
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>

    <EmptyMessage
      v-if="mappedSolutionsList.length === 0 && !pgtrIsFiltering && !pgtrIsSearching"
      dark
    >
      <h2>{{ $t('solutions.list:empty.title') }}</h2>
      <p class="text-color">{{ $t('solutions.list:empty.message') }}</p>
    </EmptyMessage>

    <EmptyMessage v-if="mappedSolutionsList.length === 0 && pgtrIsFiltering && !pgtrIsSearching">
      <h2>{{ $t('solutions.list:filter.empty.title') }}</h2>
    </EmptyMessage>

    <EmptyMessage v-if="mappedSolutionsList.length === 0 && !pgtrIsFiltering && pgtrIsSearching">
      <h2>{{ $t('global:search.empty.title') }}</h2>
      <p class="text-color">{{ $t('global:search.empty.message') }}</p>
    </EmptyMessage>

    <Datatable
      v-if="mappedSolutionsList.length"
      :items="mappedSolutionsList"
      class="theme-dark"
    >
      <template slot="thead">
        <tr>
          <th class="th">
            {{ $t('trails.create.solutions:modal.datatable.header.1') }}
          </th>
          <th
            width="15%"
            class="th text-center"
          >
            {{ $t('offerings.solutions.edit:datatable.conclusion') }}
          </th>
          <th
            width="15%"
            class="th text-center"
          >
            {{ $t('trails.create.solutions:modal.datatable.header.2') }}
          </th>
          <th
            width="10%"
            class="th text-center"
          >
            {{ $t('trails.create.solutions:modal.datatable.header.3') }}
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item }"
      >
        <tr>
          <td class="td">
            <span class="td-text bolder">
              {{ item.course_name }}
              <TooltipSlot
                v-if="item.only_read_branch"
                :width="460"
                :arrow="!$media.mobile"
                class="tooltip__topic"
                shadow
                dark
              >
                <template #activator>
                  <Icon
                    class="tip__icon"
                    size="small"
                    name="help"
                    wrapper
                    dark
                  />
                </template>

                <template #content>
                  <p class="tooltip__description">
                    {{ $t('trails.create.solutions.only.read.branch') }}
                  </p>
                </template>
              </TooltipSlot>
            </span>
          </td>
          <td class="td text-center">
            <span class="td-text">
              {{
                item.conclusion_enrollment_condition ? $t('global:postponed') : $t('global:normal')
              }}
            </span>
          </td>
          <td class="td text-center">
            <span class="td-text">
              {{ $t(`solutions.type:${item.course_type_alias}`) }}
            </span>
          </td>
          <td class="td text-center">
            <Checkbox
              :value="item.import"
              :items="[{ value: true }]"
              switch-type
              dark
              @input="selectSolution($event, item)"
            />
          </td>
        </tr>
      </template>
    </Datatable>

    <div class="my-2">
      <div
        v-if="mappedSolutionsList.length"
        class="flex align-items-center text-base datatable-item-selected theme-dark"
      >
        <div class="text-color">
          {{ $t('trails.create.solutions:modal.datatable.item.selected') }}
        </div>
        <span class="text-color ml-1">
          {{ formData.solutions.length }}
        </span>
      </div>
    </div>

    <Pagination
      v-if="mappedSolutionsList.length"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      class="mb-8"
      dark
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @go-to-page="pgtrParams.page = $event"
      @change-items-per-page="pgtrParams.limit = $event"
    />
    <div class="text-center">
      <Action
        v-if="mappedSolutionsList.length"
        :text="$t('trails.create.solutions:modal.submit')"
        :disabled="formData.solutions.length === 0"
        class="mb-10"
        type="button"
        primary
        large
        @click="addSolutions"
      />
    </div>
  </Modal>
</template>
