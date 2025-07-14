<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import CalendarEventDetail from '@/components/general/Calendar/CalendarEventDetail'
import CalendarEventModal from '@/components/general/Calendar/CalendarEventModal'

import { eventMixin } from '@/mixins/eventMixin'
import conferenceMixin from '@/mixins/conferenceMixin'

export default defineComponent({
  name: 'PanelEventCard',

  components: {
    Action,
    CalendarEventDetail,
    CalendarEventModal,
  },

  mixins: [eventMixin, conferenceMixin],

  props: {
    events: {
      type: Array,
      default: () => [],
    },

    emptyTitle: {
      type: String,
      default: null,
    },

    showParticipate: {
      type: Boolean,
      default: false,
    },

    readOnly: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      eventModalDetail: null,
      eventModal: false,
      modalAddEvent: false,
      addParamsModal: {},
    }
  },

  methods: {
    getDateMonthHour(date) {
      return this.formatDate(date, 'shortDayMonthTime')
    },
    isDarkClass(color) {
      const isDark = ['#E64848', '#350756', '#01AFAA', '#5C2E91']
      return isDark.indexOf(color) > -1
    },
    accessConferenceRoom(conferenceRoomId) {
      const sessionUuid = this.$route.params.session_uuid
      this.openConference(sessionUuid, conferenceRoomId, { type: 'live' })
    },
    openEvent(event, eventClick) {
      const {
        ownerName,
        ownerImage,
        ownerProfile: { name: profile },
        isOwner,
        event: {
          title,
          period: { initial, final },
          color,
          description,
          allUsers,
          conferenceRoom,
          topic,
          id,
        },
      } = event

      this.eventModalDetail = {
        author: {
          name: ownerName,
          image: ownerImage,
          profile,
        },
        id,
        title,
        startDate: initial,
        endDate: final,
        color,
        description,
        isOwner,
        allUsers,
        conferenceRoom,
        topic,
        dropdown: false,
      }
      this.eventModal = true
      this.$refs.modal.$el.style.top = `${
        eventClick.target.getBoundingClientRect().top -
        this.$refs.eventPanel.getBoundingClientRect().top -
        8
      }px`
      if (this.$media.mobile) {
        this.$refs.modal.$el.style.right = '0';
        this.$refs.modal.$el.style.maxWidth = '100%';
      } else {
        this.$refs.modal.$el.style.left = `${
          eventClick.target.getBoundingClientRect().left -
          this.$refs.eventPanel.getBoundingClientRect().left -
          136
        }px`
      }
    },
    closeEventModal() {
      this.eventModal = false
    },
    getEventColor(event) {
      if (!event) return '#fff'
      else return event.color
    },
    enableGuests(value) {
      this.formData.enableGuests = !value
    },
    updateEvents() {
      this.$emit('update-events')
    },
  },
})
</script>

<template>
  <div
    v-if="events.length"
    ref="eventPanel"
    class="panel-card-event"
  >
    <div
      v-for="(eventItem, index) in events"
      :key="index"
      :style="`background-color:${eventItem.event.color}; --event-color:${eventItem.event.color}`"
      :class="{ dark: isDarkClass(eventItem.event.color) }"
      class="panel-card-event__item"
    >
      <h3
        class="panel-card-event__title"
        @click.stop="openEvent(eventItem, $event)"
      >
        {{ eventItem.event.title }}
      </h3>

      <div class="clearfix">
        <span class="panel-card-event__date">{{
          getDateMonthHour(eventItem.event.period.initial)
        }}</span>
        <span class="panel-card-event__date">{{
          getDateMonthHour(eventItem.event.period.final)
        }}</span>
        <div>
          <Action
            v-if="showParticipate && eventItem.event.conferenceRoom"
            type="button"
            :text="$t('global:participate')"
            flat
            @click="accessConferenceRoom(eventItem.event.conferenceRoom.id)"
          />
        </div>
      </div>
    </div>

    <CalendarEventDetail
      v-show="eventModal"
      ref="modal"
      v-click-outside="closeEventModal"
      :style="{ borderColor: getEventColor(eventModalDetail) }"
      :event-details="eventModalDetail"
      :close-event-modal="closeEventModal"
      :read-only="readOnly"
      @updateEvent="editEvent"
      @removeEvent="deleteEvent"
    />

    <CalendarEventModal
      v-if="modalAddEvent"
      :session-uuid="sessionUuid"
      :params="addParamsModal"
      :full-permission="fullPermission"
      @close="closeModalAddEvent"
      @events-update="updateEvents"
    />
  </div>

  <div v-else>
    <div class="panel-card-event panel-card-event__empty">
      <p class="panel-card-empty-title">{{ emptyTitle }}</p>
    </div>
  </div>
</template>

<style lang="scss">
@import 'PanelEventCard.scss';
</style>
