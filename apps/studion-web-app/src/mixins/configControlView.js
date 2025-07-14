import config from '@/config'

const {
  HIDE_VIEW_WORKLOAD,
  HIDE_VIEW_DURATION,
  HIDE_VIEW_BANNERS_CONTAINER,
  HIDE_VIEW_SOLUTION_DURATION_ON_TRAILS,
} = config

export default {
  computed: {
    config_showWorkload() {
      return !HIDE_VIEW_WORKLOAD
    },
    config_showDuration() {
      return !HIDE_VIEW_DURATION
    },
    config_show_session_duration_on_trails() {
      return !HIDE_VIEW_SOLUTION_DURATION_ON_TRAILS
    },
    config_showBannersContainer() {
      return !HIDE_VIEW_BANNERS_CONTAINER
    },
  },
}
