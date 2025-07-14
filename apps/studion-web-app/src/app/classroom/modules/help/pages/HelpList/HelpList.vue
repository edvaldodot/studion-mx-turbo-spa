<script>
import Action from '@/components/general/Action'
import EmptyMessage from '@/components/general/EmptyMessage'
import FileField from '@/components/general/FileField'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'
import Pagination from '@/components/general/Pagination'
import HelpAccordion from '@/components/shared/HelpAccordion'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import doubtsMixin from '../../mixins/doubtsMixin.js'
import { tabLinks } from '../../utils/tablinks'

export default {
  name: 'HelpList',

  components: {
    Action,
    EmptyMessage,
    FileField,
    HelpAccordion,
    InputField,
    SelectField,
    TextareaField,
    Pagination,
    FilterList,
    FilterListOrder,
    FilterListTag,
  },

  mixins: [doubtsMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  data() {
    return {
      filterTagOptions: [
        {
          title: this.$t('global:status'),
          name: 'status',
          items: [
            {
              text: this.$t('classroom.knowledgeBase:help.status.closed'),
              id: 'done',
              property: 'status',
            },
            {
              text: this.$t('classroom.knowledgeBase:help.status.pending'),
              id: 'pending',
              property: 'status',
            },
            {
              text: this.$t('classroom.knowledgeBase:help.status.feedback.pending'),
              id: 'closed',
              property: 'status',
            },
          ],
        },
      ],
    }
  },

  computed: {
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.date.new'),
          value: 0,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 1,
          property: 'created_at',
          type: 'asc',
        },
        {
          text: this.$t('global:order.last.updated.desc'),
          value: 2,
          property: 'last_updated_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.last.updated.asc'),
          value: 3,
          property: 'last_updated_at',
          type: 'asc',
        },
      ]
    },
  },

  created() {
    this.init()
    this.setup()
    this.getCategories()
  },

  methods: {
    init() {
      if (this.isStudent()) {
        this.$emit('change-header', {})
      } else {
        this.$emit('change-header', {
          tabLinks: [...tabLinks()],
        })
      }
    },
    filterOrder(value) {
      this.kbIssuesQueryParams.order = {}
      if (value) this.kbIssuesQueryParams.order[value.property] = value.type
      this.loadKbIssues()
    },

    updateFilters(filters) {
      const params = filters.reduce((acc, filter) => {
        if (!acc[filter.property]) {
          acc[filter.property] = []
        }
        acc[filter.property].push(filter.id)
        return acc
      }, {})

      this.kbIssuesQueryParams.filter = params
      this.kbIssuesQueryParams.page = 1

      this.loadKbIssues()
    },
  },
}
</script>

<template>
  <div class="inner-content p-4">
    <template v-if="equalsProfile('student')">
      <div class="help-form-wrapper">
        <div>
          <div class="help-form-card">
            <h2 class="help-form-title">{{ $t('classroom.knowledgeBase:help.form.title') }}</h2>
            <form @submit.prevent="addQuestion">
              <SelectField
                v-model="formData.position"
                :label="$t('global:form.to')"
                :items="forOptions"
                :validation="$v.formData.position"
                :dark="accessibility"
              />
              <InputField
                v-model="formData.subject"
                :label="$t('global:form.subject')"
                :validation="$v.formData.subject"
                :counter="100"
                :dark="accessibility"
              />
              <TextareaField
                v-model="formData.question"
                :label="$t('global:form.question.what')"
                :validation="$v.formData.question"
                :dark="accessibility"
                auto-grow
              />
              <FileField
                v-model="formData.attachment"
                :label="$t('global:form.attach.file')"
                :dark="accessibility"
                :accept="acceptedFormats"
              />
              <div class="form-submit text-center">
                <Action
                  type="button"
                  :text="$t('global:form.send')"
                  primary
                  large
                  fixed-width
                  submit
                  :dark="accessibility"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </template>

    <div class="py-4">
      <FilterList>
        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :label="$t('global:filter.order.label')"
          on-server
          @update-orders="filterOrder"
        />
        <FilterListTag
          slot="tag"
          :options="filterTagOptions"
          tag-all-filters-active
          @update-filters="updateFilters"
        />
      </FilterList>
    </div>

    <template v-if="items.length">
      <div class="center">
        <div class="help-list center">
          <h2
            v-if="notEqualsProfile('student')"
            class="help-list-title"
          >
            {{ $t('classroom.knowledgeBase:help.list.received.title') }}
          </h2>
          <h2
            v-else
            class="help-list-title"
          >
            {{ $t('classroom.knowledgeBase:help.list.sent.title') }}
          </h2>
          <HelpAccordion
            :doubts="items"
            :form-data-feedback="formDataFeedback"
            :kb-issues-query-params="kbIssuesQueryParams"
            :is-open-feedback-form="isOpenFeedbackForm"
            :validation="$v"
            :accepted-formats="acceptedFormats"
            :categories="categories"
            :responsible-list="forOptions"
            :form-data-forward="formDataForward"
            @download-attachment="downloadAttachment"
            @set-useful="setUseful"
            @add-answer="addAnswer"
            @open-feedback-form="openFeedbackForm"
            @forward="forward"
          />
        </div>

        <Pagination
          :active-page="paging.actualPage"
          :page-count="paging.lastPage"
          @next-page="nextPage"
          @previous-page="previousPage"
          @first-page="firstPage"
          @last-page="lastPage"
          @go-to-page="kbIssuesQueryParams.page = $event"
          @change-items-per-page="changeItemsPerPage"
        />
      </div>
    </template>

    <EmptyMessage v-if="items.length === 0 && notEqualsProfile('student')">
      <h2 class="text-color">{{ $t('classroom.knowledgeBase:empty.title') }}</h2>
      <p class="text-color">{{ $t('classroom.knowledgeBase:empty.message') }}</p>
    </EmptyMessage>
    <RouterView />
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/help/styles.scss';
</style>
