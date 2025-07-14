<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { ContentLoader } from 'vue-content-loader'
import Action from '@/components/general/Action'
import PanelEventCard from './components/PanelEventCard'
import Skeleton from '@/components/general/Skeleton'

export default defineComponent({
  name: 'PanelEvent',

  components: {
    Action,
    ContentLoader,
    PanelEventCard,
    Skeleton,
  },

  props: {
    hideIfEmpty: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      todayEvents: [],
      nextEvents: [],
      isLoading: false,
      eventModal: false,
      eventModalDetail: null,
    }
  },

  computed: {
    isHidePanel() {
      return this.hideIfEmpty && !this.todayEvents.length && !this.nextEvents.length
    },

    isHideTodayEvents() {
      return this.hideIfEmpty && !this.todayEvents.length
    },

    isHideNextEvents() {
      return this.hideIfEmpty && !this.nextEvents.length
    },
  },

  created() {
    this.getEvents()
  },

  methods: {
    ...mapActions(['attemptClassroomTodayCalendarEvents', 'attemptClassroomNextCalendarEvents']),

    getEvents() {
      const payload = {
        sessionUuid: this.$route.params.session_uuid,
        limit: 5,
      }

      this.isLoading = true
      Promise.all([
        this.attemptClassroomTodayCalendarEvents(payload),
        this.attemptClassroomNextCalendarEvents(payload),
      ])
        .then(([todayEventData, nextEventData]) => {
          this.todayEvents = todayEventData.data
          this.nextEvents = nextEventData.data.filter((nE) => {
            return !this.todayEvents.some((tE) => tE.id === nE.id)
          })
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
})
</script>

<template>
  <div
    v-if="!isHidePanel"
    class="panel-event"
  >
    <h3 class="section-title">{{ $t('global:events') }}</h3>

    <div
      v-if="!isLoading"
      class="panel-event__content"
    >
      <div
        v-if="!isHideTodayEvents"
        class="event-section"
      >
        <h3>{{ $t('classroom.panel.dashboard:today.events') }}</h3>
        <PanelEventCard
          :events="todayEvents"
          @update-events="getEvents"
          :empty-title="$t('classroom.panel.dashboard:event.today.empty.title')"
          show-participate
        />
      </div>
      <div
        v-if="!isHideNextEvents"
        class="event-section"
      >
        <h3>{{ $t('classroom.panel.dashboard:next.events') }}</h3>
        <PanelEventCard
          :events="nextEvents"
          @update-events="getEvents"
          :empty-title="$t('classroom.panel.dashboard:event.empty.title')"
        />
      </div>

      <Action
        type="button"
        :text="$t('global:view.all')"
        flat
        @click="$router.push({ name: 'classroom.panel.calendar' })"
      />
    </div>

    <Skeleton
      v-else
      :columns="1"
      :colored="false"
    >
      <ContentLoader
        :speed="2"
        :height="330"
      >
        <rect
          width="100%"
          height="330"
        />
      </ContentLoader>
    </Skeleton>
  </div>
</template>

<style lang="scss">
@import 'PanelEvent.scss';
</style>
