<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { format, parseISO } from 'date-fns'
import BlurCard from '@/components/general/BlurCard'
import Icon from '@/components/general/Icon'
import Action from '@/components/general/Action'

export default defineComponent({
  name: 'PanelMessages',

  components: {
    BlurCard,
    Icon,
    Action,
  },

  data() {
    return {
      messages: [],
      isLoading: false,
    }
  },

  computed: {
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },

  created() {
    this.setup()
  },

  methods: {
    ...mapActions(['attemptMessagesRetrieval']),

    setup() {
      this.isLoading = true
      let sessionUuid = this.$route.params.session_uuid

      this.attemptMessagesRetrieval({ sessionUuid, statusAlias: 'received' })
        .then(({ data }) => {
          this.messages = []
          if (data.data.length) {
            this.messages = data.data.map((item) => {
              return {
                id: item.message.id,
                interaction_id: item.id,
                selected: false,
                author: item.message.userData.name,
                profile:
                  item.authorProfile.name === 'Admin'
                    ? this.$t('global:admin')
                    : item.authorProfile.name,
                title: item.message.subject,
                body: item.message.body,
                attachment: item.message.attachments.attachments.length > 0,
                conversationLength: item.relatedInteractions
                  ? item.relatedInteractions.length + 1
                  : null,
                starred: item.bookmarked,
                date: item.creationTime,
                unread: !item.seenAt && !item.isOwner,
              }
            })
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    pushToInbox() {
      this.$router.push({
        name: 'classroom.messages.inbox',
        params: { session_uuid: this.sessionUuid },
      })
    },

    format,
    parseISO,
  },
})
</script>

<template>
  <div
    v-if="messages.length"
    :data-testid="$testId('classroom-announcements')"
    class="messages__wrapper"
  >
    <h3 class="section-title">{{ $t('global:menu.classroom.messages') }}</h3>
    <BlurCard
      v-if="!isLoading"
      class="announcements"
      hide-scrollbar
      max-height="360px"
    >
      <div
        v-for="message in messages.slice(0, $media.mobile ? 3 : 12)"
        :key="message.id"
        class="messages__card"
        @click="
          $router.push({
            name: 'classroom.messages.view',
            params: {
              type: 'inbox',
              session_uuid: sessionUuid,
              interaction_id: message.interaction_id,
            },
          })
        "
      >
        <div class="messages__card__header">
          <div class="messages__card__profile">
            <p v-if="message.profile !== 'Student'">
              {{ message.author + ' | ' + message.profile }}
            </p>
            <p v-else>
              {{ message.author }}
            </p>
          </div>
          <div class="messages__card__date">
            {{ formatDate(message.date, 'long') }}
          </div>
        </div>

        <div class="messages__card__body">
          <h2>{{ message.title }}</h2>
          <div class="message__card__attachment">
            <Icon
              v-if="message.attachment"
              name="attach_file"
            />
          </div>
        </div>
      </div>
      <Action
        v-if="$media.mobile && messages.length > 3"
        type="button"
        :text="$t('global:view.all')"
        flat
        @click="pushToInbox"
      />
    </BlurCard>
  </div>
</template>

<style lang="scss">
@import 'PanelMessages.scss';
</style>
