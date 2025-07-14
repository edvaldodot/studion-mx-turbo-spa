<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import EmptyMessage from '@/components/general/EmptyMessage'
import Modal from '@/components/general/Modal'

export default defineComponent({
  name: 'ModalDatatableProject',

  components: {
    Action,
    Datatable,
    DatatableCollapseRow,
    EmptyMessage,
    Modal,
  },

  data() {
    return {
      itemsWithDropdown: [],
      preProjectGroup: null,
      groupList: [],
    }
  },

  computed: {
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },

  watch: {
    groupList: {
      handler(newItems) {
        this.itemsWithDropdown = newItems.map((item) => {
          return Object.assign({}, item, { dropdown: true })
        })
      },
      immediate: true,
    },
  },

  created() {
    this.setup()
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptPreProjectSessionGroup']),

    getStudentsNameLabel(evaluations) {
      const names = evaluations.map((evaluation) => evaluation.name)
      const firstTwoNames = names.slice(0, 2).join(', ')
      const restCount = names.length - 2

      return restCount > 0 ? `${firstTwoNames} +${restCount}` : firstTwoNames
    },

    showHighestGradeCondition(item) {
      const { lastTryIsGrade, lastTryGrade, attempts, gradeFormat, highestGrade } = item

      const isHiddenGradeFormat = this.equalsProfile('student') && gradeFormat === 'hidden'

      return (
        !highestGrade ||
        isHiddenGradeFormat ||
        (lastTryIsGrade === null && attempts === null) ||
        (attempts === 1 && lastTryGrade === null)
      )
    },

    getFormattedGrade(grade) {
      return grade > 0 ? grade.replace('.', ',') : '0'
    },

    buttonLabel(status) {
      return this.$t(
        status === 'awaiting_correction' && !this.equalsProfile('student')
          ? 'classroom.assessments.evaluation:correct.last.attempt'
          : 'classroom.assessments.evaluation:see.last.attempt'
      )
    },

    setup() {
      const payload = {
        session_uuid: this.sessionUuid,
        examination_id: this.$route.params.id,
      }

      this.setFetching(true)
      this.attemptPreProjectSessionGroup(payload)
        .then(({ data }) => {
          this.mountArray(data)
        })
        .catch(() => {
          this.setFetching(false)
          this.setFeedback({ message: this.$t('global:error'), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    mountArray(data) {
      const grupos = {}

      data.forEach((enrollment) => {
        const groupId = enrollment.groupId
        if (!grupos[groupId]) {
          grupos[groupId] = []
        }
        grupos[groupId].push(enrollment)
      })

      const result = Object.keys(grupos).map((groupId) => ({
        preProjectExaminationName: grupos[groupId][0].preProjectExaminationName,
        enrollments: grupos[groupId],
        id: 84,
      }))

      this.groupList = result
    },

    openEvaluation(item) {
      this.$router.push({
        name: 'classroom.lessons.course.project.admin.access',
        params: {
          id: item.examinationLastTryId,
          sessionUuid: this.sessionUuid,
          type: 'examination',
        },
        meta: {
          isFromProject: true,
          isFromActivity: true,
        },
      })
    },
  },
})
</script>

<template>
  <div>
    <Modal
      :active="true"
      is-page
      :data-test="$testId('modal-preproject-tcc')"
      class="modal-datatable-projetc"
      @close="$router.back()"
    >
      <span class="modal-subtitle">{{
        $t('classroom.pre.project:modal.datatable.group.title')
      }}</span>

      <h2 class="modal-title text-color">
        {{ groupList[0] ? groupList[0].preProjectExaminationName : '' }}
      </h2>
      <div class="modal-description text-color">
        <p class="text-color">
          {{ $t('classroom.pre.project:modal.datatable.group.description') }}
        </p>
      </div>
      <div
        :data-testid="$testId('datatable-pre-project')"
        class="center datatable-with-collapse px-4"
      >
        <Datatable
          v-if="itemsWithDropdown.length"
          :items="itemsWithDropdown"
        >
          <template
            v-if="!$media.mobile"
            slot="thead"
          >
            <tr>
              <th
                class="th"
                width="100%"
              >
                <span class="clamp-line">
                  {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
                </span>
              </th>

              <th class="th"></th>
              <th
                width="75"
                class="th"
              ></th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="{ item }"
          >
            <tr
              class="tr-parent-dropdown"
              :class="{ 'is-open': item.dropdown }"
            >
              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                  {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
                </span>

                <span class="td-text clamp-line">{{ getStudentsNameLabel(item.enrollments) }}</span>
              </td>

              <td class="td col-2">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line bolder"
                >
                </span>
              </td>

              <td class="td td-actions">
                <Action
                  type="button"
                  :icon="item.dropdown ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  class="btn-dropdown text-right"
                  @click="item.dropdown = !item.dropdown"
                />
              </td>
            </tr>
            <DatatableCollapseRow
              v-if="item.dropdown"
              :colspan="6"
              :open="item.dropdown"
            >
              <Datatable
                v-if="item.enrollments"
                :items="item.enrollments"
                class="details"
              >
                <template slot="thead">
                  <tr v-if="!$media.mobile">
                    <th class="th col-3">
                      <span class="clamp-line">{{ $t('global:form.name') }}</span>
                    </th>
                    <th class="th col-2">
                      <span class="clamp-line">{{ $t('global:shipping') }}</span>
                    </th>
                    <th class="th">
                      <span
                        v-if="!$isEnabledFeature('examination_tool_feature')"
                        class="clamp-line"
                      >
                        {{ $t('classroom.assessments.evaluation:datatable.header.6') }}
                      </span>
                    </th>
                    <th class="th">
                      <span class="clamp-line">
                        {{
                          $t(
                            $isEnabledFeature('examination_tool_feature')
                              ? 'classroom.assessments.evaluation:datatable.header.7'
                              : 'classroom.assessments.evaluation:datatable.header.8'
                          )
                        }}
                      </span>
                    </th>

                    <th class="th">
                      <span class="clamp-line">{{ $t('global:status') }}</span>
                    </th>

                    <th class="th"></th>
                  </tr>
                </template>

                <template
                  slot="tbody"
                  slot-scope="innerProps"
                >
                  <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
                    <td class="td">
                      <span
                        v-if="$media.mobile"
                        class="td-text-header clamp-line bolder"
                      >
                        {{ $t('classroom.assessments.evaluation:datatable.header.5') }}
                      </span>
                      <span class="td-text clamp-line">
                        {{ innerProps.item.name }}
                      </span>
                    </td>

                    <td class="td">
                      <span
                        v-if="$media.mobile"
                        class="td-text-header clamp-line bolder"
                      >
                        {{ $t('global:shipping') }}
                      </span>
                      <span class="td-text clamp-line">
                        {{
                          innerProps.item.examinationSentTime
                            ? formatDate(innerProps.item.examinationSentTime, 'long')
                            : '-'
                        }}
                      </span>
                    </td>

                    <td class="td">
                      <span
                        v-if="$media.mobile && !$isEnabledFeature('examination_tool_feature')"
                        class="td-text-header clamp-line bolder"
                      >
                        {{ $t('classroom.assessments.evaluation:datatable.header.6') }}
                      </span>

                      <span
                        v-if="
                          innerProps.item.examinationTries &&
                          !$isEnabledFeature('examination_tool_feature')
                        "
                        class="td-tag"
                        v-html="
                          $t('classroom.assessments.evaluation:attempts', {
                            num1:
                              innerProps.item.examinationAttempts > 0
                                ? innerProps.item.examinationAttempts
                                : 0,
                            num2: innerProps.item.examinationTries,
                          })
                        "
                      ></span>

                      <span
                        v-if="
                          !innerProps.item.examinationTries &&
                          !$isEnabledFeature('examination_tool_feature')
                        "
                        class="td-tag clamp-line"
                      >
                        {{ innerProps.item.examinationAttempts }}
                      </span>
                    </td>

                    <td class="td">
                      <span
                        v-if="$media.mobile"
                        class="td-text-header clamp-line bolder"
                      >
                        {{
                          $t(
                            $isEnabledFeature('examination_tool_feature')
                              ? 'classroom.assessments.evaluation:datatable.header.7'
                              : 'classroom.assessments.evaluation:datatable.header.8'
                          )
                        }}
                      </span>

                      <span class="td-text clamp-line">{{
                        showHighestGradeCondition(innerProps.item)
                          ? '-'
                          : getFormattedGrade(innerProps.item.highestGrade)
                      }}</span>
                    </td>

                    <td
                      class="td"
                      width="250"
                    >
                      <span
                        v-if="$media.mobile"
                        class="td-text-header clamp-line bolder"
                      >
                        {{ $t('global:status') }}
                      </span>

                      <span
                        v-if="innerProps.item.gradeFormat === 'hidden' && equalsProfile('student')"
                        class="td-text column-td bolder"
                      >
                        {{ $t('classroom.assessments.evaluation:status.resolved') }}
                      </span>

                      <span
                        v-else
                        class="td-text"
                      >
                        {{
                          $t(`classroom.assessments.evaluation:status.${innerProps.item.status}`)
                        }}
                      </span>
                    </td>

                    <td class="td td-actions">
                      <Action
                        v-if="
                          innerProps.item.status !== 'not_started' ||
                          innerProps.item.status !== 'starded'
                        "
                        :data-testid="$testId('action-button--submit')"
                        :text="
                          innerProps.item.status === 'awaiting_correction'
                            ? $t('classroom.assessments.evaluation:correct')
                            : $t('classroom.assessments.evaluation:datatable.header.15')
                        "
                        type="button"
                        small
                        flat
                        @click="openEvaluation(innerProps.item)"
                      />
                    </td>
                  </tr>
                </template>
              </Datatable>
            </DatatableCollapseRow>
          </template>
        </Datatable>

        <EmptyMessage v-else>
          <h2>{{ $t('global:search.empty.title') }}</h2>
        </EmptyMessage>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
@import './ModalDatatableProject.scss';
</style>
