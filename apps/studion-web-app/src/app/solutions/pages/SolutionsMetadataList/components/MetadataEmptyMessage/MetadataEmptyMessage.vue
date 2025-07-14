<script>
import EmptyMessage from '@/components/general/EmptyMessage'

export default {
  name: 'MetadataEmptyMessage',

  components: {
    EmptyMessage
  },

  props: {
    isFiltering: {
      type: Boolean,
      required: true
    },

    isSearching: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<template>
  <div>
    <empty-message v-if="!isFiltering && !isSearching">
      <h2>{{ $t("community.metadata:empty.title") }}</h2>
      <p class="text-color">{{ $t("community.metadata:empty.message") }}</p>
    </empty-message>

    <empty-message v-if="isFiltering && !isSearching">
      <h2>{{ $t("solutions.list:filter.empty.title") }}</h2>
    </empty-message>

    <empty-message v-if="!isFiltering && isSearching">
      <h2>{{ $t("global:search.empty.title") }}</h2>
      <p class="text-color">{{ $t("global:search.empty.message") }}</p>
    </empty-message>
  </div>
</template>
