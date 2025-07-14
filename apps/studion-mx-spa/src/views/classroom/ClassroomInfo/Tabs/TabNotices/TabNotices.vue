<script setup lang="ts">
import { Button, EmptyMessage } from "@/components/general";
</script>
<template>
  <div class="p-5">
    <div class="flex flex-column gap-2">
      <div class="flex align-items-center justify-content-between">
        <div class="text-3xl font-black text-black-700">Avisos</div>
        <Button> Criar aviso </Button>
      </div>
      <div class="text-base text-black-900">
        Confira as atualizações e comunicados do responsável pela turma.
      </div>
    </div>

    <div class="grid mt-8">
      <div class="mx-auto col-8">
        <EmptyMessage
          :emptyState="4"
          showIcon
          title="Nenhuma aviso"
          text="Você ainda não recebeu avisos. Assim que um responsável publicar algo novo, o aviso será exibido aqui."
        />
      </div>
    </div>
  </div>
</template>
