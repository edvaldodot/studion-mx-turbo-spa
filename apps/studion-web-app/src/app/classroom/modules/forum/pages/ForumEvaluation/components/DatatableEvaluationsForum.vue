<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptySearchFeedback from '@/components/shared/EmptySearchFeedback/'

import TDEvaluationForum from './TDEvaluationForum.vue'

export default defineComponent({
  name: 'DatatableEvaluationsForum',

  components: {
    Action,
    Datatable,
    EmptySearchFeedback,
    TDEvaluationForum,
  },

  props: {
    evaluations: {
      type: Array,
      default: () => [],
    },

    isSearching: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState(['accessibility', 'forums']),
  },
  methods: {
    /**
     * @param {string | number | null} grade
     * @returns {string}
     */
    getGrade(grade) {
      if (grade === null) {
        return '-'
      }
      if (grade === '0') {
        return this.$t('classroom.forum:evaluate:not.rated')
      }
      return grade.replace('.', ',')
    },
    handleNavigate(applicationUserId) {
      const { id, session_uuid } = this.$route.params
      this.$router.push({
        name: 'classroom.forum.evaluation.student',
        params: { session_uuid, id, applicationUserId },
      })
    },
  },
})
</script>

<template>
  <div class="management-evaluations__table">
    <template v-if="evaluations.length">
      <div class="datatable__evaluations">
        <Datatable
          :items="evaluations"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="500"
              >
                <span class="clamp-line">
                  {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
                </span>
              </th>

              <th
                class="th"
                width="100"
              >
                <span class="clamp-line">{{ $t('global:posts') }} </span>
              </th>

              <th
                class="th"
                width="130"
              >
                <span class="clamp-line">
                  {{ $t('classroom.forum:posts.title') }}
                </span>
              </th>

              <th
                class="th"
                width="155"
              >
                <span class="clamp-line"> {{ $t('global:grades') }}</span>
              </th>

              <th
                class="th"
                width="80"
              ></th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="{ item }"
          >
            <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
              <TDEvaluationForum label="classroom.assessments.evaluation:datatable.header.10">
                <span class="teste-td-aluno"> {{ item.studentName }}</span>
              </TDEvaluationForum>

              <TDEvaluationForum label="global:posts">
                {{ item.numPosts }}
              </TDEvaluationForum>

              <TDEvaluationForum label="classroom.forum:posts.title">
                {{ item.numComments }}
              </TDEvaluationForum>

              <TDEvaluationForum label="global:grades">
                {{ getGrade(item.studentInteractionsGrade) }}
              </TDEvaluationForum>

              <td class="td td-actions">
                <Action
                  v-if="item.isCompleted"
                  type="button"
                  :text="
                    item.status === 'not_evaluated'
                      ? $t('rating:button.evaluate')
                      : $t('rating:button.not.evaluate')
                  "
                  ating:button.evaluate
                  class="btn-evaluation"
                  @click="handleNavigate(item.applicationUserId)"
                />
              </td>
            </tr>
          </template>
        </Datatable>
      </div>
    </template>

    <EmptySearchFeedback
      v-else
      :is-searching="isSearching"
      no-items
    />
  </div>
</template>

<style lang="scss">
@import './styles.scss';
</style>
