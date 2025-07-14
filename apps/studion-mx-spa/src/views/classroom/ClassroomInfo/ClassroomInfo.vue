<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { StatusTag, VerticalTabs, Icon } from "@/components/general";
import { useRoute, useRouter } from "vue-router";
import {
  TabInitial,
  TabContent,
  TabNotices,
  TabCalendar,
  TabLibrary,
  TabForum,
  TabPolls,
  TabPresence,
  TabEvaluation,
  TabChat,
  TabLiveClasses,
  TabMessages,
  TabAskQuestions,
} from "./Tabs";
import { Classroom, JourneyWithComponents } from "@/types";

// routing
const router = useRouter();
const route = useRoute();

// props
const props = defineProps<{
  status: string;
  classroomData: Classroom;
  journeyData: JourneyWithComponents;
}>();

// data
const tabIndex = ref(0);
const tabItems = ref([
  { icon: "space_dashboard" },
  { icon: "import_contacts" },
  { icon: "ballot" },
  { icon: "calendar_month" },
  { icon: "library_books" },
  { icon: "post" },
  { icon: "thumbs_up_down" },
  { icon: "assignment" },
  { icon: "task" },
  { icon: "forum" },
  { icon: "videocam" },
  { icon: "mail" },
  { icon: "help" },
]);

// computed
const currentTab = computed(() => {
  const tabsContent = {
    0: TabInitial,
    1: TabContent,
    2: TabNotices,
    3: TabCalendar,
    4: TabLibrary,
    5: TabForum,
    6: TabPolls,
    7: TabPresence,
    8: TabEvaluation,
    9: TabChat,
    10: TabLiveClasses,
    11: TabMessages,
    12: TabAskQuestions,
  } as Record<string, any>;

  return tabsContent[tabIndex.value];
});

const tabIndexByQuery = computed(() => {
  return route.query.tab ? Number(route.query.tab) : 0;
});

// watch
watch(tabIndex, (tabIndex: number) => {
  const noReplaceQueryTabOne = () => tabIndex === 1 ? route.query : {}

  router.replace({
    name: "Classroom",
    query: { tab: tabIndex, ...noReplaceQueryTabOne() },
  });
});

watch(tabIndexByQuery, () => {
  tabIndex.value = tabIndexByQuery.value;
});

// hooks
onMounted(() => {
  tabIndex.value = tabIndexByQuery.value;
});
</script>

<template>
  <div class="p-5">
    <div class="flex align-center">
      <StatusTag :status="props.status" />
      <p
        v-if="props.classroomData?.session.name && props.classroomData.session.name !== ''"
        class="text-base ml-4 classroom-session-name"
      >
        <span>Turma:</span> {{ props.classroomData.session.name }}
      </p>
    </div>
    <div
      v-if="props.journeyData?.journeyName && props.journeyData.journeyName !== ''"
      class="text-4xl pt-3 classroom-journey-name"
    >
      {{ props.journeyData.journeyName }}
    </div>
    <div class="mt-2">
      <Icon pack="material" class="text-primary" name="star_half" />
      <span class="ml-2 text-base">4.8 (12 avaliações)</span>
    </div>
    <div class="grid mt-6">
      <div class="col-12">
        <VerticalTabs v-model="tabIndex" :items="tabItems">
          <template #[`tab-content-${tabIndex}`]>
            <component :is="currentTab" :classroom-data="classroomData" />
          </template>
        </VerticalTabs>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.classroom-session-name {
  color: var(--black-700);

  span {
    color: var(--primary-color);
    font-weight: 700;
  }
}

.classroom-journey-name {
  font-weight: 900;
  color: var(--black-700);
}
</style>
