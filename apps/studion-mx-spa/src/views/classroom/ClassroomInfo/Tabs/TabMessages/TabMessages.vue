<script setup lang="ts">
import { Button, EmptyMessage } from "@/components/general";
</script>
<template>
  <div class="p-5">
    <div class="flex flex-column gap-2">
      <div class="flex align-items-center justify-content-between">
        <div class="text-3xl font-black text-black-700">Mensagens</div>
        <Button> Criar mensagem </Button>
      </div>
      <div class="text-base text-black-900">
        Envie e gerencie mensagens nessa turma.
      </div>
    </div>

    <div class="grid mt-8">
      <div class="mx-auto col-8">
        <EmptyMessage
          :emptyState="4"
          showIcon
          title="Nenhuma mensagem"
          text="Envie mensagens para alunos ou responsáveis da turma. Este menu fica sempre visível para os alunos, que também podem iniciar conversas."
        />
      </div>
    </div>
  </div>
</template>
