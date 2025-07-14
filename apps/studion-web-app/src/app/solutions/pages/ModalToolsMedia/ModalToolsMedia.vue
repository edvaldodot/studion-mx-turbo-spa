<script>
import { mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { formatFileSize } from '@/support/utils/storageUnit'
import { libraryMixin } from '@/mixins/libraryMixin'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Pagination from '@/components/general/Pagination'
import EmptyMessage from '@/components/general/EmptyMessage'

export default {
  name: 'ModalToolsMedia',

  components: {
    Modal,
    Action,
    Checkbox,
    Datatable,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Pagination,
    EmptyMessage,
  },

  mixins: [paginateMixin, libraryMixin],

  props: {
    course: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      formData: {
        links: [],
      },
    }
  },

  computed: {
    mappedLinksList() {
      if (!this.pgtrCurrentData) return []
      return this.pgtrCurrentData.map((data) => {
        data.import = this.formData.links.some((link) => link.id === data.id)
        return data
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

    courseId() {
      return this.$route.params.id
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
    this.pgtrInitializePagination(
      'solutionMediasListResource',
      { courseId: this.courseId },
      { limit: 12 }
    )
  },

  methods: {
    ...mapActions(['setFetching']),

    selectSolution(event, item) {
      if (event) {
        this.formData.links.push(item)
      } else {
        this.formData.links = this.formData.links.filter((link) => {
          return link.id !== item.id
        })
      }
    },

    addLinks() {
      this.$emit('add-links', [...this.formData.links])
      this.$router.push({ name: 'solutions.create.tools', params: { id: this.courseId } })
      this.$destroy()
    },
  },
}
</script>

<template>
  <Modal
    active
    is-page
  >
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('library:modal.link.subtitle') }}</span>
      <h2 class="modal-title text-color is-capitalize">{{ course.name }}</h2>
      <div
        v-if="pgtrCurrentData.length > 0"
        class="modal-description text-color"
      >
        <p class="text-color">{{ $t('library:modal.link.description') }}</p>
      </div>
    </div>

    <FilterList>
      <FilterListSearch
        slot="search"
        hide-error-details
        dark
        @search="pgtrSetSearch('title', $event)"
      />
      <FilterListOrder
        slot="order"
        :options="filterListOrderOptions"
        dark
        on-server
        @update-orders="pgtrUpdateOrder"
      />
    </FilterList>

    <EmptyMessage v-if="pgtrCurrentData.length === 0">
      <h2>{{ $t('library:modal.link.empty.title') }}</h2>
      <p v-html="$t('library:modal.link.empty.message')"></p>
    </EmptyMessage>

    <div class="modal-solution-tools-import-media">
      <form
        v-if="pgtrCurrentData.length"
        @submit.prevent="saveLinks"
      >
        <Datatable
          :items="mappedLinksList"
          dark
        >
          <template
            v-if="!$media.mobile"
            slot="thead"
          >
            <tr>
              <th class="th">{{ $t('library:datatable.header.1') }}</th>
              <th
                class="th"
                width="200"
              >
                {{ $t('library:datatable.header.2') }}
              </th>
              <th
                class="th"
                width="40"
              ></th>
              <th
                class="th"
                width="75"
              >
                {{ $t('library:datatable.header.3') }}
              </th>
            </tr>
          </template>
          <template
            slot="tbody"
            slot-scope="{ item }"
          >
            <tr
              v-if="$media.mobile"
              class="tr-colspan"
            >
              <td
                class="td"
                colspan="3"
              >
                <span class="td-text bolder">{{ item.title }}</span>
              </td>
            </tr>
            <tr>
              <td
                v-if="!$media.mobile"
                class="td"
              >
                <span class="td-text bolder">{{ item.title }}</span>
              </td>
              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header td-text-header-inline"
                >
                  {{ $t('library:datatable.header.2') }}
                </span>
                <span class="td-text">{{
                  item.meta.type !== 'external_link'
                    ? getFileSize(item)
                    : $t('global:external.media')
                }}</span>
              </td>
              <td
                class="td td-actions"
                width="40"
              >
                <Action
                  v-if="item.meta.type !== 'external_link'"
                  type="link"
                  icon="download"
                  download
                  @click="$emit('download', { ...item, fileName: item.filename })"
                />
                <Action
                  v-else
                  type="link"
                  icon="visibility"
                  :url="item.path"
                  target="_blank"
                />
              </td>
              <td
                class="td text-center"
                width="75"
              >
                <Checkbox
                  v-model="item.import"
                  :items="[{ value: true }]"
                  switch-type
                  dark
                  @input="selectSolution($event, item)"
                />
              </td>
            </tr>
          </template>
        </Datatable>

        <div class="datatable-item-selected theme-dark mt-5 mb-5">
          <p class="text-color">{{ $t('library:modal.link.datatable.selected') }}</p>
          <span class="datatable-item-selected-length">{{ formData.links.length }}</span>
        </div>

        <Pagination
          :active-page="pgtrParams.page"
          :page-count="pgtrLastPage"
          dark
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
          @go-to-page="pgtrParams.page = $event"
          @change-items-per-page="pgtrParams.limit = $event"
        />

        <div class="form-submit text-center">
          <Action
            :text="$t('global:form.save')"
            class="mt-5"
            type="button"
            secondary
            large
            fixed-width
            @click="addLinks"
          />
        </div>
      </form>
    </div>
  </Modal>
</template>
