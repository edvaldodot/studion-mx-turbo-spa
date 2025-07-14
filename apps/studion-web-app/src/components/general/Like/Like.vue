<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import Action from '../Action'

export default defineComponent({
  name: 'LikeButton',

  components: {
    Action,
  },

  props: {
    stats: {
      type: Object,
      default: () => ({}),
    },
    entityAlias: {
      type: String,
      default: null,
    },
    entityId: {
      type: Number,
      default: null,
    },
    dislikeActive: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    isShowLabel: {
      type: Boolean,
      default: false,
    },
    disableNotify: {
      type: Boolean,
      default: false,
    },
    postMain: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      mutableStats: this.stats,
    }
  },

  computed: {
    ...mapState(['forums', 'Account']),
    isLiked() {
      return this.stats.currentLike && this.stats.currentLike.status === true
    },
    isDisliked() {
      return this.stats.currentLike && this.stats.currentLike.status === false
    },
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },

  methods: {
    ...mapActions(['attemptEntityLike', 'attemptEntityLikeUpdate', 'attemptEntityLikeRemoval']),

    like(statusObj) {
      if (!this.stats.currentLike) {
        this.attemptEntityLike({
          sessionUuid: this.sessionUuid,
          entityAlias: this.entityAlias,
          entityId: this.entityId,
          data: statusObj,
        }).then(({ data }) => {
          this.mutableStats.currentLike = {
            id: data.id,
            status: data.status,
          }
          data.status ? this.mutableStats.likes++ : this.mutableStats.dislikes++
          if (this.postMain) {
            const highlightItem = {
              id: this.mutableStats.currentLike.id,
              applicationUser: {
                id: this.Account.user.id,
                userData: {
                  image: this.Account.user.profile_image,
                  name: this.Account.user.data.name,
                  username: this.Account.user.data.username,
                  uuid: this.Account.user.uuid,
                },
              },
            }
            this.forums.current.likeStatistics.highlight.push(highlightItem)
          }
          this.$emit('update:stats', this.mutableStats)
        })
      } else {
        if (this.stats.currentLike.status === !!statusObj.status) {
          this.attemptEntityLikeRemoval({
            sessionUuid: this.sessionUuid,
            entityAlias: this.entityAlias,
            likeId: this.stats.currentLike.id,
          }).then(() => {
            this.stats.currentLike.status ? this.mutableStats.likes-- : this.mutableStats.dislikes--
            if (this.postMain) {
              const index = this.forums.current.likeStatistics.highlight.findIndex(
                (item) => item.id === this.stats.currentLike.id
              )
              if (index !== -1) {
                this.forums.current.likeStatistics.highlight.splice(index, 1)
              }
            }
            this.$set(
              this.forums.current.likeStatistics,
              'highlight',
              this.forums.current.likeStatistics.highlight
            )
            this.mutableStats.currentLike = null
            this.$emit('update:stats', this.mutableStats)
          })
        } else {
          this.attemptEntityLikeUpdate({
            sessionUuid: this.sessionUuid,
            entityAlias: this.entityAlias,
            likeId: this.stats.currentLike.id,
            data: statusObj,
          }).then(({ data }) => {
            this.mutableStats.currentLike.status = data.status
            if (data.status) {
              this.mutableStats.likes++
              this.mutableStats.dislikes--
            } else {
              this.mutableStats.dislikes++
              this.mutableStats.likes--
            }
            this.$emit('update:stats', this.mutableStats)
          })
        }
      }
    },
  },
})
</script>

<template>
  <div
    class="like-container"
    :class="{ 'theme-dark': dark }"
    :data-testid="$testId('like-button')"
  >
    <Action
      flat
      type="button"
      icon="thumb_up"
      class="btn-like"
      :class="{ 'is-active': isLiked, 'like-label': isShowLabel }"
      :notify-number="disableNotify ? null : stats.likes"
      :disabled="disabled"
      @click="like({ status: 1 })"
    >
      <template
        v-if="isShowLabel"
        #inner-append
      >
        <span> {{ isLiked ? $t('forum:modal.liked') : $t('forum:modal.like') }} </span>
      </template>
    </Action>

    <Action
      v-if="dislikeActive"
      type="button"
      icon="thumb_down"
      class="btn-like"
      :class="{ 'is-active': isDisliked }"
      :notify-number="disableNotify ? null : stats.dislikes"
      :disabled="disabled"
      @click="like({ status: 0 })"
    >
    </Action>
  </div>
</template>

<style lang="scss">
@import 'Like.scss';
</style>
