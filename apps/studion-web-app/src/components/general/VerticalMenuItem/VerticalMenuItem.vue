<script>
import { mapState, mapActions } from 'vuex'
import Icon from '../Icon'
import Tooltip from '../Tooltip'
import NotificationCircle from '../NotificationCircle'

export default {
  name: 'VerticalMenuItem',

  components: {
    Icon,
    Tooltip,
    NotificationCircle,
  },

  props: {
    text: {
      type: String,
      default: '',
    },
    link: {
      type: [String, Object],
      default: '#',
    },
    icon: {
      type: String,
      default: '',
    },
    highlight: {
      type: Boolean,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    notification: {
      type: Boolean,
      default: false,
    },
    submenu: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: null,
    },
    exact: {
      type: Boolean,
      default: false,
    },
    callback: {
      default: null,
    },
    showIconTooltip: {
      type: Boolean,
      default: false,
    },
    iconClick: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      isActive: false,
      height: 0,
    }
  },

  computed: {
    ...mapState(['Account']),
    isSameRoute() {
      return this.$route.name === this.link.name || this.$route.meta.parent === this.link.name
    },
    isActiveParent() {
      const { href } = this.$router.resolve({
        name: this.link.name,
      })
      return this.$route.path.indexOf(href) === 0
    },
  },

  watch: {
    iconClick() {
      if (this.iconClick && this.isActive) {
        this.isActive = false
        this.$refs.submenuList.style.height = 0
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      if (this.submenu) {
        this.height = this.$refs.submenuList.clientHeight
        this.$refs.submenuList.style.height = 0
      }
    })
  },

  methods: {
    ...mapActions([
      'attemptValidateExit',
      'setActiveFacialRecognition',
      'setFacialRecognitionNext',
      'setFetching',
    ]),

    openSubmenu() {
      this.isActive = !this.isActive
      this.$refs.submenuList.style.height = this.isActive ? this.height + 'px' : 0
    },
    executeCallback() {
      if (this.callback) {
        this.callback()
      }
    },
    next() {
      this.$router.push(this.link)
      this.executeCallback()
    },

    /**
     * Redirects the user based on certain conditions.
     *
     * @return {void}
     */
    redirect() {
      if (
        !this.$isEnabledFeature('biometrics') ||
        !this.isUserInClassroom ||
        !this.equalsProfile('student') ||
        this.name !== 'exit'
      ) {
        this.next()
        return
      }

      this.validateBiometrics()
    },

    /**
     * Validates biometrics and performs the necessary actions based on the result.
     *
     * @return {void} A promise that resolves when the validation is complete.
     */
    validateBiometrics() {
      this.setFetching(true)

      this.attemptValidateExit({
        uuid: this.$route.params.session_uuid,
        configType: 'exit_classroom',
      })
        .then(({ data: allowExit }) => {
          if (allowExit) return this.next()
        })
        .catch(() => {
          this.setFacialRecognitionNext(this.link)
          return this.setActiveFacialRecognition(true)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <li
    v-if="(!disabled && !role) || Account.user.currentProfile == role"
    :data-testid="$testId('vertical-menu-item')"
    class="menu-item"
    :class="{
      'is-submenu-active': isActive,
      'has-submenu': submenu,
      'is-highlight': highlight,
    }"
  >
    <a
      v-if="!submenu || iconClick"
      href="#"
      class="menu-link"
      :class="{
        'is-active-parent': (isActiveParent && !exact) || isSameRoute,
        [`menu-${link.name.replaceAll('.', '-')}`]: true,
      }"
      @click.prevent="redirect"
    >
      <Tooltip
        v-if="showIconTooltip"
        :bold-font="false"
        :uppercase="false"
        medium-font
        vertical-align="top"
      >
        <template #activator="{ on }">
          <Icon
            :name="icon"
            pack="material"
            class="icon-fill-1"
            @mouseenter.native="on.mouseenter"
            @mouseleave.native="on.mouseleave"
          />
        </template>

        <span v-html="$t(text)"></span>
      </Tooltip>

      <Icon
        v-if="icon && !showIconTooltip"
        :name="icon"
        pack="material"
        class="icon-fill-1"
      />

      <NotificationCircle
        v-if="showIconTooltip && notification"
        class="vertical-menu-item__notification-circle reduced"
      />

      <span
        v-if="!showIconTooltip"
        class="text"
      >
        <span v-html="$t(text)"></span>
        <NotificationCircle
          v-if="notification"
          class="vertical-menu-item__notification-circle"
        />
      </span>
    </a>

    <a
      v-else
      :class="{ 'is-active-parent': (isActiveParent && !exact) || isSameRoute }"
      class="menu-link no-underline"
      href="#"
      @click.prevent="openSubmenu()"
    >
      <Icon
        v-if="icon"
        :name="icon"
        pack="material"
        class="icon-fill-1"
      />

      <span
        class="text"
        v-html="$t(text)"
      ></span>

      <Icon
        v-if="submenu"
        name="arrow_drop_down"
        pack="material"
        class="icon-fill-1"
      />
    </a>

    <ul
      v-if="submenu"
      ref="submenuList"
      class="submenu-list list-none"
    >
      <slot></slot>
    </ul>
  </li>
</template>

<style lang="scss">
@import 'VerticalMenuItem.scss';
</style>
