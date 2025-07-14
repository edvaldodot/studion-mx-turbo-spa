<script>
import { mapActions, mapState } from 'vuex'

import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import RankingListItem from '@/components/general/RankingListItem'
import Pagination from '@/components/general/Pagination'
import EmptyMessage from '@/components/general/EmptyMessage'

export default {
  name: 'RankingList',
  components: {
    ActionBar,
    ContentHeader,
    RankingListItem,
    Pagination,
    EmptyMessage,
  },
  data() {
    return {
      backUrl: { name: 'dashboard' },
      profile: null,
      rankingItems: [],
      userPosition: null,
      lastScore: null,
      lastPosition: 0,
      pagination: 0,
      total: 0,
      pageSize: 100,
      rankingQueryParams: {
        page: this.$route.query.page || 1,
        limit: this.$route.query.limit || 12,
      },
      paging: {
        actualPage: 1,
      },
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
  },
  watch: {
    'rankingQueryParams.page'() {
      this.loadRankingItems()
    },
  },
  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptGeneralLeaderboardRetrieval']),

    nextPage() {
      if (this.paging.nextPage) {
        this.rankingQueryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.rankingQueryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.rankingQueryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.rankingQueryParams.page = this.paging.firstPage
      }
    },

    changeItemsPerPage(val) {
      this.rankingQueryParams.limit = val
      if (this.rankingQueryParams.page !== 1) {
        this.firstPage()
        return
      }

      this.loadRankingItems()
    },

    loadRankingItems() {
      this.setFetching(true)
      this.attemptGeneralLeaderboardRetrieval(this.rankingQueryParams)
        .then(({ data }) => {
          this.paging = data
          this.rankingItems = data.data.map((item) => {
            return {
              user: {
                name: item.player.name,
                username: item.player.username,
                avatarImage: item.player.image,
              },
              score: item.player.points || 0,
              level: item.playerLevel.level.description || 0,
              position: item.position,
            }
          })
        })
        .catch(() => {
          this.setFeedback({
            message: 'Erro ao obter informações de ranking geral!!!',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
  created() {
    this.loadItemsPerPagePreferences(this.rankingQueryParams)
    this.loadRankingItems()
  },
}
</script>

<template>
  <div
    class="main-content bg-black-50"
    :class="{ 'theme-dark': accessibility }"
  >
    <content-header
      float
      :back="!$media.mobile"
      :backUrl="backUrl"
    >
      <action-bar slot="actionbar"></action-bar>
    </content-header>
    <div class="center">
      <h2 class="ranking-title text-color">{{ $t('ranking:title') }}</h2>
      <p class="message-warning-update text-color">
        {{ $t('settings.gamification:warning.update') }}
      </p>
      <div class="py-4">
        <ranking-list-item
          :rankingItems="rankingItems"
          :pagination="pagination"
          :pageSize="pageSize"
          :countPaginationEffect="true"
          :isGeneralRanking="true"
          v-if="rankingItems.length"
        ></ranking-list-item>
      </div>
      <Pagination
        :active-page="paging.actualPage"
        :page-count="paging.lastPage"
        @next-page="nextPage"
        @previous-page="previousPage"
        @first-page="firstPage"
        @last-page="lastPage"
        @go-to-page="rankingQueryParams.page = $event"
        @change-items-per-page="changeItemsPerPage"
      />

      <div class="py-4">
        <empty-message
          v-if="rankingItems.length === 0 && this.notEqualsProfile('student')"
          v-bind:class="['white']"
        >
          <h2>{{ $t('gamification.ranking.admin:empty.title') }}</h2>
          <p class="text-color">{{ $t('gamification.ranking.admin:empty.subtitle') }}</p>
        </empty-message>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
