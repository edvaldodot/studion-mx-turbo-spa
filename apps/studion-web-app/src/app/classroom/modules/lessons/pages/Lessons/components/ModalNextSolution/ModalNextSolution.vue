<script>
import { defineComponent } from 'vue'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import Rating from '@/components/general/Rating'
import GradientTimerBar from '@/components/general/GradientTimerBar'
import CardNextSolution from '../CardNextSolution'

export default defineComponent({
  name: 'ModalNextSolution',

  components: {
    Action,
    Modal,
    Rating,
    CardNextSolution,
    GradientTimerBar,
  },
  props: {
    actualSolution: {
      type: Object,
      default: () => {},
    },
    nextSolution: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      countDown: 31,
      timer: null,
      freezeCountdown: false,
    }
  },
  computed: {
    canUserRate() {
      return this.actualSolution._embedded.user_rating.can_rate
    },
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },

  created() {
    this.timer = setInterval(() => {
      this.dropCountDown()
    }, 1000)
  },

  methods: {
    dropCountDown() {
      if (this.countDown === 0) {
        clearInterval(this.timer)
        this.toNext()
      } else {
        this.countDown = this.countDown - 1
      }
    },

    stopCountDown() {
      this.freezeCountdown = true
      clearInterval(this.timer)
    },

    toNext() {
      this.$emit('to-next')
    },
    openedRating() {
      this.countDown = 999
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-next-solution')"
    :cancel="false"
    fill-inner-modal
    active
  >
    <div class="modal-next-solution__wrapper">
      <div class="gradient-timer__wrapper">
        <GradientTimerBar
          :timer="countDown"
          :freeze="freezeCountdown"
        />
      </div>
      <Action
        type="button"
        icon="close"
        icon-size="medium"
        class="btn-close"
        @click="$emit('close')"
      />
      <div
        v-if="$isEnabledFeature('rating') && canUserRate"
        class="modal-next-solution__left"
      >
        <h1>{{ actualSolution.name }}</h1>
        <h2>{{ $t('classroom.next.solution.modal:rating.title') }}</h2>
        <p class="text-color">{{ $t('classroom.next.solution.modal:rating.description') }}</p>
        <div class="modal-next-solution__rating">
          <p class="text-color">{{ $t('classroom.next.solution.modal:rating') }}</p>
          <Rating
            :id="actualSolution.course.id"
            :star-size="24"
            resource-type="session"
            :user-rating="actualSolution._embedded.user_rating"
            :rating-analysis="actualSolution._embedded.rating_analysis"
            inline
            @closeModal="toNext"
            @rating-submited="toNext"
            @openModal="openedRating"
            @onCommentChange="stopCountDown"
          />
        </div>
      </div>
      <div
        v-if="nextSolution"
        class="modal-next-solution__right"
      >
        <div class="modal-next-solution__right-header">
          <p class="text-color">{{ $t('classroom.next.solution.modal:next.solution') }}</p>
          <p
            class="modal-next-solution__countdown"
            v-html="$tc('classroom.next.solution.modal:countdown', countDown, { n: countDown })"
          ></p>
        </div>
        <CardNextSolution
          :image="nextSolution.course_image"
          :title="nextSolution.course_name"
          :uuid="nextSolution.session_uuid"
        />
      </div>
    </div>
  </Modal>
</template>
<style lang="scss">
.modal-next-solution__wrapper {
  background: var(--surface-section);
  border-radius: 8px;
  display: inline-flex;
  position: absolute;
  overflow: hidden;
  bottom: 60px;
  right: 60px;
  .gradient-timer__wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  .btn-close {
    position: absolute;
    top: 10px;
    right: 10px;
    .icon {
      color: var(--black-700);
    }
  }
  .modal-next-solution__left {
    padding: 27px;
    max-width: 350px;
    h1 {
      font-family: var(--font-family);
      color: var(--primary-color);
      word-break: break-word;
      margin-bottom: 18px;
    }
    h2 {
      font-family: var(--font-family);
      color: var(--text-color);
      margin-bottom: 15px;
    }
    > p {
      font-family: var(--font-family);
      color: var(--text-color);
      margin-bottom: 27px;
    }
    .modal-next-solution__rating {
      p {
        font-family: var(--font-family);
        color: var(--text-color);
        margin-bottom: 8px;
      }

      .rating__stars {
        margin-bottom: 12px;
      }
    }
  }
  .modal-next-solution__right {
    padding: 19px 29px;
    background: #e0e0e052;
    border-radius: 0 8px 8px 0;
    .modal-next-solution__right-header {
      margin-bottom: 15px;
      p {
        font-family: var(--font-family);
        color: var(--text-color);
      }
      .modal-next-solution__countdown {
        font-family: var(--font-family);
        span {
          color: var(--primary-color);
        }
      }
    }
  }
}
</style>
