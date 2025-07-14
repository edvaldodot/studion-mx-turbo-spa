<script>
import { mapState } from 'vuex'

export default {
  name: 'Logo',
  props: {
    theme: {
      type: String,
      default: 'default',
    },
    link: {
      type: String,
      default: '/',
    },
    logo: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      name: 'studion',
      logoPath: '',
    }
  },
  computed: {
    ...mapState(['language']),
  },
  watch: {
    language() {
      this.setLogoPath()
    },
  },
  created() {
    this.setLogoPath()
  },
  methods: {
    async checkLogoExists(path) {
      try {
        const response = await fetch(path)
        if (response.ok && response.headers.get('Content-Type').includes('image')) {
          return true
        } else {
          return false
        }
      } catch {
        return false
      }
    },
    async setLogoPath() {
      const theme = this.theme || 'default'
      const extension = 'svg'
      const filename = this.logo
        ? this.dark
          ? `${theme}-logo-dark`
          : `${theme}-logo`
        : this.dark
        ? `${theme}-dark`
        : theme
      const path = `/assets/images/themes/${theme}/${extension}/`
      const url = `${path}${filename}-${this.language}.${extension}`

      this.logoPath = (await this.checkLogoExists(url)) ? url : `${path}${filename}.${extension}`
    },
  },
}
</script>

<template>
  <a
    v-if="link"
    :data-testid="$testId('logo')"
    :href="link"
    class="logo"
  >
    <img
      :src="logoPath"
      class="logo-image"
    />
  </a>
  <div
    v-else
    :data-testid="$testId('logo')"
    class="logo"
  >
    <img
      :src="logoPath"
      class="logo-image"
    />
  </div>
</template>

<style lang="scss">
@import 'Logo.scss';
</style>
