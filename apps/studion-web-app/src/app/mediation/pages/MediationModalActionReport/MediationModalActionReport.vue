<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import { stringifyTransmissions } from '@/domains/mediation/utils'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import Tooltip from '@/components/general/Tooltip'

export default defineComponent({
  name: 'MediationModalActionReport',

  components: {
    Action,
    Datatable,
    DatatableCollapseRow,
    Modal,
    ModalHeader,
    Tooltip,
  },

  data() {
    return {
      report: [],
    }
  },

  computed: {
    ...mapState(['Mediation']),

    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.date.new'),
          value: 0,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 1,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },

    /**
     * Returns the session ID extracted from the route parameters.
     * @return {number} The session ID as a number.
     */
    sessionId() {
      return Number(this.$route.params.session_id)
    },

    /**
     * Retrieve the name of the current session based on the session ID.
     * @return {string|undefined} The name of the current session, or undefined if not found.
     */
    getSessionName() {
      const currentSession = this.Mediation.current.mediationPlan.sessions.find(
        (session) => session.id === this.sessionId
      )
      return currentSession && currentSession.name
    },

    isScheduled() {
      return !!this.$route.params.scheduled
    },
  },

  created() {
    this.setup()
  },

  methods: {
    ...mapActions(['setFetching', 'attemptGetMediationReport']),

    setup() {
      this.setFetching(true)
      this.attemptGetMediationReport({
        mediationId: this.$route.params.id,
        sessionId: this.sessionId,
      })
        .then(({ data }) => {
          const days = Object.keys(data)
          this.report = days.map((day) => {
            return {
              ...data[day],
              dropdown: false,
            }
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * Return reference day
     * @param {Object} item
     * @returns {Number}
     */
    getReferenceDay(item) {
      const [transmissionType] = Object.keys(item).filter((key) => key !== 'dropdown')
      return item[transmissionType][0].day
    },

    /**
     * Return grouped items
     * @param {Object} item
     * @param {String} key
     * @param {String} translated
     *
     * @returns {String}
     */
    getGroup(item, key, translated) {
      const transmissionTypes = Object.keys(item).filter((key) => key !== 'dropdown')
      const keyResults = []

      transmissionTypes.forEach((type) => {
        item[type].forEach((action) => {
          if (translated) keyResults.push(this.$t(`${translated}.${action[key]}`))
          else keyResults.push(action[key])
        })
      })

      return [...new Set(keyResults)].join(', ')
    },

    /**
     * Get right item to show in dropdown
     * @param {Object} item
     * @returns {Array<Object>}
     */
    getChildData(item) {
      const transmissionTypes = Object.keys(item).filter((key) => key !== 'dropdown')
      const data = transmissionTypes.map((type) => {
        return item[type]
      })

      return data.flat()
    },

    /**
     * Return PM's status
     * @param {Object} item
     * @returns {String}
     */
    getStatus(item) {
      if (item.status === 'success') return this.successStatus(item)
      if (item.status === 'error') return this.$t('global:err')
      return '-'
    },

    /**
     * If email or sms return number of dispatches or only finished status
     * @param {Object} item
     * @returns {String}
     */
    successStatus(item) {
      if (!['email', 'sms'].includes(item.transmission)) return this.$t('global:finished')

      return `${item.number_dispatches} ${this.$tc(
        'global:sent',
        item.number_dispatches
      ).toLowerCase()}`
    },

    stringifyTransmissions,

    backScheduled() {
      this.$router.push({ name: this.$route.params.scheduled })
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-mediation-action-report')"
    class="mediation-action-report"
    active
    is-page
    back
    :cancel="!isScheduled"
  >
    <Action
      v-if="isScheduled"
      icon="keyboard_backspace"
      :text="$t('mediation.btn:scheduled.actions')"
      icon-size="medium"
      class="btn-back text-color"
      type="button"
      flat
      @click="backScheduled"
    />
    <ModalHeader
      :sub-title="Mediation.current.mediationPlan.name"
      :title="getSessionName"
      :description="$t('mediation.mediation:modal.actions.title')"
    />

    <Datatable
      :items="report"
      dark
    >
      <template slot="thead">
        <tr>
          <th
            class="th"
            width="5%"
          >
            {{ $t('global:day') }}
          </th>
          <th
            class="th"
            width="10%"
          >
            {{ $t('mediation.actions:datatable.header.1') }}
          </th>
          <th
            class="th"
            width="20%"
          >
            {{ $t('mediation.actions:datatable.header.2') }}
          </th>
          <th
            class="th"
            width="20%"
          >
            {{ $t('mediation.actions:form.referenceDate.label') }}
          </th>
          <th
            class="th"
            width="10%"
          >
            {{ $t('global:form.title') }}
          </th>
          <th
            class="th"
            width="20%"
          >
            {{ $t('global:form.date') }}
          </th>
          <th
            class="th"
            width="10%"
          >
            {{ $t('global:status') }}
          </th>
          <th
            class="th"
            width="5%"
          ></th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr :class="{ 'parent is-open': props.item.dropdown }">
          <td class="td">
            <span class="td-text">{{ getReferenceDay(props.item) }}</span>
          </td>
          <td class="td">
            <span class="td-text bolder">
              {{ stringifyTransmissions(props.item).title.slice(0, -2) }}
            </span>
          </td>
          <td class="td">
            <span class="td-text">{{ getGroup(props.item, 'profile') }}</span>
          </td>
          <td class="td">
            <span class="td-text">{{
              getGroup(props.item, 'reference_date', 'mediation.actions:reference')
            }}</span>
          </td>
          <td class="td">
            <span
              v-if="getGroup(props.item, 'title').length < 40"
              class="td-text"
            >
              {{ getGroup(props.item, 'title') }}
            </span>

            <Tooltip
              v-else
              :uppercase="false"
              shadow
            >
              <template #activator="{ on }">
                <span
                  class="td-text"
                  @mouseenter="on.mouseenter"
                  @mouseleave="on.mouseleave"
                >
                  {{ getGroup(props.item, 'title').slice(0, 40) }}...
                </span>
              </template>
              <span>{{ getGroup(props.item, 'title') }}</span>
            </Tooltip>
          </td>
          <td class="td">
            <span class="td-text"></span>
          </td>
          <td class="td">
            <span class="td-text"></span>
          </td>
          <td class="td">
            <span class="td-text">
              <action
                :icon="props.item.dropdown ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                type="button"
                class="btn-dropdown text-right"
                @click="props.item.dropdown = !props.item.dropdown"
              />
            </span>
          </td>
        </tr>

        <DatatableCollapseRow
          v-if="props.item.dropdown"
          :colspan="8"
          :open="props.item.dropdown"
        >
          <Datatable
            :items="getChildData(props.item)"
            dark
          >
            <template slot="thead">
              <tr>
                <th
                  class="th"
                  width="5%"
                ></th>
                <th
                  class="th"
                  width="10%"
                ></th>
                <th
                  class="th"
                  width="20%"
                ></th>
                <th
                  class="th"
                  width="20%"
                ></th>
                <th
                  class="th"
                  width="10%"
                ></th>
                <th
                  class="th"
                  width="20%"
                ></th>
                <th
                  class="th"
                  width="10%"
                ></th>
              </tr>
            </template>
            <template
              slot="tbody"
              slot-scope="innerProps"
            >
              <tr>
                <td class="td">
                  <span class="td-text"></span>
                </td>
                <td class="td">
                  <span class="td-text">{{
                    stringifyTransmissions({ [innerProps.item.transmission]: '' }).title
                  }}</span>
                </td>
                <td class="td">
                  <span class="td-text">{{ innerProps.item.profile }}</span>
                </td>
                <td class="td">
                  <span class="td-text">{{
                    $t(`mediation.actions:reference.${innerProps.item.reference_date}`)
                  }}</span>
                </td>
                <td class="td">
                  <Tooltip
                    :uppercase="false"
                    shadow
                  >
                    <template #activator="{ on }">
                      <span
                        class="td-text"
                        @mouseenter="on.mouseenter"
                        @mouseleave="on.mouseleave"
                      >
                        {{ innerProps.item.title.slice(0, 40) }}...
                      </span>
                    </template>
                    <span>{{ innerProps.item.title }}</span>
                  </Tooltip>
                </td>
                <td class="td">
                  <span class="td-text">{{
                    innerProps.item.last_date_execution
                      ? formatDate(innerProps.item.last_date_execution)
                      : '-'
                  }}</span>
                </td>
                <td class="td">
                  <span class="td-tag">{{ getStatus(innerProps.item) }}</span>
                </td>
              </tr>
            </template>
          </Datatable>
        </DatatableCollapseRow>
      </template>
    </Datatable>
  </Modal>
</template>

<style lang="scss">
@import './MediationModalActionReport.scss';
</style>
