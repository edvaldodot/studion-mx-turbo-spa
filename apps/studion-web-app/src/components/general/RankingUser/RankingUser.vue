<script>
import { mapState } from 'vuex'

export default {
  name: 'rankinguser',
  components: {
    // Action: () => import('../Action'),
  },
  props: {
    userName: {
      type: String,
      default: null
    },
    levelTag: {
      type: String,
      default: '0'
    },
    levelName: {
      type: String,
      default: null
    },
    position: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      default: 0
    },
    experienceCurrent: {
      type: Number,
      default: 0
    },
    experienceToNext: {
      type: Number,
      default: 0
    },
    maxWidthName: {
      type: Number,
      default: 0
    },
    tabLinkPointsActive: {
      type: Number,
      default: null
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility'])
  },
  methods: {
    isMaxLevel () {
      return this.levelTag === '5'
    }
  }
}
</script>

<template>
  <div class="ranking-user" :class="{'rules-tab': tabLinkPointsActive === 2}">
    <img class="ranking-user-medal" :src="`/assets/images/themes/default/svg/medals/level-${levelTag}.svg`" :alt="levelName">
    <div class="ranking-user-info">
      <span class="ranking-user-name compact-name" :style="`max-width: ${maxWidthName}px;`">{{ userName }}</span>
    </div>
    <div class="ranking-user-info-level">
      <span class="ranking-user-level-game" v-html="$t('ranking:user.level.position', {'nivel': levelName, 'position': position})"></span>
    </div>
    <div class="ranking-user-progress">
      <div class="ranking-user-progress-bar">
        <span class="ranking-user-progress-bar-value" :style="`width: calc(${progress}% - ${$media.mobile ? 2: 4}px)`"></span>
      </div>
      <span class="ranking-user-progress-level" v-html="$t(`ranking:user.progress.level${experienceCurrent >= 2 ? '.pts' : ''}`, {'num': experienceCurrent})"></span>
    </div>
    <span class="ranking-user-next-level">
      {{ isMaxLevel() ? $t('ranking:user.current.level.maximum') : $t(`ranking:user.next.level${experienceToNext >= 2 ? '.pts' : ''}`, {'num': experienceToNext}) }}
    </span>
  </div>
</template>

<style lang="scss"></style>
