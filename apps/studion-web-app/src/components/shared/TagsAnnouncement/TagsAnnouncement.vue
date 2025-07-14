<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TagsAnnouncement',

  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    text: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
      default: false,
    }
  },

  methods: {
    addTag(tag) {
      this.$emit('add:tag', tag)
    },
  },
})
</script>

<template>
  <div
    class="tags-announcement-content"
    :class="{'dark-tag': dark}"
    :data-testid="$testId('tag-announcement')"
  >
    <span>{{ text }}</span>
    <ul>
      <li
        v-for="(tag, index) in tags"
        :key="index"
        @click="addTag(tag)"
      >
        {{ tag.text }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.tags-announcement-content {
  padding: 10px 0px 70px;

  span {
    display: block;
    padding: 0 0 16px 0;
    color: var(--text-color);
    font-style: italic;
    font-size: 1.2em;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(30%, 1fr));
    gap: 16px;

    li {
      font-size: 1.4em;
      font-weight: bolder;
      cursor: pointer;

      color: var(--text-color);
      &:hover {
        color: var(--text-color);
      }
    }
  }
}

.tags-announcement-content.dark-tag {
  padding: 10px 0px 70px;

  span {
    color: var(--text-color);
  }

  ul {
    li {
      color: var(--text-color);
      &:hover {
        color: var(--text-color);
      }
    }
  }
}

</style>
