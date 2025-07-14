<script setup lang="ts">
import { Button, EmptyMessage } from "@/components/general";
</script>
<template>
  <div class="p-5">
    <div class="flex flex-column gap-2">
      <div class="flex align-items-center justify-content-between">
        <div class="text-3xl font-black text-black-700">Fórum</div>
        <Button> Criar tópico </Button>
      </div>
      <div class="text-base text-black-900">
        Crie e gerencie tópicos apenas nessa turma.
      </div>
    </div>

    <div class="grid mt-8">
      <div class="mx-auto col-8">
        <EmptyMessage
          :emptyState="4"
          showIcon
          title="Nenhum conteúdo"
          text="Crie fóruns de discussão para engajar os alunos e promover a troca de ideias! Este menu será exibido aos alunos apenas quando houver fóruns cadastrados."
        />
      </div>
    </div>
  </div>
</template>
