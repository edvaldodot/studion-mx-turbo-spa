<script>
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default {
  name: 'SessionConfigsList',
  components: {
    Action,
    Dropdown,
    DropdownLink,
    Datatable,
  },
  props: {
    sessionType: {
      type: String,
      default: 'individual',
    },
  },
  data() {
    return {
      themeDark: true,
    }
  },
  computed: {
    ...mapState(['offerings']),
    offeringIsReady() {
      return this.offerings.current.published
    },
    currentConfigs() {
      return this.offerings.current ? this.offerings.current.meta.configs : []
    },
    colspan() {
      return this.sessionType === 'individual'
        ? 2
        : this.sessionType === 'closed'
        ? 4
        : this.sessionType === 'open'
        ? 3
        : null
    },
  },
  created() {
    this.themeDark = !this.$hasBoolBgVariable('--light-generic-background')
  },
  methods: {
    remove(index) {
      this.$emit('remove', index)
    },
    openModal(index) {
      this.$emit('openModal', index)
    },
  },
}
</script>

<template>
  <div
    v-if="currentConfigs.length"
    class="session-config-list"
  >
    <datatable
      :items="currentConfigs"
      :dark="themeDark"
    >
      <template
        v-if="!$media.mobile"
        slot="thead"
      >
        <template v-if="sessionType === 'individual'">
          <tr>
            <th class="th">{{ $t('offerings.sessions.edit:session.datatable.header.1') }}</th>
            <th
              class="th text-center"
              width="150"
            >
              {{ $t('offerings.sessions.edit:session.datatable.header.2') }}
            </th>
            <th
              class="th"
              width="40"
            ></th>
          </tr>
        </template>
        <template v-if="sessionType === 'closed'">
          <tr>
            <th class="th">{{ $t('offerings.sessions.edit:session.datatable.header.1') }}</th>
            <th
              class="th"
              width="140"
            >
              {{ $t('offerings.sessions.edit:session.datatable.header.3') }}
            </th>
            <th
              class="th"
              width="140"
            >
              {{ $t('offerings.sessions.edit:session.datatable.header.4') }}
            </th>
            <th
              class="th text-center"
              width="140"
            >
              {{ $t('offerings.sessions.edit:session.datatable.header.2') }}
            </th>
            <th
              class="th"
              width="40"
            ></th>
            <th
              class="th"
              width="40"
            ></th>
          </tr>
        </template>
        <template v-if="sessionType === 'open'">
          <tr>
            <th class="th">{{ $t('offerings.sessions.edit:session.datatable.header.1') }}</th>
            <th
              class="th"
              width="140"
            >
              {{ $t('offerings.sessions.edit:session.datatable.header.3') }}
            </th>
            <th
              class="th text-center"
              width="140"
            >
              {{ $t('offerings.sessions.edit:session.datatable.header.2') }}
            </th>
            <th
              class="th"
              width="40"
            ></th>
            <th
              class="th"
              width="40"
            ></th>
          </tr>
        </template>
      </template>
      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr
          v-if="$media.mobile"
          class="tr-colspan"
        >
          <td
            class="td"
            :colspan="colspan"
          >
            <span class="td-text bolder">{{ props.item.name }}</span>
          </td>
        </tr>
        <tr>
          <td
            v-if="!$media.mobile"
            class="td"
          >
            <span class="td-text bolder">{{ props.item.name }}</span>
          </td>
          <td
            v-if="sessionType === 'closed' || sessionType === 'open'"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header"
              >{{ $t('offerings.sessions.edit:session.datatable.header.3') }}</span
            >
            <span class="td-text">{{ formatDate(props.item.start_date) || '-' }}</span>
          </td>
          <td
            v-if="sessionType === 'closed'"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header"
              >{{ $t('offerings.sessions.edit:session.datatable.header.4') }}</span
            >
            <span class="td-text">{{ formatDate(props.item.end_date) || '-' }}</span>
          </td>
          <td class="td text-center">
            <span
              v-if="$media.mobile"
              class="td-text-header"
              >{{ $t('offerings.sessions.edit:session.datatable.header.2') }}</span
            >
            <span class="td-text">{{
              props.item.vacancy_type === 'unlimited'
                ? $t('global:form.unlimited')
                : props.item.vacancy
            }}</span>
          </td>
          <td
            v-if="sessionType !== 'individual' && !$media.mobile"
            class="td text-center"
          >
            <action
              type="button"
              flat
              :text="$t('offerings.sessions.edit:session.schedule')"
              :dark="true"
              :disabled="!canWrite('offerings')"
              @click="openModal(props.index)"
            />
          </td>
          <td class="td td-actions">
            <Dropdown
              :disabled="
                (offeringIsReady && sessionType === 'individual') || !canWrite('offerings')
              "
              right
              icon="dots-vertical"
            >
              <DropdownLink
                v-if="sessionType !== 'individual'"
                :text="$t('offerings.sessions.edit:session.schedule')"
                @click="openModal(props.index)"
              />
              <DropdownLink
                v-if="
                  !offeringIsReady ||
                  !canWrite('offerings') ||
                  !Boolean(props.item.sessions_ids && props.item.sessions_ids.length)
                "
                :text="$t('global:remove')"
                @click="remove(props.index)"
              />
            </Dropdown>
          </td>
        </tr>
      </template>
    </datatable>
  </div>
</template>
