<script>
import { mapActions, mapState } from 'vuex'
import Modal from '@/components/general/Modal'
import ProgressToggleList from '@/components/general/ProgressToggleList'
import GraphicUserProgress from '@/components/general/GraphicUserProgress'
import Tips from '@/components/general/Tips'

export default {
  name: 'ModalUserProgress',

  components: {
    Modal,
    ProgressToggleList,
    GraphicUserProgress,
    Tips,
  },

  computed: {
    ...mapState({
      details: (state) => state.Classroom.studentProgressDetails,
      course: (state) => state.Classroom.data.course,
    }),
    mandatory() {
      return this.details && this.details.mandatory
    },
    extra() {
      return this.details && this.details.extra
    },
    mandatoryLessons() {
      return this.mandatory.lessons
    },
    mandatoryExaminations() {
      return this.mandatory.examinations
    },
    mandatoryPreProject() {
      return this.mandatory.preProjectExaminations
    },
    mandatoryForums() {
      return this.mandatory.forums
    },
    extraLessons() {
      return this.extra.lessons
    },
    extraExaminations() {
      return this.extra.examinations
    },
    extraPreProject() {
      return this.extra.preProjectExaminations
    },
    hasMandatoryContent() {
      return (
        this.mandatory && (this.mandatoryLessons.items.length || this.mandatoryForums.items.length)
      )
    },
    hasExtraContent() {
      return this.extra && this.extraLessons.items.length
    },
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },

  created() {
    this.setFetching(true)

    this.fetchStudentProgressDetails(this.$route.params.session_uuid).finally(() => {
      this.setFetching(false)
    })
  },

  methods: {
    ...mapActions(['fetchStudentProgressDetails', 'setFetching']),
    closeModal() {
      this.$emit('close')
    },
    redirectTo(event) {
      this.closeModal()
      if (event.type === 'examination' && this.$isEnabledFeature('examination_tool_feature')) {
        this.$router.push({
          name: 'classroom.assessments.evaluation.access',
          params: {
            type_id: event.id,
            type: 'examination',
            session_uuid: this.$route.params.session_uuid,
          },
        })
      } else {
        this.$router.push({
          name: 'classroom.lessons.course.type',
          params: {
            session_uuid: this.sessionUuid,
            type: event.type,
            type_id: event.id,
          },
        })
      }
    },

    redirectToProject(event) {
      this.closeModal()
      this.$router.push({
        name: 'classroom.lessons.course.project.access',
        params: {
          type_id: event.id,
          type: 'examination',
          session_uuid: this.$route.params.session_uuid,
        },
      })
    },

    goToForum(event) {
      this.closeModal()
      this.$router.push({
        name: 'classroom.forum.discussion',
        params: { id: event.id },
      })
    },
  },
}
</script>

