<template>
  <Datatable
    v-if="value.length"
    :items="value"
    :class="{ 'theme-dark': dark }"
  >
    <template slot="thead">
      <tr>
        <template v-if="mediation.mediationPlan.applicability === 'solution'">
          <th
            :style="{ width: isImport ? '30%' : '90%' }"
            class="th"
          >
            {{ $t(`mediation.links:datatable.type.${mediation.mediationPlan.applicability}`) }}
          </th>
          <th
            v-if="isImport"
            width="60%"
            class="th text-center"
          >
            {{ $t('global:modality') }}
          </th>
          <th
            v-if="isImport"
            class="th text-center"
          >
            {{ $t('global:import') }}
          </th>
          <th v-if="!isImport" />
        </template>
        <template v-if="mediation.mediationPlan.applicability === 'session'">
          <th
            v-if="isImport"
            class="th"
            width="20%"
          >
            {{ $t('community.sessions:datatable.header.6') }}
          </th>
          <th
            class="th"
            :style="{ width: isImport ? '20%' : '30%' }"
          >
            {{ $t('community.sessions:datatable.header.7') }}
          </th>
          <th
            class="th"
            :style="{ width: isImport ? '20%' : '30%' }"
          >
            {{ $t('community.sessions:datatable.header.2') }}
          </th>
          <th
            class="th"
            width="15%"
          >
            {{ $t('community.sessions:datatable.header.4') }}
          </th>
          <th
            class="th"
            width="15%"
          >
            {{ $t('community.sessions:datatable.header.5') }}
          </th>
          <th
            v-if="isImport"
            class="th text-center"
          >
            {{ $t('global:import') }}
          </th>
          <th v-if="!isImport" />
        </template>
      </tr>
    </template>
    <template
      slot="tbody"
      slot-scope="{ item }"
    >
      <tr>
        <template v-if="mediation.mediationPlan.applicability === 'solution'">
          <td class="td">
            <span class="td-text bolder">{{ item.name || item.course_name }}</span>
          </td>
          <td
            v-if="isImport"
            class="td text-center"
          >
            <span
              v-if="item.course_type_alias"
              class="td-text"
              >{{ $t(`solutions.type:${item.course_type_alias}`) }}</span
            >
          </td>
        </template>
        <template v-if="mediation.mediationPlan.applicability === 'session'">
          <td
            v-if="isImport"
            class="td"
          >
            <span class="td-text bolder">{{ item.offering ? item.offering.title : '-' }}</span>
          </td>
          <td class="td">
            <span class="td-text bolder">{{ item.course.name || item.course[0].name }}</span>
          </td>
          <td class="td">
            <span class="td-text bolder">{{ item.name }}</span>
          </td>
          <td class="td">
            <span
              class="td-text"
              :class="{ 'with-tooltip': !!item.referenceDate }"
            >
              {{ getInitialDate(item) }}
              <ManualDateTooltip v-if="item.referenceDate" />
            </span>
          </td>
          <td class="td">
            <span
              v-if="isImport"
              class="td-text"
              >{{
                item.availability.extended
                  ? formatDate(item.availability.extended)
                  : item.availability.final
                  ? formatDate(item.availability.final)
                  : '-'
              }}</span
            >
            <span
              v-else
              class="td-text"
              >{{ item.endDateTime ? formatDate(item.endDateTime) : '-' }}</span
            >
          </td>
        </template>

        <td class="td text-center">
          <Checkbox
            v-if="isImport"
            dark
            switch-type
            :value="item.import"
            :items="[{ value: true }]"
            @input="selectSolution($event, item)"
          />
          <Dropdown
            v-else-if="canWrite('mediation_plan')"
            slot="actions"
            right
            icon="dots-vertical"
          >
            <DropdownLink
              :text="$t('global:remove')"
              @click="removeMediationLink(item)"
            />
            <DropdownLink
              v-if="isSession"
              :text="$t('mediation.links:modal.session.manual.date:button')"
              @click="$emit('select-item', item)"
            />
            <DropdownLink
              v-if="isSession"
              :text="$t('mediation.mediation:actions.report')"
              @click="
                $router.push({
                  name: 'mediation.link.report',
                  params: {
                    session_id: item.id,
                  },
                })
              "
            />
          </Dropdown>
        </td>
      </tr>
    </template>
  </Datatable>
</template>

<script>
import { mapState } from 'vuex'

import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

import ManualDateTooltip from './components/ManualDateTooltip.vue'

export default {
  name: 'MediationLinkDatatable',
  components: {
    Checkbox,
    Datatable,
    Dropdown,
    DropdownLink,
    ManualDateTooltip,
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    dark: {
      type: Boolean,
      default: false,
    },
    isImport: {
      type: Boolean,
      default: false,
    },
    isSession: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState({
      mediation: (state) => state.Mediation.current,
    }),
  },
  methods: {
    selectSolution(event, item) {
      this.$emit('select-solution', { event, item })
    },
    removeMediationLink(item) {
      this.$emit('remove-item', item)
    },

    normalizeDate(date) {
      return date.includes('T') ? date : date.replace(/-/g, '/')
    },

    getInitialDate(item) {
      if (this.isSession) {
        const referenceDate = item.referenceDate

        if (referenceDate) {
          return this.formatDate(this.normalizeDate(referenceDate))
        }
      }

      let startDateTime = item.startDateTime

      if (this.isImport && item.availability && item.availability.initial) {
        startDateTime = item.availability.initial
      }

      if (startDateTime) return this.formatDate(startDateTime)

      return '-'
    },
  },
}
</script>
