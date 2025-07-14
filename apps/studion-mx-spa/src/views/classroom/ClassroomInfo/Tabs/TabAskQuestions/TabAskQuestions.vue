<script setup lang="ts">
import { Button, EmptyMessage } from "@/components/general";
</script>
<template>
  <div class="p-5">
    <div class="flex flex-column gap-2">
      <div class="flex align-items-center justify-content-between">
        <div class="text-3xl font-black text-black-700">Tira-dúvidas</div>
      </div>
      <div class="text-base text-black-900">
        Responda às dúvidas enviadas pelos alunos.
      </div>
    </div>

    <div class="grid mt-8">
      <div class="mx-auto col-8">
        <EmptyMessage
          :emptyState="4"
          showIcon
          title="Nenhuma dúvida"
          text="Parece que ainda não há perguntas dos alunos. Acompanhe a área—assim que alguém enviar uma dúvida, ela aparecerá aqui para você responder."
        />
      </div>
    </div>
  </div>
</template>
