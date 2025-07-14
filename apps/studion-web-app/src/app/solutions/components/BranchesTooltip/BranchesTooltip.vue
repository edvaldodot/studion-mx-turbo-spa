<template>
  <tooltip :uppercase="false" align="right" arrow shadow>
    <template v-slot:activator="{ on }">
      <span
        @mouseenter="on.mouseenter"
        @mouseleave="on.mouseleave"
        class="td-text"
      >
        {{ getBranchesText() }}
      </span>
    </template>

    <span>{{ getBranchesText(false) }}</span>
  </tooltip>
</template>

<script>
import Tooltip from '@/components/general/Tooltip'
export default {
  name: 'BranchesTooltip',
  components: {
    Tooltip
  },
  props: {
    branches: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    /**
     * convert the list of branches to a string
     * if short is true, only show the first 2 branches
     * and the number of remaining branches else show all branches
     * @param {boolean} short
     */
    getBranchesText (short = true) {
      if (!this.branches) return ''
      if (!short) return this.branches.map(branch => branch.name).join(', ')
      let text = ''
      text = this.branches.slice(0, 2).map(branch => branch.name).join(', ')
      if (this.branches.length > 2) text += `, +${this.branches.length - 2}`
      return text
    }
  }
}
</script>
