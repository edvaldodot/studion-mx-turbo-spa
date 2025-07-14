<script>
import Chip from '../Chip'

export default {
  name: 'CategoriesChips',
  components: {
    Chip,
  },
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
    color: {
      type: String,
      default: 'default',
    },
  },
  data() {
    return {
      visibleCategories: [],
      hiddenCategories: [],
      showHiddenCategories: false,
    }
  },
  watch: {
    categories: {
      deep: true,
      handler(value) {
        this.visibleCategories = value
        if (value.length < 2) this.hiddenCategories = []
        this.$nextTick(() => {
          this.calculateCategoriesWidth()
        })
      },
    },
  },
  mounted() {
    this.visibleCategories = this.categories
    this.$nextTick(() => {
      this.calculateCategoriesWidth()
    })
  },
  methods: {
    calculateCategoriesWidth() {
      if (!this.$refs.categories) return
      const wrapperWidth = this.$refs.categories.clientWidth - 60
      const $categories = Array.from(this.$refs.categories.children)

      let stopIndex = -1
      let widthSum = 0

      $categories.forEach(($category, index) => {
        widthSum += $category.offsetWidth
        if (widthSum >= wrapperWidth) {
          if (stopIndex !== -1) return
          stopIndex = index
        }
      })

      if (stopIndex !== -1) {
        this.visibleCategories = this.categories.slice(0, stopIndex)
        this.hiddenCategories = this.categories.slice(stopIndex)
        return
      }

      this.visibleCategories = this.categories

      this.$forceUpdate()
    },
  },
}
</script>

<template>
  <div class="wrapper-card__categories">
    <div
      ref="categories"
      class="card-categories visible-categories"
    >
      <chip
        v-for="category in visibleCategories"
        :key="category.id"
        :text="category.name"
        :color="color"
        small
      />
      <chip
        v-if="hiddenCategories.length > 0"
        :text="`+${hiddenCategories.length}`"
        strong
        inverted
        :color="color"
        hoverable
        small
        @click.native.stop="showHiddenCategories = !showHiddenCategories"
      />
    </div>
    <div
      class="card-categories hidden-categories"
      v-show="showHiddenCategories"
    >
      <chip
        v-for="category in hiddenCategories"
        :key="category.id"
        :text="category.name"
        :color="color"
        small
      />
    </div>
  </div>
</template>

<style lang="scss">
@import 'CategoriesChips.scss';
</style>
