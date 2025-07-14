<script>
import { mapState, mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import sharedDataMixin from '../sharedDataMixin'

import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import EmptyMessage from '@/components/general/EmptyMessage'
import Modal from '@/components/general/Modal'
import Pagination from '@/components/general/Pagination'
import TopicsList from '@/app/solutions/components/TopicsList'

export default {
  mixins: [paginateMixin, sharedDataMixin],
  name: 'ModalBindTopicTemplate',
  components: {
    Modal,
    Action,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    EmptyMessage,
    Pagination,
    TopicsList
  },
  props: {
    courseId: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      alreadyBindedTopicTemplates: [],
      currentBindedItems: [],
      enabledColumns: ['name', 'type', 'bind'],
      lastChangedId: null,
      themeDark: true
    }
  },
  computed: {
    ...mapState({
      fetching: state => state.fetching,
      accessibility: state => state.accessibility,
      currentCourse: state => state.Courses.current,
      topicsTemplates: state => state.Courses.topicsTemplates
    })
  },
  watch: {
    'pgtrIsFetching': {
      immediate: true,
      handler (loading) {
        this.setFetching(loading)
      }
    }
  },

  created() {
    this.setFetching(true)
    this.attemptTopicsRetrieval({ courseId: this.courseId, params: { embed: 'topic_template' } })
      .then((topicsData) => {
        this.alreadyBindedTopicTemplates = topicsData.data.reduce((arrayBindedItems, topic) => {
          if (
            topic._embedded &&
            topic._embedded.topic_template &&
            topic._embedded.topic_template.id
          ) {
            arrayBindedItems.push(topic._embedded.topic_template.id)
          }
          return arrayBindedItems
        }, [])
        this.pgtrInitializePagination('topicsTemplatesResources', null, { embed: 'meta,author' })
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptBindTopicsTemplates',
      'attemptCourseRetrieval',
      'attemptTopicsRetrieval',
      'setFeedback'
    ]),

    closeModal() {
      this.$router.push({ name: 'solutions.create.classes' })
    },

    async saveBindedItems () {
      try {
        await this.attemptBindTopicsTemplates({
          courseId: this.currentCourse.id,
          data: { templates_id: this.currentBindedItems }
        })
        this.setFeedback({ message: this.$tc('solutions.bind.topicTemplate:modal.feedback.success', this.currentBindedItems.length) })
        this.$router.push({name: 'solutions.create.classes'})
      } catch (error) {
        if (error.response.data.message === 'recovery_examination_already_exists_at_course') {
          return this.setFeedback({
            message: this.$t('solutions.bind.topicTemplate:modal.feedback.error.3'),
            type: 'error',
          })
        }
        if (error.response.data.message === 'more_than_one_recovery_examination_binded') {
          return this.setFeedback({
            message: this.$t('solutions.bind.topicTemplate:modal.feedback.error.2'),
            type: 'error',
          })
        }
        this.setFeedback({
          message: this.$t('solutions.bind.topicTemplate:modal.feedback.error'),
          type: 'error',
        })
      }
    }
  },
}
</script>

<template>
  <modal active @close="closeModal()" is-page>

    <div class="modal-form">
      <p class="modal-subtitle">{{ $t('solutions.bind.topicTemplate:modal.subtitle') }}</p>
      <h2 class="modal-title text-color">{{ currentCourse.name || null }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('solutions.bind.topicTemplate:modal.description') }}</p>
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

    <empty-message dark v-if="topicsTemplates.length === 0 && !pgtrIsFiltering && !pgtrIsSearching">
      <h2>{{ $t('solutions.topicsTemplates.list:empty.title') }}</h2>
      <p class="text-color">{{ $t('solutions.topicsTemplates.list:empty.message') }}</p>
    </empty-message>

    <empty-message v-if="topicsTemplates.length === 0 && pgtrIsFiltering && !pgtrIsSearching">
      <h2>{{ $t('solutions.list:filter.empty.title') }}</h2>
    </empty-message>

    <!-- Search -->
    <empty-message v-if="topicsTemplates.length === 0 && !pgtrIsFiltering && pgtrIsSearching">
      <h2>{{ $t('global:search.empty.title') }}</h2>
      <p class="text-color">{{ $t('global:search.empty.message') }}</p>
    </empty-message>

    <div class="center" v-if="topicsTemplates.length">
      <topics-list
        v-model="currentBindedItems"
        dark
        :topics-items="topicsTemplates"
        :enabled-columns="enabledColumns"
        :already-binded-topic-templates="alreadyBindedTopicTemplates"
      />

      <div v-if="topicsTemplates.length" class="datatable-item-selected theme-dark flex gap-2 my-2">
        <div class="text-color text-base">{{ $t('solutions.bind.topicTemplate:modal.list.binded.total') }}</div>
        <span class="datatable-item-selected-length text-base">{{ currentBindedItems.length }}</span>
      </div>

      <pagination
        :dark="themeDark"
        :activePage="pgtrParams.page"
        :pageCount="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />

      <div class="text-center">
        <action
          v-if="topicsTemplates.length"
          large
          secondary
          class="mb-10"
          type="button"
          :disabled="currentBindedItems.length === 0"
          :text="$t('global:save')"
          @click="saveBindedItems"
        />
      </div>

    </div>
  </modal>
</template>