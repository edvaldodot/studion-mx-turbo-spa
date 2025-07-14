<script>
import { defineComponent } from 'vue'

import StatusTooltipMandatory from './StatusTooltipMandatory.vue'

import EvaluationFeedBackMandatory from './EvaluationFeedBackMandatory.vue'

export default defineComponent({
  name: 'MandatoryContent',
  components: {
    StatusTooltipMandatory,
    EvaluationFeedBackMandatory,
  },
  props: {
    numPosts: {
      type: [Number, String],
      default: null,
    },
    numComments: {
      type: [Number, String],
      default: null,
    },
    checkPost: {
      type: Boolean,
      default: false,
    },
    checkComments: {
      type: Boolean,
      default: false,
    },
    progressComments: {
      type: [Number, String],
      default: null,
    },
    progressPosts: {
      type: [Number, String],
      default: null,
    },
    isCard: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: Object,
      default: () => ({}),
    },
    connectiveOr: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div
    class="mandatory"
    :class="{ card: isCard }"
  >
    <div class="mandatory__container__title">
      <p class="mandatory__title">
        {{ $t('classroom.forum:interaction:comment:title:interactions') }}
      </p>
      <p
        v-if="isCard"
        class="mandatory__title__progress"
      >
        {{ $t('classroom.forum:interaction:comment:title:progress') }}
      </p>
    </div>
    <div class="mandatory__content">
      <div v-if="connectiveOr">
        <div class="mandatory__container__title">
          <StatusTooltipMandatory :checked="checkPost || checkComments">
            <div
              class="container-message"
              v-html="
                $t('classroom.forum:interaction:postsOrComments:message', {
                  num1: numPosts,
                  num2: numComments,
                  subject1:
                    numPosts === 1
                      ? $t('classroom.forum:interaction:post')
                      : $t('classroom.forum:interaction:posts'),
                  subject2:
                    numComments === 1
                      ? $t('classroom.forum:interaction:comment')
                      : $t('classroom.forum:interaction:comments'),
                })
              "
            ></div>
          </StatusTooltipMandatory>
          <p
            v-if="numPosts && numComments && isCard"
            class="mandatory__description"
            :class="{ card: progressPosts >= numPosts || progressComments >= numComments }"
            v-html="
              $t('classroom.forum:interaction:commentOrPost:progress', {
                numProgress1: progressPosts,
                numTotal1: numPosts,
                numProgress2: progressComments,
                numTotal2: numComments,
                subject1: numPosts === 1
                      ? $t('classroom.forum:interaction:post')
                      : $t('classroom.forum:interaction:posts'),
                subject2: numComments === 1
                      ? $t('classroom.forum:interaction:comment')
                      : $t('classroom.forum:interaction:comments'),
              })
            "
          ></p>
        </div>
      </div>

      <div v-if="!connectiveOr">
        <div class="mandatory__container__title">
          <StatusTooltipMandatory
            v-if="numPosts"
            :checked="checkPost"
          >
            <div
              class="container-message"
              v-html="
                $t('classroom.forum:interaction:posts:message', {
                  num: numPosts,
                  subject:
                    numPosts === 1
                      ? $t('classroom.forum:interaction:post')
                      : $t('classroom.forum:interaction:posts'),
                })
              "
            ></div>
          </StatusTooltipMandatory>
          <p
            v-if="numPosts && isCard"
            class="mandatory__description"
            :class="{ card: progressPosts >= numPosts }"
          >
            {{
              $tc('classroom.forum:interaction:comment:progress', progressPosts, numPosts, {
                numProgress: progressPosts,
                numTotal: numPosts,
              })
            }}
          </p>
        </div>
        <div class="mandatory__container__title">
          <StatusTooltipMandatory
            v-if="numComments"
            :checked="checkComments"
          >
            <div
              class="container-message"
              v-html="
                $t('classroom.forum:interaction:comments:message', {
                  num: numComments,
                  subject:
                    numComments === 1
                      ? $t('classroom.forum:interaction:comment')
                      : $t('classroom.forum:interaction:comments'),
                })
              "
            ></div>
          </StatusTooltipMandatory>

          <p
            v-if="numComments && isCard"
            class="mandatory__description"
            :class="{ card: progressComments >= numComments }"
          >
            {{
              $tc('classroom.forum:interaction:comment:progress', progressComments, numComments, {
                numProgress: progressComments,
                numTotal: numComments,
              })
            }}
          </p>
        </div>
      </div>

      <div v-if="feedback && feedback.grade">
        <EvaluationFeedBackMandatory :feedback-value="feedback" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.mandatory {
  margin-top: 23px;
  border: 1px solid var(--surface-200);
  border-radius: 8px;
  padding: 13px 7px;

  &.card {
    padding: 16px;
    margin-top: 35px;
    background: #fff;
    border-radius: 8px;

    .mandatory {
      &__container__title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      &__description {
        font-size: 1.15em;
        text-align: right;

        &.card {
          color: var(--secondary-color);
        }
      }

      &__title__progress {
        font-family: var(--font-family);
        font-size: 0.75rem;
        font-weight: bold;
        color: var(--secondary-color);
        margin-bottom: 10px;
        text-align: right;
      }
    }
  }

  &__title {
    font-family: var(--font-family);
    font-size: 1rem;
    font-weight: bold;
    color: var(--black-700);
  }

  &__content {
    margin-top: 10px;
    display: grid;
    gap: 5px;
  }

  .container-message {
    .num {
      color: var(--secondary-color);
    }

    .subject {
      text-transform: lowercase;
    }
  }
}
</style>
