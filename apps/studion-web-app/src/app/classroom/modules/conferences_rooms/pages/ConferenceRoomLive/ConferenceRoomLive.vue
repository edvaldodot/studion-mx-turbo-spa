<script>
import { defineComponent } from 'vue'
import { ZoomMtg } from '@zoom/meetingsdk'
import ChatbotAdapter from '@/support/adapters/ChatbotAdapter'

import config from '@/config'

const { ZOOM_SDK_KEY } = config

import { mapActions, mapState } from 'vuex'

export default defineComponent({
  name: 'ConferenceRoomLive',

  data() {
    return {
      meetingSDKElement: null,
      sdkKey: ZOOM_SDK_KEY,
      meetingId: 1,
      meetingNumber: null,
      password: null,
      meetingTitle: null,
      userName: '',
      userEmail: '',
      sessionUuid: this.$route.params.session_uuid,
    }
  },

  computed: {
    ...mapState(['Account']),
  },

  destroyed() {
    this.setFullscreen(false)
    this.showFooter()

    const elem = document.getElementById('coi-serviceworker')
    elem.parentNode.removeChild(elem)
  },

  mounted() {
    if (!window.crossOriginIsolated) {
      let coi = document.createElement('script')
      coi.setAttribute('id', 'coi-serviceworker')
      coi.setAttribute('src', '/coi-serviceworker.js')
      document.head.appendChild(coi)
    }

    ChatbotAdapter && ChatbotAdapter.hide() // hide zendesk
    this.hideFooter()
    this.setFetching(true)
    this.setFullscreen(true)
    this.meetingId = this.$route.params.id

    this.attemptConferenceRoomAccess({
      sessionUuid: this.sessionUuid,
      conferenceRoomId: this.meetingId,
      accessType: 'live',
    })
      .then(({ data }) => {
        this.userName = data.conferenceUser.firstName
        this.userEmail = data.conferenceUser.email
        this.meetingNumber = data.meetingId
        this.meetingTitle = data.name
        this.zak = data.zakToken
        if (data.password) {
          this.password = data.password
        }
        this.setFetching(false)
      })
      .catch(({ response }) => {
        this.setFeedback({
          message: this.$t(`classroom.conference:recording.error:${response.data.message}`),
        })
        setTimeout(() => {
          this.$router.push({ name: 'classroom.conference' })
        }, 5000)
      })
      .finally(() => {
        this.getSignature()
        this.stopIdleTimer(true)
      })
  },

  methods: {
    ...mapActions([
      'attemptGenerateSignature',
      'attemptConferenceRoomAccess',
      'attemptConferenceRoomRetrieval',
      'setFullscreen',
      'setFetching',
      'setFeedback',
      'hideFooter',
      'showFooter',
      'stopIdleTimer',
    ]),

    getSignature() {
      ZoomMtg.preLoadWasm()
      ZoomMtg.prepareWebSDK()

      if (this.equalsProfile('student')) {
        this.generateSignature(0)
      } else {
        this.attemptConferenceRoomRetrieval(this.$route.params.id).then(({ data }) => {
          this.generateSignature(
            data.host.userData.applicationUserId === this.Account.user.id ? 1 : 0
          )
        })
      }
    },

    generateSignature(role) {
      this.attemptGenerateSignature({
        conferenceRoomId: this.meetingId,
        role: role,
      }).then(({ data }) => {
        this.startMeeting(data)
      })
    },

    startMeeting(signature) {
      const rootElement = document.getElementById('zmmtg-root')
      const destinationElement = document.getElementById('cwatch-content__video')
      destinationElement.appendChild(rootElement)
      rootElement.style.display = 'block'

      const joinPayload = {
        meetingNumber: this.meetingNumber,
        signature: signature,
        sdkKey: this.sdkKey,
        userName: this.userName,
        userEmail: this.userEmail,
        zak: this.zak,
        error: () => {
          this.$router.push({ name: 'classroom.conference' })
        },
      }

      if (this.password) {
        joinPayload.passWord = this.password
      }

      ZoomMtg.init({
        leaveUrl: this.$router.resolve({ name: 'classroom.conference' }).href,
        leaveOnPageUnload: true,
        defaultView: 'gallery',
        enableHD: true,
        enableFullHD: true,
        disableInvite: true,
        success: async () => {
          const services = await navigator.serviceWorker.getRegistrations()
          if (!window.crossOriginIsolated && !services[0]) {
            location.reload()
          }
          ZoomMtg.join(joinPayload)
        },
        error: () => {
          this.$router.push({ name: 'classroom.conference' })
        },
      })
    },
  },
})
</script>

<template>
  <div
    class="cwatch"
    :data-testid="$testId('conference-room-live')"
  >
    <div class="cwatch-content">
      <div id="cwatch-content__video"></div>
    </div>
  </div>
</template>

<style lang="scss">
@import './ConferenceRoomLive.scss';
</style>
