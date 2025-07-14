<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import Pagination from '@/components/general/Pagination'
export default {
  name: 'faqCategories',
  components: {
    Action,
    ActionBar,
    Checkbox,
    ContentHeader,
    Datatable,
    Dropdown,
    DropdownLink,
    EmptyMessage: () => import('@/components/general/EmptyMessage'),
    FilterList,
    FilterListOrder,
    FilterListTag,
    Pagination,
  },
  data() {
    return {
      filterTagOptions: [
        // {
        //   title: 'Tipo',
        //   name: 'type',
        //   items: [
        //     {label: 'Online', value: 0},
        //     {label: 'Presencial', value: 1},
        //     {label: 'Blended', value: 2}
        //   ]
        // },
        // {
        //   title: 'Cobrança',
        //   name: 'charge',
        //   items: [
        //     {label: 'Gratuito', value: 0},
        //     {label: 'Pago', value: 1}
        //   ]
        // },
        // {
        //   title: 'Acquisição',
        //   name: 'purchase',
        //   items: [
        //     {label: 'Comprado', value: 0},
        //     {label: 'Não comprado', value: 1}
        //   ]
        // },
        // {
        //   title: 'Inscrições',
        //   name: 'registrations',
        //   items: [
        //     {label: 'Inscrições abertas', value: 0},
        //     {label: 'Encerradas', value: 1}
        //   ]
        // }
      ],
      faqsCategoriesQueryParams: {
        page: 1,
      },
      paging: { actualPage: 1 },
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'faqs']),
    isEditing() {
      return this.$route.meta.editing || false
    },
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('faqs')
    },
    shouldRefreshCategories() {
      return this.$route.params.refreshCategories
    },
  },
  watch: {
    shouldRefreshCategories() {
      if (this.$route.params.refreshCategories) {
        this.loadFaqCategory()
      }
    },
    'faqsCategoriesQueryParams.page'() {
      this.loadFaqCategory()
    },
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptFaqCategoriesRetrieval',
      'attemptFaqCategoryRemoval',
      'attemptFaqCategoryActivation',
      'attemptFaqCategoryDeactivation',
      'setFaqsData',
    ]),
    openModalAddCategory() {
      this.$router.push({ name: 'faq.categories.create' })
    },
    openModalEditCategory() {
      this.$router.push({ name: 'faq.categories.edit', params: { id: this.faqs.current.id } })
    },
    edit(item, index) {
      // this.faqs.current = item
      this.setFaqsData({ path: 'current', value: item })
      this.openModalEditCategory()
    },
    remove(item, index) {
      this.setFetching(true)
      this.attemptFaqCategoryRemoval(item.id)
        .then(() => {
          this.setFeedback({ message: this.$t('faq.categories:feedback.removed.success') })
          this.loadFaqCategory()
        })
        .catch(({ response }) => {
          if (response.data.message === 'category_has_faqs') {
            this.setFeedback({
              message: this.$t('faq.categories:feedback.removed.error.has.faq'),
              type: 'error',
            })
          } else {
            this.setFeedback({
              message: this.$t('faq.categories:feedback.removed.error'),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    checkActivation(item, index) {
      item.active ? this.activate(item, index) : this.deactivate(item, index)
    },
    activate(item) {
      this.setFetching(true)
      this.attemptFaqCategoryActivation(item.id)
        .then(() => {
          item.active = true
          this.setFeedback({ message: this.$t('faq.categories:feedback.activated.success') })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('faq.categories:feedback.activated.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    deactivate(item) {
      this.setFetching(true)
      this.attemptFaqCategoryDeactivation(item.id)
        .then(() => {
          item.active = false
          this.setFeedback({ message: this.$t('faq.categories:feedback.deactivated.success') })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('faq.categories:feedback.deactivated.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    nextPage() {
      if (this.paging.nextPage) {
        this.faqsCategoriesQueryParams.page = this.paging.nextPage
        this.loadFaqCategory()
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.faqsCategoriesQueryParams.page = this.paging.previousPage
        this.loadFaqCategory()
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.faqsCategoriesQueryParams.page = this.paging.lastPage
        this.loadFaqCategory()
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.faqsCategoriesQueryParams.page = this.paging.firstPage
        this.loadFaqCategory()
      }
    },
    changeItemsPerPage(val) {
      this.faqsCategoriesQueryParams.limit = val
      if (this.faqsCategoriesQueryParams.page !== 1) {
        this.faqsCategoriesQueryParams.page = 1
        return
      }
      this.loadFaqCategory()
    },
    loadFaqCategory() {
      this.setFetching(true)
      this.attemptFaqCategoriesRetrieval(this.faqsCategoriesQueryParams)
        .then((response) => {
          if (this.faqsCategoriesQueryParams.page > 1 && response.status === 204) {
            this.previousPage()
          } else {
            this.setFaqsData({
              path: 'categories',
              value: response.status === 204 ? [] : response.data.data,
            })

            this.paging = response.data
            if (this.isEditing) {
              this.setFaqsData({
                path: 'current',
                value: this.faqs.categories.find(
                  (item) => item.id === parseInt(this.$route.params.id)
                ),
              })

              if (!this.faqs.current) {
                this.$router.push({ name: 'faq.categories' })
              }
            }
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
  created() {
    this.loadItemsPerPagePreferences(this.faqsCategoriesQueryParams)
    if (!this.hasWriteAccess) {
      this.$router.push({ name: 'faq.questions' })
    } else {
      this.loadFaqCategory()
    }
  },
}
</script>

<template>
  <div class="main-content">
    <ContentHeader
      v-if="hasWriteAccess"
      :title="$t('faq:header.title.3')"
      :description="$t('faq:header.description.2')"
      :tag="$t('faq:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-3">
      <filter-list v-if="hasWriteAccess">
        <action
          :text="$t('faq.categories:btn.add')"
          type="button"
          primary
          large
          fixed-width
          slot="button"
          @click="openModalAddCategory()"
          :dark="accessibility"
        ></action>
        <!-- <filter-list-tag slot="tag" :options="filterTagOptions" state="faqs"></filter-list-tag>
        <filter-list-order slot="order" state="faqs"></filter-list-order> -->
      </filter-list>
    </div>

    <div class="p-4">
      <empty-message v-if="faqs.categories.length === 0 && hasWriteAccess">
        <h2>{{ $t('faq.categories:empty.title:admin') }}</h2>
        <p v-html="$t('faq.categories:empty.message:admin')"></p>
      </empty-message>
    </div>

    <div
      class="center"
      v-if="faqs.categories.length"
    >
      <datatable
        :items="faqs.categories"
        :dark="accessibility"
        v-if="hasWriteAccess"
      >
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th class="th">{{ $t('faq.categories:datatable.header.1') }}</th>
            <th
              class="th"
              width="54"
            >
              {{ $t('faq.categories:datatable.header.2') }}
            </th>
            <th
              class="th"
              width="40"
            ></th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr>
            <td class="td">
              <span
                class="td-text-header"
                v-if="$media.mobile"
                >{{ $t('faq.categories:datatable.header.1') }}</span
              >
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
            <td class="td text-center">
              <span
                class="td-text-header"
                v-if="$media.mobile"
                >{{ $t('faq.categories:datatable.header.2') }}</span
              >
              <checkbox
                :items="[{ value: true }]"
                v-model="props.item.active"
                switch-type
                @input="checkActivation(props.item, props.index)"
                :dark="accessibility"
              ></checkbox>
            </td>
            <td
              class="td td-actions"
              width="40"
            >
              <dropdown
                icon="dots-vertical"
                right
              >
                <dropdown-link
                  :text="$t('global:edit')"
                  @click="edit(props.item, props.index)"
                ></dropdown-link>
                <dropdown-link
                  :text="$t('global:remove')"
                  @click="remove(props.item, props.index)"
                ></dropdown-link>
              </dropdown>
            </td>
          </tr>
        </template>
      </datatable>
      <pagination
        :activePage="paging.actualPage"
        :pageCount="paging.lastPage"
        @next-page="nextPage"
        @previous-page="previousPage"
        @first-page="firstPage"
        @last-page="lastPage"
        @go-to-page="faqsCategoriesQueryParams.page = $event"
        @change-items-per-page="changeItemsPerPage"
      ></pagination>
    </div>
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
</style>
