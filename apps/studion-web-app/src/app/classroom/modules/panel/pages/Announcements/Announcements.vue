<script>
import Action from '@/components/general/Action'
import CardAnnouncement from '../../components/CardAnnouncement'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'

import TopBar from '@/components/general/TopBar'
import ModalAnnouncements from './ModalAnnouncements/ModalAnnouncements.vue'
import announcementsMixin from '../../mixins/announcementsMixin'

const Modal = () => import('@/components/general/Modal')

export default {
  name: 'classroomAnnouncement',
  components: {
    Action,
    TopBar,
    CardAnnouncement,

    EmptyMessage,
    FilterList,

    Modal,

    ModalAnnouncements,
  },

  mixins: [announcementsMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  created() {
    this.setup()
  },
}
</script>

<template>
  <div
    v-if="canRead('classroom:announcement')"
    class="inner-content"
  >
    <TopBar v-if="$route.params.management">
      <Action
        icon="keyboard_backspace"
        :text="$t('management:back.to.management')"
        icon-size="small"
        type="button"
        flat
        @click="backAction"
      />
    </TopBar>
    <div class="p-4">
      <FilterList>
        <Action
          v-if="notEqualsProfile('student') && canWrite('classroom:announcement')"
          slot="button"
          type="button"
          :text="$t('classroom.panel.announcements:btn.add')"
          primary
          large
          fixed-width
          :dark="accessibility"
          @click="openModalAddAnnouncement()"
        ></Action>
      </FilterList>
    </div>

    <div class="p-4">
      <EmptyMessage v-if="items.length === 0 && Account.user.currentProfile !== 'admin'" small>
        <h2>{{ $t('classroom.panel.announcements:empty.title:student') }}</h2>
        <p class="text-color">{{ $t('classroom.panel.announcements:empty.message:student') }}</p>
      </EmptyMessage>

      <EmptyMessage v-if=" items.length === 0 && Account.user.currentProfile === 'admin'" small>
        <h2>{{ $t('classroom.panel.announcements:empty.title:admin') }}</h2>
        <p v-html="$t('classroom.panel.announcements:empty.message:admin')"></p>
      </EmptyMessage>
    </div>

    <div class="center">
      <div v-if="layoutList.length" class="announcement-list">
        <div v-for="list in layoutList" class="announcement-col">
          <CardAnnouncement
            v-for="(item, index) in list"
            :key="index"
            :user="item.author"
            :title="item.title"
            :fixed="item.fixed"
            :description="item.content"
            :archive="!item.fixed"
            :start-date="item.availability.startTime"
            :end-date="item.availability.endTime"
            @edit="editAnnouncement(item, index)"
            @remove="deleteAnnouncement(item, index)"
            @open="openModalReadMoreAnnouncement(item)"
          />
        </div>
      </div>
    </div>

    <modal
      :active.sync="modalAddAnnouncement"
      close-event
      @close="closeModalAddAnnouncement"
    >
      <ModalAnnouncements
        ref="modalAnnoucements"
        :announcement="formData"
        :course-name="Classroom.data.course.name"
        :validations="$v"
        @submit="submit"
        @add-media-file="addMediaFile"
      />
    </modal>
  </div>
</template>

<style lang="scss">
@import 'styles.scss';
</style>
