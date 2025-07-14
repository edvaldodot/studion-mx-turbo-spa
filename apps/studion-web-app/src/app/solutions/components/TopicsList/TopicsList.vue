<script>
import { mapState } from 'vuex'
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'

import CheckboxItem from '@/components/general/CheckboxItem'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import Loading from '@/components/general/Loading'
import Tooltip from '@/components/general/Tooltip'

export default {
  name: 'TopicsList',
  components: {
    Action,
    CheckboxItem,
    Checkbox,
    Datatable,
    Dropdown,
    DropdownLink,
    Icon,
    Loading,
    ModalConfirm: () => import('@/components/general/ModalConfirm'),
    Tooltip,
  },
  props: {
    topicsItems: {
      type: Array,
      default: () => ([])
    },
    enabledColumns: {
      type: Array,
      default: () => (['name'])
    },
    enabledActions: {
      type: Array,
      default: () => (['toggleActivate', 'edit', 'remove'])
    },
    dark: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    alreadyBindedTopicTemplates: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      isOpenModalConfirm: false,
      lastChangedId: null,
      idCheckd: [],
    }
  },

  computed: {
    ...mapState(['accessibility', 'Courses']),

    isHybrid() {
      return this.Courses.current.type.alias !== 'hybrid'
    },

    alowRecoveryEnable() {
      return this.$isEnabledFeature('allow_recovery_examination')
    },
  },

  methods: {
    isEnabledColumn (columnName) {
      return this.enabledColumns.includes(columnName)
    },
    topicEdit (item) {
      this.$emit('topic-edit', item)
    },
    topicRemove (item) {
      this.$emit('topic-remove', item)
    },
    topicToggle (item) {
      this.$emit('topic-toggle', item)
    },
    topicViewMore (item) {
      this.$emit('topic-view-more', item)
    },
    selectTopic ({id, checked}) {

      if (checked) {
        this.$emit('input', [...this.value, id])
        this.idCheckd.push(id)
        if (this.alreadyBindedTopicTemplates.includes(id)) {
          this.lastChangedId = id
          this.isOpenModalConfirm = true
        }
      } else {
        this.idCheckd = this.idCheckd.filter((item) => item !== id)
        this.$emit('input', [...this.value.filter(topicId => topicId !== id)])
      }
    },
    closeModalConfirm () {
      this.$emit('input', [...this.value.filter(topicId => topicId !== this.lastChangedId)])
      this.isOpenModalConfirm = !this.isOpenModalConfirm
    },
    acceptModalConfirm () {
      this.isOpenModalConfirm = !this.isOpenModalConfirm
    },

    disableRecovery(id) {
      const isRecoveryTopic = this.Courses.topicsTemplates.find((item) => item.id === id)._embedded
        .meta.examination.isRecovery
      if (!isRecoveryTopic) return false

      if (isRecoveryTopic && this.isHybrid) return true

      const hasRecoveryInClass = this.Courses.currentTopics.some((item) => item.isRecovery)
      if (hasRecoveryInClass) return true

      if (!this.alowRecoveryEnable && (isRecoveryTopic || hasRecoveryInClass)) return true

      const activedItems = this.Courses.topicsTemplates.filter((item) => this.idCheckd.includes(item.id))

      const activedRecoveryItems = activedItems.some(
        (item) => item._embedded.meta.examination.isRecovery
      )
      if (activedRecoveryItems) return true

      return false
    },
  }
}
</script>

