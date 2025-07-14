<script>
import * as types from '@/domains/auth/vuex/mutations-types'

import Action from '@/components/general/Action'
import LinksBar from '@/components/general/LinksBar'
import Logo from '@/components/general/Logo'
import Tabs from '@/components/general/Tabs'

export default {
  name: 'SigninUserBlocked',
  components: {
    Action,
    LinksBar,
    Logo,
    Tabs,
  },
  data() {
    return {
      tablinks: [
        {
          text: 'auth:tab.login',
          location: { name: 'auth.signin' },
        },
        {
          text: 'auth:tab.register',
          location: { name: 'auth.signup' },
        },
      ],
      formattedTime: '',
      timerInterval: null,
    }
  },
  computed: {
    waitingTime: {
      get(state) {
        return this.$store.state.Auth.waitingTime
      },
      set(value) {
        this.$store.commit(types.SET_WAITING_TIME, value)
      },
    },
  },
  methods: {
    back() {
      this.$router.push({ name: 'auth.signin' })
    },
    formatTime(time) {
      if (time === 0) {
        clearInterval(this.timerInterval)
        this.$router.replace({ name: 'auth.signin' })
        return
      }
      if (time < 60) {
        this.formattedTime = `${time} ${this.$t('global:seconds').toLowerCase()}`
      } else if (time > 60) {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        this.formattedTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds} ${this.$t(
          'global:minutes'
        ).toLowerCase()}`
      } else {
        this.formattedTime = `1:00 ${this.$t('global:minute').toLowerCase()}`
      }
    },
  },
  created() {
    let time = this.waitingTime ? this.waitingTime : this.$route.params.time
    if (!time) this.$route.replace({ name: 'auth.signin' })
    time = Math.floor(time)
    this.formatTime(time)
    this.timerInterval = setInterval(() => {
      time = time - 1
      this.waitingTime = time
      this.formatTime(time)
    }, 1000)
  },
  destroyed() {
    this.waitingTime = 0
    clearInterval(this.timerInterval)
  },
}
</script>

<template>
  <div class="main-content auth">
    <LinksBar dark />
    <div class="old-center clearfix">
      <div
        class="company"
        v-if="$media.mobile"
      >
        <Logo
          class="company-logo"
          :theme="$theme"
          dark
        />
        <p class="company-headline">{{ $t('global:studion.headline') }}</p>
      </div>
      <div class="form">
        <Tabs
          :links="tablinks"
          dark
        />
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
          <h2>{{ $t('auth.signin.blocked:title') }}</h2>
          <p v-html="$t('auth.signin.blocked:msg', { formattedTime })"></p>
        </div>
      </div>
      <div
        class="company"
        v-if="!$media.mobile"
      >
        <Logo
          class="company-logo"
          :theme="$theme"
          dark
        />
        <p class="company-headline">{{ $t('global:studion.headline') }}</p>
      </div>
      <div
        class="support"
        v-if="$media.mobile"
      >
        <p class="support-text"></p>
        <div class="support-images"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/app/auth/styles.scss';
</style>
