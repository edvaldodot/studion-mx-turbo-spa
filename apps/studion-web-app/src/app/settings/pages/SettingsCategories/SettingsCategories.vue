<script>
import { mapState, mapActions } from 'vuex'
import { settingsMixin } from '@/mixins/settings'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Draggable from '@/components/general/Draggable'
import DraggableItem from '@/components/general/DraggableItem'
import Dropdown from '@/components/general/Dropdown'
import DropdownLinkTooltip from '@/components/shared/DropdownLinkTooltip'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Tooltip from '@/components/general/Tooltip'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'SettingsCategories',

  components: {
    Action,
    ActionBar,
    ContentHeader,
    Draggable,
    DraggableItem,
    Dropdown,
    DropdownLinkTooltip,
    EmptyMessage,
    FilterList,
    ModalConfirm,
    Tooltip,
  },

  filters: {
    truncateCategoryName: function (value) {
      if (!value) return ''
      if (value.length < 50) return value
      return value.slice(0, 50) + '...'
    },
  },

  mixins: [settingsMixin],

  data() {
    return {
      drag: false,
      deleteCategoryConfirm: false,
      categoryIdToDelete: null,
      embedInfo: ['courses_count', 'paths_count', 'offerings_count', 'sessions_count'],
    }
  },

  computed: {
    ...mapState({
      Account: (state) => state.Account,
      accessibility: (state) => state.accessibility,
      categoriesList: (state) => state.Categories.list,
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

  created() {
    if (!(this.notEqualsProfile('student') && this.canRead('settings'))) {
      this.$router.push({ name: '404' })
    }
    this.attemptCategoryListRetrieval({
      embed: this.embedInfo.join(),
    })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptCategoryListRetrieval',
      'attemptCategoryRemove',
      'moveCategory',
      'updatePosition',
    ]),
    openModalAddCategory() {
      this.$router.push({ name: 'settings.categories.create' })
    },
    openModalEditCategory(categoryId) {
      this.$router.push({ name: 'settings.categories.update', params: { id: categoryId } })
    },
    orderCategories(event) {
      this.drag = false
      let { direction, oldIndex, newIndex } = event

      if (
        !!direction &&
        ((direction === 'up' && oldIndex === 0) ||
          (direction === 'down' && oldIndex === this.categoriesList.length - 1))
      ) {
        return
      }

      if (direction) {
        this.moveCategory({ oldIndex, newIndex })
      }

      this.updatePosition({ newIndex })
    },
    openDeleteCategoryConfirm(categoryId) {
      this.categoryIdToDelete = categoryId
      this.deleteCategoryConfirm = true
    },
    confirmDelete() {
      this.deleteCategoryConfirm = false
      this.attemptCategoryRemove(this.categoryIdToDelete).catch(() => {
        this.setFeedback({
          message: this.$t('settings.categories.list:feedback.deleted.error'),
          type: 'error',
        })
      })
    },
  },
}
</script>

<template>
  <div class="main-content  settings">
    <ContentHeader
      :title="$t('settings:header.title.6')"
      :description="$t('settings:header.description.5')"
      :tag="$t('settings:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="px-4 pt-4">
      <FilterList>
        <Action
          slot="button"
          :dark="accessibility"
          :text="$t('settings.categories:btn.add')"
          type="button"
          primary
          large
          fixed-width
          @click="openModalAddCategory()"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <div class="text-base lato-regular">
        <div v-html="$t(`settings.categories:section.description`)"></div>
      </div>

      <Draggable
        v-if="categoriesList.length > 0"
        class="my-4"
        v-bind="dragOptions"
        :list="categoriesList"
        enumerated
        @start="drag = true"
        @end="orderCategories"
      >
        <template #index="{ index }">
          <div class="w-full text-center text-2xl text-color">
            {{ index }}
          </div>
        </template>
        <template slot="headers">
          <th
            class="th"
            width="3%"
          >
            {{ $t('settings.categories:draggable.header.number') }}
          </th>
          <th
            class="th"
            width="15%"
          >
            {{ $t('settings.categories:draggable.header.category') }}
          </th>
          <th
            v-for="embedItem in embedInfo"
            :key="embedItem"
            class="th text-center"
            width="13.5%"
          >
            {{ $t(`settings.categories:draggable.header.${embedItem}`) }}
          </th>
          <th
            class="th"
            :width="$media.mobile ? '10%' : '15%'"
          ></th>
        </template>
        <TransitionGroup
          type="transition"
          :name="!drag ? 'flip-list' : null"
        >
          <DraggableItem
            v-for="(category, index) in categoriesList"
            :key="`content-${category.id}`"
            no-padding-y
            :index="index"
            @order="orderCategories"
          >
            <div class="draggable-item-col name-col w-2 pl-2">
              <Tooltip
                :uppercase="false"
                :width="230"
              >
                <template #activator="{ on }">
                  <p v-on="on">{{ category.name | truncateCategoryName }}</p>
                </template>
                <span>{{ category.name }}</span>
              </Tooltip>
            </div>

            <div
              v-for="embedItem in embedInfo"
              :key="embedItem"
              class="draggable-item-col count-col w-2 pl-4"
            >
              <p class="text-color">{{ category._embedded ? +category._embedded[embedItem] : 0 }}</p>
            </div>

            <template slot="actions">
              <Dropdown
                icon="dots-vertical"
                right
              >
                <DropdownLinkTooltip
                  :dropdown-props="{ text: $t('global:edit'), disabled: category.immutable }"
                  :tooltip="{
                    condition: category.immutable,
                    text: $t('settings.categories.list:edit.error'),
                    props: { uppercase: false },
                  }"
                  @click="openModalEditCategory(category.id)"
                />
                <DropdownLinkTooltip
                  :dropdown-props="{ text: $t('global:remove'), disabled: category.immutable }"
                  :tooltip="{
                    condition: category.immutable,
                    text: $t('settings.categories.list:remove.error'),
                    props: { uppercase: false },
                  }"
                  @click="!category.immutable && openDeleteCategoryConfirm(category.id)"
                />
              </Dropdown>
            </template>
          </DraggableItem>
        </TransitionGroup>
      </Draggable>
    </div>

    <div class="p-4">
      <EmptyMessage v-if="categoriesList.length === 0">
        <h2>{{ $t('settings.categories.list:empty.title') }}</h2>
      </EmptyMessage>
    </div>

    <ModalConfirm
      :active="deleteCategoryConfirm"
      :title="$t('settings.categories:delete.confirm.title')"
      @close="deleteCategoryConfirm = false"
      @confirm="confirmDelete()"
    >
      <p class="text-color">{{ $t('settings.categories:delete.confirm.description') }}</p>
    </ModalConfirm>

    <RouterView />
  </div>
</template>

<style lang="scss">
@import '~@/app/settings/styles.scss';
@import 'SettingsCategories.scss';
</style>
