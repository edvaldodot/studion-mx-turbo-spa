<script>
import { mapState } from 'vuex'

import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'

const defaultProfilesAlias = ['admin', 'student']

export default {
  name: 'DatatableImpersonatePermission',

  components: {
    Checkbox,
    Datatable,
  },

  computed: {
    ...mapState({
      allProfiles: ({ profiles }) => profiles.allProfiles,
    }),
  },

  methods: {
    getProfileName(item) {
      if (defaultProfilesAlias.includes(item.alias)) {
        return this.$t(`global:${item.alias}`)
      }

      return item.name
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('datatable-impersonate-permission')"
    class="datatable-permission"
  >
    <h3 class="datatable-title text-color">{{ $t('community.profiles:modal.permissions.impersonate') }}</h3>
    <p class="datatable-description text-color">
      {{ $t('community.profiles:modal.permissions.impersonate:description') }}
    </p>

    <Datatable
      :items="allProfiles"
      dark
    >
      <template slot="thead">
        <tr>
          <th class="th">{{ $t('community.profiles:datatable.header.1') }}</th>
          <th
            class="th text-center"
            width="140"
          >
            {{ $t('community.profiles:modal.permissions.impersonate:header:1') }}
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item }"
      >
        <tr>
          <td class="td">
            <span class="td-text td-permission-name">{{
              `${$t('community.profiles:modal.permissions.impersonate')} ${getProfileName(item)}`
            }}</span>
          </td>

          <td class="td text-center">
            <Checkbox
              v-model="item.active"
              :items="[{ value: true }]"
              :disabled="!canWrite('profiles')"
              switch-type
              dark
              @value="$emit('update:impersonate-permissions', item.id)"
            />
          </td>
        </tr>
      </template>
    </Datatable>
  </div>
</template>
