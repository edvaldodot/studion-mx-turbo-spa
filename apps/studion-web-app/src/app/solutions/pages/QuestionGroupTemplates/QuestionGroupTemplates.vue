<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { defaultOrderFilters } from '@/support/utils/defaultFilters'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import SolutionsHeader from '../../components/SolutionsHeader'

export default defineComponent({
  name: 'QuestionGroupTemplates',

  components: {
    Action,
    Datatable,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    FilterListTag,
    FilterListOrder,
    Pagination,
    SolutionsHeader,
  },

  mixins: [paginateMixin],

  data() {
    return {
      orderOptions: defaultOrderFilters('description'),
    }
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
    this.pgtrFilterTagOptions = [
      {
        title: this.$t('global:status'),
        name: 'status',
        items: [
          {
            active: false,
            id: 'active',
            text: this.$t('global:active'),
            property: 'status',
          },
          {
            active: false,
            id: 'inactive',
            text: this.$t('global:inactive'),
            property: 'status',
          },
        ],
      },
    ]

    this.pgtrDefaultOrder = {
      property: 'description',
      type: 'asc',
    }
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('getQuestionTemplateGroups')
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptDeleteQuestionTemplateGroup',
      'attemptToggleStatusQuestionTemplateGroup',
    ]),

    /**
     * @description Navigate into group
     * @param {Number} templateId
     * @param {String} templateName
     */
    openGroup(templateId, templateName) {
      this.$router.push({
        name: 'solutions.questionTemplates.questions',
        params: { id: templateId, groupName: templateName },
      })
    },

    /**
     * @description Removes a group and refresh list
     * @param {Number} id
     */
    remove(id) {
      this.attemptDeleteQuestionTemplateGroup(id)
        .then(() => {
          this.pgtrRefresh()
          this.setFeedback({
            message: this.$t('solutions.questionTemplates.feedback.group.delete'),
          })
        })
        .catch(({ response }) => {
          this.errorHandler(response.data.message)
        })
    },

    toggleStatus(id) {
      this.attemptToggleStatusQuestionTemplateGroup(id)
        .then(() => {
          this.pgtrRefresh()
          this.setFeedback({
            message: this.$t('solutions.questionTemplates.feedback.group.status'),
          })
        })
        .catch(({ response }) => {
          this.errorHandler(response.data.message)
        })
    },

    openModalEdit(qTemplateGroup) {
      this.$router.push({
        name: 'solutions.questionTemplates.edit',
        params: {
          id: qTemplateGroup.id,
          groupData: qTemplateGroup,
        },
      })
    },

    errorHandler(message) {
      if (
        ['exists_questions_templates_on_this_group', 'question_group_used_in_examination'].includes(
          message
        )
      ) {
        this.setFeedback({
          message: this.$t(`solutions.questionTemplates.errors.${message}`),
        })
      }
    },
  },
})
</script>

<template>
  <div>
    <SolutionsHeader
      :title="$t('solutions:tab.link.questionTemplates')"
      :description="$t('solutions:header.questionTemplates.description')"
    />

    <div
      :data-testid="$testId('question-templates-subject')"
      class="question-templates-subject content p-4"
    >
      <div class="p-3">
        <FilterList>
          <Action
            v-if="canWrite('courses')"
            slot="button"
            :url="{ name: 'solutions.questionTemplates.create' }"
            :text="$t('global:create.questionTemplates.btn')"
            fixed-width
            primary
            large
          />
          <FilterListSearch
            slot="search"
            :initial-value="pgtrParams.query['description']"
            hide-error-details
            @search="pgtrSetSearch('description', $event)"
          />
          <FilterListTag
            slot="tag"
            :initial-value="pgtrParams.filter"
            :options="pgtrFilterTagOptions"
            :tag-all-filters-active="pgtrTagAllFilters"
            state="Courses"
          />
          <FilterListOrder
            slot="order"
            :label="$t('global:filter.order.label')"
            :options="orderOptions"
            :initial-value="pgtrParams.order"
            on-server
            @update-orders="pgtrUpdateOrder"
          />
        </FilterList>
      </div>

      <div class="center">
        <Datatable
          v-if="pgtrCurrentData.length"
          :items="pgtrCurrentData"
        >
          <template slot="thead">
            <tr>
              <th class="th col-6">{{ $t('solutions:tab.link.questionTemplates') }}</th>
              <th class="th col-4 text-center">{{ $t('global:status') }}</th>
              <th class="th col-2"></th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="{ item: qTemplateGroup }"
          >
            <tr class="tr-body">
              <td class="td">
                <span
                  :title="qTemplateGroup.description"
                  class="td-text clamp-line"
                >
                  {{ qTemplateGroup.description }}
                </span>
              </td>
              <td class="td text-center">
                <span class="td-text">{{
                  $t(`global:${qTemplateGroup.active ? 'active' : 'inactive'}`)
                }}</span>
              </td>
              <td class="td td-actions text-right">
                <Action
                  :text="$t('global:view.more')"
                  type="button"
                  flat
                  @click="openGroup(qTemplateGroup.id, qTemplateGroup.description)"
                />
                <Dropdown
                  icon="dots-vertical"
                  absolute
                  right
                >
                  <DropdownLink
                    :text="$t('global:edit')"
                    @click="openModalEdit(qTemplateGroup)"
                  />
                  <DropdownLink
                    :text="qTemplateGroup.active ? $t('global:deactivate') : $t('global:activate')"
                    @click="toggleStatus(qTemplateGroup.id)"
                  />
                  <DropdownLink
                    :text="$t('global:remove')"
                    @click="remove(qTemplateGroup.id)"
                  />
                </Dropdown>
              </td>
            </tr>
          </template>
        </Datatable>

        <EmptyMessage
          v-else
          class="mb-10"
        >
          <template v-if="!pgtrIsSearching && !pgtrIsFiltering">
            <h2>{{ $t('solutions.questionTemplates.list:empty.title') }}</h2>
            <p class="text-color">{{ $t('solutions.questionTemplates.list:empty.message') }}</p>
          </template>

          <template v-else>
            <h2>{{ $t('global:search.empty.title') }}</h2>
            <p class="text-color">{{ $t('global:search.empty.message') }}</p>
          </template>
        </EmptyMessage>
      </div>

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

      <RouterView @refresh="pgtrRefresh" />
    </div>
  </div>
</template>
