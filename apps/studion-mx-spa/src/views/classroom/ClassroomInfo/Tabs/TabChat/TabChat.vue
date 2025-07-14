<script setup lang="ts">
import { Button, EmptyMessage } from "@/components/general";
</script>
<template>
  <div class="p-5">
    <div class="flex flex-column gap-2">
      <div class="flex align-items-center justify-content-between">
        <div class="text-3xl font-black text-black-700">Chat</div>
        <Button> Criar chat </Button>
      </div>
      <div class="text-base text-black-900">
        Crie e gerencie os chats apenas nessa turma.
      </div>
    </div>

    <div class="grid mt-8">
      <div class="mx-auto col-8">
        <EmptyMessage
          :emptyState="4"
          showIcon
          title="Nenhum conteúdo"
          text="Ative chats para facilitar a comunicação em tempo real entre alunos e instrutores! Este menu será exibido apenas quando o chat estiver habilitado."
        />
      </div>
    </div>
  </div>
</template>
