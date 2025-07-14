<template>
  <div class="current-branch-selectable" :class="{'has-children': isParent, 'is-root': isRoot, '--dark': dark}">
    <div>
      <checkbox-item
        :checked="branch.id === selectedId"
        @change="select($event)"
        roundType
        :label="branch.name"
      />
    </div>
    <div class="current-branch-selectable__item toggle" :class="{'--not-closeable': !closeable}" @click="toggle">
      <action
        v-if="isParent"
        type="button"
        :disabled="!isParent"
        :icon="isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
      />
    </div>
  </div>
</template>

<script>
import Action from '@/components/general/Action'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import CheckboxItem from '@/components/general/CheckboxItem'

export default {
  name: 'BranchTreeItem',
  components: {
    Action,
    CheckboxItem,
    Dropdown,
    DropdownLink
  },
  props: {
    branch: {
      type: Object
    },
    selectedId: {
      type: Number,
      default: () => null
    },
    isRoot: {
      type: Boolean,
      default: false
    },
    startOpened: {
      type: Array,
      default: () => []
    },
    dark: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isOpen: false,
      valor: null
    }
  },
  watch: {
    selectedId (newVal) {
      if (newVal !== this.branch.id) {
        this.valor = null
      }
    }
  },
  computed: {
    isParent () {
      return this.branch.children && this.branch.children.length
    },
    closeable () {
      if (!this.selectedId) return true
      return !this.$store.getters.getBranchById(this.selectedId, 'id').breadcrumbs.includes(this.branch.id) || (this.branch.id === this.selectedId)
    }
  },
  mounted () {
    if (this.startOpened.includes(this.branch.id)) {
      this.isOpen = true
      this.$emit('toggle', this.isOpen)
    }
  },
  methods: {
    create (parentId) {
      this.$emit('create', parentId)
    },
    remove (branchId) {
      this.$emit('remove', branchId)
    },
    edit (branchId) {
      this.$emit('edit', branchId)
    },
    toggle () {
      if (!this.closeable) return
      if (!this.isParent) return
      this.isOpen = !this.isOpen
      this.$emit('toggle', this.isOpen)
    },
    select (event) {
      this.$emit('checked', this.branch.id)
    }
  }
}
</script>

<style lang="scss">
  @import "TreeCheckboxItem.scss";
</style>
