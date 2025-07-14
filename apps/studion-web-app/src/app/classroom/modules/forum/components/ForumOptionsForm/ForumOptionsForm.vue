<script>
import { defineComponent } from 'vue'
import Checkbox from '@/components/general/Checkbox'

export default defineComponent({
  name: 'ForumOptionsForm',

  components: {
    Checkbox,
  },

  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('forum-options-form')"
    :class="{ 'theme-dark': dark }"
    class="forum-options-form"
  >
    <h3 class="text-color">{{ $t('classroom.forum.options:title') }}</h3>
    <p class="mt-2 mb-3 text-color">{{ $t('classroom.forum.options:description') }}</p>
    <div
      class="form-group clearfix"
      data-gap="40"
    >
      <Checkbox
        v-model="value.allowDeletePost"
        :items="[{ value: true, label: $t('classroom.forum.options:allow.delete') }]"
        :dark="dark"
        switch-type
      />
      <Checkbox
        v-model="value.allowEditPost"
        :items="[{ value: true, label: $t('classroom.forum.options:allow.edit') }]"
        :dark="dark"
        switch-type
      />
    </div>
  </div>
</template>
