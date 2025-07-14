<script>
import { mapState, mapActions } from 'vuex'
import config from '@/config'

import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'

const { SHOW_DASHBOARDS_HIGHLIGHT, FORCE_METADATA_FILL } = config

export default {
  name: 'dashboard',
  components: {
    ActionBar,
    ContentHeader,
    TextReduce: () => import('@/components/general/TextReduce'),
    Slideshow: () => import('@/components/general/Slideshow'),
    StudentProgressDashboard: () => import('../../components/StudentProgressDashboard'),
    ClassroomAccessCard: () => import('../../components/ClassroomAccessCard'),
    AdminDashboard: () => import('../../components/AdminDashboard'),
  },
  data() {
    return {
      slideshowItems: [],
      showDashboardHighlight: false,
      dashboardHighlight: {},
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    ...mapState({
      featuredContents: (state) => state.FeaturedContents.list,
    }),
    currentProfile() {
      return this.Account.user.currentProfile
    },
    headerDescription() {
      return this.Account.user.currentProfile === 'admin'
        ? this.$t('dashboard:header.description:admin')
        : this.$t('dashboard:header.description:student')
    },
    isStudentDashboard() {
      return this.isCardsBannersLayout() && this.equalsProfile('student')
    },
    containerWidth() {
      return !this.showDashboardHighlight && this.isStudentDashboard
        ? 'w-12 m-auto px-4 absolute'
        : 'old-center'
    },
    isAdminDashboard() {
      return this.isCardsBannersLayout() && this.notEqualsProfile('student')
    },
  },
  watch: {
    featuredContents: {
      deep: true,
      handler() {
        this.checkBanners()
      },
    },
  },
  async created() {
    this.configureDashboardHighlight()
    this.setFetching(true)
    await this.fetchFeaturedContent()
    this.setFetching(false)
    if (!FORCE_METADATA_FILL) {
      if (this.Account.user.metaStatus === 'new') {
        this.$router.push({ name: 'dashboard.profile.new' })
      } else if (this.Account.user.metaStatus === 'pending') {
        this.$router.push({ name: 'dashboard.profile.pending' })
      }
    }
  },
  beforeDestroy() {
    this.showFooter()
  },
  mounted(){
    this.hideFooter()
  },
  methods: {
    ...mapActions([
      'attemptGetBannersDashboard',
      'getReportsHighlight',
      'fetchFeaturedContent',
      'hideFooter',
      'showFooter',
      'setFetching',
    ]),
    mountSlideshow() {
      let theme = this.$theme
      this.attemptGetBannersDashboard(theme).then((data) => {
        if (data !== undefined) {
          if (data['student'] !== undefined || data['managers'] !== undefined) {
            this.slideshowItems =
              this.Account.user.currentProfile === 'student' ? data['student'] : data['managers']
          } else {
            this.slideshowItems = data
          }
        } else {
          this.slideshowItems =
            this.Account.user.currentProfile === 'student'
              ? data['default']['student']
              : data['default']['managers']
        }
        if (this.slideshowItems.length > 0 && !this.isCardsBannersLayout()) {
          this.slideshowItems = this.slideshowItems.filter((item) => item.type !== 'card')
        }
      })
    },
    checkBanners() {
      if (this.featuredContents.length > 0) {
        this.slideshowItems = this.featuredContents
          .filter((featuredContent) => featuredContent.active)
          .map((featuredContent) => {
            featuredContent.image = featuredContent.file
            return featuredContent
          })

        if (this.slideshowItems.length === 0) {
          this.mountSlideshow()
        }
        return
      }

      this.mountSlideshow()
    },
    configureDashboardHighlight() {
      if (this.equalsProfile('student')) {
        return
      }
      this.setFetching(true)
      if (SHOW_DASHBOARDS_HIGHLIGHT) {
        if (!this.canRead('reports:highlight')) {
          this.setFetching(false)
          return
        }
        this.getReportsHighlight()
          .then((res) => {
            const { data: body } = res
            if (body.data && body.data.length) {
              const report = body.data[0]
              if (report.active) {
                this.hideFooter()
                this.dashboardHighlight = body.data[0]
                this.showDashboardHighlight = true
              }
            }
          })
          .finally(() => this.setFetching(false))
      } else {
        this.setFetching(false)
      }
    },
  },
}
</script>

<template>
  <div class="main-content dashboard bg-black-50">
    <content-header float>
      <action-bar slot="actionbar"></action-bar>
    </content-header>

    <template v-if="showDashboardHighlight && dashboardHighlight.linkedUrl">
      <iframe
        id="iframe-dash"
        class="iframe-dashboard iframe-dashboard-mobile"
        :src="dashboardHighlight.linkedUrl"
        @load="onLoad"
      ></iframe>
    </template>

    <template v-if="!showDashboardHighlight">
      <div :class="[containerWidth]">
        <div class="dashboard-header">
          <TextReduce
            v-if="Account.user.data"
            :lenght-text="40"
            :text="$t('dashboard:header.title', { name: Account.user.data.name })"
            class-style="dashboard-header-title text-color"
          />
          <p class="dashboard-header-description text-color">
            {{ headerDescription }}
          </p>
        </div>

        <template v-if="!isCardsBannersLayout()">
          <slideshow
            v-if="!$media.mobile && slideshowItems.length > 0"
            class="slideshow-list--transparent"
            autoplay
            :items="slideshowItems"
          />

          <classroom-access-card />
        </template>

        <student-progress-dashboard
          v-if="isStudentDashboard"
          :slideshow-items="slideshowItems"
        />

        <admin-dashboard
          v-if="isAdminDashboard"
          :slideshow-items="slideshowItems"
        />
      </div>
    </template>

    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import 'Dashboard.scss';
</style>
