<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { format } from 'date-fns'

import checkConfig from '../../../mixins/checkConfig'

import ModalConfirm from '@/components/general/ModalConfirm'

import ButtonGroupInfo from '../../../components/ButtonGroupInfo'
import GroupButtons from '../../../components/GroupButtons'
import GroupList from '../../../components/GroupList'
import ModalGroupCreation from '../../../components/ModalGroupCreation'
import ModalGroupIndividual from '../../../components/ModalGroupIndividual'
import ModalGroupOrientation from '../../../components/ModalGroupOrientation'

export default defineComponent({
  name: 'MyGroups',

  components: {
    ButtonGroupInfo,
    GroupButtons,
    GroupList,
    ModalConfirm,
    ModalGroupCreation,
    ModalGroupIndividual,
    ModalGroupOrientation,
  },

  mixins: [checkConfig],

  data() {
    return {
      users: [],
      modalConfirmExit: false,
      deadlinePreProject: false,
      now: null,
      maxEndTopicsPeriods: null,
    }
  },

  computed: {
    ...mapState(['Classroom']),

    currentUser() {
      return this.Account.user
    },

    groupOwner() {
      return this.users.find((student) => student['is_owner'])
    },

    isCurrentUserGroupOwner() {
      if (!this.groupOwner) return false
      return this.currentUser.uuid === this.groupOwner.uuid
    },

    isLonely() {
      return this.isCurrentUserGroupOwner && this.groupOwner['is_lonely']
    },

    disableGroupButtons() {
      return !(
        (this.users.length > 1 && this.isCurrentUserGroupOwner) ||
        this.isLonely ||
        this.deadlinePreProject
      )
    },
    today() {
      return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    },
  },

  created() {
    this.$emit('change-header', {})
    this.refreshGroupData()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptRetrievePreProjectAvailableStudents',
      'attemptRetrievePreProjectGroup',
      'attemptDeletePreProjectGroup',
    ]),

    async exitGroup() {
      try {
        this.setFetching(true)
        await this.attemptDeletePreProjectGroup(this.users[0].i_preproject_groups)
        this.closeConfirmExit()
        await this.refreshGroupData()
      } finally {
        this.setFetching(false)
      }
    },

    refreshGroupData() {
      this.setFetching(true)
      this.attemptRetrievePreProjectGroup(this.$route.params['session_uuid'])
        .then((response) => {
          this.users = response.data.group

          this.now = response.data.now
          this.maxEndTopicsPeriods = response.data.maxEndTopicsPeriods

          if (this.maxEndTopicsPeriods) {
            this.deadlinePreProject = this.checkDeadlinePreProject()
          }
        })
        .finally(() => this.setFetching(false))
    },

    showCreateGroup() {
      const sessionUuid = this.$route.params.session_uuid
      const params = { limit: 1000 }
      this.setFetching(true)
      this.attemptRetrievePreProjectAvailableStudents({ sessionUuid, params })
        .then((availableStudents) => {
          this.$refs.modalGroupCreation.openVisualization(availableStudents.data.data)
        })
        .finally(() => this.setFetching(false))
    },

    showIndividualGroup() {
      this.$refs.modalGroupIndividual.toggleVisualization()
    },

    showGroupOrientation() {
      this.$refs.modalGroupOrientation.toggleVisualization()
    },

    openConfirmExit() {
      this.modalConfirmExit = true
    },

    closeConfirmExit() {
      this.modalConfirmExit = false
    },

    checkDeadlinePreProject() {
      const today = new Date(this.now).getTime()
      const endTime = new Date(this.maxEndTopicsPeriods).getTime()

      return today > endTime
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('pre-project-group')"
    class="inner-content"
  >
    <div class="center">
      <div class="pre_project_group">
        <h4 class="pre_project_group__section">
          {{ $t('global:menu.preproject') }}
        </h4>

        <div class="pre_project_group__header">
          <div>
            <h3 class="pre_project_group__title">
              {{ Classroom.data.course.name }}
            </h3>

            <p class="pre_project_group__description">
              {{
                $t(
                  users.length
                    ? 'pre.project.panel.group:create.leave.or.create'
                    : 'pre.project.panel.group:create.group.or.do.alone'
                )
              }}
            </p>
            <ButtonGroupInfo @click="showGroupOrientation" />
          </div>
        </div>

        <GroupList
          :users="users"
          :is-owner="isCurrentUserGroupOwner"
          :is-lonely="isLonely"
          :deadline-pre-project="deadlinePreProject"
          @group:exit="openConfirmExit"
        />

        <GroupButtons
          :has-group="Boolean(users.length)"
          :is-lonely="isLonely"
          @group:create="showCreateGroup"
          @group:individual="showIndividualGroup"
        />
      </div>
    </div>

    <ModalGroupCreation
      ref="modalGroupCreation"
      :course-name="Classroom.data.course.name"
      @update:view="refreshGroupData"
    />

    <ModalGroupIndividual
      ref="modalGroupIndividual"
      @update:view="refreshGroupData"
    />

    <ModalGroupOrientation ref="modalGroupOrientation" />

    <ModalConfirm
      :active="modalConfirmExit"
      :title="$t('pre.project.panel.group:exit:confirm:title')"
      :confirm-btn-text="`${$t('global:yes')}, ${$t('global:leave')}`"
      @close="closeConfirmExit"
      @confirm="exitGroup"
    >
      <p class="text-color">
        {{ $t('pre.project.panel.group:exit:confirm:description') }}
      </p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import './MyGroups.scss';
</style>
