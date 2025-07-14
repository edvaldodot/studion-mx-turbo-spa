<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import i18n from '@/support/i18n'

import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'DatatableUsers',

  components: {
    Datatable,
    Dropdown,
    DropdownLink,
    Icon,
  },

  props: {
    users: {
      type: Array,
      default: () => [],
    },

    metaColumns: {
      type: Array,
      default: () => [],
    },

    preferenceColumnsCount: {
      type: Number,
      default: 0,
    },

    defaultPreferences: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    ...mapState(['accessibility']),
  },

  methods: {
    checkIfColumnIsVisible(name) {
      if (this.preferenceColumnsCount === 0) return this.defaultPreferences.includes(name)
      return this.Settings.displayFeatures.users_list[name]
    },

    getAllUserProfiles(profiles) {
      if (profiles.length) {
        return profiles.length > 1
          ? i18n.t('community:profiles.quantity', { num: profiles.length })
          : profiles[0].alias === 'agent'
          ? profiles[0].name
          : i18n.t(`global:${profiles[0].alias}`)
      } else {
        return '-'
      }
    },

    getUserStatus(activation, confirmation) {
      if (!confirmation) return i18n.t('global:unconfirmed')
      if (activation && confirmation) return i18n.t('global:active')
      if (!activation && confirmation) return i18n.t('global:inactive')
    },

    /**
     * receives database date and return it in locale format
     * @param {string} lastAccess
     */
    getItemDate(lastAccess) {
      if (!lastAccess) return '-'
      const accessDate = new Date(lastAccess)
      return accessDate.toLocaleString()
    },
  },
})
</script>

