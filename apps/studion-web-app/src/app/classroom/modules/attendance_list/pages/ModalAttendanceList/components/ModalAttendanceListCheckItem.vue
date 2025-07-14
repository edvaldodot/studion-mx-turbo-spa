<script>
import { defineComponent } from 'vue'
import CheckboxItem from '@/components/general/CheckboxItem'

export default defineComponent({
  name: 'ModalAttendanceListCheckItem',

  components: {
    CheckboxItem,
  },

  props: {
    item: {
      type: Object,
      required: true,
    },
    selectedItems: {
      type: Array,
      required: true,
    },
    selectItem: {
      type: Function,
      required: true,
    },
  },

  computed: {
    filtered() {
      return this.selectedItems.filter((i) => i.id === this.item.id)
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('modal-attendance-list-check-item')">
    <template v-if="selectedItems.length">
      <template v-for="selectedItem in filtered">
        <CheckboxItem
          v-if="selectedItem.id === item.id"
          :key="selectedItem.id"
          :checked="true"
          dark
          @change="(event) => selectItem(event, item)"
        />
      </template>

      <CheckboxItem
        v-if="!filtered.length"
        dark
        @change="(event) => selectItem(event, item)"
      />
    </template>

    <CheckboxItem
      v-else
      dark
      @change="(event) => selectItem(event, item)"
    />
  </div>
</template>
