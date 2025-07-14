<script>
import Icon from '@/components/general/Icon'

export default {
  name: 'CardNextSolution',
  components: {
    Icon,
  },
  props: {
    image: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    uuid: {
      type: String,
      default: '',
    },
  },
}
</script>
<template>
  <a
    class="card-next-solution__container"
    @click="
      $router.push({
        name: 'classroom.lessons.course',
        params: {
          session_uuid: uuid,
          trail_id: $route.params.trail_id,
          redirected: true,
        },
      })
    "
  >
    <img
      :src="image"
      height="115"
      width="175"
    />
    <div class="card-next-solution__title-wrapper">
      <h2>{{ title }}</h2>
      <Icon name="keyboard_arrow_right" />
    </div>
  </a>
</template>
<style lang="scss">
.card-next-solution__container {
  cursor: pointer;
  img {
    display: block;
    border-radius: 5px 5px 0 0;
  }
  .card-next-solution__title-wrapper {
    padding: 13px 0 11px 8px;
    background: var(--surface-card);
    box-shadow: 0px 10px 20px #0000001a;
    width: 175px;
    border-radius: 0 0 5px 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .icon {
      stroke: var(--black-700);
      fill: var(--black-700);
    }
    h2 {
      font-family: var(--font-family);
      color: var(--text-color);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 150px;
    }
  }
}
</style>
