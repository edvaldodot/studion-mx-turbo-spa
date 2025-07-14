<script>
import { mapState } from 'vuex'
import Icon from '../Icon'

export default {
  name: 'rankingListItem',
  components: {
    Icon
  },
  data () {
    return {
      rankingItemUser: 0,
      rankingItemImage: 0,
      spaces: 0,
      rankingItem: 0,
      rankingItemPosition: 0,
      widthRankingItemUser: 0,
      paginationListItem: 0,
      widthRankingItemSecond: 50
    }
  },
  props: {
    rankingItems: {
      type: Array,
      default () { return [] }
    },
    pagination: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 25
    },
    widthRankingItemUserName: {
      type: Number,
      default: 50
    },
    userName: {
      type: String,
      default: ''
    },
    tabLinkActive: {
      type: Number,
      default: -1
    },
    countPaginationEffect: {
      type: Boolean,
      default: false
    },
    isGeneralRanking: {
      type: Boolean,
      default: false
    },
    secondModel: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    maxPagination () {
      return this.rankingItems.length / this.pageSize
      // return 1
    }
  },
  methods: {
    setCssRankingMedalsItem () {
      let index
      if ((this.tabLinkActive === 1 || this.tabLinkActive === -1) && window.innerWidth !== 0 && this.$refs.rankingItemPosition) {
        for (index = 0; index < this.$refs.rankingItemPosition.length; index++) {
          if (this.$media.mobile) {
            this.rankingItemUser = this.$refs.widthRankingItemUser ? this.$refs.widthRankingItemUser[0].clientWidth - 5 : 0
            if (this.secondModel) {
              this.widthRankingItemSecond = this.$refs.rankingItem[0].clientWidth - 100
            }
          } else {
            this.rankingItemUser = this.$refs.widthRankingItemUser ? this.$refs.widthRankingItemUser[0].clientWidth + 20 : 0
          }
          this.rankingItemImage = 40
          this.spaces = 50
          this.rankingItem = this.$refs.rankingItem ? this.$refs.rankingItem[index].clientWidth : 0
          this.rankingItemPosition = this.$refs.rankingItemPosition ? this.$refs.rankingItemPosition[index].clientWidth : 0
          this.widthRankingItemUser = this.rankingItem - this.rankingItemPosition - this.rankingItemUser - this.rankingItemImage - this.spaces
        }
      }
    },
    visibilityChanged (isVisible) {
      if (isVisible) {
        setTimeout(() => {
          this.paginationListItem = this.paginationListItem === this.maxPagination ? this.maxPagination : this.paginationListItem + 1
        }, 500)
      }
    }
  },
  mounted () {
    if (this.tabLinkActive === 1) {
      this.setCssRankingMedalsItem()
    }
  },
  created () {
    this.paginationListItem = this.pagination
  },
  updated () {
    this.setCssRankingMedalsItem()
  }
}
</script>

<template>
  <div>
    <div class="ranking-list-item">
      <template v-for="(item, index) in rankingItems" v-if="!secondModel">
        <div :key="item" class="ranking-item ranking-item-before" v-if="index === 0 && item.position !== 1 && !isGeneralRanking"></div>
        <transition name="fadeInUp" :key="index" v-if="!secondModel">
          <div class="ranking-item" v-if="index < paginationListItem * pageSize" :style="{ 'transition-delay': index >= pageSize ? (index % pageSize * 40 + 'ms') : (index * 40 + 'ms') }" ref="rankingItem">
            <div class="ranking-item-position-aux" :class="{'ranking-item-position': item.position <= 3}" ref="rankingItemPosition">
              <icon class="ranking-item-position-icon" :name="`prize-${item.position}`" v-if="item.position <= 3"/>
              <span class="ranking-item-position-label text-base" v-else>{{ item.position }}º</span>
            </div>
            <div class="ranking-item-user">
              <div class="ranking-item-user-image-wrapper">
                <img :src="item.user.avatarImage" :alt="item.user.name" class="ranking-item-user-image" v-if="item.user.avatarImage">
                <icon name="account_circle" class="ranking-item-user-image-icon" v-else/>
              </div>
              <div class="ranking-item-user-info">
                <div class="ranking-item-user-name compact-name" :style="`max-width: ${widthRankingItemUser}px`" ref="rankingItemUserName">{{ item.user.name }}</div>
                <div class="ranking-item-user-points" v-html="$t(`ranking:user.level.point${item.score >= 2 ? 's' : ''}`, {'nivel': item.level || '0', 'num2': item.score})"></div>
              </div>
            </div>
            <span class="ranking-item-user-label" v-if="item.user.username === userName" ref="widthRankingItemUser">{{ $media.mobile ? '' : $t('ranking:user.label') }}</span>
          </div>
        </transition>
        <div :key="item.user.id" class="ranking-item ranking-item-after"
             v-if="index === rankingItems.length-1 && !isGeneralRanking"></div>
      </template>

      <template v-for="(item, index) in rankingItems" v-if="secondModel">
        <div :class="{'second-model': secondModel}" :key="item" class="ranking-item ranking-item-before" v-if="index === 0 && item.position !== 1 && !isGeneralRanking"></div>
        <transition name="fadeInUp" :key="index" v-if="secondModel">
          <div class="ranking-item" :class="{'second-model': secondModel}" v-if="index < paginationListItem * pageSize" :style="{ 'transition-delay': index >= pageSize ? (index % pageSize * 40 + 'ms') : (index * 40 + 'ms') }" ref="rankingItem">
            <div class="ranking-item-position-aux" :class="{'ranking-item-position': item.position <= 3}" ref="rankingItemPosition">
              <icon class="ranking-item-position-icon" :name="`prize-${item.position}`" v-if="item.position <= 3"/>
              <span class="ranking-item-position-label text-base" v-else>{{ item.position }}º</span>
            </div>
            <div class="ranking-item-user">
              <div class="ranking-item-user-info">
                <div class="ranking-item-user-name compact-name" :style="`max-width: ${$media.mobile ? widthRankingItemSecond : widthRankingItemUserName}px`" ref="rankingItemUserName">{{ item.user.name }}</div>
                <div class="ranking-item-user-points" v-html="$t(`ranking:user.level.point${item.score >= 2 ? 's' : ''}`, {'num1': item.level || '0', 'num2': item.score})"></div>
              </div>
            </div>
            <div class="ranking-item-user-label" v-if="item.user.username === userName" ref="widthRankingItemUser"></div>
          </div>
        </transition>
        <div :class="{'second-model': secondModel}" :key="item.user.id" class="ranking-item ranking-item-after"
             v-if="index === rankingItems.length-1 && !isGeneralRanking"></div>
      </template>
    </div>
    <div class="ranking-list-end" v-observe-visibility="visibilityChanged" v-if="countPaginationEffect"></div>
  </div>
</template>

<style lang="scss"></style>
