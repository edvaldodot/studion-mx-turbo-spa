<script>
import { mapActions, mapState } from 'vuex'

import {
  Button,
  FilterList,
  FilterListOrder,
  FilterListSearch,
  PageHeader,
  Link,
  CardV2,
  Pagination,
} from '@/components/general'

const Modal = () => import('@/components/general/Modal')
const EmptyMessage = () => import('@/components/general/EmptyMessage')
const InfiniteLoading = () => import('vue-infinite-loading')
const SkeletonCatalogItem = () => import('../../components/SkeletonCatalogItem')

import OfferingCard from '../../components/OfferingCard'
import OfferingSection from '../../components/OfferingSection'

export default {
  name: 'OfferingList',
  components: {
    Button,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    Modal,
    EmptyMessage,
    InfiniteLoading,
    SkeletonCatalogItem,
    PageHeader,
    Link,
    OfferingCard,
    OfferingSection,
    Card: CardV2,
    Pagination,
  },
  data() {
    return {
      paging: {
        actualPage: 1,
      },
      offeringQueryParams: {
        page: 1,
        limit: 12,
        order: { position: 'asc', created_at: 'desc' },
      },
      searchValue: null,
      searching: false,
      listingMode: false,
      btnIsVisible: true,
      existSessionsLinked: false,
      useInfiniteLoading: false,
      infiniteLoadComplete: false,
      infiniteLoadState: null,
      modalConfirm: false,
      modalConfirmMessage: '',
      selectedOffering: { offeringId: null, index: null },
      categoriesList: [],
      isFiltering: false,
      isFetchingList: false,
      paramsHelper: {
        order: {},
        mode: false,
        categories: null,
        counter: 0,
      },
    }
  },
  computed: {
    ...mapState(['Account', 'offerings', 'accessibility']),
    items() {
      return this.offerings.search || this.offerings.items || []
    },
    regex() {
      return new RegExp(`(${this.searchValue})`, 'i')
    },
    hasWriteAccess() {
      return this.notEqualsProfile('student') ? this.canWrite('offerings') : false
    },
    description() {
      return this.Account.user.currentProfile === 'student'
        ? this.$t('offerings:header.description:student')
        : this.$t('offerings:header.description:admin')
    },
    getEmbed() {
      return 'rating_analysis'
    },
    isNewCatalog() {
      return this.$isEnabledFeature('offering_v2')
    },

    isManualTrigger() {
      return this.isNewCatalog && this.$media.mobile
    },

    pageLimit() {
      if (this.isNewCatalog && !this.listingMode) return 4
      return this.offeringQueryParams.limit
    },
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'title',
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
    headerDescription() {
      const description = {
        admin: this.$t('offerings:header.description:admin'),
        student: this.$t('offerings:header.description:student'),
      }
      return description[this.Account.user.currentProfile]
    },
    isNotStudentAndCanWriteOfferings() {
      return this.notEqualsProfile('student') && this.canWrite('offerings')
    },
  },
  watch: {
    'offeringQueryParams.page'() {
      if (!this.isNewCatalog) {
        this.loadPage(this.offeringQueryParams.page)
      }
    },
  },
  created() {
    this.loadItemsPerPagePreferences(this.offeringQueryParams)

    this.firstLoad()

    this.attemptCategoryListRetrieval().then(({ data }) => {
      this.categoriesList = data.data.map((category) => ({
        text: category.name,
        value: category.id,
      }))
    })
  },
  destroyed() {
    this.setOfferingsData({ path: 'items', value: [] })
  },
  methods: {
    changeType(value) {
      if (this.isManualTrigger) {
        this.paramsHelper.mode = value
        return
      }
      this.listingMode = value
      this.setOfferingsData({ path: 'items', value: [] })
      this.firstLoad()
    },
    ...mapActions([
      'attemptOfferingRemoval',
      'attemptOfferingsRetrievalByLoggedProfile',
      'setFetching',
      'setFeedback',
      'attemptOfferingStatusRetrieval',
      'attemptToggleOfferingActiveStatus',
      'attemptToggleOfferingPublishStatus',
      'attemptCategoryListRetrieval',
      'setOfferingsData',
    ]),
    changeItemsPerPage(val) {
      this.offeringQueryParams.limit = val
      if (this.offeringQueryParams.page !== 1) {
        this.offeringQueryParams.page = 1
        return
      }
      this.loadPage(this.offeringQueryParams.page)
    },
    editItem(offeringId) {
      this.$router.push({
        name: 'offerings.update',
        params: { id: offeringId },
      })
    },
    removeItem(offeringId, index) {
      this.setFetching(true)
      this.selectedOffering = { offeringId, index }
      this.attemptOfferingStatusRetrieval(offeringId)
        .then(({ data }) => {
          this.openModalConfirm(data, this.offerings.items[index].title)
        })
        .catch(this.offeringRemovalError)
        .finally(() => {
          this.setFetching(false)
        })
    },
    toggleActiveStatus(offeringId, index) {
      this.setFetching(true)
      this.attemptToggleOfferingActiveStatus(offeringId)
        .then(({ data }) => {
          this.setOfferingsData({ path: `items[${index}].active`, value: data.active })
          let offeringName = this.offerings.items[index].title
          this.setFeedback({
            message: data.active
              ? this.$t('offerings.list:feedback.activated', { offeringName: offeringName })
              : this.$t('offerings.list:feedback.deactivated', { offeringName: offeringName }),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    confirmRemoval() {
      if (this.selectedOffering.offeringId !== null) {
        this.modalConfirm = false
        this.setFetching(true)
        let offeringName = this.offerings.items[this.selectedOffering.index].title
        this.attemptOfferingRemoval(this.selectedOffering.offeringId)
          .then(() => {
            return this.offeringRemovalSuccess(this.selectedOffering.index, offeringName)
          })
          .catch(this.offeringRemovalError)
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    openModalConfirm(data, offeringName) {
      if (data.sessionCount > 0 || data.enrollments > 0) {
        this.existSessionsLinked = true
        this.modalConfirmMessage = this.$t('offerings.list:modal.remove.confirm.sessions.warning', {
          searchOfferingName: offeringName,
        })
      } else {
        this.existSessionsLinked = false
        this.modalConfirmMessage = this.$t('offerings.list:modal.remove.confirm.message', {
          searchOfferingName: offeringName,
        })
      }
      this.modalConfirm = true
    },
    closeModalConfirm() {
      this.modalConfirm = false
      this.modalConfirmMessage = ''
      this.selectedOffering = { offeringId: null, index: null }
    },
    openItem(offeringId) {
      this.$router.push({
        name: 'offerings.view',
        params: { id: offeringId },
      })
    },
    offeringRemovalSuccess(index, offeringName) {
      this.setFetching(false)
      this.setFeedback({
        message: this.$t('offerings.list:feedback.removed', { searchOfferingName: offeringName }),
      })
      this.listingMode ? this.refreshPage() : this.offerings.items.splice(index, 1)
    },
    offeringRemovalError() {
      this.setFeedback({ message: this.$t('offerings.list:feedback.error'), type: 'error' })
    },
    visibilityChanged(isVisible) {
      this.btnIsVisible = isVisible
    },
    clearSearch() {
      this.searching = false
      this.searchValue = ''
      this.setOfferingsData({ path: 'search', value: null })
    },
    loadOfferings(page, isToPushItems) {
      this.offeringQueryParams.page = page
      const actionParams = {
        ...this.offeringQueryParams,
        limit: this.pageLimit,
        embed: this.getEmbed,
      }

      return this.attemptOfferingsRetrievalByLoggedProfile(actionParams).then(({ data }) => {
        this.paging = data
        let items = data.data.map((item) => {
          return {
            id: item.id,
            title: item.title,
            image: item.image,
            price: item.paymentInfo.price,
            paid: item.paymentInfo.paid,
            published: item.published,
            active: item.active,
            category: item.meta.offeringTypeAlias || 'without',
            startDate: item.period.initial,
            visible: true,
            categories: item.categories,
            description: item.description,
            ratingAnalysis: item._embedded.rating_analysis,
          }
        })

        if (isToPushItems && this.offerings.items != null) {
          items = this.offerings.items.concat(items)
        }

        this.setOfferingsData({ path: 'items', value: items })
        return Promise.resolve(null)
      })
    },
    infiniteHandler($state) {
      this.infiniteLoadState = $state
      if (this.paging.nextPage && this.paging.total > 0) {
        this.loadOfferings(this.paging.nextPage, true)
          .then(() => this.infiniteLoadState.loaded())
          .catch(() => this.infiniteLoadState.loaded())
      } else {
        this.infiniteLoadState.complete()
        this.infiniteLoadComplete = true
      }
    },
    nextPage(isToPushItems) {
      return this.loadPage(this.paging.nextPage, isToPushItems)
    },
    previousPage() {
      return this.loadPage(this.paging.previousPage)
    },
    lastPage() {
      return this.loadPage(this.paging.lastPage)
    },
    firstPage() {
      return this.loadPage(this.paging.firstPage)
    },
    refreshPage() {
      return this.loadPage(this.paging.actualPage)
    },
    search(value) {
      this.searching = value !== ''
      this.offeringQueryParams.query = { title: value }
      return this.loadPage(1)
    },
    setLocalFetching(isFetching, isToPushItems) {
      if (this.isNewCatalog) {
        this.isFetchingList = isFetching && !isToPushItems
        if (this.listingMode) this.setFetching(isFetching)
        return
      }

      if (!isToPushItems) this.setFetching(isFetching)
    },
    loadPage(page, isToPushItems) {
      if (!Number.isInteger(page)) {
        return Promise.reject(new Error('send an integer as a parameter to loadPage'))
      }

      if (this.infiniteLoadState && this.infiniteLoadComplete) {
        this.infiniteLoadState.reset()
      }

      this.setLocalFetching(true, isToPushItems)

      return this.loadOfferings(page, isToPushItems)
        .then(() => {
          return Promise.resolve(null)
        })
        .finally(() => this.setLocalFetching(false))
    },
    firstLoad() {
      this.loadPage(1).then(() => {
        this.useInfiniteLoading = !this.listingMode
      })
    },
    filterCategories(value) {
      this.isFiltering = true
      if (value !== null) {
        this.offeringQueryParams.filter = {
          categories: value,
        }
      } else {
        this.offeringQueryParams.filter = {
          categories: null,
        }
      }

      this.paramsHelper.categories = value

      if (this.isManualTrigger) return
      return this.loadPage(1)
    },
    filterOrder(value) {
      this.isFiltering = value !== ''
      delete this.offeringQueryParams.order.title
      delete this.offeringQueryParams.order.created_at
      if (value) {
        this.offeringQueryParams.order[value.property] = value.type
        this.paramsHelper.order[value.property] = value.type
      } else {
        this.paramsHelper.order = {}
      }

      if (this.isManualTrigger) return
      return this.loadPage(1)
    },

    setFilterCounter() {
      const { mode, categories, order } = this.paramsHelper
      let counter = 0

      if (mode) {
        counter++
      }

      if (categories && categories.length) {
        counter++
      }

      if (order && Object.keys(order).length) {
        counter++
      }

      this.paramsHelper.counter = counter
    },

    applyFiltersManually(setCounter = true) {
      if (setCounter) {
        this.setFilterCounter()
      }
      this.listingMode = this.paramsHelper.mode
      this.loadPage(1)
    },

    clearFiltersManually() {
      this.$set(this, 'paramsHelper', {
        order: {},
        mode: false,
        categories: null,
        counter: 0,
      })

      this.applyFiltersManually(false)
    },
  },
}
</script>

<template>
  <div>
    <PageHeader>
      <template #section>
        {{ $t('offerings:header.title') }}
      </template>
      <template #description>
        {{ headerDescription }}
      </template>
      <template #actions>
        <Link
          v-if="isNotStudentAndCanWriteOfferings"
          :to="{ name: 'offerings.create' }"
        >
          <Button>
            {{ $t('offerings.list:btn.add') }}
          </Button>
        </Link>
      </template>
    </PageHeader>

    <div class="flex align-items-center justify-content-end p-4">
      <div class="py-4">
        <FilterList
          v-observe-visibility="visibilityChanged"
          :modern="isNewCatalog"
          :has-filter="isFiltering"
          :number-filters-select="paramsHelper.counter"
          :dark-toggle="isManualTrigger"
          toggle
          @manual:clearFilters="clearFiltersManually"
          @manual:applyFilters="applyFiltersManually"
        >
          <template slot="categories">
            <FilterListOrder
              :initial-value="paramsHelper.categories"
              :dark="isNewCatalog"
              :label="$tc('global:category', 2)"
              :options="categoriesList"
              :select-all-option="false"
              on-server
              multiple
              @update-orders="filterCategories"
            />
          </template>
          <FilterListOrder
            slot="order"
            :initial-value="paramsHelper.order"
            :dark="isNewCatalog"
            :options="filterListOrderOptions"
            state="Courses"
            on-server
            @update-orders="filterOrder"
          />
          <FilterListSearch
            :slot="isManualTrigger ? 'searchOutside' : 'search'"
            :boxed="isNewCatalog"
            :dark="isNewCatalog"
            :full-width="isNewCatalog && $media.mobile"
            hide-error-details
            @search="search"
          />
        </FilterList>
      </div>
    </div>

    <div
      v-if="isNewCatalog && isFetchingList"
      class="px-4 catalog-skeleton-list"
    >
      <SkeletonCatalogItem
        v-for="i in pageLimit"
        :key="i"
      />
    </div>

    <div :class="{ 'lg:px-4 xl:px-4': isNewCatalog }">
      <div>
        <template v-for="(item, index) in items">
          <OfferingSection
            v-if="isNewCatalog && item.visible"
            :id="item.id"
            :key="item.id"
            :title="item.title"
            :published="item.published"
            :active="item.active"
            :rating-analysis="item.ratingAnalysis"
            @edit="editItem(item.id)"
            @toggle-active-status="toggleActiveStatus(item.id, index)"
            @remove="removeItem(item.id, index)"
          />
        </template>
        <div
          v-if="!isNewCatalog"
          class="grid mx-1 lg:mx-4 xl:mx-4 mt-4"
        >
          <div
            v-for="(item, index) in items"
            :key="index"
            class="col-12 sm:col-2 md:col-4 lg:col-4 xl:col-3"
          >
            <OfferingCard
              class="my-3 lg:my-2 xl:my-2"
              :item="item"
              :index="index"
              is-offering
              :permission-actions="isNotStudentAndCanWriteOfferings"
              @edit="editItem(item.id)"
              @toggle-active-status="toggleActiveStatus(item.id, index)"
              @remove="removeItem(item.id, index)"
            />
          </div>
        </div>

        <InfiniteLoading
          v-if="useInfiniteLoading && isNewCatalog"
          ref="infiniteLoading"
          force-use-infinite-wrapper
          @infinite="infiniteHandler"
        >
          <span slot="no-more"></span>
          <span slot="no-results"></span>
        </InfiniteLoading>
      </div>

      <div class="px-5">
        <Pagination
          v-if="!isNewCatalog && items.length"
          :active-page="paging.actualPage"
          :page-count="paging.lastPage"
          @next-page="nextPage"
          @previous-page="previousPage"
          @first-page="firstPage"
          @last-page="lastPage"
          @go-to-page="offeringQueryParams.page = $event"
          @change-items-per-page="changeItemsPerPage"
        />
      </div>
    </div>

    <div
      v-if="items.length === 0"
      class="my-3 w-12 lg:w-6 xl:w-6 mx-auto h-30rem"
    >
      <EmptyMessage
        v-if="items.length === 0 && notEqualsProfile('student') && !searching && !isFiltering"
        :empty-state="14"
        show-icon
      >
        <h2>{{ $t('offerings.list:empty.title:admin') }}</h2>
        <p class="text-color">{{ $t('offerings.list:empty.message:admin') }}</p>
      </EmptyMessage>

      <EmptyMessage
        v-if="items.length === 0 && equalsProfile('student') && !searching && !isFiltering"
        :empty-state="4"
        show-icon
      >
        <h2>{{ $t('offerings.list:empty.title:student') }}</h2>
        <p class="text-color">{{ $t('offerings.list:empty.message:student') }}</p>
      </EmptyMessage>

      <EmptyMessage
        v-if="items.length === 0 && searching"
        :empty-state="4"
        show-icon
      >
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </EmptyMessage>

      <EmptyMessage v-if="items.length === 0 && !searching && isFiltering">
        <h2>{{ $t('offerings:filter.empty.title') }}</h2>
      </EmptyMessage>
    </div>

    <Modal
      :active="modalConfirm"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Button
          variant="icon"
          icon="close"
          class="btn-close"
          @click="closeModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3
            v-if="existSessionsLinked"
            class="modal-confirm-title"
          >
            {{ $t('offerings.list:modal.remove.confirm.title.1') }}
          </h3>
          <h3
            v-else
            class="modal-confirm-title"
          >
            {{ $t('offerings.list:modal.remove.confirm.title.2') }}
          </h3>
          <div class="modal-confirm-description">
            <!-- Avoid 'v-html' directive can lead to XSS attack. (static i18n content) -->
            <!-- eslint-disable -->
            <p v-html="modalConfirmMessage"></p>
            <!-- eslint-enable -->
          </div>
        </div>
        <div
          v-if="existSessionsLinked"
          class="modal-confirm-footer"
        >
          <Button
            variant="text"
            class="btn-right"
            @click="closeModalConfirm()"
          >
            {{ $t('global:understood') }}
          </Button>
        </div>
        <div
          v-else
          class="modal-confirm-footer"
        >
          <Button
            variant="text"
            class="btn-right"
            @click="confirmRemoval()"
          >
            {{ $t('offerings.list:modal.remove.confirm.button') }}
          </Button>
          <Button
            :text="$t('global:cancel')"
            variant="text"
            @click="closeModalConfirm()"
          >
            {{ $t('global:cancel') }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss"></style>
