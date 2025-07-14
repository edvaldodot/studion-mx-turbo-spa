<script lang="ts" setup>
import { computed } from "vue";
import Icon from "../Icon/Icon.vue";

interface VerticalTabsItem {
  label?: string;
  icon: string;
}

interface VerticalTabsProps {
  modelValue: number;
  items: Array<VerticalTabsItem>;
}

// emits
const emits = defineEmits(["update:modelValue"]);

// props
const props = defineProps<VerticalTabsProps>();

// computed
const tabItems = computed(() => props.items || []);
const tabIndex = computed(() => props.modelValue || 0);
const isNotFirstTab = computed(() => tabIndex.value !== 0);
const isLastTab = computed(() => tabIndex.value === tabItems.value.length - 1);
const contentTabBorders = computed(() => {
  return {
    "tab--border-radius-fist-child": isNotFirstTab.value,
    "tab--border-radius-last-child": isLastTab.value,
  };
});

// methods
function setTabIndex(index: number) {
  emits("update:modelValue", index);
}
</script>
<template>
  <div class="tab">
    <div class="tab__tabs">
      <ul>
        <li
          v-for="(tabItem, index) in tabItems"
          :key="index"
          :class="{ 'tab--active': tabIndex === index }"
          @click="setTabIndex(index)"
        >
          <slot :name="`tab-${index}`" :tabItem="tabItem">
            <Icon pack="material" class="icon-fill-1 text-black-600" :name="tabItem.icon" />
            <span v-if="tabItem.label">
              {{ tabItem.label }}
            </span>
          </slot>
        </li>
      </ul>
    </div>
    <template v-for="(tabItem, index) in tabItems">
      <div
        v-if="tabIndex === index"
        :class="['tab__content', contentTabBorders]"
      >
        <slot :name="`tab-content-${index}`" :tabContent="tabItem" />
      </div>
    </template>
  </div>
</template>
<style lang="scss">
@use "./VerticalTabs.scss";
</style>
