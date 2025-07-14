<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { isBefore, isAfter, parseISO, subMinutes } from 'date-fns'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Icon from '@/components/general/Icon'
import Carousel from '@/components/general/Carousel'

import conferenceMixin from '@/mixins/conferenceMixin'

export default defineComponent({
  name: 'DashboardConferences',

  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    Icon,
    Carousel,
  },

  mixins: [conferenceMixin],

  data() {
    return {
      dailyConferences: [],
      isLoaded: false,
      page: 0,
    }
  },

  created() {
    this.setup()
  },

  methods: {
    ...mapActions(['attemptGetDailyConferences']),

    setup() {
      this.attemptGetDailyConferences()
        .then(({ data }) => {
          this.dailyConferences = data
        })
        .finally(() => {
          this.isLoaded = true
        })
    },

    /**
     * @param {String} sessionUuid
     * @param {Number} conferenceRoomId
     */
    access(sessionUuid, conferenceRoomId) {
      this.openConference(sessionUuid, conferenceRoomId, { type: 'live' })
    },

    /**
     * @param {String} sessionUuid
     * @param {Number} conferenceRoomId
     */
    openAttachments(sessionUuid, conferenceRoomId) {
      this.$router.push({
        name: 'classroom.conference.attachments',
        params: { id: conferenceRoomId, session_uuid: sessionUuid },
      })
    },

    /**
     * @param {String} endTime
     */
    alreadyFinished(endTime) {
      return !isBefore(Date.now(), new Date(endTime))
    },

    canParticipate(data) {
      const startTime = subMinutes(parseISO(data.start_time), data.early_access || 0)
      const hasStarted = isAfter(new Date(), startTime)

      return hasStarted && !this.alreadyFinished(data.end_time)
    },

    /**
     * @param {String} image
     */
    getImage(image) {
      return image || '/assets/images/themes/default/bkg/chat-default.jpg'
    },
  },
})
</script>

<template>
  <div
    v-if="isLoaded && dailyConferences.length"
    class="dashboard-conferences conference-container"
  >
    <h3 v-html="$t('dashboard:dashboard.conferences.title')"></h3>

    <template v-if="!$media.mobile">
      <div class="dashboard-conference-cards">
        <div
          v-for="conference in dailyConferences"
          :key="conference.conference_room_id"
          class="dashboard-conference-card"
        >
          <div class="dashboard-conference-card__image">
            <img :src="getImage(conference.image)" />
          </div>
          <div class="dashboard-conference-card__content">
            <p class="text-color">{{ conference.name }}</p>

            <div class="dashboard-conference-card__dates">
              <span>
                {{ $t('global:begin') }}:
                <b> {{ formatDate(conference.start_time, 'long') }}</b>
              </span>
              <span>
                {{ $t('global:end') }}:
                <b> {{ formatDate(conference.end_time, 'long') }}</b>
              </span>
            </div>

            <div>
              <Action
                v-if="conference.has_library_files"
                :text="$t('global:attachments.see')"
                type="button"
                flat
                @click="openAttachments(conference.session_uuid, conference.conference_room_id)"
              />

              <Action
                v-if="canParticipate(conference)"
                :text="$t('global:participate')"
                type="button"
                flat
                @click="access(conference.session_uuid, conference.conference_room_id)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <Carousel
        :navigate-to="page"
        :scroll-per-page="false"
        :speed="400"
        :items="dailyConferences"
        :page-info="false"
        :per-page="1"
        mouse-drag
        @pageChange="page = $event"
      >
        <template #default="props">
          <Card
            :height="280"
            rounded
          >
            <CardImage
              :src="getImage(props.item.image)"
              height="180"
              overlay
              use-img
            />

            <CardBody>
              <h2 class="card-title">
                {{ props.item.name }}
              </h2>

              <div class="card-time">
                <div class="card-time__range">
                  <Icon
                    size="small"
                    name="calendar-range"
                    wrapper
                  />
                  <div>
                    <h4>{{ $t('global:begin') }}</h4>
                    <p class="text-color">
                      <b>{{ formatDate(props.item.start_time, 'long') }}</b>
                    </p>
                  </div>
                </div>
                <div class="card-time__range">
                  <Icon
                    size="small"
                    name="calendar-range"
                    wrapper
                  />
                  <div>
                    <h4>{{ $t('global:end') }}</h4>
                    <p class="text-color">
                      <b>{{ formatDate(props.item.end_time, 'long') }}</b>
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>

            <CardActions>
              <Action
                v-if="props.item.has_library_files"
                :text="$t('global:attachments.see')"
                type="button"
                flat
                @click="openAttachments(props.item.session_uuid, props.item.conference_room_id)"
              />
              <Action
                v-if="canParticipate(props.item)"
                :text="$t('global:participate')"
                type="button"
                flat
                @click="access(props.item.session_uuid, props.item.conference_room_id)"
              />
            </CardActions>
          </Card>
        </template>
      </Carousel>
    </template>
  </div>
</template>

<style lang="scss">
@import './DashboardConferences.scss';
</style>