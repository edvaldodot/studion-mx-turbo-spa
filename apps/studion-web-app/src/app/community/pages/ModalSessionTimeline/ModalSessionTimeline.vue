<script>
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datepicker from '@/components/general/Datepicker'
import Modal from '@/components/general/Modal'
import EmptyMessage from '@/components/general/EmptyMessage'

import ModalHeader from '@/components/general/ModalHeader'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

import { mapActions } from 'vuex'
import { requiredIf } from 'vuelidate/lib/validators'

export default {
  name: 'ModalSessionTimeline',

  components: {
    Dropdown,
    DropdownLink,
    Action,
    Checkbox,
    Datepicker,
    Modal,
    EmptyMessage,
    ModalHeader,
  },

  data() {
    return {
      data: null,
    }
  },

  computed: {
    hasTopics() {
      const topics = this.data && this.data.topics
      return topics && topics.length
    },

    availabilityStartDate() {
      const { startTime = null } = this.$route.query
      const { initial = null } = this.data.session.availability
      return initial || startTime
    },

    availabilityEndDate() {
      const { endTime = null } = this.$route.query
      const { extended = null, final = null } = this.data.session.availability
      return extended || final || endTime
    },

    isTrailTimeline() {
      return this.$route.meta.type && this.$route.meta.type === 'trail'
    },
    description() {
      if (this.isTrailTimeline) return this.$t('trails:timeline.description')
      return this.$t('community.sessions.timeline.subtitle')
    },
    titleInfo() {
      if (this.isTrailTimeline) return this.$t('trails:timeline.info.title')
      return this.$t('community.sessions.timeline.session:title')
    },
    showVacancies() {
      return !this.isTrailTimeline
    },
    showType() {
      return !this.isTrailTimeline
    },
    showSessionName() {
      return !this.isTrailTimeline
    },
  },

  created() {
    this.fetchData()
  },

  methods: {
    ...mapActions([
      'attemptGetTopicsPeriods',
      'attemptSaveTopicsPeriods',
      'setFeedback',
      'setFetching',
    ]),

    fetchData() {
      this.setFetching(true)

      this.attemptGetTopicsPeriods(this.$route.params.sessionId)
        .then(({ data }) => {
          data.topics = data.topics.map((topic) => {
            const alreadyExists = topic && topic.topicPeriods

            return {
              ...topic,
              topicPeriods: {
                topic_id: topic.id,
                active: alreadyExists ? topic.topicPeriods.active : false,
                start_time: alreadyExists ? topic.topicPeriods.schedulePeriod.start : null,
                end_time: alreadyExists ? topic.topicPeriods.schedulePeriod.end : null,
                add_to_calendar:
                  alreadyExists && topic.topicPeriods.event
                    ? topic.topicPeriods.event.active
                    : false,
              },
            }
          })

          this.data = data
        })
        .finally(() => this.setFetching(false))
    },

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      this.setFetching(true)

      const payload = {}
      const topics = this.deepClone(this.data.topics)

      payload.topic_period = topics.map((topic) => {
        if (topic.topicPeriods.active) {
          topic.topicPeriods.start_time = `${topic.topicPeriods.start_time}:00`
          topic.topicPeriods.end_time = `${topic.topicPeriods.end_time}:00`
          topic.add_to_calendar = topic.add_to_calendar === true ? 1 : 0

          return topic.topicPeriods
        }

        return {
          active: false,
          topic_id: topic.id,
          add_to_calendar: false,
        }
      })

      this.attemptSaveTopicsPeriods({
        sessionId: this.$route.params.sessionId,
        data: payload,
      })
        .then(() => {
          this.setFeedback({
            message: this.$t(`community.sessions.timeline.feedback:save_success`),
          })
          this.$router.push(this.$route.meta.modalCloseLink)
        })
        .catch(({ response }) => {
          const data = response && response.data
          const message = data && data.message

          if (message && message === 'scheduled_range_not_allowed') {
            this.setFeedback({
              message: this.$t(`community.sessions.timeline.feedback:scheduled_range_not_allowed`),
            })
          }
        })
        .finally(() => this.setFetching(false))
    },
  },

  validations: {
    data: {
      topics: {
        $each: {
          topicPeriods: {
            start_time: {
              required: requiredIf(function (nestedModel) {
                return nestedModel.active
              }),
            },
            end_time: {
              required: requiredIf(function (nestedModel) {
                return nestedModel.active
              }),
              isEqualToStart: function (_, nestedModel) {
                return !nestedModel.active || nestedModel.start_time !== nestedModel.end_time
              },
            },
          },
        },
      },
    },
  },
}
</script>

