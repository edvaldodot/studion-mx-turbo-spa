<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CardPoll',

  components: {
    Action: () => import('@/components/general/Action'),
    Checkbox: () => import('@/components/general/Checkbox'),
    Dropdown: () => import('@/components/general/Dropdown'),
    DropdownLink: () => import('@/components/general/DropdownLink'),
    Icon: () => import('@/components/general/Icon'),
    Radio: () => import('@/components/general/Radio'),
  },

  props: {
    author: {
      type: Object,
      default: () => {},
    },
    description: {
      type: String,
      default: null,
    },
    comments: {
      type: Array,
      default: () => [],
    },
    enableComments: {
      type: Boolean,
      default: false,
    },
    multiplesChoices: {
      type: Boolean,
      default: false,
    },
    choices: {
      type: Array,
      default: () => [],
    },
    date: {
      type: Object,
      default: null,
    },
    totalVotes: {
      type: Number,
      default: null,
    },
    id: {
      type: Number,
      default: null,
    },
    isMediationPlan: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        comment: null,
        vote: null,
      },
      choicesItems: this.choices,
    }
  },
  validations: {
    formData: {
      comment: {
        required,
      },
      vote: {
        required,
      },
    },
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:poll')
    },
    isVoted() {
      return this.choices.filter((item) => item.voted === true).length > 0
    },
    choicesForm() {
      return this.choices.map(({ id, description }) => ({
        value: id,
        label: description,
      }))
    },
  },
  methods: {
    ...mapActions(['setFetching']),

    addComment() {
      this.$v.formData.comment.$touch()
      if (!this.$v.formData.comment.$invalid) {
        this.$emit('add-comment', this.formData.comment)
      }
    },
    votePoll() {
      this.$v.formData.vote.$touch()
      if (!this.$v.formData.vote.$invalid) {
        let choices = Array.isArray(this.formData.vote) ? this.formData.vote : [this.formData.vote]
        this.$emit('vote', choices)
      }
    },
    editQuestion() {
      this.$emit('edit')
    },
    removeQuestion() {
      this.$emit('remove')
    },
    votesPercentage(choice) {
      let totalVotes = this.totalVotes
      let result = 0
      if (totalVotes > 0) {
        result = (choice.total / totalVotes) * 100
      }
      return result
    },
  },
  mounted() {
    this.formData.vote = this.isVoted ? this.choices.find((item) => item.voted === true).id : null
  },
})
</script>

<template>
  <div
    :id="'card-' + id"
    class="card-poll"
  >
    <div class="card-poll-question">
      <div class="card-poll-question-header">
        <div class="card-poll-question-user">
          <div class="card-poll-question-user-image-wrapper">
            <img
              :src="author.userData.image"
              alt=""
              class="card-poll-question-user-image"
              v-if="author.userData.image"
            />
            <icon
              name="account_circle"
              class="card-poll-question-user-icon"
              v-else
            ></icon>
          </div>
          <span class="card-poll-question-user-position">{{
            author.position === 'Admin'
              ? $t('global:admin')
              : !author.position
              ? $t('classroom.panel.announcements:used.removed')
              : author.position
          }}</span>
          <span class="card-poll-question-user-name">{{
            !author.name ? $t('classroom.panel.announcements:used.removed') : author.name
          }}</span>
        </div>
        <div
          class="card-poll-question-time"
          v-if="!date.hasEnded"
        >
          <template v-if="date.isActive">
            <span class="card-poll-question-time-label">{{
              $t('classroom.poll:question.time.label.active')
            }}</span>
            <span class="card-poll-question-time-value">{{
              $t('classroom.poll:question.time.value.active', { date: formatDate(date.end) })
            }}</span>
          </template>
          <template v-else>
            <span class="card-poll-question-time-label">{{
              $t('classroom.poll:question.time.label')
            }}</span>
            <span class="card-poll-question-time-value">{{
              $t('classroom.poll:question.time.value', { date: formatDate(date.start) })
            }}</span>
          </template>
        </div>
        <div
          class="card-dropdown"
          v-if="hasWriteAccess && !date.hasEnded"
        >
          <dropdown
            v-if="!isMediationPlan"
            icon="dots-vertical"
            right
          >
            <dropdown-link
              :text="$t('global:edit')"
              @click="editQuestion()"
            ></dropdown-link>
            <dropdown-link
              :text="$t('global:remove')"
              @click="removeQuestion()"
            ></dropdown-link>
          </dropdown>
        </div>
      </div>
      <div class="card-poll-question-statement">
        <p class="text-color">{{ description }}</p>
      </div>
      <form
        @submit.prevent="votePoll()"
        class="card-poll-question-form"
        v-if="(!isVoted && date.isActive) || !date.hasEnded"
      >
        <radio
          :items="choicesForm"
          v-model="formData.vote"
          :validation="$v.formData.vote"
          v-if="!multiplesChoices"
          :disabled="(!date.isActive && !date.hasEnded) || isVoted"
          :dark="accessibility"
        ></radio>
        <checkbox
          :items="choicesForm"
          v-model="formData.vote"
          :validation="$v.formData.vote"
          :disabled="(!date.isActive && !date.hasEnded) || isVoted"
          v-else
          :dark="accessibility"
        ></checkbox>
        <span class="card-poll-votes-count">{{
          $tc('classroom.poll:question.vote.count', totalVotes, { num: totalVotes })
        }}</span>
        <div v-if="!isMediationPlan">
          <action
            v-if="!isVoted"
            type="button"
            :text="$t('classroom.poll:question.submit')"
            submit
            primary
            :disabled="!date.isActive && !date.hasEnded"
            :dark="accessibility"
          ></action>
          <action
            type="button"
            :text="$t('classroom.poll:question.submited')"
            submit
            primary
            disabled
            :dark="accessibility"
            v-else
          ></action>

        </div>
      </form>
      <div
        class="card-poll-votes"
        v-else-if="date.hasEnded"
      >
        <div
          class="card-poll-votes-item"
          v-for="(choice, index) in choices"
          :key="index"
          :class="{ 'is-active': choice.voted }"
        >
          <p class="text-color">{{ index + 1 }}) {{ choice.description }}</p>
          <span
            class="card-poll-votes-progress"
            :style="{ width: `${((230 * votesPercentage(choice)) / 100).toFixed(0)}px` }"
          ></span>
          <span class="card-poll-votes-progress-label"
            >{{ votesPercentage(choice).toFixed(2) }}%</span
          >
          <span class="card-poll-votes-counter">{{
            $tc('classroom.poll:question.vote.count', choice.total, { num: choice.total })
          }}</span>
        </div>
        <span class="card-poll-votes-count">{{
          $tc('classroom.poll:question.vote.count', totalVotes, { num: totalVotes })
        }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'CardPoll.scss';
</style>
