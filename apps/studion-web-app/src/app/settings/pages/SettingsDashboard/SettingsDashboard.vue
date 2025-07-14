<script>
import { mapActions, mapState } from 'vuex'
import { settingsMixin } from '@/mixins/settings'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import Draggable from '@/components/general/Draggable'
import DraggableItem from '@/components/general/DraggableItem'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import TabsDraggable from '../../components/TabsDraggable'

const Modal = () => import('@/components/general/Modal')

export default {
  name: 'SettingsDashboard',
  mixins: [settingsMixin],
  components: {
    Action,
    ActionBar,
    Checkbox,
    ContentHeader,
    Draggable,
    DraggableItem,
    Dropdown,
    DropdownLink,
    Icon,
    Modal,
    TabsDraggable,
  },
  data() {
    return {
      drag: false,
      currentId: null,
      deleteFeaturedContentConfirm: false,
      dashboardTabs: [],
    }
  },
  created() {
    this.fetchFeaturedContent()
    this.fetchAccessMessage()
  },
  computed: {
    ...mapState({
      accessMessages: (state) => state.AccessMessages.list,
      featuredContents: (state) => state.FeaturedContents.list,
    }),
    dragOptions() {
      return {
        animation: 300,
        group: 'solutions',
        disabled: false,
        ghostClass: 'ghost',
        handle: '.handle',
      }
    },
  },
  watch: {
    '$route.params': {
      deep: true,
      handler(params) {
        if (params.toTabs) {
          this.toTabs()
        }
      },
    },
  },
  methods: {
    ...mapActions([
      'fetchAccessMessage',
      'fetchFeaturedContent',
      'setStateAccessMessage',
      'setStateFeaturedContent',
      'moveFeaturedContent',
      'deleteFeaturedContent',
      'updatePositions',
      'addCategories',
    ]),
    openEditModal(accessMessageId) {
      this.$router.push({ name: 'settings.dashboard.access.edit', params: { id: accessMessageId } })
    },
    openFeaturedContentEditModal(featuredContentId) {
      this.$router.push({
        name: 'settings.dashboard.featured_content.edit',
        params: { id: featuredContentId },
      })
    },
    openFeaturedContentCreateModal() {
      this.$router.push({ name: 'settings.dashboard.featured_content.create' })
    },
    changeStateAccessMessage(accessMessageId, newState) {
      this.setStateAccessMessage({ id: accessMessageId, state: newState })
    },
    changeStateFeaturedContent(featuredContent, newState) {
      this.setStateFeaturedContent({ id: featuredContent, state: newState })
    },
    orderFeaturedContents(event) {
      this.drag = false
      let { direction, oldIndex, newIndex } = event

      if (
        !!direction &&
        ((direction === 'up' && oldIndex === 0) ||
          (direction === 'down' && oldIndex === this.featuredContents.length - 1))
      ) {
        return
      }

      if (direction) {
        this.moveFeaturedContent({ oldIndex, newIndex })
      }

      this.updatePositions()
    },
    openDeleteFeaturedConfirm(featuredContentId) {
      this.currentId = featuredContentId
      this.deleteFeaturedContentConfirm = true
    },
    confirmDelete() {
      this.deleteFeaturedContentConfirm = false
      this.deleteFeaturedContent(this.currentId)
    },
    toTabs() {
      this.$nextTick(() => {
        window.scrollTo(0, this.$refs.tabsForm.offsetTop)
      })
    },
  },
}
</script>

