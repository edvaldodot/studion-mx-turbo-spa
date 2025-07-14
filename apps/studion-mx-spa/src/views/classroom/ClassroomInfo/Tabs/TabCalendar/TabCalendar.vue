<script setup lang="ts">
import { Button } from "@/components/general";
</script>
<template>
  <div class="p-5">
    <div class="flex flex-column gap-2">
      <div class="flex align-items-center justify-content-between">
        <div class="text-3xl font-black text-black-700">Calendário</div>
        <Button> Criar evento </Button>
      </div>
      <div class="text-base text-black-900">
        Crie novos eventos ou visualize os eventos cadastrados pelos
        responsáveis.
      </div>
    </div>

    <div class="grid mt-8">
      <div class="col-12"></div>
    </div>
  </div>
</template>
