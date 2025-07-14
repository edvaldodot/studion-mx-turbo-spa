<script>
import Icon from '../../Icon'

export default {
  name: 'LogoutButton',
  components: {
    Icon,
  },
}
</script>

<template>
  <RouterLink
    :to="{ name: 'auth.logout', params: { isStudent: equalsProfile('student') } }"
    class="profile-content-link btn--logout"
  >
    <Icon
      name="logout"
      wrapper
    />
    <span class="text">{{ $t('global:profile.menu.4') }}</span>
  </RouterLink>
</template>

<style lang="scss">
.profile-content-link.btn--logout {
  position: absolute;
  right: 10px;
  top: 10px;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: var(--primary-700);
    background: transparent;
  }

  @media screen and (max-width: 1023px) {
    font-size: 1.4em;
  }
}
</style>
