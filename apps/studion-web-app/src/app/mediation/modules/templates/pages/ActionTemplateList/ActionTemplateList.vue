<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { TRANSMISSION_TYPES } from '../../../../shared'

import MediationContentHeader from '../../../../components/MediationContentHeader'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'

export default defineComponent({
  name: 'ActionTemplateList',

  components: {
    Action,
    Datatable,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    Pagination,
    MediationContentHeader,
  },

  mixins: [paginateMixin],

  computed: {
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'title_template',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'id',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'id',
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
    const transmissionTypes = TRANSMISSION_TYPES.filter((type) =>
      ['email', 'sms', 'announcement', 'topic'].includes(type.value)
    )

    this.pgtrFilterTagOptions.push({
      title: this.$t('mediation.actions:action'),
      name: 'transmission_type',
      items: transmissionTypes.map((type) => {
        return {
          active: false,
          id: type.value,
          text: type.text,
          property: 'transmission_type',
        }
      }),
    })

    this.pgtrInitializePagination('mediationTemplatesResource')
  },

  methods: {
    ...mapActions(['attemptDeleteMediationTemplate', 'setFetching', 'setFeedback']),

    remove(id) {
      this.setFetching(true)
      this.attemptDeleteMediationTemplate(id)
        .then(() => {
          this.pgtrRefresh()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('action-template-create')"
    class="main-content  action-template"
  >
    <MediationContentHeader
      title="mediation.templates:title"
      description="mediation.templates:description"
    />

    <div class="p-3">
      <FilterList>
        <Action
          v-if="canWrite('mediation_plan')"
          slot="button"
          :url="{ name: 'template.actions.create' }"
          :text="$t('mediation.templates:list.action.new')"
          primary
          large
          fixed-width
        />

        <FilterListSearch
          slot="search"
          hide-error-details
          @search="pgtrSetSearch('title_template', $event)"
        />

        <FilterListTag
          slot="tag"
          :tag-all-filters-active="false"
          :options="pgtrFilterTagOptions"
        />

        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :label="$t('global:filter.order.label')"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <Datatable
        v-if="pgtrCurrentData.length"
        :items="pgtrCurrentData"
      >
        <template slot="thead">
          <tr>
            <th class="th col-8">{{ $t('global:form.title') }}</th>
            <th class="th col-3">{{ $tc('mediation.actions:action') }}</th>
            <th class="th col-1"></th>
          </tr>
        </template>

        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr>
            <td class="td">
              <span
                class="td-text bolder clamp-line"
                :title="props.item.titleTemplate"
              >
                {{ props.item.titleTemplate }}
              </span>
            </td>
            <td class="td">
              <span class="td-tag">{{
                $t(
                  `global:form.${
                    props.item.transmissionType === 'topic' ? 'forum' : props.item.transmissionType
                  }`
                )
              }}</span>
            </td>
            <td class="td td-actions flex gap-1 align-items-center">
              <Action
                class="w-7rem"
                :text="$t('global:view.more')"
                type="button"
                flat
                @click="
                  $router.push({ name: 'template.actions.edit', params: { id: props.item.id } })
                "
              />

              <Dropdown
                icon="dots-vertical"
                icon-size="medium"
                right
              >
                <DropdownLink
                  :text="$t('global:edit')"
                  @click="
                    $router.push({ name: 'template.actions.edit', params: { id: props.item.id } })
                  "
                />
                <DropdownLink
                  :text="$t('global:remove')"
                  @click="remove(props.item.id)"
                />
              </Dropdown>
            </td>
          </tr>
        </template>
      </Datatable>

      <EmptyMessage v-else-if="!pgtrIsFetching">
        <h2>{{ $t('mediation.templates:empty.title') }}</h2>
      </EmptyMessage>

      <Pagination
        class="center"
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
  </div>
</template>
