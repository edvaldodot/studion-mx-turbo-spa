<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'

import Action from '@/components/general/Action'
import EmptyMessage from '@/components/general/EmptyMessage'
import ModalDialog from '@/components/general/ModalInformation'
import Tooltip from '@/components/general/Tooltip'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Pagination from '@/components/general/Pagination'

import { defaultFilterListOrderOptions } from './options'
import DatatableAvailableStudents from '@/app/classroom/modules/pre_project/components/ModalGroupCreation/components/DatatableAvailableStudents.vue'

export default defineComponent({
  name: 'ModalAddGroup',

  components: {
    Action,
    DatatableAvailableStudents,
    EmptyMessage,
    ModalDialog,
    Tooltip,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Pagination,
  },

  mixins: [paginateMixin],

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      min: 2,
      max: 5,
      addType: 'create',
      selectedStudents: [],
    }
  },

  computed: {
    ...mapState({
      currentPreProjectConfig: ({ Classroom }) => Classroom.data && Classroom.data.preProject,
    }),

    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },

    availableStudents() {
      return this.pgtrCurrentData.map((item) => ({
        ...item,
        selected: this.selectedStudents.includes(item.enrollment_id),
      }))
    },

    selectedStudentsCount() {
      return this.selectedStudents.length
    },

    reachedGroupQuantityLimit() {
      return this.selectedStudentsCount >= this.max
    },

    reachedGroupMinQuantityLimit() {
      if (this.selectedStudentsCount === 1) {
        return true
      }
      if (this.selectedStudentsCount >= 2) {
        return this.selectedStudentsCount >= this.min
      }

      return false
    },
    SessionUuid() {
      return this.$route.params.session_uuid
    },
    isEditing() {
      return !!this.$route.params.id
    },
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
    const { min, max } = this.currentPreProjectConfig.meta
    this.min = min
    this.max = max

    if (!this.isEditing) {
      return this.setup()
    }

    const params = this.$route.params

    this.setFetching(true)
    this.attemptGetPreProjectGroupDetails({
      sessionUuid: params.session_uuid,
      id: params.id,
      filter: true,
    })
      .then(({ data }) => {
        this.selectedStudents = data.group.map((student) => {
          return student.enrollment_id
        })
        this.setup(params.id)
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'attemptCreatePreprojectGroup',
      'attemptEditPreprojectGroup',
      'attemptGetPreProjectGroupDetails',
      'setFeedback',
      'setFetching',
    ]),

    close() {
      this.$router.push({
        name: 'classroom.pre.project.management',
      })
    },

    setup(id) {
      const payload = {
        sessionUuid: this.SessionUuid,
      }

      if (id !== null && id !== undefined && id !== '') {
        payload.id = id
      }

      this.pgtrInitializePagination('attemptPreProjectStudentList', payload)
    },

    toggleStudent(event, data) {
      const key = 'enrollment_id'

      if (data) {
        this.selectedStudents.push(event[key])
        return
      }

      let idx = this.selectedStudents.findIndex((item) => {
        return item === event[key]
      })

      if (idx > -1) this.selectedStudents.splice(idx, 1)
    },

    mountPayload() {
      const payload = {
        session_uuid: this.SessionUuid,
        owner_id: this.selectedStudents[0],
        lonely: this.selectedStudents.length === 1,
        enrollments: this.selectedStudents,
        pre_project_id: this.currentPreProjectConfig.id,
      }

      if (this.isEditing) {
        payload.pre_project_id = this.$route.params.id
      }

      return payload
    },

    submit() {
      const submitAction = this.isEditing
        ? this.attemptEditPreprojectGroup
        : this.attemptCreatePreprojectGroup

      const payload = this.mountPayload()

      this.setFetching(true)
      submitAction(payload)
        .then(() => {
          this.$router.push({
            name: 'classroom.pre.project.management',
          })
          this.$emit('refresh')
          if (
            this.currentPreProjectConfig &&
            this.currentPreProjectConfig.totalGroups >= 0 &&
            !this.isEditing
          ) {
            this.currentPreProjectConfig.totalGroups++
          }
          this.setFeedback({
            message: !this.isEditing
              ? this.$t('pre.project.management.create.group.feedback')
              : this.$t('pre.project.management.edit.group.feedback'),
          })
        })
        .catch(({ response }) => {
          const message = response.data.message

          if (message === 'number_participants_is_above_the_maximum_allowed') {
            this.setFeedback({
              message: this.$t('pre.project.management.edit.error.maximum.feedback'),
              type: 'error',
            })
            return
          }
          this.setFeedback({
            message: !this.isEditing
              ? this.$t('pre.project.management.create.error.feedback')
              : this.$t('pre.project.management.edit.error.feedback'),
            type: 'error',
          })
        })
        .finally(() => this.setFetching(false))
    },
  },
})
</script>

<template>
  <ModalDialog
    :active="true"
    class="modal-add-creation"
    is-page
    closable
    @close="close"
  >
    <template #pre-content>
      <p class="modal-add-creation-title">
        {{
          isEditing
            ? $t('pre.project.management.modal.add.group.edit.title')
            : $t('pre.project.panel.group:modal.create.group:pre.content')
        }}
      </p>
    </template>

    <template #description>
      <FilterList class="py-4">
        <FilterListOrder
          slot="order"
          :initial-value="pgtrParams.order"
          :options="filterListOrderOptions"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
        <FilterListSearch
          slot="search"
          :initial-value="pgtrParams.query['name']"
          hide-error-details
          @search="pgtrSetSearch('name', $event)"
        />
      </FilterList>
    </template>

    <template #content>
      <div v-if="availableStudents.length">
        <DatatableAvailableStudents
          :items="availableStudents"
          :reached-limit="reachedGroupQuantityLimit"
          :datatable-header="$t('pre.project.management.datatable.available.student.header')"
          @student:toggle="toggleStudent"
        />

        <p class="students-count">
          {{ $t('pre.project.panel.group:modal.create.group:table:count') }}
          <span>{{ selectedStudentsCount }}/{{ max }}</span>
        </p>
        <Pagination
          :active-page="pgtrParams.page"
          :page-count="pgtrLastPage"
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
          @change-items-per-page="pgtrParams.limit = $event"
        />
      </div>

      <EmptyMessage v-else>
        <p>{{ $t('pre.project.panel.group:modal.orientation:empty:participants') }}</p>
      </EmptyMessage>
    </template>
    <template #actions>
      <template v-if="reachedGroupMinQuantityLimit">
        <Action
          :text="
            isEditing
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
                isEditing
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
  </ModalDialog>
</template>

<style lang="scss">
@import './ModalAddGroup.scss';

.modal-add-creation {
  .modal-add-creation-title {
    font-size: 2.3em;
    font-weight: 700;
    text-transform: none;
  }

  .modal-add-filter {
    text-align: right;
  }
  .modal-confirm-description li:before {
    content: '';
    width: 0;
    height: 0;
    background: none;
  }
}
</style>
