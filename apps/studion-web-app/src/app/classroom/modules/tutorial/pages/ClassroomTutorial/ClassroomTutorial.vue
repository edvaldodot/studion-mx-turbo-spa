<script>
import Action from '@/components/general/Action'

export default {
  name: 'ClassroomTutorial',

  components: {
    Action,
  },

  created() {
    this.$emit('change-header', {})
  },

  methods: {
    startTutorial() {
      this.$emit('start-tutorial')
    },
  },
}
</script>
<template>
  <div class="classroom-tutorial text-center">
    <h1 class="mt-8">{{ $t('classroom.tutorial:title') }}</h1>
    <img
      src="/assets/images/png/icon-modal-tutorial.png"
      :alt="$t('global:menu.classroom.tutorial')"
    />
    <p class="my-4">
      {{ $t('classroom.tutorial:description') }}
    </p>
    <Action
      :text="$t('classroom.tutorial:start')"
      type="button"
      primary
      large
      @click="startTutorial"
    />
  </div>
</template>

<style lang="scss">
.classroom-tutorial {
  img {
    width: 266px;
    height: 266px;
    padding: 16px 0;
  }

  h1,
  p {
    max-width: 600px;
    padding: 0 2em;
    margin: 0 auto;
  }
}
</style>
