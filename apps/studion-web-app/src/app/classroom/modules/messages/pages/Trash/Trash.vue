<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Icon from '@/components/general/Icon'
import Pagination from '@/components/general/Pagination'
import Tabs from '@/components/general/Tabs'

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
    Tabs
  },
  data () {
    return {
      tabLinks: [
        {
          text: 'classroom.messages:tab.link.1',
          location: {
            name: 'classroom.messages.inbox'
          }
        },
        {
          text: 'classroom.messages:tab.link.2',
          location: {
            name: 'classroom.messages.sent'
          }
        },
        {
          text: 'classroom.messages:tab.link.3',
          location: {
            name: 'classroom.messages.draft'
          }
        },
        {
          text: 'classroom.messages:tab.link.4',
          location: {
            name: 'classroom.messages.trash'
          }
        }
      ],
      items: [],
      checkboxList: [],
      paging: {actualPage: 1},
      queryParams: {
        page: 1,
      }
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'classroom.messages.trash') {
      this.queryParams.page = 1
      this.loadMessages()
    }
    next()
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    hasWriteAccess () {
      return this.canWrite('classroom:message')
    }
  },
  watch: {
    'queryParams.page'() {
      this.loadMessages()
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptMessagesRetrieval',
      'attemptInteractionTrash',
      'attemptDeleteMessage'
    ]),
    changeItemsPerPage(val) {
      this.queryParams.limit = val
      if (this.queryParams.page !== 1) {
        this.queryParams.page = 1
        return
      }
      this.loadMessages()
    },
    clickRow ($event, { item }) {
      this.$router.push({
        name: 'classroom.messages.view',
        params: {
          session_uuid: this.$route.params.session_uuid,
          interaction_id: item.interaction_id,
          type: 'trash'
        }
      })
    },
    recover () {
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)
      this.attemptInteractionTrash({ sessionUuid, action: 'recover', data: this.checkboxList })
        .then(() => {
          this.checkboxList = []
          this.setFetching(false)
          this.queryParams.page = 1
          this.loadMessages()
        }).finally(() => {
          this.setFetching(false)
        })
    },
    deleteMessages () {
      return this.delete(this.checkboxList)
    },
    deleteItem (item) {
      return this.delete([item.interaction_id])
    },
    delete (data) {
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)
      this.attemptDeleteMessage({ sessionUuid, interactions: data })
        .then(() => {
          this.setFetching(false)
          this.checkboxList = []
          this.queryParams.page = 1
          this.loadMessages()
          this.setFeedback({ message: this.$t('classroom.messages.trash:feedback.remove.success') })
        }).catch(() => {
          this.setFeedback({ message: this.$t('classroom.messages.trash:feedback.remove.error'), type: 'error' })
        }).finally(() => {
          this.setFetching(false)
        })
    },
    addList (add, id) {
      add ? this.checkboxList.push(id) : this.checkboxList.splice(this.checkboxList.indexOf(id), 1)
    },
    nextPage () {
      if (this.paging.nextPage) {
        this.queryParams.page = this.paging.nextPage
      }
    },
    previousPage () {
      if (this.paging.previousPage) {
        this.queryParams.page = this.paging.previousPage
      }
    },
    lastPage () {
      if (this.paging.lastPage) {
        this.queryParams.page = this.paging.lastPage
      }
    },
    firstPage () {
      if (this.paging.firstPage) {
        this.queryParams.page = this.paging.firstPage
      }
    },
    loadMessages () {
      let sessionUuid = this.$route.params.session_uuid

      this.setFetching(true)
      this.attemptMessagesRetrieval({ sessionUuid, statusAlias: 'garbage', queryParams: this.queryParams })
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
                title: item.message.subject,
                attachment: item.message.attachments.attachments.length > 0,
                conversationLength: item.relatedInteractions ? item.relatedInteractions.length + 1 : null,
                starred: false,
                date: this.formatDate(item.creationTime, 'long'),
                unread: !item.seenAt
              }
            })
          }
        }).finally(() => {
          this.setFetching(false)
        })
    },
    buildPage () {
      this.loadMessages()
    }
  },
  created () {
    this.loadItemsPerPagePreferences(this.queryParams)
    setTimeout(() => this.buildPage(), 100)
    this.$emit('change-header', {
      tabLinks: this.tabLinks,
      customClasses: {messages: true}
    })
  },
  beforeRouteLeave (to, from, next) {
    this.$emit('change-header', {})
    next()
  }
}
</script>

