<script>
import { mapActions, mapState } from 'vuex'

import Action from '../Action'
import InputField from '../InputField'
import SelectField from '../SelectField'
import ChatbotAdapter from '@/support/adapters/ChatbotAdapter'

export default {
  name: 'ThePagination',

  components: {
    Action,
    InputField,
    SelectField,
  },

  props: {
    pageCount: {
      type: Number,
      default: 0,
    },
    activePage: {
      type: Number,
      default: 0,
    },
    prevPage: {
      type: Object,
      default: null,
    },
    nextPage: {
      type: Object,
      default: null,
    },
    firstPage: {
      type: Object,
      default: null,
    },
    lastPage: {
      type: Object,
      default: null,
    },
    dark: {
      type: Boolean,
      default: null,
    },
    activeFirstLast: {
      type: Boolean,
      default: true,
    },
    showText: {
      type: Boolean,
      default: true,
    },
    disableScroll: {
      type: Boolean,
      default: false,
    },
    disableItemsPerPage: {
      type: Boolean,
      default: false,
    },
    disableManualPage: {
      type: Boolean,
      default: false,
    },
    showAllPages: {
      type: Boolean,
      default: false,
    },
    blockLayout: {
      type: Boolean,
      default: false,
    },
    float: {
      type: Boolean,
      default: false,
    },
    customNext: {
      type: Boolean,
      default: false,
    },
    customNextStyle: {
      type: String,
      default: 'flat',
    },
    customNextText: {
      type: String,
      default: '',
    },
    disableCustomNext: {
      type: Boolean,
      default: false,
    },
    customPrev: {
      type: Boolean,
      default: false,
    },
    customRouting: {
      type: Boolean,
      default: false,
    },
    hidePrevButton: {
      type: Boolean,
      default: false,
    },
    hideNextButton: {
      type: Boolean,
      default: false,
    },
    classWrapper: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      itemsPerPagePreferences: {},
      actualPage: this.activePage || 0,
      itemsPerPage: 12,
      itemsPerPageOpt: [
        { text: '12', value: 12 },
        { text: '24', value: 24 },
        { text: '36', value: 36 },
        { text: '48', value: 48 },
        { text: '60', value: 60 },
      ],
      bottomIsVisible: false,
    }
  },

  computed: {
    ...mapState(['chatbot', 'menuExpanded']),

    nextText() {
      return this.showText && !(this.activeFirstLast && this.$media.mobile)
        ? this.customNextText || this.$t('global:next')
        : ''
    },
    prevText() {
      return this.showText && !(this.activeFirstLast && this.$media.mobile)
        ? this.$t('global:prev')
        : ''
    },
    inputFieldWidth() {
      return ((this.actualPage && String(this.actualPage).length * 12) || 14) + 16
    },
    pageCountList() {
      const list = []

      for (let i = 1; i <= this.pageCount; i++) {
        list.push({
          page: i,
          active: i === this.actualPage,
        })
      }

      return list
    },
    isDark() {
      return this.blockLayout ? true : this.dark
    },
    handleWithLateralMenu() {
      return this.float && this.menuExpanded
    },
    showPaginationPrevButton() {
      return !this.$media.mobile && !this.hidePrevButton
    },
    showPaginationNextButton() {
      return (
        (!this.$media.mobile && !this.hideNextButton) ||
        (this.activePage == this.pageCount && !this.hideNextButton)
      )
    },
  },

  watch: {
    activePage(newVal) {
      this.actualPage = newVal
    },
  },
  created() {
    this.actualPage = this.activePage

    this.itemsPerPagePreferences = this.getFromLocalStorage('itemsPerPagePreferences') || {}
    if (this.itemsPerPagePreferences[this.$route.name]) {
      this.itemsPerPage = this.itemsPerPagePreferences[this.$route.name]
    }

    if (this.float) {
      window.addEventListener('scroll', this.updateIfBottomIsVisible)
    }
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.updateIfBottomIsVisible)
  },

  mounted() {
    this.updateChatbotPosition(true)
    ChatbotAdapter.updateButtonPosition()
    this.updateIfBottomIsVisible()
  },

  methods: {
    ...mapActions(['updateChatbotPosition']),
    updateIfBottomIsVisible() {
      const documentEl = document.documentElement,
        distanceToPagination = this.$el.getBoundingClientRect().top + documentEl.scrollTop,
        gapToDocumentBottom =
          documentEl.scrollHeight - distanceToPagination - this.$el.offsetHeight,
        viewportBottomPosition = documentEl.scrollTop + window.innerHeight

      this.bottomIsVisible = viewportBottomPosition > documentEl.scrollHeight - gapToDocumentBottom
    },
    scrollToElem(elem) {
      if (this.disableScroll) return

      let top = elem ? elem.offsetTop : 0
      setTimeout(() => {
        window.scroll({
          top: top,
          behavior: 'smooth',
        })
      }, 100)
    },
    changeItemsPerPage() {
      this.itemsPerPagePreferences[this.$route.name] = this.itemsPerPage
      this.saveToLocalStorage('itemsPerPagePreferences', this.itemsPerPagePreferences)
      this.$emit('change-items-per-page', this.itemsPerPage)
    },
    prevAction() {
      this.$emit('previous-page')
      this.scrollToElem(null)

      if (this.customRouting || this.disableManualPage || this.customPrev) return

      const gotoPage = this.activePage - 1
      this.actualPage = gotoPage
    },
    goToPage(page) {
      this.$emit('go-to-page', page)

      if (this.customRouting || this.disableManualPage) return

      this.actualPage = page
    },
    forceToPage(page) {
      this.actualPage = page
    },
    nextAction() {
      this.$emit('next-page')
      this.scrollToElem(null)

      if (this.customRouting || this.disableManualPage || this.customNext) return

      const gotoPage = this.activePage + 1
      this.actualPage = gotoPage
    },
    lastPageAction() {
      const gotoPage = this.pageCount
      this.actualPage = gotoPage
      this.$emit('last-page')
      this.scrollToElem(null)
    },
    firstPageAction() {
      this.actualPage = 1
      this.$emit('first-page')
      this.scrollToElem(null)
    },
    changePage(e) {
      if (this.actualPage.length > String(this.pageCount).length) {
        this.actualPage = parseInt(String(this.actualPage).slice(0, String(this.pageCount).length))
      }

      if (e.keyCode !== 13) return

      if (!this.actualPage) return

      if (this.actualPage > this.pageCount) {
        this.actualPage = this.pageCount
      }

      if (this.actualPage < 1) {
        this.actualPage = 1
      }
      this.$emit('go-to-page', parseInt(this.actualPage))
      this.scrollToElem(null)
    },
    getButtonLeftType() {
      return this.prevPage ? null : 'button'
    },
    getButtonRightType() {
      return this.nextPage ? null : 'button'
    },
    getButtonFirstType() {
      return this.firstPage ? null : 'button'
    },
    getButtonLastType() {
      return this.lastPage ? null : 'button'
    },
  },
}
</script>

