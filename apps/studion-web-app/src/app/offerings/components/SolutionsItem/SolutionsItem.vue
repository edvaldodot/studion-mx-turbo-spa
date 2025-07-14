<script>
import { parseTools } from '@/support/utils/tools'
import configControlViewMixin from '@/mixins/configControlView'

import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'

export default {
  name: 'solutionsitem',
  components: {
    Action,
    Icon,
    Rating: () => import('@/components/general/Rating')
  },

  mixins: [configControlViewMixin],

  data () {
    return {
      isOpen: false,
      height: 0,
      buttonHover: false
    }
  },
  props: {
    image: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    duration: {
      type: Object,
      default: null
    },
    durationType: {
      type: String,
      default: null
    },
    workload: {
      type: Object,
      default: null
    },
    keepOpen: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      default: null
    },
    technicalRequirements: {
      type: String,
      default: null
    },
    programContent: {
      type: String,
      default: null
    },
    certification: {
      type: String,
      default: null
    },
    availableTools: {
      type: Array,
      default: null
    },
    ratingAnalysis: {
      type: Object,
      default: null
    },
    userRating: {
      type: Object,
      default: null
    },
    id: {
      type: Number
    },
    audience: {
      type: String,
      default: null
    },
    metas: {
      type: Array,
      default: null
    },
    prerequisiteText: {
      type: String,
      default: null,
    }
  },

  computed: {
    showWorkload() {
      return this.config_showWorkload && this.workload
    },

    showDuration() {
      return this.config_showDuration && this.duration
    },

    filteredAvailableTools() {
      return this.availableTools.filter((tool) => tool.alias !== 'aiTutor')
    },
  },

  methods: {
    openContent () {
      if (!this.keepOpen) {
        this.isOpen = !this.isOpen
        this.$refs.content.style.height = this.isOpen ? this.height + 'px' : 0
      }
    },
    mouseEnter () {
      this.buttonHover = !this.buttonHover
    },
    mouseLeave () {
      this.buttonHover = !this.buttonHover
    },
    getToolsAlias (alias) {
      if (alias in parseTools) alias = parseTools[alias]
      var re = /[A-Z]/g
      if (alias.match(re)) {
        return alias.replace(re, '.$&').toLowerCase()
      }
      return alias
    }
  },
  mounted () {
    this.$nextTick(function () {
      if (!this.keepOpen) {
        this.height = this.$refs.content.clientHeight
        this.$refs.content.style.height = 0
      }
    })
  }
}
</script>

<template>
  <div class="solutions-item" :class="{ 'is-open': isOpen, 'has-image': image }">
    <div class="solutions-item-header" :class="{ 'solutions-item-clickable': !keepOpen }" @click="openContent" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
      <div class="solutions-item-image-wrapper">
        <img :src="image" alt="" class="solutions-item-image" v-if="image">
        <icon name="photo" class="solutions-item-image-icon" wrapper v-else></icon>
      </div>
      <div class="solutions-item-header-content bg-white">
        <span class="solutions-item-type">{{ type }}</span>
        <h3 class="solutions-item-title text-color">{{ name }}</h3>
        <rating
          :id="id"
          dark
          show-quantity
          resource-type="session"
          :rating-analysis="ratingAnalysis"
          :user-rating="userRating"
        />
        <div
          v-if="prerequisiteText"
          class="solutions-item-prerequisite mt-3"
        >
          <p class="text-color" v-html="prerequisiteText"></p>
        </div>
        <div class="solutions-item-info-list">
          <div class="solutions-item-info" v-if="showWorkload">
            <span class="solutions-item-info-title text-color">{{ $t('global:solution.workload') }}:</span>
            <icon class="solutions-item-info-icon text-color" name="clock"></icon>
            <span class="solutions-item-info-text text-color">{{ $tc(`global:solution.duration.type.${workload.type}`, workload.value, {'num': workload.value}) }}</span>
          </div>
          <div class="solutions-item-info" v-if="showDuration">
            <span class="solutions-item-info-title text-color">{{ $t('global:solution.duration') }}:</span>
            <icon class="solutions-item-info-icon text-color" name="calendar-range"></icon>
            <span class="solutions-item-info-text text-color">{{ $tc(`global:solution.duration.type.${duration.type}`, duration.value, {'num': duration.value}) }}</span>
          </div>
        </div>
        <Action
          v-if="!keepOpen && $media.desktop"
          :text="isOpen ? $t('global:hide.details') : $t('global:view.more.details')"
          type="button"
          class="solutions-item-link"
          icon="keyboard_arrow_down"
          icon-right
          flat
          dark
          :class="{ 'is-hover': buttonHover }"
        />
      </div>
    </div>
    <div class="solutions-item-content" ref="content">
      <div class="solutions-item-content-block-list">
        <div class="solutions-item-content-block" v-if="description">
          <h4 class="solutions-item-content-block-title">{{ $t('global:solution.description') }}</h4>
          <div class="solutions-item-content-block-description">
            <p v-html="description"></p>
          </div>
        </div>
        <div class="solutions-item-content-block" v-if="$isEnabledFeature('bidding') && audience">
          <h4 class="solutions-item-content-block-title" v-html="$t('global:solution.audience')"></h4>
          <div class="solutions-item-content-block-description">
            <p class="text-color">{{ audience }}</p>
          </div>
        </div>
        <div class="solutions-item-content-block" v-if="technicalRequirements">
          <h4 class="solutions-item-content-block-title">{{ $t('global:solution.requirements') }}</h4>
          <div class="solutions-item-content-block-description">
            <p class="text-color">{{ technicalRequirements }}</p>
          </div>
        </div>
        <div class="solutions-item-content-block">
          <h4 class="solutions-item-content-block-title">{{ $t('global:solution.certification') }}</h4>
          <div class="solutions-item-content-block-description">
            <p class="text-color">{{ certification }}</p>
          </div>
        </div>
        <div class="solutions-item-content-block" v-if="filteredAvailableTools">
          <h4 class="solutions-item-content-block-title">{{ $t('global:solution.tools') }}</h4>
          <div class="solutions-item-content-block-description">
            <ul>
              <li>{{ $t('solutions:tools.calendar') }}</li>
              <li v-for="(tool, index) in filteredAvailableTools" :key="index">{{ $t(`solutions:tools.${getToolsAlias(tool.alias)}`) }}</li>
            </ul>
          </div>
        </div>
        <div class="solutions-item-content-block" v-if="$isEnabledFeature('bidding') && programContent">
          <h4 class="solutions-item-content-block-title" v-html="$t('global:solution.class')"></h4>
          <div class="solutions-item-content-block-description" v-html="programContent"></div>
        </div>

        <template v-if="$isEnabledFeature('course_metas') && (metas && metas.length)">
          <div
            v-for="meta in metas"
            :key="meta.alias"
            class="solutions-item-content-block"
          >
            <h4 class="solutions-item-content-block-title">{{ meta.name }}</h4>
            <div class="solutions-item-content-block-description">
              <template v-if="Array.isArray(meta.value)">
                <ul>
                  <li v-for="value in meta.value" :key="value">{{ value }}</li>
                </ul>
              </template>

              <p v-else>{{ meta.value }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div
      v-if="!keepOpen && $media.mobile"
      class="mobile-action"
      @click="openContent"
    >
      <Action
        :text="isOpen ? $t('global:hide.details') : $t('global:view.more.details')"
        :icon="isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        type="button"
        icon-size="large"
        icon-right
        dark
        flat
      />
    </div>
  </div>
</template>

<style lang="scss">
  @import "SolutionsItem.scss";
</style>