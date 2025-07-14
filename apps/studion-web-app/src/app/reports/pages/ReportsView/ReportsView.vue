<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import { getPowerBiData } from '../../util'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'

export default defineComponent({
  name: 'ReportsView',

  components: {
    ActionBar,
    ContentHeader,
  },

  data() {
    return {
      backUrl: { name: 'reports.list' },
      linkedUrl: null,
      powerbiReady: false,
    }
  },

  computed: {
    ...mapState(['accessibility', 'reports', 'fullscreen']),
    background() {
      return this.reports.current.imagePath
        ? this.reports.current.imagePath
        : '/assets/images/themes/default/bkg/report-default-big.jpg'
    },
    reportId() {
      return this.$route.params.id
    },
  },

  created() {
    this.setFetching(true)
    Promise.all([
      this.attemptReportLinkedURLRetrieval(this.reportId),
      this.attemptReportRetrieval(this.reportId),
    ])
      .then(([resLinkedURL, reportConfig]) => {
        if (resLinkedURL.data.vendor === 'powerbi') {
          this.startPowerBi(resLinkedURL.data, reportConfig.data)
        } else {
          const { linkedUrl } = resLinkedURL.data.dashboard
          this.linkedUrl = linkedUrl
        }
      })
      .catch((error) => {
        const response = error.response
        if (response.data && response.data.message === 'profile_not_permitted') {
          this.setFeedback({
            message: this.$t(`reports:feedback.view.error:profile.not.permitted`),
          })
        }
        this.$router.push(this.backUrl)
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  destroyed() {
    this.clearCurrentReport()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptReportRetrieval',
      'clearCurrentReport',
      'attemptReportLinkedURLRetrieval',
    ]),

    /**
     * Receives report request data and sets up powerbi embed
     * element
     * @param {Object} data
     */
    startPowerBi(data, config) {
      const { powerbi, models } = getPowerBiData()
      const { paginated_report, open_on_edit_mode } = config.vendorMeta

      const isOpenOnEditMode = parseInt(open_on_edit_mode) === 1
      const isPaginatedReport = parseInt(paginated_report) === 1

      if (!isPaginatedReport) {
        powerbi.bootstrap(this.$refs.reportElement, { type: 'report' })
      }

      const reportLoadConfig = {
        type: 'report',
        tokenType: models.TokenType.Embed,
        accessToken: data.dashboard.embedToken.token,
        embedUrl: data.dashboard.embedUrl,
        settings: {
          panes: {
            pageNavigation: {
              visible: isOpenOnEditMode,
            },
          },
        },
      }

      if (isOpenOnEditMode) {
        reportLoadConfig.permissions = models.Permissions.ReadWrite
      }

      if (isPaginatedReport) {
        reportLoadConfig.permissions = models.Permissions.View
      }

      const report = powerbi.embed(this.$refs.reportElement, reportLoadConfig)

      report.on('rendered', () => {
        if (isOpenOnEditMode) {
          report.off('rendered')
          report.switchMode('edit')
        }
      })

      this.powerbiReady = true
    },
  },
})
</script>

<template>
  <div
    v-if="reports.current"
    :data-testid="$testId('reports-view')"
    class="main-content  reports-view"
  >
    <ContentHeader
      :title="reports.current.title"
      :description="reports.current.description"
      :background="background"
      :back-url="backUrl"
      back
      fullscreen
      retract
      :thick="fullscreen"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <iframe
      v-if="linkedUrl"
      :src="linkedUrl"
      frameborder="0"
      class="reports-iframe"
    ></iframe>

    <div
      v-show="powerbiReady"
      ref="reportElement"
      class="reports-iframe reports-iframe__pbi"
    ></div>
  </div>
</template>

<style lang="scss">
@import '~@/app/reports/styles.scss';
</style>
