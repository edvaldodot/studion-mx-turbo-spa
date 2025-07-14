<script setup lang="ts">
import Icon from "@/components/general/Icon";
import ProgressCircle from "@/components/general/ProgressCircle";
import { Component, Children } from "@/types";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

interface ComponentTreeProps {
  components: Array<Component | Children>;
}

// routing
const router = useRouter();

const props = defineProps<ComponentTreeProps>();

const expandedIds = ref<Array<number>>([]);

function getInitialExpandedIds(components: any): Array<number> {
  let ids = [];

  for (const component of components) {
    if (component.type === "block") {
      ids.push(component.id);
      if (component.children && component.children.length > 0) {
        ids = ids.concat(getInitialExpandedIds(component.children));
      }
    }
  }

  return ids;
}

function toggle(id: number) {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter((item) => item !== id);
  } else {
    expandedIds.value.push(id);
  }
}

function isExpanded(id: number) {
  return expandedIds.value.includes(id);
}

// TODO: esse metódo deveria ser chamado no componente ClassroomSideBar
// por algum motivo o componente não está conseguindo subir eventos para o pai
// ficará dessa forma por enquanto
function componentSelected(component: Component | Children) {
  router.replace({
    name: "Classroom",
    query: {
      tab: 1,
      currentContentUuid: component.uuid,
    },
  });
}

onMounted(() => {
  expandedIds.value = getInitialExpandedIds(props.components);
});
</script>
<template>
  <div class="component-tree">
    <ul>
      <li
        v-for="component in props.components"
        :key="component.id"
        class="mb-2"
      >
        <div>
          <div>
            <button
              v-if="component.type === 'block'"
              :class="'component-' + component.type"
              @click="toggle(component.id)"
            >
              <div class="component-name">
                <Icon
                  size="small"
                  pack="material"
                  :name="
                    isExpanded(component.id)
                      ? 'arrow_drop_up'
                      : 'arrow_drop_down'
                  "
                />
                {{ component.name }}
              </div>
              <ProgressCircle :consumption="component.consumption" />
            </button>
            <button
              v-else
              :class="'cursor-pointer component-' + component.type"
              @click="componentSelected(component)"
            >
              <div class="component-name">
                <Icon size="small" :name="`journey-${component.type}`" v-if="component.type !== 'separator'" />
                <span class="break-word">{{ component.name }}</span>
              </div>
              <ProgressCircle :consumption="component.consumption" v-if="component.type !== 'separator'" />
            </button>
          </div>
        </div>

        <ComponentTree
          v-if="component.type === 'block' && isExpanded(component.id)"
          :components="component.children"
        />
      </li>
    </ul>
  </div>
</template>
<style scoped lang="scss">
.component-tree ul ul {
  margin-left: 33px;
}

.component-tree {
  .component-block {
    font-weight: 800;
    font-size: 1.6em;
    color: var(--primary-900);
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 8px;

    .component-name {
      justify-content: center;
      align-items: center;
      display: flex;
    }
  }

  .component-separator {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    
    .component-name {
      justify-content: center;
      align-items: center;
      display: flex;
      font-size: 15px;
      color: var(--black-800);
      gap: 8px;
    }
  }

  .component-scorm,
  .component-pdf,
  .component-video,
  .component-forum,
  .component-chat,
  .component-external_link {
    border: 1px solid var(--black-100);
    border-radius: 8px;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 8px;

    .component-name {
      justify-content: center;
      align-items: center;
      display: flex;
      font-size: 16px;
      color: var(--black-600);
      gap: 8px;
      text-align: start;
    }
  }
}

ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
