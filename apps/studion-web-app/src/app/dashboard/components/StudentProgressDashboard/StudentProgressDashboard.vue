<script>
import { defineComponent } from 'vue'
import { mapActions, mapState, mapGetters } from 'vuex'

import configControlViewMixin from '@/mixins/configControlView'

import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tabs from '@/components/general/Tabs'

import VerticalBannersCarousel from '../VerticalBannersCarousel'
import HorizontalBannersCarousel from '../HorizontalBannersCarousel'
import DashboardConferences from '../DashboardConferences'

import DashboardCard from './components/DashboardCard'
import DashboardNews from './components/DashboardNews'

import Carousel from '@/components/general/Carousel'

export default defineComponent({
  name: 'StudentProgressDashboard',

  components: {
    Card,
    CardBody,
    DashboardConferences,
    DashboardCard,
    DashboardNews,
    EmptyMessage,
    Tabs,
    VerticalBannersCarousel,
    HorizontalBannersCarousel,
    Carousel,
  },

  mixins: [configControlViewMixin],

  props: {
    slideshowItems: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      activeTab: 0,
      page: 0,
      tabs: [],
      tabsProgress: [
        { id: 0, text: 'global:solutions', value: 'sessions' },
        { id: 1, text: 'global:offerings', value: 'offerings' },
        { id: 2, text: 'global:trail', value: 'trails' },
      ],
      windowX: null,
      hideKeepDoing: true,
      resourceProgress: [],
      activeTabProgress: 0,
      statusName: '',
      resizeTimeout: null, // Novo: para controlar o debounce
    }
  },

  computed: {
    ...mapGetters(['getEnabledResources', 'hasNewsContent', 'isFetching']),

    ...mapState({
      accessibility: (state) => state.accessibility,
      orderResources: (state) => state.Account.user.order_educational_resources,
      currentProfile: (state) => state.Account.user.currentProfile,
      featuredCategories: (state) => state.Dashboard.featuredCategories,
      overallProgressStatus: (state) => state.Dashboard.overallProgressStatus,
      overallProgressContent: (state) => state.Dashboard.overallProgressContent,
    }),

    canShowNews() {
      return this.orderResources.find((resource) => resource.menu === 'Ofertas').enabled
    },

    filteredTabsProgress() {
      const enabledResources = this.getEnabledResources

      return this.tabsProgress.filter((tab) => enabledResources.includes(tab.value))
    },
  },

  watch: {
    featuredCategories: {
      deep: true,
      immediate: true,
      handler(categories) {
        this.tabs = [
          { id: -1, text: 'global:all' },
          ...categories.map(({ category }) => ({
            id: category.id,
            text: category.name,
            noTranslation: true,
          })),
        ]
      },
    },
    resourceProgress(newResource) {
      if (newResource.length > 0) {
        this.fetchProgressStatus()
      }
    },
  },

  created() {
    this.setResizeListener()
    this.fetchFeaturedCategories()
    this.fetchInProgressContent().then(() => {
      this.hideKeepDoing = this.activeTab === 0 && this.overallProgressContent.length === 0
    })
    this.resourceProgress = [this.filteredTabsProgress[0].value]
    this.fetchProgressStatus()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    ...mapActions([
      'fetchFeaturedCategories',
      'fetchOverallProgressContent',
      'fetchOverallProgressStatus',
    ]),
    handleTabChange(tabIndex) {
      this.activeTab = tabIndex
      this.fetchInProgressContent()
    },

    getEnabledResources2() {
      // Método que retorna os recursos habilitados; aqui está apenas um exemplo de como isso poderia ser implementado
      return ['sessions', 'trails'] // Exemplo estático para demonstração; substitua pela lógica real
    },

    handleTabChange2(tabIndex) {
      this.activeTabProgress = tabIndex
      const selectedTab = this.filteredTabsProgress[tabIndex]
      this.resourceProgress = [selectedTab.value]
    },

    fetchProgressStatus() {
      this.fetchOverallProgressStatus({
        resources: this.resourceProgress,
      })
    },

    fetchInProgressContent() {
      const tab = this.tabs[this.activeTab]
      const categoryId = tab.id !== -1 ? tab.id : null
      const resources = (this.getEnabledResources || []).filter(Boolean)

      return this.fetchOverallProgressContent({
        isStudent: this.equalsProfile('student'),
        categoryId,
        resources,
      }).then(() => {
        this.page = [0, false]
      })
    },
    toClassroom(statusName) {
      const resource = this.resourceProgress[0]

      let route = `classroom.${resource}`

      this.$router.push({
        name: route,
        params: { tab: statusName },
      })
    },
    handleResize() {
      clearTimeout(this.resizeTimeout)

      this.resizeTimeout = setTimeout(() => {
        if (this.$refs.overallProgressContent) {
          this.$refs.overallProgressContent.computeCarouselWidth()
        }
      }, 150)
    },
    setResizeListener() {
      window.addEventListener('resize', this.handleResize)
    },
    setWindowX() {
      this.windowX = window.innerWidth
    },
  },
})
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="dashboard-layout">
    <template v-if="config_showBannersContainer">
      <HorizontalBannersCarousel
        v-if="windowX > 575 && windowX < 1321"
        :banners="slideshowItems"
        autoplay
      />

      <div
        v-else
        class="banners-container"
      >
        <VerticalBannersCarousel
          :banners="slideshowItems"
          autoplay
        />
      </div>
    </template>

    <template v-if="!hideKeepDoing">
      <div class="featured-content-container">
        <div class="featured-content">
          <h3 v-html="$t('dashboard:tabs.inprogress')"></h3>

          <Tabs
            :class="{ 'has-featured-categories': featuredCategories.length }"
            :links="tabs"
            :index-active="activeTab"
            show-bottom-border
            @tabChange="handleTabChange"
          />

          <Carousel
            v-if="overallProgressContent.length"
            ref="overallProgressContent"
            :navigate-to="page"
            :scroll-per-page="false"
            :per-page="1"
            :pagination-enabled="false"
            :speed="400"
            :mouse-drag="$media.mobile"
            :items="overallProgressContent"
            :page-info="false"
            @pageChange="page = $event"
          >
            <template #default="{ item }">
              <DashboardCard
                :item="item"
                :card-type="item.type"
              />
            </template>
          </Carousel>

          <EmptyMessage v-else>
            <h2>{{ $t('dashboard:empty.category.title') }}</h2>
            <p class="text-color">{{ $t('dashboard:empty.category.description') }}</p>
          </EmptyMessage>
        </div>
      </div>

      <div class="additional-boxes">
        <div class="overall-progress">
          <div class="overall-progress__header">
            <h3 v-html="$t('dashboard:overallProgressStatus.title')"></h3>
            <Tabs
              :links="filteredTabsProgress"
              :index-active="activeTabProgress"
              show-bottom-border
              @tabChange="handleTabChange2"
            />
          </div>

          <div class="overall-progress__cards">
            <Card
              v-for="status in overallProgressStatus"
              :key="status.name"
              rounded
              :class="[
                'overall-progress__card text-white',
                { 'bg-yellow-400': status.name === 'pending' },
                { 'bg-orange-400': status.name === 'initial' },
                { 'bg-green-400': status.name === 'final' },
              ]"
              @click.native="toClassroom(status.name)"
            >
              <CardBody>
                <strong>{{ status.total }}</strong>
                <p
                  v-html="
                    $tc(
                      `dashboard:overallProgressStatus.${status.name}.${resourceProgress[0]}`,
                      status.total === 0 || status.total > 1 ? 2 : 1
                    )
                  "
                ></p>
              </CardBody>
            </Card>
          </div>
        </div>

        <DashboardConferences />
      </div>
    </template>

    <DashboardNews v-if="canShowNews" />

    <template v-if="!isFetching && !hasNewsContent && hideKeepDoing">
      <div class="dashboard-news empty">
        <h2 class="empty__title">
          {{ $t('dashboard:empty.message.title') }}
        </h2>

        <p class="empty__subtitle">
          {{ $t('dashboard:empty.message.subtitle') }}
        </p>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
@import 'StudentProgressDashboard.scss';
</style>