<template>
  <div class="datatable__users">
    <Datatable
      :items="users"
      :dark="accessibility"
    >
      <template slot="thead">
        <tr v-if="!$media.mobile">
          <th
            v-if="checkIfColumnIsVisible('user') || checkIfColumnIsVisible('picture')"
            class="th"
            width="330"
          >
            <span class="clamp-line">{{ $t('community.index:datatable.header.user') }}</span>
          </th>
          <th
            v-if="checkIfColumnIsVisible('profile')"
            class="th"
            width="160"
          >
            <span class="clamp-line">{{ $t('community.index:datatable.header.profile') }}</span>
          </th>
          <th
            v-if="checkIfColumnIsVisible('username')"
            class="th"
            width="180"
          >
            <span class="clamp-line">{{ $t('community.index:datatable.header.username') }}</span>
          </th>
          <th
            v-if="checkIfColumnIsVisible('status')"
            class="th text-center"
            width="100"
          >
            <span class="clamp-line">{{ $t('community.index:datatable.header.status') }}</span>
          </th>
          <th
            v-if="checkIfColumnIsVisible('branch')"
            class="th"
            width="160"
          >
            <span class="clamp-line">{{ $t('community.index:datatable.header.branch') }}</span>
          </th>
          <th
            v-if="checkIfColumnIsVisible('upper_branch')"
            class="th"
            width="160"
          >
            <span class="clamp-line">{{
              $t('community.index:datatable.header.branch.upper')
            }}</span>
          </th>
          <th
            v-if="checkIfColumnIsVisible('last_access')"
            class="th"
            width="230"
          >
            <span class="clamp-line">{{ $t('community.index:datatable.header.last.access') }}</span>
          </th>
          <th
            v-for="meta in metaColumns"
            :key="meta.alias"
            class="th"
            width="160"
          >
            <span class="clamp-line">{{ meta.label }}</span>
          </th>

          <th
            width="5%"
            class="th"
          ></th>
        </tr>
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
            colspan="3"
          >
            <div class="td-user flex gap-1 align-items-center">
              <div
                v-if="checkIfColumnIsVisible('picture')"
                class="datatable-image"
              >
                <img
                  v-if="props.item.image"
                  :src="props.item.image"
                  class="w-2rem border-circle"
                />

                <Icon
                  v-else
                  class="text-3xl icon-fill-1"
                  name="account_circle"
                  pack="material"
                />
              </div>

              <span
                v-if="checkIfColumnIsVisible('user')"
                class="td-text"
                >{{ props.item.name }}</span
              >
            </div>
          </td>
        </tr>

        <tr
          v-if="$media.mobile"
          class="tr-colspan"
        >
          <td
            class="td user-username"
            colspan="3"
          >
            <span class="td-text clamp-line">{{ props.item.username }}</span>
          </td>
        </tr>

        <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
          <td
            v-if="
              !$media.mobile &&
              (checkIfColumnIsVisible('picture') || checkIfColumnIsVisible('user'))
            "
            class="td"
          >
            <div class="td-user flex gap-1 align-items-center">
              <div
                v-if="checkIfColumnIsVisible('picture')"
                class="datatable-image"
              >
                <img
                  v-if="props.item.image"
                  :src="props.item.image"
                  class="w-2rem border-circle"
                />

                <Icon
                  v-else
                  class="text-3xl icon-fill-1"
                  name="account_circle"
                  pack="material"
                />
              </div>

              <span
                v-if="checkIfColumnIsVisible('user')"
                class="td-text"
              >
                {{ props.item.name }}
              </span>
            </div>
          </td>

          <td
            v-if="checkIfColumnIsVisible('profile')"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line"
            >
              {{ $t('community.index:datatable.header.profile') }}
            </span>

            <span class="td-text clamp-line">{{
              props.item.profiles.length ? getAllUserProfiles(props.item.profiles) : '-'
            }}</span>
          </td>

          <td
            v-if="checkIfColumnIsVisible('username')"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line"
            >
              {{ $t('community.index:datatable.header.username') }}
            </span>

            <span class="td-text break-text clamp-line">{{ props.item.username }}</span>
          </td>
          <td
            v-if="checkIfColumnIsVisible('status')"
            class="td"
            :class="{ 'text-center': !$media.mobile }"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line"
            >
              {{ $t('community.index:datatable.header.status') }}
            </span>

            <span
              :class="{ 'td-tag': !$media.mobile, 'td-text': $media.mobile }"
              class="clamp-line"
            >
              {{ getUserStatus(props.item.active, props.item.confirmed) }}
            </span>
          </td>
          <td
            v-if="checkIfColumnIsVisible('branch')"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line"
            >
              {{ $t('community.index:datatable.header.branch') }}
            </span>

            <span class="td-text break-text clamp-line">{{ props.item.branches[0].name }}</span>
          </td>

          <td
            v-if="checkIfColumnIsVisible('upper_branch')"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line"
            >
              {{ $t('community.index:datatable.header.branch.upper') }}
            </span>

            <span class="td-text break-text clamp-line">{{
              props.item.branchParent ? props.item.branchParent.name : '-'
            }}</span>
          </td>

          <td
            v-if="!$media.mobile && checkIfColumnIsVisible('last_access')"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line"
            >
              {{ $t('community.index:datatable.header.last.access') }}
            </span>
            <span class="td-text break-text clamp-line">{{
              getItemDate(props.item.lastAccess)
            }}</span>
          </td>

          <td
            v-for="meta in metaColumns"
            :key="meta.alias"
            class="td"
          >
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line"
            >
              {{ meta.label }}
            </span>

            <span class="td-text break-text clamp-line">{{
              props.item.meta[meta.value] ? props.item.meta[meta.value] : '-'
            }}</span>
          </td>

          <td
            v-if="$media.mobile"
            class="tdg td-actions"
          >
            <Dropdown
              v-if="$media.mobile"
              icon="dots-vertical"
            >
              <DropdownLink
                :text="$t('global:view.more')"
                @click="$emit('edit:user', props.item)"
              />

              <template v-if="notEqualsProfile('student') && canWrite('users')">
                <DropdownLink
                  v-if="!props.item.active && props.item.confirmed"
                  :text="$t('global:activate')"
                  @click="$emit('toggle-activation:user', props.item)"
                />

                <DropdownLink
                  v-if="props.item.active && props.item.confirmed"
                  :text="$t('global:deactivate')"
                  @click="$emit('toggle-activation:user', props.item)"
                />

                <DropdownLink
                  v-if="!props.item.confirmed"
                  :text="$t('global:confirm')"
                  @click="$emit('confirm:user', props.item)"
                />

                <DropdownLink
                  :text="$t('global:edit')"
                  @click="$emit('edit:user', props.item)"
                />
              </template>

              <DropdownLink
                v-if="
                  $isEnabledFeature('impersonate_read_only') &&
                  !$isUserImpersonated() &&
                  props.item.uuid != Account.user.uuid
                "
                :text="$t('community.profiles:modal.permissions.impersonate:header:1')"
                @click="$emit('impersonate:user', props.item)"
              />
            </Dropdown>
          </td>

          <td
            v-if="!$media.mobile"
            class="tdg td-actions"
          >
            <Dropdown icon="dots-vertical">
              <DropdownLink
                :text="$t('global:view.more')"
                @click="$emit('edit:user', props.item)"
              />

              <template v-if="notEqualsProfile('student') && canWrite('users')">
                <DropdownLink
                  v-if="!props.item.active && props.item.confirmed"
                  :text="$t('global:activate')"
                  @click="$emit('toggle-activation:user', props.item)"
                />

                <DropdownLink
                  v-if="props.item.active && props.item.confirmed"
                  :text="$t('global:deactivate')"
                  @click="$emit('toggle-activation:user', props.item)"
                />

                <DropdownLink
                  v-if="!props.item.confirmed"
                  :text="$t('global:confirm')"
                  @click="$emit('confirm:user', props.item)"
                />

                <DropdownLink
                  :text="$t('global:edit')"
                  @click="$emit('edit:user', props.item)"
                />
              </template>

              <DropdownLink
                v-if="
                  $isEnabledFeature('impersonate_read_only') &&
                  !$isUserImpersonated() &&
                  props.item.uuid != Account.user.uuid
                "
                :text="$t('community.profiles:modal.permissions.impersonate:header:1')"
                @click="$emit('impersonate:user', props.item)"
              />
            </Dropdown>
          </td>
        </tr>
      </template>
    </Datatable>
  </div>
</template>
