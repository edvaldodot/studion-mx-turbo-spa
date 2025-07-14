<script>
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'

export default {
  name: 'DatatableLGPDPermission',

  components: {
    Checkbox,
    Datatable,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<template>
  <div :data-testid="$testId('datatable-instance-permission')">
    <h3 class="datatable-title profile-alignment-title">{{ $t('community.profiles:modal.permissions.lgpd') }}</h3>
    <p class="datatable-description profile-alignment-content my-3">
      {{ $t('community.profiles:modal.permissions.lgpd.description') }}
    </p>

    <Datatable
      :items="items"
      dark
    >
      <template slot="thead">
        <tr>
          <th class="th profile-alignment-content">{{ $t('community.profiles:modal.permissions.data') }}</th>
          <th
            class="th text-center"
            width="140"
          >
            {{ $t('global:hide') }}
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr>
          <td class="td">
            <div class="">
              <span class="td-text">{{
                $t(`community.profiles:permission.name:${props.item.context}`)
              }}</span>
            </div>
          </td>

          <td class="td text-center">
            <div class="display-flex-permission">
              <Checkbox
                v-model="props.item.blocked_read"
                class="ml-5"
                :items="[{ value: true }]"
                :disabled="!canWrite('profiles')"
                switch-type
                dark
                @value="$emit('update:denied-contexts', props.item)"
              />
            </div>
          </td>
        </tr>
      </template>
    </Datatable>
  </div>
</template>

<style scoped>
.profile-alignment-title {
  padding: 45px 22px 0;
}

.profile-alignment-content {
  padding: 0 22px;
}
</style>
