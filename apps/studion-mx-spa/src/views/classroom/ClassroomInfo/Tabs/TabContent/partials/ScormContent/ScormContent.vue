<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Icon, Button } from "@/components/general";
import { useJourneyStore } from "@/stores";
import { computed, onMounted, ref } from "vue";
import { toastError } from "@/utils/toast";
import { useRoute } from "vue-router";

interface MenuItem {
  index: number;
  text?: string;
  level?: number;
  disabled?: boolean;
  completed?: boolean;
  active?: boolean;
}

interface IframePostMessages {
  type: "removeUnloadEvent" | "menu" | "link";
  index?: number;
  command?: string;
  menu?: Array<MenuItem>;
}

// i18n
const { t } = useI18n();

// routing
const route = useRoute();

// data
let scormMenu = ref<Array<MenuItem>>([]);
let isOpenScormMenu = ref(true);

// stores
const journeyStore = useJourneyStore();

// computed
const scormContent = computed(() => journeyStore.getCurrentContent);
const scormURL = computed(() => scormContent.value.metadata.url);
const journeyUuid = computed<any>(() => route.params.journeyUuid);
const sessionUuid = computed<any>(() => route.params.sessionUuid);
const contentUuid = computed<any>(() => route.query.currentContentUuid);
const lastPageCompleted = computed(
  () => scormMenu.value[scormMenu.value.length - 1]?.completed
);
const scormIsNotCompleted = computed(
  () => scormContent.value.consumption.status !== "completed"
);
const changeMenuIcon = computed(() => {
  return isOpenScormMenu.value ? "chevron_left" : "dehaze";
});

// methods
async function setComponents() {
  return await journeyStore.setComponents(journeyUuid.value, sessionUuid.value);
}

async function setCurrentOpenContent() {
  return await journeyStore.setCurrentOpenContent(
    journeyUuid.value,
    sessionUuid.value,
    contentUuid.value
  );
}

function postMessage(payload: IframePostMessages) {
  document.querySelector("iframe")?.contentWindow?.postMessage(payload, "*");
}

async function postMessageMenu() {
  postMessage({ type: "menu" });

  return new Promise<void>((resolve) => {
    setTimeout(async () => {
      await allPagesCompleted();
      resolve();
    }, 4000);
  });
}

async function toPage(menuItem: MenuItem) {
  const { index } = menuItem;
  await postMessageMenu();

  if (index === 1) {
    postMessage({ type: "link", index });
    return;
  }

  const completePreviousPage = scormMenu.value[index - 2].completed;

  if (completePreviousPage) {
    postMessage({ type: "removeUnloadEvent" });
    postMessage({ type: "link", index });
    return;
  }

  toastError(t("classroom.lessons:scorm.next.hint"));
}

// TODO: vai chamar a rota mais de uma vez, o problema é como o scorm está
// "avisando" que foi finalizado, por meio do addEventListener("message").
async function allPagesCompleted() {
  const conditionConsumed =
    lastPageCompleted.value && scormIsNotCompleted.value;

  if (conditionConsumed) {
    await setCurrentOpenContent();
    await setComponents();
  }
}

async function checkCompleted() {
  await setInterval(async () => {
    return await postMessageMenu();
  }, 1000);
}

function loadMenuScorm(env: MessageEvent) {
  if (env.data["menu"]) {
    scormMenu.value = env.data.menu;
  }
}

function openAndCloseScormMenu() {
  isOpenScormMenu.value = !isOpenScormMenu.value;
}

// hooks
onMounted(async () => {
  window.addEventListener("message", loadMenuScorm, false);
  await checkCompleted();
});
</script>
<template>
  <div class="flex grid-nogutter">
    <div :class="['menu width--animate bg-white', { 'menu--witdh': !isOpenScormMenu }]">
      <ul class="scorm-list">
        <li
          v-for="itemMenu in scormMenu"
          :key="itemMenu.index"
          class="flex justify-content-between text-base font-black"
          @click="toPage(itemMenu)"
        >
          <div class="flex-1 mx-2">{{ itemMenu.text }}</div>
          <Icon
            :class="{
              'icon-fill-1 text-green-500': itemMenu.completed,
              'text-black-500': !itemMenu.completed,
            }"
            pack="material"
            name="check_circle"
          />
        </li>
      </ul>
    </div>
    <div class="flex-1 relative">
      <Button
        class="absolute top-0 left-0 m-2 bg-black-100"
        variant="icon"
        :icon="changeMenuIcon"
        @click.stop="openAndCloseScormMenu()"
      />

      <iframe
        :key="scormURL"
        class="iframe-scorm"
        :src="scormURL"
        allowfullscreen
        frameborder="0"
        allow="autoplay"
      />
    </div>
  </div>
</template>
<style lang="scss">
.iframe-scorm {
  width: 100%;
  height: 100vh;
}

.menu {
  width: 200px;
}

.menu--witdh {
  width: 0px;
}

.width--animate {
  transition: width .3s ease-in-out;
}

.scorm-list {
  width: 100%;
}

.scorm-list > li {
  padding: 8px;
  margin: 4px;
  cursor: pointer;
  border-bottom: 1px solid var(--black-400);
}
</style>
