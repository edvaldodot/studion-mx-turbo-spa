<script>
import Button from '../Button'

export default {
  name: 'FilterListTag',
  components: {
    Button,
  },

  props: {
    initialValue: {
      type: Object,
      default: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
    state: {
      type: String,
      default: null,
    },
    update: {
      type: Boolean,
      default: false,
    },
    tagAllFiltersActive: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      filters: [],
      tagListOpen: false,
      quantityFiltersActivated: 0,
    }
  },

  computed: {
    isTagActive() {
      return this.tagAllFiltersActive
    },
    hasSelection() {
      return this.filters.length > 0 || this.quantityFiltersActivated
    },
    items() {
      const state = this.$store.state[this.state]
      return (state && (state.search || state.items)) || []
    },
    buttonVariant() {
      return this.$media.mobile ? 'icon' : 'default'
    },
    buttonLabel() {
      return this.quantityFiltersActivated > 0
        ? this.quantityFiltersActivated +
            ' ' +
            this.$t(
              `global:search.active.filters.${
                this.quantityFiltersActivated > 1 ? 'multi' : 'single'
              }`
            )
        : this.$t('global:form.filter')
    },
  },
  watch: {
    update() {
      this.update && this.hasSelection && this.applyFilter()
      this.$emit('update:update', false)
    },
  },

  created() {
    if (this.initialValue) this.setupInitialValue()
  },

  mounted() {
    this.setQuantityFiltersActivated()
  },

  methods: {
    setQuantityFiltersActivated() {
      let quantityFilters = this.options.map(function (opt) {
        return !opt.items ? 0 : opt.items.filter((item) => item.active).length
      })
      quantityFilters =
        quantityFilters.length > 1 ? quantityFilters.reduce((a, b) => a + b) : quantityFilters[0]
      this.quantityFiltersActivated = quantityFilters
      this.$emit('update-filtering', this.quantityFiltersActivated > 0)
    },
    openTagList() {
      this.tagListOpen = !this.tagListOpen
    },
    closeTagList() {
      this.tagListOpen = false
    },
    removeFilter(item) {
      item.active = false
      this.filters = this.filters.filter((obj) => obj.id !== item.id)
      this.$emit('update-filters', this.filters)
      this.applyFilter()
    },
    toggleFilter(item) {
      item.active = !item.active
      if (item.active) {
        this.filters.push({ id: item.id, property: item.property, value: item.value })
      } else {
        this.filters = this.filters.filter((obj) => obj.id !== item.id)
      }
      this.$emit('update-filters', this.filters)
      this.applyFilter()
    },
    applyFilter() {
      if (this.filters.length === 0) {
        this.items.map((item) => {
          item.visible = true
        })
      } else {
        this.items.map((item) => {
          item.visible = false
          this.filters.map((filter) => {
            if (item[filter.property] === filter.value) {
              item.visible = true
            }
          })
        })
      }
      this.setQuantityFiltersActivated()
    },
    setupInitialValue() {
      Object.keys(this.initialValue).forEach((property) => {
        const filterOpt = this.options.findIndex((option) => option.name === property)
        if (filterOpt < 0) return

        const activeFilters = this.initialValue[property].map((tag) => {
          this.options[filterOpt].items.find((option) => option.id === tag).active = true
          return { id: tag, property }
        })

        this.filters.push(activeFilters)
      })
      this.setQuantityFiltersActivated()
    },
  },
}
</script>

<template>
  <div
    v-click-outside="closeTagList"
    class="filter-list-tag"
    :class="{ 'has-selection': quantityFiltersActivated > 0 }"
  >
    <div
      class="filter-list-tag__active"
      @click="openTagList"
    >
      <Button
        :variant="buttonVariant"
        :class="[
          'filter-list-tag__label',
          {
            'bg-primary text-white': quantityFiltersActivated,
          },
        ]"
        inner-prepend-icon="tune"
        icon="tune"
      >
        {{ buttonLabel }}
      </Button>
    </div>
    <!-- open -->
    <div
      v-if="tagListOpen"
      class="filter-list-tag__list"
    >
      <div class="filter-list-tag__description">{{ $t('global:filter.tag.description') }}</div>
      <div class="filter-list-tag__container">
        <div
          v-for="(option, optionIndex) in options"
          :key="`option-${optionIndex}`"
          class="filter-list-tag__item"
        >
          <span class="filter-list-tag__item-title">{{ option.title }}</span>
          <div class="filter-list-tag__list-link">
            <a
              v-for="(item, index) in option.items"
              :key="`option-${index}`"
              :class="{ 'is-active': item.active }"
              class="filter-list-tag__link"
              href="#"
              @click.prevent="toggleFilter(item)"
            >
              {{ item.text }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'FilterListTag.scss';
</style>
