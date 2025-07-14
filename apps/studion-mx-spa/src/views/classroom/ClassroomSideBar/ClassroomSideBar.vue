<script setup lang="ts">
import ComponentTree from "../ComponentTree";
import ClassroomProgressBar from "../ClassroomProgressBar";
import { Children, Classroom, Component, Journey } from "@/types";

export interface JourneyData extends Journey {
  components: Component[];
}

type ContentComponent = Component & {
  type: "scorm" | "pdf" | "video" | "audio";
  group: "contents";
  children: Children[];
};

type BlockComponent = Component & {
  type: "block";
  group: "organizers";
  children: JourneyComponent[];
};

type JourneyComponent = ContentComponent | BlockComponent;

const props = defineProps<{
  journeyData: JourneyData;
  classroomData: Classroom;
}>();
</script>

<template>
  <aside class="min-h-screen overflow-y-auto classroom-sidebar" data-testid="sidebar">
    <div class="flex flex-column">
      <div class="studion-logo">
        <img
          src="/assets/images/themes/default/svg/studionmx-logo.svg"
          alt=""
        />
      </div>
      <img
        v-if="
          props.classroomData &&
          props.classroomData.journey.image &&
          props.journeyData &&
          props.journeyData.components.length > 0
        "
        :src="props.classroomData.journey.image"
        alt=""
        class="journey-image"
      />
    </div>

    <div
      v-if="props.journeyData && props.journeyData.components.length > 0"
      class="classroom-progress"
    >
      <ClassroomProgressBar :components="props.journeyData.components" />
    </div>

    <div
      v-if="props.journeyData && props.journeyData.components.length > 0"
      class="mt-4 p-2"
    >
      <ComponentTree :components="props.journeyData.components" />
    </div>
  </aside>
</template>

<style scoped lang="scss">
.classroom-sidebar {
  max-width: 336px;
  background-color: var(--surface-0);
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.08);

  .studion-logo {
    width: 336px;
    height: 96px;
    background-color: var(--secondary-900);
    position: relative;
    padding: 35px 54px 33px;
    text-align: center;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: inline-block;
    }
  }

  .journey-image {
    max-width: 336px;
    object-fit: cover;
  }
}
</style>
