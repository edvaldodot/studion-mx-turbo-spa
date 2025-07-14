<script>
import { defineComponent } from 'vue'

import EmptyMessage from '@/components/general/EmptyMessage'

export default defineComponent({
  name: 'EmptySearchFeedback',

  components: {
    EmptyMessage,
  },

  props: {
    noItems: {
      type: Boolean,
      default: false,
    },

    isSearching: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div>
    <!-- Search -->
    <EmptyMessage v-if="noItems && isSearching">
      <slot name="emptySearch">
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </slot>
    </EmptyMessage>

    <!-- Default -->
    <EmptyMessage v-else-if="noItems">
      <slot name="emptyList">
        <h2>{{ $t('global:search.empty.title') }}</h2>
      </slot>
    </EmptyMessage>
  </div>
</template>