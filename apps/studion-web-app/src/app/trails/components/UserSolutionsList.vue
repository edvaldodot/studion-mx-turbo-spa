<script>
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Loading from '@/components/general/Loading'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import ModalInformation from '@/components/general/ModalInformation'

export default {
  components: {
    Action,
    Loading,
    Datatable,
    Dropdown,
    DropdownLink,
    Icon,
    ModalInformation,
  },
  props: {
    userId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      solutions: [],
      loading: true,
      selectedStatus: {
        status: null,
      },
    }
  },
  mounted() {
    this.attemptTrailsSessionUserSolutionsRetrieval({ appUserId: this.userId })
      .then(({ data }) => {
        this.solutions = data
        const hasProcessingStatus = data.find(
          (course) => course.enrollmentOnPathCourseStatus === 'pending'
        )
        if (hasProcessingStatus) this.$emit('toast')
      })
      .catch((error) => {
        if (error.response.data.message === 'paths_course_session_not_found') {
          this.setFeedback({ message: this.$t('trails.users:modal.solutions.not.found') })
        }
        this.$emit('error')
      })
      .finally(() => {
        this.loading = false
        this.$nextTick(() => {
          this.$parent.$emit('refresh-transition')
        })
      })
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptTrailsSessionUserSolutionsRetrieval',
      'attemptGetUserTrailErrorSheet',
    ]),
    resolveStudentStatus(statusAlias) {
      switch (statusAlias) {
        case 'nao_iniciou':
          return 'trails.users:modal.solution.status.notstarted'
        case 'em_andamento':
          return 'trails.users:modal.solution.status.inprogress'
        case 'aprovado':
          return 'trails.users:modal.solution.status.approved'
        case 'reprovado':
          return 'trails.users:modal.solution.status.disapproved'
        case 'expirado':
          return 'trails.users:modal.solution.status.expired'
        case 'desistente':
          return 'trails.users:modal.solution.status.quitter'
        case 'realizado':
          return 'global:solution.status.realizado'
      }
    },

    downloadErrorSpreadsheet() {
      const trailId = this.$route.params.id
      if (!trailId) return

      const payload = {
        appUserId: this.userId,
        pathId: this.$route.params.id,
      }

      this.attemptGetUserTrailErrorSheet(payload)
        .then(() => {
          this.setFeedback({ message: this.$t('trails.users:modal.feedback.spreadsheet.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('trails.users:modal.confirm.feedback.error') })
        })
    },

    openChangeStatusModal(enrollmentId, sessionId) {
      this.$router.push({
        name: 'session.enroll.change-status',
        params: {
          trailId: this.$route.params.id,
          id: sessionId,
          enrollmentId: enrollmentId,
        },
      })
    },
    orderSolutions(solutions) {
      if (!solutions) return []

      return solutions.sort((currentSolution, nextSolution) => {
        if (currentSolution.position < nextSolution) return -1
        if (currentSolution.position > nextSolution) return 1
        if (currentSolution.position === nextSolution) return 0
      })
    },

    getStatus(statusAlias) {
      switch (statusAlias) {
        case 'success':
          return 'finished'
        case 'error':
          return 'err'
        case 'pending':
          return 'processing'
        default:
          return statusAlias
      }
    },

    goToStatusTimeline(enrollmentId, sessionId) {
      this.$router.push({
        name: 'trails.users.status',
        params: {
          name: this.name,
          id: sessionId,
          enrollmentId: enrollmentId,
          trailId: this.$route.params.id,
        },
      })
    },

    showOptions(item) {
      if (this.getStatus(item.enrollmentOnPathCourseStatus) !== 'finished') return false

      return (
        this.canRead('sessions:enrollment_status_change') ||
        this.canWrite('sessions:enrollment_status_change')
      )
    },
  },
}
</script>

<template>
  <div class="user-solutions-list">
    <div
      v-if="loading"
      class="text-center"
    >
      <Loading
        ref="loading"
        class="mt-3"
      />
    </div>
    <Datatable
      v-else
      :items="solutions"
      class="mt-5"
    >
      <template slot="thead">
        <tr>
          <th class="th col-5">
            {{ $t('trails.users:datatable.trail.courses') }}
          </th>
          <th class="th col-3">
            {{ $t('trails.users:datatable.enrollment.status') }}
          </th>
          <th class="th col-3">
            {{ $t('trails.users:datatable.user.status') }}
          </th>
          <th class="th col-1"></th>
        </tr>
      </template>
      <template
        slot="tbody"
        slot-scope="solutionsItem"
      >
        <tr class="my-4">
          <td class="td course-name h-5rem">
            <span class="td-text bolder">{{ solutionsItem.item.enrollmentId }}</span>
            <span class="td-text">{{ solutionsItem.item.courseName }}</span>
          </td>
          <td class="td">
            <span
              class="td-tag --status"
              @click="
                selectedStatus.status = getStatus(solutionsItem.item.enrollmentOnPathCourseStatus)
              "
            >
              <span>
                {{ $t(`global:${getStatus(solutionsItem.item.enrollmentOnPathCourseStatus)}`) }}
              </span>
              <Loading
                v-if="getStatus(solutionsItem.item.enrollmentOnPathCourseStatus) === 'processing'"
              />
              <Icon
                v-if="getStatus(solutionsItem.item.enrollmentOnPathCourseStatus) === 'finished'"
                name="check-all"
                class="--success"
                wrapper
                size="medium"
              />
              <Icon
                v-if="getStatus(solutionsItem.item.enrollmentOnPathCourseStatus) === 'err'"
                name="close"
                class="--err"
                wrapper
                size="medium"
              />
            </span>
          </td>
          <td
            width="110"
            class="td text-center"
          >
            <span class="td-tag td-tag-full">{{
              $t(resolveStudentStatus(solutionsItem.item.enrollmentStatus))
            }}</span>
          </td>
          <td
            width="10"
            class="td text-right"
          >
            <Dropdown
              v-if="showOptions(solutionsItem.item)"
              icon="dots-vertical"
              right
            >
              <Dropdown-link
                v-if="
                  canRead('sessions:enrollment_status_change') &&
                  canWrite('sessions:enrollment_status_change')
                "
                type="button"
                flat
                :text="$t('trails.users:datatable.dropdown.status')"
                @click="
                  openChangeStatusModal(
                    solutionsItem.item.enrollmentId,
                    solutionsItem.item.sessionId
                  )
                "
              />
              <DropdownLink
                v-if="canRead('sessions:enrollment_status_change')"
                flat
                type="button"
                :text="$t('global:status.history')"
                @click="
                  goToStatusTimeline(solutionsItem.item.enrollmentId, solutionsItem.item.sessionId)
                "
              />
            </Dropdown>
          </td>
        </tr>
      </template>
    </Datatable>

    <ModalInformation
      :active="!!selectedStatus.status"
      class="status-modal"
      is-page
      closable
      back
      @close="
        () => {
          selectedStatus.status = null
        }
      "
    >
      <template #title>
        {{ $t(`trails.users:datatable.status.${selectedStatus.status}.title`) }}
      </template>
      <template #description>
        <p class="text-center">
          {{ $t(`trails.users:datatable.status.${selectedStatus.status}.description`) }}
        </p>
      </template>
      <template #actions>
        <div class="text-center">
          <Action
            v-if="selectedStatus.status === 'err'"
            :text="$t('community.sessions:modal.batch.processing.completition.download_sheet')"
            type="button"
            secondary
            large
            @click="downloadErrorSpreadsheet()"
          />
        </div>
      </template>
    </ModalInformation>
  </div>
</template>
<style lang="scss">
.status-modal .text-center {
  width: 100%;
}
</style>
