<script>
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import LinksBar from '@/components/general/LinksBar'
import Logo from '@/components/general/Logo'
import Tabs from '@/components/general/Tabs'

export default {
  name: 'PasswordRecoveryConfirm',
  components: {
    Action,
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
          location: { name: 'auth.signup' },
          disabled: true
        }
      ]
    }
  },
  created () {
    this.setFetching(true)
    this.attemptPostInstanceSettingsRetrieval()
      .then((response) => {
        const allowRegister = response.data.allow_register
        if (allowRegister) {
          this.tablinks[1].disabled = false
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptPostInstanceSettingsRetrieval'
    ]),
    back () {
      this.$router.push({ name: 'auth.recovery' })
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
        <Action
          v-if="!$media.mobile"
          :data-testid="$testId('action-button--back')"
          :text="$t('global:back')"
          icon="keyboard_backspace"
          type="button"
          class="back"
          @click="back()"
          flat
          dark
        />
        <div class="description">
          <h2>{{ $t('auth.recovery.confirm:title') }}</h2>
          <p v-html="$t('auth.recovery.confirm:msg.1', {'email': this.$route.params.email})"></p>
          <p v-html="$t('auth.recovery.confirm:msg.2')"></p>
        </div>
      </div>
      <div class="company" v-if="!$media.mobile">
        <Logo :theme="$theme" class="company-logo" dark />
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
