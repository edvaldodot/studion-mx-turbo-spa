<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import EmptyMessage from '@/components/general/EmptyMessage'
import ModalInformation from '@/components/general/ModalInformation'
import Tooltip from '@/components/general/Tooltip'

import DatatableAvailableStudents from './components/DatatableAvailableStudents.vue'
import StudentInfo from './components/StudentInfo.vue'

export default defineComponent({
  name: 'ModalGroupCreation',

  components: {
    Action,
    DatatableAvailableStudents,
    EmptyMessage,
    ModalInformation,
    StudentInfo,
    Tooltip,
  },

  props: {
    courseName: {
      type: String,
      required: true,
    },
    currentGroupId: {
      type: Number,
      default: null,
    },
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      show: false,
      availableStudents: [],
      currentStudent: {},
      min: 2,
      max: 2,
      addType: '',
      participants: [],
    }
  },

  computed: {
    ...mapState({
      currentPreProjectConfig: ({ Classroom }) => Classroom.data && Classroom.data.preProject,
    }),

    selectedStudents() {
      const allStudents = [...this.availableStudents, ...this.participants]
      return allStudents.filter((student) => Boolean(student.selected))
    },

    /*
     * Return the current group length + the current user.
     */
    selectedStudentsCount() {
      return this.selectedStudents.length + 1
    },

    reachedGroupQuantityLimit() {
      return this.selectedStudentsCount >= this.max
    },

    reachedGroupMinQuantityLimit() {
      return this.selectedStudentsCount >= this.min
    },
  },

  created() {
    if (!this.currentPreProjectConfig) return
    const { min, max } = this.currentPreProjectConfig.meta
    this.min = min
    this.max = max
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptSavePreProjectGroup',
      'attemptAddPreProjectAvailableStudents',
    ]),

    openVisualization(availableStudents, typeProp) {
      this.addType = typeProp
      this.$set(this, 'availableStudents', [])
      const currentUser = this.Account.user
      this.currentStudent = {
        name: currentUser.data.name,
        image: currentUser.profile_image,
        selected: true,
      }

      for (let student of availableStudents) {
        if (currentUser.uuid === student.uuid) {
          this.currentStudent['enrollment_id'] = student.enrollment_id
          continue
        }

        this.availableStudents.push({ ...student, selected: false })
      }

      this.toggleVisualization()
      this.listParticipants()
    },

    toggleVisualization() {
      this.show = !this.show
    },

    toggleStudent(student, isChecked) {
      for (let i = 0; i < this.availableStudents.length; ++i) {
        const currentStudent = this.availableStudents[i]

        if (currentStudent.uuid === student.uuid) {
          currentStudent.selected = isChecked
          break
        }
      }
    },

    mountPayload() {
      const enrollmentIdsParticipants = this.participants.map(
        (participant) => participant.enrollment_id
      )

      const selectedStudentsFiltered = this.selectedStudents.filter((student) => {
        return !enrollmentIdsParticipants.includes(student.enrollment_id)
      })
      return {
        pre_project_id: this.currentPreProjectConfig.id,
        owner_id: this.currentStudent['enrollment_id'],
        lonely: false,
        enrollments: [...selectedStudentsFiltered, this.currentStudent]
          .filter((student) => student['enrollment_id'] !== undefined)
          .map((student) => student['enrollment_id']),
      }
    },

    submit() {
      const sessionUuid = this.$route.params['session_uuid']
      const payload = this.mountPayload()

      if (this.addType === 'add') {
        this.setFetching(true)
        this.attemptAddPreProjectAvailableStudents({
          groupId: this.currentGroupId,
          enrollments: payload.enrollments,
        })
          .then(() => {
            this.$emit('update:view')
            this.toggleVisualization()
          })
          .finally(() => this.setFetching(false))
        return
      }

      this.setFetching(true)
      this.attemptSavePreProjectGroup({ sessionUuid, payload })
        .then(() => {
          this.$emit('update:view')
          this.toggleVisualization()
        })
        .finally(() => this.setFetching(false))
    },

    listParticipants() {
      this.participants = this.items.filter((item) => item.uuid !== this.Account.user.uuid)
      this.participants.forEach((student) => {
        student.selected = true
      })
    },
  },
})
</script>

<template>
  <ModalInformation
    :active="show"
    class="modal-group-creation"
    closable
    back
    @close="show = false"
  >
    <template #pre-content>
      <p class="text-color">
        {{
          addType === 'add'
            ? $t('pre.project.panel.group:modal.add.group:pre.content')
            : $t('pre.project.panel.group:modal.create.group:pre.content')
        }}
      </p>
    </template>

    <template #title>
      {{ courseName }}
    </template>

    <template #description>
      <p class="text-center">
        {{
          addType === 'add'
            ? $t('pre.project.panel.group:modal.add.group:description')
            : $t('pre.project.panel.group:modal.create.group:description')
        }}
      </p>
    </template>

    <template #content>
      <StudentInfo
        :name="currentStudent.name"
        :photo="currentStudent.image"
        role="you"
        selected
        disabled
      />
      <div
        v-for="participant in participants"
        :key="participant.uuid"
      >
        <StudentInfo
          :name="participant.name"
          :photo="participant.image"
          selected
          disabled
        />
      </div>

      <DatatableAvailableStudents
        :items="availableStudents"
        :reached-limit="reachedGroupQuantityLimit"
        @student:toggle="toggleStudent"
      />

      <EmptyMessage v-if="!availableStudents.length">
        <p class="text-color">{{ $t('pre.project.panel.group:modal.orientation:empty:participants') }}</p>
      </EmptyMessage>

      <p class="students-count">
        {{ $t('pre.project.panel.group:modal.create.group:table:count') }}
        <span>{{ selectedStudentsCount }}/{{ max }}</span>
      </p>
    </template>

    <template #actions>
      <template v-if="reachedGroupMinQuantityLimit">
        <Action
          :text="
            addType === 'add'
              ? $t('global:save')
              : $t('pre.project.panel.group:modal.create.group:btn:create')
          "
          type="button"
          secondary
          large
          fixed-width
          @click="submit"
        />
      </template>

      <template v-else>
        <Tooltip
          :uppercase="false"
          :bold-font="false"
          :width="232"
          vertical-align="top"
        >
          <template #activator="{ on }">
            <Action
              :text="
                addType === 'add'
                  ? $t('global:save')
                  : $t('pre.project.panel.group:modal.create.group:btn:create')
              "
              type="button"
              secondary
              large
              fixed-width
              disabled
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>

          <span>{{
            $t('pre.project.panel.group:modal.create.group:btn:create:requirement:min', {
              num: min,
            })
          }}</span>
        </Tooltip>
      </template>
    </template>
  </ModalInformation>
</template>

<style lang="scss">
@import './ModalGroupCreation.scss';
</style>