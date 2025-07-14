<script>
import { defineComponent } from 'vue'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import ModalBody from '@/components/general/ModalBody'
import Datatable from '@/components/general/Datatable'
import RadioItem from '@/components/general/RadioItem'
import Action from '@/components/general/Action'
import Pagination from '@/components/general/Pagination'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions } from 'vuex'

export default defineComponent({
  name: 'ModalMoveForumPost',
  components: {
    Modal,
    ModalHeader,
    ModalBody,
    Datatable,
    RadioItem,
    Action,
    Pagination,
  },

  mixins: [paginateMixin],

  props: {
    subTitle: {
      type: String,
      default: '',
    },
    forumId: {
      type: Number,
      required: true,
    },
    postId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      selectedDiscussionId: 0,
    }
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    if (!this.forumId || !this.postId) this.$router.push(this.$route.meta.modalCloseLink)

    this.pgtrInitializePagination('attemptDiscussionList', null, {
      sessionUuid: this.$route.params.session_uuid,
      forumId: this.forumId,
    })

    this.selectedDiscussionId = parseInt(this.$route.params.id)
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptMovePostDiscussion']),

    async submit() {
      try {
        this.setFetching(true)
        await this.attemptMovePostDiscussion({
          postId: this.postId,
          discussionId: this.selectedDiscussionId,
        })

        this.setFeedback({ message: this.$t('classroom.forum:modal.move.post.modal.success') })
        this.$router.push(this.$route.meta.modalCloseLink)
        this.$emit('refresh-forum-discussion')
      } finally {
        this.setFetching(false)
      }
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-move-forum-post')"
    :active="true"
    cancel
    is-page
  >
    <ModalHeader
      :title="$t('classroom.forum:modal.move.post.modal.title')"
      :sub-title="subTitle"
      :description="$t('classroom.forum:modal.move.post.modal.description')"
      is-capitalize
    />

    <ModalBody>
      <Datatable
        :items="pgtrCurrentData"
        dark
      >
        <template #thead>
          <tr>
            <th class="th">
              {{ $t('global:menu.forum') }}
            </th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr class="tr-tbody">
            <td class="td">
              <div class="select-forum__radio">
                <RadioItem
                  :checked="selectedDiscussionId === props.item.id"
                  :value="props.item.id"
                  :name="props.item.id"
                  :label="props.item.title"
                  @change="selectedDiscussionId = props.item.id"
                />
              </div>
            </td>
          </tr>
        </template>
      </Datatable>

      <Pagination
        class="center"
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        dark
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />

      <div class="form-submit text-center">
        <Action
          :text="$t('global:save')"
          type="button"
          fixed-width
          secondary
          large
          @click="submit"
        />
      </div>
    </ModalBody>
  </Modal>
</template>

<style lang="scss">
.select-forum__radio {
  position: relative;
  width: 100%;

  .form-radio {
    position: absolute;
    opacity: 0;
    height: 24px;
    width: 24px;
    cursor: pointer;
  }

  .form-radio-label {
    display: inline-block;
    vertical-align: middle;
    margin-left: 15px;
    color: var(--primary-500);
    font-family: var(--font-family);
    font-size: 1.7em;
    cursor: pointer;
  }
}
</style>
