<script>
import { mapActions, mapState } from 'vuex'

import Accordion from '@/components/general/Accordion'
import AccordionItem from '@/components/general/AccordionItem'
import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Like from '@/components/general/Like'
import Pagination from '@/components/general/Pagination'

export default {
  name: 'faqList',
  components: {
    Accordion,
    AccordionItem,
    Action,
    ActionBar,
    ContentHeader,
    EmptyMessage: () => import('@/components/general/EmptyMessage'),
    FilterList,
    FilterListOrder,
    FilterListTag,
    Like,
    Pagination,
  },
  data() {
    return {
      search: null,
      filterTagOptions: [],
      faqsQueryParams: {
        page: 1,
        order: { position: 'asc' },
      },
      paging: { actualPage: 1 },
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.name === 'faq.questions') {
      this.loadFaq()
    }
    next()
  },
  computed: {
    ...mapState(['Account', 'faqs', 'accessibility']),
    isEditing() {
      return this.$route.meta.editing || false
    },
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('faqs')
    },
    hasReadAccess() {
      return this.canRead('faqs')
    },
  },
  watch: {
    'faqsQueryParams.page'() {
      this.loadFaq()
    },
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptFaqQuestionsListRetrieval',
      'attemptFaqCategoriesRetrieval',
      'attemptFaqQuestionsRemoval',
      'setFaqsData',
    ]),

    changeItemsPerPage(val) {
      this.faqsQueryParams.limit = val
      if (this.faqsQueryParams.page !== 1) {
        this.faqsQueryParams.page = 1
        return
      }
      this.loadFaq()
    },
    editFaq(faq) {
      this.setFaqsData({ path: 'current', value: faq })
      this.openModalEditFaq()
    },
    deleteFaq(id, index) {
      this.setFetching(true)
      this.attemptFaqQuestionsRemoval(id)
        .then(() => {
          this.setFeedback({ message: this.$t('faq.questions:feedback.remove.success') })
          this.loadFaq()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('faq.questions:feedback.remove.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openModalAddFaq() {
      this.$router.push({ name: 'faq.questions.create' })
    },
    openModalEditFaq() {
      this.$router.push({ name: 'faq.questions.edit', params: { id: this.faqs.current.id } })
    },
    getFaqItems(categoryId) {
      return this.faqs.items.filter(({ category }) => category.id === categoryId)
    },
    loadFaq() {
      this.setFetching(true)
      this.attemptFaqQuestionsListRetrieval(this.faqsQueryParams)
        .then((response) => {
          this.setFaqsData({
            path: 'items',
            value: response.status === 204 ? [] : response.data.data,
          })
          this.paging = response.data
          if (this.isEditing) {
            this.setFaqsData({
              path: 'current',
              value: this.faqs.items.find((item) => item.id === parseInt(this.$route.params.id)),
            })
            if (!this.faqs.current) {
              this.$router.push({ name: 'faq.questions' })
            }
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    nextPage() {
      if (this.paging.nextPage) {
        this.faqsQueryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.faqsQueryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.faqsQueryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.faqsQueryParams.page = this.paging.firstPage
      }
    },
  },
  created() {
    if (!this.hasReadAccess) {
      this.$router.push({ name: 'dashboard' })
    }
    this.loadItemsPerPagePreferences(this.faqsQueryParams)
    this.setFetching(true)
    Promise.all([this.attemptFaqCategoriesRetrieval({ page: 1, limit: 1000 })])
      .then(([categories]) => {
        this.setFaqsData({
          path: 'categories',
          value: categories.status === 204 ? [] : categories.data.data,
        })
        this.loadFaq()
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
}
</script>

<template>
  <div class="main-content">
    <ContentHeader
      :title="$t('faq:header.title.2')"
      :description="
        hasWriteAccess ? $t('faq:header.description:admin') : $t('faq:header.description:student')
      "
      :tag="$t('faq:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-3">
      <filter-list v-if="hasWriteAccess">
        <action
          :text="$t('faq.index:btn.add')"
          type="button"
          primary
          large
          fixed-width
          slot="button"
          @click="openModalAddFaq()"
          :dark="accessibility"
        />
        <!-- <filter-list-tag
          slot="tag"
          :options="filterTagOptions"
          state="faqs"
        ></filter-list-tag>
        <filter-list-order
          slot="order"
          state="faqs"
        ></filter-list-order> -->
      </filter-list>
    </div>
    <div class="p-4">
      <empty-message v-if="faqs.items.length === 0 && hasWriteAccess">
        <h2>{{ $t('faq.index:empty.title:admin') }}</h2>
        <p class="text-color">{{ $t('faq.index:empty.message:admin') }}</p>
      </empty-message>
    </div>

    <empty-message v-if="faqs.items.length === 0 && Account.user.currentProfile === 'student'">
      <h2>{{ $t('faq.index:empty.title:student') }}</h2>
      <p class="text-color">{{ $t('faq.index:empty.message:student') }}</p>
    </empty-message>

    <div
      class="faq"
      v-if="faqs.items.length && hasReadAccess"
    >
      <div class="center">
        <h2 class="faq-title">{{ $t('faq.index:title') }}</h2>
        <template v-for="(category, categoryIndex) in faqs.categories">
          <template v-if="category.active && getFaqItems(category.id).length">
            <h3
              class="faq-category"
              :key="`title-${categoryIndex}`"
            >
              {{ category.name }}
            </h3>
            <accordion :key="`accordion-${categoryIndex}`">
              <accordion-item
                :title="faq.question"
                v-for="(faq, faqIndex) in getFaqItems(category.id)"
                :key="`accordion-item-${faq.id}`"
              >
                <template slot="content">
                  <p class="text-color">{{ faq.answer }}</p>
                  <div class="accordion-actions">
                    <like
                      :stats="faq.likeStatistics"
                      :entity-alias="'faqs'"
                      :entity-id="faq.id"
                      :dark="accessibility"
                    />
                    <template v-if="hasWriteAccess">
                      <action
                        type="button"
                        :text="$t('global:edit')"
                        flat
                        @click="editFaq(faq)"
                        :dark="accessibility"
                      />
                      <action
                        type="button"
                        :text="$t('global:remove')"
                        flat
                        @click="deleteFaq(faq.id, faqIndex)"
                        :dark="accessibility"
                      />
                    </template>
                  </div>
                </template>
              </accordion-item>
            </accordion>
          </template>
        </template>
        <pagination
          :activePage="paging.actualPage"
          :pageCount="paging.lastPage"
          @next-page="nextPage"
          @previous-page="previousPage"
          @first-page="firstPage"
          @last-page="lastPage"
          @go-to-page="faqsQueryParams.page = $event"
          @change-items-per-page="changeItemsPerPage"
        />
      </div>
    </div>

    <router-view></router-view>
  </div>
</template>

<style lang="scss"></style>
<style lang="scss">@import "~@/components/general/Like/Like.scss";</style>
