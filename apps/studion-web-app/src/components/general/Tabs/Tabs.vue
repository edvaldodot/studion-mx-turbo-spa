<script>
import { kebabCase } from 'lodash'
import NotificationCircle from '../NotificationCircle'
import Icon from '../Icon'

export default {
  name: 'Tabs',
  components: {
    NotificationCircle,
    Icon,
  },
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
    links: {
      type: Array,
      default: () => [],
    },
    indexActive: {
      type: Number,
      default: null,
    },
    showBottomBorder: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isMounted: false,
      scrollPosition: {
        start: true,
        end: false,
      },
      scrollDistance: 0,
      hasScroll: false,
      wrapperScrollWidth: 0,
      wrapperWidth: 0,
    }
  },
  computed: {
    prevNavVisible() {
      return this.hasScroll && !this.$media.mobile && this.scrollDistance > 50
    },
    nextNavVisible() {
      return (
        this.hasScroll &&
        !this.$media.mobile &&
        this.scrollDistance + this.wrapperWidth < this.wrapperScrollWidth - 1
      )
    },
  },
  watch: {
    links: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.setUp()
        })
      },
    },
  },
  mounted() {
    this.isMounted = true
    this.setUp()

    this.hasScroll &&
      this.$nextTick(() => {
        if (this.$refs.tablink) {
          let link = this.$refs.tablink.find((item) => item.$el.className.indexOf('is-active') >= 0)
          if (link) {
            let offset = link.$el.offsetLeft
            this.$refs.tabs.scrollLeft = offset - 20
          }
        }
      })
  },
  methods: {
    getLinkTestId(text) {
      return 'tabs-item--' + kebabCase(text)
    },
    setUp() {
      this.wrapperScrollWidth = this.$refs.tabsWrapper.scrollWidth
      this.wrapperWidth = this.$refs.tabsWrapper.offsetWidth
      this.hasScroll = this.wrapperScrollWidth > this.wrapperWidth
    },
    openTab(index) {
      this.$emit('tabChange', index)
    },
    checkScroll(event, type) {
      event.preventDefault()
      if (type === 'wheel') {
        this.$refs.tabs.scrollLeft = this.$refs.tabs.scrollLeft + event.deltaY
      }
      if (this.$refs.tabs.scrollLeft === 0) {
        this.scrollPosition.start = true
        this.scrollPosition.end = false
      } else if (
        this.$refs.tabs.scrollWidth - this.$refs.tabs.scrollLeft ===
        this.$refs.tabs.offsetWidth
      ) {
        this.scrollPosition.start = false
        this.scrollPosition.end = true
      } else {
        this.scrollPosition.start = false
        this.scrollPosition.end = false
      }
    },
    scrollTabs(direction) {
      if (direction === 'prev' && this.$refs.tabsWrapper.scrollLeft > 0) {
        this.scrollDistance -= 100
      }

      if (
        direction === 'next' &&
        this.scrollDistance + this.$refs.tabsWrapper.offsetWidth <
          this.$refs.tabsWrapper.scrollWidth
      ) {
        this.scrollDistance += 100
      }

      this.$refs.tabsWrapper.scrollLeft = this.scrollDistance
    },
  },
}
</script>

<template>
  <div
    ref="tabs"
    :data-testid="$testId('tabs')"
    class="tabs"
    :class="{
      'theme-dark': dark,
      'has-scroll': hasScroll,
      'scroll-start': hasScroll && scrollPosition.start,
      'scroll-end': hasScroll && scrollPosition.end,
      'has-bottom-border': showBottomBorder,
    }"
    @mousewheel.stop="hasScroll && checkScroll($event, 'wheel')"
    @scroll="hasScroll && checkScroll($event, 'scroll')"
  >
    <span
      v-if="prevNavVisible"
      class="tabs__nav tabs__nav-prev"
      @click="scrollTabs('prev')"
    >
      <Icon
        class="text-2xl"
        pack="material"
        name="chevron_left"
      />
    </span>
    <div
      ref="tabsWrapper"
      class="tabs__wrapper"
    >
      <template v-for="(item, index) in links">
        <template v-if="!item.disabled">
          <router-link
            v-if="item.location"
            ref="tablink"
            :key="item.text + '-router'"
            :data-testid="$testId(getLinkTestId(item.text))"
            :to="item.location"
            :title="$t(item.text)"
            class="tabs__link"
          >
            <span class="tabs__text">{{ $t(item.text) }}</span>
            <NotificationCircle
              v-if="item.notification"
              class="tabs__link-notification"
            />
          </router-link>
          <a
            v-else
            :key="item.text + '-a'"
            :data-testid="$testId(getLinkTestId(item.text))"
            :class="{ 'is-active': index === indexActive }"
            href="#"
            class="tabs__link"
            @click.prevent="openTab(index)"
          >
            <Icon
              pack="material"
              :name="item.icon"
              class="tabs__icon"
            />
            <span class="tabs__text">{{ item.noTranslation ? item.text : $t(item.text) }}</span>
            <NotificationCircle
              v-if="item.notification"
              class="tabs__link-notification"
            />
          </a>
        </template>
      </template>
    </div>
    <span
      v-if="nextNavVisible"
      class="tabs__nav tabs__nav-next"
      @click="scrollTabs('next')"
    >
      <Icon
        class="text-2xl"
        pack="material"
        name="chevron_right"
      />
    </span>
  </div>
</template>

<style lang="scss">
@import 'Tabs.scss';
</style>
