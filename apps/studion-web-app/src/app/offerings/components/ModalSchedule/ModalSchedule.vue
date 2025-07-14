<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import { requiredIf } from 'vuelidate/lib/validators'
import { format, parseISO } from 'date-fns'

import Action from '@/components/general/Action'
import Draggable from '@/components/general/Draggable'
import DraggableItem from '@/components/general/DraggableItem'
import Checkbox from '@/components/general/Checkbox'
import Datepicker from '@/components/general/Datepicker'
import SelectField from '@/components/general/SelectField'

export default defineComponent({
  name: 'ModalSchedule',

  components: {
    Action,
    Modal: () => import('@/components/general/Modal'),
    Draggable,
    DraggableItem,
    Checkbox,
    Datepicker,
    SelectField,
  },

  props: {
    active: {
      type: Boolean,
      default: true,
    },
    selectedSession: {
      type: Object,
      default: null,
    },
    sessionTypeName: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      drag: false,
    }
  },

  validations: {
    selectedSession: {
      courses: {
        $each: {
          start_date: {
            required: requiredIf(function (nestedModel) {
              return nestedModel.isCustomPeriod
            }),
          },
          end_date: {
            required: requiredIf(function (nestedModel) {
              return nestedModel.isCustomPeriod && this.currentSessionType === 'closed'
            }),
          },
        },
      },
    },
  },

  computed: {
    ...mapState(['offerings', 'accessibility']),

    offeringIsReady() {
      return this.offerings.current.published
    },

    currentSessionType() {
      return this.offerings.current ? this.offerings.current.meta.sessionType : null
    },

    dragOptions() {
      return {
        animation: 300,
        group: 'solutions',
        disabled: false,
        ghostClass: 'ghost',
        handle: '.handle',
      }
    },
  },

  methods: {
    close() {
      this.$emit('close')
    },

    saveSchedule() {
      this.$v.$touch()
      if (!this.$v.selectedSession.courses.$invalid) {
        this.offerings.current.meta.configs[this.selectedSession.index] = this.selectedSession
        this.close()
      }
    },

    formatDate(date) {
      if (!date) return
      return format(parseISO(date), 'dd/MM/yyyy HH:mm')
    },

    listCourses() {
      if (!this.selectedSession.courses && this.offeringIsReady) {
        return this.offerings.current.meta.data.courses
      }
      return this.selectedSession.courses
    },

    getPrerequisiteName(solution) {
      const prerequisiteSolution = this.listCourses().find(
        (course) => course.id === solution.prerequisite_course_id
      )

      return prerequisiteSolution ? prerequisiteSolution.name : null
    },
  },
})
</script>

<template>
  <Modal
    :active="active"
    :back="offeringIsReady"
    @close="close"
  >
    <div
      v-if="selectedSession"
      class="modal-form modal-add-session"
    >
      <span class="modal-subtitle">{{ $t('offerings.sessions.edit:session.schedule') }}</span>

      <h2 class="modal-title text-color">{{ offerings.current.title }}</h2>

      <div class="modal-description text-color">
        <p class="text-color">
          {{ $t('offerings.sessions.edit:session.modal.schedule.description') }}
        </p>
      </div>

      <form class="form-schedule">
        <p class="form-item-description text-color">
          {{ $t('community.sessions.add:session.information') }}
        </p>

        <div class="session-offering-detail">
          <span class="session-offering-detail-item text-color">
            <div class="text-color">{{ $t('community.sessions.add:session.type') }}</div>

            <b>
              <span
                v-if="sessionTypeName"
                class="text-color"
                >{{ sessionTypeName }}</span
              >
            </b>
          </span>

          <span class="session-offering-detail-item text-color">
            <div>{{ $t('offerings.sessions.edit:form.section.vacancy.title') }}</div>
            <b>
              <span class="text-color">
                {{
                  selectedSession.vacancy ? selectedSession.vacancy : $t('global:form.unlimited')
                }}
              </span>
            </b>
          </span>

          <span class="session-offering-detail-item text-color">
            {{ $t('classroom.assessments.evaluation:datatable.header.2') }}

            <b>
              <br />

              <span v-if="currentSessionType === 'closed'">
                {{
                  `${formatDate(selectedSession.start_date)}  ${$t('global:until')}  ${formatDate(
                    selectedSession.end_date
                  )}`
                }}
              </span>

              <span v-else>{{ formatDate(selectedSession.start_date) }}</span>
            </b>
          </span>
        </div>

        <div class="Solutions-list">
          <Draggable
            v-if="listCourses().length"
            v-bind="dragOptions"
            disabled="true"
            class="mb-8"
            :list="listCourses()"
          >
            <TransitionGroup
              type="transition"
              :name="!drag ? 'flip-list' : null"
            >
              <DraggableItem
                v-for="(solution, index) in listCourses()"
                :key="`solution-${solution.id}`"
                :index="index"
                disabled
              >
                <div class="draggable-item-col pl-3">
                  <p class="text-color">
                    <b>{{ solution.name }}</b>
                  </p>

                  <SelectField
                    v-if="getPrerequisiteName(solution)"
                    :value="getPrerequisiteName(solution)"
                    :label="$t('offerings.solutions:draggable.prerequisite.label')"
                    :items="[
                      { text: getPrerequisiteName(solution), value: getPrerequisiteName(solution) },
                    ]"
                    :show-optional="false"
                    class="mt-3"
                    disabled
                    dark
                  />

                  <Checkbox
                    v-model="solution.isCustomPeriod"
                    :disabled="selectedSession.uuid && solution.published"
                    :items="[
                      {
                        value: true,
                        label: $t('offerings.sessions.edit:session.modal.schedule.checkbox'),
                      },
                    ]"
                    class="checkbox-custom-period"
                    switch-type
                    dark
                  />

                  <div
                    v-if="solution.isCustomPeriod"
                    class="form-group clearfix"
                    data-cols="2"
                    data-gap="40"
                  >
                    <Datepicker
                      v-model="solution.start_date"
                      :label="$t('global:form.start')"
                      :validation="$v.selectedSession.courses.$each[index].start_date"
                      :min="selectedSession.start_date"
                      :max="selectedSession.end_date"
                      :dark="true"
                      :disabled="selectedSession.uuid && solution.published"
                    />

                    <Datepicker
                      v-if="currentSessionType === 'closed'"
                      v-model="solution.end_date"
                      :label="$t('global:form.closure')"
                      :min="solution.start_date"
                      :max="selectedSession.end_date"
                      :validation="$v.selectedSession.courses.$each[index].end_date"
                      :dark="true"
                      :disabled="
                        Boolean(
                          solution.start_date == null ||
                            (selectedSession.uuid && solution.published)
                        )
                      "
                    />
                  </div>
                </div>
              </DraggableItem>
            </TransitionGroup>
          </Draggable>

          <div
            v-else
            class="list-empty"
          >
            <span class="list-empty-title text-center">
              {{ $t('offerings.sessions.edit:session.modal.schedule.empty.title') }}
            </span>
            <p class="list-empty-subtitle text-center">
              {{ $t('offerings.sessions.edit:session.modal.schedule.empty.subtitle') }}
            </p>
          </div>
        </div>

        <div class="form-submit text-center">
          <Action
            v-if="listCourses().length"
            :text="$t('global:save')"
            type="button"
            secondary
            large
            fixed-width
            @click="saveSchedule()"
          />
        </div>
      </form>
    </div>
  </Modal>
</template>

<style lang="scss">
@import 'ModalSchedule.scss';
</style>
