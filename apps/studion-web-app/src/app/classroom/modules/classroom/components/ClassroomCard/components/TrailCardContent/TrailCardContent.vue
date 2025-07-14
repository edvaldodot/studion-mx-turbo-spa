<script>
import EnrollmentsDatatable from './EnrollmentsDatatable'

export default {
  name: 'TrailCardContent',

  components: {
    EnrollmentsDatatable,
  },

  props: {
    enrollmentsList: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    downloadPreviousCertificate(hash) {
      this.$emit('downloadPreviousCertificate', hash)
    },
  },
}
</script>

<template>
  <div>
    <h4 class="session-card-content__enrollments-title">{{$t('classroom.list:session.previous.enrollments')}}</h4>
    <EnrollmentsDatatable
      :enrollments-list="enrollmentsList"
      @downloadCertificate="downloadPreviousCertificate"
    />
  </div>
</template>

<style lang="scss">
@import "TrailCardContent.scss";
</style>
