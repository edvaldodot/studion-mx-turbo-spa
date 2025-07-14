<script setup lang="ts">
import { Button, EmptyMessage } from "@/components/general";
</script>
<template>
  <div class="p-5">
    <div class="flex flex-column gap-2">
      <div class="flex align-items-center justify-content-between">
        <div class="text-3xl font-black text-black-700">Presenças</div>
        <Button> Criar lista </Button>
      </div>
      <div class="text-base text-black-900">
        Crie e gerencie listas de presença apenas nessa turma.
      </div>
    </div>

    <div class="grid mt-8">
      <div class="mx-auto col-8">
        <EmptyMessage
          :emptyState="4"
          showIcon
          title="Nenhum conteúdo"
          text="Organize e acompanhe a presença nos eventos presenciais de forma prática! Este menu é exclusivo para administradores e responsáveis, não sendo exibido para os alunos."
        />
      </div>
    </div>
  </div>
</template>
