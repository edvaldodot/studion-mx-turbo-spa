<script>
import { mapState, mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import sharedDataMixin from '../sharedDataMixin'

import SolutionsHeader from '../../components/SolutionsHeader'
import TopicsList from '../../components/TopicsList'
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'
import EmptyMessage from '@/components/general/EmptyMessage'
import Pagination from '@/components/general/Pagination'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  mixins: [paginateMixin, sharedDataMixin],
  name: 'TopicsTemplates',
  components: {
    SolutionsHeader,
    TopicsList,
    Action,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    EmptyMessage,
    Pagination,
    ModalConfirm,
  },
  data() {
    return {
      enabledColumns: ['name', 'type', 'author', 'actions'],
      enabledActions: ['edit', 'remove'],
      embed: 'author',
      currentTopicTemplateId: null,
      deleteConfirmModal: false,
    }
  },
  computed: {
    ...mapState(['accessibility', 'Courses']),
  },
  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    $route(to, from) {
      if (
        from.name === 'solutions.topicsTemplates.create' ||
        from.name === 'solutions.topicsTemplates.update'
      )
        return this.pgtrRefresh()
    },
  },
  created() {
    this.setupFilterTagOptions()
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('topicsTemplatesResources', null, { embed: 'meta,author' })
  },
  methods: {
    ...mapActions(['setFetching', 'deleteTopicTemplate', 'setFeedback']),
    setupFilterTagOptions() {
      this.pgtrFilterTagOptions = [
        {
          title: this.$t('solutions.topicsTemplates.list:filter.type'),
          name: 'topics_types',
          items: this.topicsTypesOptions
            .map((option) => ({
              active: false,
              text: option.text,
              id: option.value,
              property: 'type',
            }))
            .filter((item) => item.id !== 'class'),
        },
      ]
    },
    openEditModal(topic) {
      this.$router.push({
        name: 'solutions.topicsTemplates.update',
        params: { topicId: topic.id },
      })
    },
    openDeleteConfirmModal(topicTemplate) {
      this.currentTopicTemplateId = topicTemplate.id
      this.deleteConfirmModal = true
    },
    async confirmDelete() {
      this.deleteConfirmModal = false
      this.deleteTopicTemplate(this.currentTopicTemplateId).then(() => {
        this.setFeedback({
          message: this.$t('solutions.topicsTemplates.feedback.group.delete'),
        })
        this.currentTopicTemplateId = null
        this.pgtrRefresh()
      })
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (!vm.$isEnabledFeature('topic_template')) next({ name: 'solutions.index' })
    })
  },
}
</script>

<template>
  <div>
    <SolutionsHeader
      :title="$t('solutions:tab.link.topicsTemplates')"
      :description="$t('solutions:header.topicsTemplates.description')"
    />
    <div class="content m-4">
      <div class="p-3">
        <filter-list>
          <action
            primary
            large
            fixed-width
            v-if="this.notEqualsProfile('student') && this.canWrite('courses')"
            slot="button"
            :text="$t('solutions.list:topicsTemplates.btn.add')"
            :url="{ name: 'solutions.topicsTemplates.create' }"
            :dark="accessibility"
          ></action>
          <FilterListSearch
            slot="search"
            :dark="accessibility"
            :initial-value="pgtrParams.query['name']"
            hide-error-details
            @search="pgtrSetSearch('name', $event)"
          />
          <!-- FIXME: https://jira.dotgroup.com.br/browse/SMX-14447
          <filter-list-tag
          slot="tag"
          state="Courses"
          :options="pgtrFilterTagOptions"
          :initial-value="pgtrParams.filter"
          :tag-all-filters-active="pgtrTagAllFilters"
        >
        </filter-list-tag> -->
          <FilterListOrder
            slot="order"
            :options="filterListOrderOptions"
            :initial-value="pgtrParams.order"
            on-server
            @update-orders="pgtrUpdateOrder"
          />
        </filter-list>
      </div>

      <div
        class="center"
        v-if="Courses.topicsTemplates.length > 0"
      >
        <topics-list
          :topicsItems="Courses.topicsTemplates"
          :enabledColumns="enabledColumns"
          :enabledActions="enabledActions"
          @topic-remove="openDeleteConfirmModal"
          @topic-edit="openEditModal"
        />

        <pagination
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

      <empty-message
        v-if="Courses.topicsTemplates.length === 0 && !pgtrIsFiltering && !pgtrIsSearching"
      >
        <h2>{{ $t('solutions.topicsTemplates.list:empty.title') }}</h2>
        <p class="text-color">{{ $t('solutions.topicsTemplates.list:empty.message') }}</p>
      </empty-message>

      <empty-message
        v-if="Courses.topicsTemplates.length === 0 && pgtrIsFiltering && !pgtrIsSearching"
      >
        <h2>{{ $t('solutions.topicsTemplates.list:filter.empty.title') }}</h2>
      </empty-message>

      <empty-message
        v-if="Courses.topicsTemplates.length === 0 && !pgtrIsFiltering && pgtrIsSearching"
      >
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </empty-message>

      <modal-confirm
        :active="deleteConfirmModal"
        :title="
          $tc('global:confirm.modal.title', 2, { resource: $t('global:lesson').toLowerCase() })
        "
        @close="deleteConfirmModal = false"
        @confirm="confirmDelete"
      >
        <p class="text-color">
          {{
            $tc('global:confirm.modal.message', 2, { resource: $t('global:lesson').toLowerCase() })
          }}
        </p>
      </modal-confirm>

      <router-view></router-view>
    </div>
  </div>
</template>
