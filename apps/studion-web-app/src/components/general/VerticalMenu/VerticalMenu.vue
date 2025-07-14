<script>
import { mapState } from 'vuex'

import config from '@/config'

import Action from '../Action'
import Icon from '../Icon'
import Logo from '../Logo'
import VerticalMenuItem from '../VerticalMenuItem'
import VerticalMenuSubItem from '../VerticalMenuSubItem'

const { DEFAULT_CLASSROOM_MENU } = config
const { PORTAL_CONFIGS } = config

export default {
  name: 'VerticalMenu',

  components: {
    Action,
    Icon,
    Logo,
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
    classroom: {
      type: Boolean,
      default: false,
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
  },

  created() {
    if (this.equalsProfile('student')) {
      this.expanded = false
      this.expandMenu()
    }
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
}
</script>

<template>
  <nav
    :data-testid="$testId('vertical-menu')"
    class="menu"
    :class="{ 'is-reduced': !menuExpanded && !$media.mobile, 'menu-classroom': classroom }"
  >
    <div class="menu__header-quick">
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

        <template v-if="classroom">
          <Icon
            v-if="defaultMenuType === 'icon'"
            name="grid_view"
            class="custom-icon icon-fill-1"
            pack="material"
          />

          <Logo
            v-else
            :link="getLogoLink()"
            :theme="$theme"
            logo
          />

          <span class="menu-header-title hidden">
            {{ $t('global:solution.image.placeholder') }}
          </span>
        </template>

        <template v-else>
          <Logo
            logo
            :theme="$theme"
          />
        </template>

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

          <ul class="menu-list list-none">
            <template v-for="(menuItem, menuItemIndex) in section.items">
              <VerticalMenuItem
                v-if="!menuItem.disabled"
                :key="menuItemIndex"
                :link="menuItem.link"
                :text="menuItem.text"
                :icon="menuItem.icon"
                :notification="menuItem.notification"
                :highlight="menuItem.highlight"
                :submenu="Array.isArray(menuItem.items)"
                :icon-click="!menuExpanded"
                :role="menuItem.role"
                :disabled="menuItem.disabled"
                :exact="menuItem.exact"
                :callback="menuItem.callback"
                :name="menuItem.name"
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

      <slot name="bottom" />
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
@import 'VerticalMenu.scss';
</style>