<template>
  <div>
    <datatable :items="topicsItems" v-if="topicsItems.length > 0" :dark="accessibility || dark">
      <template slot="thead">
        <tr>
          <th class="th" v-if="isEnabledColumn('name')">{{ $t('solutions.create.classes:datatable.header.name') }}</th>
          <th class="th" v-if="isEnabledColumn('type')" :width="$media.mobile ? 90 : 130">{{ $t('solutions.create.classes:datatable.header.type') }}</th>
          <th class="th" v-if="isEnabledColumn('author')" width="170">{{ $t('solutions.create.classes:datatable.header.author') }}</th>
          <th class="th" v-if="isEnabledColumn('mandatory')" :width="$media.mobile ? 90 : 130">{{ $t('solutions.create.classes:datatable.header.mandatory') }}</th>
          <th class="th" v-if="isEnabledColumn('asset-status')" width="150">{{ $t('global:file') }}</th>
          <th class="th" v-if="isEnabledColumn('status')" width="100">{{ $t('solutions.create.classes:datatable.header.status') }}</th>
          <th class="th text-center" v-if="isEnabledColumn('bind')" width="100">{{ $t('solutions.create.classes:datatable.header.bind') }}</th>
          <th class="th" v-if="isEnabledColumn('view-more')" width="40"></th>
          <th class="th" v-if="isEnabledColumn('actions')" width="40"></th>
        </tr>
      </template>
      <template slot="tbody" slot-scope="props">
        <tr>
          <td class="td" v-if="isEnabledColumn('name')">
            <span class="td-text">{{ props.item.name }}</span>
          </td>
          <td class="td" v-if="isEnabledColumn('type')">
            <span
              v-if="props.item._embedded.meta.examination.isRecovery"
              class="td-text"
              >{{ $t(`solutions.create.classes:modal.examination.recovery.title`) }}</span
            >
            <span v-else class="td-text">{{ $t(`solutions.create.classes:modal.type.${props.item.type}`) }}</span>
          </td>
          <td class="td" v-if="isEnabledColumn('author')">
            <span class="td-text">{{ props.item._embedded.author.name }}</span>
          </td>
          <td class="td" v-if="isEnabledColumn('mandatory')">
            <span class="td-text">{{ props.item.mandatory ? $t('global:yes') : $t('global:no') }}</span>
          </td>
          <td class="td" v-if="isEnabledColumn('asset-status')">
            <span :class="['td-tag td-tag-fixed', {'is-ok': props.item.assetStatus === 'complete', 'has-error': props.item.assetStatus === 'error'}]">
              <span v-if="props.item.assetStatus">{{ $t(`solutions.create.classes:status.${props.item.assetStatus}`) }}</span>
              <loading v-if="props.item.assetStatus === 'waiting' || !props.item.assetStatus"></loading>
              <icon name="check-all" v-if="props.item.assetStatus === 'complete'" wrapper size="medium"></icon>
              <icon name="close" v-if="props.item.assetStatus === 'error'" wrapper size="medium"></icon>
            </span>
          </td>
          <td class="td" v-if="isEnabledColumn('status')">
            <span class="td-text">{{ props.item.active ? $t('global:active') : $t('global:inactive') }}</span>
          </td>
          <td class="td text-center form-item theme-dark" v-if="isEnabledColumn('bind')">
            <div class="form-item" :class="{'theme-dark': dark}">
              <Tooltip
                v-if="disableRecovery(props.item.id)"
                :uppercase="false"
                :bold-font="false"
                :width="250"
                vertical-align="top"
              >
                <template #activator="{ on }">
                  <checkbox-item
                    switchType
                    :checked="value.includes(props.item.id)"
                    :disabled="!value.includes(props.item.id) && disableRecovery(props.item.id)"
                     @change="selectTopic({...$event,id: props.item.id})"
                    dark
                    @mouseenter.native="on.mouseenter"
                    @mouseleave.native="on.mouseleave"
                  />
                </template>
                <span v-if="isHybrid">{{ alowRecoveryEnable ?
                  $t('community.sessions.recovery.not.hybrid:tooltip')
                : $t('community.sessions.recovery.disabled.flag:tooltip')}}</span>
                <span v-else>{{
                  alowRecoveryEnable
                    ? $t('community.sessions.recovery.topic:tooltip')
                    : $t('community.sessions.recovery.disabled.flag:tooltip')
                }}</span>
              </Tooltip>
              <checkbox-item
                v-else
                switchType
                :checked="value.includes(props.item.id)"
                @change="selectTopic({...$event,id: props.item.id})"

              />
            </div>
          </td>
          <td class="td td-button td-small" v-if="isEnabledColumn('view-more')">
            <action type="button" :text="$t('global:view.more')" flat :dark="accessibility" @click="topicViewMore(props.item)"></action>
          </td>
          <td class="td td-actions" v-if="isEnabledColumn('actions')">
            <dropdown icon="dots-vertical" right v-if="notEqualsProfile('student') && canWrite('courses')">
              <dropdown-link :text="$t('global:activate')" v-if="!props.item.active && props.item.assetActive === true && enabledActions.includes('toggleActivate')" @click="topicToggle(props.item)"></dropdown-link>
              <dropdown-link :text="$t('global:deactivate')" v-if="props.item.active && enabledActions.includes('toggleActivate')" @click="topicToggle(props.item)"></dropdown-link>
              <dropdown-link :text="$t('global:edit')" v-if="enabledActions.includes('edit')" @click="topicEdit(props.item)"></dropdown-link>
              <dropdown-link :text="$t('global:remove')" v-if="enabledActions.includes('remove')" @click="topicRemove(props.item, props.index)"></dropdown-link>
            </dropdown>
          </td>
        </tr>
      </template>
    </datatable>

    <modal-confirm
      style=""
      :active="isOpenModalConfirm"
      :title="$t('solutions.bind.topicTemplate:modal.confirm.title')"
      @confirm="acceptModalConfirm"
      @close="closeModalConfirm"
    >
      <slot name="description">
        <p class="text-color">{{ $t('solutions.bind.topicTemplate:modal.confirm.text') }}</p>
      </slot>
    </modal-confirm>

  </div>
</template>
