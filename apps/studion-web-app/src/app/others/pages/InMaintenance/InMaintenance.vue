<script>
import { defineComponent } from 'vue'

import Logo from '@/components/general/Logo'
import LinksBar from '@/components/general/LinksBar'

export default defineComponent({
  name: 'InMaintenance',

  components: {
    Logo,
    LinksBar,
  },

  created() {
    if (process.env.VUE_APP_IN_MAINTENANCE !== 'true') {
      this.$router.push({ name: 'dashboard' })
    }
  },
})
</script>

<template>
  <div
    class="app-maintenance auth"
    :data-testid="$testId('app-maintenance')"
  >
    <LinksBar dark />
    <section class="app-maintenance__info">
      <Logo
        class="company-logo"
        :theme="$theme"
        dark
      />
      <img
        class="app-maintenance__info-icon"
        src="/assets/images/themes/default/fto/maintenance.png"
      />
      <div class="description">
        <h2>{{ $t('maintenance.title') }}</h2>
        <p class="text-color">{{ $t('maintenance.description') }}</p>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.app-maintenance {
  &.auth {
    height: 100vh;

    .company-logo,
    .logo-image,
    .company-logo .logo-image {
      height: min-content;
      width: 200px;
      margin-bottom: 0;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 95%;
    max-width: 660px;
    margin: 0 auto;
    gap: 1em;
    padding-bottom: 128px;

    &-icon {
      margin: 24px 0;
    }

    h3 {
      text-transform: uppercase;
      font-size: 2.6em;
      margin: 12px 0;
    }
  }

  .links-bar-item {
    &.certificate-option {
      display: none;
    }
  }
}

@import '~@/app/auth/styles.scss';
</style>
