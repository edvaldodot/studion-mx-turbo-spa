<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { defaultOrderFilters } from '@/support/utils/defaultFilters'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import DifficultyLevel from '@/components/general/DifficultyLevel'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
import HeaderActions from '@/components/general/HeaderActions'
import SolutionsHeader from '../../components/SolutionsHeader'

export default defineComponent({
  name: 'QuestionTemplates',

  components: {
    Action,
    Datatable,
    DifficultyLevel,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    FilterListTag,
    FilterListOrder,
    Pagination,
    HeaderActions,
    SolutionsHeader,
  },

  mixins: [paginateMixin],

  props: {
    groupName: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      mutableGroupName: this.groupName,
      questions: [],
      orderFilters: defaultOrderFilters('statement'),
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
    this.setupFilters()
    this.setupGroupName()

    this.pgtrDefaultOrder = {
      property: 'statement',
      type: 'asc',
    }
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('getQuestionTemplateGroupQuestions', {
      groupId: this.$route.params.id,
    })
  },

  methods: {
    ...mapActions([
      'attemptGetQuestionTemplateGroup',
      'attemptGetQuestionTemplateGroupsQuestions',
      'attemptDeleteQuestionTemplateGroupQuestion',
      'setFetching',
      'setFeedback',
    ]),

    setupGroupName() {
      if (this.mutableGroupName) return

      this.attemptGetQuestionTemplateGroup(this.$route.params.id).then(({ data }) => {
        this.mutableGroupName = data.description
      })
    },

    remove(id) {
      const params = { groupId: this.$route.params.id, id }

      this.attemptDeleteQuestionTemplateGroupQuestion(params)
        .then(() => {
          this.pgtrRefresh()
          this.setFeedback({
            message: this.$t('solutions.questionTemplates.feedback.question.delete'),
          })
        })
        .catch(({ response }) => {
          const errorMessage = response.data.message

          if (
            errorMessage ===
            'question_group_level_used_in_examination_must_stay_at_least_one_question'
          ) {
            this.setFeedback({
              message: this.$t(`solutions.questionTemplates.errors.${errorMessage}`),
            })
          }
        })
    },

    formatStatement(statement) {
      const imgRegex = /<img\b[^>]*>/gi
      const removeTagsRegex = /<[^>]*>/g

      return statement
        .replace(imgRegex, `[${this.$t('library:filters.image')}]`)
        .replace(removeTagsRegex, ' ')
    },

    setupFilters() {
      this.pgtrFilterTagOptions = [
        {
          title: this.$t('global:difficulty'),
          name: 'difficulty',
          items: [
            {
              active: false,
              id: 1,
              text: this.$t('global:difficulty.easy'),
              property: 'difficulty',
            },
            {
              active: false,
              id: 3,
              text: this.$t('global:difficulty.medium'),
              property: 'difficulty',
            },
            {
              active: false,
              id: 5,
              text: this.$t('global:difficulty.hard'),
              property: 'difficulty',
            },
          ],
        },
      ]
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
      :data-testid="$testId('question-templates')"
      class="question-templates content"
    >
      <HeaderActions :title="mutableGroupName">
        <template #left>
          <Action
            :url="{ name: 'solutions.questionTemplates' }"
            icon="keyboard_backspace"
          />
        </template>
      </HeaderActions>

      <div class="p-4">
        <FilterList>
          <Action
            v-if="canWrite('courses')"
            slot="button"
            :url="{ name: 'solutions.questionTemplates.questions.create' }"
            :text="$t('global:create.questionTemplates.btn.2')"
            fixed-width
            primary
            large
          />
          <FilterListSearch
            slot="search"
            :initial-value="pgtrParams.query['name']"
            hide-error-details
            @search="pgtrSetSearch('statement', $event)"
          />
          <FilterListTag
            slot="tag"
            :initial-value="pgtrParams.filter"
            :tag-all-filters-active="pgtrTagAllFilters"
            :options="pgtrFilterTagOptions"
            state="Courses"
          />
          <FilterListOrder
            slot="order"
            :label="$t('global:filter.order.label')"
            :options="orderFilters"
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
              <th class="th col-8">{{ $t('solutions:tab.link.questionTemplates') }}</th>
              <th class="th col-2">{{ $t('global:difficulty') }}</th>
              <th class="th col-2"></th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="{ item: question }"
          >
            <tr class="tr-body">
              <td class="td">
                <span
                  :title="formatStatement(question.statement)"
                  class="td-text clamp-line"
                >
                  {{ formatStatement(question.statement) }}
                </span>
              </td>
              <td class="td text-center">
                <span class="td-text">
                  <DifficultyLevel :level="question.levelDifficulty" />
                </span>
              </td>
              <td class="td td-actions text-right">
                <Action
                  :text="$t('global:view.more')"
                  type="button"
                  flat
                  @click="
                    $router.push({
                      name: 'solutions.questionTemplates.questions.edit',
                      params: {
                        questionId: question.id,
                        questionData: question,
                      },
                    })
                  "
                />
                <Dropdown
                  icon="dots-vertical"
                  absolute
                  right
                >
                  <DropdownLink
                    :text="$t('global:edit')"
                    @click="
                      $router.push({
                        name: 'solutions.questionTemplates.questions.edit',
                        params: {
                          questionId: question.id,
                        },
                      })
                    "
                  />
                  <DropdownLink
                    :text="$t('global:remove')"
                    @click="remove(question.id)"
                  />
                </Dropdown>
              </td>
            </tr>
          </template>
        </Datatable>

        <EmptyMessage v-else>
          <template
            v-if="
              !pgtrIsSearching && pgtrParams.filter && pgtrParams.filter.difficulty.length === 0
            "
          >
            <h2>{{ $t('solutions.questionTemplates.question.list:empty.title') }}</h2>
            <p class="text-color">{{ $t('solutions.questionTemplates.question.list:empty.message') }}</p>
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
