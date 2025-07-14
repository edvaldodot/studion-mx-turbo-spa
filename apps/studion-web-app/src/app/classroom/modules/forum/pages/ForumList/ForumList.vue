<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import CardForum from '@/components/shared/CardForum'
import Chip from '@/components/general/Chip'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Pagination from '@/components/general/Pagination'

const Modal = () => import('@/components/general/Modal')
const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'ClassroomForum',
  components: {
    Action,
    CardForum,
    Chip,
    EmptyMessage,
    FilterList,
    Modal,
    ModalConfirm,
    Pagination,
  },

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  data() {
    return {
      forumQueryParams: {
        page: 1,
        order: {
          start_time: 'ASC',
          end_time: 'ASC',
        },
      },
      paging: { actualPage: 1 },
      modalDeleteConfirmActive: false,
      deleteObj: {
        id: null,
        index: null,
        isMultiple: null,
      },
      modalConfirmData: null,
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility', 'forums']),
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('classroom:forum')
    },
    isEditing() {
      return this.$route.meta.editing || false
    },
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },
  watch: {
    'forumQueryParams.page'() {
      this.loadForums()
    },
  },
  created() {
    this.loadItemsPerPagePreferences(this.forumQueryParams)
    this.loadForums()
    this.$emit('change-header', {
      customClasses: { forum: true },
    })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptDiscussionListRetrieval',
      'attemptDiscussionRemoval',
      'attemptDiscussionStatusToggle',
      'setForumsData',
    ]),

    changeItemsPerPage(val) {
      this.forumQueryParams.limit = val
      if (this.forumQueryParams.page !== 1) {
        this.forumQueryParams.page = 1
        return
      }
      this.loadForums()
    },
    activateToggle(item) {
      this.setFetching(true)
      this.attemptDiscussionStatusToggle({
        sessionUuid: this.sessionUuid,
        discussionId: item.id,
      })
        .then(() => {
          item.active = !item.active
          this.setFeedback({
            message: item.active
              ? this.$t('classroom.forum:feedback:activated')
              : this.$t('classroom.forum:feedback:deactivated'),
          })
        })
        .catch(({ response }) => {
          const message = response.data.message

          if (message === 'max_grade_exceeds_remaining_score') {
            this.setFeedback({
              message: this.$t('classroom.forum:evaluaton:feedback:' + message),
              type: 'error',
            })
          }

          this.setFeedback({ message: this.$t(message) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    editHandler(item) {
      if (!item.isMultiple) return this.edit(item)
      this.modalConfirmData = item
    },
    edit(item) {
      this.setForumsData({ path: 'current', value: item })
      this.modalConfirmData = null
      this.$router.push({ name: 'classroom.forum.edit', params: { id: item.id } })
    },
    remove(id) {
      this.setFetching(true)
      this.attemptDiscussionRemoval({
        sessionUuid: this.sessionUuid,
        discussionId: id,
      })
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.forum:feedback:removed') })
          this.loadForums()
        })
        .catch(({ response }) => {
          this.setFeedback({ message: this.$t(response.data.message) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    evaluation(id) {
      this.$router.push({
        name: 'classroom.forum.evaluation',
        params: { session_uuid: this.$route.params.session_uuid, id: id },
      })
    },
    access(id) {
      this.$router.push({
        name: 'classroom.forum.discussion',
        params: { session_uuid: this.$route.params.session_uuid, id: id },
      })
    },

    openModalAddForum() {
      this.setForumsData({ path: 'current', value: null })
      this.$router.push({ name: 'classroom.forum.create' })
    },
    openDeleteModalConfirm(id, index, isMultiple) {
      this.modalDeleteConfirmActive = true
      this.deleteObj = { id, index, isMultiple }
    },
    closeDeleteModalConfirm() {
      this.modalDeleteConfirmActive = false
    },
    confirmDelete() {
      this.closeDeleteModalConfirm()
      this.remove(this.deleteObj.id, this.deleteObj.index)
    },
    nextPage() {
      if (this.paging.nextPage) {
        this.forumQueryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.forumQueryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.forumQueryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.forumQueryParams.page = this.paging.firstPage
      }
    },
    loadForums() {
      this.setFetching(true)
      this.forum = this.Classroom.data.forum

      this.attemptDiscussionListRetrieval({
        sessionUuid: this.sessionUuid,
        forumId: this.forum.id,
        params: this.forumQueryParams,
      })
        .then(({ data }) => {
          this.paging = data
          this.setForumsData({
            path: 'items',
            value: data.data.map((item) => {
              let totalPostComments = item.discussionsPosts.reduce(
                (total, item) => total + item.comments.length,
                0
              )
              item.totalComments = item.discussionsPosts.length
                ? item.discussionsPosts.length + totalPostComments
                : 0
              return item
            }),
          })
          if (this.isEditing) {
            this.setForumsData({
              path: 'current',
              value: this.forums.items.find((item) => item.id === parseInt(this.$route.params.id)),
            })
            if (!this.forums.current) {
              this.$router.push({ name: 'classroom.forum' })
            }
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    showSessions(id) {
      this.$router.push({
        name: 'classroom.forum.sessions',
        params: { id },
      })
    },
  },
}
</script>

<template>
  <div class="inner-content p-4">
    <div class="py-4">
      <filter-list>
        <action
          v-if="hasWriteAccess"
          slot="button"
          type="button"
          :text="$t('classroom.forum:btn.add')"
          primary
          large
          fixed-width
          :dark="accessibility"
          @click="openModalAddForum()"
        />
      </filter-list>
    </div>

    <empty-message v-if="forums.items.length === 0">
      <h2>{{ $t('classroom.forum:empty.title') }}</h2>
      <p class="text-color">
        {{
          $t(
            hasWriteAccess
              ? 'classroom.forum:empty.message:admin'
              : 'classroom.forum:empty.message:student'
          )
        }}
      </p>
    </empty-message>

    <div class="center">
      <div class="forum-list clearfix">
        <div
          v-for="(item, index) in forums.items"
          :key="item.id"
          class="forum-card-wrapper"
        >
          <Chip
            v-if="item.isMultiple"
            :text="$t('classroom.forum:multiple')"
            color="success"
          />
          <CardForum
            :active="item.active"
            :title="item.title"
            :thumbnail="item.image"
            :start-time="item.startTime"
            :last-interaction="item.lastInteraction"
            :end-time="item.endTime"
            :total-comments="item.totalComments"
            :mandatory="item.mandatory"
            :mandatory-interactions="item"
            :is-evaluative="item.avaliative"
            :slug="item.slug"
            :is-multiple="item.isMultiple"
            context="classroom:forum"
            @remove="openDeleteModalConfirm(item.id, index, item.isMultiple)"
            @edit="editHandler(item)"
            @activate="activateToggle(item)"
            @deactivate="activateToggle(item)"
            @access="access(item.id)"
            @evaluation="evaluation(item.id)"
            @sessions="showSessions(item.id)"
          />
        </div>
      </div>
      <pagination
        v-if="forums.items.length > 0"
        :active-page="paging.actualPage"
        :page-count="paging.lastPage"
        @last-page="lastPage"
        @first-page="firstPage"
        @next-page="nextPage"
        @previous-page="previousPage"
        @go-to-page="forumQueryParams.page = $event"
        @change-items-per-page="changeItemsPerPage"
      />
    </div>

    <ModalConfirm
      :active="!!modalConfirmData"
      :title="$t('classroom.forum:multiple.edit.title')"
      @confirm="edit(modalConfirmData)"
      @close="modalConfirmData = null"
    >
      <p>{{ $t('classroom.forum:multiple.edit.description') }}</p>
    </ModalConfirm>

    <modal
      :active.sync="modalDeleteConfirmActive"
      :cancel="false"
    >
      <div class="modal-confirm">
        <action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeDeleteModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{ $t('classroom.forum:modal.confirm.delete.title') }}
          </h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('classroom.forum:modal.confirm.delete.forum.description') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <action
            type="button"
            :text="$t('global:confirm')"
            flat
            :dark="accessibility"
            @click="confirmDelete()"
          />
          <action
            type="button"
            :text="$t('global:cancel')"
            flat
            class="btn-cancel"
            :dark="accessibility"
            @click="closeDeleteModalConfirm()"
          />
        </div>
      </div>
    </modal>

    <RouterView @discussion-saved="loadForums" />
  </div>
</template>

<style lang="scss">
</style>
