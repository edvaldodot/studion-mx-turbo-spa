<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Icon from '@/components/general/Icon'
import Pagination from '@/components/general/Pagination'

export default defineComponent({
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
    if (to.name === 'classroom.messages.sent') {
      this.queryParams.page = 1
      this.loadMessages()
    }
    next()
  },

  data() {
    return {
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
      paging: {
        actualPage: 1,
      },
      queryParams: {
        page: 1,
      },
    }
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
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
    setTimeout(() => this.buildPage(), 100)
    this.$emit('change-header', {
      tabLinks: this.tabLinks,
      customClasses: { messages: true },
    })
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
    setBookmark(index, item) {
      let sessionUuid = this.$route.params.session_uuid
      this.attemptBookmarkMessage({ sessionUuid, interactionId: item.interaction_id }).then(() => {
        this.items[index].bookmarked = !this.items[index].bookmarked
      })
    },
    clickRow($event, { item }) {
      this.$router.push({
        params: {
          session_uuid: this.$route.params.session_uuid,
          interaction_id: item.interaction_id,
          type: 'sent',
        },
        name: 'classroom.messages.view',
      })
    },
    showRecipients(filters) {
      let data = filters.map((filter) => {
        return filter.name
      })
      return data.join(', ')
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
            message: this.$t('classroom.messages.sent:feedback.move.trash.success'),
          })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.messages.sent:feedback.move.trash.error'),
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
    loadMessages() {
      let sessionUuid = this.$route.params.session_uuid

      this.setFetching(true)
      this.attemptMessagesRetrieval({
        sessionUuid,
        statusAlias: 'sent',
        queryParams: this.queryParams,
      })
        .then(({ data }) => {
          this.items = []
          this.paging = data
          if (data.data.length) {
            this.items = data.data.map((item) => {
              return {
                id: item.message.id,
                interaction_id: item.id,
                selected: false,
                author: item.message.userData.name,
                filters: item.message.filters.filters,
                title: item.message.subject,
                status: item.message.status,
                bookmarked: item.bookmarked,
                attachment: item.message.attachments.attachments.length > 0,
                conversationLength: item.relatedInteractions.length
                  ? item.relatedInteractions.length + 1
                  : null,
                date: this.formatDate(item.creationTime, 'long'),
                dateScheduled: item.message.scheduledTime
                  ? this.formatDate(item.message.scheduledTime, 'long')
                  : null,
                unread: !item.message.seenAt,
              }
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    buildPage() {
      this.loadMessages()
    },
  },
})
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
          primary
          large
          fixed-width
          :dark="accessibility"
        />
      </FilterList>
    </div>

    <EmptyMessage v-if="items.length === 0">
      <h2>{{ $t('classroom.messages.sent:empty.title') }}</h2>
      <p v-if="$t('classroom.messages.sent:empty.message')">
        {{ $t('classroom.messages.sent:empty.message') }}
      </p>
    </EmptyMessage>

    <div
      v-if="items.length"
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
            <th class="th"></th>
            <th class="th-buttons">
              <Action
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
                icon="delete"
                type="button"
                @click="trashMessages()"
              />
            </th>
          </tr>
        </template>

        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr
            v-if="!$media.mobile"
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
                  :title="showRecipients(props.item.filters)"
                >
                  {{ showRecipients(props.item.filters) }}
                </span>
                <span
                  v-if="props.item.conversationLength"
                  class="td-message-recipient-length"
                >
                  ({{ props.item.conversationLength }})
                </span>
              </span>
            </td>
            <td class="td">
              <span
                v-shave="{ height: 40 }"
                class="td-text td-message-title"
                :title="props.item.title"
              >
                {{ props.item.title }}
              </span>
            </td>
            <td class="td text-right">
              <Icon
                v-if="props.item.attachment"
                name="attach_file"
                size="medium"
                wrapper
              />
            </td>
            <td class="td">
              <span
                v-if="props.item.status.scheduled && props.item.dateScheduled != null"
                class="td-message-scheduled text-base"
              >
                {{ $t('classroom.messages:scheduled') }}
              </span>
              <span class="td-message-date text-base">
                {{ props.item.dateScheduled != null ? props.item.dateScheduled : props.item.date }}
              </span>
            </td>
          </tr>
          <tr
            v-else
            class="tr-message"
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
                <p
                  class="tr-message-author"
                  :title="showRecipients(props.item.filters)"
                >
                  {{ showRecipients(props.item.filters) }}
                  <span v-if="props.item.conversationLength">
                    ({{ props.item.conversationLength }})
                  </span>
                </p>
                <span class="tr-message-title">{{ props.item.title }}</span>
                <Icon
                  v-if="props.item.attachment"
                  class="tr-message-attachment"
                  name="attach_file"
                  size="medium"
                  wrapper
                />
                <span class="tr-message-date">{{ props.item.date }}</span>
              </div>
            </td>
          </tr>
        </template>
      </Datatable>

      <Pagination
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
