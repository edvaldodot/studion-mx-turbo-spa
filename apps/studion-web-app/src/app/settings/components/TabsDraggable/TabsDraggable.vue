<script>
import { mapState, mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Draggable from '@/components/general/Draggable'
import DraggableItem from '@/components/general/DraggableItem'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default {
  components: {
    Action,
    Draggable,
    DraggableItem,
    Dropdown,
    DropdownLink,
    ModalConfirm: () => import('@/components/general/ModalConfirm')
  },
  props: {
    tabs: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      drag: false,
      deleteConfirmModal: false,
      current: null
    }
  },
  computed: {
    ...mapState({
      featuredCategories: state => state.Dashboard.featuredCategories
    }),
    dragOptions () {
      return {
        animation: 300,
        group: 'solutions',
        disabled: false,
        ghostClass: 'ghost',
        handle: '.handle'
      }
    }
  },
  methods: {
    ...mapActions([
      'fetchFeaturedCategories',
      'moveFeaturedCategory',
      'removeFeaturedCategory',
      'updateCategoriesPositions'
    ]),
    orderFeaturedCategories (event) {
      this.drag = false
      let { direction, oldIndex, newIndex } = event

      if (!!direction && ((direction === 'up' && oldIndex === 0) || (direction === 'down' && oldIndex === this.featuredCategories.length - 1))) {
        return
      }

      if (direction) {
        this.moveFeaturedCategory({ oldIndex, newIndex })
      }
    },
    openDeleteConfirmModal (categoryId) {
      this.current = categoryId
      this.deleteConfirmModal = true
    },
    async confirmDelete () {
      await this.removeFeaturedCategory(this.current)
      await this.fetchFeaturedCategories()
      this.deleteConfirmModal = false
    }
  },
  created () {
    this.fetchFeaturedCategories()
  }
}
</script>

<template>
  <div>
    <action
      large
      primary
      class="mb-3"
      type="button"
      :text="$t('settings.dashboard:tabs.draggable.btn.add')"
      @click="$router.push({ name: 'settings.dashboard.tabs' })"
    />

    <draggable
      v-if="featuredCategories.length"
      enumerated
      class="mb-8"
      v-bind="dragOptions"
      :list="featuredCategories"
      @start="drag = true"
      @end="orderFeaturedCategories"
    >
      <template slot="headers">
        <th class="th text-base" width="2%">{{ $t('settings.dashboard:tabs.draggable.header.position') }}</th>
        <th class="th text-base" width="10%">{{ $t('settings.dashboard:tabs.draggable.header.category') }}</th>

        <th class="th" width="15%"></th>
      </template>

      <transition-group type="transition" :name="!drag ? 'flip-list' : null">
        <draggable-item
          v-for="(featuredCategory, index) in featuredCategories"
          :key="`solution-${featuredCategory.id}`"
          :index="index"
          @order="orderFeaturedCategories"
        >
          <div class="draggable-item-col pl-3">
            <p class="text-color">{{ featuredCategory.category.name }}</p>
          </div>
          <dropdown
            slot="actions"
            icon="dots-vertical"
          >
            <dropdown-link
              :text="$t('global:remove')"
              @click="openDeleteConfirmModal(featuredCategory.id)"
            ></dropdown-link>
          </dropdown>
        </draggable-item>
      </transition-group>
    </draggable>

    <div class="text-center">
      <action
        v-if="featuredCategories.length"
        large
        secondary
        type="button"
        :text="$t('settings.dashboard:tabs.draggable.btn.save')"
        @click="updateCategoriesPositions"
      />
    </div>

     <modal-confirm
      :active="deleteConfirmModal"
      :title="$t('settings.dashboard:tabs.moda.confirm.title')"
      @close="deleteConfirmModal = false"
      @confirm="confirmDelete"
    >
      <p class="text-color">{{ $t('settings.dashboard:tabs.moda.confirm.description') }}</p>
    </modal-confirm>
  </div>
</template>
