<script>
import { mapActions } from 'vuex'
import ContentHeader from '@/components/general/ContentHeader'
import Icon from '@/components/general/Icon'

import iconNames from './IconNames.json'

export default {
  name: 'IconsLibraryDevelopment',
  components: {
    ContentHeader,
    Icon,
  },

  data() {
    return {
      iconNames,
    }
  },

  methods: {
    ...mapActions(['setFeedback']),

    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
      this.setFeedback({ message: `<b>${text}</b> was copied to your clipboard!` })
    },
  },
}
</script>

<template>
  <div class="main-content">
    <ContentHeader
      title="Icons Library Development"
      class="header-admin"
    />

    <div class="center">
      <ul class="icons-container">
        <li
          v-for="(name, index) in iconNames"
          :key="name + index"
          @click="copyToClipboard(name)"
          class="icon-item"
          :title="'Click to copy ' + name"
        >
          <Icon :name="name" />
          <span>{{ name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.icons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem 1rem;
  padding: 2rem 0;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  gap: 1rem;
  border: 2px solid var(--primary-700);
  padding: 2px 5px;
  border-radius: 5px;
  cursor: copy;

  span {
    word-break: break-all;
  }
}
</style>
