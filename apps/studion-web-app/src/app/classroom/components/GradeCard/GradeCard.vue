<script>
export default {
  name: 'GradeCard',
  props: {
    gradeMessage: {
      type: String,
      default: 'classroom.assessments.evaluation:grade',
    },
    grade: {
      type: String,
      default: '',
    },
  },
}
</script>
<template>
  <div class="grade-card--container">
    <span>{{ $t(gradeMessage) }}</span>
    <h4>{{ grade }}</h4>
  </div>
</template>
<style lang="scss">
@import './GradeCard.scss';
</style>
