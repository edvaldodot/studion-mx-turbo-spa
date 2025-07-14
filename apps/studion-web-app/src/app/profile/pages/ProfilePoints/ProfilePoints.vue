<script>
import { mapActions, mapState } from 'vuex'

import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import RankingListItem from '@/components/general/RankingListItem'
import RankingUser from '@/components/general/RankingUser'
import Tabs from '@/components/general/Tabs'

export default {
  name: 'ProfilePoints',
  components: {
    ActionBar,
    ContentHeader,
    RankingUser,
    Tabs,
    Datatable,
    RankingListItem,
  },
  data() {
    return {
      tabLinksPoints: [],
      tabLinkPointsActive: 0,
      obtainedTitleWidth: {},
      obtainedDescrWidth: 0,
      notObtainedDescrWidth: {},
      widthMedalsItem: 0,
      profilePoints: {
        profile: {},
        medals: {
          obtained: [],
          notObtained: [],
        },
        ranking: {
          items: [],
        },
        rules: {
          items: [],
        },
      },
      pagination: 1,
      pageSize: 25,
      tabLinks: [],
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
  },
  created() {
    this.tabLinkPointsActive = this.$route.params.indexFromTabProfilePoints
      ? this.$route.params.indexFromTabProfilePoints
      : this.tabLinkPointsActive

    this.tabLinks = [
      {
        text: 'profile:tab.link.register',
        location: { name: 'profile.register' },
      },
      {
        text: 'profile:tab.link.points',
        location: { name: 'profile.points' },
      },
    ]

    this.tabLinksPoints = [
      {
        text: 'profile:tab.link.points.medals',
      },
      {
        text: 'profile:tab.link.points.ranking',
      },
      {
        text: 'profile:tab.link.points.rules',
      },
    ]
    this.load()
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptPlayerStatusRetrieval',
      'attemptAchievementsRetieval',
      'attemptPlayerLeaderboardRetrieval',
      'attemptActionsRetrieval',
    ]),
    changeTab(index) {
      this.tabLinkPointsActive = index
    },
    load() {
      this.setFetching(true)
      Promise.all([this.attemptPlayerStatusRetrieval()])
        .then(([dataPlayerStatus]) => {
          this.profilePoints.profile = {
            user: {
              name: this.Account.user.data.name,
              username: dataPlayerStatus.data.username,
            },
            level: {
              name: dataPlayerStatus.data.playerLevel.level.description,
              tag: dataPlayerStatus.data.playerLevel.level.position.toString(),
            },
            position: dataPlayerStatus.data.playerRanking.position,
            progress: dataPlayerStatus.data.playerLevel.progress,
            experience: {
              current: dataPlayerStatus.data.points,
              toNext: parseFloat(
                (
                  (dataPlayerStatus.data.points * 100) /
                    dataPlayerStatus.data.playerLevel.progress -
                  dataPlayerStatus.data.points
                ).toFixed()
              ),
            },
          }

          Promise.all([this.attemptAchievementsRetieval()]).then(([dataAchievements]) => {
            dataAchievements.data.forEach((dataAchievement) => {
              let playerAchievementData = false
              dataPlayerStatus.data.playerAchievements.forEach((playerAchievement) => {
                if (dataAchievement.alias === playerAchievement.alias) {
                  playerAchievementData = playerAchievement
                }
              })
              let achievement = {
                title: dataAchievement.title,
                description: dataAchievement.description,
                points: dataAchievement.points,
                startDate: '',
                conclusionDate: '',
                image: '/assets/images/themes/default/svg/medals/medal-obtained.svg',
              }
              if (playerAchievementData) {
                achievement.conclusionDate = playerAchievementData.issuedAt
                this.profilePoints.medals.obtained.push(achievement)
              } else {
                this.profilePoints.medals.notObtained.push(achievement)
              }
            })
            Promise.all([this.attemptPlayerLeaderboardRetrieval()]).then(([dataRanking]) => {
              this.profilePoints.ranking.items = dataRanking.data.map((item) => {
                return {
                  user: {
                    name: item.player.name,
                    username: item.player.username,
                    avatarImage: item.player.image, // user.avatar ? user.avatar : null
                  },
                  score: item.player.points || 0,
                  position: item.position,
                  level: item.playerLevel.level.description || 0,
                }
              })
              Promise.all([this.attemptActionsRetrieval()]).then(([dataActions]) => {
                this.profilePoints.rules.items = dataActions.data
                  .filter((data) => data.point !== 0 && data.point !== null)
                  .map((item) => {
                    return {
                      alias: item.alias,
                      rule: item.title,
                      points: item.point,
                      interval: this.$t(item.interval),
                    }
                  })
                this.setFetching(false)
              })
            })
          })
        })
        .catch(() => {
          this.setFeedback({ message: 'Erro ao obter informações de ranking em meu perfil!!!' })
          this.setFetching(false)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <div class="main-content">
    <content-header
      class="header-admin"
      :title="$t('profile:header.title')"
      :description="$t('profile:header.description')"
    >
      <action-bar slot="actionbar"></action-bar>
      <Tabs
        slot="tabs"
        :dark="true"
        :links="tabLinks"
      ></Tabs>
    </content-header>
    <div
      class="profile-points"
      :class="{
        'rules-tab': tabLinkPointsActive === 2 && !$media.mobile,
        'theme-dark': accessibility,
      }"
    >
      <div class="center">
        <ranking-user
          v-if="Object.keys(profilePoints.profile).length"
          :user-name="profilePoints.profile.user.name"
          :max-width-name="510"
          :level-tag="profilePoints.profile.level.tag"
          :level-name="profilePoints.profile.level.name"
          :position="profilePoints.profile.position"
          :progress="profilePoints.profile.progress"
          :tab-link-points-active="tabLinkPointsActive"
          :experience-current="profilePoints.profile.experience.current"
          :experience-to-next="profilePoints.profile.experience.toNext"
        >
        </ranking-user>
        <tabs
          :links="tabLinksPoints"
          :index-active="tabLinkPointsActive"
          @tabChange="changeTab($event)"
        ></tabs>
        <template v-if="tabLinkPointsActive === 0">
          <div class="medals-list">
            <div
              v-if="profilePoints.medals.obtained.length"
              class="medals-section-title"
            >
              <p class="text-color">{{ $t('profile.points:medals.points.session.title.1') }}</p>
            </div>
            <div
              v-for="(item, index) in profilePoints.medals.obtained"
              ref="medalsItem"
              :key="'obtained' + index"
              class="medals-item"
            >
              <div
                :ref="'medalsItemPoints_' + index"
                class="medals-item-points"
              >
                >
                <div class="medals-item-points-value">
                  <span
                    class="points"
                    v-html="
                      $t(`profile.points:medals.item.point${item.points >= 2 ? 's' : ''}`, {
                        num: item.points,
                      })
                    "
                  ></span>
                </div>
              </div>
              <img
                :src="'/assets/images/themes/default/svg/medals/medal-obtained.svg'"
                alt=""
                class="medals-item-image-wrapper"
              />
              <div class="medals-item-info">
                <div
                  class="medals-item-info-title"
                  :class="{ 'compact-name': !$media.mobile }"
                >
                  {{ item.title }}
                </div>
                <div
                  class="medals-item-info-description"
                  :class="{ 'compact-name': !$media.mobile }"
                >
                  {{ item.description }}
                </div>
              </div>
            </div>
            <div
              v-if="profilePoints.medals.notObtained.length"
              class="medals-section-title"
            >
              <p class="text-color">{{ $t('profile.points:medals.points.session.title.2') }}</p>
            </div>
            <div
              v-for="(item, index) in profilePoints.medals.notObtained"
              :key="'not-obtained' + index"
              class="medals-item not-obtained"
            >
              <div
                :ref="'medalsItemPoints2_' + index"
                class="medals-item-points"
              >
                <div class="medals-item-points-value">
                  <span
                    class="points"
                    v-html="
                      $t(`profile.points:medals.item.point${item.points >= 2 ? 's' : ''}`, {
                        num: item.points,
                      })
                    "
                  ></span>
                </div>
              </div>
              <img
                :src="'/assets/images/themes/default/svg/medals/medal-not-obtained.svg'"
                alt=""
                class="medals-item-image-wrapper"
              />
              <div class="medals-item-info">
                <div
                  :ref="'infoDescription2_' + index"
                  class="medals-item-info-description"
                  :class="{ 'compact-name': !$media.mobile }"
                >
                  {{ item.description }}
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-if="tabLinkPointsActive === 1">
          <p class="message-warning-update">{{ $t('settings.gamification:warning.update') }}</p>
          <template v-if="profilePoints.ranking.items.length">
            <ranking-list-item
              v-if="Object.keys(profilePoints.ranking).length"
              :ranking-items="profilePoints.ranking.items"
              :pagination="pagination"
              :page-size="pageSize"
              :user-name="Account.user.data.username"
              :tab-link-active="tabLinkPointsActive"
              :index-from-tab-profile-points="$route.params.indexFromTabProfilePoints"
            >
            </ranking-list-item>
          </template>
        </template>
        <template v-if="tabLinkPointsActive === 2">
          <datatable
            v-if="Object.keys(profilePoints.rules).length"
            :items="profilePoints.rules.items"
            :dark="accessibility"
          >
            <template slot="thead">
              <tr v-if="!$media.mobile">
                <th
                  class="th"
                  width="88%"
                >
                  {{ $t('settings.gamification:points.datatable.header.1') }}
                </th>
                <th
                  class="th"
                  width="12%"
                >
                  {{ $t('settings.gamification:points.datatable.header.2') }}
                </th>
              </tr>
            </template>
            <template
              slot="tbody"
              slot-scope="props"
            >
              <tr
                v-if="$media.mobile"
                class="tr-colspan"
              >
                <td
                  class="label-title"
                  colspan="1"
                >
                  <span class="td-text bolder">{{ props.item.rule }}</span>
                </td>
              </tr>
              <tr
                v-if="$media.mobile"
                class="tr-colspan"
              >
                <td
                  class="td"
                  width="100%"
                >
                  <span class="td-text bolder">{{
                    $t('settings.gamification:points.datatable.header.2')
                  }}</span>
                </td>
              </tr>
              <tr :class="{ 'tr-body': $media.mobile }">
                <td
                  v-if="!$media.mobile"
                  class="td"
                >
                  <span class="td-text bolder">{{ props.item.rule }}</span>
                </td>
                <td class="td">
                  <span class="td-text">{{
                    $t(
                      `settings.gamification:points.datatable.col.point${
                        props.item.points >= 2 ? 's' : ''
                      }`,
                      { num: props.item.points }
                    )
                  }}</span>
                </td>
              </tr>
            </template>
          </datatable>
        </template>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import '~@/components/general/Profile/Profile.scss';
</style>
