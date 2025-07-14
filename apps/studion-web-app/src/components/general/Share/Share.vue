<script>
import Icon from '../Icon'
import config from '@/config'

const { APP_TITLE } = config

export default {
  name: 'Share',
  components: {
    Icon
  },
  data () {
    return {
      hashtag: APP_TITLE,
    }
  },
  props: {
    dark: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    openShare (href, title) {
      href = href + window.location.href
      let windowParams = 'width=500,height=400,resizable=no'
      var newWindow = window.open(href, title, windowParams)
      newWindow && newWindow.focus()
    }
  }
}
</script>

<template>
  <div class="share" :class="{'theme-dark': dark}">
    <span class="share-title">{{ $t('global:share.title') }}:</span>
    <div class="share-list">
      <a href="#" class="share-link" title="Facebook" target="_blank" @click.prevent="openShare('https://www.facebook.com/sharer.php?u=', 'Facebook')">
        <icon name="facebook-circle"></icon>
      </a>
      <a href="#" class="share-link" title="Twitter" target="_blank" @click.prevent="openShare(`https://twitter.com/share?text=&hashtags=${hashtag}&url=`, 'Twitter')">
        <icon name="twitter-circle"></icon>
      </a>
      <a href="#" class="share-link" title="Google" target="_blank" @click.prevent="openShare('https://plus.google.com/share?url=', 'Google')">
        <icon name="google-circle"></icon>
      </a>
      <a href="#" class="share-link linkedin-share-link" title="Linkedin" target="_blank" @click.prevent="openShare('https://www.linkedin.com/shareArticle?mini=true&url=', 'Linkedin')">
        <icon name="linkedin-circle"></icon>
      </a>
      <a href="#" class="share-link" title="Whatsapp" target="_blank" @click.prevent="openShare(`https://api.whatsapp.com/send?text=#${hashtag}`, 'Whatsapp')">
        <icon name="whatsapp-circle"></icon>
      </a>
    </div>
  </div>
</template>

<style lang="scss">@import "Share.scss";</style>
