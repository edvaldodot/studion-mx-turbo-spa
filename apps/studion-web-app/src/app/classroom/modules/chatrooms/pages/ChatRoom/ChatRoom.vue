<script>
import { mapState, mapActions } from 'vuex'
import Action from '@/components/general/Action'
import AppTimer from '@/components/general/AppTimer'
import ModalInformation from '@/components/general/ModalInformation'

export default {
  name: 'ChatRoom',
  components: {
    Action,
    AppTimer,
    ModalInformation,
  },
  data () {
    return {
      chatroom: null,
      chatEnded: false,
      showTimer: false,
      viewMore: false,
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    contentTitle () {
      return this.chatroom ? this.chatroom.name : ''
    },
    contentDescription () {
      return this.chatroom ? this.chatroom.meta.description : ''
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptChatroomAccess'
    ]),
    goBack () {
      if (this.$route.params.management) {
        this.$router.push({ name: this.$route.params.management })
        return
      }
      this.$router.push({
        name: 'classroom.chat',
        params: {
          session_uuid: this.$route.params.session_uuid
        }
      })
    },
    authenticateOnVendor (e) {
      switch (this.Classroom.data.chat.vendor) {
        case 'rocketchat':
          window.addEventListener('message', (e) => {
            if (e.data.eventName === 'startup') {
              document.querySelector('iframe').contentWindow.postMessage({
                externalCommand: 'login-with-token',
                token: this.chatroom.authToken
              }, '*')
            }
            if (e.data.eventName === 'room-opened') {
              this.setFetching(false)
            }
          })
          break
      }
    },
    loadChatroom () {
      this.setFetching(true)
      const sessionUuid = this.$route.params.session_uuid
      const chatroomId = this.$route.params.chatroom_id

      this.attemptChatroomAccess({ sessionUuid, chatroomId })
        .then((response) => {
          this.chatroom = response.data

          if (!response.data.showTimeLeft || response.data.schedulePeriod.hasEnded) {
            return
          }

          this.showTimer = true

          const milliseconds =
            new Date(response.data.schedulePeriod.end).getTime() - new Date().getTime()

          this.$refs.timer.setTime(Math.round(milliseconds / 1000))
          this.$refs.timer.startTimer()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    toggleViewMore () {
      this.viewMore = !this.viewMore
    },
    showViewMore () {
      return (this.contentDescription.length > 80 && this.$media.mobile) || this.contentDescription.length > 200
    }
  },
  created () {
    this.$emit('change-header', {
      customClasses: {'chatroom': true}
    })

    this.loadChatroom()
  },
  beforeRouteLeave (to, from, next) {
    this.$emit('change-header', {})
    next()
  }
}
</script>

<template>
  <div class="inner-content">
    <div class="chatroom-wrapper">
      <div class="chatroom-bar">
        <div class="chatroom-bar-info">
          <div v-if="$route.params.management">
            <Action
              :text="$t('management:back.to.management')"
              icon="keyboard_backspace"
              icon-size="small"
              type="button"
              flat
              @click="goBack()"
            />
          </div>

          <div
            v-else
            class="chatroom-bar-controls"
          >
            <Action
              :dark="accessibility"
              icon="keyboard_backspace"
              type="button"
              class="btn-prev"
              flat
              @click="goBack()"
            />
          </div>

          <div class="chatroom-info">
            <h2 class="chatroom-info-title">{{ contentTitle }}</h2>

            <p
              v-if="contentDescription"
              class="chatroom-info-description"
              :class="{
                '--open': viewMore,
                '--show-btn': showViewMore(),
              }"
            >
              {{ contentDescription }}
            </p>

            <Action
              v-if="showViewMore()"
              :text="viewMore ? $t('global:view.less') : $t('global:view.more')"
              type="button"
              class="btn-view-more"
              @click="toggleViewMore()"
            />
          </div>
        </div>

        <div
          v-show="showTimer"
          class="chat__timer bg-black-100 border-black-500"
        >
          <AppTimer
            ref="timer"
            :title="$t('chatroom:timer.label')"
            if-has-days-show-only
            @end="chatEnded = true"
          />
        </div>
      </div>

      <ModalInformation
        v-if="chatEnded"
        width="582px"
        class="end-chat__modal"
        active
        closable
        is-page
        @close="goBack"
      >
        <template #title>
          {{ $t('chatroom:end.time.modal.title') }}
        </template>

        <template #content>
          <p class="text-color">
            {{ $t('chatroom:end.time.modal.content') }}
          </p>
        </template>

        <template #actions>
          <Action
            :text="$t('global:continue')"
            :dark="accessibility"
            type="button"
            secondary
            large
            @click="goBack"
          />
        </template>
      </ModalInformation>

      <div class="chatroom-content">
        <iframe
          v-if="chatroom"
          ref="iframe"
          :src="chatroom.url"
          frameborder="0"
          class="iframe-chatroom"
          mozallowfullscreen
          webkitallowfullscreen
          allowfullscreen
          @load="authenticateOnVendor"
        >
        </iframe>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "~@/app/classroom/modules/chatrooms/styles.scss";
</style>
