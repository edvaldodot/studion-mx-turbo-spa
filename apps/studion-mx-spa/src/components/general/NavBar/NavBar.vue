<script setup lang="ts">
import Breadcrumbs from "@/components/general/Breadcrumbs";
import { useBreadcrumb } from "@/composables/useBreadcrumb";
const { list, handleNavigate } = useBreadcrumb();

</script>

<template>
  <nav class="nav-bar">
    <div class="content">
      <Breadcrumbs
        size="small"
        :breadcrumbs-list="list"
        clickable
        @click="handleNavigate"
      />
    </div>
  </nav>
</template>

<style lang="scss">
@use "NavBar.scss";
</style>
