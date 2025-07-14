<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import BlurCard from '@/components/general/BlurCard'
import Action from '@/components/general/Action'

export default defineComponent({
  name: 'PanelQuestions',

  components: {
    BlurCard,
    Action,
  },

  data() {
    return {
      questions: [],
      isLoading: false,
      kbIssuesQueryParams: {
        sessionUuid: null,
        profileAlias: null,
      },
    }
  },

  created() {
    this.setup()
  },

  methods: {
    ...mapActions(['attemptClassroomKbIssuesRetrieval']),

    setup() {
      this.isLoading = true
      this.kbIssuesQueryParams.sessionUuid = this.$route.params.session_uuid
      this.kbIssuesQueryParams.profileAlias = this.Account.user.currentProfile

      this.attemptClassroomKbIssuesRetrieval(this.kbIssuesQueryParams)
        .then((issuesResponse) => {
          this.questions = issuesResponse.data.data.filter((i) => i.status !== 'closed')
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    pushToKb() {
      this.$router.push({
        name: 'classroom.knowledgeBase',
        params: { session_uuid: this.sessionUuid },
      })
    },
  },
})
</script>

<template>
  <div
    v-if="questions.length"
    :data-testid="$testId('classroom-questions')"
    class="questions__wrapper"
  >
    <h3 class="section-title">{{ $t('solutions:tools.knowledge.base') }}</h3>
    <BlurCard
      v-if="!isLoading"
      class="questions"
      hide-scrollbar
      max-height="360px"
    >
      <div
        v-for="question in questions.slice(0, $media.mobile ? 3 : 12)"
        :key="question.id"
        class="questions__card"
        @click="$router.push({ name: 'classroom.knowledgeBase' })"
      >
        <div class="questions__card__header">
          <div class="questions__card__date">
            <p class="text-color">
              {{
                $t('global:date.hours', {
                  date: formatDate(question.date),
                  hour: formatDate(question.date, 'shortTime'),
                })
              }}
            </p>
          </div>
          <div class="questions__card__status">
            <span>{{ $t(`classroom.kb.panel:status.${question.status}`) }}</span>
          </div>
        </div>

        <div class="questions__card__body">
          <h2>{{ question.subject }}</h2>
        </div>
      </div>
      <Action
        v-if="$media.mobile && questions.length > 3"
        type="button"
        :text="$t('global:view.all')"
        flat
        @click="pushToKb"
      />
    </BlurCard>
  </div>
</template>

<style lang="scss">
@import 'PanelQuestions.scss';
</style>
