<template>
  <div>
    <datatable
      :items="team"
      v-if="team.length"
      :light="true"
      :dark="dark"
      :item-identifier="customItemIdentifier || 'uuid'"
    >
      <template
        slot="thead"
        v-if="!$media.mobile"
      >
        <tr>
          <th class="th">
            {{ $t('offerings.sessions.edit:session.team.datatable.header.1') }}
          </th>
          <th class="th">
            {{ $t('offerings.sessions.edit:session.team.datatable.header.2') }}
          </th>
          <th class="th">{{ $t('global:priority') }}</th>
          <th />
        </tr>
      </template>
      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr
          class="tr-colspan tr-colspan-small"
          v-if="$media.mobile"
        >
          <td
            class="td"
            colspan="2"
          >
            <span
              class="td-text"
              :style="{ width: 'calc(100% - 45px)' }"
            >
              {{ truncatedName(props.item.name) }}
            </span>
            <action
              type="button"
              class="btn-remove"
              icon="close"
              @click="$emit('remove', props.index)"
              v-if="!props.item.dirty && canWrite('sessions')"
            />
          </td>
        </tr>
        <tr>
          <td
            class="td"
            v-if="!$media.mobile"
          >
            <span class="td-text bolder">{{ truncatedName(props.item.name) }}</span>
          </td>
          <td class="td">
            <span
              class="td-text-header"
              v-if="$media.mobile"
              >{{ $t('offerings.solutions.edit:datatable.header.2') }}</span
            >
            <span class="td-text">{{
              props.item.dirty ? $t(props.item.profile_name) : props.item.profile_name
            }}</span>
          </td>
          <td
            class="td"
            width="150"
          >
            <span
              class="td-text-header"
              v-if="$media.mobile"
              >{{ $t('global:priority') }}</span
            >
            <select-field
              @focus="(oldValue) => (oldPosition = oldValue)"
              :items="sessionTeamOptions"
              v-model="props.item.position"
              :dark="dark"
              @input="(position) => switchMembersTeamPosition(props.item, position)"
              :allowClear="false"
            />
          </td>
          <td
            class="td"
            width="20"
            v-if="!$media.mobile"
          >
            <action
              type="button"
              class="btn-remove"
              icon="close"
              @click="$emit('remove', props.index)"
              v-if="!props.item.dirty && canWrite('sessions')"
            />
          </td>
        </tr>
      </template>
    </datatable>

    <empty-message v-else>
      <p class="text-color" v-html="$t('community.sessions.add:team.empty.message')"></p>
    </empty-message>

    <validation-message :validation="validation" />
  </div>
</template>

<script>
import { SESSION_TEAM_OPTIONS } from '@/support/utils/constants'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import ValidationMessage from '@/components/general/ValidationMessage'
import SelectField from '@/components/general/SelectField'

export default {
  name: 'DatatableTeam',

  components: {
    Action,
    Datatable,
    EmptyMessage,
    ValidationMessage,
    SelectField,
  },

  data() {
    return {
      sessionTeamOptions: SESSION_TEAM_OPTIONS,
      oldPosition: SESSION_TEAM_OPTIONS[2].value,
    }
  },

  props: {
    dark: {
      type: Boolean,
      default: false,
    },

    team: {
      type: Array,
      default: () => [],
    },

    validation: {
      type: Object,
      default: () => {},
    },
    customItemIdentifier: {
      type: String,
      default: '',
    },
  },

  methods: {
    /**
     * Switch other members positions to not have primary/secondary duplication.
     * @param {Object} selectedMember
     * @param {Number} selectedPosition
     */
    switchMembersTeamPosition(selectedMember, selectedPosition) {
      const personToSwitchIndex = this.team.findIndex(
        (member) => member.position === selectedPosition && member.uuid !== selectedMember.uuid
      )

      this.team.forEach((teamMember) => {
        if (teamMember.position !== selectedPosition || teamMember.uuid === selectedMember.uuid) {
          return
        }
        teamMember.position = SESSION_TEAM_OPTIONS[2].value
      })

      if (personToSwitchIndex >= 0 && this.team[personToSwitchIndex]) {
        if (this.oldPosition === 'secondary' && !selectedPosition) return
        this.team[personToSwitchIndex].position = this.oldPosition
      }

      this.fixTeamOrder()
      this.$emit('switch')
    },

    /**
     * TeamRules:
     * - Primary always in first position
     * - Secondary always in second position
     */
    fixTeamOrder() {
      this.team.sort((a, b) => {
        if (!a.position && !b.position) return 0
        if (b.position === 'primary') return 1
        if (a.position === 'primary') return -1

        if (a.position === 'secondary' && b.position !== 'primary') return -1
        if (b.position === 'secondary' && a.position !== 'primary') return 1
        return 0
      })
    },

    truncatedName(name) {
      if (typeof name !== 'string') {
        return ''
      }
      return name.length > 25 ? name.slice(0, 25) + '...' : name
    },
  },
}
</script>
