<script>
import { defineComponent } from 'vue'
import { previewMixin } from '../mixins/previewMixin'

import Modal from '@/components/general/Modal'
import Icon from '@/components/general/Icon'
import TextReduce from '@/components/general/TextReduce'
import MandatoryContent from '@/components/shared/CardForum/component/MandatoryContent.vue'

import ModalHeaderPreview from '../components/ModalHeaderPreview'

export default defineComponent({
  name: 'PreviewForumModal',

  components: {
    Modal,
    Icon,
    TextReduce,
    MandatoryContent,
    ModalHeaderPreview,
  },

  mixins: [previewMixin],

  computed: {
    backgroundImage() {
      return this.item ? `url('${this.item.meta.image}')` : null
    },
  },

  methods: {
    getProfileName(profile) {
      return profile.alias === 'agent' ? profile.name : this.$t(`global:${profile.alias}`)
    },
  },
})
</script>

<template>
  <Modal
    :active="true"
    class="modal-discussion"
    is-page
    back
    @close="isBack()"
  >
    <div class="modal-discussion-body">
      <ModalHeaderPreview :title="title" />
      <div
        v-if="item"
        class="modal-discussion-content"
      >
        <div v-if="item.meta.mandatory">
          <MandatoryContent
            :num-posts="item.meta.numPosts"
            :num-comments="item.meta.numComments"
            :check-post="item.meta.numPosts <= item.meta.numPosts"
            :check-comments="item.meta.numComments <= item.meta.numComments"
            :progress-posts="item.meta.numPosts"
            :progress-comments="item.meta.numComments"
            is-card
          />
        </div>
        <div class="forum-discussion-item">
          <div class="forum-discussion-card">
            <div
              class="forum-discussion-header"
              :style="{ backgroundImage: backgroundImage }"
            >
              <div class="forum-discussion-options">
                <div class="forum-discussion-info">
                  <span class="forum-discussion-datetime">{{ formatDate(startTime, 'long') }}</span>
                  <span
                    v-if="item.meta.mandatory"
                    class="forum-discussion-label"
                    >{{ $t('classroom.forum:mandatory') }}</span
                  >
                </div>
              </div>
              <div
                v-if="item.userData"
                class="forum-discussion-user"
              >
                <div class="forum-discussion-user-image-wrapper">
                  <img
                    v-if="item.userData.image"
                    :src="item.userData.image"
                    :alt="item.userData.name"
                    class="forum-discussion-user-image"
                  />
                  <Icon
                    v-else
                    name="account_circle"
                    class="forum-discussion-user-image-icon"
                  />
                </div>
                <TextReduce
                  :lenght-text="40"
                  :text="item.userData.name"
                  class-style="forum-discussion-user-name"
                />

                <span class="forum-discussion-user-position">{{
                  getProfileName(item.profile)
                }}</span>
              </div>
            </div>
            <div class="forum-discussion-content">
              <h2 class="forum-discussion-title">{{ item.title }}</h2>
              <div v-html="item.message"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss">
.modal-discussion {
  .btn-back {
    position: fixed;
    top: 30px;
    left: 40px;
  }
  .modal-discussion-body {
    display: flex;
    align-items: center;
    flex-direction: column;

    .modal-discussion-schedule-title {
      font-size: 20px;
      font-weight: bold;
      color: var(--alert-900);
      margin-bottom: 10px;
    }

    .modal-discussion-title {
      font-size: 40px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 58px;
    }
    .mandatory {
      &.card {
        margin-bottom: 20px;
      }
    }

    .modal-discussion-header {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .modal-discussion-content {
      width: 100%;

      .forum-discussion-card {
        background: #fff;
      }
    }
  }
}
</style>
