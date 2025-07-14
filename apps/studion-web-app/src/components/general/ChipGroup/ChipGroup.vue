<script>
import { Chip } from '@/components/general'

export default {
  name: 'ChipGroup',
  components: {
    Chip,
  },
  props: {
    chipKey: {
      type: String,
      default: () => '',
    },
    chips: {
      type: Array,
      default: () => [],
    },
    showChips: {
      type: Number,
      default: () => 2,
    },
    showAll: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    chipsList() {
      if (this.chipKey) {
        return this.chipsListToObjectsArray
      }

      return this.chipsListToArray
    },
    chipsListSliced() {
      if (this.showAll) {
        return this.chipsList.slice(0, this.chipsList.length)
      }

      return this.chipsList.slice(0, this.showChips)
    },
    chipsListToObjectsArray() {
      return this.chips.map((chip) => chip[this.chipKey])
    },
    chipsListToArray() {
      return this.chips.map((chip) => chip)
    },
    moreChips() {
      return Math.abs(this.chipsList.length - this.showChips)
    },
    isShowAll() {
      return this.showAll
    },
  },
}
</script>
<template>
  <div class="chip-group">
    <Chip
      v-for="(chip, index) in chipsListSliced"
      :key="index"
      color="success"
    >
      {{ chip }}
    </Chip>
    <Chip
      v-if="chipsList.length && !isShowAll"
      color="success"
    >
      + {{ moreChips }}
    </Chip>
  </div>
</template>
<style lang="scss">
@import 'ChipGroup.scss';
</style>