<template>
  <div
    class="pagination"
    :class="{
      'no-items-per-page': disableItemsPerPage,
      'theme-dark': isDark,
      'block-layout': blockLayout,
      float: blockLayout && float,
      'handle-lateral-menu': handleWithLateralMenu,
      'page-end': bottomIsVisible,
    }"
  >
    <div
      v-if="!disableItemsPerPage"
      class="pagination__items-per-page"
    >
      <span>{{ $t('global:pagination.items.per.page') }}</span>
      <SelectField
        v-model="itemsPerPage"
        :items="itemsPerPageOpt"
        :allow-clear="false"
        :dark="isDark"
        @input="changeItemsPerPage"
      />
    </div>

    <div
      v-if="pageCount >= 1"
      class="pagination__wrapper"
      :class="[
        {
          'non-overlapping-element': this.float,
          'has-prev-button': showPaginationPrevButton,
          'has-next-button': showPaginationNextButton,
        },
        classWrapper,
      ]"
    >
      <action
        v-if="activeFirstLast && !$media.mobile"
        :text="$t('global:begin')"
        icon="keyboard_thin_arrow_left"
        class="pagination__btn pagination__left pagination__first"
        :type="getButtonFirstType()"
        :url="firstPage"
        flat
        :dark="dark"
        :disabled="activePage === 1"
        @click="firstPageAction"
      >
        <template #inner-append>
          <span class="pagination__page-first">1</span>
        </template>
      </action>

      <Action
        v-if="showPaginationPrevButton"
        class="pagination__btn pagination__left"
        :text="prevText"
        :type="getButtonLeftType()"
        :url="prevPage"
        :dark="isDark"
        :disabled="activePage === 1"
        :icon="customPrev ? '' : 'keyboard_thin_arrow_left'"
        flat
        @click="prevAction"
      />

      <div
        v-if="showAllPages"
        class="pagination__pages-container"
      >
        <span
          v-for="page of pageCountList"
          :key="`${page.page}-${page.active}`"
          :class="page.page !== actualPage ? 'adjascent-page' : 'active-page'"
          @click="!page.active && goToPage(page.page)"
        >
          {{ page.page }}
        </span>
      </div>

      <div
        v-else
        class="pagination__pages-container"
      >
        <span
          v-show="activePage > 1 && !disableManualPage"
          class="pagination__adjascent-page"
          @click="prevAction"
        >
          {{ activePage - 1 }}
        </span>

        <InputField
          v-model="actualPage"
          class="pagination__input"
          :input-style="blockLayout ? {} : { width: inputFieldWidth + 'px' }"
          :disabled="disableManualPage"
          :value="activePage"
          type="number"
          hide-controls
          hide-details
          small
          @blur="changePage"
          @keyup="changePage"
        />

        <span
          v-show="activePage < pageCount && !disableManualPage"
          class="pagination__adjascent-page"
          @click="nextAction"
        >
          {{ activePage + 1 }}
        </span>
      </div>

      <Action
        v-if="showPaginationNextButton"
        class="pagination__btn pagination__right ml-4"
        :text="nextText"
        :type="getButtonRightType()"
        :url="nextPage"
        :icon="customNext ? '' : 'keyboard_thin_arrow_right'"
        icon-right
        :flat="customNextStyle === 'flat'"
        :secondary="customNextStyle === 'secondary'"
        :primary="customNextStyle === 'primary'"
        :dark="isDark"
        :disabled="(activePage === pageCount && !customNext) || disableCustomNext"
        @click="nextAction"
      />

      <Action
        v-if="activeFirstLast && !$media.mobile"
        class="pagination__btn pagination__right pagination__last"
        :text="$t('global:end')"
        :type="getButtonLastType()"
        :url="lastPage"
        icon="keyboard_thin_arrow_right"
        icon-right
        flat
        :dark="isDark"
        :disabled="activePage === pageCount"
        @click="lastPageAction"
      >
        <template #inner-prepend>
          <span class="pagination__page-last">{{ pageCount }}</span>
        </template>
      </Action>
    </div>
  </div>
</template>

<style lang="scss">
@import 'Pagination.scss';
</style>
