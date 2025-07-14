<script>
export default {
  name: 'Datatable',
  props: {
    items: {
      type: Array,
      default() {
        return []
      },
    },
    title: {
      type: String,
      default: null,
    },
    card: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    itemIdentifier: {
      type: String,
      default: 'id',
    },
    light: {
      type: Boolean,
      default: false,
    },
    noMarginTop: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getAlign(value) {
      return value ? 'text-' + value : 'text-left'
    },
    getSize(value) {
      return value !== undefined ? 'width:' + value + 'px' : ''
    },
  },
}
</script>

<template>
  <div
    class="dttable"
    :class="{ 'theme-dark': dark, 'theme-light': light, 'datatable-wrapper-card': card }"
  >
    <span
      v-if="title"
      class="dttable__title"
      >{{ title }}</span
    >
    <div class="dttable__inner">
      <table :class="{ 'my-0': noMarginTop }">
        <thead v-if="$slots.thead">
          <slot name="thead" />
        </thead>
        <tbody>
          <template v-for="(item, index) in items">
            <slot
              name="tbody"
              :item="item"
              :index="index"
            />
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss">
@import 'Datatable.scss';
</style>
