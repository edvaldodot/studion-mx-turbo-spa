<script>
import { mapActions, mapState } from 'vuex'
import { settingsMixin } from '@/mixins/settings'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import Draggable from '@/components/general/Draggable'
import DraggableItem from '@/components/general/DraggableItem'

export default {
  name: 'SettingsGeneral',
  components: {
    Action,
    ActionBar,
    Checkbox,
    ContentHeader,
    Draggable,
    DraggableItem,
  },
  mixins: [settingsMixin],
  data() {
    return {
      menus: [],
    }
  },
  computed: {
    ...mapState(['Account']),
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('order_educational_resources')
    },
    hasReadAccess() {
      return this.notEqualsProfile('student') && this.canRead('order_educational_resources')
    },
  },
  created() {
    this.hasReadAccess || this.$router.push({ name: 'settings.auth' })
    const orderEducationalResources = this.deepClone(this.Account.user.order_educational_resources)
    this.menus = orderEducationalResources.sort((a, b) => {
      return a.order - b.order
    })
  },
  methods: {
    ...mapActions([
      'attemptUpdateMenusOrder',
      'setEducationalResources',
      'setFetching',
      'setFeedback',
    ]),
    orderMenus(event) {
      this.drag = false
      let { direction, oldIndex, newIndex } = event

      if (
        !!direction &&
        ((direction === 'up' && oldIndex === 0) ||
          (direction === 'down' && oldIndex === this.menus.length - 1))
      ) {
        return
      }

      if (direction) {
        let configMenu = this.menus.splice(oldIndex, 1)[0]
        this.menus.splice(newIndex, 0, configMenu)
      }
    },
    submitSettings() {
      const data = this.menus.map((item, index) => {
        return {
          ...item,
          order: index,
        }
      })

      this.setFetching(true)
      this.attemptUpdateMenusOrder(data)
        .then((response) => {
          this.setEducationalResources(response.data.meta.order_educational_resources)
          this.setFeedback({ message: this.$t('settings.general:menus.save.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('settings.general:menus.save.error'), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <div class="main-content settings">
    <ContentHeader
      :title="$t('settings:header.title.2')"
      :description="$t('settings:header.description')"
      :tag="$t('settings:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="w-4 mx-auto mt-4">
      <div class="form-section">
        <h2 class="config-form-title">{{ $t('settings.general:menus.title') }}</h2>
        <p class="text-color">{{ $t('settings.general:menus.subtitle') }}</p>
      </div>

      <Draggable
        :list="menus"
        class="w-12"
        enumerated
        @start="drag = true"
        @end="orderMenus"
      >
        <template slot="headers">
          <th class="text-left text-base lato-regular">
            {{ $t('settings.categories:draggable.header.number') }}
          </th>
          <th class="text-left text-base lato-regular pl-6">
            {{ $t('settings.categories:draggable.header.category') }}
          </th>
        </template>
        <DraggableItem
          v-for="(menu, index) in menus"
          :key="index"
          class="mt-2"
          :index="index"
          no-padding-y
          @order="orderMenus"
        >
          <div class="flex align-items-center h-full gap-8">
            <div class="flex-1">
              <p class="text-color">{{ $t(`settings.general:menus.item.${menu.menu}`) }}</p>
            </div>
            <div class="flex flex-1 align-items-center justify-content-end">
              <Checkbox
                class="mt-4"
                v-model="menu.enabled"
                :items="[{ value: true }]"
                switch-type
                :disabled="!hasWriteAccess"
              />
            </div>
          </div>
        </DraggableItem>
      </Draggable>

      <div class="flex justify-content-center my-5">
        <Action
          v-if="hasWriteAccess"
          type="button"
          primary
          large
          submit
          fixed-width
          :text="$t('global:form.save')"
          @click="submitSettings"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/app/settings/styles.scss';
</style>