<template>
  <div class="inner-content m-4">
    <div class="py-4">
      <filter-list>
        <action
          v-if="hasWriteAccess"
          :text="$t('classroom.messages:btn.add')"
          :url="{
            params: { session_uuid: $route.params.session_uuid },
            name: 'classroom.messages.new'
          }"
          primary
          large
          fixed-width
          slot="button"
          :dark="accessibility"
        />
      </filter-list>
    </div>

    <empty-message v-if="items.length === 0">
      <h2>{{ $t('classroom.messages.trash:empty.title') }}</h2>
    </empty-message>

    <div v-if="items.length">
      <datatable :items="items" :dark="accessibility">
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th class="th" width="60"></th>
            <th class="th" width="50"></th>
            <th class="th" width="240"></th>
            <th class="th"></th>
            <th class="th" width="80"></th>
            <th class="th-buttons" width="190">
              <action
                @click="recover()"
                icon="delete-restore"
                type="button"
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
              />
              <action
                @click="deleteMessages()"
                icon="delete-forever"
                type="button"
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
              />
            </th>
          </tr>
          <tr v-else>
            <th class="th-buttons">
              <action
                @click="recover()"
                icon="delete-restore"
                type="button"
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
              />
              <action
                @click="deleteMessages()"
                icon="delete-forever"
                type="button"
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
              />
            </th>
            <th class="th"></th>
          </tr>
        </template>

        <template slot="tbody" slot-scope="props">
          <tr @click="clickRow($event, props)" v-if="!$media.mobile">
            <td class="td text-center">
              <checkbox
                v-if="hasWriteAccess"
                v-model="props.item.selected"
                :items="[{ value: true }]"
                @input="addList($event, props.item.interaction_id)"
              />
            </td>
            <td class="td">
              <action
                v-if="hasWriteAccess"
                type="button"
                icon="delete-forever"
                @click.stop="deleteItem(props.item)"
                class="btn-delete"
              />
            </td>
            <td class="td">
              <span class="td-text td-message-recipient">Para: {{ props.item.author }} <span v-if="props.item.conversationLength">({{ props.item.conversationLength }})</span></span>
            </td>
            <td class="td">
              <span class="td-text td-message-title" :title="props.item.title" v-shave="{ height: 40 }">{{ props.item.title }}</span>
            </td>
            <td class="td text-right">
              <icon name="attach_file" wrapper size="mediun" v-if="props.item.attachment" />
            </td>
            <td class="td text-right">
              <span class="td-message-date text-base">{{ props.item.date }}</span>
            </td>
          </tr>
          <tr @click="clickRow($event, props)" class="tr-message" v-else>
            <td class="td" height="60" colspan="2">
              <div class="td-wrapper">
                <checkbox
                  v-if="hasWriteAccess"
                  v-model="props.item.selected"
                  :items="[{ value: true }]"
                  @input="addList($event, props.item.interaction_id)"
                  class="tr-message-checkbox"
                />
                <action
                  v-if="hasWriteAccess"
                  type="button"
                  icon="delete-forever"
                  icon-size="medium"
                  @click.stop="deleteItem(props.item)"
                  class="btn-delete tr-message-delete"
                />
                <span class="tr-message-author">{{ props.item.author }} <span v-if="props.item.conversationLength">({{ props.item.conversationLength }})</span></span>
                <span class="tr-message-title">{{ props.item.title }}</span>
                <icon
                  class="tr-message-attachment"
                  name="attach_file"
                  wrapper size="medium"
                  v-if="props.item.attachment"
                />
                <span class="tr-message-date">{{ props.item.date }}</span>
              </div>
            </td>
          </tr>
        </template>
      </datatable>

      <pagination
        :activePage="this.paging.actualPage"
        :pageCount="this.paging.lastPage"
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

<style lang="scss">@import "~@/app/classroom/modules/messages/styles.scss";</style>
