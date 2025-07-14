<script>
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'
import TooltipSlot from '@/components/general/TooltipSlot'

export default {
  name: 'DatatableClassroomPermission',

  components: {
    Checkbox,
    Datatable,
    Icon,
    TooltipSlot,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },

    instanceContexts: {
      type: Array,
      default: () => [],
    },

    blockedByDependency: {
      type: Array,
      default: () => [],
    },

    blockedProfiles: {
      type: Boolean,
      default: false,
    },

    fourCheckboxes: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('datatable-classroom-permission')"
    class="datatable-permission"
  >
    <Datatable
      :items="items"
      no-margin-top
      dark
    >
      <template slot="thead">
        <tr>
          <th class="th"></th>
          <th
            class="th text-center"
            width="140"
          >
            {{ $t('community.profiles:modal.permissions.read') }}
          </th>
          <th
            class="th text-center"
            width="140"
          >
            {{ $t('community.profiles:modal.permissions.write') }}
          </th>
          <th
            v-if="fourCheckboxes"
            class="th text-center"
            width="140"
          >
            {{ $t('community.profiles:modal.permissions.remove') }}
          </th>
          <th
            v-if="fourCheckboxes"
            class="th text-center"
            width="140"
          >
            {{ $t('community.profiles:modal.permissions.can.fix') }}
          </th>
        </tr>
      </template>

      <template
        v-if="!instanceContexts.includes(props.item.context)"
        slot="tbody"
        slot-scope="props"
      >
        <tr>
          <td class="td">
            <span class="td-text td-permission-name">{{
              $t(`community.profiles:permission.name:${props.item.context.replace(':', '.')}`)
            }}</span>
          </td>

          <td class="td text-center">
            <Checkbox
              v-model="props.item.action.read"
              :items="[{ value: true }]"
              :disabled="
                props.item.action.remove ||
                props.item.action.evaluate ||
                props.item.action.write ||
                !canWrite('profiles') ||
                blockedProfiles ||
                blockedByDependency.includes(props.item.context)
              "
              switch-type
              dark
              @value="$emit('update:denied-contexts', props.item)"
            />
          </td>

          <td class="td text-center">
            <Checkbox
              v-model="props.item.action.write"
              :items="[{ value: true }]"
              :disabled="!canWrite('profiles') || blockedProfiles"
              switch-type
              dark
              @value="$emit('update:denied-contexts', props.item)"
            />
          </td>

          <td
            v-if="fourCheckboxes"
            class="td text-center"
          >
            <div v-if="props.item.context === 'classroom:forum'">
              <div class="display-flex-permission">
                <Checkbox
                  v-model="props.item.action.remove"
                  :items="[{ value: true }]"
                  :disabled="!canWrite('profiles') || blockedProfiles"
                  switch-type
                  dark
                  @value="$emit('update:denied-contexts', props.item)"
                />
                <TooltipSlot
                  :uppercase="false"
                  :width="400"
                  arrow
                  horizontal-align="center"
                  shadow
                  dark
                >
                  <template #activator>
                    <Icon
                      class="modal-add-import-icon-help"
                      name="help"
                      size="small"
                      wrapper
                    />
                  </template>

                  <template #content>
                    <div class="modal-text-tooltip">
                      <p>{{ $t('community.profiles:modal.permissions.info.forum') }}</p>
                    </div>
                  </template>
                </TooltipSlot>
              </div>
            </div>
            <div v-else>
              <span class="td-text">-</span>
            </div>
          </td>

          <td
            v-if="fourCheckboxes"
            class="td text-center"
          >
            <div v-if="props.item.context === 'classroom:examination'">
              <div class="display-flex-permission">
                <Checkbox
                  v-model="props.item.action.evaluate"
                  :items="[{ value: true }]"
                  :disabled="!canWrite('profiles') || blockedProfiles"
                  switch-type
                  dark
                  @value="$emit('update:denied-contexts', props.item)"
                />
                <TooltipSlot
                  :uppercase="false"
                  :width="400"
                  arrow
                  horizontal-align="left"
                  shadow
                  dark
                >
                  <template #activator>
                    <Icon
                      class="modal-add-import-icon-help"
                      name="help"
                      size="small"
                      wrapper
                    />
                  </template>

                  <template #content>
                    <div class="modal-text-tooltip">
                      <p>{{ $t('community.profiles:modal.permissions.info.activity') }}</p>
                    </div>
                  </template>
                </TooltipSlot>
              </div>
            </div>
            <div v-else>
              <span class="td-text">-</span>
            </div>
          </td>
        </tr>
      </template>
    </Datatable>
  </div>
</template>

<style scoped>
.display-flex-permission {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 5px;
}
</style>