<template>
  <div class="main-content settings">
    <ContentHeader
      :title="$t('settings:header.title.5')"
      :description="$t('settings:header.description.4')"
      :tag="$t('settings:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="center">
      <form @submit.prevent="save">
        <div class="form-section center-form-section">
          <h2 class="config-form-title">{{ $t(`featuredContent:context.name`) }}</h2>
          <div class="text-description">
            <p v-html="$t(`featuredContent:context.description`)"></p>
          </div>
        </div>

        <draggable
          :class="{ small: isCardsBannersLayout() }"
          v-if="featuredContents.length > 0"
          v-bind="dragOptions"
          :list="featuredContents"
          @start="drag = true"
          @end="orderFeaturedContents"
        >
          <transition-group
            type="transition"
            :name="!drag ? 'flip-list' : null"
          >
            <draggable-item
              no-padding-y
              v-for="(content, index) in featuredContents"
              :key="`content-${content.id}`"
              :index="index"
              @order="orderFeaturedContents"
            >
              <div class="banner-col">
                <img
                  v-if="!$media.mobile"
                  :src="content.file"
                />

                <div
                  v-if="$media.mobile"
                  class="banner"
                  :style="{ 'background-image': `url(${content.file})` }"
                ></div>
              </div>

              <div class="draggable-item-col text-right">
                <checkbox
                  :items="[{ value: true }]"
                  v-model="content.active"
                  @change="changeStateFeaturedContent(content.id, $event.checked)"
                  switch-type
                  flat="accessibility"
                ></checkbox>
              </div>

              <template slot="actions">
                <dropdown
                  icon="dots-vertical"
                  right
                >
                  <dropdown-link
                    :text="$t('global:edit')"
                    @click="openFeaturedContentEditModal(content.id)"
                  ></dropdown-link>
                  <dropdown-link
                    :text="$t('global:remove')"
                    @click.native="openDeleteFeaturedConfirm(content.id)"
                  ></dropdown-link>
                </dropdown>
              </template>
            </draggable-item>
          </transition-group>
        </draggable>

        <div class="text-center">
          <action
            :text="$t('featuredContent:add.button')"
            type="button"
            flat
            @click="openFeaturedContentCreateModal"
          />
        </div>
      </form>

      <form
        @submit.prevent="save"
        class="config-form"
      >
        <div class="form-section">
          <h2 class="config-form-title">{{ $t(`accessMessage:context.name`) }}</h2>
          <div class="text-description">
            <p class="text-color">{{ $t(`accessMessage:context.description`) }}</p>
          </div>

          <div
            v-if="accessMessages.length > 0"
            class="generic-list access-messages-list"
          >
            <div
              class="generic-list__item"
              v-for="accessMessage in accessMessages"
              :key="accessMessage.id"
            >
              <div class="generic-list__body">
                <icon
                  class="type-icon"
                  name="image"
                  v-if="accessMessage.type === 'image'"
                />
                <icon
                  class="type-icon"
                  name="text"
                  v-if="accessMessage.type === 'message'"
                />
                <template>
                  {{ accessMessage.title }}
                </template>
              </div>
              <div class="generic-list__actions">
                <action
                  type="button"
                  icon="mode_edit"
                  flat
                  @click="openEditModal(accessMessage.id)"
                ></action>
                <checkbox
                  :items="[{ value: true }]"
                  v-model="accessMessage.active"
                  @change="changeStateAccessMessage(accessMessage.id, $event.checked)"
                  switch-type
                  flat="accessibility"
                ></checkbox>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div
        ref="tabsForm"
        class="config-form"
      >
        <div class="form-section">
          <h2 class="config-form-title">{{ $t(`settings.dashboard:tabs.title`) }}</h2>
          <div class="text-description">
            <p class="text-color">{{ $t(`settings.dashboard:tabs.description`) }}</p>
          </div>

          <tabs-draggable />
        </div>
      </div>
    </div>

    <modal
      :active="deleteFeaturedContentConfirm"
      :cancel="false"
    >
      <div class="modal-confirm">
        <action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="deleteFeaturedContentConfirm = false"
        ></action>
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('featuredContent:delete.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('featuredContent:delete.confirm.description') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <action
            type="button"
            :text="$t('global:cancel')"
            flat
            @click="deleteFeaturedContentConfirm = false"
          ></action>
          <action
            type="button"
            :text="$t('global:continue')"
            flat
            class="btn-cancel"
            @click="confirmDelete"
          ></action>
        </div>
      </div>
    </modal>

    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import '~@/app/settings/styles.scss';
@import 'SettingsDashboard.scss';
</style>
