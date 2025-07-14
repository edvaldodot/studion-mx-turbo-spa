<script>
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'

import GradeCard from '@/app/classroom/components/GradeCard'

export default {
  name: 'LTIView',

  components: {
    Action,
    GradeCard,
  },

  props: {
    resource: {
      type: Object,
      default: () => ({}),
    },

    description: {
      type: String,
      default: '',
    },

    title: {
      type: String,
      default: '',
    },

    isIframe: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      skipEmit: true,
    }
  },

  computed: {
    parseGrade() {
      return this.resource.grade && this.resource.grade.toFixed(2).replace('.', ',')
    },
  },

  created() {
    this.setFetching(true)
  },

  mounted() {
    if (!this.isIframe) {
      return this.setFetching(false)
    }

    try {
      this.$refs.formLTI && this.$refs.formLTI.submit()
      this.skipEmit = false
    } catch (_) {
      this.setFetching(false)
    }
  },

  methods: {
    ...mapActions(['setFetching']),

    handleLoad() {
      if (this.skipEmit) return
      this.setFetching(false)
      this.$emit('consume')
    },
  },
}
</script>

<template>
  <div
    :class="{ 'center-small': !isIframe }"
    class="lti-view"
  >
    <template v-if="!isIframe">
      <div class="lesson__title-wrapper">
        <h3 class="lesson__title">
          {{ title }}
        </h3>
        <GradeCard
          v-if="resource.accomplished"
          :grade-message="
            resource.grade
              ? 'classroom.assessments.evaluation:grade'
              : 'global:solution.status.realizado'
          "
          :grade="parseGrade"
        />
      </div>

      <p class="lesson__description">{{ description }}</p>
    </template>

    <form
      ref="formLTI"
      :target="isIframe ? 'iframeLTI' : '_blank'"
      :action="resource.url"
      method="POST"
      :style="{ display: isIframe ? 'none' : 'block' }"
    >
      <input
        v-for="(value, key) in resource.data"
        :key="key"
        type="hidden"
        :name="key"
        :value="value"
      />

      <Action
        v-if="!isIframe"
        :text="$t('classroom.lessons:external.content')"
        type="button"
        class="external-link"
        flat
        submit
        @click="$emit('consume')"
      />
    </form>

    <iframe
      v-if="isIframe"
      name="iframeLTI"
      allowfullscreen
      class="iframe-view"
      frameborder="0"
      mozallowfullscreen
      webkitallowfullscreen
      allow="autoplay"
      @load="handleLoad"
    ></iframe>
  </div>
</template>

<style lang="scss">
.lti-view {
  height: 100%;
}
.lesson__title-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
}
</style>
