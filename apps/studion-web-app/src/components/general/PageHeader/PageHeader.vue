<template>
  <div class="page-header">
    <div class="page-header__content">
      <div class="page-header__indicator">
        <slot name="indicator" />
      </div>
      <div class="page-header__section">
        <slot name="section" />
      </div>
      <div class="page-header__description">
        <slot name="description" />
      </div>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>
<style lang="scss">
@import 'PageHeader.scss';
</style>
