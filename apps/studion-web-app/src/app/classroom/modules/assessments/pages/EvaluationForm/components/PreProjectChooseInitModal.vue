<script>
import { defineComponent } from 'vue'

import ModalInformation from '@/components/general/ModalInformation'
import Icon from '@/components/general/Icon'


export default defineComponent({
  name: 'PreProjectChooseInitModal',
  components: {
    ModalInformation,
    Icon,
  }
})
</script>

<template>
  <ModalInformation
    class="choose-evaluation-init__modal"
    width="650px"
    closable
    @close="$emit('close')"
  >
    <template #pre-content>
      <Icon
        class="choose-evaluation-init__icon"
        name="import_contacts"
        wrapper
      />
    </template>

    <template #title>
      {{ $t('pre.project.choose.evaluation.init.title') }}
    </template>

    <template #content>
      <section class="choose-evaluation-init__list">
        <div
          class="choose-evaluation-init__item"
          @click="$emit('choose', 'empty')"
        >
          <Icon
            name="file-outline"
            size="large"
          />

          {{ $t("pre.project.choose.evaluation.init.with.empty") }}
        </div>

        <div
          class="choose-evaluation-init__item"
          @click="$emit('choose', 'old')"
        >
          <Icon
            name="file-document-outline"
            size="large"
          />

          {{ $t('pre.project.choose.evaluation.init.with.old') }}
        </div>
      </section>
    </template>
  </ModalInformation>
</template>

<style lang="scss">
.choose-evaluation-init__modal {
  .pre-content {
    margin: 0;
  }

  &.modal-information .modal-confirm .modal-confirm-title {
    margin-bottom: 1rem;
  }

  .choose-evaluation-init__icon {
    width: 35px;
    height: 35px;
    background-color: var(--primary-color);
    border-radius: 50%;

    svg {
      fill: #FFF;
      width: 22px;
      height: 22px;
    }
  }

  .choose-evaluation-init__list {
    display: flex;
    flex-direction: row;
    gap: 25px;
    justify-content: center;


    .choose-evaluation-init__item {
      flex: 1;
      background-color: #F2F2F2;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      font-size: 1.5em;
      max-width: 200px;
      text-align: center;
      cursor: pointer;

      svg {
        width: 28px;
        height: 28px;

        margin-bottom: 15px;
      }
    }
  }
}
</style>