<template>
  <div>
    <Modal
      v-if="data"
      :data-testid="$testId('modal-session-timeline')"
      class="modal-session-timeline"
      :class="{ 'd-none': $route.name === 'community.sessions.timeline.batch.date' }"
      active
      is-page
    >
      <ModalHeader
        :title="data.session.name"
        :sub-title="$t('community.sessions.timeline')"
      >
        <template #description>
          <p v-html="description"></p>
        </template>
      </ModalHeader>

      <div class="session">
        <h3 class="form-section-title text-color">
          {{ titleInfo }}
        </h3>

        <div class="session-details">
          <div
            v-if="showType"
            class="session-details__info"
          >
            <span class="text-color">{{ $t('community.sessions.timeline.session:type') }}</span>
            <p class="text-color">{{ $t(`community.sessions.filters:type.${data.session.type}`) }}</p>
          </div>

          <div
            v-if="showVacancies"
            class="session-details__info"
          >
            <span class="text-color">{{ $tc('global:vacancies', 2) }}</span>
            <p class="text-color">{{ data.session.vacancy.free ? '-' : data.session.vacancy.max_vacancy }}</p>
          </div>

          <div class="session-details__info">
            <span class="text-color">{{ $t('global:period') }}</span>
            <p class="text-color">
              {{
                $t('global:period:between', {
                  initial: formatDate(availabilityStartDate),
                  final: formatDate(availabilityEndDate),
                })
              }}
            </p>
          </div>

          <div
            v-if="showSessionName"
            class="session-details__info"
          >
            <span class="text-color">{{ $t('global:solution') }}</span>
            <p class="text-color">{{ data.course.name }}</p>
          </div>
        </div>
      </div>

      <div class="centered-form">
        <EmptyMessage
          v-if="!hasTopics"
          class="modal-form-box modal-form-box-inner"
        >
          <h2>{{ $t('community.sessions.timeline.feedback:empty.message:title') }}</h2>
          <p class="text-color">{{ $t('community.sessions.timeline.feedback:empty.message:description') }}</p>
        </EmptyMessage>

        <template v-else>
          <div
            v-for="(topic, idx) in data.topics"
            :key="topic.id"
            class="modal-form-box modal-form-box-inner bg-black-100"
            :class="{ check: topic.topicPeriods.active }"
          >
            <div class="modal-form-dropdown">
              <Dropdown
                v-if="topic.topicPeriods.active"
                icon="dots-vertical"
                right
                class="generic-card__options card-forum__options"
                icon-size="medium"
              >
                <DropdownLink
                  :text="$t('community.sessions.timeline.dropdown:batch')"
                  @click="
                    $router.push({
                      name: 'community.sessions.timeline.batch.date',
                      params: {
                        topicId: topic.id,
                        topic,
                      },
                    })
                  "
                />
              </Dropdown>
            </div>
            <h3 class="class-title text-color">{{ topic.name }}</h3>

            <Checkbox
              v-model="topic.topicPeriods.active"
              :items="[{ value: true, label: $t('community.sessions.timeline.option:custom') }]"
              switch-type
              dark
            />

            <div
              v-if="topic.topicPeriods.active"
              class="modal-session-timeline__custom-period"
            >
              <div
                class="form-group clearfix"
                data-cols="2"
                data-gap="40"
              >
                <Datepicker
                  v-model="topic.topicPeriods.start_time"
                  :label="$t('global:form.start')"
                  :min="availabilityStartDate"
                  :max="availabilityEndDate"
                  :validation="$v.data.topics.$each[idx].topicPeriods.start_time"
                  time
                  dark
                />

                <Datepicker
                  v-model="topic.topicPeriods.end_time"
                  :label="$t('global:form.closure')"
                  :min="topic.topicPeriods.start_time"
                  :max="availabilityEndDate"
                  :disabled="!topic.topicPeriods.start_time"
                  :validation="$v.data.topics.$each[idx].topicPeriods.end_time"
                  time
                  dark
                />
              </div>

              <Checkbox
                v-model="topic.topicPeriods.add_to_calendar"
                :items="[
                  {
                    value: true,
                    label: $t('community.sessions.timeline.option:calendar'),
                  },
                ]"
                dark
              />
            </div>
          </div>
        </template>
      </div>

      <Action
        v-if="hasTopics"
        :text="$t('global:save')"
        type="button"
        class="mt-5"
        secondary
        large
        fixed-width
        flatten
        @click="submit"
      />
    </Modal>

    <RouterView @refresh-session-timeline="fetchData" />
  </div>
</template>

<style lang="scss">
@import './ModalSessionTimeline.scss';
</style>
