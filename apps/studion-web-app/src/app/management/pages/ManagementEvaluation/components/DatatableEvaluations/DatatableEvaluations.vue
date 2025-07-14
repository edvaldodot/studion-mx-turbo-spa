<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import AvatarList from '@/components/general/AvatarList'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Icon from '@/components/general/Icon'
import TooltipSlot from '@/components/general/TooltipSlot'

import ActionsEvaluation from './ActionsEvaluation.vue'
import TdEvaluation from './TdEvaluation.vue'
import SlugTooltip from '@/components/general/SlugTooltip'

export default defineComponent({
  name: 'DatatableEvaluations',

  components: {
    ActionsEvaluation,
    AvatarList,
    Datatable,
    EmptyMessage,
    Icon,
    TooltipSlot,
    TdEvaluation,
    SlugTooltip,
  },

  props: {
    evaluations: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      numberColumns: 7,
    }
  },

  computed: {
    ...mapState(['accessibility']),

    /**
     * Set the datatable width based on the number of visible columns.
     */
    datatableWidth() {
      if (this.$media.mobile) return '100%'
      return `calc(100% + ${this.numberColumns * 8}%)`
    },
  },

  methods: {
    handleCorrect(evaluation) {
      this.$emit('redirect:correct', evaluation)
    },

    handleViewAttempts(evaluation) {
      this.$emit('view:attempts', evaluation)
    },
  },
})
</script>

<template>
  <div
    :style="{ '--width': datatableWidth }"
    class="management-evaluations__table"
  >
    <template v-if="evaluations.length">
      <div class="datatable__evaluations overflow-scroll">
        <Datatable
          :items="evaluations"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('classroom.assessments.evaluation:datatable.header.1')
                }}</span>
              </th>

              <th
                v-if="$isEnabledFeature('slug_identity')"
                class="th"
                width="100"
              >
                <span class="clamp-line">{{ $t('global:slug.identity') }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('classroom.assessments.evaluation:datatable.header.5')
                }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('community.index:modal.datatable.header.3') }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('community.index:modal.datatable.header.2') }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('classroom.assessments.evaluation:datatable.header.11')
                }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('offerings.sessions.edit:session.team.datatable.header.1')
                }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('community.index:datatable.header.status') }}</span>
              </th>

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
            <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
              <TdEvaluation label="classroom.assessments.evaluation:datatable.header.1">
                {{ item.topicName }}
              </TdEvaluation>

              <TdEvaluation
                v-if="$isEnabledFeature('slug_identity')"
                label="classroom.assessments.evaluation:datatable.header.1"
                disable-slot-classes
              >
                <SlugTooltip :slug="item.slug" />
              </TdEvaluation>

              <TdEvaluation label="classroom.assessments.evaluation:datatable.header.5">
                {{ item.studentName }}
              </TdEvaluation>

              <TdEvaluation label="community.index:modal.datatable.header.3">
                {{ item.sessionName }}
              </TdEvaluation>

              <TdEvaluation label="community.index:modal.datatable.header.2">
                <TooltipSlot
                  v-if="item.pathOrOfferName"
                  :uppercase="false"
                  :bold-font="false"
                  :width="250"
                >
                  <template #activator="{ on }">
                    <Icon
                      v-if="item.pathOrOfferName"
                      name="trails"
                      class="mr-1"
                      @mouseenter.native="on.mouseenter"
                      @mouseleave.native="on.mouseleave"
                    />

                    {{ item.solutionName }}
                  </template>

                  <template #content>
                    <div class="management-evaluations__table-tooltip">
                      <p>{{ item.isPath ? $t('global:trail') : $t('global:offering') }}:</p>
                      <p>{{ item.pathOrOfferName }}</p>
                    </div>
                  </template>
                </TooltipSlot>

                <template v-else>
                  {{ item.solutionName }}
                </template>
              </TdEvaluation>

              <TdEvaluation label="classroom.assessments.evaluation:datatable.header.11">
                {{ item.sentDate ? formatDate(item.sentDate, 'long') : '-' }}
              </TdEvaluation>

              <TdEvaluation label="offerings.sessions.edit:session.team.datatable.header.1">
                <AvatarList :users="item.sessionTeams" />
              </TdEvaluation>

              <TdEvaluation label="community.index:datatable.header.status">
                {{ $t(`classroom.assessments.evaluation:status.${item.status}`) }}
              </TdEvaluation>

              <td v-if="$media.mobile" class="td td-actions" >
                <ActionsEvaluation
                  v-if="item.status !== 'not_started'"
                  :evaluation="item"
                  @correct="handleCorrect"
                  @view:attempts="handleViewAttempts"
                />
              </td>
              <td v-if="!$media.mobile">
                <ActionsEvaluation
                  v-if="item.status !== 'not_started'"
                  :evaluation="item"
                  @correct="handleCorrect"
                  @view:attempts="handleViewAttempts"
                />
              </td>
            </tr>
          </template>
        </Datatable>
      </div>
    </template>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>
  </div>
</template>

<style lang="scss">
@import './DatatableEvaluations.scss';
</style>
