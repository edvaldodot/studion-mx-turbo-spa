<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { format, parseISO } from 'date-fns'
import { ContentLoader } from 'vue-content-loader'
import BlurCard from '@/components/general/BlurCard'
import EmptyMessage from '@/components/general/EmptyMessage'
import FlagFixed from '@/components/general/FlagFixed'
import Icon from '@/components/general/Icon'
import Skeleton from '@/components/general/Skeleton'
import TextReduce from '@/components/general/TextReduce'

export default defineComponent({
  name: 'PanelAnnouncemnet',

  components: {
    BlurCard,
    ContentLoader,
    EmptyMessage,
    FlagFixed,
    Icon,
    Skeleton,
    TextReduce,
  },

  props: {
    hideIfEmpty: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      announcements: [],
      isLoading: false,
      flagTitle: 'global:flag.fixed.announcement',
      flagIcon: 'pin',
    }
  },

  computed: {
    isHidePanel() {
      return this.hideIfEmpty && !this.announcements.length
    },
  },

  created() {
    this.setup()
  },

  methods: {
    ...mapActions(['attemptClassroomDashboardAnnouncementsRetrieval']),

    setup() {
      this.isLoading = true
      this.attemptClassroomDashboardAnnouncementsRetrieval({
        sessionUuid: this.$route.params.session_uuid,
        params: {
          limit: 999,
        },
      })
        .then(({ data }) => {
          this.announcements = data
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    format,
    parseISO,
  },
})
</script>

<template>
  <div
    v-if="!isHidePanel"
    :data-testid="$testId('classroom-announcements')"
    class="announcements__wrapper"
  >
    <h3 class="section-title">{{ $t('classroom.panel:tab.link.2') }}</h3>
    <BlurCard
      v-if="!isLoading"
      class="announcements"
      hide-scrollbar
    >
      <div
        v-for="announcement in announcements"
        :key="announcement.id"
        :class="{ announcements__card: true, 'card-fixed': announcement.fixed }"
      >
        <FlagFixed
          v-if="announcement.fixed"
          :flag-icon="flagIcon"
          :flag-title="flagTitle"
        />

        <div class="announcements__card__header">
          <div class="announcements__card__profile">
            <img
              v-if="announcement.author.image"
              :src="announcement.author.image"
              :alt="announcement.author.name"
            />
            <Icon
              v-else
              name="account_circle"
            />
            <div>
              <span>{{
                announcement.author.position === 'Admin'
                  ? $t('global:admin')
                  : !announcement.author.position
                  ? $t('classroom.panel.announcements:used.removed')
                  : announcement.author.position
              }}</span>
              <TextReduce
                text-type
                :lenght-text="30"
                :text="
                  !announcement.author.name
                    ? $t('classroom.panel.announcements:used.removed')
                    : announcement.author.name
                "
              />
            </div>
          </div>
          <div class="announcements__card__date">
            {{
              $t('classroom.panel.announcements:card.closed.date', {
                date: format(parseISO(announcement.availability.endTime), 'dd/MM/yyyy'),
              })
            }}
          </div>
        </div>

        <div class="announcements__card__body">
          <h2>{{ announcement.title }}</h2>
          <div class="announcements__card__body__content" v-html="announcement.content"></div>
        </div>
      </div>

      <EmptyMessage v-if="announcements.length === 0 && !isLoading">
        <h2>{{ $t('classroom.panel.announcements:empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.panel.announcements:empty.message') }}</p>
      </EmptyMessage>
    </BlurCard>

    <Skeleton
      v-if="isLoading"
      :columns="1"
      :colored="false"
    >
      <ContentLoader :speed="2">
        <rect
          width="100%"
          height="120"
        />
      </ContentLoader>
    </Skeleton>
  </div>
</template>

<style lang="scss">
@import 'PanelAnnouncement.scss';
</style>
