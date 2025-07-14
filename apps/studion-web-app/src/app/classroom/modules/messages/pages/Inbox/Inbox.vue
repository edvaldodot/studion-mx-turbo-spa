<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Icon from '@/components/general/Icon'
import Pagination from '@/components/general/Pagination'

export default {
  name: 'classroomMessages',
  components: {
    Action,
    Checkbox,
    Datatable,
    EmptyMessage,
    FilterList,
    Icon,
    Pagination,
  },

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },
  beforeRouteUpdate(to, from, next) {
    if (to.name === 'classroom.messages.inbox') {
      this.queryParams.page = 1
      this.loadMessages()
    }
    next()
  },

  data() {
    return {
      timer: null,
      tabLinks: [
        {
          text: 'classroom.messages:tab.link.1',
          location: {
            name: 'classroom.messages.inbox',
          },
        },
        {
          text: 'classroom.messages:tab.link.2',
          location: {
            name: 'classroom.messages.sent',
          },
        },
        {
          text: 'classroom.messages:tab.link.3',
          location: {
            name: 'classroom.messages.draft',
          },
        },
        {
          text: 'classroom.messages:tab.link.4',
          location: {
            name: 'classroom.messages.trash',
          },
        },
      ],
      items: [],
      checkboxList: [],
      paging: { actualPage: 1 },
      queryParams: {
        page: 1,
      },
      isScreenSmall: false,
    }
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility', 'fetching']),
    hasWriteAccess() {
      return this.canWrite('classroom:message')
    },
  },

  watch: {
    'queryParams.page'() {
      this.loadMessages()
    },
  },

  created() {
    this.loadItemsPerPagePreferences(this.queryParams)
    this.buildPage()
    this.$emit('change-header', {
      tabLinks: this.tabLinks,
      customClasses: { messages: true },
    })
  },

  mounted() {
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize)
  },

  destroyed() {
    clearTimeout(this.timer)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptMessagesRetrieval',
      'attemptBookmarkMessage',
      'attemptInteractionTrash',
    ]),
    changeItemsPerPage(val) {
      this.queryParams.limit = val
      if (this.queryParams.page !== 1) {
        this.queryParams.page = 1
        return
      }
      this.loadMessages()
    },
    setStarred(item, index) {
      let sessionUuid = this.$route.params.session_uuid
      this.attemptBookmarkMessage({ sessionUuid, interactionId: item.interaction_id }).then(() => {
        this.items[index].starred = !this.items[index].starred
      })
    },
    clickRow($event, { item }) {
      this.$router.push({
        name: 'classroom.messages.view',
        params: {
          session_uuid: this.$route.params.session_uuid,
          interaction_id: item.interaction_id,
          type: 'inbox',
        },
      })
    },
    parseSenders(item) {
      let authors = []
      if (item.relatedInteractions) {
        item.relatedInteractions.map((itemRelated) => {
          if (authors.indexOf(itemRelated.message.userData.name) < 0) {
            authors.push(itemRelated.message.userData.name)
          }
        })
      }
      authors.push(item.message.userData.name)
      return authors.join(', ')
    },
    trashMessages() {
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)
      this.attemptInteractionTrash({ sessionUuid, action: 'trash', data: this.checkboxList })
        .then(() => {
          this.checkboxList = []
          this.queryParams.page = 1
          this.loadMessages()
          this.setFeedback({
            message: this.$t('classroom.messages.inbox:feedback.move.trash.success'),
          })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.messages.inbox:feedback.move.trash.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    addList(add, id) {
      add ? this.checkboxList.push(id) : this.checkboxList.splice(this.checkboxList.indexOf(id), 1)
    },
    nextPage() {
      if (this.paging.nextPage) {
        this.queryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.queryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.queryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.queryParams.page = this.paging.firstPage
      }
    },
    loadMessages(noFetching = false) {
      let sessionUuid = this.$route.params.session_uuid

      this.setFetching(!noFetching)
      this.attemptMessagesRetrieval({
        sessionUuid,
        statusAlias: 'received',
        queryParams: this.queryParams,
      })
        .then(({ data }) => {
          this.items = []
          this.paging = data
          if (data.data.length) {
            this.items = data.data.map((item) => {
              let date = null
              try {
                date = this.formatDate(item.creationTime, 'long')
              } catch (e) {
                date = item.creationTime
              }
              return {
                id: item.message.id,
                interaction_id: item.id,
                selected: false,
                author: item.message.userData.name,
                title: item.message.subject,
                attachment: item.message.attachments.attachments.length > 0,
                conversationLength: item.relatedInteractions
                  ? item.relatedInteractions.length + 1
                  : null,
                starred: item.bookmarked,
                date: date,
                unread: !item.seenAt && !item.isOwner,
                senders: this.parseSenders(item),
                profile: item.authorProfile.name != 'Student' ? item.authorProfile.name : '',
              }
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
      this.timer = setTimeout(() => {
        this.loadMessages(true)
      }, 30000)
    },
    buildPage() {
      this.loadMessages()
    },
    checkScreenSize() {
      this.isScreenSmall = window.innerWidth < 370
    },
  },
}
</script>

<template>
  <div class="inner-content m-4">
    <div class="py-4">
      <FilterList>
        <Action
          v-if="hasWriteAccess"
          slot="button"
          :text="$t('classroom.messages:btn.add')"
          :url="{
            params: { session_uuid: $route.params.session_uuid },
            name: 'classroom.messages.new',
          }"
          :dark="accessibility"
          primary
          large
          fixed-width
        />
      </FilterList>
    </div>

    <EmptyMessage v-if="!fetching && items.length === 0">
      <h2>{{ $t('classroom.messages.inbox:empty.title') }}</h2>
      <p v-if="$t('classroom.messages.inbox:empty.message')">
        {{ $t('classroom.messages.inbox:empty.message') }}
      </p>
    </EmptyMessage>

    <div
      v-if="items.length"
      class="center"
    >
      <Datatable
        :items="items"
        :dark="accessibility"
      >
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th
              class="th"
              width="60"
            ></th>
            <th
              class="th"
              width="240"
            ></th>
            <th
              class="th"
              width="150"
            ></th>
            <th class="th"></th>
            <th
              class="th"
              width="80"
            ></th>
            <th
              class="th-buttons"
              width="190"
            >
              <Action
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
                icon="delete"
                type="button"
                @click="trashMessages()"
              />
            </th>
          </tr>
          <tr v-else>
            <th class="th-buttons">
              <Action
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
                icon="delete"
                type="button"
                @click="trashMessages()"
              />
            </th>
            <th class="th"></th>
          </tr>
        </template>

        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr
            v-if="!$media.mobile"
            :class="{ 'is-unread': props.item.unread }"
            @click="clickRow($event, props)"
          >
            <td class="td text-center">
              <Checkbox
                v-if="hasWriteAccess"
                v-model="props.item.selected"
                :items="[{ value: true }]"
                @input="addList($event, props.item.interaction_id)"
              />
            </td>
            <td class="td">
              <span class="td-text">
                <span
                  class="td-message-recipient"
                  :class="{ bolder: props.item.unread }"
                  :title="props.item.senders"
                  >{{ props.item.senders }}</span
                >
                <span
                  v-if="props.item.conversationLength"
                  class="td-message-recipient-length"
                  >({{ props.item.conversationLength }})</span
                >
              </span>
            </td>
            <td class="td">
              <span
                v-shave="{ height: 40 }"
                class="td-text td-message-title"
                :class="{ bolder: props.item.unread }"
                :title="props.item.title"
              >
                {{ props.item.profile === 'Admin' ? $t('global:admin') : props.item.profile }}
              </span>
            </td>
            <td class="td">
              <span
                v-shave="{ height: 40 }"
                class="td-text td-message-title"
                :class="{ bolder: props.item.unread }"
                :title="props.item.title"
              >
                {{ props.item.title }}
              </span>
            </td>

            <td class="td text-right">
              <Icon
                v-if="props.item.attachment"
                size="medium"
                name="attach_file"
                wrapper
              />
            </td>
            <td class="td">
              <span class="td-message-date text-base">{{ props.item.date }}</span>
            </td>
          </tr>
          <tr
            v-else
            class="tr-message"
            :class="{ 'is-unread': props.item.unread }"
            @click="clickRow($event, props)"
          >
            <td
              class="td"
              height="60"
              colspan="2"
            >
              <div class="td-wrapper">
                <Checkbox
                  v-if="hasWriteAccess"
                  v-model="props.item.selected"
                  class="tr-message-checkbox"
                  :items="[{ value: true }]"
                  @input="addList($event, props.item.interaction_id)"
                />
                <p class="tr-message-author">
                  {{ props.item.author }}
                  <span v-if="props.item.conversationLength">
                    ({{ props.item.conversationLength }})
                  </span>
                  <span v-if="!isScreenSmall">
                    {{ props.item.profile === 'Admin' ? $t('global:admin') : props.item.profile }}
                  </span>
                </p>
                <span
                  v-if="isScreenSmall"
                  class="tr-message-author"
                >
                  {{ props.item.profile === 'Admin' ? $t('global:admin') : props.item.profile }}
                </span>
                <span class="tr-message-title">{{ props.item.title }}</span>
                <Icon
                  v-if="props.item.attachment"
                  class="tr-message-attachment"
                  name="attach_file"
                  wrapper
                  size="medium"
                />
                <span class="tr-message-date">{{ props.item.date }}</span>
              </div>
            </td>
          </tr>
        </template>
      </Datatable>

      <pagination
        :active-page="paging.actualPage"
        :page-count="paging.lastPage"
        @next-page="nextPage"
        @previous-page="previousPage"
        @first-page="firstPage"
        @last-page="lastPage"
        @go-to-page="queryParams.page = $event"
        @change-items-per-page="changeItemsPerPage"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/messages/styles.scss';
</style>
