<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Icon from '@/components/general/Icon'
import Pagination from '@/components/general/Pagination'
import ProgressList from '@/components/general/ProgressList'

export default {
  name: 'classroomMessages',
  components: {
    Action,
    ActionBar,
    Checkbox,
    Datatable,
    EmptyMessage,
    FilterList,
    Icon,
    Pagination,
    ProgressList
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
    if (to.name === 'classroom.messages.draft') {
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
        params: {
          session_uuid: this.$route.params.session_uuid,
          interaction_id: item.interaction_id,
          type: 'draft'
        },
        name: 'classroom.messages.edit.draft'
      })
    },
    deleteMessages () {
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)
      this.attemptDeleteMessage({ sessionUuid, interactions: this.checkboxList })
        .then(() => {
          this.checkboxList = []
          this.queryParams.page = 1
          this.loadMessages()
          this.setFeedback({ message: this.$t('classroom.messages.draft:feedback.remove.success') })
        })
        .catch(() => {
          this.setFeedback({message: this.$t('classroom.messages.draft:feedback.remove.error'), type: 'error'})
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
      this.attemptMessagesRetrieval({ sessionUuid, statusAlias: 'draft', queryParams: this.queryParams })
        .then(({data}) => {
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
                conversationLength: item.relatedInteractions.length ? item.relatedInteractions.length + 1 : null,
                starred: false,
                date: this.formatDate(item.creationTime, 'long'),
                unread: false
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
      <h2>{{ $t('classroom.messages.draft:empty.title') }}</h2>
      <p v-if="$t('classroom.messages.draft:empty.message')">{{ $t('classroom.messages.draft:empty.message') }}</p>
    </empty-message>

    <div v-if="items.length">
      <datatable :items="items" :dark="accessibility">
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th class="th" width="60"></th>
            <th class="th" width="240"></th>
            <th class="th"></th>
            <th class="th" width="80"></th>
            <th class="th-buttons" width="190">
              <action
                @click="deleteMessages()"
                icon="delete"
                type="button"
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
              />
            </th>
          </tr>
          <tr v-else>
            <th class="th"></th>
            <th class="th-buttons">
              <action
                @click="deleteMessages()"
                icon="delete"
                type="button"
                v-if="hasWriteAccess"
                v-show="checkboxList.length !== 0"
              />
            </th>
          </tr>
        </template>

        <template slot="tbody" slot-scope="props">
          <tr @click="clickRow($event, props)"  v-if="!$media.mobile">
            <td class="td text-center">
              <checkbox
                v-if="hasWriteAccess"
                v-model="props.item.selected"
                :items="[{ value: true }]"
                @input="addList($event, props.item.interaction_id)"
              />
            </td>
            <td class="td">
              <span
                v-if="props.item.author && props.item.conversationLength"
                class="td-text"
              >
                <span class="td-message-recipient">{{ props.item.author }}</span>
                <span>({{ props.item.conversationLength }})</span></span
              >
              <span class="td-text draft">{{ $t('classroom.messages.draft:datatable.item.title') }}</span>
            </td>
            <td class="td">
              <span class="td-text td-message-title">{{ props.item.title }}</span>
            </td>
            <td class="td text-right">
              <icon name="attach_file" wrapper size="mediun" v-if="props.item.attachment" />
            </td>
            <td class="td">
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
                <div class="tr-message-draft-author">
                  <span class="tr-message-author" v-if="props.item.author">{{ props.item.author }} <span v-if="props.item.conversationLength">({{ props.item.conversationLength }})</span></span>
                  <span class="tr-message-draft">{{ $t('classroom.messages.draft:datatable.item.title') }}</span>
                </div>
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
