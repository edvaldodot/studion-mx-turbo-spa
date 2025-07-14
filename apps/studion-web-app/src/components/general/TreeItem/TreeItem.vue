<script>
export default {
  name: 'TreeItem',
  components: {},
  props: {
    branch: {
      type: Object,
    },
    isRoot: {
      type: Boolean,
      default: false,
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
  data() {
    return {
      isOpen: false,
    }
  },
  computed: {
    isParent: function () {
      return this.branch.children && this.branch.children.length
    },
  },
  mounted() {
    if (this.startOpened.includes(this.branch.id)) {
      this.isOpen = true
    }
  },
  methods: {
    beforeEnter(el) {
      el.style.height = 0
      el.style.overflow = 'hidden'
    },
    enter(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    afterEnter(el) {
      el.style.overflow = ''
      el.style.height = 'auto'
    },
    beforeLeave(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    leave(el) {
      this.$forceNextTick(() => {
        el.style.height = 0
      })
      el.style.overflow = 'hidden'
    },
    toggle(value) {
      this.isOpen = value
    },
    getZIndex(index) {
      return this.branch.children.length - index
    },
  },
}
</script>

<template>
  <div
    class="tree-item"
    :class="{ '--open': isOpen, 'is-root': isRoot, 'is-selectable': selectable, '--dark': dark }"
  >
    <div class="tree-item__current">
      <slot
        name="row"
        :branch="branch"
        :toggle="toggle"
        :is-open="isOpen"
      />
    </div>
    <div
      v-if="isParent"
      class="tree-item__childrens"
    >
      <transition
        :duration="{ enter: 400, leave: 400 }"
        @before-enter="beforeEnter"
        @enter="enter"
        @after-enter="afterEnter"
        @before-leave="beforeLeave"
        @leave="leave"
      >
        <div
          v-if="isParent && isOpen"
          ref="content"
          class="tree-item__content"
        >
          <tree-item
            v-for="(child, index) in branch.children"
            :key="child.id"
            :branch="child"
            :start-opened="startOpened"
            :selectable="selectable"
            :style="{ zIndex: getZIndex(index) }"
            @create="$emit('create', $event)"
            @edit="$emit('edit', $event)"
            @remove="$emit('remove', $event)"
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
      </transition>
    </div>
  </div>
</template>

<style lang="scss">
@import './TreeItem.scss';
</style>
