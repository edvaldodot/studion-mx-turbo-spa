<script>
import { format } from 'date-fns'
import { mapState } from 'vuex'
import Action from '../../Action'
import Icon from '../../Icon'

import conferenceMixin from '@/mixins/conferenceMixin'

export default {
  name: 'CalendarEventDetail',
  components: {
    Action,
    Icon,
  },
  mixins: [conferenceMixin],
  props: {
    eventDetails: {
      type: Object,
      default: () => {},
    },
    closeEventModal: {
      type: Function,
      required: true,
    },
    readOnly: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState(['accessibility']),
    conferenceIsActive() {
      return (
        this.eventDetails.conferenceRoom && this.eventDetails.conferenceRoom.schedulePeriod.isActive
      )
    },
    isTopicAvailable() {
      const dateNow = new Date().toISOString()

      if (!this.eventDetails.topic) return false

      const startDateISO = new Date(this.eventDetails.startDate).toISOString()
      const endDateISO = new Date(this.eventDetails.endDate).toISOString()

      return dateNow > startDateISO && dateNow < endDateISO
    },
  },
  methods: {
    updateEvent() {
      this.$emit('updateEvent', this.eventDetails.id)
    },
    removeEvent() {
      this.$emit('removeEvent', this.eventDetails.id)
    },
    /**
     * Get the conference url and open it in a new tab
     * @param {Number} conferenceRoomId
     */
    accessConferenceRoom(conferenceRoomId) {
      const sessionUuid = this.$route.params.session_uuid
      this.openConference(sessionUuid, conferenceRoomId, { type: 'live' })
    },
    /**
     * Redirect to topic
     * @param {Object} topic
     */
    accessTopic(topic) {
      const sessionUuid = this.$route.params.session_uuid

      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          session_uuid: sessionUuid,
          type: topic.type,
          type_id: topic.id,
        },
      })
    },
    format(date, formatType) {
      return format(new Date(date), formatType)
    },
  },
}
</script>

<template>
  <div class="calendar-event-modal">
    <template v-if="eventDetails">
      <div class="calendar-event-modal-content">
        <action
          type="button"
          icon="close"
          icon-size="medium"
          class="calendar-event-modal-close"
          @click="closeEventModal"
        />

        <div class="calendar-event-modal-title-content">
          <h4 class="calendar-event-modal-title">{{ eventDetails.title }}</h4>
        </div>

        <div class="calendar-event-modal-infos">
          <div class="calendar-event-modal-author">
            <div class="calendar-event-modal-author-image">
              <img
                v-if="eventDetails.author.image"
                :src="eventDetails.author.image"
                :alt="eventDetails.author.name"
              />
              <Icon
                v-else
                class="calendar-event-modal-author-image-icon"
                name="account_circle"
              />
            </div>
            <div class="calendar-event-modal-author-profile">
              <div class="calendar-event-modal-author-profile-type">
                {{ eventDetails.author.profile }}
              </div>
              <div class="calendar-event-modal-author-profile-name">
                {{ eventDetails.author.name }}
              </div>
            </div>
          </div>

          <div class="calendar-event-modal-date">
            <div>{{ format(eventDetails.startDate, 'dd/MM/yyyy HH:mm') }}</div>
            <div>{{ format(eventDetails.endDate, 'dd/MM/yyyy HH:mm') }}</div>
          </div>
        </div>

        <div
          v-if="!eventDetails.conferenceRoom && eventDetails.description"
          class="calendar-event-modal-description"
          v-html="eventDetails.description"
        ></div>
      </div>

      <div class="calendar-event-modal-actions">
        <div v-if="!eventDetails.conferenceRoom && !eventDetails.topic">
          <Action
            v-if="eventDetails.isOwner && !readOnly"
            :text="$t('global:edit')"
            :dark="accessibility"
            type="button"
            flat
            @click="updateEvent"
          />

          <Action
            v-if="eventDetails.isOwner && !readOnly"
            type="button"
            :text="$t('global:remove')"
            flat
            :dark="accessibility"
            @click="removeEvent"
          />
        </div>

        <div>
          <Action
            v-if="conferenceIsActive"
            type="button"
            :text="$t('global:participate')"
            flat
            :dark="accessibility"
            @click="accessConferenceRoom(eventDetails.conferenceRoom.id)"
          />

          <Action
            v-if="isTopicAvailable"
            type="button"
            :text="$t('global:access')"
            flat
            :dark="accessibility"
            @click="accessTopic(eventDetails.topic)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
@import 'CalendarEventDetail.scss';
</style>
