<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import Datatable from '@/components/general/Datatable'
import FirstAndMoreTooltip from '@/components/general/FirstAndMoreTooltip'
import Loading from '@/components/general/Loading'
import Tooltip from '@/components/general/Tooltip'
import Icon from '@/components/general/Icon'

import DatatableSessionsActions from './DatatableSessionsActions.vue'
import SlugTooltip from '@/components/general/SlugTooltip'

export default defineComponent({
  name: 'DatatableSessions',

  components: {
    Datatable,
    DatatableSessionsActions,
    FirstAndMoreTooltip,
    Loading,
    Tooltip,
    SlugTooltip,
    Icon,
  },

  props: {
    sessions: {
      type: Array,
      default: () => [],
    },
    defaultPreferences: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    ...mapState(['accessibility', 'Settings']),
  },

  methods: {
    checkIfColumnIsVisible(name) {
      const { sessions_list = {} } = this.Settings.displayFeatures

      if (!Object.values(sessions_list).filter((item) => item).length)
        return this.defaultPreferences.includes(name)

      return !!sessions_list[name]
    },

    isFinished(session) {
      if (!session.availability.final) return true
      const availabilityFinal = session.availability.final
      const finalDate = new Date(availabilityFinal)
      const finalDateTime = finalDate.getTime()
      const today = Date.now()

      if (finalDateTime < today && session.availability.extended) {
        const extendedDate = new Date(session.availability.extended)
        const extendedDateTime = extendedDate.getTime()
        return extendedDateTime >= today
      }
      return finalDateTime >= today
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('datatable-sessions')"
    class="datatable__sessions"
  >
    <Datatable
      :items="sessions"
      :dark="accessibility"
    >
      <template slot="thead">
        <tr v-if="!$media.mobile">
          <th
            v-if="checkIfColumnIsVisible('offering')"
            class="th"
            width="180"
          >
            {{ $t('community.sessions:datatable.header.6') }}
          </th>

          <th
            v-if="checkIfColumnIsVisible('solution')"
            class="th"
            width="180"
          >
            {{ $t('community.sessions:datatable.header.7') }}
          </th>

          <th
            v-if="checkIfColumnIsVisible('session')"
            class="th"
            width="180"
          >
            {{ $t('community.sessions:datatable.header.2') }}
          </th>

          <th
            v-if="checkIfColumnIsVisible('slug') && $isEnabledFeature('slug_identity')"
            class="th"
            width="180"
          >
            {{ $t('global:slug.identity') }}
          </th>

          <th
            v-if="checkIfColumnIsVisible('createdat')"
            class="th"
            width="180"
          >
            {{ $t('community.sessions:datatable.header.8') }}
          </th>

          <th
            v-if="checkIfColumnIsVisible('vacancy')"
            class="th vacancies"
            width="180"
          >
            <Tooltip
              :uppercase="false"
              :width="230"
              medium-font
              shadow
              dark
            >
              <template v-slot:activator="{ on }">
                <span v-on="on"
                  >{{ $t('community.sessions:datatable.header.3') }}
                  <Icon
                    name="help"
                    class="question-feedback-icon"
                    size="small"
                    wrapper
                  />
                </span>
              </template>
              <span>{{ $t('community.sessions:datatable.header.3.tooltip') }}</span>
            </Tooltip>
          </th>

          <th
            v-if="checkIfColumnIsVisible('start')"
            class="th"
            width="180"
          >
            {{ $t('community.sessions:datatable.header.4') }}
          </th>

          <th
            v-if="checkIfColumnIsVisible('end')"
            class="th"
            width="180"
          >
            {{ $t('community.sessions:datatable.header.5') }}
          </th>

          <th
            v-if="$isEnabledFeature('branching') && checkIfColumnIsVisible('branch')"
            class="th"
            width="180"
          >
            {{ $tc('global:branch', 1) }}
          </th>

          <th
            v-if="checkIfColumnIsVisible('category')"
            class="th"
            width="180"
          >
            {{ $tc('global:category', 1) }}
          </th>

          <th
            class="th fixed-col"
            width="100"
          ></th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="props"
      >
        <template v-if="$media.mobile">
          <tr
            v-if="checkIfColumnIsVisible('offering')"
            class="no-bb"
          >
            <td
              class="td"
              colspan="3"
            >
              <span class="td-text-header">
                {{ $t('community.sessions:datatable.header.6') }}
              </span>

              <span class="td-text bolder">
                {{ props.item.offering ? props.item.offering.title : '-' }}
              </span>
            </td>
          </tr>

          <tr
            v-if="checkIfColumnIsVisible('createdat')"
            class="no-bb"
          >
            <td
              class="td"
              colspan="3"
            >
              <span class="td-text-header">
                {{ $t('community.sessions:datatable.header.8') }}
              </span>

              <span class="td-text bolder">
                {{ formatDate(props.item.createdAt) }}
              </span>
            </td>
          </tr>

          <tr class="no-bb">
            <td
              v-if="checkIfColumnIsVisible('solution')"
              class="td"
            >
              <span class="td-text-header">{{ $t('community.sessions:datatable.header.7') }}</span>
              <span class="td-text">{{ props.item.course.name }}</span>
            </td>

            <td
              v-if="checkIfColumnIsVisible('session')"
              class="td"
            >
              <span class="td-text-header">
                {{ $t('community.sessions:datatable.header.2') }}
              </span>

              <span class="td-text">{{ props.item.name }}</span>
            </td>

            <td
              v-if="checkIfColumnIsVisible('slug') && $isEnabledFeature('slug_identity')"
              class="td"
            >
              <span class="td-text-header">
                {{ $t('global:slug.identity') }}
              </span>

              <SlugTooltip :slug="props.item.slug" />
            </td>

            <td class="td td-actions text-right">
              <DatatableSessionsActions
                :props="{
                  item: {
                    type: props.item.type,
                    isRecovery: props.item.recoveryExamination,
                    isClosed: isFinished(props.item),
                  },
                }"
                @open:timeline-modal="$emit('open:timeline-modal', props.item)"
                @open:modal="$emit('open:modal', { item: props.item, index: props.index })"
                @open:remove-modal="
                  $emit('open:remove-modal', { item: props.item, index: props.index })
                "
                @access:classroom="$emit('access:classroom', props.item.uuid)"
                @open:recovery-modal="$emit('open:recovery-modal', props.item)"
              />
            </td>
          </tr>

          <tr class="no-bb">
            <td
              v-if="$isEnabledFeature('branching') && checkIfColumnIsVisible('branch')"
              class="td"
            >
              <span class="td-text-header">
                {{ $tc('global:branch', 1) }}
              </span>

              <FirstAndMoreTooltip :list="props.item.course.branches" />
            </td>

            <td
              v-if="checkIfColumnIsVisible('category')"
              class="td"
            >
              <span class="td-text-header">
                {{ $tc('global:category', 1) }}
              </span>

              <FirstAndMoreTooltip :list="props.item.course.categories" />
            </td>
          </tr>

          <tr>
            <td
              v-if="checkIfColumnIsVisible('vacancy')"
              class="td"
            >
              <span class="td-text-header">
                {{ $t('community.sessions:datatable.header.3') }}
              </span>

              <span
                v-if="props.item.pendingBatch === 0"
                class="td-text"
              >
                <span class="bolder">
                  {{ props.item.vacancy.enrollments ? props.item.vacancy.enrollments : '-' }}
                </span>

                <span style="display: inline-flex; font-weight: normal">
                  / {{ props.item.vacancy.free ? '-' : props.item.vacancy.max_vacancy }}
                </span>
              </span>

              <span
                v-else
                class="td-text batch-processing"
              >
                <span class="bolder">
                  {{
                    $tc('community.sessions:batch.processing', props.item.pendingBatch, {
                      amount: props.item.pendingBatch,
                    })
                  }}
                </span>

                <span class="td-tag">
                  <span>{{ $t('global:processing') }}</span>

                  <Loading />
                </span>
              </span>
            </td>

            <td
              v-if="checkIfColumnIsVisible('start')"
              class="td"
            >
              <span class="td-text-header">
                {{ $t('community.sessions:datatable.header.4') }}
              </span>

              <span class="td-text">
                {{
                  props.item.availability.initial
                    ? formatDate(props.item.availability.initial)
                    : '-'
                }}
              </span>
            </td>

            <td
              v-if="checkIfColumnIsVisible('end')"
              class="td"
            >
              <span class="td-text-header">
                {{ $t('community.sessions:datatable.header.5') }}
              </span>

              <span class="td-text">
                {{
                  props.item.availability.extended
                    ? formatDate(props.item.availability.extended)
                    : props.item.availability.final
                    ? formatDate(props.item.availability.final)
                    : '-'
                }}
              </span>
            </td>
          </tr>
        </template>

        <tr
          v-else
          class="tr-body"
        >
          <td
            v-if="checkIfColumnIsVisible('offering')"
            class="td"
          >
            <Tooltip
              :uppercase="false"
              :width="230"
            >
              <template #activator="{ on }">
                <span
                  class="td-text bolder clamp-line"
                  v-on="on"
                >
                  {{ props.item.offering ? props.item.offering.title : '-' }}
                </span>
              </template>

              <div>{{ props.item.offering ? props.item.offering.title : '-' }}</div>
            </Tooltip>
          </td>

          <td
            v-if="checkIfColumnIsVisible('solution')"
            class="td"
          >
            <Tooltip
              :uppercase="false"
              :width="230"
            >
              <template #activator="{ on }">
                <span
                  class="td-text bolder clamp-line"
                  v-on="on"
                >
                  {{ props.item.course.name }}
                </span>
              </template>

              <span>{{ props.item.course.name }}</span>
            </Tooltip>
          </td>

          <td
            v-if="checkIfColumnIsVisible('session')"
            class="td"
          >
            <Tooltip
              :uppercase="false"
              :width="230"
            >
              <template #activator="{ on }">
                <span
                  class="td-text bolder clamp-line"
                  v-on="on"
                >
                  {{ props.item.name }}
                </span>
              </template>

              <span>{{ props.item.name }}</span>
            </Tooltip>
          </td>

          <td
            v-if="checkIfColumnIsVisible('slug') && $isEnabledFeature('slug_identity')"
            class="td"
          >
            <SlugTooltip :slug="props.item.slug" />
          </td>

          <td
            v-if="checkIfColumnIsVisible('createdat')"
            class="td"
          >
            <span class="td-text bolder">
              {{ formatDate(props.item.createdAt) }}
            </span>
          </td>

          <td
            v-if="checkIfColumnIsVisible('vacancy')"
            class="td"
          >
            <span
              v-if="props.item.pendingBatch === 0"
              class="td-text"
            >
              <span class="bolder">
                {{ props.item.vacancy.enrollments ? props.item.vacancy.enrollments : '-' }}
              </span>

              <span style="display: inline-flex; font-weight: normal">
                / {{ props.item.vacancy.free ? '-' : props.item.vacancy.max_vacancy }}
              </span>
            </span>

            <span
              v-else
              class="td-text batch-processing"
            >
              <span class="bolder">
                {{
                  $tc('community.sessions:batch.processing', props.item.pendingBatch, {
                    amount: props.item.pendingBatch,
                  })
                }}
              </span>

              <span class="td-tag">
                <span>{{ $t('global:processing') }}</span>

                <Loading />
              </span>
            </span>
          </td>

          <td
            v-if="checkIfColumnIsVisible('start')"
            class="td"
          >
            <span class="td-text">
              {{
                props.item.availability.initial ? formatDate(props.item.availability.initial) : '-'
              }}
            </span>
          </td>

          <td
            v-if="checkIfColumnIsVisible('end')"
            class="td"
          >
            <span class="td-text">
              {{
                props.item.availability.extended
                  ? formatDate(props.item.availability.extended)
                  : props.item.availability.final
                  ? formatDate(props.item.availability.final)
                  : '-'
              }}
            </span>
          </td>

          <td
            v-if="$isEnabledFeature('branching') && checkIfColumnIsVisible('branch')"
            class="td"
          >
            <FirstAndMoreTooltip :list="props.item.course.branches" />
          </td>

          <td
            v-if="checkIfColumnIsVisible('category')"
            class="td"
          >
            <FirstAndMoreTooltip :list="props.item.course.categories" />
          </td>

          <td class="td td-actions">
            <div v-if="!$media.mobile">
              <div class="action">
                <DatatableSessionsActions
                  :props="{
                    item: {
                      type: props.item.type,
                      isRecovery: props.item.recoveryExamination,
                      isClosed: isFinished(props.item),
                    },
                  }"
                  @open:timeline-modal="$emit('open:timeline-modal', props.item)"
                  @open:modal="$emit('open:modal', { item: props.item, index: props.index })"
                  @open:remove-modal="$emit('open:remove-modal', { item: props.item, index: props.index })"
                  @access:classroom="$emit('access:classroom', props.item.uuid)"
                  @open:recovery-modal="$emit('open:recovery-modal', props.item)"
                />
              </div>
            </div>
          </td>
        </tr>
      </template>
    </Datatable>
  </div>
</template>
