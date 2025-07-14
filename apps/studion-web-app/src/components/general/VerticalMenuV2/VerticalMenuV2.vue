<script>
import { mapState } from 'vuex'
import { defineComponent } from 'vue'

import config from '@/config'

import Action from '../Action'
import Icon from '../Icon'
import Logo from '../Logo'
import Profile from '../Profile'
import VerticalMenuItem from '../VerticalMenuItem'
import VerticalMenuSubItem from '../VerticalMenuSubItem'

const { DEFAULT_CLASSROOM_MENU } = config
const { PORTAL_CONFIGS } = config

export default defineComponent({
  name: 'VerticalMenuV2',

  components: {
    Action,
    Icon,
    Logo,
    Profile,
    VerticalMenuItem,
    VerticalMenuSubItem,
  },

  props: {
    items: {
      type: Array,
      default() {
        return []
      },
    },
  },

  data() {
    return {
      expanded: true,
      icon: 'local_library',
      defaultMenuType: DEFAULT_CLASSROOM_MENU,
      hideBottomLogo: false,
    }
  },

  computed: {
    ...mapState(['Account', 'menuExpanded']),
    name() {
      return this.Account.user.data && this.Account.user.data.name
        ? this.Account.user.data.name
        : ''
    },
  },

  methods: {
    expandMenu() {
      this.expanded = !this.menuExpanded
      this.$emit('resize', this.expanded)
    },
    closeMenu() {
      this.$emit('close')
    },
    getLogoLink() {
      return PORTAL_CONFIGS && PORTAL_CONFIGS.COURSES_URL ? PORTAL_CONFIGS.COURSES_URL : '/'
    },
  },
})
</script>

<template>
  <nav
    :data-testid="$testId('vertical-menu')"
    class="menu menu-v2"
    :class="{ 'is-reduced': !menuExpanded && !$media.mobile }"
  >
    <div class="menu__header-quick bg-secondary">
      <div class="menu-header">
        <a
          v-if="!$media.mobile"
          class="menu-btn"
          href="#"
          :class="{ 'expanded-menu': menuExpanded }"
          @click.prevent="expandMenu()"
        >
          <Icon
            name="start"
            pack="material"
          />
        </a>

        <Logo
          :theme="$theme"
          logo
        />

        <div class="menu-header__close">
          <Action
            v-if="$media.mobile"
            class="text-color bg-white border-circle"
            type="button"
            icon="close"
            @click="closeMenu()"
          />
        </div>
      </div>
    </div>

    <div class="menu__profile-picture flex align-items-center justify-content-center pb-2 bg-secondary">
      <Profile
        :big-size="!!menuExpanded"
        profile-vertical-menu
        disable-menu
      />
      <div
        :class="['profile-content-name text-white', { hidden: !menuExpanded }]"
        v-html="$t('global:profile.greetings', { name: name })"
      ></div>
    </div>

    <div class="menu__sections">
      <template v-for="(section, sectionIndex) in items">
        <div
          v-if="
            typeof section.deniedProfile === 'undefined' ||
            Account.user.currentProfile !== section.deniedProfile
          "
          :key="sectionIndex"
          class="menu-section"
          :class="{ 'menu-section-first': sectionIndex === 0 }"
        >
          <div
            v-if="section.title"
            class="menu-section-title-wrapper"
          >
            <h5 class="menu-section-title">
              {{ menuExpanded ? $t(section.title.expanded) : $t(section.title.reduced) }}
            </h5>
          </div>

          <ul class="menu-list">
            <template v-for="(menuItem, menuItemIndex) in section.items">
              <VerticalMenuItem
                v-if="!menuItem.disabled"
                :key="menuItemIndex"
                :link="menuItem.link"
                :text="menuItem.text"
                :icon="menuItem.icon"
                :notification="menuItem.notification"
                :highlight="menuItem.highlight"
                :icon-click="!menuExpanded"
                :submenu="Array.isArray(menuItem.items)"
                :role="menuItem.role"
                :disabled="menuItem.disabled"
                :exact="menuItem.exact"
                :callback="menuItem.callback"
                :show-icon-tooltip="!menuExpanded && !$media.mobile"
              >
                <template v-if="menuItem.items && menuItem.items.length">
                  <VerticalMenuSubItem
                    v-for="(menuSubItem, subItemIndex) in menuItem.items.filter((i) => !i.disabled)"
                    :key="subItemIndex"
                    :text="menuSubItem.text"
                    :icon="menuSubItem.icon"
                    :link="menuSubItem.link"
                  />
                </template>
              </VerticalMenuItem>
            </template>
          </ul>
        </div>
      </template>
    </div>
    <div
      v-if="menuExpanded && !hideBottomLogo"
      class="menu__footer"
    >
      <div class="image-footer__wrapper">
        <img
          class="footer-logo__image"
          :src="`/assets/images/themes/${$theme}/logo/menu-bottom-logo.png`"
          @error="hideBottomLogo = true"
        />
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
@import '../VerticalMenu/VerticalMenu.scss';
@import 'VerticalMenuV2.scss';
</style>
