<script>
import TreeItem from '../TreeItem'

export default {
  name: 'Tree',
  components: {
    TreeItem,
  },
  props: {
    branches: {
      type: Array,
      default: () => [],
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    startOpened: {
      type: Array,
      default: () => [],
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<template>
  <div class="tree">
    <div class="tree-header">
      <slot name="header" />
    </div>
    <div class="tree-body">
      <tree-item
        v-for="branch in branches"
        :key="branch.id"
        :start-opened="startOpened"
        :is-root="true"
        :selectable="selectable"
        :branch="branch"
        :dark="dark"
      >
        <template v-slot:row="props">
          <slot
            name="row"
            :branch="props.branch"
            :toggle="props.toggle"
          />
        </template>
      </tree-item>
    </div>
  </div>
</template>

<style lang="scss">
@import './Tree.scss';
</style>
