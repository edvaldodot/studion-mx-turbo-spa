<script>

import LinksBar from '@/components/general/LinksBar'
import Logo from '@/components/general/Logo'
import Tabs from '@/components/general/Tabs'

export default {
  name: 'PasswordResetConfirm',
  components: {
    LinksBar,
    Logo,
    Tabs
  },
  data () {
    return {
      tablinks: [
        {
          text: 'auth:tab.login',
          location: { name: 'auth.signin' }
        },
        {
          text: 'auth:tab.register',
          location: { name: 'auth.signup' }
        }
      ]
    }
  }
}
</script>

<template>
  <div class="main-content  auth">
    <LinksBar dark />
    <div class="old-center clearfix">
      <div class="company" v-if="$media.mobile">
        <Logo class="company-logo" :theme="$theme" dark />
        <p class="company-headline">{{ $t('global:studion.headline') }}</p>
      </div>
      <div class="form">
        <Tabs :links="tablinks" dark />
        <div class="description">
          <h2>{{ $t('auth.reset.confirm:title') }}</h2>
          <p class="text-color">{{ $t('auth.reset.confirm:description') }}</p>
        </div>
      </div>
      <div class="company" v-if="!$media.mobile">
        <Logo class="company-logo" :theme="$theme" dark />
        <p class="company-headline">{{ $t('global:studion.headline') }}</p>
      </div>
      <div class="support" v-if="$media.mobile">
        <p class="support-text"></p>
        <div class="support-images"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@/app/auth/styles.scss";
</style>
