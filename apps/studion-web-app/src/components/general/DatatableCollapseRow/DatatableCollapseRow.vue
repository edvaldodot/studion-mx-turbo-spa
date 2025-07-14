<script>
export default {
  name: 'DatatableCollapseRow',
  props: {
    colspan: {
      type: Number,
      default: 1,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.$on('refresh-transition', this.refresh)
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
    },
    leave(el) {
      el.style.height = 0
      el.style.overflow = 'hidden'
    },
    refresh() {
      this.enter(this.$refs.content)
    },
  },
}
</script>

<template>
  <tr
    class="tr-dropdown"
    :class="{ 'is-open': open }"
  >
    <td
      class="td td-dropdown"
      :colspan="colspan"
    >
      <transition
        appear
        @before-enter="beforeEnter"
        @enter="enter"
        @after-enter="afterEnter"
        @leave="leave"
      >
        <div
          v-if="open"
          ref="content"
          class="tr-dropdown-content h-auto p-2"
        >
          <slot></slot>
        </div>
      </transition>
    </td>
  </tr>
</template>

<style lang="scss">
@import '~../Datatable/Datatable.scss';
</style>
