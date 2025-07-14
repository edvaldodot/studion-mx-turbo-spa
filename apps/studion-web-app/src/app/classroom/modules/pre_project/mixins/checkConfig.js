import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      $currentPreProjectConfig: ({ Classroom }) => Classroom.data && Classroom.data.preProject,
    }),
  },

  created() {
    if (!this.$currentPreProjectConfig) {
      this.$router.push({ name: 'classroom.panel.dashboard' })
      return
    }
  },
}