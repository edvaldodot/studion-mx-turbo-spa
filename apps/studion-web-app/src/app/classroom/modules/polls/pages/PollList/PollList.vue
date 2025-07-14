<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { format, isBefore, parseISO } from 'date-fns'

import Action from '@/components/general/Action'
import CardPoll from '../../components/CardPoll'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import TopBar from '@/components/general/TopBar'

import { tabLinks } from './utils'

export default defineComponent({
  name: 'PollList',

  components: {
    Action,
    CardPoll,
    EmptyMessage,
    FilterList,
    TopBar,
  },

  beforeRouteLeave(_, __, next) {
    this.$emit('change-header', {})
    next()
  },

  props: {
    pollId: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      loadedItems: [],
      items: [],
    }
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),

    sessionUuid() {
      return this.$route.params.session_uuid
    },

    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:poll')
    },

    isPollListActive() {
      return this.$route.name === 'classroom.poll.active'
    },

    isPollListEnded() {
      return this.$route.name === 'classroom.poll.ended'
    },
  },

  watch: {
    '$route.name'(name) {
      if (name === 'classroom.poll.active') this.loadPolls()
      if (name === 'classroom.poll.ended') this.loadPollsEnded()

      this.init()
    },
  },

  created() {
    if (this.isPollListActive) this.loadPolls()
    if (this.isPollListEnded) this.loadPollsEnded()

    this.init()
  },

  updated() {
    if (this.pollId) {
      const el = document.getElementById(`card-${this.pollId}`)

      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptClassroomPollsQuestionsListRetrieval',
      'attemptPollQuestionListRemoval',
      'attemptClassroomPollQuestionVote',
    ]),

    init() {
      this.$emit('change-header', {
        customClasses: { poll: true },
        tabLinks: [...tabLinks()],
      })
    },

    backAction() {
      if (this.$route.params.management) {
        this.$router.push({ name: this.$route.params.management })
        return
      }
    },

    openModalAddPoll() {
      this.$router.push({ name: 'classroom.poll.add' })
    },

    editPoll(poll) {
      const formattedPoll = {
        id: poll.id,
        description: poll.description,
        start_time: format(parseISO(poll.schedulePeriod.start), 'yyyy-MM-dd HH:mm'),
        end_time: format(parseISO(poll.schedulePeriod.end), 'yyyy-MM-dd HH:mm'),
        multiples_choices: poll.multiplesChoices ? 1 : 0,
        choices: poll.choices,
      }

      this.$router.push({
        name: 'classroom.poll.add',
        params: { poll: formattedPoll },
      })
    },

    removeQuestion(questionId) {
      this.setFetching(true)

      this.attemptPollQuestionListRemoval(questionId)
        .then(() => {
          this.loadPolls()
          this.setFeedback({ message: this.$t('classroom.poll:feedback.removed.success') })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.poll:feedback.removed.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    vote(choices) {
      let sessionUuid = this.$route.params.session_uuid
      this.setFetching(true)

      this.attemptClassroomPollQuestionVote({ sessionUuid, choices })
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.poll:feedback.vote.success') })
          this.loadPolls()
        })
        .catch(({ response }) => {
          const errorMessage =
            response.data.message === 'only_students_can_answer_poll'
              ? 'classroom.poll:feedback.vote.error.only_students'
              : 'classroom.poll:feedback.vote.error'

          this.setFeedback({
            message: this.$t(errorMessage),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    loadPollsEnded() {
      this.setFetching(true)

      this.attemptClassroomPollsQuestionsListRetrieval(this.sessionUuid)
        .then(({ data }) => {
          this.loadedItems = data
            .filter((item) => item.schedulePeriod.hasEnded === true)
            .map((item) => {
              let totalVotes = item.choices.reduce(function (prevVal, elem) {
                return prevVal + elem.total
              }, 0)
              return Object.assign({}, item, { totalVotes: totalVotes })
            })
          this.items = this.loadedItems
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    loadPolls() {
      this.setFetching(true)

      this.attemptClassroomPollsQuestionsListRetrieval(this.sessionUuid)
        .then(({ data }) => {
          this.loadedItems = data.map((item) => {
            const totalVotes = item.choices.reduce(function (prevVal, elem) {
              return prevVal + elem.total
            }, 0)

            return Object.assign({}, item, { totalVotes })
          })

          this.loadedItems
            .sort((a, b) => {
              const start = parseISO(a.schedulePeriod.start)
              const end = parseISO(b.schedulePeriod.start)

              return isBefore(start, end) ? -1 : 1
            })
            .sort((a, b) => {
              const aIsActive = a.schedulePeriod.isActive
              const bIsActive = b.schedulePeriod.isActive

              return aIsActive === bIsActive ? 0 : aIsActive ? -1 : 1
            })

          this.items = this.loadedItems.filter((loadedItem) => !loadedItem.schedulePeriod.hasEnded)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <div class="inner-content p-4">
    <TopBar v-if="$route.params.management">
      <Action
        icon="keyboard_backspace"
        :text="$t('management:back.to.management')"
        icon-size="small"
        type="button"
        flat
        @click="backAction"
      />
    </TopBar>

    <div class="py-4">
      <FilterList>
        <Action
          v-if="hasWriteAccess && isPollListActive"
          slot="button"
          :dark="accessibility"
          :text="$t('classroom.poll:btn.add')"
          type="button"
          primary
          large
          fixed-width
          @click="openModalAddPoll()"
        />
      </FilterList>
    </div>

    <EmptyMessage v-if="items.length === 0 && !isStudent()">
      <h2>{{ $t('classroom.poll:empty.title:admin') }}</h2>
      <p class="text-color">{{ $t('classroom.poll:empty.message:admin') }}</p>
    </EmptyMessage>

    <EmptyMessage v-if="items.length === 0 && isStudent()">
      <h2>{{ $t('classroom.poll:empty.title:student') }}</h2>
      <p class="text-color">{{ $t('classroom.poll:empty.message:student') }}</p>
    </EmptyMessage>

    <div
      v-if="items.length"
      class="center"
    >
      <div class="poll-list">
        <CardPoll
          v-for="item in items"
          :id="item.id"
          ref="cardPoll"
          :key="item.id"
          :author="item.author"
          :multiples-choices="item.multiplesChoices"
          :enable-comments="item.allowComments"
          :description="item.description"
          :date="item.schedulePeriod"
          :choices="item.choices"
          :total-votes="item.totalVotes"
          @edit="editPoll(item)"
          @remove="removeQuestion(item.id)"
          @vote="vote"
        />
      </div>
    </div>

    <RouterView />
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/polls/styles.scss';
</style>
