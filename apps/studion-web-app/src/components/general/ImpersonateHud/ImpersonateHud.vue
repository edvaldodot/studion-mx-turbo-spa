<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { cookieMixin } from '@/mixins/cookieMixin'

import Action from '../Action'
import Checkbox from '../Checkbox'
import ModalDialog from '../ModalDialog'

const IMPERSONATE_MODAL_COOKIE = 'impersonate-tip'

export default defineComponent({
  name: 'ImpersonateHud',

  components: {
    Action,
    Checkbox,
    ModalDialog,
  },

  mixins: [cookieMixin],

  data() {
    return {
      tipModal: false,
      notShowTipAgain: false,
    }
  },

  computed: {
    ...mapState({
      user: (state) => state.Account.user,
    }),

    tipCookie() {
      return this.getCookie(IMPERSONATE_MODAL_COOKIE)
    },
  },

  created() {
    this.openTipModal()
  },

  methods: {
    ...mapActions(['leaveImpersonate']),

    getCurrentActiveProfile(user) {
      if (user.currentProfile !== 'agent') return this.$t(`global:${user.currentProfile}`)

      const currentAgentProfile = user.profiles.find(
        (profile) => profile.id == user.currentProfileId
      )

      return (currentAgentProfile && currentAgentProfile.name) || ''
    },

    /**
     * Open tipModal and set cookies
     */
    openTipModal() {
      if (!this.tipCookie) this.tipModal = true
    },

    /**
     * Set cookie if user ask to not show again and close modal
     * This information will be stored for 1 year
     */
    closeTipModal() {
      if (this.notShowTipAgain) this.setCookie(IMPERSONATE_MODAL_COOKIE, true, 365)
      this.tipModal = false
    },
  },
})
</script>

<template>
  <div
    v-if="user && user.data"
    class="impersonate-hub"
  >
    <div class="impersonate-hub__actions">
      <span class="message">
        {{
          $t($media.mobile ? 'impersonate:hud:message:2' : 'impersonate:hud:message:1', {
            name: $upperCase(user.data.name),
            profile: getCurrentActiveProfile(user),
          })
        }}
      </span>

      <Action
        :data-testid="$testId('leave-impersonate')"
        :text="$t('impersonate:hud:leave')"
        :icon="$media.mobile ? 'logout' : null"
        :hide-label="$media.mobile"
        class="leave"
        type="button"
        @click="leaveImpersonate($route.name)"
      />
    </div>

    <ModalDialog
      :active="tipModal"
      class="impersonate-hub__tip"
      @close="closeTipModal"
    >
      <template #title>{{ $t('impersonate:hud:tip.title') }}</template>
      <template #description><p v-html="$t('impersonate:hud:tip.description')"></p></template>
      <template #footer>
        <Checkbox
          v-model="notShowTipAgain"
          :items="[
            {
              value: true,
              label: $t('global:not.show.again'),
            },
          ]"
        />
        <Action
          :text="$t('global:continue')"
          type="button"
          flat
          @click="closeTipModal"
        />
      </template>
    </ModalDialog>
  </div>
</template>

<style lang="scss">
@import 'ImpersonateHud.scss';
</style>
