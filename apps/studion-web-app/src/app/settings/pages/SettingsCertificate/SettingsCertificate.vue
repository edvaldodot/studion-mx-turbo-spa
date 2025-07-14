<script>
import { mapActions, mapState } from 'vuex'
import { settingsMixin } from '@/mixins/settings'
import { paginateMixin } from '@/mixins/paginatorMixin'

import debounce from 'lodash/debounce'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import CardCertificate from '@/app/settings/components/CardCertificate'
import ContentHeader from '@/components/general/ContentHeader'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import Pagination from '@/components/general/Pagination'

const Modal = () => import('@/components/general/Modal')

export default {
  name: 'SettingsCertificate',

  components: {
    Action,
    ActionBar,
    CardCertificate,
    ContentHeader,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    Modal,
    Pagination,
  },

  mixins: [settingsMixin, paginateMixin],

  data() {
    return {
      modalConfirmRemove: false,
      currentCertificate: {},
      certificateModalMessage: null,
      certificateModalTitle: null,
      item_teste: {
        courses: 3,
        isDefault: false,
        isRemovable: false,
      },
      slider: null,
      certificateQueryParams: {
        page: 1,
      },
      certificates: {
        items: [],
      },
      modalCustom: false,
      certificateChanged: false,
      modalCertificate: null,
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility']),
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
    this.pgtrRouteParams.active = true
    this.pgtrInitializePagination('certificateListResource')
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptCertificateDependenciesRetrieval',
      'attemptCertificateRemoval',
      'setFeedback',
      'attemptCertificatePreviewRetrieval',
      'attemptDownloadCertificatePreviewRetrieval',
    ]),
    closeModalConfirmRemove() {
      this.modalConfirmRemove = false
    },
    removeCertificate(certificateId, index) {
      this.setFetching(true)
      this.attemptCertificateDependenciesRetrieval(certificateId)
        .then(({ data }) => {
          this.currentCertificate = data
          this.currentCertificate.id = certificateId
          this.currentCertificate.index = index
          if (this.currentCertificate.isDefault || !this.currentCertificate.isRemovable) {
            this.certificateModalMessage = this.$t('settings.certificate.list:modal.message.1', {
              numSolutions: this.currentCertificate.courses,
            })
            this.certificateModalTitle = this.$t('settings.certificate.list:modal.confirm.title.1')
          } else {
            this.certificateModalMessage = this.$t('settings.certificate.list:modal.message.2')
            this.certificateModalTitle = this.$t('settings.certificate.list:modal.confirm.title.2')
          }
          this.modalConfirmRemove = true
          this.setFetching(false)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openModalAddCertificate() {
      this.$router.push({ name: 'settings.certificate.create', params: { active: true } })
    },
    openModalPreviewCertificate(item) {
      this.setFetching(true)
      this.attemptDownloadCertificatePreviewRetrieval(item.id).finally(() => {
        this.setFetching(false)
      })
    },
    editItem(certificateId) {
      this.$router.push({
        name: 'settings.certificate.update',
        params: { id: certificateId },
      })
    },
    removeItem(certificateId) {
      this.setFetching(true)
      this.attemptCertificateRemoval(certificateId)
        .then(() => {
          this.modalConfirmRemove = false
          this.certificateRemovalSuccess()
        })
        .catch(this.certificateRemovalError)
        .finally(() => {
          this.setFetching(false)
        })
    },
    certificateRemovalSuccess() {
      this.pgtrRefresh()
      this.setFeedback({ message: this.$t('settings.certificate.list:feedback.removed') })
    },
    certificateRemovalError() {
      this.setFeedback({
        message: this.$t('settings.certificate.list:feedback.error'),
        type: 'error',
      })
    },
    getImageSrc(item) {
      if (item.meta.options.background.front) {
        return item.meta.options.background.front
      }
      return item.template.meta.options.images.background_front
    },
    getDefaultName(string) {
      return string.toLowerCase() === 'default'
        ? this.$t('settings.certificate.list:default.model')
        : string
    },

    searchDebounce: debounce(function (value) {
      if (value === null || value.length === 0 || value.length > 2) {
        this.pgtrSetSearch('name', value)
      }
    }, 800),
  },
}
</script>

<template>
  <div class="main-content  settings">
    <ContentHeader
      :title="$t('settings:header.title.4')"
      :description="$t('settings:header.description.3')"
      :tag="$t('settings:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-3">
      <FilterList>
        <Action
          slot="button"
          :dark="accessibility"
          :text="$t('settings.certificate:btn.add')"
          type="button"
          fixed-width
          primary
          large
          @click="openModalAddCertificate()"
        />

        <FilterListSearch
          slot="search"
          ref="filterlistsearch"
          :initial-value="pgtrParams.query['name']"
          hide-error-details
          @search="searchDebounce"
        />
      </FilterList>
    </div>
    <div class="p-4">
      <div
        v-if="pgtrCurrentData.length > 0"
        class="certificate-list"
      >
        <CardCertificate
          v-for="(item, index) in pgtrCurrentData"
          :key="`certificate-card-item-${item.id}`"
          :title="getDefaultName(item.description)"
          :description="getDefaultName(item.template.title)"
          :thumbnail="getImageSrc(item)"
          :is-default="item.description === 'default' && item.id === 1"
          :body="item.meta.content"
          :can-remove="item.id !== 1"
          :styles="item.style.description"
          :template-alias="item.template.alias"
          @edit="editItem(item.id)"
          @delete="removeCertificate(item.id, index)"
          @open="openModalPreviewCertificate(item)"
        />
      </div>

      <EmptyMessage v-else>
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </EmptyMessage>

      <Pagination
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

    <Modal
      :active="modalConfirmRemove"
      :cancel="false"
    >
      <div class="modal-confirm">
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ certificateModalTitle }}</h3>
        </div>
        <div class="modal-confirm-description">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p v-html="certificateModalMessage"></p>
        </div>
        <div class="modal-confirm-footer">
          <div v-if="!currentCertificate.isDefault && currentCertificate.isRemovable">
            <Action
              :text="$t('global:remove.certificate')"
              :dark="accessibility"
              type="button"
              class="btn-cancel btn-right"
              flat
              @click="removeItem(currentCertificate.id)"
            />
            <Action
              :text="$t('global:cancel')"
              :dark="accessibility"
              type="button"
              flat
              class="btn- btn-left"
              @click="closeModalConfirmRemove()"
            />
          </div>
          <div v-if="currentCertificate.isDefault || !currentCertificate.isRemovable">
            <Action
              :text="$t('global:understood')"
              :dark="accessibility"
              type="button"
              class="btn-cancel btn-right"
              flat
              @click="closeModalConfirmRemove()"
            />
          </div>
        </div>
      </div>
    </Modal>

    <RouterView @certificate-changed="pgtrRefresh" />
  </div>
</template>

<style lang="scss">
@import '~@/app/settings/styles.scss';
@import 'SettingsCertificate.scss';
</style>
