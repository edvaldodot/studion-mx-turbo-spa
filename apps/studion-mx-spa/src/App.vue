<script lang="ts">
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "App",

  setup() {
    const THEME_NAME = "default";

    onMounted(() => {

      document.body.setAttribute("data-theme", THEME_NAME);

      let themeLoadPromise = import(`./assets/styles/scss/main.scss`);
      import(`./assets/styles/themes/themes.scss`);

      if (THEME_NAME !== "default") {
        document.body.classList.add(`theme-${THEME_NAME}`);
        themeLoadPromise = import(
          `./assets/styles/themes/${THEME_NAME}/global.scss`
        );
      }

      if (!document.querySelector(".symbol-defs")) {
        fetch("/assets/images/themes/default/svg/symbol-defs.svg")
          .then((response) => response.text())
          .then((svgContent) => {
            const tmp = document.createElement("div");
            tmp.innerHTML = svgContent;
            document.body.appendChild(tmp.childNodes[0]);
          })
          .catch((err) => console.error("Erro ao carregar symbol-defs:", err));
      }
    });
  },
});
</script>

<template>
  <div id="main">
    <router-view />
  </div>
</template>

<style lang="scss">
@use "@/assets/styles/themes/default/global.scss" as *;
</style>
