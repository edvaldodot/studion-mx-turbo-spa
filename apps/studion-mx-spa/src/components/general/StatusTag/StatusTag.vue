<script setup lang="ts">
import { computed } from 'vue'
import { useStatusTag } from '@/composables/useStatusTag'

const props = defineProps<{
  status: string | boolean
}>()

const { getStatusClass, getStatusText } = useStatusTag()

const statusClass = computed(() => getStatusClass(props.status))
const statusText = computed(() => getStatusText(props.status, true))
</script>

<template>
  <span :class="['status-tag', 'td-tag', statusClass]">
    {{ statusText }}
  </span>
</template>

<style>
.status-tag {
  border-radius: 40px;
  font-size: 14px;
  width: max-content;
  padding: 8px 16px;
}

.status-tag.draft,
.status-tag.inactive {
  color: var(--black-700);
  background-color: var(--black-200);
}

.status-tag.published,
.status-tag.active {
  color: var(--surface-0);
  background-color: var(--primary-900);
}
</style>