<template>
  <Modal
    :data-testid="$testId('modal-user-progress')"
    class="modal-user-progress__component"
    active
    back
    is-page
    @close="closeModal"
  >
    <div id="modal-header">
      <span class="modal-subtitle">{{ $t('progress.modal.title') }}</span>
      <h2
        v-if="course"
        class="modal-title text-color"
      >
        {{ course.name }}
      </h2>
    </div>
    <div class="modal-user-progress__area">
      <div class="modal-user-progress__graph">
        <GraphicUserProgress
          v-if="details"
          :status="details.status"
          :consumed="details.consumedCount"
          :consumed-out="mandatory ? mandatory.consumedCount : 0"
          :consumed-in="extra ? extra.consumedCount : 0"
          :total="details.totalCount"
          :total-out="mandatory ? mandatory.totalCount : 0"
          :total-in="extra ? extra.totalCount : 0"
          :percentage-out="mandatory ? mandatory.consumedPercentage : 0"
          :percentage-in="extra ? extra.consumedPercentage : 0"
          color-out="var(--mandatory-color)"
          color-in="var(--extra-color)"
        />
      </div>

      <div class="modal-user-progress__lists">
        <div
          v-if="hasMandatoryContent"
          class="modal-user-progress__mandatory"
        >
          <div class="modal-user-progress__title">
            <span>{{ $t('progress.content.mandatory') }}</span>
            <Tips>
              <template #tip>
                <p class="text-white">{{ $t('progress.content.mandatory.tip') }}</p>
              </template>
            </Tips>
          </div>

          <ProgressToggleList
            v-if="mandatoryLessons && mandatoryLessons.items.length"
            :data-testid="$testId('progress-toggle-list--mandatory-lessons')"
            :title="$t('progress.list.lessons.title')"
            :percentage="mandatoryLessons.consumedPercentage"
            :consumed="mandatoryLessons.consumedCount"
            :total="mandatoryLessons.totalCount"
            :items="mandatoryLessons.items"
            color="var(--mandatory-color)"
            action-button
            @action="redirectTo"
          />

          <ProgressToggleList
            v-if="
              mandatoryExaminations &&
              mandatoryExaminations.items.length &&
              $isEnabledFeature('examination_tool_feature')
            "
            :data-testid="$testId('progress-toggle-list--mandatory-lessons')"
            :title="$t('progress.list.examination.title')"
            :percentage="mandatoryExaminations.consumedPercentage"
            :consumed="mandatoryExaminations.consumedCount"
            :total="mandatoryExaminations.totalCount"
            :items="mandatoryExaminations.items"
            color="var(--mandatory-color)"
            action-button
            @action="redirectTo"
          />

          <ProgressToggleList
            v-if="
              mandatoryPreProject &&
              mandatoryPreProject.items.length &&
              $isEnabledFeature('examination_tool_feature')
            "
            :data-testid="$testId('progress-toggle-list--mandatory-lessons')"
            :title="$t('progress.list.project.title')"
            :percentage="mandatoryPreProject.consumedPercentage"
            :consumed="mandatoryPreProject.consumedCount"
            :total="mandatoryPreProject.totalCount"
            :items="mandatoryPreProject.items"
            color="var(--mandatory-color)"
            action-button
            @action="redirectToProject"
          />

          <ProgressToggleList
            v-if="mandatoryForums && mandatoryForums.items.length"
            :data-testid="$testId('progress-toggle-list--mandatory-forums')"
            :title="$t('progress.list.foruns.title')"
            :percentage="mandatoryForums.consumedPercentage"
            :consumed="mandatoryForums.consumedCount"
            :total="mandatoryForums.totalCount"
            :items="mandatoryForums.items"
            color="var(--mandatory-color)"
            action-button
            @action="goToForum"
          />
        </div>

        <div
          v-if="hasExtraContent"
          class="modal-user-progress__extra"
        >
          <div class="modal-user-progress__title">
            <span>{{ $t('progress.extra.content') }} {{ $t('progress.optional') }}</span>
            <Tips>
              <template #tip>
                <p class="text-white">{{ $t('progress.extra.content.tip') }}</p>
              </template>
            </Tips>
          </div>

          <ProgressToggleList
            v-if="extraLessons && extraLessons.items.length"
            :data-testid="$testId('progress-toggle-list--extra-lessons')"
            :title="$t('progress.list.lessons.title')"
            :percentage="extraLessons.consumedPercentage"
            :consumed="extraLessons.consumedCount"
            :total="extraLessons.totalCount"
            :items="extraLessons.items"
            color="var(--extra-color)"
            action-button
            @action="redirectTo"
          />

          <ProgressToggleList
            v-if="
              extraExaminations &&
              extraExaminations.items.length &&
              $isEnabledFeature('examination_tool_feature')
            "
            :data-testid="$testId('progress-toggle-list--mandatory-lessons')"
            :title="$t('progress.list.examination.title')"
            :percentage="extraExaminations.consumedPercentage"
            :consumed="extraExaminations.consumedCount"
            :total="extraExaminations.totalCount"
            :items="extraExaminations.items"
            color="var(--mandatory-color)"
            action-button
            @action="redirectTo"
          />

          <ProgressToggleList
            v-if="
              extraPreProject &&
              extraPreProject.items.length &&
              $isEnabledFeature('examination_tool_feature')
            "
            :data-testid="$testId('progress-toggle-list--mandatory-lessons')"
            :title="$t('progress.list.project.title')"
            :percentage="extraPreProject.consumedPercentage"
            :consumed="extraPreProject.consumedCount"
            :total="extraPreProject.totalCount"
            :items="extraPreProject.items"
            color="var(--mandatory-color)"
            action-button
            @action="redirectToProject"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss">
@import './ModalUserProgress.scss';
</style>
