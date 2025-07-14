<script setup lang="ts">
import { formatDateLong } from '@/utils/formatters';
import { Button, EmptyMessage, Icon } from '@/components/general';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// props
defineProps<{ classroomData: any }>()

</script>
<template>
  <div class="p-4">
    <div class="grid">
      <div class="col-2">
        <div class="grid">
          <div class="col-auto">
            <Icon pack="material" class="classroom-tab-initial__icon text-primary" name="hourglass" />
          </div>
          <div class="col">
            <p class="classroom-tab-initial__label">Carga Horária</p>
            <p class="classroom-tab-initial__value" v-if="classroomData?.journey?.workload">{{ classroomData.journey.workload.value }} {{ t('global:' + classroomData.journey.workload.type) }}</p>
          </div>
        </div>
      </div>
      <div class="col-2">
        <div class="grid">
          <div class="col-auto">
            <Icon pack="material" class="classroom-tab-initial__icon text-primary" name="schedule" />
          </div>
          <div class="col">
            <p class="classroom-tab-initial__label">Duração</p>
            <p class="classroom-tab-initial__value" v-if="classroomData?.journey?.workload">{{ classroomData.journey.workload.value }} {{ t('global:' + classroomData.journey.workload.type) }}</p>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="grid">
          <div class="col-auto">
            <Icon pack="material" class="classroom-tab-initial__icon text-primary" name="calendar_today" />
          </div>
          <div class="col">
            <p class="classroom-tab-initial__label">Data da Turma</p>
            <p class="classroom-tab-initial__value">{{ formatDateLong(classroomData.session.start_time) }} até {{ formatDateLong(classroomData.session.end_time) }}</p>
          </div>
        </div>
      </div>
      <div class="col-2">
        <div class="grid">
          <div class="col-auto">
            <Icon pack="material" class="classroom-tab-initial__icon text-primary" name="school" />
          </div>
          <div class="col">
            <p class="classroom-tab-initial__label">Certificação</p>
            <p class="classroom-tab-initial__value">N/A</p>
          </div>
        </div>
      </div>
      <div class="col-2">
        <div class="grid">
          <div class="col-auto">
            <Icon pack="material" class="classroom-tab-initial__icon text-primary" name="group" />
          </div>
          <div class="col">
            <p class="classroom-tab-initial__label">Responsáveis</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid mt-2">
      <div class="col-8">
        <Icon pack="material" class="classroom-tab-initial__section-icon" name="menu_book" />
        <p class="classroom-tab-initial__section-title">Direto aos Estudos</p>

        <div class="grid mt-2">
          <div class="col-9">
            <div class="grid grid-nogutter mt-2">
              <div class="col-2">
                <div class="classroom-tab-initial__study-icon bg-primary-400">
                  <Icon pack="material" class="icon" name="menu_book" />
                </div>
              </div>
              <div class="col-10">
                <div class="classroom-tab-initial__study-box bg-primary-900 p-4">
                  <p class="text-base lato-bold">Suas aulas já estão disponíveis</p>
                  <p class="text-base mt-2">Continue de onde parou ou acesse o menu à esquerda.</p>
                  <a href="#" class="mt-4 text-white text-base lato-bold inline-block">Acessar</a>
                </div>
              </div>
            </div>
          </div>

          <div class="col-3">
            <div class="classroom-tab-initial__events-box p-2 mt-2">
              <div class="classroom-tab-initial__forum-icon bg-primary-200 text-center">
                <Icon pack="material" class="icon text-primary-900" name="post" />
              </div>
              <p class="mt-4 text-base lato-bold">Novos fóruns disponíveis</p>
              <a href="#" class="mt-4 text-primary text-base lato-bold inline-block">Acessar</a>
            </div>
          </div>
        </div>
      </div>

      <div class="col-4">
        <Icon pack="material" class="classroom-tab-initial__section-icon" name="event" />
        <p class="classroom-tab-initial__section-title">Eventos</p>

        <div class="classroom-tab-initial__events-box p-2 mt-2">
          <EmptyMessage
            :emptyState="4"
            showIcon
            title="Nenhum evento cadastrado"
            text="Crie novos eventos ou visualize os eventos já cadastrados por responsáveis."
          />
          <div class="text-center mt-4">
            <Button class="inline-block">Criar Evento</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.classroom-tab-initial__label {
  font-weight: 700;
  color: var(--black-700);
  font-size: 12px;
  line-height: 22px;
}

.classroom-tab-initial__value {
  font-weight: 700;
  color: var(--black-700);
  font-size: 16px;
  line-height: 26px;
}

.classroom-tab-initial__icon {
  line-height: 60px;
  margin-right: 8px;
}

.classroom-tab-initial__section-title {
  font-weight: 700;
  color: var(--black-700);
  font-size: 24px;
  line-height: 30px;
  display: inline-block;
}

.classroom-tab-initial__section-icon {
  display: inline-block;
  margin-right: 8px;
  font-size: 24px;
}

.classroom-tab-initial__events-box {
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  min-height: 160px;
}

.classroom-tab-initial__study-icon {
  border-radius: 6px 0 0 6px;
  height: 160px;
  text-align: center;

  .icon {
    line-height: 140px;
    color: #fff;
    font-size: 24px;
  }
}

.classroom-tab-initial__study-box {
  border-radius: 0 6px 6px 0;
  height: 160px;
  color: #fff;
  padding: 16px;
}

.classroom-tab-initial__forum-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  text-align: center;

  .icon {
    line-height: 42px;
  }
}
</style>